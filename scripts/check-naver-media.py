#!/usr/bin/env python3
"""Verify that every protected Naver image is served with its original bytes."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='https://studiomonjo.com',
                        help='Public origin, or a local server serving the packaged _site directory.')
    args = parser.parse_args()
    assets = json.loads((ROOT / 'content/naver-media.json').read_text())['assets']

    def check(relative):
        url = args.base_url.rstrip('/') + '/' + relative
        request = Request(url, headers={
            'User-Agent': 'StudioMonjo-media-health-check/1.0',
            'Referer': 'https://smartstore.naver.com/studiomonjo',
        })
        try:
            expected = (ROOT / relative).read_bytes()
            with urlopen(request, timeout=30) as response:
                content_type = response.headers.get_content_type()
                # Bound the response and reject HTML error pages, truncated files,
                # redirects to unrelated content, or an outdated image version.
                actual = response.read(len(expected) + 1)
                if response.status != 200:
                    return f'{relative}: HTTP {response.status}'
                if not content_type.startswith(('image/', 'video/', 'audio/')):
                    return f'{relative}: unexpected content type {content_type}'
                if hashlib.sha256(actual).digest() != hashlib.sha256(expected).digest():
                    return f'{relative}: served bytes differ from the repository asset'
        except (HTTPError, URLError, OSError) as error:
            return f'{relative}: {error}'
        return None

    with ThreadPoolExecutor(max_workers=8) as pool:
        failures = [error for error in pool.map(check, assets) if error]
    if failures:
        print('\n'.join(failures), file=sys.stderr)
        print(f'Naver media check failed: {len(failures)} of {len(assets)} assets.', file=sys.stderr)
        return 1
    print(f'Verified {len(assets)} Naver media URLs: HTTP 200, media content types, '
          f'and exact original bytes at {args.base_url}.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
