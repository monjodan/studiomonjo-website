#!/usr/bin/env python3
"""Rebuild the static pages from reviewed locale copy. No server dependencies.

Each language gets the walk with Robey (its homepage), the notebooks, the studio's
story and company editions. The walk's words live under "world" in content/{locale}.json;
Robey's questions for the page you write are shared in content/prompts.json.
"""
from pathlib import Path
from html import escape
import json
import re
from seo import metadata, structured_data, write_discovery, image_size

ROOT = Path(__file__).resolve().parents[1]
MEDIA = '/media/web/studio/'
WORLD = '/media/web/world/'
LOCALES = {'en': 'English', 'fr': 'Français', 'ko': '한국어'}
SHORT = {'en': 'EN', 'fr': 'FR', 'ko': '한국어'}
PRICES = json.loads((ROOT/'content'/'pricing-reference.json').read_text())['english_prices']
PROMPTS = json.loads((ROOT/'content'/'prompts.json').read_text())['prompts']
# Change with every stylesheet or script edit so returning visitors never mix versions.
VERSION = '20260928-3'
# The walk, in the order of the day: Namsan in the morning to the balloon at dusk.
# Coordinates place each stop on the map; the rest frames Robey inside each painting.
STOPS = [
    {'id': '006', 'lon': '126.98823', 'lat': '37.55119', 'ar': '0.6656', 'fx': '0.36', 'fy': '0.772', 'rh': '0.165', 'seed': '4.2'},
    {'id': '001', 'lon': '126.9985', 'lat': '37.5412', 'ar': '0.6956', 'fx': '0.64', 'fy': '0.93', 'rh': '0.22', 'seed': '9.7', 'ambient': 'petals'},
    {'id': '003', 'lon': '127.0592', 'lat': '37.5108', 'ar': '0.6488', 'fx': '0.478', 'fy': '0.921', 'rh': '0.19', 'seed': '2.3'},
    {'id': '004', 'lon': '127.0752', 'lat': '37.5139', 'ar': '0.6656', 'fx': '0.483', 'fy': '0.89', 'rh': '0.18', 'seed': '6.6', 'ambient': 'leaves'},
    {'id': '005', 'lon': '127.0976', 'lat': '37.5080', 'ar': '0.6656', 'fx': '0.292', 'fy': '0.849', 'rh': '0.171', 'seed': '1.4'},
    {'id': '002', 'lon': '127.1070', 'lat': '37.5108', 'ar': '0.7306', 'fx': '0.21', 'fy': '0.909', 'rh': '0.325', 'seed': '7.9', 'balloon': 'true'},
]
THREAD = {'006': 'red', '001': 'red', '003': 'navy', '004': 'green', '005': 'navy', '002': 'orange'}
# Unicode ranges of the self-hosted font subsets written by subset-fonts.py.
LATIN_RANGE = 'U+0000-036F,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-23FF,U+25A0-25FF'
HANGUL_RANGE = 'U+1100-11FF,U+3000-303F,U+3130-318F,U+AC00-D7A3,U+FF00-FFEF'
FONTS = {'nanum-pen': 'Nanum Pen Script', 'gowun-batang': 'Gowun Batang', 'gowun-dodum': 'Gowun Dodum'}

def e(s): return escape(str(s), quote=True)
def lines(s): return e(s).replace('\n', '<br>')
def paras(items): return ''.join(f'<p>{e(p)}</p>' for p in items)
def external(url, label, cls='text-link'):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{e(label)} <span aria-hidden="true">↗</span></a>'
def img(path, alt, cls='', eager=False, extra=''):
    w, h = image_size(ROOT/path.lstrip('/'))
    klass = f' class="{cls}"' if cls else ''
    return f'<img{klass} src="{path}" width="{w}" height="{h}" alt="{e(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"{extra}>'
def image(name, alt, cls='', eager=False): return img(f'{MEDIA}{name}.webp', alt, cls, eager)
def print_photo(content, caption='', cls=''):
    """A photograph shown as a print, a little tilted, with a pen caption below."""
    cap = f'<figcaption>{e(caption)}</figcaption>' if caption else ''
    return f'<figure class="print{" " + cls if cls else ""}">{content}{cap}</figure>'
def krw(value): return f'₩{value:,}'
def eur(value, locale): return f'{value} €' if locale == 'fr' else f'€{value}'

# The walk's copy may carry a few inline tags (line breaks, a letter's paragraphs, the thread colour).
ALLOWED = re.compile(r'</?(?:p|br|b)>')
def world(t):
    w = t['world']
    for key, value in w.items():
        if isinstance(value, str) and re.search(r'[<>&]', ALLOWED.sub('', value)):
            raise ValueError(f'world.{key}: only <p>, <br> and <b> may appear in the walk copy, and no bare & < or >')
    return w
def priced(text, locale):
    return text.format(pocket_krw=krw(PRICES['pocket']['krw']), standard_krw=krw(PRICES['standard']['krw']),
                       pocket_eur=eur(PRICES['pocket']['eur'], locale), standard_eur=eur(PRICES['standard']['eur'], locale))

def font_faces(locale):
    # Korean pages load every syllable the site uses; English and French pages only the few Korean words they show.
    hangul = 'hangul' if locale == 'ko' else 'hangul-core'
    rules = []
    for file, family in FONTS.items():
        rules.append(f'@font-face{{font-family:"{family}";src:url("/assets/fonts/{file}-latin.woff2") format("woff2");font-display:swap;unicode-range:{LATIN_RANGE}}}')
        rules.append(f'@font-face{{font-family:"{family}";src:url("/assets/fonts/{file}-{hangul}.woff2") format("woff2");font-display:swap;unicode-range:{HANGUL_RANGE}}}')
    return '<style>' + ''.join(rules) + '</style>'

