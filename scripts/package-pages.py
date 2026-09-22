#!/usr/bin/env python3
"""Validate and package only the files needed by the custom-domain static site.

Run build-studio.py first. No dependencies beyond Python's standard library.
Runtime asset URLs belong in HTML/CSS or complete string literals in JavaScript
so their dependencies can be included and checked before deployment.
"""
from collections import deque
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import argparse
import os
import re
import shutil
import sys
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ('en', 'fr', 'ko')
ROUTES = ('', 'notebooks', 'about', 'company-editions', 'workshops')
ROOT_FILES = {'index.html', 'CNAME', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', '.nojekyll'}
MEDIA_TYPES = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif',
               '.ico', '.mp4', '.webm', '.mp3', '.ogg'}
CSS_URL = re.compile(r'url\(\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s)]+))\s*\)', re.I)
CSS_IMPORT = re.compile(r'@import\s+["\']([^"\']+)["\']', re.I)
JS_URL = re.compile(r'["\']((?:/|\./|\.\./|https?://)[^"\'\s]+)["\']')
EMAIL = re.compile(rb'[a-z0-9][a-z0-9.!#$%&\x27*+/=?^_`{|}~-]*@'
                   rb'(?:[a-z0-9][a-z0-9-]*\.)+[a-z]{2,63}\b', re.I)


def css_urls(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    return [next(value for value in match.groups() if value is not None)
            for match in CSS_URL.finditer(text)] + CSS_IMPORT.findall(text)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls = []
        self.ids = set()
        self.duplicates = []
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src', 'poster', 'data-product-image'):
            if attrs.get(key):
                self.urls.append(attrs[key])
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('name'):
            self.ids.add(attrs['name'])
        if attrs.get('srcset') and not attrs['srcset'].lstrip().startswith('data:'):
            self.urls.extend(part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip())
        if attrs.get('style'):
            self.urls.extend(css_urls(attrs['style']))
        if tag == 'style':
            self.in_style = True
        if tag == 'meta':
            key = attrs.get('property', attrs.get('name', ''))
            if key in ('og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'thumbnail'):
                self.urls.append(attrs.get('content', ''))
            if attrs.get('http-equiv', '').lower() == 'refresh':
                match = re.search(r'url\s*=\s*(.*)', attrs.get('content', ''), re.I)
                if match:
                    self.urls.append(match[1].strip().strip('"\''))

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.urls.extend(css_urls(data))


def allowed(path):
    parts = path.parts
    if path.as_posix() in ROOT_FILES:
        return True
    if any(part.startswith('.') for part in parts):
        return False
    if parts[0] in LOCALES:
        return path.suffix == '.html'
    if parts[0] in ('css', 'js'):
        return path.suffix == '.' + parts[0]
    if parts[:2] == ('assets', 'fonts'):
        return path.suffix in ('.woff', '.woff2', '.ttf', '.otf')
    return parts[:2] == ('media', 'web') and path.suffix.lower() in MEDIA_TYPES


def build_manifest(root):
    domain = (root / 'CNAME').read_text().strip()
    if domain != 'studiomonjo.com':
        raise ValueError('CNAME must retain the intended custom domain studiomonjo.com.')
    base = 'https://' + domain
    queue = deque(Path(name) for name in sorted(ROOT_FILES - {'.nojekyll'}))
    queue.extend(Path(locale, route, 'index.html') for locale in LOCALES for route in ROUTES)
    manifest, pages, links = {}, {}, []
    errors = []

    def add_url(source, url):
        if not url or url.startswith('data:'):
            return
        resolved = urlsplit(urljoin(base + '/' + source.as_posix(), unescape(url)))
        if resolved.scheme not in ('http', 'https') or resolved.netloc not in (domain, 'www.' + domain):
            return
        relative = Path(unquote(resolved.path).lstrip('/'))
        if '..' in relative.parts:
            errors.append(f'{source}: URL escapes the site root')
            return
        if resolved.path.endswith('/') or not relative.suffix:
            relative /= 'index.html'
        if not allowed(relative):
            errors.append(f'{source}: reference outside the public allowlist: {relative}')
            return
        queue.append(relative)
        links.append((source, relative, unquote(resolved.fragment)))

    while queue:
        relative = queue.popleft()
        if relative in manifest:
            continue
        source = root / relative
        if not allowed(relative):
            errors.append(f'Not allowed in public artifact: {relative}')
            continue
        if source.is_symlink() or any(p.is_symlink() for p in source.parents if p != root and root in p.parents):
            errors.append(f'Public file cannot be a symlink: {relative}')
            continue
        if not source.is_file():
            errors.append(f'Missing public file: {relative}')
            continue
        data = source.read_bytes()
        manifest[relative] = data
        # Inspect emitted bytes, including metadata inside binary assets. Checking
        # actual addresses leaves ordinary email form labels and field types valid.
        if EMAIL.search(data) or b'mailto:' in data.lower():
            errors.append(f'Email address or mailto link in public file: {relative}')
        if relative.suffix in ('.html', '.css', '.js', '.svg', '.xml', '.txt'):
            text = data.decode('utf-8')
            decoded = unquote(unescape(text))
            decoded = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m[1], 16)), decoded)
            if EMAIL.search(decoded.encode()) or 'mailto:' in decoded.lower():
                errors.append(f'Email address or mailto link in public text: {relative}')
            if relative.suffix == '.html':
                page = Page()
                page.feed(text)
                pages[relative] = page
                errors.extend(f'{relative}: duplicate id {value}' for value in page.duplicates)
                for url in page.urls:
                    add_url(relative, url)
            elif relative.suffix == '.css':
                for url in css_urls(text):
                    add_url(relative, url)
            elif relative.suffix == '.js':
                for url in JS_URL.findall(text):
                    # Do not mistake external service URLs or UI selector strings
                    # for local dependencies. Complete asset/route literals count.
                    if Path(urlsplit(url).path).suffix in MEDIA_TYPES | {'.css', '.js', '.html', '.woff', '.woff2', '.ttf', '.otf'}:
                        add_url(relative, url)
            elif relative.name == 'sitemap.xml':
                tree = ET.fromstring(text)
                for node in tree.iter():
                    if node.tag.rsplit('}', 1)[-1] == 'loc' and node.text:
                        add_url(relative, node.text)
                    if node.get('href'):
                        add_url(relative, node.get('href'))
            elif relative.name == 'robots.txt':
                for url in re.findall(r'^Sitemap:\s*(\S+)', text, re.M | re.I):
                    add_url(relative, url)

    for source, target, fragment in links:
        if fragment and target in pages and fragment not in pages[target].ids:
            errors.append(f'{source}: missing fragment {target}#{fragment}')
    if errors:
        raise ValueError('\n'.join(sorted(set(errors))))
    manifest[Path('.nojekyll')] = b''
    return manifest, len(pages), len(links)


