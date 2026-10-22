import sys, time, threading, functools, http.server, socketserver, os
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = 8098

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

handler = functools.partial(Q, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(0.5)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":390,"height":844})
    errs = []
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}"))
    pg.on("pageerror", lambda e: errs.append(f"PAGEERROR: {e}"))
    pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded")
    pg.wait_for_timeout(800)

    mock = {
        "input":"ziekenhuis","sourceLanguage":"nl","targetLanguage":"tr","cefr":"A1",
        "partOfSpeech":"noun","pronunciation":{"ipa":"x"},
        "translations":[{"text":"hastane","frequency":"very_common"},{"text":"hastahane","frequency":"common"}],
        "meanings":[{"meaning":"hastane","explanation":"x","context":"y"}],
        "grammar":{"article":"het","plural":"ziekenhuizen","fixedPreposition":"in het"},
        "etymology":{"summary":"z","certainty":"high"},
        "examples":[{"source":"Hij ligt in het ziekenhuis.","translation":"O hastanede yatıyor."},
                    {"source":"Het ziekenhuis is groot.","translation":"Hastane buyuk."}],
        "relatedWords":[{"word":"ziekenhuisbed","relation":"related"}],
        "_provider":"Test","_latency":100
    }
    pg.evaluate("""async (m) => {
        if (window.LexiCache) { await window.LexiCache.set('nl','tr','ziekenhuis', m, false); }
    }""", mock)

    pg.fill("#searchInput","ziekenhuis")
    pg.click("#searchBtn")
    pg.wait_for_timeout(2500)

    print("=== resultsContainer visible:", pg.locator("#resultsContainer").is_visible())
    print("=== errorBox visible:", pg.locator("#errorBox").is_visible())
    print("=== inner_text (first 600):")
    print(repr(pg.locator("#resultsContainer").inner_text()[:600]))
    print("=== h2 text:", pg.locator("#resultsContainer h2").first.inner_text() if pg.locator("#resultsContainer h2").count() else "N/A")
    print("=== #detailSections visible:", pg.locator("#detailSections").is_visible() if pg.locator("#detailSections").count() else "N/A")
    print("=== conjugation count:", pg.locator("[data-section='conjugation']").count())
    print("=== examples count:", pg.locator("[data-section='examples']").count())
    print("=== console:")
    for e in errs[:10]: print("   ", e)
    b.close()
httpd.shutdown()
