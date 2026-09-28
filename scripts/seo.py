"""Shared, source-grounded metadata and discovery files for the static site."""
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://studiomonjo.com'
LOCALES = ('en', 'fr', 'ko')
ROUTES = {'home': '', 'notebooks': 'notebooks/', 'about': 'about/', 'company': 'company-editions/'}
# Change only when published page content changes, not on every CI run.
CONTENT_MODIFIED = '2026-09-28'


def page_url(locale, page):
    return f'{BASE}/{locale}/{ROUTES[page]}'


def image_size(path):
    """Pixel size of a WebP, PNG or JPEG file, read from its header with the standard library."""
    data = Path(path).read_bytes()
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return int.from_bytes(data[16:20], 'big'), int.from_bytes(data[20:24], 'big')
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        if data[12:16] == b'VP8X':
            return 1 + int.from_bytes(data[24:27], 'little'), 1 + int.from_bytes(data[27:30], 'little')
        if data[12:16] == b'VP8L':
            bits = int.from_bytes(data[21:25], 'little')
            return 1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)
        marker = data.find(b'\x9d\x01\x2a', 20, 40)
        return (int.from_bytes(data[marker+3:marker+5], 'little') & 0x3fff,
                int.from_bytes(data[marker+5:marker+7], 'little') & 0x3fff)
    if data.startswith(b'\xff\xd8'):
        position = 2
        while position + 9 < len(data):
            if data[position] != 0xff:
                position += 1
                continue
            marker = data[position + 1]
            if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                return int.from_bytes(data[position+7:position+9], 'big'), int.from_bytes(data[position+5:position+7], 'big')
            if marker in (0xd8, 0x01) or 0xd0 <= marker <= 0xd7:
                position += 2
                continue
            position += 2 + int.from_bytes(data[position+2:position+4], 'big')
    raise ValueError(f'Unsupported or unreadable image: {path}')


# The walk's share card is its opening: Robey's postcard on the map. scripts/render-share-cards.py draws every card.
HOME_CARD = {'en': 'Robey’s postcard on a drawn map of Seoul.',
             'fr': 'La carte postale de Roby sur une carte dessinée de Séoul.',
             'ko': '그림으로 그린 서울 지도 위, 러비가 보낸 엽서.'}


def plain(text):
    return ' '.join(text.replace('<br>', ' ').replace('\n', ' ').replace('\u00a0', ' ').split())


def image_info(page, t):
    """One 1200 × 630 JPEG card per page and language, with its headline in the language of the page."""
    locale = t.get('_locale', 'en')
    w = t['world']
    alt = {'home': f'{plain(w["j.title"])}. {HOME_CARD[locale]}',
           'notebooks': f'{plain(w["nb.h2"])} {w["visit.alt1"]}.',
           'about': f'{plain(t["about"]["heading"])} {t["about"]["portraitAlt"]}.',
           'company': f'{plain(t["company"]["heading"])} {t["company"]["heroAlt"]}.'}[page]
    return (f'/media/web/og/{page}-{locale}.jpg', 1200, 630, 'image/jpeg', alt)


def structured_data(locale, page, t):
    url = page_url(locale, page)
    studio, person, website = (BASE + fragment for fragment in ('/#studio', '/#jordan-monnet', '/#website'))
    title = t[page].get('seoTitle', t[page].get('title', 'Studio Monjo'))
    picture = BASE + image_info(page, t)[0]
    graph = [
        {'@type': 'Organization', '@id': studio, 'name': 'Studio Monjo', 'url': BASE + '/',
         'logo': BASE + '/media/web/branding/monjo-mark-256.png',
         'description': t['home']['description'], 'founder': {'@id': person},
         'location': {'@type': 'Place', 'name': 'Seoul, South Korea'},
         'sameAs': ['https://www.instagram.com/studio.monjo',
                    'https://www.linkedin.com/company/studiomonjo/',
                    'https://smartstore.naver.com/studiomonjo']},
        {'@type': 'Person', '@id': person, 'name': 'Jordan Monnet',
         'url': page_url(locale, 'about'), 'image': BASE + '/media/web/studio/jordan-market.webp',
         'jobTitle': 'Notebook maker and illustrator', 'worksFor': {'@id': studio}},
        {'@type': 'WebSite', '@id': website, 'name': 'Studio Monjo', 'url': BASE + '/',
         'inLanguage': list(LOCALES), 'publisher': {'@id': studio}},
    ]
    webpage = {'@type': {'about': 'AboutPage', 'notebooks': 'CollectionPage'}.get(page, 'WebPage'),
               '@id': url + '#webpage', 'url': url, 'name': title,
               'description': t[page]['description'], 'inLanguage': locale,
               'isPartOf': {'@id': website}, 'about': {'@id': studio},
               'publisher': {'@id': studio}, 'image': picture}
    if page != 'home':
        breadcrumb = {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Studio Monjo', 'item': page_url(locale, 'home')},
            {'@type': 'ListItem', 'position': 2, 'name': t[page]['title'], 'item': url}]}
        graph.append(breadcrumb)
        webpage['breadcrumb'] = {'@id': breadcrumb['@id']}
    if page == 'about':
        webpage['mainEntity'] = {'@id': person}
        webpage['author'] = {'@id': person}
    elif page == 'notebooks':
        collection = {'@type': 'ItemList', '@id': url + '#collection',
                      'name': t['notebooks']['collection'], 'numberOfItems': 6,
                      'itemListElement': [
                          {'@type': 'ListItem', 'position': i,
                           'name': f'{t["notebooks"]["edition"]} {i:03d} · {product["name"]}',
                           'url': url + f'#robey-{i:03d}',
                           'image': BASE + f'/media/web/studio/robey-{i:03d}-cover.webp'}
                          for i, product in enumerate(t['notebooks']['products'], 1)]}
        graph.append(collection)
        webpage['mainEntity'] = {'@id': collection['@id']}
    elif page == 'company':
        service = {'@type': 'Service', '@id': url + '#service', 'name': t['company']['title'],
                   'description': t['company']['intro'], 'url': url,
                   'provider': {'@id': studio}, 'serviceType': 'Custom hand-bound company notebooks'}
        graph.append(service)
        webpage['mainEntity'] = {'@id': service['@id']}
    graph.append(webpage)
    return {'@context': 'https://schema.org', '@graph': graph}


