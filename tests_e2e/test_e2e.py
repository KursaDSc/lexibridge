"""Gerçek tarayıcı (Playwright/Chromium) uçtan uca testleri.

Çalıştırma:  python -m unittest discover tests_e2e
Gereksinim:  pip install playwright && python -m playwright install chromium
Playwright yoksa testler atlanır.
"""
import functools
import http.server
import json
import os
import threading
import unittest

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEWS = ["viewDictionary", "viewPractice", "viewGames", "viewFavorites", "viewSettings"]
TABS = {
    "dictionary": ("navTabDictionary", "viewDictionary"),
    "practice": ("navTabPractice", "viewPractice"),
    "games": ("navTabGames", "viewGames"),
    "favorites": ("navTabFavorites", "viewFavorites"),
    "settings": ("navTabSettings", "viewSettings"),
}
FAVORITES = [
    {"word": w, "article": "de", "cefr": "A1", "translation": t, "source": "nl"}
    for w, t in [("huis", "ev"), ("boek", "kitap"), ("water", "su"), ("brood", "ekmek"), ("stad", "şehir")]
]


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@unittest.skipIf(sync_playwright is None, "playwright kurulu değil")
class E2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(_QuietHandler, directory=ROOT)
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}/index.html"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()

    def new_page(self, storage=None, mobile=False, **ctx_kwargs):
        opts = dict(service_workers="block", **ctx_kwargs)
        if mobile:
            opts.update(viewport={"width": 390, "height": 700}, has_touch=True, is_mobile=True)
        ctx = self.browser.new_context(**opts)
        self.addCleanup(ctx.close)
        s_dict = {"lexi_onboarding_done": "true"}
        if storage:
            s_dict.update(storage)
        ctx.add_init_script(
            "(() => { const s = %s; for (const k in s) localStorage.setItem(k, s[k]); })()"
            % json.dumps(s_dict)
        )
        page = ctx.new_page()
        page.errors = []
        page.on("pageerror", lambda e: page.errors.append(str(e)))
        page.on(
            "console",
            lambda m: m.type == "error"
            and "Failed to load resource" not in m.text
            and page.errors.append(m.text),
        )
        # Dış ağa çıkma: yalnızca yerel sunucu serbest.
        ctx.route(
            "**/*",
            lambda route: route.continue_()
            if route.request.url.startswith("http://127.0.0.1")
            else route.abort(),
        )
        return page

    def open(self, page, suffix=""):
        page.goto(self.base + suffix)
        page.wait_for_selector("#bottomNavBar")

    def visible_views(self, page):
        return [v for v in VIEWS if page.locator(f"#{v}").is_visible()]

    # ── Açılış ────────────────────────────────────────────────────────────
    def test_boot_has_no_js_errors_and_clean_header(self):
        page = self.new_page()
        self.open(page)
        self.assertEqual(page.errors, [])
        header = page.locator("header")
        self.assertIn("LingoMate", header.inner_text())
        self.assertFalse(page.locator("#headerProviderBadge").is_visible())
        self.assertNotIn("Google Gemini", header.inner_text())
        self.assertEqual(self.visible_views(page), ["viewDictionary"])

    def test_dictionary_has_no_redundant_flashcard_banner(self):
        page = self.new_page()
        self.open(page)
        self.assertNotIn("Kelime Kartı Pratiği", page.locator("#viewDictionary").inner_text())

    # ── Sekmeler ──────────────────────────────────────────────────────────
    def test_tab_switching_shows_exactly_one_view_with_aria_current(self):
        page = self.new_page()
        self.open(page)
        for name in ["practice", "games", "favorites", "settings", "dictionary"]:
            nav_id, view_id = TABS[name]
            page.click(f"#{nav_id}")
            self.assertEqual(self.visible_views(page), [view_id], name)
            for other, (other_nav, _) in TABS.items():
                attr = page.get_attribute(f"#{other_nav}", "aria-selected")
                self.assertEqual(attr, "true" if other == name else "false", f"{name}/{other}")
        self.assertEqual(page.errors, [])

    def test_escape_returns_to_dictionary_from_tab_pages(self):
        page = self.new_page()
        self.open(page)
        page.click("#navTabSettings")
        page.keyboard.press("Escape")
        self.assertEqual(self.visible_views(page), ["viewDictionary"])

    # ── Kaydırma ──────────────────────────────────────────────────────────
    def test_page_scrolls_and_html_body_do_not_trap_touch_scroll(self):
        page = self.new_page(mobile=True)
        self.open(page)
        page.click("#navTabSettings")
        overflow = page.evaluate(
            "[getComputedStyle(document.documentElement).overflowX,"
            " getComputedStyle(document.body).overflowX]"
        )
        self.assertNotIn("hidden", overflow, "overflow-x:hidden dokunmatik kaydırmayı kilitleyebilir")
        self.assertGreater(
            page.evaluate("document.documentElement.scrollHeight"),
            page.evaluate("window.innerHeight"),
            "Ayarlar sayfası ekrandan uzun olmalı",
        )
        # Gerçek dokunmatik olaylarla parmak yukarı sürüklenir. (overflow-x:hidden html+body
        # ile bu hareket sayfayı kaydırmaz; synthesizeScrollGesture bunu yakalamadığı için kullanılmaz.)
        cdp = page.context.new_cdp_session(page)
        x, y0, y1, steps = 195, 550, 200, 12
        cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": x, "y": y0}]})
        for i in range(1, steps + 1):
            y = y0 + (y1 - y0) * i / steps
            cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": x, "y": y}]})
            page.wait_for_timeout(16)
        cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
        page.wait_for_function("window.scrollY > 0", timeout=5000)
        self.assertLessEqual(
            page.evaluate("document.documentElement.scrollWidth"),
            page.evaluate("window.innerWidth"),
            "Yatay taşma olmamalı",
        )

    # ── Pratik ────────────────────────────────────────────────────────────
    def test_flashcards_flip_keyboard_and_deck_chip_state(self):
        page = self.new_page(storage={"lexi_favorites": json.dumps(FAVORITES)})
        self.open(page)
        page.click("#navTabPractice")
        self.assertEqual(page.get_attribute('.fc-deck-chip[data-deck="auto"]', "aria-selected"), "true")

        page.click("#flashcardElement")
        self.assertTrue(page.evaluate("document.getElementById('flashcardInner').classList.contains('flipped')"))
        page.click("#flashcardElement")
        self.assertFalse(page.evaluate("document.getElementById('flashcardInner').classList.contains('flipped')"))

        first = page.inner_text("#flashcardCounter")
        page.keyboard.press("ArrowRight")
        self.assertNotEqual(page.inner_text("#flashcardCounter"), first)

        page.click('.fc-deck-chip[data-deck="favorites"]')
        self.assertEqual(page.get_attribute('.fc-deck-chip[data-deck="favorites"]', "aria-selected"), "true")
        self.assertEqual(page.get_attribute('.fc-deck-chip[data-deck="auto"]', "aria-selected"), "false")
        self.assertIn("/ 5", page.inner_text("#flashcardCounter"))
        self.assertEqual(page.errors, [])

    def test_open_favorites_deck_from_favorites_page_inits_once(self):
        page = self.new_page(storage={"lexi_favorites": json.dumps(FAVORITES)})
        self.open(page)
        page.evaluate(
            "window.__initCalls = 0; const o = window.initFlashcards;"
            "window.initFlashcards = (...a) => { window.__initCalls++; return o(...a); }; undefined;"
        )
        page.click("#navTabFavorites")
        page.click("#quizFavoritesBtn")
        self.assertEqual(self.visible_views(page), ["viewPractice"])
        self.assertEqual(page.evaluate("window.__initCalls"), 1)
        self.assertIn("/ 5", page.inner_text("#flashcardCounter"))

    # ── Favoriler ─────────────────────────────────────────────────────────
    def test_favorites_page_lists_saved_words_and_search_returns_to_dictionary(self):
        page = self.new_page(storage={"lexi_favorites": json.dumps(FAVORITES)})
        self.open(page)
        page.click("#navTabFavorites")
        self.assertEqual(page.locator("#favoritesList .fav-item").count(), 5)
        page.locator("#favoritesList .fav-search-trigger").first.click()
        self.assertEqual(self.visible_views(page), ["viewDictionary"])
        self.assertNotEqual(page.input_value("#searchInput"), "")

    # ── Ayarlar ve güvenlik ───────────────────────────────────────────────
    def test_settings_save_persists_key_and_returns_to_dictionary(self):
        page = self.new_page()
        self.open(page)
        page.click("#navTabSettings")
        page.fill("#googleKeyInput", "TEST-KEY-123")
        page.click("#saveSettingsBtn")
        page.wait_for_selector("#viewDictionary", state="visible")
        self.assertEqual(page.evaluate("localStorage.getItem('gemini_api_key')"), "TEST-KEY-123")

    def test_gemini_key_is_sent_in_header_not_in_url(self):
        storage = {
            "gemini_api_key": "SECRET-KEY-XYZ",
            "lexi_provider": "google",
            "lexi_provider_user_chosen": "true",
            "lexi_default_provider_v2": "true",
        }
        page = self.new_page(storage=storage)
        page.context.route(
            "https://generativelanguage.googleapis.com/**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"candidates": [{"content": {"parts": [{"text": "{}"}]}}]}),
            ),
        )
        self.open(page)
        with page.expect_request(lambda r: "generativelanguage.googleapis.com" in r.url, timeout=15000) as info:
            page.fill("#searchInput", "zorgeloosheidje")
            page.click("#searchBtn")
        req = info.value
        self.assertNotIn("SECRET-KEY-XYZ", req.url)
        self.assertNotIn("key=", req.url)
        self.assertEqual(req.headers.get("x-goog-api-key"), "SECRET-KEY-XYZ")

    def test_api_key_import_only_from_url_hash_not_query(self):
        page = self.new_page()
        self.open(page, "?key=QUERY-KEY")
        self.assertIsNone(page.evaluate("localStorage.getItem('gemini_api_key')"))
        page2 = self.new_page()
        self.open(page2, "#key=HASH-KEY")
        self.assertEqual(page2.evaluate("localStorage.getItem('gemini_api_key')"), "HASH-KEY")
        self.assertNotIn("HASH-KEY", page2.url)

    # ── Çevrimdışı ve tema ────────────────────────────────────────────────
    def test_offline_banner_toggles_with_connection(self):
        page = self.new_page()
        self.open(page)
        self.assertFalse(page.locator("#offlineBanner").is_visible())
        page.context.set_offline(True)
        page.wait_for_selector("#offlineBanner", state="visible")
        page.context.set_offline(False)
        page.wait_for_selector("#offlineBanner", state="hidden")

    def test_theme_toggle_persists(self):
        page = self.new_page()
        self.open(page)
        before = page.evaluate("document.documentElement.classList.contains('dark')")
        page.click("#themeToggleBtn")
        self.assertNotEqual(before, page.evaluate("document.documentElement.classList.contains('dark')"))
        self.assertEqual(
            page.evaluate("localStorage.getItem('lexi_theme')"), "light" if before else "dark"
        )

    # ── Müşteri Deneyimi & SRS Leitner ────────────────────────────────────
    def test_favorites_live_filter_narrows_list_and_resets(self):
        page = self.new_page(storage={"lexi_favorites": json.dumps(FAVORITES)})
        self.open(page)
        page.click("#navTabFavorites")
        self.assertEqual(page.locator("#favoritesList .fav-item").count(), 5)

        # "brood" için filtrele -> sadece 1 kart kalmalı
        page.fill("#favSearchFilterInput", "brood")
        self.assertEqual(page.locator("#favoritesList .fav-item").count(), 1)
        self.assertIn("brood", page.locator("#favoritesList").inner_text())

        # Temizle butonuna tıkla -> tekrar 5 karta dönmeli
        page.click("#clearFavFilterBtn")
        self.assertEqual(page.locator("#favoritesList .fav-item").count(), 5)
        self.assertEqual(page.errors, [])

    def test_srs_due_deck_selection_and_card_rating_updates_streak(self):
        page = self.new_page()
        self.open(page)
        page.click("#navTabPractice")

        # Tekrar Zamanı ("due") çipine tıkla
        page.click('.fc-deck-chip[data-deck="due"]')
        self.assertEqual(page.get_attribute('.fc-deck-chip[data-deck="due"]', "aria-selected"), "true")
        self.assertTrue(page.locator("#fcBoxBadge").is_visible())

        # Kartı "Biliyorum" olarak puanla -> seri (streak) tetiklenmeli
        page.click("#fcMasteredBtn")
        self.assertTrue(page.locator("#fcStreakBadge").is_visible())
        self.assertIn("1 Gün", page.locator("#fcStreakText").inner_text())
        self.assertEqual(page.errors, [])


if __name__ == "__main__":
    unittest.main()