def symbols():
    return '''<svg width="0" height="0" class="symbols" aria-hidden="true" focusable="false">
<symbol id="wordmark" viewBox="15.5 15.8 134 25.6"><path d="M62.23,18.53c0-1.03.89-1.79,1.89-1.79s1.89.76,1.89,1.79-.86,1.81-1.89,1.81-1.89-.8-1.89-1.81ZM62.47,21.92h3.34v12h-3.34v-12Z"/><path d="M127.66,36.27l.49,2.82h.28s.21,0,.21,0c.09,0,.17,0,.25,0,.07,0,.14,0,.2-.01.04,0,.08,0,.11-.01.06,0,.12-.01.18-.02.05,0,.1-.01.15-.02.08-.01.15-.03.22-.04.05-.01.1-.02.14-.03.08-.01.15-.03.22-.05.09-.03.19-.05.28-.08.14-.05.28-.1.41-.16.07-.03.15-.06.22-.1.07-.04.14-.07.22-.11.21-.11.41-.25.6-.39.09-.07.18-.14.27-.22.01-.01.03-.03.04-.04.1-.09.19-.18.28-.27.19-.2.36-.41.5-.65.06-.09.11-.18.17-.28.01-.03.03-.06.05-.09.03-.06.07-.13.1-.2.12-.25.22-.51.29-.79.02-.07.04-.14.05-.21.02-.06.03-.12.04-.18.03-.14.05-.28.06-.42.01-.07.02-.15.02-.22,0-.04,0-.08,0-.12.01-.12.01-.25.01-.37v-12.27h-3.34v12.16c0,2.16-1.6,2.4-2.63,2.4"/><path d="M86.72,18.14h3.9l2.71,7.63c.19.54.37,1.28.56,2.03.16-.75.37-1.49.56-2.03l2.71-7.63h3.9l1.68,15.78h-3.41l-.68-8.07c-.07-.82-.12-1.91-.16-3.01-.26,1.1-.56,2.19-.84,2.99l-1.94,5.44h-3.64l-1.94-5.44c-.28-.79-.61-1.89-.86-3.01-.02,1.12-.07,2.22-.14,3.03l-.68,8.07h-3.41l1.68-15.78Z"/><path d="M104.66,26.75c0-3.34,2.19-5.34,5.2-5.34s5.2,2.01,5.2,5.34v2.12c0,3.34-2.19,5.34-5.2,5.34s-5.2-2.01-5.2-5.34v-2.12ZM109.87,31.39c1.4,0,1.89-1.03,1.89-2.64v-1.89c0-1.61-.49-2.64-1.89-2.64s-1.89,1.03-1.89,2.64v1.89c0,1.61.49,2.64,1.89,2.64Z"/><path d="M117.59,26.54c0-3.36,2.26-5.13,5.02-5.13s4.99,1.77,4.99,5.13v7.37h-3.34v-7.26c0-1.61-.63-2.43-1.66-2.43s-1.7.82-1.7,2.43v7.26h-3.31v-7.37Z"/><path d="M136.4,26.75c0-3.34,2.19-5.34,5.2-5.34s5.2,2.01,5.2,5.34v2.12c0,3.34-2.19,5.34-5.2,5.34s-5.2-2.01-5.2-5.34v-2.12ZM141.6,31.39c1.4,0,1.89-1.03,1.89-2.64v-1.89c0-1.61-.49-2.64-1.89-2.64s-1.89,1.03-1.89,2.64v1.89c0,1.61.49,2.64,1.89,2.64Z"/><path d="M146.46,21c-1.02,0-1.77-.86-1.77-1.84s.75-1.84,1.77-1.84,1.79.84,1.79,1.84-.79,1.84-1.79,1.84Z"/><path d="M136.4,26.78c0-3.35,2.2-5.36,5.22-5.36s5.22,2.01,5.22,5.36v2.13c0,3.35-2.2,5.36-5.22,5.36s-5.22-2.01-5.22-5.36v-2.13ZM141.62,31.44c1.4,0,1.89-1.03,1.89-2.64v-1.89c0-1.61-.49-2.64-1.89-2.64s-1.89,1.03-1.89,2.64v1.89c0,1.61.49,2.64,1.89,2.64Z"/><path d="M17.03,30.46c1.52.55,2.96.89,4.41.89,1.21,0,1.94-.71,1.94-1.74,0-2.78-6.58-2.06-6.58-7.13,0-2.68,2.36-4.36,5.32-4.36,1.49,0,2.96.37,4.48.96l-.89,2.68c-1.28-.5-2.4-.78-3.59-.78-1.33,0-1.77.67-1.77,1.44,0,2.59,6.58,1.79,6.58,7.16,0,3.1-2.64,4.63-5.48,4.63-1.7,0-3.27-.32-5.06-.96l.65-2.8Z"/><path d="M29.98,24.1h-1.49l-.49-2.18h1.98v-3.23l3.34-.44v3.67h1.96v2.18h-1.96v9.82h-3.34v-9.82Z"/><path d="M37.08,21.92h3.31v7.13c0,1.58.65,2.39,1.68,2.39s1.68-.8,1.68-2.39v-7.13h3.34v7.25c0,3.3-2.29,5.05-5.02,5.05s-4.99-1.74-4.99-5.05v-7.25Z"/><path d="M49.61,26.67c0-3.39,2.36-5.05,4.83-5.05.75,0,1.56.28,2.05.55v-5.05h3.34v12.07c0,3.17-2.36,5.02-5.11,5.02s-5.11-1.86-5.11-5.02v-2.52ZM54.72,31.44c1.03,0,1.77-.78,1.77-2.36v-4.27c-.56-.23-1.17-.41-1.75-.41-1.03,0-1.82.64-1.82,2.39v2.29c0,1.58.77,2.36,1.8,2.36Z"/><path d="M68.44,26.88c0-3.28,2.19-5.25,5.2-5.25s5.2,1.97,5.2,5.25v2.09c0,3.28-2.19,5.25-5.2,5.25s-5.2-1.97-5.2-5.25v-2.09ZM73.64,31.44c1.4,0,1.89-1.01,1.89-2.59v-1.86c0-1.58-.49-2.59-1.89-2.59s-1.89,1.01-1.89,2.59v1.86c0,1.58.49,2.59,1.89,2.59Z"/></symbol>
<symbol id="mark" viewBox="0 0 54.3 54.3"><path d="M35.75,17.17c-2.12,0-3.68-1.79-3.68-3.82s1.56-3.82,3.68-3.82,3.73,1.75,3.73,3.82-1.65,3.82-3.73,3.82Z"/><path d="M14.82,29.2c0-6.96,4.58-11.15,10.86-11.15s10.86,4.19,10.86,11.15v4.43c0,6.96-4.58,11.15-10.86,11.15s-10.86-4.19-10.86-11.15v-4.43ZM25.68,38.89c2.92,0,3.94-2.14,3.94-5.5v-3.94c0-3.36-1.02-5.5-3.94-5.5s-3.94,2.14-3.94,5.5v3.94c0,3.36,1.02,5.5,3.94,5.5Z"/></symbol>
</svg>'''

def size_guide(locale,t):
    n=t['notebooks']; pr=n['prices']; g=n['sizeGuide']
    # Both formats drawn to scale (1 mm = 0.6 px), sewn spine on the left.
    def cover(x,w,h,label):
        y=140-h; stitches=''.join(f'<circle cx="{x+3}" cy="{y+h*k/6:.1f}" r="1"/>' for k in range(1,6))
        return f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3"/>{stitches}<text x="{x+w/2}" y="156" text-anchor="middle">{e(label)}</text></g>'
    drawing=f'<svg class="size-drawing" viewBox="0 0 176 162" aria-hidden="true" focusable="false">{cover(8,63,89,pr["pocket"])}{cover(81,89,126,pr["standard"])}</svg>'
    return f'''<div class="size-guide" id="size-guide" popover role="dialog" aria-labelledby="size-guide-title"><div class="size-guide-head"><p id="size-guide-title">{e(g['title'])}</p><button type="button" class="size-guide-close" popovertarget="size-guide" popovertargetaction="hide" aria-label="{e(t['buy']['close'])}">×</button></div>{drawing}<dl><div><dt>{e(pr['pocket'])}</dt><dd>{e(g['pocket'])}</dd></div><div><dt>{e(pr['standard'])}</dt><dd>{e(g['standard'])}</dd></div></dl><p class="size-guide-shared">{e(g['shared'])}</p></div>'''

