"""Open an ORBIT title page headless, start the player, and save the first .m3u8 stream link.

Usage: python3.11 explainer-get-m3u8.py <page-url | /movie/<tmdb> | /tv/<tmdb>> <out-file>
With a bare path, the running ORBIT dev server is found by checking local ports for its page title,
because Vite moves to the next free port when the usual one is taken.
The link carries a token that expires after about four hours, so fetch it right before each render.
"""
import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

PORTS = [8080, 8081, 8082, 8083, 8084, 8085, 3000, 3001, 5173]


def find_site():
    for port in PORTS:
        try:
            html = urllib.request.urlopen(f"http://localhost:{port}/", timeout=5).read(20000).decode("utf-8", "ignore")
        except Exception:
            continue
        if "<title>ORBIT" in html:
            return f"http://localhost:{port}"
    sys.exit("ORBIT dev server not found on " + ", ".join(map(str, PORTS)) + "; start it first")


PAGE, OUT = sys.argv[1], sys.argv[2]
if PAGE.startswith("/"):
    PAGE = find_site() + PAGE
found = []


def on_request(req):
    if ".m3u8" in req.url:
        found.append(req.url)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--autoplay-policy=no-user-gesture-required"])
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.on("request", on_request)
    page.goto(PAGE, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_selector("iframe", timeout=30000)
    time.sleep(3)
    deadline = time.time() + 90
    while time.time() < deadline and not found:
        # The stream starts only after a click inside the nested player frames.
        for fr in page.frames:
            if "stellarconductornexus" in fr.url or "vsembed" in fr.url:
                try:
                    fr.evaluate("() => { const b=document.querySelector('button,video,.play,[class*=play],[id*=play]'); if (b) b.click(); }")
                except Exception:
                    pass
        box = page.locator("iframe").first.bounding_box()
        page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        time.sleep(4)
    browser.close()

if not found:
    print("no stream link found", file=sys.stderr)
    sys.exit(1)
open(OUT, "w", encoding="utf-8").write(found[0])
print("saved stream link")