def metadata(locale, page, t):
    t = dict(t, _locale=locale)
    title = t[page].get('seoTitle', t[page].get('title', 'Studio Monjo') + ' | Studio Monjo')
    description, url = t[page]['description'], page_url(locale, page)
    picture, width, height, mime, alt = image_info(page, t)
    og_locale = {'en': 'en_US', 'fr': 'fr_FR', 'ko': 'ko_KR'}
    def meta(key, value, attribute='name'):
        return f'<meta {attribute}="{key}" content="{escape(str(value), quote=True)}">'
    tags = [f'<title>{escape(title)}</title>', meta('description', description),
            meta('robots', 'index, follow, max-image-preview:large'),
            meta('theme-color', '#16243F'),
            f'<link rel="canonical" href="{url}">']
    tags.extend(f'<link rel="alternate" hreflang="{lang}" href="{page_url(lang, page)}">' for lang in LOCALES)
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{page_url("en", page)}">')
    for key, value in {'site_name': 'Studio Monjo', 'title': title, 'description': description,
                       'type': 'website', 'url': url, 'image': BASE + picture,
                       'image:type': mime, 'image:width': width, 'image:height': height,
                       'image:alt': alt, 'locale': og_locale[locale]}.items():
        tags.append(meta('og:' + key, value, 'property'))
    tags.extend(meta('og:locale:alternate', og_locale[lang], 'property') for lang in LOCALES if lang != locale)
    for key, value in {'card': 'summary_large_image', 'title': title, 'description': description,
                       'image': BASE + picture, 'image:alt': alt}.items():
        tags.append(meta('twitter:' + key, value))
    # Escape tag delimiters so future copy cannot end the JSON-LD script element.
    data = json.dumps(structured_data(locale, page, t), ensure_ascii=False, separators=(',', ':'))
    data = data.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    tags.append('<script type="application/ld+json">' + data + '</script>')
    return '\n'.join(tags)


class MainText(HTMLParser):
    """Extract the same visible editorial text and links, without forms or UI chrome."""
    blocks = {'p', 'h1', 'h2', 'h3', 'h4', 'section', 'article', 'div', 'li', 'dt', 'dd', 'figcaption', 'details'}
    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url, self.parts, self.stack = url, [], []
        self.in_main = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main':
            self.in_main = True
        if not self.in_main:
            return
        skip = bool(self.stack) or tag in ('script', 'style', 'form', 'nav', 'button', 'canvas') or 'hidden' in attrs or attrs.get('aria-hidden') == 'true'
        void = tag in ('img', 'input', 'source', 'br', 'hr', 'meta', 'link', 'wbr')
        if skip:
            if not void:
                self.stack.append(tag)
            return
        if tag in self.blocks:
            self.parts.append('\n\n')
        if tag in ('h1', 'h2', 'h3', 'h4'):
            self.parts.append('#' * (int(tag[1]) + 1) + ' ')
        if tag == 'br':
            self.parts.append(' ')
    def handle_endtag(self, tag):
        if self.stack:
            if tag == self.stack[-1]:
                self.stack.pop()
            return
        if tag == 'main':
            self.in_main = False
        if self.in_main and tag in self.blocks:
            self.parts.append('\n\n')
        elif self.in_main:
            self.parts.append(' ')
    def handle_data(self, data):
        if self.in_main and not self.stack:
            self.parts.append(data)
    def text(self):
        import re
        # Canonical page URLs label every excerpt; keep link labels as ordinary text.
        text = '\n'.join(re.sub(r'[ \t]+', ' ', line).strip() for line in ''.join(self.parts).splitlines())
        return re.sub(r'\n{3,}', '\n\n', text).strip()