def route_prices(locale,t,currency):
    pr=t['notebooks']['prices']
    fmt=(lambda k: krw(PRICES[k]['krw'])) if currency=='krw' else (lambda k: eur(PRICES[k]['eur'],locale))
    line=' · '.join(f'{pr[k]} {fmt(k)}' for k in ('pocket','standard'))
    if currency=='eur': line+=', '+t['buy']['shipping']
    return f'<p class="buy-price" data-buy-price>{e(line)}</p>'

def buy_link(label, locale, name='', img='', unique=False, cls='button'):
    attrs = f' data-buy data-product="{e(name)}" data-product-image="{MEDIA + img + ".webp" if img else ""}"'
    if unique: attrs += ' data-buy-kind="unique"'
    return f'<a class="{cls}" href="/{locale}/notebooks/#order"{attrs}>{e(label)} <span aria-hidden="true">↗</span></a>'

def head(locale, page, t):
    sheets = ['base', 'walk'] if page == 'home' else ['base', 'pages', 'buy']
    # The first words on screen: Robey's pen and the studio's serif, in the page's script.
    first = 'hangul' if locale == 'ko' else 'latin'
    preload = [f'/assets/fonts/nanum-pen-{first}.woff2', f'/assets/fonts/gowun-batang-{first}.woff2'] if page == 'home' else [f'/assets/fonts/gowun-batang-{first}.woff2']
    links = ''.join(f'<link rel="preload" href="{href}" as="font" type="font/woff2" crossorigin>\n' for href in preload)
    if page == 'home':
        links += f'<link rel="preload" href="{WORLD}map/map-overview.webp" as="image">\n'
    links += ''.join(f'<link rel="stylesheet" href="/css/{sheet}.css?v={VERSION}">\n' for sheet in sheets)
    return f'''<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{metadata(locale,page,t)}
<link rel="icon" type="image/png" sizes="32x32" href="/media/web/branding/favicon-32.png">
<link rel="apple-touch-icon" href="/media/web/branding/apple-touch-icon.png">
{font_faces(locale)}
{links}</head>
<body class="page-{page}">
{symbols()}
'''

def languages(locale, route, t):
    links = ''.join(f'<a href="/{l}/{route}" lang="{l}" hreflang="{l}" data-language="{l}"' + (' aria-current="true"' if l == locale else '') + f'>{SHORT[l]}</a>' for l in LOCALES)
    return f'<nav class="lang" aria-label="{e(t["nav"]["language"])}">{links}</nav>'

def header(locale,page,t):
    route={'home':'','company':'company-editions/'}.get(page,page+'/')
    if page == 'home':
        w=world(t)
        return f'''<a class="skip" href="#notebooks">{e(w['nav.skip'])}</a>
<header class="top top-walk">
<a class="brand" href="#journey" aria-label="{e(w['nav.home'])}"><svg aria-hidden="true"><use href="#wordmark"/></svg></a>
{languages(locale, route, t)}
</header>
<a class="jump" href="#notebooks" aria-label="{e(w['nav.skip'])}"><span aria-hidden="true">{e(w['nav.jump'])}</span><i aria-hidden="true"></i></a>
'''
    nav=''.join(f'<a href="/{locale}/{r}/"'+(' aria-current="page"' if key==page else '')+f'>{e(t["nav"][key])}</a>' for key,r in [('notebooks','notebooks'),('about','about'),('company','company-editions')])
    return f'''<a class="skip" href="#main">{e(t['nav']['skip'])}</a>
<header class="top top-page">
<a class="brand" href="/{locale}/" aria-label="Studio Monjo · {e(t['nav']['home'])}"><svg aria-hidden="true"><use href="#wordmark"/></svg></a>
<nav class="page-nav" aria-label="{e(t['nav']['menu'])}">{nav}</nav>
<div class="top-tools">{languages(locale, route, t)}{buy_link(t['nav']['buy'],locale,cls='top-buy')}</div>
</header>
'''

def footer(locale,page,t):
    f=t['footer']; n=t['nav']
    nav=''.join(f'<a href="/{locale}/{r}/"'+(' aria-current="page"' if key==page else '')+f'>{e(n[key])}</a>' for key,r in [('notebooks','notebooks'),('about','about'),('company','company-editions')])
    credit=f'<p class="foot-credit">© Studio Monjo' + (f' · {e(world(t)["foot.osm"])}' if page == 'home' else '') + '</p>'
    return f'''<footer class="foot">
<a class="foot-home" href="/{locale}/" aria-label="Studio Monjo · {e(n['home'])}"><svg class="foot-mark" aria-hidden="true"><use href="#mark"/></svg></a>
<p class="foot-line">{e(f['line'])}</p>
<p class="foot-place">{e(f['place'])}</p>
<nav class="foot-nav" aria-label="{e(n['menu'])}">{nav}</nav>
<p class="foot-links"><a href="https://www.instagram.com/studio.monjo/" target="_blank" rel="noopener noreferrer">{e(f['social'])}</a><a href="https://smartstore.naver.com/studiomonjo" target="_blank" rel="noopener noreferrer">Naver</a><a href="https://www.linkedin.com/company/studiomonjo/" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
{credit}
</footer>
'''

def buying(locale,t):
    b=t['buy']
    return f'''<dialog class="buy-dialog" aria-labelledby="buy-title" aria-describedby="buy-intro" data-buy-dialog data-default-product="{e(b['generic'])}" data-unique-title="{e(b['uniqueTitle'])}" data-unique-text="{e(b['uniqueText'])}" data-unique-link="{e(b['uniqueLink'])}">
<button class="buy-close" type="button" data-buy-close aria-label="{e(b['close'])}" autofocus>×</button>
<div class="buy-content"><p class="buy-eyebrow">Studio Monjo</p><h2 id="buy-title">{e(b['title'])}</h2><p id="buy-intro">{e(b['intro'])}</p>
<div class="buy-selection" data-buy-selection hidden><img data-buy-image alt="" width="84" height="84"><p><span>{e(b['selected'])}</span><strong data-buy-product></strong></p></div>
<div class="buy-choices" aria-label="{e(b['intro'])}">
<button type="button" data-buy-route="korea" aria-controls="buy-korea" aria-pressed="true">{e(b['korea'])}</button><button type="button" data-buy-route="international" aria-controls="buy-international" aria-pressed="false">{e(b['international'])}</button><button type="button" data-buy-route="business" aria-controls="buy-business" aria-pressed="false">{e(b['business'])}</button>
</div>
<section id="buy-korea" class="buy-route" data-buy-panel="korea"><h3>{e(b['koreaTitle'])}</h3><p>{e(b['koreaText'])}</p>{route_prices(locale,t,'krw')}{external('https://smartstore.naver.com/studiomonjo',b['koreaLink'],'buy-action')}</section>
<section id="buy-international" class="buy-route" data-buy-panel="international" hidden><h3>{e(b['internationalTitle'])}</h3><p>{e(b['internationalText'])}</p>{route_prices(locale,t,'eur')}{external('https://ig.me/m/studio.monjo',b['internationalLink'],'buy-action')}</section>
<section id="buy-business" class="buy-route" data-buy-panel="business" hidden><h3>{e(b['businessTitle'])}</h3><p>{e(b['businessText'])}</p><a class="buy-action" data-buy-dismiss href="/{locale}/company-editions/#company-brief">{e(b['businessLink'])} <span aria-hidden="true">→</span></a>{external('https://www.linkedin.com/company/studiomonjo/',b['linkedin'],'buy-link')}</section>
<p class="buy-note">{e(b['availability'])}</p></div>
</dialog>'''

