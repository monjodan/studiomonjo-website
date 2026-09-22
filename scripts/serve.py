#!/usr/bin/env python3
"""Local Studio Monjo preview: concurrent requests, no cache, video byte ranges."""
import argparse
import functools
import os
from pathlib import Path
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parents[1]


class PreviewHandler(SimpleHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(20)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        requested = self.headers.get('Range', '')
        path = Path(self.translate_path(self.path))
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested)
        # Full requests, directories and unsupported multi-ranges use the standard handler.
        if not match or not any(match.groups()) or not path.is_file():
            return super().send_head()
        try:
            source = path.open('rb')
        except OSError:
            self.send_error(404, 'File not found')
            return None
        stat = os.fstat(source.fileno())
        size = stat.st_size
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start >= size or start > end:
            source.close()
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(stat.st_mtime))
        self.end_headers()
        source.seek(start)
        self.byte_range = (start, end)
        return source

    def copyfile(self, source, output):
        try:
            if self.byte_range is None:
                return super().copyfile(source, output)
            remaining = self.byte_range[1] - self.byte_range[0] + 1
            while remaining:
                chunk = source.read(min(65536, remaining))
                if not chunk:
                    break
                output.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, TimeoutError):
            # Navigating away from a page or video is a normal browser disconnect.
            pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8794)
    args = parser.parse_args()
    handler = functools.partial(PreviewHandler, directory=str(ROOT))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        print(f'Studio Monjo: http://127.0.0.1:{args.port}/en/', flush=True)
        server.serve_forever()


if __name__ == '__main__':
    main()
