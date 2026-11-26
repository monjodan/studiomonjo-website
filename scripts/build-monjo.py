#!/usr/bin/env python3
"""The new English pages, laid over the packaged site.

The desk film (home), Robey Notebooks, Unique and Limited editions, Accessories and Unique Objects, Our story
and the calendar replace the English pages of the
site. French and Korean keep their current pages until they are translated, and so does the company page.
Nothing is sold on these pages: they link to the Naver shop, to the dates and to Instagram.

Run it after the usual build, which it relies on for everything else (the other languages, the calendar
files, the pictures the Naver shop uses, the printable templates):

    python3 scripts/build-studio.py
    python3 scripts/package-pages.py
    python3 scripts/build-monjo.py            # writes the new pages into _site and checks them

The page sources live in monjo/src and their pictures in media/web/monjo. They are made in the design
workspace (prototypes/monjo-notebook-3d, outside this repository) and brought here with

    python3 scripts/build-monjo.py --sync ../prototypes/monjo-notebook-3d

which needs Pillow. The build itself needs only Python's standard library.

The calendar sheets are drawn again at each build from content/events.json by scripts/dates.py, so a new
confirmed date appears without touching the page source.
"""
from datetime import date
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
import argparse
import importlib.util
import json
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'monjo' / 'src'
MEDIA = ROOT / 'media' / 'web' / 'monjo'
SITE = ROOT / '_site'
BASE = 'https://studiomonjo.com'
BRAND = 'Studio Monjo'     # Jordan, 26 November 2026: the name stays Studio Monjo, on the new pages too
MEDIA_URL = '/media/web/monjo'
LOCALES = ('en', 'ko')     # French keeps its current pages until the new ones are translated
KO_FILE = ROOT / 'monjo' / 'ko.json'       # every sentence of the new pages in Korean, keyed by its English
SPOKEN = ('alt', 'aria-label', 'data-cap', 'title')

# route -> source, title, description, and whether French and Korean have a page of the same role
PAGES = {
    '': dict(src='home', title='Studio Monjo · Notebooks folded and sewn by hand in Seoul',
             text='Notebooks folded and sewn by hand in Seoul, with blank pages of a paper that takes ink well. Watch one open flat, take a line, and come apart.',
             alt=''),
    'robey': dict(src='robey', title='Robey Notebooks · Robey in Seoul | Studio Monjo',
                  text='Robey wanders Seoul and keeps what he finds. Each place on his map became a hand-sewn notebook, and each notebook leaves with a letter from that place.',
                  alt=None),
    'editions': dict(src='editions', title='Unique and Limited editions | Studio Monjo',
                     text='Hand-sewn A5 notebooks with a bare cover in one paper from one maker: two papers from Jeonju, a tea paper, a coffee paper, a paper from Japan.',
                     alt=None),
    'objects': dict(src='objects', title='Accessories and Unique Objects | Studio Monjo',
                    text='A fabric sleeve for our notebooks in two sizes, a mini notebook and a mini block of notes. They are seen in person, at our table.',
                    alt=None),
    'story': dict(src='story', title='Our story · Why we make notebooks | Studio Monjo',
                  text='Why we fold and sew notebooks by hand in Seoul, the paper we picked, and the person who makes them.',
                  alt=None),
    'dates': dict(src='dates', title='Find us · Markets and fairs in Seoul | Studio Monjo',
                  text='The markets and fairs where you can hold our notebooks, try the paper with a pen and ask us how they are made.',
                  alt='dates'),
}
# English addresses that existed before and now lead to their new page
MOVED = {'notebooks': 'robey', 'about': 'story', 'workshops': 'story'}
LINKS = {'index.html': '/en/', 'robey.html': '/en/robey/', 'editions.html': '/en/editions/', 'objects.html': '/en/objects/',
         'story.html': '/en/story/', 'dates.html': '/en/dates/'}