def postcard(w, keys, art_alt='', cls='', attrs=''):
    """Robey's card: his painted hello on the left, his words in pen on the right."""
    alt = f'alt="{e(art_alt)}"' if art_alt else 'alt="" aria-hidden="true"'
    words = ''.join(f'<p>{w[k]}</p>' for k in keys)
    return f'''<div class="pcard {cls}"{attrs}>
<div class="pc-art"><img src="{WORLD}robey/hello-full.webp" data-lines="{WORLD}robey/hello-lines.webp" {alt} width="400" height="600"></div>
<div class="pc-text">{words}</div>
<span class="pc-stamp" aria-hidden="true"><svg><use href="#mark"/></svg></span>
</div>'''

def stop(s, w):
    i = s['id']
    data = ''.join(f' data-{k}="{s[k]}"' for k in ('id', 'lon', 'lat', 'ar', 'fx', 'fy', 'rh', 'seed', 'ambient', 'balloon') if k in s)
    sub = f' <span class="s-sub" lang="ko">{w[f"stop.{i}.sub"]}</span>' if w[f'stop.{i}.sub'] else ''
    if s.get('balloon'):
        # The balloon was cut out of this painting so that it can float away at dusk.
        paint = img(f'{WORLD}paint/robey-{i}-cover.webp', w[f'stop.{i}.alt'], extra=f' data-full="{WORLD}paint/robey-{i}-full.webp" data-lines="{WORLD}paint/robey-{i}-lines.webp"')
        letter = f'<div class="s-letter s-line"><p class="l-line">{w[f"stop.{i}.line"]}</p></div>'
    else:
        paint = img(f'{WORLD}paint/robey-{i}-full.webp', w[f'stop.{i}.alt'], extra=f' data-lines="{WORLD}paint/robey-{i}-lines.webp"')
        rest = w['stop.rest004'] if i == '004' else w['stop.rest']
        letter = f'<div class="s-letter"><div class="l-text">{w[f"stop.{i}.letter"]}</div><p class="l-rest">{rest}</p></div>'
    return f'''<article class="stop"{data}>
<header class="s-label"><p class="s-time">{w[f"stop.{i}.time"]}</p><h2 class="s-name"><span>{w[f"stop.{i}.name"]}</span>{sub}</h2><p class="s-ed">{w[f"stop.{i}.ed"]}</p></header>
<figure class="s-paint">{paint}</figure>
{letter}
</article>'''

def steps(w):
    films = [('fold', 1), ('sew', 2), ('stamp', 3), ('letters', 4)]
    return ''.join(f'''<article class="step"><div class="step-media" data-window><video src="{WORLD}video/{v}.mp4" poster="{WORLD}video/{v}.jpg" muted loop playsinline preload="none" aria-label="{e(w[f"step.{n}.aria"])}"></video></div><div class="step-text"><p class="step-num">0{n}</p><h3>{w[f"step.{n}.t"]}</h3><p>{w[f"step.{n}.p"]}</p></div></article>
''' for v, n in films)

def walk_copy(locale, t):
    """Words the walk writes in as it goes: the way between places, the reader, the clock, the questions."""
    w = world(t); ko = world(copy_for('ko'))
    keys = ['j.next', 'studio.clock', 'nb.ed', 'stop.rest', 'stop.002.line', 'reader.bindingT', 'reader.t1', 'reader.t2', 'reader.t3', 'reader.t4', 'find.together', 'find.minutes']
    keys += [f'stop.{s["id"]}.way' for s in STOPS[1:]] + [f'stop.{s["id"]}.letter' for s in STOPS[:-1]]
    keys += [f'book.{s["id"]}.{part}' for s in STOPS for part in ('name', 'line')] + [f'thread.{c}' for c in ('red', 'navy', 'green', 'orange')]
    data = {'lang': locale, 't': {k: w[k] for k in keys}, 'words': w['words'], 'ko': {s['id']: ko[f'book.{s["id"]}.name'] for s in STOPS},
            'thread': THREAD, 'prompts': PROMPTS}
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    return f'<script type="application/json" id="walk-copy">{text}</script>'

