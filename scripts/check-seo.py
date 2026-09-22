#!/usr/bin/env python3
"""Check the site's published SEO metadata, crawl paths and LLM guide files.

Uses only the standard library. Run against the repository after generating the
pages, or pass --root to check the packaged artifact. This is a consistency
check, not a promise of search ranking or an automated fact-check of prose.
"""
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import argparse
import datetime
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://studiomonjo.com'
LOCALES = ('en', 'fr', 'ko')
ROUTES = ('', 'notebooks', 'about', 'company-editions')
PAGE_TYPES = {'WebPage', 'AboutPage', 'CollectionPage', 'ContactPage', 'ItemPage', 'ProfilePage'}
EMAIL = re.compile(r'[a-z0-9][a-z0-9.!#$%&\x27*+/=?^_`{|}~-]*@(?:[a-z0-9][a-z0-9-]*\.)+[a-z]{2,63}\b', re.I)


def canonical(locale, route=''):
    return f'{BASE}/{locale}/' + (route + '/' if route else '')


def alternate_urls(route):
    return {**{lang: canonical(lang, route) for lang in LOCALES}, 'x-default': canonical('en', route)}


def decoded(text):
    text = unquote(unescape(text))
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda match: chr(int(match[1], 16)), text)


def nodes(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from nodes(child)


def types(node):
    value = node.get('@type', [])
    return {value} if isinstance(value, str) else {item for item in value if isinstance(item, str)} if isinstance(value, list) else set()


def image_info(path):
    data = path.read_bytes()
    if data.startswith(b'\x89PNG\r\n\x1a\n') and len(data) >= 24:
        return 'image/png', int.from_bytes(data[16:20], 'big'), int.from_bytes(data[20:24], 'big')
    if data[:6] in (b'GIF87a', b'GIF89a') and len(data) >= 10:
        return 'image/gif', int.from_bytes(data[6:8], 'little'), int.from_bytes(data[8:10], 'little')
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        if data[12:16] == b'VP8X' and len(data) >= 30:
            return 'image/webp', 1 + int.from_bytes(data[24:27], 'little'), 1 + int.from_bytes(data[27:30], 'little')
        if data[12:16] == b'VP8L' and len(data) >= 25:
            bits = int.from_bytes(data[21:25], 'little')
            return 'image/webp', 1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)
        marker = data.find(b'\x9d\x01\x2a', 20, 40)
        if marker >= 0:
            return 'image/webp', int.from_bytes(data[marker+3:marker+5], 'little') & 0x3fff, int.from_bytes(data[marker+5:marker+7], 'little') & 0x3fff
    if data.startswith(b'\xff\xd8'):
        position = 2
        while position + 3 < len(data):
            if data[position] != 255:
                position += 1
                continue
            while position < len(data) and data[position] == 255:
                position += 1
            if position >= len(data):
                break
            marker = data[position]
            position += 1
            if marker in (0x01, 0xd8, 0xd9) or 0xd0 <= marker <= 0xd7:
                continue
            size = int.from_bytes(data[position:position+2], 'big')
            if size < 2:
                break
            segment = data[position+2:position+size]
            if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf) and len(segment) >= 5:
                return 'image/jpeg', int.from_bytes(segment[3:5], 'big'), int.from_bytes(segment[1:3], 'big')
            position += size
    return None


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.lang = ''
        self.metas = {}
        self.links = []
        self.anchors = []
        self.headings = []
        self.titles = []
        self.jsonld = []
        self.scripts = []
        self.script_attrs = {}
        self.redirects = []
        self.capture = None
        self.buffer = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs.get('lang', '')
        if tag == 'link':
            self.links.append(attrs)
        if tag == 'a' and attrs.get('href'):
            self.anchors.append(attrs['href'])
        if tag == 'meta':
            key = attrs.get('name', attrs.get('property', '')).lower()
            if key:
                self.metas.setdefault(key, []).append(attrs.get('content', ''))
            if attrs.get('http-equiv', '').lower() == 'refresh':
                match = re.search(r'url\s*=\s*(.*)', attrs.get('content', ''), re.I)
                if match:
                    self.redirects.append(match[1].strip().strip('"\''))
        if tag in ('h1', 'title', 'script'):
            self.capture, self.buffer = tag, []
            if tag == 'script':
                self.script_attrs = attrs
        if tag == 'br' and self.capture:
            self.buffer.append(' ')

    def handle_endtag(self, tag):
        if tag == self.capture:
            value = ' '.join(''.join(self.buffer).split())
            if tag == 'h1':
                self.headings.append(value)
            elif tag == 'title':
                self.titles.append(value)
            elif self.script_attrs.get('type', '').lower() == 'application/ld+json':
                self.jsonld.append(''.join(self.buffer))
            else:
                self.scripts.append((self.script_attrs, ''.join(self.buffer)))
            self.capture, self.buffer = None, []

    def handle_data(self, data):
        if self.capture:
            self.buffer.append(data)

    def meta(self, key):
        values = self.metas.get(key, [])
        return values[0].strip() if values else ''

    def canonical_links(self):
        return [link.get('href', '') for link in self.links if 'canonical' in link.get('rel', '').split()]

    def alternates(self):
        return [(link.get('hreflang', ''), link.get('href', '')) for link in self.links
                if 'alternate' in link.get('rel', '').split() and link.get('hreflang')]