def sync(proto):
    """Bring the page sources and their pictures from the design workspace into this repository."""
    from PIL import Image
    site = Path(proto) / 'site'
    SRC.mkdir(parents=True, exist_ok=True)
    pages = (('home', 'site'), ('robey', 'robey'), ('editions', 'editions'), ('objects', 'objects'), ('story', 'story'), ('dates', 'dates'))
    for old in SRC.glob('*.src.html'):                      # a page that left the design leaves this folder too
        if old.name[:-9] not in [name for name, _ in pages]:
            old.unlink()
    for name, src in pages:
        shutil.copyfile(site / f'{src}.src.html', SRC / f'{name}.src.html')
    for name in ('shared.src.css', 'player.src.js', 'shop.src.js'):
        shutil.copyfile(site / name, SRC / name)
    # where the three parts of the notebook are in each picture of the film (for the names "The cover", "Thirteen sheets", "One thread")
    home = (site / 'site.src.html').read_text(encoding='utf-8')
    film = re.search(r'FILMS = \[dict\(src="(frames\d+)", rate=(\d+)', (Path(proto) / 'make_sets.py').read_text())
    frames, rate = film.group(1), int(film.group(2))        # the folder of rendered pictures, and pictures per frame of the timeline
    (SRC / 'film.json').write_text(json.dumps({'pictures': frames, 'rate': rate, 'count': 236 * rate + 1}))
    anchors = json.loads((Path(proto) / 'film' / frames / 'anchors.json').read_text())
    anchors = {int(k): {n: v for n, v in m.items() if n in ('cover', 'sheets', 'thread')} for k, m in anchors.items() if int(k) < 900}
    (SRC / 'anchors.json').write_text(json.dumps(anchors, separators=(',', ':'), sort_keys=True))
    for folder in ('film', 'photo', 'img'):
        shutil.rmtree(MEDIA / folder, ignore_errors=True)
    for cut in ('d', 'p'):
        shutil.copytree(site / cut, MEDIA / 'film' / cut)
    # Only the pictures a page names go into the site. Drafts and older pictures (the old folded letter, the card
    # mock-ups) stay in the design workspace: a file in this folder is public as soon as the site is.
    named = ''.join(p.read_text(encoding='utf-8') for p in SRC.iterdir() if p.suffix in ('.html', '.js', '.css'))
    left = []
    for folder in ('photo', 'img'):
        (MEDIA / folder).mkdir(parents=True)
        for p in sorted((site / folder).iterdir()):
            if not p.is_file() or p.name.startswith('.'):
                continue
            if p.stem in named:
                shutil.copyfile(p, MEDIA / folder / p.name)
            else:
                left.append(p.name)
    if left:
        print(f'Left in the workspace, no page uses them: {", ".join(left)}')
    share_cards()
    sizes = {p.stem: Image.open(p).size for p in sorted((MEDIA / 'photo').glob('*.jpg'))}
    (SRC / 'photo-sizes.json').write_text(json.dumps(sizes, separators=(',', ':'), sort_keys=True))
    total = sum(p.stat().st_size for p in MEDIA.rglob('*') if p.is_file())
    print(f'Synced {len(list(SRC.iterdir()))} sources and {total / 1e6:.1f} MB of pictures from {proto}')
    assert 'frames:' in home