def home(locale, t):
    w = world(t)
    langs = list(LOCALES)
    p = PROMPTS[0]
    alts = ''.join(f'<p class="p-alt" lang="{l}">{e(p["q"][l])}</p>' for l in langs if l != locale)
    shelf = ''.join(f'''<a class="nb" href="/{locale}/notebooks/#robey-{s['id']}" data-book="{s['id']}">{img(f"{WORLD}photo/{s['id']}-cut.webp", w[f"book.{s['id']}.name"])}<span class="nb-name">{w[f"book.{s['id']}.name"]}</span><span class="nb-ed">{w['nb.ed']} · {s['id']}</span></a>''' for s in STOPS)
    return f'''<main id="main">

<section id="journey" class="journey" aria-label="{e(w['j.aria'])}">
<div class="j-stage">
<div class="j-map" aria-hidden="true"></div>
<canvas class="j-route" aria-hidden="true"></canvas>
<img class="j-robey" src="{WORLD}robey/robey-stand.webp" alt="" aria-hidden="true" width="162" height="334">
<div class="j-cartouche">
<p class="c-kicker">{w['j.kicker']}</p>
<h1 class="c-title">{w['j.title']}</h1>
<p class="c-sub">{w['j.sub']}</p>
</div>
{postcard(w, ['j.pc1', 'j.pc2', 'j.pc3'], w['j.alt.hello'], 'j-postcard', f' role="group" aria-label="{e(w["j.card"])}"')}
<div class="j-stops">
{''.join(stop(s, w) for s in STOPS)}
</div>
<div class="j-light" aria-hidden="true"></div>
<img class="j-balloon" src="{WORLD}paint/robey-002-balloon.webp" alt="" aria-hidden="true">
<p class="j-way" aria-live="polite"></p>
<p class="j-pace" aria-hidden="true">{w['j.pace']}</p>
<p class="j-hint"><span>{w['j.hint']}</span><i aria-hidden="true"></i></p>
<p class="j-end">{w['j.end']}</p>
</div>
</section>

<section id="night" class="night" data-theme="dark">
<div class="night-stage">
<p class="night-l1">{w['night.l1']}</p>
<div class="night-window" data-window="lit"><video src="{WORLD}video/paint.mp4" poster="{WORLD}video/paint.jpg" muted loop playsinline preload="none" aria-label="{e(w['night.aria'])}"></video></div>
<div class="night-l2"><p>{w['night.l2']}</p><p class="sig">{w['night.sig']}</p></div>
</div>
</section>

<section id="studio" class="studio" data-theme="dark">
<div class="studio-head">
<p class="eyebrow">{w['studio.eyebrow']}</p>
<h2>{w['studio.h2']}</h2>
<p>{w['studio.p']}</p>
<p class="clockline" data-clock></p>
</div>
<div class="steps">
<svg class="stitch" aria-hidden="true"><defs><clipPath id="sewn"><rect x="0" y="0" width="60" height="0"/></clipPath></defs><path class="stitch-guide"/><path class="stitch-thread" clip-path="url(#sewn)"/><g class="stitch-holes"></g><g class="needle"><path d="M0,-34 C1.6,-20 1.8,8 0,22 C-1.8,8 -1.6,-20 0,-34Z"/><ellipse cx="0" cy="-26" rx=".8" ry="3.2"/></g></svg>
{steps(w)}</div>
<div class="maker">
<div class="maker-photos">
<figure class="maker-photo">{img(f"{WORLD}img/jordan-market.webp", w['maker.alt1'])}<figcaption>{w['maker.caption']}</figcaption></figure>
<figure class="maker-hand">{img(f"{WORLD}img/hand-laptop.webp", w['maker.alt2'])}</figure>
</div>
<div class="maker-text">
<p class="eyebrow">{w['maker.eyebrow']}</p>
<blockquote><p>{w['maker.quote']}</p></blockquote>
<p>{w['maker.p1']}</p>
<p>{w['maker.p2']}</p>
<p class="sig"><span class="sig-name">{w['maker.sig']}</span><span>{w['maker.role']}</span></p>
<a class="quiet-link" href="/{locale}/about/">{w['maker.link']}</a>
</div>
</div>
</section>

<section id="notebooks" class="notebooks" data-theme="dark">
<div class="nb-head">
<p class="eyebrow">{w['nb.eyebrow']}</p>
<h2>{w['nb.h2']}</h2>
<p>{w['nb.p']}</p>
</div>
<div class="shelf">{shelf}</div>
<p class="nb-more"><a class="quiet-link" href="/{locale}/notebooks/">{w['nb.more']}</a></p>
</section>

<section id="page" class="page" data-theme="dark">
<div class="page-head">
<p class="eyebrow">{w['page.eyebrow']}</p>
<h2 class="hand-title">{w['page.title']}</h2>
<p>{w['page.sub']}</p>
</div>
<div class="spread" data-guide="none">
<div class="leaf leaf-left">
<div class="prompt" aria-live="polite">
<p class="p-word" lang="ko">{e(p['w'])}</p>
<p class="p-roman">{e(p['r'])}</p>
<p class="p-essence">{e(p['e'][locale])}</p>
<p class="p-main">{e(p['q'][locale])}</p>
{alts}
</div>
<button class="p-next" type="button">{w['page.next']}</button>
<img class="p-robey" src="{WORLD}robey/robey-sit.webp" alt="" aria-hidden="true" loading="lazy">
</div>
<div class="leaf leaf-right" data-guide="none">
<div class="guide-sheet lined" aria-hidden="true"></div>
<div class="guide-sheet grid" aria-hidden="true"></div>
<canvas id="ink" aria-label="{e(w['page.aria'])}"></canvas>
<p class="write-here" aria-hidden="true">{w['page.write']}</p>
<span class="folio" aria-hidden="true">1</span>
</div>
</div>
<div class="tools">
<p class="tools-note">{w['page.tools']}</p>
<div class="seg" role="group" aria-label="{e(w['page.group'])}">
<button type="button" data-guide="none" aria-pressed="true">{w['page.g0']}</button>
<button type="button" data-guide="lined" aria-pressed="false">{w['page.g1']}</button>
<button type="button" data-guide="grid" aria-pressed="false">{w['page.g2']}</button>
</div>
<div class="tool-row">
<button class="tool" type="button" data-act="turn" disabled>{w['page.turn']}</button>
<button class="tool" type="button" data-act="keep" disabled>{w['page.keep']}</button>
</div>
</div>
<p class="page-note">{w['page.note']}</p>
<p class="page-after">{w['page.after']}</p>
</section>

<section id="visit" class="visit" data-theme="light">
<div class="v-head">
<p class="eyebrow">{w['visit.eyebrow']}</p>
<h2>{w['visit.title']}</h2>
</div>
<div class="v-body">
{postcard(w, ['visit.pc1', 'visit.pc2', 'visit.pc3'], cls='v-card')}
<div class="v-prints">
<figure class="v-print p1">{img(f"{WORLD}img/company-illustration.webp", w['visit.alt1'])}<figcaption>{w['visit.cap1']}</figcaption></figure>
<figure class="v-print p2">{img(f"{WORLD}img/company-dedication.webp", w['visit.alt2'])}<figcaption>{w['visit.cap2']}</figcaption></figure>
</div>
</div>
<div class="v-foot">
<p>{w['visit.facts']}</p>
<p class="v-links"><a class="quiet-link" href="/{locale}/company-editions/">{w['visit.cta']}</a><a class="v-ig" href="https://ig.me/m/studio.monjo" target="_blank" rel="noopener noreferrer">{w['visit.cta2']}</a></p>
</div>
</section>

<section id="find" class="find" data-theme="light">
<p class="together" aria-live="polite">{w['find.together']}</p>
<h2>{w['find.h2']}</h2>
<p class="find-intro">{w['find.intro']}</p>
<div class="routes">
<div class="route"><p class="r-where">{w['find.r1.where']}</p><a class="r-link" href="https://smartstore.naver.com/studiomonjo" target="_blank" rel="noopener noreferrer">{w['find.r1.link']}</a><details><summary>{w['find.prices']}</summary><p>{e(priced(w['find.r1.p'], locale))}</p></details></div>
<div class="route"><p class="r-where">{w['find.r2.where']}</p><a class="r-link" href="https://ig.me/m/studio.monjo" target="_blank" rel="noopener noreferrer">{w['find.r2.link']}</a><details><summary>{w['find.prices']}</summary><p>{e(priced(w['find.r2.p'], locale))}</p></details></div>
<div class="route"><p class="r-where">{w['find.r3.where']}</p><a class="r-link" href="/{locale}/company-editions/">{w['find.r3.link']}</a><p class="r-sub">{w['find.r3.sub']}</p></div>
<div class="route"><p class="r-where">{w['find.r4.where']}</p><a class="r-link" href="/{locale}/about/">{w['find.r4.link']}</a><p class="r-sub">{w['find.r4.sub']}</p></div>
</div>
</section>
</main>
'''