class Audit:
    def __init__(self, root):
        self.root = root.resolve()
        self.errors, self.warnings = [], []
        self.pages, self.schemas = {}, {}
        self.expected = {canonical(lang, route): (lang, route) for lang in LOCALES for route in ROUTES}

    def check(self, condition, message):
        if not condition:
            self.errors.append(message)
        return bool(condition)

    def local_path(self, url):
        parsed = urlsplit(url)
        if parsed.scheme != 'https' or parsed.netloc != 'studiomonjo.com':
            return None
        relative = Path(unquote(parsed.path).lstrip('/'))
        if '..' in relative.parts:
            return None
        path = self.root / relative
        return path / 'index.html' if parsed.path.endswith('/') or not relative.suffix else path

    def read_page(self, url):
        path = self.local_path(url)
        if not self.check(path is not None and path.is_file(), f'{url}: HTML file missing'):
            return None
        page = Page(path.read_text(encoding='utf-8'))
        self.pages[url] = page
        return page

    def check_meta(self, url, page):
        self.check(len(page.titles) == 1 and bool(page.titles[0]), f'{url}: needs one nonempty title')
        descriptions = page.metas.get('description', [])
        self.check(len(descriptions) == 1 and bool(descriptions[0].strip()), f'{url}: needs one nonempty description')
        # OG image/locale arrays and multiple verification tokens are legitimate.
        for key in ('og:site_name', 'og:title', 'og:description', 'og:type', 'og:url',
                    'twitter:card', 'twitter:title', 'twitter:description'):
            self.check(len(page.metas.get(key, [])) <= 1, f'{url}: duplicate {key} metadata')

    def check_og(self, url, page, expected_url):
        for key in ('og:site_name', 'og:title', 'og:description', 'og:type', 'og:url', 'og:image'):
            self.check(bool(page.meta(key)), f'{url}: missing {key}')
        self.check(page.meta('og:url') == expected_url, f'{url}: og:url differs from canonical')
        image = page.meta('og:image')
        path = self.local_path(image)
        if self.check(path is not None and path.is_file(), f'{url}: og:image must resolve to an existing local HTTPS image'):
            info = image_info(path)
            if info:
                mime, width, height = info
                for key, expected in (('og:image:type', mime), ('og:image:width', str(width)), ('og:image:height', str(height))):
                    if page.meta(key):
                        self.check(page.meta(key) == expected, f'{url}: {key} does not match image bytes')
                    else:
                        self.warnings.append(f'{url}: {key} is not declared')
            else:
                self.warnings.append(f'{url}: image dimensions could not be inspected with the standard library')
        if not page.meta('og:image:alt'):
            self.warnings.append(f'{url}: og:image:alt is not declared')
        for key in ('twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'):
            if not page.meta(key):
                self.warnings.append(f'{url}: {key} is not declared')
        if page.meta('twitter:image'):
            path = self.local_path(page.meta('twitter:image'))
            self.check(path is not None and path.is_file(), f'{url}: twitter:image is missing locally')

    def read_schema(self, url, page):
        documents = []
        for index, raw in enumerate(page.jsonld, 1):
            try:
                value = json.loads(raw)
            except json.JSONDecodeError as error:
                self.errors.append(f'{url}: JSON-LD block {index} is invalid: {error.msg}')
                continue
            if self.check(isinstance(value, (dict, list)), f'{url}: JSON-LD block {index} must be an object or array'):
                documents.append(value)
        graph = [node for document in documents for node in nodes(document)]
        self.schemas[url] = graph
        return graph

    def check_schema(self, url, page, locale, route):
        graph = self.read_schema(url, page)
        for kind in ('Organization', 'Person', 'WebSite'):
            self.check(any(kind in types(node) for node in graph), f'{url}: missing shared {kind} entity')
        webpages = [node for node in graph if types(node) & PAGE_TYPES and node.get('url') == url]
        self.check(bool(webpages), f'{url}: missing WebPage-family entity with canonical url')
        for node in webpages:
            self.check(bool(node.get('name')), f'{url}: WebPage entity has no name')
            self.check(bool(node.get('description')), f'{url}: WebPage entity has no description')
            languages = node.get('inLanguage', [])
            if isinstance(languages, str):
                languages = [languages]
            if not isinstance(languages, list):
                languages = []
            self.check(any(isinstance(lang, str) and lang.split('-')[0] == locale for lang in languages), f'{url}: WebPage inLanguage does not match page locale')
            self.check(bool(node.get('isPartOf')), f'{url}: WebPage is not linked to its WebSite')
        self.check(not any('Product' in types(node) or 'Offer' in types(node) or 'AggregateOffer' in types(node) for node in graph),
                   f'{url}: collection/site pages must not advertise Product/Offer structured data')
        breadcrumbs = [node for node in graph if 'BreadcrumbList' in types(node)]
        if route:
            self.check(bool(breadcrumbs), f'{url}: inner page needs breadcrumbs')
        for node in breadcrumbs:
            items = node.get('itemListElement', [])
            if not self.check(isinstance(items, list) and bool(items), f'{url}: breadcrumbs must contain a list'):
                continue
            positions = [item.get('position') for item in items if isinstance(item, dict)]
            self.check(positions == list(range(1, len(items) + 1)), f'{url}: breadcrumb positions must be sequential')
            for index, item in enumerate(items):
                if not self.check(isinstance(item, dict), f'{url}: breadcrumb item must be an object'):
                    continue
                self.check(bool(item.get('name')), f'{url}: breadcrumb item has no name')
                target = item.get('item')
                if isinstance(target, dict):
                    target = target.get('@id', target.get('url'))
                # Schema permits omission of the final crumb's item URL.
                if target:
                    target_page = target.split('#', 1)[0] if isinstance(target, str) else None
                    self.check(target_page in self.expected, f'{url}: breadcrumb targets a nonindexable URL')
                    if index == len(items) - 1:
                        self.check(target_page == url, f'{url}: last breadcrumb points elsewhere')

    def check_entities(self):
        definitions = {}
        for source_url, graph in self.schemas.items():
            for node in graph:
                if isinstance(node.get('@id'), str) and len(set(node) - {'@id', '@context'}) > 0:
                    definitions.setdefault(urljoin(source_url, node['@id']), []).append(node)
        for url, graph in self.schemas.items():
            for node in graph:
                identifier = node.get('@id')
                if not isinstance(identifier, str):
                    continue
                identifier = urljoin(url, identifier)
                if urlsplit(identifier).netloc != 'studiomonjo.com':
                    continue
                if identifier in definitions:
                    continue
                path = self.local_path(identifier)
                # A reference may identify an existing document directly. Local
                # fragment entity references must resolve to a declared node.
                self.check(not urlsplit(identifier).fragment and path is not None and path.is_file(),
                           f'{url}: unresolved local JSON-LD @id {identifier}')

    def check_sitemap_and_robots(self):
        sitemap = self.root / 'sitemap.xml'
        if not self.check(sitemap.is_file(), 'sitemap.xml is missing'):
            return
        try:
            tree = ET.fromstring(sitemap.read_text())
        except ET.ParseError as error:
            self.errors.append(f'sitemap.xml is invalid: {error}')
            return
        urls = []
        for entry in tree:
            locs = [node.text for node in entry if node.tag.rsplit('}', 1)[-1] == 'loc']
            if not self.check(len(locs) == 1 and bool(locs[0]), 'sitemap.xml: each entry needs one URL'):
                continue
            url = locs[0]
            urls.append(url)
            links = [(node.get('hreflang'), node.get('href')) for node in entry if node.get('hreflang')]
            if url in self.expected:
                self.check(dict(links) == alternate_urls(self.expected[url][1]) and len(links) == 4,
                           f'{url}: sitemap hreflang differs from page cluster')
            for node in entry:
                if node.tag.rsplit('}', 1)[-1] == 'lastmod' and node.text:
                    try:
                        datetime.datetime.fromisoformat(node.text.replace('Z', '+00:00'))
                    except ValueError:
                        self.errors.append(f'{url}: invalid sitemap lastmod')
        self.check(set(urls) == set(self.expected), 'sitemap.xml must contain exactly the 12 indexable locale URLs')
        self.check(len(urls) == len(set(urls)), 'sitemap.xml contains duplicate URLs')
        robots = self.root / 'robots.txt'
        if not self.check(robots.is_file(), 'robots.txt is missing'):
            return
        lines = robots.read_text().splitlines()
        declared = re.findall(r'^Sitemap:\s*(\S+)', '\n'.join(lines), re.M | re.I)
        self.check(BASE + '/sitemap.xml' in declared, 'robots.txt must declare the canonical sitemap')
        parser = RobotFileParser()
        parser.parse(lines)
        for agent in ('*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User'):
            blocked = [url for url in [BASE + '/', *self.expected] if not parser.can_fetch(agent, url)]
            self.check(not blocked, f'robots.txt blocks public pages for {agent}: {", ".join(blocked)}')

    def check_language_entry(self, url, page):
        robot_values = ','.join(page.metas.get('robots', []) + page.metas.get('googlebot', [])).lower()
        self.check(not {'noindex', 'none', 'nofollow'} & set(re.split(r'[\s,]+', robot_values)),
                   'Root language entry must remain crawlable without restrictive robots metadata')
        self.check(len(page.headings) == 1 and bool(page.headings[0]),
                   'Root language entry needs one nonempty fallback h1')
        graph = self.read_schema(url, page)
        for kind in ('Organization', 'Person', 'WebSite'):
            self.check(any(kind in types(node) for node in graph), f'{url}: missing shared {kind} entity')
        websites = [node for node in graph if 'WebSite' in types(node)]
        self.check(any(node.get('name') == 'Studio Monjo' and node.get('url') == BASE + '/' for node in websites),
                   'Root WebSite entity must declare the Studio Monjo name and domain-root URL')
        runtime = []
        for attrs, source in page.scripts:
            if attrs.get('type', '') not in ('', 'module', 'text/javascript', 'application/javascript'):
                continue
            if attrs.get('src'):
                path = self.local_path(urljoin(url, attrs['src']))
                if path is not None and path.is_file():
                    runtime.append(path.read_text(encoding='utf-8'))
            else:
                runtime.append(source)
        code = '\n'.join(runtime)
        self.check(bool(re.search(r'\blocation\.(?:(?:replace|assign)\s*\(|href\s*=)', code)),
                   'Root language entry has no executable locale redirect script')
        for locale in LOCALES:
            self.check(bool(re.search(r'["\']' + locale + r'/?["\']', code)),
                       f'Root locale redirect script does not declare the {locale} destination')

    def check_llms_and_privacy(self):
        privacy_files = [self.local_path(url) for url in self.pages]
        privacy_files += [path for directory in ('css', 'js') for path in (self.root / directory).rglob('*') if path.is_file()]
        privacy_files += [self.root / name for name in ('robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt')]
        for name in ('llms.txt', 'llms-full.txt'):
            path = self.root / name
            if not self.check(path.is_file(), f'{name} is missing'):
                continue
            text = path.read_text(encoding='utf-8')
            self.check(bool(re.search(r'^#\s+.+', text, re.M)), f'{name}: needs a Markdown title')
            urls = re.findall(r'https?://[^\s<>\)\]\"\']+', text)
            local_urls = [url.rstrip('.,;') for url in urls if urlsplit(url).netloc == 'studiomonjo.com']
            self.check(bool(local_urls), f'{name}: no links to canonical site content')
            for url in local_urls:
                path = self.local_path(url)
                self.check(path is not None and path.is_file(), f'{name}: link target missing: {url}')
                self.check('/workshops/' not in url, f'{name}: links to a retired workshop route')
        for path in privacy_files:
            if path is None or not path.is_file():
                continue
            text = decoded(path.read_text(encoding='utf-8'))
            self.check(not EMAIL.search(text) and 'mailto:' not in text.lower(),
                       f'{path.relative_to(self.root)}: email address or mailto link is publicly exposed')

    def run(self):
        for url, (locale, route) in self.expected.items():
            page = self.read_page(url)
            if page is None:
                continue
            self.check_meta(url, page)
            self.check(page.lang == locale, f'{url}: html lang must be {locale}')
            self.check(page.canonical_links() == [url], f'{url}: canonical must point to itself exactly once')
            alternate_pairs = page.alternates()
            self.check(len(alternate_pairs) == 4 and dict(alternate_pairs) == alternate_urls(route), f'{url}: hreflang must match its en/fr/ko/x-default cluster')
            self.check(len(page.headings) == 1 and bool(page.headings[0]), f'{url}: needs exactly one nonempty h1')
            robot_values = ','.join(page.metas.get('robots', []) + page.metas.get('googlebot', [])).lower()
            self.check(not {'noindex', 'none', 'nofollow'} & set(re.split(r'[\s,]+', robot_values)), f'{url}: indexable page has restrictive robots metadata')
            self.check(not page.redirects, f'{url}: indexable page unexpectedly redirects')
            self.check_og(url, page, url)
            self.check_schema(url, page, locale, route)
        for locale in LOCALES:
            url = canonical(locale, 'workshops')
            page = self.read_page(url)
            if page is None:
                continue
            target = canonical(locale, 'about')
            self.check('noindex' in page.meta('robots').lower(), f'{url}: retired route must be noindex')
            self.check(page.canonical_links() == [target], f'{url}: retired canonical must point to locale About page')
            self.check(len(page.redirects) == 1 and urljoin(url, page.redirects[0]) == target, f'{url}: retired route must redirect to locale About page')
            self.check(target in {urljoin(url, link) for link in page.anchors}, f'{url}: redirect needs a usable fallback link')
        root_url = BASE + '/'
        page = self.read_page(root_url)
        if page:
            self.check_meta(root_url, page)
            self.check_language_entry(root_url, page)
            self.check(page.canonical_links() == [canonical('en')], 'Root language entry canonical must point to English home')
            self.check(len(page.alternates()) == 4 and dict(page.alternates()) == alternate_urls(''), 'Root language entry needs the home hreflang cluster')
            anchors = {urljoin(root_url, link) for link in page.anchors}
            self.check(all(canonical(lang) in anchors for lang in LOCALES), 'Root language entry needs visible fallback links for all three languages')
            self.check(any(urljoin(root_url, target) == canonical('en') for target in page.redirects), 'Root language entry needs a no-JavaScript English fallback redirect')
            self.check_og(root_url, page, canonical('en'))
        for key, get_value in [('title', lambda page: page.titles[0] if page.titles else ''), ('description', lambda page: page.meta('description'))]:
            for locale in LOCALES:
                values = [get_value(self.pages[url]) for url, pair in self.expected.items() if pair[0] == locale and url in self.pages]
                self.check(len(values) == len(set(values)), f'{locale}: indexable pages need distinct {key}s')
        self.check_entities()
        self.check_sitemap_and_robots()
        self.check_llms_and_privacy()
        return {'indexable_pages': len(set(self.pages) & set(self.expected)),
                'redirect_pages': len(set(self.pages) - set(self.expected)),
                'jsonld_documents': sum(len(page.jsonld) for page in self.pages.values()),
                'errors': sorted(set(self.errors)), 'warnings': sorted(set(self.warnings))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--json', action='store_true', help='Emit a machine-readable report.')
    args = parser.parse_args()
    try:
        report = Audit(args.root).run()
    except (OSError, UnicodeError) as error:
        print(f'SEO check could not finish: {error}', file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f'SEO check: {report["indexable_pages"]} indexable pages, {report["redirect_pages"]} language/retired entries, '
              f'{report["jsonld_documents"]} JSON-LD blocks; {len(report["errors"])} errors, {len(report["warnings"])} warnings.')
        for level in ('errors', 'warnings'):
            for message in report[level]:
                print(f'{level[:-1].upper()}: {message}')
        if not report['errors']:
            print('Passed crawl, metadata, structured-data, guide-link and email privacy checks.')
    return 1 if report['errors'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
