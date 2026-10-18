"""Open an ORBIT title page headless, start the player, and save the first .m3u8 stream link.

Usage: python3.11 explainer-get-m3u8.py <page-url> <out-file>
The link carries a token that expires after about four hours, so fetch it right before each render.
"""
import sys
import time
from playwright.sync_api import sync_playwright

PAGE, OUT = sys.argv[1], sys.argv[2]
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
