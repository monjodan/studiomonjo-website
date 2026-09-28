#!/usr/bin/env python3
"""Draw the 1200 × 630 share cards in media/web/og/: one per page and language.

Requires Playwright with Chrome (pip install playwright) and Pillow. Run after scripts/build-studio.py,
whenever a headline, a page's opening or the design changes; the cards are committed like the fonts.

The walk's card is its real opening, Robey's postcard on the map, captured from each homepage.
The notebooks, the story and company editions are set with the site's own fonts, prints and linen.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
import json
import re
import threading
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'media' / 'web' / 'og'
LOCALES = ('en', 'fr', 'ko')
WORLD = '/media/web/world/'

CARD = '''<!doctype html><html lang="{locale}"><head><meta charset="utf-8">{fonts}
<link rel="stylesheet" href="/css/base.css"><style>
html, body {{ margin: 0; width: 1200px; height: 630px; overflow: hidden; }}
.card {{ position: relative; width: 1200px; height: 630px; overflow: hidden; }}
.card.navy {{ background: var(--navy-tex); color: #fff; }}
.card .brand {{ position: absolute; left: 76px; top: 52px; }}
.card .brand svg {{ width: 150px; height: 29px; fill: currentColor; }}
.copy {{ position: absolute; left: 76px; top: 150px; width: 560px; height: 390px; display: flex; flex-direction: column; justify-content: center; }}
.copy .eyebrow {{ margin: 0 0 26px; font-size: 15px; }}
.navy .copy .eyebrow {{ color: rgba(255,255,255,.66); }}
.copy h1 {{ font: 400 66px/1.14 var(--book); margin: 0; }}
html[lang="ko"] .copy h1 {{ line-height: 1.32; }}
.visual {{ position: absolute; right: 0; top: 0; width: 560px; height: 630px; }}
.nb {{ position: absolute; bottom: 74px; height: 420px; filter: drop-shadow(0 26px 30px rgba(0,0,0,.5)) drop-shadow(0 4px 6px rgba(0,0,0,.3)); }}
.visual .print {{ position: absolute; }}
</style></head><body><div class="card {theme}">{symbols}
<span class="brand"><svg aria-hidden="true"><use href="#wordmark"/></svg></span>
<div class="copy"><p class="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
<div class="visual">{visual}</div></div>
<script>
// Long headlines, in French and Korean, get smaller until they fit their column.
const h = document.querySelector('h1'), box = document.querySelector('.copy');
let size = 66; while ((box.scrollHeight > box.clientHeight || h.scrollWidth > box.clientWidth) && size > 36) {{ size -= 2; h.style.fontSize = size + 'px'; }}
</script></body></html>'''

VISUALS = {
    'notebooks': (f'<img class="nb" src="{WORLD}photo/006-cut.webp" style="left:0;height:380px;transform:rotate(-8deg)" alt="">'
                  f'<img class="nb" src="{WORLD}photo/002-cut.webp" style="left:280px;height:380px;transform:rotate(7deg)" alt="">'
                  f'<img class="nb" src="{WORLD}photo/003-cut.webp" style="left:140px;bottom:92px;height:410px;transform:rotate(-1deg)" alt="">'),
    'about': '<figure class="print" style="left:120px;top:70px;width:360px;--tilt:2deg"><img src="/media/web/studio/jordan-market.webp" alt=""></figure>',
    'company': '<figure class="print" style="left:40px;top:118px;width:480px;--tilt:2deg"><img src="/media/web/studio/company-cover.webp" alt=""></figure>',
}


def plain(text):
    return ' '.join(text.replace(' ', ' ').split())


def serve():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
    server.RequestHandlerClass.log_message = lambda *args: None
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def save(png, dest):
    image = Image.open(BytesIO(png)).convert('RGB').resize((1200, 630), Image.LANCZOS)
    image.save(dest, 'JPEG', quality=86, optimize=True, progressive=True)
    print(f'{dest.relative_to(ROOT)}: {dest.stat().st_size:,} bytes')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    server = serve()
    base = f'http://127.0.0.1:{server.server_address[1]}'
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome')
        page = browser.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=2)
        walk = browser.new_page(viewport={'width': 960, 'height': 504}, device_scale_factor=2.5)
        for locale in LOCALES:
            t = json.loads((ROOT / 'content' / f'{locale}.json').read_text())
            # The walk: its opening view, without the controls a picture cannot use. A narrower window
            # makes the title and Robey's words large enough to read in a small preview.
            walk.goto(f'{base}/{locale}/', wait_until='networkidle')
            walk.add_style_tag(content='.lang, .j-hint, .jump, .skip { display: none !important; } .j-postcard { left: 69% !important; top: 57% !important; width: 520px !important; }')
            walk.wait_for_timeout(5600)
            save(walk.screenshot(), OUT / f'home-{locale}.jpg')
            page.goto(f'{base}/{locale}/notebooks/', wait_until='networkidle')
            # The other pages share one layout: the headline beside a picture from the page.
            html = page.content()
            fonts = re.search(r'<style>@font-face.*?</style>', html, re.S).group(0)
            symbols = re.search(r'<svg width="0" height="0" class="symbols".*?</svg>', html, re.S).group(0)
            cards = {'notebooks': ('navy', t['notebooks']['eyebrow'], plain(t['world']['nb.h2'])),
                     'about': ('', t['about']['eyebrow'], t['about']['heading'].replace('\n', '<br>')),
                     'company': ('', t['company']['eyebrow'], t['company']['heading'].replace('\n', '<br>'))}
            for name, (theme, eyebrow, title) in cards.items():
                page.goto(f'{base}/robots.txt')
                page.set_content(CARD.format(locale=locale, fonts=fonts, symbols=symbols, theme=theme, eyebrow=eyebrow, title=title, visual=VISUALS[name]), wait_until='networkidle')
                page.evaluate('document.fonts.ready')
                page.wait_for_timeout(300)
                save(page.screenshot(), OUT / f'{name}-{locale}.jpg')
        browser.close()
    server.shutdown()


if __name__ == '__main__':
    main()