def reader(locale, t):
    w = world(t)
    # The binding line names the thread of the notebook being read, so the walk script writes it in.
    rows = [(w['reader.pages'], w['reader.pagesT'], ''), (w['reader.guides'], w['reader.guidesT'], ''),
            (w['reader.binding'], '', ' class="r-binding"'), (w['reader.sizes'], w['reader.sizesT'], '')]
    facts = ''.join(f'<p><span>{a}</span><span{cls}>{b}</span></p>' for a, b, cls in rows)
    return f'''<dialog id="reader" aria-labelledby="r-name">
<div class="reader" tabindex="-1" autofocus>
<button class="r-close" type="button">{w['reader.close']}</button>
<div class="r-photos"><img class="r-main" alt=""><div class="r-thumbs"></div></div>
<div class="r-info">
<p class="eyebrow r-ed"></p>
<h3 id="r-name"></h3>
<p class="r-ko" lang="ko"></p>
<p class="r-line"></p>
<div class="r-letter"></div>
<div class="r-facts">{facts}</div>
<p class="r-same">{w['reader.same']}</p>
<a class="quiet-link r-find" href="#find">{w['reader.find']}</a>
</div>
</div>
</dialog>'''

def notebooks(locale,t):
    n=t['notebooks']
    faq_items=''.join(f'<div><h3>{e(item["question"])}</h3><p>{e(item["answer"])}</p></div>' for item in n['faq'])
    faq=f'<section class="notebook-faq wrap section-space" id="questions" aria-labelledby="questions-title"><h2 id="questions-title">{e(n["faqTitle"])}</h2><div class="faq-grid">{faq_items}</div><a class="quiet-link" href="/{locale}/company-editions/">{e(t["nav"]["company"])}</a></section>'
    cards=''
    for i,p in enumerate(n['products'],1):
        name=f'{n["edition"]} {i:03d} · {p["name"]}'
        buy=f'href="/{locale}/notebooks/#order" data-buy data-product="{e(name)}" data-product-image="{MEDIA}robey-{i:03d}-cover.webp"'
        cards+=f'''<article class="notebook-card" id="robey-{i:03d}"><a class="notebook-photo" {buy} aria-label="{e(n['choose'])} · {e(name)}">{img(f"{WORLD}photo/{i:03d}-cut.webp",p['alt'],eager=i<=3)}</a><p class="edition-number">{e(n['edition'])} · {i:03d}</p><h3><a {buy}>{e(p['name'])}</a></h3><p class="notebook-scene">{e(p['scene'])}</p></article>'''
    unique=''
    for p,name in zip(n['uniqueProducts'],['yeobaek','hanji-calligraphy','photo-panel']):
        unique+=f'''<article class="unique-card"><a class="print" href="/{locale}/notebooks/#order" data-buy data-buy-kind="unique" data-product="{e(p['name'])}" data-product-image="{MEDIA}{name}.webp" aria-label="{e(n['uniqueAsk'])} · {e(p['name'])}">{image(name,p['alt'])}</a><h3>{e(p['name'])}</h3><p>{e(p['line'])}</p></article>'''
    return f'''<main id="main">
<header class="page-hero wrap"><p class="eyebrow">{e(n['eyebrow'])}</p><h1>{lines(n['heading'])}</h1><div class="page-intro"><p>{e(n['intro'])}</p><nav class="section-links" aria-label="{e(n['title'])}"><a href="#collection">{e(n['robeyNav'])}</a><a href="#one-of-a-kind">{e(n['uniqueNav'])}</a><a href="#inside">{e(n['insideNav'])}</a></nav></div></header>
<section class="collection navy" id="collection" aria-labelledby="collection-title"><div class="wrap"><div class="band-head"><h2 id="collection-title">{e(n['collection'])}</h2><p>{e(n['collectionIntro'])}</p></div><div class="notebook-grid">{cards}</div></div></section>
<section class="writing-section" id="inside" aria-labelledby="inside-title"><div class="wrap writing-grid"><figure class="writing-film"><div class="film" data-window><video controls autoplay playsinline muted loop preload="metadata" poster="{MEDIA}writing-poster.webp" width="720" height="1280" aria-label="{e(n['videoAlt'])}"><source src="{MEDIA}writing-on-navy.mp4" type="video/mp4"></video></div><figcaption>{e(n['videoCaption'])}</figcaption></figure><div class="writing-copy"><p class="eyebrow">{e(n['insideKicker'])}</p><h2 id="inside-title">{lines(n['insideTitle'])}</h2><p class="lead">{e(n['insideText'])}</p><dl class="detail-list"><div><dt>{e(n['paperTitle'])}</dt><dd>{e(n['paperText'])}</dd></div><div><dt>{e(n['guidesTitle'])}</dt><dd>{e(n['guidesText'])}</dd></div><div><dt>{e(n['bindingTitle'])}</dt><dd>{e(n['bindingText'])}</dd></div><div><dt>{e(n['sizesTitle'])}</dt><dd>{e(n['sizesText'])}</dd><button type="button" class="size-trigger" popovertarget="size-guide" aria-haspopup="dialog" aria-expanded="false" data-size-trigger><span class="size-trigger-icon" aria-hidden="true">i</span>{e(n['sizeGuide']['open'])}</button>{size_guide(locale,t)}</div></dl><div class="writing-pages">{print_photo(image('blank-spread',n['blankAlt']),cls='tilt-l')}{print_photo(image('page-guides',n['guideAlt']),n['guideCaption'],'tilt-r')}</div></div></div></section>
<section class="unique-section wrap section-space" id="one-of-a-kind" aria-labelledby="unique-title"><div class="section-heading"><div><p class="eyebrow">{e(n['uniqueKicker'])}</p><h2 id="unique-title">{e(n['uniqueTitle'])}</h2></div><p>{e(n['uniqueText'])}</p></div><div class="unique-grid">{unique}</div><div class="availability-line"><p>{e(n['uniqueNote'])}</p>{buy_link(n['uniqueAsk'],locale,unique=True,cls='quiet-link')}</div></section>
<section class="story-invitation wrap"><div><p class="eyebrow">{e(n['storyKicker'])}</p><h2>{e(n['storyTitle'])}</h2><p>{e(n['storyText'])}</p><a class="quiet-link" href="/{locale}/about/">{e(n['storyLink'])}</a></div>{print_photo(image('jordan-signing',t['about']['signingAlt']),cls='tilt-r')}</section>
{faq}
<section class="order-section navy" id="order" aria-labelledby="order-title"><div class="wrap"><p class="eyebrow">{e(t['buy']['fallbackTitle'])}</p><h2 id="order-title">{e(n['orderTitle'])}</h2><p>{e(n['orderText'])}</p>{buy_link(n['orderButton'],locale,cls='button button-white')}<div class="order-direct">{external('https://smartstore.naver.com/studiomonjo',t['buy']['korea']+' · Naver','quiet-link')}{external('https://ig.me/m/studio.monjo',t['buy']['international']+' · Instagram','quiet-link')}</div></div></section>
</main>'''