def package(root, output):
    root, output = root.resolve(), output.resolve()
    if output == root or output in root.parents or (root in output.parents and output != root / '_site'):
        raise ValueError('Use the repository _site directory or an output directory outside the repository.')
    if output.exists() and any(output.iterdir()) and not (output / '.nojekyll').is_file():
        raise ValueError('Refusing to replace a nonempty output directory without a .nojekyll artifact marker.')
    manifest, page_count, link_count = build_manifest(root)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.monjo-pages-', dir=output.parent) as temp:
        staging = Path(temp) / '_site'
        staging.mkdir()
        for relative, data in sorted(manifest.items()):
            target = staging / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            target.chmod(0o644)
            os.utime(target, (0, 0))
        for directory in [staging, *(p for p in staging.rglob('*') if p.is_dir())]:
            directory.chmod(0o755)
            os.utime(directory, (0, 0))
        if output.exists():
            shutil.rmtree(output)
        staging.rename(output)
    total = sum(len(data) for data in manifest.values())
    print(f'Packaged {len(manifest)} files ({total / 1024 / 1024:.2f} MiB), '
          f'{page_count} HTML routes, {link_count} local references into {output}')
    print('Validated local files and anchors; no email addresses or mailto links in artifact.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_site')
    args = parser.parse_args()
    try:
        package(ROOT, args.output)
    except (ValueError, OSError, ET.ParseError) as error:
        print(f'Pages packaging failed:\n{error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
