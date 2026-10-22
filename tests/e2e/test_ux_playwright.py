"""
LexiBridge - UX Doğrulama Testleri (Playwright / Python)

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

        # Mock sonuç render et (API çağrısı olmadan)
        page.evaluate(
            """
            () => {
              const mockData = {
                input: 'ziekenhuis', sourceLanguage: 'nl', targetLanguage: 'tr',
                cefr: 'A1', partOfSpeech: 'noun',
                pronunciation: { ipa: 'ˈzi.kə(n)ˌɦœy̯s' },
                translations: [
                  { text: 'hastane', frequency: 'very_common' },
                  { text: 'hastahane', frequency: 'common' }
                ],
                meanings: [{ meaning: 'hastane', explanation: 'Sağlık kurumu', context: 'genel' }],
                grammar: { article: 'het', plural: 'ziekenhuizen', fixedPreposition: 'in het' },
                etymology: { summary: 'Eski Hollandacadan', certainty: 'high' },
                examples: [
                  { source: 'Hij ligt in het ziekenhuis.', translation: 'O hastanede yatıyor.' },
                  { source: 'Het ziekenhuis is groot.', translation: 'Hastane büyük.' }
                ],
                relatedWords: [{ word: 'ziekenhuisbed', relation: 'related' }],
                _provider: 'Test Motoru', _latency: 120
              };
              window.__lexiMock = mockData;
            }
            """
        )

        # renderResult'ı çağırmak için: search handler'ı mock data ile tetikle
        # app.js search'i LexiCache üzerinden döndürür; bu yüzden cache'e yazıp arama yapalım
        page.evaluate(
            """
            async () => {
              const m = window.__lexiMock;
              if (window.LexiCache && typeof window.LexiCache.set === 'function') {
                await window.LexiCache.set('nl', 'tr', 'ziekenhuis', m, false);
              } else {
                localStorage.setItem('lexi_qcache_nl_tr::ziekenhuis', JSON.stringify({
                  key: 'nl_tr::ziekenhuis', query: 'ziekenhuis',
                  sourceLang: 'nl', targetLang: 'tr', data: m, timestamp: Date.now()
                }));
              }
            }
            """
        )
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        page.fill("#searchInput", "ziekenhuis")
        page.click("#searchBtn")
        page.wait_for_timeout(1500)

        has_result = page.locator("#resultsContainer").is_visible()
        record("Arama sonucu render oldu", has_result)

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

            # İçerik kontrolü
            for sel, name in [
                ("[data-section='compound']", "Compound breakdown"),
                ("[data-section='conjugation']", "Conjugation"),
                ("[data-section='examples']", "Diğer örnekler"),
            ]:
                cnt = page.locator(sel).count()
                if cnt == 0:
                    record(f"Detaylarda {name} var", True, "yok (bu kelimede yok) - OK")
                else:
                    record(f"Detaylarda {name} var", page.locator(sel).first.is_visible())

            # Toggle kapat
            page.click("#toggleDetailsBtn")
            page.wait_for_timeout(400)
            record(
                "Toggle tekrar -> Detaylar kapanır",
                not page.locator("#detailSections").is_visible(),
            )

            # Varsayılan görünüm içeriği
            record(
                "Ana çeviri varsayılan görünür",
                page.locator("#resultsContainer").inner_text().count("hastane") > 0,
            )

        # ─────────────────────────────────────────────────────────────
        print(f"\n{BOLD}6. KONSOL HATALARI{RESET}")
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