def about(locale,t):
    a=t['about']
    return f'''<main id="main">
<header class="about-hero wrap"><div class="about-hero-copy"><p class="eyebrow">{e(a['eyebrow'])}</p><h1>{lines(a['heading'])}</h1><p class="lead">{e(a['intro'])}</p></div>{print_photo(image('jordan-market',a['portraitAlt'],eager=True),a['portraitCaption'],'tilt-r')}</header>
<div class="founder-letter wrap"><div class="letter-card"><aside class="letter-aside"><svg class="letter-mark" aria-hidden="true"><use href="#mark"/></svg><p>Studio Monjo</p><span>{e(t['footer']['line'])}</span></aside><div class="letter-body"><section><h2>{e(a['originTitle'])}</h2>{paras(a['origin'])}</section><section><h2>{e(a['makingTitle'])}</h2>{paras(a['making'])}</section></div></div></div>
<div class="maker-statement navy"><div class="wrap"><p>{lines(a['pull'])}</p><span>Studio Monjo</span></div></div>
<section class="robey-story wrap section-space"><figure class="robey-shelf">{img(f"{WORLD}photo/003-cut.webp",t['notebooks']['products'][2]['alt'])}</figure><div><p class="eyebrow">{e(t['notebooks']['edition'])}</p><h2>{e(a['robeyTitle'])}</h2>{paras(a['robey'])}<a class="quiet-link" href="/{locale}/notebooks/#collection">{e(t['notebooks']['collection'])}</a></div></section>
<section class="market-story wrap"><div><p class="eyebrow">{e(a['marketKicker'])}</p><h2>{e(a['marketTitle'])}</h2>{paras(a['market'])}<p class="signature">{e(a['signature'])}<span>{e(a['signatureDetail'])}</span></p></div>{print_photo(image('maison-market',a['marketAlt']),a['marketCaption'],'tilt-l')}</section>
<section class="simple-close wrap"><h2>{e(a['close'])}</h2><a class="button" href="/{locale}/notebooks/">{e(a['closeLink'])} <span aria-hidden="true">→</span></a></section>
</main>'''

def company(locale,t):
    c=t['company']; w=world(t)
    facts=''.join(f'<div><strong>{e(a)}</strong><span>{e(b)}</span></div>' for a,b in c['facts'])
    details=''.join(f'<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>' for a,b in c['details'])
    process=''.join(f'<li><span class="step-number">0{i}</span><h3>{e(a)}</h3><p>{e(b)}</p></li>' for i,(a,b) in enumerate(c['process'],1))
    def field(key, name, type='text', attrs='', wide=False):
        return f'<label class="form-field{ " field-wide" if wide else ""}"><span>{e(c[key])}</span><input type="{type}" name="{name}" {attrs}></label>'
    form=field('name','name',attrs='autocomplete="name" required')+field('workEmail','email','email','autocomplete="email" required')+field('organization','company',attrs='autocomplete="organization" required')+field('country','delivery_country',attrs='autocomplete="country-name" required')+field('quantity','quantity','number',f'min="20" inputmode="numeric" placeholder="{e(c["quantityHint"])}" required')
    form+=f'''<label class="form-field"><span>{e(c['edition'])}</span><select name="edition" required><option value="" disabled selected>{e(c['choose'])}</option><option value="Brand Edition">{e(c['brand'])}</option><option value="Illustration Edition">{e(c['illustration'])}</option><option value="Not sure yet">{e(c['unsure'])}</option></select></label><label class="form-field field-wide"><span>{e(c['story'])}</span><textarea name="occasion_and_story" rows="4" required></textarea></label>'''
    form+=field('date','desired_date',attrs=f'placeholder="{e(c["dateHint"])}"',wide=True)
    return f'''<main id="main">
<header class="company-hero navy"><div class="company-hero-copy"><p class="eyebrow">{e(c['eyebrow'])}</p><h1>{lines(c['heading'])}</h1><p class="lead">{e(c['intro'])}</p><a class="button button-white" href="#company-brief">{e(t['nav']['project'])} <span aria-hidden="true">→</span></a></div>{print_photo(image('company-cover',c['heroAlt'],eager=True),c['heroCaption'],'tilt-r')}</header>
<div class="company-facts wrap">{facts}</div>
<section class="edition-options wrap section-space" aria-labelledby="options-title"><p class="eyebrow">{e(c['optionsKicker'])}</p><h2 id="options-title">{lines(c['optionsTitle'])}</h2><div class="edition-grid"><article>{print_photo(image('company-brand',c['brandAlt']),cls='tilt-l')}<div class="edition-copy"><p class="eyebrow">{e(c['brandLabel'])}</p><h3>{lines(c['brandTitle'])}</h3><p>{e(c['brandText'])}</p><div class="edition-commercial"><strong>{e(c['brandPrice'])}</strong><span>{e(c['brandTime'])}</span></div><a class="quiet-link" data-edition="Brand Edition" href="#company-brief">{e(c['optionLink'])}</a></div></article><article>{print_photo(image('company-illustration',c['illustrationAlt']),cls='tilt-r')}<div class="edition-copy"><p class="eyebrow">{e(c['illustrationLabel'])}</p><h3>{lines(c['illustrationTitle'])}</h3><p>{e(c['illustrationText'])}</p><div class="edition-commercial"><strong>{e(c['illustrationPrice'])}</strong><span>{e(c['illustrationTime'])}</span></div><a class="quiet-link" data-edition="Illustration Edition" href="#company-brief">{e(c['optionLink'])}</a></div></article></div><p class="pricing-note">{e(c['pricingNote'])} {e(c['illustrationCaption'])}</p></section>
<section class="edition-detail navy"><div class="wrap edition-detail-grid">{print_photo(image('company-dedication',c['detailsAlt']),c['detailsCaption'],'tilt-l')}<div><p class="eyebrow">{e(c['detailsKicker'])}</p><h2>{lines(c['detailsTitle'])}</h2><p>{e(c['detailsText'])}</p><dl class="detail-list">{details}</dl></div></div></section>
<section class="edition-process wrap section-space"><h2>{lines(c['processTitle'])}</h2><ol>{process}</ol><p class="delivery-note">{e(c['delivery'])}</p></section>
<section class="company-contact wrap" id="company-brief" aria-labelledby="brief-title"><div class="brief-intro"><p class="eyebrow">{e(c['briefKicker'])}</p><h2 id="brief-title">{lines(c['briefTitle'])}</h2><p>{e(c['briefText'])}</p>{external('https://www.linkedin.com/company/studiomonjo/',c['linkedin'],'quiet-link')}{postcard(w, ['visit.pc1', 'visit.pc2', 'visit.pc3'], cls='brief-card')}</div>
<div class="brief-form"><form class="company-form" action="https://formspree.io/f/meevrwqb" method="POST" data-company-form data-error-message="{e(c['error'])}" data-error-link="{e(c['errorLink'])}" data-sending-message="{e(c['sending'])}"><input type="hidden" name="_subject" value="New Studio Monjo company edition enquiry"><input type="hidden" name="source" value="company-editions-{locale}">{form}<input class="form-trap" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="form-send"><p>{e(c['privacy'])}</p><button class="button" type="submit">{e(c['submit'])} <span aria-hidden="true">→</span></button></div><p class="form-status" data-company-form-status role="status" hidden></p></form><div class="form-done" data-company-form-done tabindex="-1" hidden><h3>{e(c['successTitle'])}</h3><p>{e(c['successText'])}</p><p class="form-done-sign">{e(c['successSign'])}</p></div></div></section>
</main>'''

