import sys, time, threading, functools, http.server, socketserver, os, json
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = 8095
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
  "translations": [
    { "text": "hastane", "context": "sağlık kurumu", "frequency": "very_common" },
    { "text": "hastahane", "context": "alternatif", "frequency": "common" }
  ],
  "meanings": [ { "meaning": "hastane", "explanation": "Hastalıkların tedavi edildiği kurum", "context": "genel" } ],
  "grammar": { "article": "het", "plural": "ziekenhuizen", "diminutive": "ziekenhuisje", "fixedPreposition": "in het", "register": "informal" },
  "etymology": { "summary": "Eski Hollandacadan 'zieken' (hasta) + 'huis' (ev) kelimelerinden türemiştir.", "certainty": "high" },
  "examples": [
    { "source": "Hij ligt in het ziekenhuis.", "translation": "O hastanede yatıyor." },
    { "source": "Het ziekenhuis is groot.", "translation": "Hastane büyük." }
  ],
  "relatedWords": [
    { "word": "ziekenhuisbed", "relation": "related" },
    { "word": "ziekenauto", "relation": "related" }
  ]
}"""}]}}]}

def shot(pg, name):
    pg.screenshot(path=os.path.join(OUT, name))
    print("  saved:", name)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded")
    pg.wait_for_timeout(700)
    pg.route("**/generativelanguage.googleapis.com/**",
             lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(GEMINI)))
    pg.evaluate("() => localStorage.setItem('gemini_api_key','mock')")

    # DARK MODE - tum sayfalar
    pg.evaluate("() => { document.documentElement.classList.add('dark'); localStorage.setItem('lexi_theme','dark'); }")
    pg.wait_for_timeout(400)

    shot(pg, "d1-empty-dark.png")
    pg.fill("#searchInput","ziekenhuis"); pg.click("#searchBtn"); pg.wait_for_timeout(2200)
    shot(pg, "d2-result-dark.png")
    pg.click("#toggleDetailsBtn"); pg.wait_for_timeout(700)
    shot(pg, "d3-details-dark.png")

    pg.click("#navTabSettings"); pg.wait_for_timeout(500)
    shot(pg, "d4-settings-dark.png")
    pg.click("#navTabFavorites"); pg.wait_for_timeout(500)
    shot(pg, "d5-favorites-dark.png")
    pg.click("#navTabPractice"); pg.wait_for_timeout(600)
    shot(pg, "d6-flashcards-dark.png")
    pg.keyboard.press("?"); pg.wait_for_timeout(400)
    shot(pg, "d7-legend-dark.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.click("#historyBtn"); pg.wait_for_timeout(500)
    shot(pg, "d8-history-dark.png")

    # LIGHT MODE - karsilastirma
    pg.evaluate("() => { document.documentElement.classList.remove('dark'); localStorage.setItem('lexi_theme','light'); }")
    pg.wait_for_timeout(400)
    shot(pg, "l1-history-light.png")
    pg.click("#closeHistoryBtn"); pg.wait_for_timeout(300)
    pg.click("#navTabSettings"); pg.wait_for_timeout(500)
    shot(pg, "l2-settings-light.png")
    b.close()
httpd.shutdown()
print("done")