def share_cards():
    """One picture of 1200 x 630 per page, for the links people send (KakaoTalk, Instagram, messages): no words on them,
    the title travels beside the picture. Made from the pictures already in media/web/monjo."""
    from PIL import Image, ImageDraw, ImageFilter
    W, H, NAVY = 1200, 630, (11, 19, 34)
    out = MEDIA / 'og'
    out.mkdir(parents=True, exist_ok=True)
    def fill(im, focus=0.5):                              # cover the card, keeping the given height of the picture in view
        im = im.convert('RGB'); k = max(W / im.size[0], H / im.size[1])
        im = im.resize((round(im.size[0] * k) + 1, round(im.size[1] * k) + 1), Image.LANCZOS)
        x = (im.size[0] - W) // 2; y = round((im.size[1] - H) * focus)
        return im.crop((x, y, x + W, y + H))
    save = lambda im, name: im.save(out / f'{name}.jpg', quality=86, optimize=True, progressive=True)
    save(fill(Image.open(MEDIA / 'film/d/poster.jpg'), 0.62), 'home')
    save(fill(Image.open(MEDIA / 'photo/story-write.jpg'), 0.5), 'story')
    stall = Image.open(MEDIA / 'photo/story-stall.jpg')    # the notebooks on their stands at a market, without the price board below them
    sw, sh_ = stall.size
    save(fill(stall.crop((round(sw * 0.20), round(sh_ * 0.28), round(sw * 0.95), round(sh_ * 0.542)))), 'dates')
    card = Image.new('RGB', (W, H), NAVY)                 # the four covers of Robey in Seoul, as on his map
    covers = [Image.open(MEDIA / f'photo/pin-{n}.jpg').convert('RGB') for n in ('namsan', 'wall', 'coex', 'seokchon')]
    tall = 350; sized = [c.resize((round(c.size[0] * tall / max(c.size)), round(c.size[1] * tall / max(c.size))), Image.LANCZOS) for c in covers]
    gap = 34; x = (W - sum(c.size[0] for c in sized) - gap * 3) // 2
    for c in sized:
        y = (H - c.size[1]) // 2
        shade = Image.new('L', (W, H), 0); ImageDraw.Draw(shade).rounded_rectangle([x + 4, y + 14, x + c.size[0] + 4, y + c.size[1] + 14], 9, fill=170)
        card.paste((3, 7, 15), (0, 0), shade.filter(ImageFilter.GaussianBlur(14)))
        mask = Image.new('L', c.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, c.size[0] - 1, c.size[1] - 1], 9, fill=255)
        card.paste(c, (x, y), mask); x += c.size[0] + gap
    save(card, 'robey')
    card = Image.new('RGB', (W, H), NAVY)                 # four of the papers, side by side
    for i, n in enumerate(('hanji', 'tea', 'coffee', 'somokushi')):
        strip = Image.open(MEDIA / f'photo/paper-{n}.jpg').convert('RGB'); k = max(300 / strip.size[0], H / strip.size[1])
        strip = strip.resize((round(strip.size[0] * k) + 1, round(strip.size[1] * k) + 1), Image.LANCZOS)
        card.paste(strip.crop(((strip.size[0] - 300) // 2, (strip.size[1] - H) // 2, (strip.size[0] - 300) // 2 + 300, (strip.size[1] - H) // 2 + H)), (i * 300, 0))
    save(card, 'editions')
    card = Image.new('RGB', (W, H), NAVY)                 # the sleeve, open, on the navy of the pages
    sleeve = Image.open(MEDIA / 'photo/sleeve-open.webp').convert('RGBA').resize((640, 640), Image.LANCZOS)
    card.paste(sleeve, ((W - 640) // 2, (H - 640) // 2), sleeve)
    save(card, 'objects')


def dates_module():
    spec = importlib.util.spec_from_file_location('dates', ROOT / 'scripts' / 'dates.py')
    D = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(D)
    return D


def calendar_parts(locale='en'):
    """The month sheets and the list of past markets, as of today, from content/events.json."""
    D = dates_module()
    t = json.loads((ROOT / 'content' / f'{locale}.json').read_text(encoding='utf-8'))
    d = t['dates']
    day = D.today()
    upcoming, past = D.split(D.published(D.load()[1]), day)
    months = ''.join(D.sheet(locale, t, y, m, upcoming) for y, m in D.months_to_show(upcoming, day))
    empty = '' if upcoming else f'<p class="dates-empty">{escape(d["empty"])}</p>'
    return empty + months, D.past_list(locale, t, past) if past else ''


def short_dates(locale='en'):
    """The few lines "next dates" that close several pages: the confirmed dates still to come, from content/events.json,
    so that no page keeps a market that is over."""
    D = dates_module()
    t = json.loads((ROOT / 'content' / f'{locale}.json').read_text(encoding='utf-8'))
    upcoming, _ = D.split(D.published(D.load()[1]), D.today())
    if not upcoming:
        return f'<p class="small">{escape(t["dates"]["empty"])}</p>'
    rows = []
    for ev in upcoming:
        facts = [D.words(ev, locale, 'place')]
        if ev.get('booth'):
            facts.append(f'{t["dates"]["booth"]} {ev["booth"]}')
        if ev.get('hours'):
            facts.append(ev['hours'])
        rows.append(f'<li><time datetime="{ev["start"].isoformat()}">{escape(D.when(locale, t, ev["start"], ev["end"], True))}</time>'
                    f'<div><strong>{escape(D.words(ev, locale, "name"))}</strong><span>{escape(" · ".join(x for x in facts if x))}</span></div></li>')
    return '<ul class="dates">\n' + '\n'.join('        ' + r for r in rows) + '\n      </ul>'


def no_double(doc):
    """On a Korean page the Korean written beside a name would say the name twice (남산 남산, 서울 서울): one of the two goes."""
    def gloss(m):
        same = m.group(1).strip().endswith(m.group(4).strip()) and ('lang="ko"' in m.group(3) or 'm-ko' in m.group(3))
        return m.group(1).rstrip() if same else m.group(0)
    doc = re.sub(r'([^<>\s][^<>]*?)\s*<(span|i|tspan)([^>]*)>([^<]+)</\2>', gloss, doc)
    return re.sub(r'(<span class="own" lang="ko">([^<]+)</span>)\2', r'\1', doc)


def korean():
    if not KO_FILE.is_file():
        return {'strings': {}, 'meta': {}}
    return json.loads(KO_FILE.read_text(encoding='utf-8'))


def translate(doc, table, missing):
    """The page with every sentence a visitor reads or hears put into the other language: the text between tags and the
    attributes read aloud. Scripts and styles are left alone. What has no translation stays as it is and is noted."""
    out, skip = [], None
    def spoken(m):
        key = unescape(m.group(2)).strip()
        if key in table:
            return f'{m.group(1)}="{escape(table[key], quote=True)}"'
        if re.search(r'[A-Za-z]{2}', key):
            missing.add(key)
        return m.group(0)
    for tok in re.split(r'(<[^>]+>)', doc):
        if tok.startswith('<'):
            m = re.match(r'<\s*(/?)\s*([a-zA-Z0-9]+)', tok)
            if m and m.group(2).lower() in ('script', 'style'):
                skip = None if m.group(1) else m.group(2).lower()
            out.append(tok if skip else re.sub(r'\b(%s)="([^"]*)"' % '|'.join(SPOKEN), spoken, tok))
        elif skip:
            out.append(tok)
        else:
            key = re.sub(r'\s+', ' ', unescape(tok).strip())
            if key and key in table:
                out.append(tok[:len(tok) - len(tok.lstrip())] + escape(table[key], quote=False) + tok[len(tok.rstrip()):])
            else:
                if key and re.search(r'[A-Za-z]{2}', key):
                    missing.add(key)
                out.append(tok)
    return ''.join(out)


def identity(locale):
    """The studio, its maker and the site, as the earlier pages state them: read from the company page, which is unchanged."""
    doc = (SITE / locale / 'company-editions' / 'index.html').read_text(encoding='utf-8')
    nodes = []
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', doc, flags=re.S):
        data = json.loads(block)
        nodes += data.get('@graph', [data]) if isinstance(data, dict) else data
    keep = [n for n in nodes if n.get('@type') in ('Organization', 'Person', 'WebSite')]
    for n in keep:
        if n['@type'] == 'Person':
            n['url'] = f'{BASE}/{locale}/story/'
    return keep


ROBEY = [('namsan', 'Namsan', 'One step, then another, towards the tower.', 'namsan-cover.jpg', True),
         ('wall', 'The fortress wall', 'A landscape notebook, for drawing.', 'wall-cover.jpg', False),
         ('coex', 'The COEX library', 'So many stories still to discover.', 'library-cover.jpg', True),
         ('seokchon', 'Seokchon Lake', 'Looking across the water, looking up.', 'seokchon-cover.jpg', True)]
PAPERS = [('hanji', 'Hanji', 'Chunyang P&B · Jeonju, Korea'), ('baegunji', 'Baegunji', 'Gogam Hanji & Paper · Jeonju, Korea'),
          ('tea', 'Tea Paper', 'CYP · Shanghai, China'), ('coffee', 'Coffee Paper', 'CYP · Shanghai, China'),
          ('somokushi', 'Somokushi', 'Tokushu Tokai Paper · Shizuoka, Japan')]
OBJECTS = [('sleeve', 'Notebook sleeve'), ('mini-notebook', 'Mini notebook'), ('mini-block', 'Mini block of notes')]
NAVER = 'https://smartstore.naver.com/studiomonjo'


def facts(route, locale, title, text, url, image, ko):
    """The page's structured data: who makes this, what the page is, and what it lists (the notebooks with their price,
    the papers, the objects, the coming dates). Nothing is stated here that the page itself does not say."""
    say = (lambda x: ko['strings'].get(x, x)) if locale == 'ko' and ko else (lambda x: x)
    studio, site = f'{BASE}/#studio', f'{BASE}/#website'
    kind = {'': 'WebPage', 'story': 'AboutPage'}.get(route, 'CollectionPage')
    page = {'@type': kind, '@id': url + '#page', 'url': url, 'name': title, 'description': text, 'inLanguage': locale,
            'isPartOf': {'@id': site}, 'about': {'@id': studio}, 'primaryImageOfPage': image}
    nodes = identity(locale) + [page]
    if route:
        nodes.append({'@type': 'BreadcrumbList', '@id': url + '#path', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': BRAND, 'item': f'{BASE}/{locale}/'},
            {'@type': 'ListItem', 'position': 2, 'name': title.split(' | ')[0].split(' · ')[0], 'item': url}]})
    items = []
    if route == 'robey':
        for i, (pid, name, line, pic, on_naver) in enumerate(ROBEY):
            items.append({'@type': 'ListItem', 'position': i + 1, 'item': {
                '@type': 'Product', '@id': f'{url}#{pid}', 'name': f'{say("Robey")} · {say(name)}', 'description': say(line),
                'image': f'{BASE}{MEDIA_URL}/photo/{pic}', 'url': f'{url}#{pid}', 'category': 'Notebook', 'size': 'A6',
                'brand': {'@id': studio},
                'offers': {'@type': 'Offer', 'price': '21000', 'priceCurrency': 'KRW', 'url': NAVER if on_naver else f'{BASE}/{locale}/dates/',
                           'seller': {'@id': studio}}}})
    elif route == 'editions':
        items = [{'@type': 'ListItem', 'position': i + 1, 'name': f'{say(name)} · {say(maker)}', 'url': f'{url}#{pid}'} for i, (pid, name, maker) in enumerate(PAPERS)]
    elif route == 'objects':
        items = [{'@type': 'ListItem', 'position': i + 1, 'name': say(name), 'url': f'{url}#{pid}'} for i, (pid, name) in enumerate(OBJECTS)]
    if items:
        page['mainEntity'] = {'@id': url + '#list'}
        nodes.append({'@type': 'ItemList', '@id': url + '#list', 'numberOfItems': len(items), 'itemListElement': items})
    if route == 'dates':
        t = json.loads((ROOT / 'content' / f'{locale}.json').read_text(encoding='utf-8'))
        nodes += dates_module().graph(locale, t, url, studio, image)
    block = json.dumps({'@context': 'https://schema.org', '@graph': nodes}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'<script type="application/ld+json">{block}</script>\n'


# Korean breaks a line between words, never inside one (without this a title reads 접 / 고)
KEEP = 'body{word-break:keep-all;overflow-wrap:break-word}'


def head(route, page, locale='en', ko=None):
    tail = f'{route}/' if route else ''
    url = f'{BASE}/{locale}/{tail}'
    image = f'{BASE}{MEDIA_URL}/og/{route or "home"}.jpg'           # 1200 x 630, made by --sync
    title, text = page['title'], page['text']
    if locale == 'ko' and ko:
        key = route or 'home'
        title, text = ko['meta'].get(f'{key}_title', title), ko['meta'].get(f'{key}_text', text)
    alternates = ''.join(f'<link rel="alternate" hreflang="{lang}" href="{BASE}/{lang}/{tail}">\n' for lang in LOCALES)
    if page['alt'] is not None:                       # French has a page of the same role, in the earlier design
        alternates += f'<link rel="alternate" hreflang="fr" href="{BASE}/fr/{page["alt"] + "/" if page["alt"] else ""}">\n'
    alternates += f'<link rel="alternate" hreflang="x-default" href="{BASE}/en/{tail}">'
    return f'''<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)}</title>
<meta name="description" content="{escape(text)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0b1322">
<link rel="canonical" href="{url}">
{alternates}
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(text)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{'ko_KR' if locale == 'ko' else 'en_US'}">
<meta property="og:locale:alternate" content="{'en_US' if locale == 'ko' else 'ko_KR'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title)}">
<meta name="twitter:description" content="{escape(text)}">
<meta name="twitter:image" content="{image}">
{facts(route, locale, title, text, url, image, ko)}
<link rel="icon" type="image/png" sizes="32x32" href="/media/web/branding/favicon-32.png">
<link rel="apple-touch-icon" href="/media/web/branding/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>:root{{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}{KEEP if locale == 'ko' else ''}</style>
'''


def build_page(route, page, parts, anchors, sizes, cal, film, locale='en', ko=None, dates='', missing=None):
    text = (SRC / f'{page["src"]}.src.html').read_text(encoding='utf-8')
    for mark, value in parts.items():
        text = text.replace(mark, value)
    text = re.sub(r'/\*RATE\*/\d+/\*END\*/', str(film['rate']), text)
    if '/*ANCHORS*/' in text:
        a, b = text.index('/*ANCHORS*/'), text.index('/*END*/')
        text = text[:a] + json.dumps(anchors, separators=(',', ':')) + text[b + 7:]
    if page['src'] == 'dates':
        months, past = cal
        text = re.sub(r'<!--CAL-->.*?<!--/CAL-->', lambda _: months, text, flags=re.S)
        if past:
            text = re.sub(r'<ol class="cal-past-list".*?</ol>', lambda _: past, text, count=1, flags=re.S)
        else:
            text = re.sub(r'<!--PAST-->.*?<!--/PAST-->', '', text, flags=re.S)
    # the preview's own lines: its title, the notes about the prototype, the switch between two ways of moving the film
    text = re.sub(r'<title>.*?</title>\s*', '', text, count=1, flags=re.S)
    text = re.sub(r'<meta name="claude:[^>]*>\s*', '', text)
    text = re.sub(r'\s*<details>.*?</details>', '', text, flags=re.S)
    text = re.sub(r'\s*<p class="filmway">.*?</p>', '', text, flags=re.S)
    text = re.sub(r'<!--/?(CAL|PAST)-->', '', text)
    # addresses: pages, pictures, the film
    for name, url in LINKS.items():
        url = url.replace('/en/', f'/{locale}/', 1)
        text = re.sub(r'href="%s(#[^"]*)?"' % re.escape(name), lambda m, url=url: 'href="%s%s"' % (url, m.group(1) or ''), text)
    if dates:                                          # the short lists of dates are drawn from the calendar, not kept by hand
        text = re.sub(r'<ul class="dates">.*?</ul>', lambda _: dates, text, flags=re.S)
    text = re.sub(r'(["\'(])photo/', r'\1' + MEDIA_URL + '/photo/', text)
    text = re.sub(r'(["\'(])img/', r'\1' + MEDIA_URL + '/img/', text)
    text = text.replace('src="d/poster.jpg"', f'src="{MEDIA_URL}/film/d/poster.jpg"').replace('"d/still-"', f'"{MEDIA_URL}/film/d/still-"')
    text = re.sub(r'dir:\s*"([dp])"', lambda m: 'dir: "%s/film/%s"' % (MEDIA_URL, m.group(1)), text)
    for name, (w, h) in sizes.items():                 # every photograph says its size, so nothing jumps while loading
        text = text.replace(f'src="{MEDIA_URL}/photo/{name}.jpg"', f'src="{MEDIA_URL}/photo/{name}.jpg" width="{w}" height="{h}"')
    # the two foot links that only exist on the real site
    tail = f'{route}/' if route else ''
    other = ('<a href="/ko/%s" lang="ko" hreflang="ko">한국어</a>' % tail) if locale == 'en' else ('<a href="/en/%s" lang="en" hreflang="en">English</a>' % tail)
    text = text.replace('<li>For companies</li>', f'<li><a href="/{locale}/company-editions/">For companies</a></li>')
    text = text.replace('<li>Français · 한국어</li>', f'<li>{other} · <a href="/fr/" lang="fr" hreflang="fr">Français</a></li>')
    if locale == 'ko' and ko:
        text = no_double(translate(text, ko['strings'], missing if missing is not None else set()))
    cut = text.index('</style>') + len('</style>')
    return head(route, page, locale, ko) + text[:cut].lstrip() + '\n</head>\n<body>\n' + text[cut:].strip() + '\n</body>\n</html>\n'


def redirect(to, locale='en'):
    url = f'{BASE}/{locale}/{to}/'
    return f'''<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<title>{BRAND}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url=/{locale}/{to}/">
</head>
<body>
<p><a href="/{locale}/{to}/">{'이 페이지는 옮겨졌습니다.' if locale == 'ko' else 'This page has moved.'}</a></p>
</body>
</html>
'''


class Refs(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src', 'poster', 'data-src'):
            if attrs.get(key):
                self.urls.append(attrs[key])
        if attrs.get('id'):
            self.ids.add(attrs['id'])


def check(written, film):
    """Every address a new page uses must exist in the packaged site; every in-page link must have its target."""
    problems = []
    for route, path in written.items():
        refs = Refs()
        text = path.read_text(encoding='utf-8')
        refs.feed(text)
        for url in refs.urls + re.findall(r'"(/media/web/monjo/[^"\s]+\.(?:jpg|webp|png|mp4))"', text):
            if url.startswith(('http://', 'https://', 'mailto:', 'data:')):
                continue
            if url.startswith('#'):
                if len(url) > 1 and url[1:] not in refs.ids:
                    problems.append(f'/{route}: no element with id {url[1:]}')
                continue
            target, _, frag = url.partition('#')
            if not target.startswith('/'):
                problems.append(f'/{route}: relative address {url}')
                continue
            file = SITE / target.lstrip('/')
            if target.endswith('/'):
                file = file / 'index.html'
            if not file.is_file():
                problems.append(f'/{route}: missing {target}')
            elif frag and file.suffix == '.html':
                other = Refs()
                other.feed(file.read_text(encoding='utf-8'))
                if frag not in other.ids:
                    problems.append(f'/{route}: {target} has no id {frag}')
        if re.search(r'Prototype|About this prototype|claude:', text):
            problems.append(f'/{route}: a line of the preview is still in the page')
    # The film comes in layers of sheets of four: "s" holds one picture per frame of the timeline and plays alone,
    # "t" holds the pictures in between and only makes it smoother.
    frames, rate = film['count'], film.get('rate', 1)
    want = {'s': -(-(-(-frames // rate)) // 4), 't': -(-(frames // rate) // 4) if rate > 1 else 0}
    for cut in ('d', 'p'):
        for layer, n in want.items():
            have = len(list((SITE / 'media/web/monjo/film' / cut).glob(f'{layer}[0-9][0-9][0-9].jpg')))
            if have != n:
                problems.append(f'film/{cut}: {have} "{layer}" sheets for {frames} pictures, expected {n}')
    manifest = json.loads((ROOT / 'content' / 'naver-media.json').read_text())['assets']
    lost = [a for a in manifest if not (SITE / a).is_file()]
    if lost:
        problems.append(f'{len(lost)} pictures used by the Naver shop are missing, first: {lost[0]}')
    return problems


def plain(doc):
    """What a visitor reads on a page, as lines of text."""
    body = doc[doc.index('<body'):] if '<body' in doc else doc
    body = re.sub(r'<(script|style|svg|noscript)\b.*?</\1>', ' ', body, flags=re.S)
    body = re.sub(r'<(br|/p|/h[1-6]|/li|/figcaption|/div|/section|/tr|/time|/small|/strong)\b[^>]*>', '\n', body)
    lines = [re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', line))).strip() for line in body.split('\n')]
    out = []
    for line in lines:
        if line and (not out or out[-1] != line):
            out.append(line)
    return '\n'.join(out)


def llms(ko):
    """llms.txt (a short guide for AI assistants) and llms-full.txt (the text of every page), written again for the pages as
    they now are. scripts/seo.py writes both for the earlier pages; here the English and Korean entries follow the new ones."""
    D = dates_module()
    t = json.loads((ROOT / 'content' / 'en.json').read_text(encoding='utf-8'))
    upcoming, _ = D.split(D.published(D.load()[1]), D.today())
    dates = []
    for ev in upcoming:
        bits = [D.when('en', t, ev['start'], ev['end'], True), D.words(ev, 'en', 'place')]
        if ev.get('booth'):
            bits.append(f'booth {ev["booth"]}')
        if ev.get('hours'):
            bits.append(ev['hours'])
        dates.append(f'- {D.words(ev, "en", "name")}: ' + ', '.join(bits))
    pages = []
    for locale in LOCALES:
        for route, page in PAGES.items():
            title, text = page['title'], page['text']
            if locale == 'ko' and ko:
                key = route or 'home'
                title, text = ko['meta'].get(f'{key}_title', title), ko['meta'].get(f'{key}_text', text)
            pages.append((f'{BASE}/{locale}/{route + "/" if route else ""}', locale, title, text))
    others = []                                           # the pages this build does not write: French, and the company page
    for path in sorted(SITE.glob('*/**/index.html')) + sorted(SITE.glob('*/index.html')):
        rel = path.relative_to(SITE).as_posix()[:-len('index.html')]
        url = f'{BASE}/{rel}'
        if any(url == p[0] for p in pages) or rel.split('/')[0] not in ('en', 'fr', 'ko'):
            continue
        doc = path.read_text(encoding='utf-8')
        if 'http-equiv="refresh"' in doc or 'noindex' in doc[:doc.find('</head>')]:
            continue
        title = re.search(r'<title>(.*?)</title>', doc, flags=re.S)
        text = re.search(r'<meta name="description" content="([^"]*)"', doc)
        entry = (url, rel.split('/')[0], unescape(title.group(1)).strip() if title else url, unescape(text.group(1)) if text else '')
        if entry not in others:
            others.append(entry)
    guide = f'''# Studio Monjo

> Notebooks folded and sewn by hand in Seoul, South Korea, by Jordan Monnet, a French bookbinder and illustrator.

Studio Monjo is a one-person studio. Every notebook has blank pages of a 105 g/m² paper chosen because it takes fountain pen ink well (New April Bride, Ultra White). Each is sewn through its fold with one thread and no glue, so it opens flat. Two loose guides, one lined and one grid, come with it, and a card that carries the maker's red seal.

The website shows the work and sells nothing itself. Notebooks are bought in the Naver shop ({NAVER}), at markets and fairs in Seoul, or by writing on Instagram (https://www.instagram.com/studio.monjo/).

## What the studio makes

- Robey Notebooks: Pocket notebooks (A6, 105 × 148 mm, 52 pages) with a painting of Robey, a small robot who wanders Seoul and keeps what he finds. The series "Robey in Seoul" has four places: Namsan, the fortress wall (a landscape notebook, for drawing), the COEX library, Seokchon Lake. Each notebook leaves with a card carrying Robey's letter from that place. Price: ₩21,000. Robey is written Roby in French and 러비 in Korean.
- Unique and Limited editions: Standard notebooks (A5, 148 × 210 mm) with a bare cover in one paper from one named maker, nothing printed on it: hanji from Chunyang P&B (Jeonju, Korea); Baegunji from Gogam Hanji & Paper (Jeonju, Korea), in white, ivory or grey; Tea Paper and Coffee Paper from CYP (Shanghai, China); Somokushi from Tokushu Tokai Paper (Shizuoka, Japan). These are first samples, seen at the studio's table; no price is published. A limited edition is being finished.
- Accessories and Unique Objects: a navy notebook sleeve in microfibre suede for A5 and for A6 notebooks (made in a sewing factory in China, not by the studio); a mini notebook at the size of a name card; a mini block of tear-off notes.
- Company editions: custom notebooks for companies, from 20 copies ({BASE}/en/company-editions/).

## Where to see the notebooks

{chr(10).join(dates) if dates else 'No date is confirmed at the moment.'}

Only confirmed dates are listed. The calendar is at {BASE}/en/dates/ and each date can be added to a calendar app from {BASE}/calendar/.

## Pages

''' + '\n'.join(f'- [{title} ({locale})]({url}): {text}' for url, locale, title, text in pages + others) + f'''
- [Full public page text]({BASE}/llms-full.txt): the text of every page listed above.

## Languages

English and Korean share the same pages. French still shows the earlier design of the site, with the same notebooks.
'''
    (SITE / 'llms.txt').write_text(guide, encoding='utf-8')
    full = ['# Studio Monjo: public website text', '', 'Generated from the visible pages listed below. Refer to each canonical URL for the current page.', '']
    for url, locale, title, text in pages + others:
        rel = url[len(BASE) + 1:]
        doc = (SITE / rel / 'index.html').read_text(encoding='utf-8')
        full += ['---', '', f'## {title}', f'Canonical URL: {url}', f'Language: {locale}', '', plain(doc), '']
    (SITE / 'llms-full.txt').write_text('\n'.join(full), encoding='utf-8')


def sitemap():
    path = SITE / 'sitemap.xml'
    text = path.read_text(encoding='utf-8')
    for locale in LOCALES:
        for old, new in MOVED.items():
            text = text.replace(f'{BASE}/{locale}/{old}/', f'{BASE}/{locale}/{new}/')
    today = date.today().isoformat()
    extra = ''.join(f'  <url>\n    <loc>{BASE}/{locale}/{route}/</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n'
                    for locale in LOCALES for route in ('robey', 'editions', 'objects', 'story', 'dates') if f'<loc>{BASE}/{locale}/{route}/</loc>' not in text)
    # two old addresses may now point at the same new page: keep the first block for each address
    seen, blocks = set(), []
    for block in re.findall(r'  <url>.*?</url>\n', text, flags=re.S):
        loc = re.search(r'<loc>(.*?)</loc>', block).group(1)
        if loc not in seen:
            seen.add(loc)
            blocks.append(block)
    start = text.index('  <url>')
    path.write_text(text[:start] + ''.join(blocks) + extra + '</urlset>\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--sync', metavar='PROTOTYPE', help='first copy the page sources and pictures from the design workspace')
    args = parser.parse_args()
    if args.sync:
        sync(args.sync)
    if not (SITE / 'en' / 'index.html').is_file():
        sys.exit('Run scripts/build-studio.py and scripts/package-pages.py first: _site is not there.')
    parts = {'/*PLAYER*/': (SRC / 'player.src.js').read_text(encoding='utf-8'),
             '/*SHARED_CSS*/': (SRC / 'shared.src.css').read_text(encoding='utf-8'),
             '/*SHOP_JS*/': (SRC / 'shop.src.js').read_text(encoding='utf-8')}
    anchors = json.loads((SRC / 'anchors.json').read_text())
    sizes = json.loads((SRC / 'photo-sizes.json').read_text())
    film = json.loads((SRC / 'film.json').read_text())
    ko = korean()
    shutil.rmtree(SITE / 'media/web/monjo', ignore_errors=True)
    shutil.copytree(MEDIA, SITE / 'media/web/monjo')
    written, missing = {}, set()
    for locale in LOCALES:
        cal, dates = calendar_parts(locale), short_dates(locale)
        for route, page in PAGES.items():
            out = SITE / locale / route / 'index.html'
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(build_page(route, page, parts, anchors, sizes, cal, film, locale, ko, dates, missing), encoding='utf-8')
            written[f'{locale}/{route}'] = out
        for old, new in MOVED.items():
            out = SITE / locale / old / 'index.html'
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(redirect(new, locale), encoding='utf-8')
    sitemap()
    llms(ko)
    problems = check(written, film)
    size = sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
    print(f'New pages, in {" and ".join(LOCALES)}: {", ".join("/" + (r + "/" if r else "") for r in PAGES)}')
    print(f'Moved, in each language: {", ".join(f"/{a}/ to /{b}/" for a, b in MOVED.items())}')
    if missing:
        print(f'Not yet in Korean ({len(missing)} pieces, shown in English on the Korean pages):')
        for piece in sorted(missing)[:40]:
            print('  ' + piece[:110])
    print(f'Site: {size / 1e6:.1f} MB in {sum(1 for p in SITE.rglob("*") if p.is_file())} files')
    if problems:
        print('\n'.join('PROBLEM: ' + p for p in problems))
        sys.exit(1)
    print('Checked: every address on the new pages exists, and the Naver shop\'s pictures are all there.')


if __name__ == '__main__':
    main()