def update_root(t):
    path=ROOT/'index.html'
    s=path.read_text()
    old_head=s.split('</head>',1)[0]
    language_script=re.search(r'<script>.*?</script>',old_head,re.S).group(0)
    prefix=head('en','home',t).split('<body',1)[0]
    prefix=re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', prefix, flags=re.S)
    prefix=re.sub(r'<link rel="(?:preload|stylesheet)"[^>]*>\n?', '', prefix)
    prefix=re.sub(r'<style>.*?</style>\n?', '', prefix, flags=re.S)
    site_graph=structured_data('en','home',t)
    site_graph['@graph']=site_graph['@graph'][:3]
    site_schema='<script type="application/ld+json">'+json.dumps(site_graph,ensure_ascii=False).replace('<','\\u003c')+'</script>'
    prefix=prefix.replace('</head>',site_schema+'\n'+language_script+'\n<noscript><meta http-equiv="refresh" content="0; url=en/"></noscript>\n</head>')
    s=re.sub(r'^.*?</head>\s*',lambda _:prefix,s,count=1,flags=re.S)
    s=re.sub(r'<body>.*?</body>', '<body>\n<main style="font-family:system-ui,sans-serif;padding:24px;color:#16243f"><h1>Studio Monjo</h1><p>'+e(t['home']['description'])+'</p><p><a href="/en/" lang="en">English</a> · <a href="/fr/" lang="fr">Français</a> · <a href="/ko/" lang="ko">한국어</a></p></main>\n</body>',s,flags=re.S)
    path.write_text(s)

copy={}
def copy_for(locale): return copy[locale]
for locale in LOCALES:
    copy[locale]=json.loads((ROOT/'content'/f'{locale}.json').read_text())
for locale,t in copy.items():
    for key,build in [('notebooks',notebooks),('about',about),('company',company)]:
        route='company-editions' if key=='company' else key
        dest=ROOT/locale/route/'index.html'; dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(head(locale,key,t)+header(locale,key,t)+build(locale,t)+'\n'+footer(locale,key,t)+buying(locale,t)+f'\n<script src="/js/studio.js?v={VERSION}" defer></script>\n</body>\n</html>\n')
    (ROOT/locale/'index.html').write_text(head(locale,'home',t)+header(locale,'home',t)+home(locale,t)+footer(locale,'home',t)+reader(locale,t)+'\n'+walk_copy(locale,t)+f'\n<script src="/js/walk.js?v={VERSION}" defer></script>\n<script src="/js/studio.js?v={VERSION}" defer></script>\n</body>\n</html>\n')
    print(f'Built {locale}: the walk, notebooks, story and company editions.')

LOST = [('en', 'Robey took a wrong turn.', 'This page is not here, or no longer. The walk begins again from the start.', 'Back to the walk'),
        ('fr', 'Roby s’est trompé de chemin.', 'Cette page n’est pas ici, ou plus. La promenade reprend depuis le début.', 'Revenir à la promenade'),
        ('ko', '러비가 길을 잘못 들었습니다.', '이 페이지는 여기에 없거나 더 이상 없습니다. 산책은 처음부터 다시 시작됩니다.', '산책으로 돌아가기')]

def not_found():
    """GitHub Pages answers every missing address with /404.html: the three languages, and the way back."""
    notes = ''.join(f'<section lang="{l}"><h1>{e(title)}</h1><p>{e(text)}</p><a class="quiet-link" href="/{l}/">{e(link)}</a></section>' for l, title, text, link in LOST)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found · Studio Monjo</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#16243F">
<link rel="icon" type="image/png" sizes="32x32" href="/media/web/branding/favicon-32.png">
{font_faces('en')}
<link rel="stylesheet" href="/css/base.css?v={VERSION}">
<style>
.lost {{ min-height: 100vh; display: grid; place-items: center; padding: 12vh var(--gutter); text-align: center; }}
.lost img {{ width: 92px; margin: 0 auto 5vh; mix-blend-mode: multiply; }}
.lost section + section {{ margin-top: 6vh; padding-top: 6vh; border-top: 1px dashed var(--hair); }}
.lost h1 {{ font: 400 clamp(26px, 3vw, 38px)/1.3 var(--book); }}
.lost p {{ margin: 12px auto 0; max-width: 30em; color: var(--text); }}
</style>
</head>
<body>
{symbols()}
<header class="top"><a class="brand" href="/" aria-label="Studio Monjo"><svg aria-hidden="true"><use href="#wordmark"/></svg></a></header>
<main class="lost"><div><img src="{WORLD}robey/robey-sit.webp" alt="" width="{image_size(ROOT/'media/web/world/robey/robey-sit.webp')[0]}" height="{image_size(ROOT/'media/web/world/robey/robey-sit.webp')[1]}">{notes}</div></main>
</body>
</html>
'''

def check_fonts():
    """Warn when the copy uses characters the self-hosted font subsets do not include yet."""
    source = ROOT/'assets'/'fonts'/'subset-coverage.json'
    if not source.exists():
        print('Warning: assets/fonts/subset-coverage.json is missing. Run scripts/subset-fonts.py.')
        return
    cover = json.loads(source.read_text())
    korean = re.compile(r'[ᄀ-ᇿ　-〿㄰-㆏가-힣＀-￯]')
    for locale in LOCALES:
        used = set(''.join(path.read_text() for path in (ROOT/locale).rglob('*.html')))
        if locale == 'en':
            used |= set((ROOT/'404.html').read_text())
        hangul = cover['gowun-batang-' + ('hangul' if locale == 'ko' else 'hangul-core')]
        missing = {c for c in used if korean.match(c) and c not in hangul}
        missing |= {c for c in used if ord(c) > 127 and not korean.match(c) and c not in cover['gowun-batang-latin']}
        if missing:
            print(f'Warning: {locale} pages use characters missing from the font subsets: {"".join(sorted(missing))}. Run scripts/subset-fonts.py.')

update_root(copy['en'])
(ROOT/'404.html').write_text(not_found())
write_discovery(copy)
check_fonts()
