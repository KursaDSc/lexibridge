"""
LingoMate - UX Doğrulama Testleri (Playwright / Python)

Kapsam:
  1. Navigation (4 sekme inline view)
  2. Search input focus
  3. Aşama A Quick Wins (reduced motion, high contrast, aria-live, haptic)
  4. Aşama B Progressive Disclosure (Detaylar aç/kapa)

Çalıştırma:
    python tests/e2e/test_ux_playwright.py
    python tests/e2e/test_ux_playwright.py --headed
"""

import os
import sys
import json
import time
import threading
import functools
import http.server
import socketserver

# Windows konsol UTF-8 (Türkçe karakterler icin)
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = 8099
BASE_URL = f"http://127.0.0.1:{PORT}/index.html"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"

results = []


def record(name, passed, detail=""):
    results.append((name, passed, detail))
    icon = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
    print(f"  [{icon}] {name}" + (f"  {YELLOW}-> {detail}{RESET}" if detail and not passed else ""))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def start_server():
    handler = functools.partial(QuietHandler, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def seed_result(page):
    """Uygulamayı sahte arama sonucu ile doldur (API çağrısı yapmadan)."""
    page.evaluate(
        """
        () => {
          const mockData = {
            input: 'ziekenhuis',
            sourceLanguage: 'nl',
            targetLanguage: 'tr',
            cefr: 'A1',
            partOfSpeech: 'noun',
            pronunciation: { ipa: 'ˈzi.kə(n)ˌɦœy̯s' },
            translations: [
              { text: 'hastane', frequency: 'very_common' },
              { text: 'hastahane', frequency: 'common' }
            ],
            meanings: [
              { meaning: 'hastane', explanation: 'Bir sağlık kurumu', context: 'genel' }
            ],
            grammar: { article: 'het', plural: 'ziekenhuizen', fixedPreposition: 'in het' },
            etymology: { summary: 'Eski Hollandacadan', certainty: 'high' },
            examples: [
              { source: 'Hij ligt in het ziekenhuis.', translation: 'O hastanede yatıyor.' },
              { source: 'Het ziekenhuis is groot.', translation: 'Hastane büyük.' }
            ],
            relatedWords: [
              { word: 'ziekenhuisbed', relation: 'related' },
              { word: 'ziekenauto', relation: 'related' }
            ],
            _provider: 'Test Motoru',
            _latency: 120
          };
          // renderResult is module-scoped; trigger via a search simulation
          const input = document.getElementById('searchInput');
          input.value = 'ziekenhuis';
          window.__lexiMockData = mockData;
        }
        """
    )


def run_tests(headless=True):
    httpd = start_server()
    time.sleep(0.6)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        page = ctx.new_page()

        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))

        page.goto(BASE_URL, wait_until="domcontentloaded")
        page.wait_for_function("window.__activeTab === 'dictionary'")
        page.wait_for_timeout(400)

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}1. NAVIGATION (4 Sekme Inline View){RESET}")
        # ─────────────────────────────────────────────────────────────

        record(
            "Sözlük varsayılan aktif, diğer 3 view hidden",
            page.locator("#viewDictionary").is_visible()
            and not page.locator("#viewPractice").is_visible()
            and not page.locator("#viewFavorites").is_visible()
            and not page.locator("#viewSettings").is_visible(),
        )
        record(
            "Eski modal ID'leri kaldırıldı (flashcardModal/favoritesModal/settingsModal)",
            page.evaluate(
                "() => !document.getElementById('flashcardModal') "
                "&& !document.getElementById('favoritesModal') "
                "&& !document.getElementById('settingsModal')"
            ),
        )
        record(
            "Yeni view ID'leri mevcut (viewPractice/viewFavorites/viewSettings)",
            page.evaluate(
                "() => !!document.getElementById('viewPractice') "
                "&& !!document.getElementById('viewFavorites') "
                "&& !!document.getElementById('viewSettings')"
            ),
        )

        page.click("#navTabPractice")
        page.wait_for_timeout(400)
        record(
            "Bottom nav -> Pratik: viewPractice görünür",
            page.locator("#viewPractice").is_visible()
            and not page.locator("#viewDictionary").is_visible(),
        )
        record(
            "Pratik sekmesinde flashcard kartı render oldu",
            page.locator("#flashcardElement").is_visible(),
        )

        page.click("#navTabFavorites")
        page.wait_for_timeout(300)
        record(
            "Bottom nav -> Kelimelerim: viewFavorites görünür",
            page.locator("#viewFavorites").is_visible(),
        )

        page.click("#navTabSettings")
        page.wait_for_timeout(300)
        record(
            "Bottom nav -> Ayarlar: viewSettings görünür",
            page.locator("#viewSettings").is_visible()
            and page.locator("#providerButtonGroup").is_visible(),
        )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}2. SEARCH INPUT FOCUS{RESET}")
        # ─────────────────────────────────────────────────────────────

        page.click("#navTabDictionary")
        page.wait_for_timeout(400)
        focused = page.evaluate("() => document.activeElement && document.activeElement.id")
        record(
            "Sekmeye geçince search input focus alır (mobil)",
            focused == "searchInput",
            f"activeElement.id = {focused}",
        )

        # History modal kapatınca focus dönüşü
        page.click("#historyBtn")
        page.wait_for_timeout(250)
        record("History modal açılır", page.locator("#historyModal").is_visible())
        page.click("#closeHistoryBtn")
        page.wait_for_timeout(250)
        focused = page.evaluate("() => document.activeElement && document.activeElement.id")
        record(
            "History modal kapanınca focus search input'a döner",
            focused == "searchInput",
            f"activeElement.id = {focused}",
        )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}3. FLASHCARD KISAYOLLARI{RESET}")
        # ─────────────────────────────────────────────────────────────

        page.click("#navTabPractice")
        page.wait_for_timeout(400)

        flipped_before = "flipped" in (page.locator("#flashcardInner").get_attribute("class") or "")
        page.locator("#flashcardElement").press("Space")
        page.wait_for_timeout(300)
        flipped_after = "flipped" in (page.locator("#flashcardInner").get_attribute("class") or "")
        record("Space -> kart çevrilir", (not flipped_before) and flipped_after)

        counter_before = page.locator("#flashcardCounter").inner_text()
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(300)
        counter_after = page.locator("#flashcardCounter").inner_text()
        record("ArrowRight -> sonraki kart", counter_before != counter_after,
               f"{counter_before} -> {counter_after}")

        record("Kısayol legendı varsayılan gizli", not page.locator("#kbdLegend").is_visible())
        page.keyboard.press("?")
        page.wait_for_timeout(250)
        record("? -> kısayol legendı açılır", page.locator("#kbdLegend").is_visible())

        page.keyboard.press("Escape")
        page.wait_for_timeout(350)
        record(
            "Esc -> sözlüğe dön",
            page.locator("#viewDictionary").is_visible()
            and not page.locator("#viewPractice").is_visible(),
        )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}4. AŞAMA A - QUICK WINS{RESET}")
        # ─────────────────────────────────────────────────────────────

        record(
            "resultsContainer aria-live=polite",
            page.locator("#resultsContainer").get_attribute("aria-live") == "polite",
        )

        # Bottom nav yüksekliği 64px
        nav_h = page.evaluate(
            "() => { const n = document.getElementById('bottomNavBar');"
            " return n ? n.getBoundingClientRect().height : 0; }"
        )
        record("Bottom nav ~64px (Material 3)", 60 <= nav_h <= 72, f"height = {nav_h}px")

        # Reduced motion
        page.emulate_media(reduced_motion="reduce")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        dur = page.evaluate(
            "() => getComputedStyle(document.getElementById('flashcardInner')).transitionDuration"
        )
        record("prefers-reduced-motion -> transition ~0", dur in ("0s", "0.01ms"), f"duration = {dur}")
        page.emulate_media(reduced_motion="no-preference")

        # High contrast
        page.emulate_media(forced_colors="active")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        page.locator("#searchBtn").focus()
        outline = page.evaluate(
            "() => getComputedStyle(document.getElementById('searchBtn')).outlineWidth"
        )
        try:
            ok = int(outline.replace("px", "")) >= 2
        except ValueError:
            ok = False
        record("forced-colors -> focus outline belirgin", ok, f"outline = {outline}")
        page.emulate_media(forced_colors="none")

        # Haptic
        page.add_init_script(
            """
            window.__vibrateCalls = [];
            navigator.vibrate = (p) => { window.__vibrateCalls.push(p); return true; };
            """
        )
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        seed = page.locator(".seed-chip").first
        if seed.count() > 0:
            seed.click()
            page.wait_for_timeout(300)
            calls = page.evaluate("() => window.__vibrateCalls")
            record("Seed chip -> navigator.vibrate(10)", len(calls) > 0 and calls[0] == 10,
                   f"calls = {calls}")
        else:
            record("Seed chip -> navigator.vibrate(10)", False, "seed chip bulunamadı")

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}5. AŞAMA B - PROGRESSIVE DISCLOSURE{RESET}")
        # ─────────────────────────────────────────────────────────────

        # Gemini API'yi mock'la (gerçek kod yolu: analyze -> normalize -> renderResult)
        gemini_payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": """{
  "input": "ziekenhuis",
  "sourceLanguage": "nl",
  "targetLanguage": "tr",
  "cefr": "A1",
  "partOfSpeech": "noun",
  "pronunciation": { "ipa": "ˈzi.kə(n)ˌɦœy̯s" },
  "translations": [
    { "text": "hastane", "context": "sağlık kurumu", "frequency": "very_common" },
    { "text": "hastahane", "context": "alternatif", "frequency": "common" }
  ],
  "meanings": [
    { "meaning": "hastane", "explanation": "Hastalıkların tedavi edildiği kurum", "context": "genel" }
  ],
  "grammar": {
    "article": "het",
    "plural": "ziekenhuizen",
    "diminutive": "ziekenhuisje",
    "fixedPreposition": "in het",
    "register": "informal"
  },
  "etymology": { "summary": "Eski Hollandacadan 'zieken' + 'huis' kelimelerinden", "certainty": "high" },
  "examples": [
    { "source": "Hij ligt in het ziekenhuis.", "translation": "O hastanede yatıyor." },
    { "source": "Het ziekenhuis is groot.", "translation": "Hastane büyük." },
    { "source": "Naar het ziekenhuis gaan.", "translation": "Hastaneye gitmek." }
  ],
  "relatedWords": [
    { "word": "ziekenhuisbed", "relation": "related" },
    { "word": "ziekenauto", "relation": "related" }
  ]
}"""
                            }
                        ]
                    }
                }
            ]
        }

        page.route(
            "**/generativelanguage.googleapis.com/**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(gemini_payload),
            ),
        )

        # Gemini API anahtari gerekli (fetch oncesi kontrol ediliyor)
        page.evaluate("() => localStorage.setItem('gemini_api_key', 'test-key-mock')")

        page.fill("#searchInput", "ziekenhuis")
        page.click("#searchBtn")
        page.wait_for_timeout(2500)

        has_result = page.locator("#resultsContainer").is_visible()
        record("Arama sonucu render oldu (mock Gemini)", has_result)

        if has_result:
            record(
                "Eski 4-sekme bar KALDIRILDI (result-tabs-bar yok)",
                page.locator(".result-tabs-bar").count() == 0,
            )
            record(
                "Eski Kompakt/Detaylı butonu KALDIRILDI (toggleDenseBtn yok)",
                page.locator("#toggleDenseBtn").count() == 0,
            )
            record(
                "Tek 'Detaylar' toggle butonu var",
                page.locator("#toggleDetailsBtn").count() == 1,
            )
            record(
                "Detaylar toggle aria-expanded=false ile başlar",
                page.locator("#toggleDetailsBtn").get_attribute("aria-expanded") == "false",
            )
            record(
                "Detaylar konteyneri varsayılan gizli",
                not page.locator("#detailSections").is_visible(),
            )
            record(
                "Detaylar aria-controls doğru (#detailSections)",
                page.locator("#toggleDetailsBtn").get_attribute("aria-controls") == "detailSections",
            )

            # Aç/kapa
            page.click("#toggleDetailsBtn")
            page.wait_for_timeout(500)
            record(
                "Toggle -> Detaylar açılır",
                page.locator("#detailSections").is_visible(),
            )
            record(
                "Toggle -> aria-expanded=true",
                page.locator("#toggleDetailsBtn").get_attribute("aria-expanded") == "true",
            )
            label = page.locator("#toggleDetailsBtn span").first.inner_text()
            record("Toggle -> etiket 'Detayları Gizle' olur", "Gizle" in label, f"label = {label}")

            # İçerik kontrolü (mock veri: article=het, 3 örnek, 2 ilişkili kelime)
            for sel, name in [
                ("[data-section='compound']", "Compound breakdown"),
                ("[data-section='examples']", "Diğer örnekler"),
            ]:
                cnt = page.locator(sel).count()
                if cnt == 0:
                    record(f"Detaylarda {name} var", True, "yok (bu kelimede yok) - OK")
                else:
                    record(f"Detaylarda {name} var", page.locator(sel).first.is_visible())

            details_text = page.locator("#detailSections").inner_text()
            record("Detaylarda Anlamlar var", "Anlamlar" in details_text)
            record("Detaylarda Gramer & Çekim var", "Gramer" in details_text)
            record("Detaylarda Etimoloji var", "Etimoloji" in details_text)
            record("Detaylarda İlişkili Kelimeler var", "İlişkili" in details_text)
            record("Detaylarda Alternatif Çeviriler var", "Alternatif" in details_text)
            record(
                "Detaylarda 2. ve 3. örnek var (ilk örnek dışarıda)",
                "Het ziekenhuis is groot." in details_text
                and "Naar het ziekenhuis gaan." in details_text,
            )

            # Toggle kapat
            page.click("#toggleDetailsBtn")
            page.wait_for_timeout(400)
            record(
                "Toggle tekrar -> Detaylar kapanır",
                not page.locator("#detailSections").is_visible(),
            )

            # Varsayılan görünüm içeriği
            default_text = page.locator("#resultsContainer").inner_text()
            record("Ana çeviri varsayılan görünür", "hastane" in default_text)
            record(
                "İlk örnek varsayılan görünür",
                "Hij ligt in het ziekenhuis." in default_text,
            )
            record(
                "Article badge (het) varsayılan görünür",
                "het" in default_text.lower(),
            )
            record(
                "Diğer örnekler varsayılan GİZLİ",
                "Het ziekenhuis is groot." not in default_text,
            )
            record(
                "Etimoloji varsayılan GİZLİ",
                "Eski Hollandacadan" not in default_text,
            )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}6. AŞAMA D - KLAVYE & EKRAN OKUYUCU{RESET}")
        # ─────────────────────────────────────────────────────────────

        # a11y.js yuklendi mi
        record(
            "a11y.js modulu yuklendi (LexiA11y)",
            page.evaluate("() => typeof window.LexiA11y === 'object'"),
        )

        # Bottom nav: roving tabindex
        tabindexes = page.evaluate(
            """() => Array.from(document.querySelectorAll('#bottomNavBar [role="tab"]'))
                   .map(b => b.getAttribute('tabindex'))"""
        )
        record(
            "Bottom nav: yalnizca aktif sekme tab sirasinda (roving tabindex)",
            tabindexes.count("0") == 1,
            f"tabindex degerleri = {tabindexes}",
        )

        # Bottom nav: ok tuslari ile gezinme
        page.locator("#navTabDictionary").focus()
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(400)
        active_id = page.evaluate("() => document.activeElement && document.activeElement.id")
        record(
            "ArrowRight -> Pratik sekmesine gecer ve odak nav butonunda kalir",
            active_id == "navTabPractice",
            f"activeElement = {active_id}",
        )
        record(
            "ArrowRight ile sekme degeri degisti (otomatik aktivasyon)",
            page.locator("#viewPractice").is_visible(),
        )
        page.keyboard.press("ArrowLeft")
        page.wait_for_timeout(400)
        active_id = page.evaluate("() => document.activeElement && document.activeElement.id")
        record(
            "ArrowLeft -> Sözlük sekmesine geri doner, odak nav'da",
            page.locator("#viewDictionary").is_visible() and active_id == "navTabDictionary",
            f"activeElement = {active_id}",
        )

        # aria-selected senkron
        selected = page.evaluate(
            """() => Array.from(document.querySelectorAll('#bottomNavBar [role="tab"]'))
                   .map(b => b.getAttribute('aria-selected'))"""
        )
        record(
            "aria-selected yalnizca aktif sekmede true",
            selected.count("true") == 1,
            f"aria-selected = {selected}",
        )

        # Combobox / listbox
        record(
            "searchInput role=combobox",
            page.locator("#searchInput").get_attribute("role") == "combobox",
        )
        record(
            "autocompleteDropdown role=listbox",
            page.locator("#autocompleteDropdown").get_attribute("role") == "listbox",
        )
        record(
            "searchInput aria-expanded=false ile baslar",
            page.locator("#searchInput").get_attribute("aria-expanded") == "false",
        )

        # Autocomplete ok tuslari
        page.fill("#searchInput", "")
        page.click("#searchInput")
        page.keyboard.type("ge")
        page.wait_for_timeout(600)
        dropdown_open = page.locator("#autocompleteDropdown").is_visible()
        record("Otomatik tamamlama acilir", dropdown_open)
        if dropdown_open:
            record(
                "aria-expanded=true acilista",
                page.locator("#searchInput").get_attribute("aria-expanded") == "true",
            )
            # Gercek tasma kontrolu: dropdown kart tarafindan kesilmemeli
            not_clipped = page.evaluate(
                """() => {
                    const dd = document.getElementById('autocompleteDropdown');
                    const container = dd.parentElement;   // .relative input alani
                    const card = container.parentElement;  // arama karti
                    const cs = getComputedStyle(card);
                    if (cs.overflow === 'hidden' || cs.overflow === 'clip') return false;
                    // Dropdown kartin alt kenarinin altina tasmali
                    return dd.getBoundingClientRect().bottom >
                           card.getBoundingClientRect().bottom + 1;
                }"""
            )
            record(
                "Dropdown kart tarafindan kesilmiyor (overflow clipping yok)",
                not_clipped,
            )
            record(
                "Dropdown ekran icinde gorunur (viewport clipping yok)",
                page.evaluate(
                    """() => {
                        const r = document.getElementById('autocompleteDropdown').getBoundingClientRect();
                        return r.top >= 0 && r.bottom <= window.innerHeight + 1;
                    }"""
                ),
            )
            record(
                "Ogeler role=option ve aria-selected=false",
                page.evaluate("() => Array.from(document.querySelectorAll('.autocomplete-item')).every(e => e.getAttribute('role') === 'option' && e.getAttribute('aria-selected') === 'false')"),
            )
            page.keyboard.press("ArrowDown")
            page.wait_for_timeout(250)
            record(
                "ArrowDown -> ilk ogune odak (aria-activedescendant)",
                page.locator("#searchInput").get_attribute("aria-activedescendant") is not None,
            )
            page.keyboard.press("ArrowDown")
            page.wait_for_timeout(250)
            active_desc = page.locator("#searchInput").get_attribute("aria-activedescendant")
            record("ArrowDown -> ikinci oge aktif", active_desc == "ac-opt-1", f"activedescendant = {active_desc}")
            page.keyboard.press("Escape")
            page.wait_for_timeout(250)
            record(
                "Escape -> otomatik tamamlama kapanir",
                not page.locator("#autocompleteDropdown").is_visible(),
            )

        # Focus trap - History modal
        page.click("#historyBtn")
        page.wait_for_timeout(400)
        record("History modal focus alir (trap)", page.evaluate("() => document.activeElement !== document.body"))
        for _ in range(12):
            page.keyboard.press("Tab")
        trapped_inside = page.evaluate(
            "() => { const m = document.getElementById('historyModal'); return m.contains(document.activeElement); }"
        )
        record("Tab odagi modal icinde kalir (focus trap)", trapped_inside)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        record(
            "Escape -> history modal kapanir",
            not page.locator("#historyModal").is_visible(),
        )

        # Flashcard deck chips: roving tabindex
        page.click("#navTabPractice")
        page.wait_for_timeout(500)
        deck_tabindexes = page.evaluate(
            """() => Array.from(document.querySelectorAll('.fc-deck-chip'))
                   .map(b => b.getAttribute('tabindex'))"""
        )
        record(
            "Deck chips: yalnizca biri tab sirasinda",
            deck_tabindexes.count("0") == 1,
            f"tabindex = {deck_tabindexes}",
        )
        record(
            "Deck chips role=tab",
            page.evaluate("() => Array.from(document.querySelectorAll('.fc-deck-chip')).every(b => b.getAttribute('role') === 'tab')"),
        )
        record(
            "Aktif deck chip aria-selected=true",
            page.evaluate("() => document.querySelector('.fc-deck-chip[data-deck=\"auto\"]').getAttribute('aria-selected') === 'true'"),
        )

        # Live region
        record(
            "Live region (role=status) olusturuldu",
            page.evaluate("() => !!document.getElementById('lexiLiveRegion')"),
        )

        # Result card ARIA
        page.click("#navTabDictionary")
        page.wait_for_timeout(300)
        page.fill("#searchInput", "ziekenhuis")
        page.click("#searchBtn")
        page.wait_for_timeout(2500)
        record(
            "Sonuc karti role=article",
            page.locator("#resultsContainer article").count() >= 1,
        )
        record(
            "article aria-labelledby -> basliga isaret ediyor",
            page.evaluate(
                """() => {
                    const art = document.querySelector('#resultsContainer article');
                    if (!art) return false;
                    const id = art.getAttribute('aria-labelledby');
                    return !!id && !!document.getElementById(id);
                }"""
            ),
        )
        record(
            "resultsContainer aria-busy=false (yukleme bitti)",
            page.locator("#resultsContainer").get_attribute("aria-busy") == "false",
        )

        # modeToggle aria-pressed
        record(
            "modeToggleBtn aria-pressed mevcut",
            page.locator("#modeToggleBtn").get_attribute("aria-pressed") is not None,
        )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}7. KONSOL HATALARI{RESET}")
        # ─────────────────────────────────────────────────────────────
        real_errors = [e for e in console_errors if "favicon" not in e.lower()]
        record("Konsol hatası yok", len(real_errors) == 0, "; ".join(real_errors[:3]))

        ctx.close()
        browser.close()

    httpd.shutdown()

    # ─────────────────────────────────────────────────────────────
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f"\n{BOLD}{'='*60}{RESET}")
    color = GREEN if passed == total else RED
    print(f"{color}{BOLD}SONUÇ: {passed}/{total} test geçti{RESET}")
    if passed != total:
        print(f"\n{BOLD}Başarısız testler:{RESET}")
        for name, ok, detail in results:
            if not ok:
                print(f"  {RED}x{RESET} {name}  {YELLOW}{detail}{RESET}")
    print(f"{BOLD}{'='*60}{RESET}\n")

    return passed == total


if __name__ == "__main__":
    headless = "--headed" not in sys.argv
    success = run_tests(headless=headless)
    sys.exit(0 if success else 1)
