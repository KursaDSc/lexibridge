"""
Keyboard-only walkthrough: completes a full search + practice flow using
only the keyboard, then reports the accessibility snapshot.
"""
import sys, time, threading, functools, http.server, socketserver, os, json
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = 8094
OUT = os.path.join(ROOT, "tests", "e2e", "screenshots")
os.makedirs(OUT, exist_ok=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

handler = functools.partial(Q, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(0.5)

GEMINI = {"candidates":[{"content":{"parts":[{"text":"""{
  "input": "ziekenhuis", "sourceLanguage": "nl", "targetLanguage": "tr",
  "cefr": "A1", "partOfSpeech": "noun",
  "pronunciation": { "ipa": "ˈzi.kə(n)ˌɦœy̯s" },
  "translations": [{ "text": "hastane", "context": "saglik", "frequency": "very_common" }],
  "meanings": [{ "meaning": "hastane", "explanation": "Tedavi kurumu", "context": "genel" }],
  "grammar": { "article": "het", "plural": "ziekenhuizen" },
  "etymology": { "summary": "Eski Hollandacadan", "certainty": "high" },
  "examples": [{ "source": "Hij ligt in het ziekenhuis.", "translation": "O hastanede yatıyor." }],
  "relatedWords": [{ "word": "ziekenhuisbed", "relation": "related" }]
}"""}]}}]}

def active(pg):
    return pg.evaluate("() => { const a = document.activeElement; return a ? (a.id || a.tagName + '.' + (a.className || '').toString().split(' ')[0]) : 'none'; }")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=False)
    pg = ctx.new_page()
    pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded")
    pg.wait_for_timeout(700)
    pg.route("**/generativelanguage.googleapis.com/**",
             lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(GEMINI)))
    pg.evaluate("() => localStorage.setItem('gemini_api_key','mock')")

    print("=== KLAVYE-TEK KULLANIMI ===\n")

    # 1. Autocomplete ile arama
    pg.locator("#searchInput").focus()
    print("1. Arama inputu odakta:", active(pg))
    pg.keyboard.type("zieken")
    pg.wait_for_timeout(600)
    print("   Autocomplete acik:", pg.locator("#autocompleteDropdown").is_visible())
    print("   aria-expanded:", pg.locator("#searchInput").get_attribute("aria-expanded"))
    pg.screenshot(path=os.path.join(OUT, "k1-autocomplete.png"))

    # ArrowDown ile secim
    pg.keyboard.press("ArrowDown")
    pg.wait_for_timeout(250)
    print("   ArrowDown -> aria-activedescendant:", pg.locator("#searchInput").get_attribute("aria-activedescendant"))

    # Enter ile aramayi tetikle
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(2500)
    print("2. Enter ile arama sonucu:", "OK" if pg.locator("#resultsContainer").is_visible() else "FAIL")
    print("   Sonuc basligi:", pg.locator("#resultsContainer h2").first.inner_text() if pg.locator("#resultsContainer h2").count() else "N/A")
    print("   article role:", pg.locator("#resultsContainer article").count())
    pg.screenshot(path=os.path.join(OUT, "k2-result.png"))

    # 3. Detaylar toggle
    pg.locator("#toggleDetailsBtn").focus()
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(600)
    print("3. Detaylar acildi:", pg.locator("#detailSections").is_visible())
    print("   aria-expanded:", pg.locator("#toggleDetailsBtn").get_attribute("aria-expanded"))
    pg.screenshot(path=os.path.join(OUT, "k3-details.png"))

    # 4. Bottom nav: arrow navigation
    pg.locator("#navTabDictionary").focus()
    print("\n4. Bottom nav odak:", active(pg))
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(400)
    print("   ArrowRight ->", active(pg), "| view:", pg.locator("#viewPractice").is_visible())
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(400)
    print("   ArrowRight ->", active(pg), "| view:", pg.locator("#viewFavorites").is_visible())
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(400)
    print("   ArrowRight ->", active(pg), "| view:", pg.locator("#viewSettings").is_visible())
    pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(400)
    print("   ArrowLeft  ->", active(pg), "| view:", pg.locator("#viewFavorites").is_visible())
    pg.screenshot(path=os.path.join(OUT, "k4-nav-arrows.png"))

    # 5. Deck chips arrow navigation
    pg.click("#navTabPractice")
    pg.wait_for_timeout(700)
    pg.evaluate("() => document.querySelector('.fc-deck-chip[data-deck=\"auto\"]').focus()")
    pg.wait_for_timeout(250)
    print("\n5. Pratik sekmesi odakta:", active(pg))
    print("   Deck chip odakta:", active(pg))
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(700)
    print("   ArrowRight -> deck:", pg.evaluate("() => document.querySelector('.fc-deck-chip[tabindex=\"0\"]')?.dataset.deck"))
    print("   aria-selected:", pg.evaluate("() => Array.from(document.querySelectorAll('.fc-deck-chip')).map(c => c.dataset.deck + ':' + c.getAttribute('aria-selected')).join(', ')"))
    pg.screenshot(path=os.path.join(OUT, "k5-deck-arrows.png"))

    # 6. Flashcard keyboard
    print("\n6. Flashcard klavye:")
    pg.evaluate("() => document.getElementById('flashcardElement').focus()")
    pg.wait_for_timeout(250)
    print("   odak:", active(pg))
    pg.keyboard.press("Space"); pg.wait_for_timeout(500)
    print("   Space -> flipped:", "flipped" in (pg.locator("#flashcardInner").get_attribute("class") or ""))
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(500)
    print("   ArrowRight -> kart:", pg.locator("#flashcardCounter").inner_text())
    pg.keyboard.press("?"); pg.wait_for_timeout(500)
    print("   '?' -> legend:", pg.locator("#kbdLegend").is_visible())
    pg.screenshot(path=os.path.join(OUT, "k6-flashcard-legend.png"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    print("   Escape -> sözlük:", pg.locator("#viewDictionary").is_visible())

    # 7. Focus trap
    print("\n7. Modal focus trap:")
    pg.evaluate("() => document.getElementById('historyBtn').focus()")
    pg.wait_for_timeout(250)
    pg.keyboard.press("Enter"); pg.wait_for_timeout(600)
    print("   Modal acildi, odak:", active(pg))
    for _ in range(10):
        pg.keyboard.press("Tab")
    print("   10x Tab sonrasi odak modal icinde:", pg.evaluate("() => document.getElementById('historyModal').contains(document.activeElement)"))
    pg.screenshot(path=os.path.join(OUT, "k7-history-trap.png"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    print("   Escape -> modal kapandi:", not pg.locator("#historyModal").is_visible())

    # 8. Accessibility snapshot
    print("\n8. Erişilebilirlik anlık görüntüsü (aria):")
    try:
        for line in pg.locator("body").aria_snapshot().splitlines()[:36]:
            print("   " + line)
    except Exception as e:
        print("   (snapshot alinamadi:", e, ")")

    b.close()
httpd.shutdown()
print("\nDone")