def write_discovery(copy):
    import xml.etree.ElementTree as ET
    namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    xhtml = 'http://www.w3.org/1999/xhtml'
    ET.register_namespace('', namespace)
    ET.register_namespace('xhtml', xhtml)
    sitemap = ET.Element(f'{{{namespace}}}urlset')
    for page in ROUTES:
        for locale in LOCALES:
            entry = ET.SubElement(sitemap, f'{{{namespace}}}url')
            ET.SubElement(entry, f'{{{namespace}}}loc').text = page_url(locale, page)
            ET.SubElement(entry, f'{{{namespace}}}lastmod').text = CONTENT_MODIFIED
            for lang in (*LOCALES, 'x-default'):
                ET.SubElement(entry, f'{{{xhtml}}}link', rel='alternate', hreflang=lang,
                              href=page_url('en' if lang == 'x-default' else lang, page))
    ET.indent(sitemap, space='  ')
    (ROOT / 'sitemap.xml').write_bytes(ET.tostring(sitemap, encoding='utf-8', xml_declaration=True) + b'\n')
    (ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + BASE + '/sitemap.xml\n')
    prices = json.loads((ROOT / 'content' / 'pricing-reference.json').read_text())['english_prices']
    guide = ['# Studio Monjo', '', '> Hand-bound notebooks made by French maker Jordan Monnet in Seoul, South Korea.', '',
             'Studio Monjo makes illustrated Robey notebooks, individual pieces, and custom company editions. '
             'Jordan folds, sews and checks each notebook himself. Robey (Roby in French, 러비 in Korean) is a small robot discovering the human world; he can read but cannot write yet, so the blank pages are left to the person who writes in them.', '',
             'Each language opens with a slow walk with Robey across a drawn map of Seoul, from morning to dusk: Namsan, the Little Library at Starfield COEX, Seokchon Lake in Jamsil, and three scenes found on the way (petals at a window, a tree, an orange balloon). '
             'Each place is one of the six Robey editions, painted by Jordan and sewn into a notebook, and each notebook ships with a letter from Robey. '
             'The same page shows how the notebooks are folded, sewn and stamped, a blank page to write on (nothing written there is sent or saved), company editions, and where to find the notebooks. Map data © OpenStreetMap contributors.', '',
             'Robey notebooks have blank 105gsm pages and removable lined and grid guides. They come in pocket A6 (about 105 × 148 mm, 52 pages from 13 folded sheets) and standard A5 (about 148 × 210 mm, 56 pages from 14 folded sheets). '
             'Individual pieces shown on the website are examples; availability is confirmed through the shop or studio.', '',
             f'Every language shows prices for both routes: in Korea through Naver, pocket ₩{prices["pocket"]["krw"]:,} and standard ₩{prices["standard"]["krw"]:,}; international orders through Instagram, pocket €{prices["pocket"]["eur"]} and standard €{prices["standard"]["eur"]}. Shipping and final prices are confirmed when ordering. '
             'Company editions begin at 20 copies, with Brand and Illustration options. Current details are on the linked pages.', '',
             '## Website', '']
    for page in ROUTES:
        for locale in LOCALES:
            title = copy[locale][page].get('seoTitle', copy[locale][page].get('title', 'Studio Monjo'))
            guide.append(f'- [{title} ({locale})]({page_url(locale, page)}): {copy[locale][page]["description"]}')
    guide.extend(['', '## Buying and company enquiries', '',
                  '- [Naver shop](https://smartstore.naver.com/studiomonjo): Individual notebook orders for delivery in South Korea.',
                  '- [Instagram orders](https://ig.me/m/studio.monjo): Individual customers outside Korea; confirm availability, shipping and payment with the studio.',
                  '- [Company enquiry form](https://studiomonjo.com/en/company-editions/#company-brief): Custom company notebooks.',
                  '- [Studio Monjo on LinkedIn](https://www.linkedin.com/company/studiomonjo/): Company enquiries and studio updates.', '',
                  '## Optional', '',
                  '- [Full public page text](https://studiomonjo.com/llms-full.txt): Text extracted from the current English, French and Korean pages.',
                  '- [XML sitemap](https://studiomonjo.com/sitemap.xml): Canonical pages and their language equivalents.', ''])
    (ROOT / 'llms.txt').write_text('\n'.join(guide))
    full = ['# Studio Monjo: public website text', '',
            'Generated from the visible pages listed below. Refer to each canonical URL for the current page and ordering details.', '']
    for locale in LOCALES:
        for page, route in ROUTES.items():
            parser = MainText(page_url(locale, page))
            parser.feed((ROOT / locale / route / 'index.html').read_text())
            full.extend(['---', '', f'## {copy[locale][page].get("seoTitle", "Studio Monjo")}',
                         f'Canonical URL: {page_url(locale, page)}', f'Language: {locale}', '', parser.text(), ''])
    (ROOT / 'llms-full.txt').write_text('\n'.join(full))
