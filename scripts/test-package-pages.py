#!/usr/bin/env python3
"""Regression checks for shop media and the public deployment boundary."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest


SPEC = importlib.util.spec_from_file_location('package_pages', Path(__file__).with_name('package-pages.py'))
PAGES = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PAGES)


def gif_fixture(extensions=b'', local_palette=False):
    """A 7x1 GIF with a real LZW stream containing an email-like byte sequence.

    A 128-color table uses 8-bit initial codes: clear=128, seven literal
    pixel indices spelling F@W.rhU, and end=129. No code-size change occurs.
    The palette also deliberately contains an email-like byte sequence.
    """
    dimensions = b'\x07\x00\x01\x00'
    palette = b'F@W.rhU' + bytes(128 * 3 - 7)
    screen = dimensions + (b'\x00' if local_palette else b'\x86') + b'\x00\x00'
    descriptor = b',' + bytes(4) + dimensions + (b'\x86' if local_palette else b'\x00')
    pixels = b'\x07\x09\x80F@W.rhU\x81\x00'
    return (b'GIF89a' + screen + (b'' if local_palette else palette) + extensions
            + descriptor + (palette if local_palette else b'') + pixels + b';')


def gif_subblocks(*parts):
    return b''.join(bytes([len(part)]) + part for part in parts) + b'\x00'


class PackagePagesTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'site'
        self.output = Path(self.temp.name) / 'artifact'
        for name in PAGES.ROOT_FILES - {'.nojekyll'}:
            self.write(name, '<html></html>' if name.endswith('.html') else '')
        self.write('CNAME', 'studiomonjo.com\n')
        self.write('sitemap.xml', '<urlset/>')
        for locale in PAGES.LOCALES:
            for route in PAGES.ROUTES:
                self.write(str(Path(locale, route, 'index.html')), '<html></html>')
        self.shop_asset = 'media/web/naver/shop-only.jpg'
        self.write(self.shop_asset, b'JPEG fixture without private metadata')
        self.write_manifest()

    def write(self, name, data):
        target = self.root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data.encode() if isinstance(data, str) else data)
        return target

    def write_manifest(self, data=None):
        if data is None:
            data = {'description': 'Naver shop dependencies', 'assets': [self.shop_asset],
                    'source': 'Optional audit metadata is supported'}
        return self.write(str(PAGES.NAVER_MANIFEST), json.dumps(data))

    def package(self):
        with contextlib.redirect_stdout(io.StringIO()):
            PAGES.package(self.root, self.output)

    def test_shop_only_media_is_published_and_private_files_stay_excluded(self):
        private_files = ('private/customers.csv', '.env', 'media/web/.private.jpg',
                         'media/web/unreferenced.jpg', 'content/naver-source.html')
        for name in private_files:
            self.write(name, 'private-person@example.com')
        self.package()
        self.assertEqual((self.output / self.shop_asset).read_bytes(),
                         (self.root / self.shop_asset).read_bytes())
        self.assertTrue((self.output / '.nojekyll').is_file())
        for name in (*private_files, str(PAGES.NAVER_MANIFEST)):
            self.assertFalse((self.output / name).exists(), name)

    def test_missing_manifest_fails(self):
        (self.root / PAGES.NAVER_MANIFEST).unlink()
        with self.assertRaisesRegex(ValueError, 'Missing required Naver media manifest'):
            self.package()
        self.assertFalse(self.output.exists())

    def test_missing_shop_asset_fails_without_replacing_previous_artifact(self):
        self.package()
        previous_asset = (self.output / self.shop_asset).read_bytes()
        (self.root / self.shop_asset).unlink()
        with self.assertRaisesRegex(ValueError, 'Missing public file: media/web/naver/shop-only.jpg'):
            self.package()
        self.assertEqual((self.output / self.shop_asset).read_bytes(), previous_asset)

    def test_invalid_manifest_structure_is_rejected(self):
        invalid = ([], {}, {'description': 1, 'assets': [self.shop_asset]},
                   {'description': 'Naver', 'assets': []},
                   {'description': 'Naver', 'assets': self.shop_asset},
                   {'description': 'Naver', 'assets': [None]},
                   {'description': 'Naver', 'assets': ['']},
                   {'description': 'Naver', 'assets': [self.shop_asset, self.shop_asset]})
        for data in invalid:
            with self.subTest(data=data):
                self.write_manifest(data)
                with self.assertRaises(ValueError):
                    self.package()
        self.assertFalse(self.output.exists())

    def test_malformed_json_is_rejected(self):
        self.write(str(PAGES.NAVER_MANIFEST), '{"assets":')
        with self.assertRaises(json.JSONDecodeError):
            self.package()

    def test_unsafe_and_noncanonical_paths_are_rejected(self):
        invalid = ('https://example.com/image.jpg', '//example.com/image.jpg',
                   '/media/web/image.jpg', '../media/web/image.jpg',
                   'media/web/../../../private.jpg', 'media/web/./image.jpg',
                   'media//web/image.jpg', 'media/web/image.jpg/',
                   'media/web/%2e%2e/private.jpg', 'media/web/image%20name.jpg',
                   'media\\web\\image.jpg', 'media/web/image.jpg?download=1',
                   'media/web/image.jpg#anchor', 'media/web/image.jpg?',
                   'media/web/image.jpg#', 'media/web/line\nbreak.jpg',
                   'media/web/image.jpg ', 'media/web/.private/image.jpg',
                   'media/web/.private.jpg', 'private/image.jpg',
                   'media/web/customer.csv', 'media/web/script.js')
        for path in invalid:
            with self.subTest(path=path):
                self.write_manifest({'description': 'Naver', 'assets': [path]})
                with self.assertRaisesRegex(ValueError, 'unsafe or unsupported media path'):
                    self.package()
        self.assertFalse(self.output.exists())

    def test_shop_asset_symlinks_are_rejected(self):
        target = self.write('private/image.jpg', b'private image')
        (self.root / self.shop_asset).unlink()
        (self.root / self.shop_asset).symlink_to(target)
        with self.assertRaisesRegex(ValueError, 'Public file cannot be a symlink'):
            self.package()

    def test_shop_asset_parent_symlinks_are_rejected(self):
        target = self.write('private/images/image.jpg', b'private image')
        (self.root / 'media/web/linked').symlink_to(target.parent, target_is_directory=True)
        self.write_manifest({'description': 'Naver', 'assets': ['media/web/linked/image.jpg']})
        with self.assertRaisesRegex(ValueError, 'Public file cannot be a symlink'):
            self.package()

    def test_shop_media_still_gets_privacy_validation(self):
        self.write(self.shop_asset, b'JPEG metadata private-person@example.com')
        with self.assertRaisesRegex(ValueError, 'Email address or mailto link in public file'):
            self.package()
        self.assertFalse(self.output.exists())

    def use_gif(self, data):
        relative = 'media/web/naver/animation.gif'
        self.write(relative, data)
        self.write_manifest({'description': 'Naver', 'assets': [relative]})
        return relative

    def test_gif_pixel_and_palette_email_lookalikes_preserve_original_bytes(self):
        for local_palette in (False, True):
            with self.subTest(local_palette=local_palette):
                data = gif_fixture(local_palette=local_palette)
                self.assertIsNotNone(PAGES.EMAIL.search(data))
                relative = self.use_gif(data)
                self.package()
                self.assertEqual((self.output / relative).read_bytes(), data)

    def test_gif_metadata_emails_split_across_subblocks_are_rejected(self):
        text = gif_subblocks(b'private-person@', b'example.com')
        extensions = (
            b'\x21\xfe' + text,
            b'\x21\x01\x0c' + bytes(12) + text,
            b'\x21\xff\x0bPRIVATEMETA1' + text,
            b'\x21\xfe' + gif_subblocks(b'mail', b'to:contact'),
        )
        for extension in extensions:
            with self.subTest(extension=extension):
                self.use_gif(gif_fixture(extension))
                with self.assertRaisesRegex(ValueError, 'Email address or mailto link in public file'):
                    self.package()
        self.assertFalse(self.output.exists())

    def test_gif_graphics_control_and_application_extensions_are_supported(self):
        extensions = (b'\x21\xf9\x04\x00\x05\x00\x00\x00'
                      b'\x21\xff\x0bNETSCAPE2.0\x03\x01\x00\x00\x00')
        data = gif_fixture(extensions)
        relative = self.use_gif(data)
        self.package()
        self.assertEqual((self.output / relative).read_bytes(), data)

    def test_malformed_gif_structure_fails_closed(self):
        valid = gif_fixture()
        invalid = (b'not a GIF', valid[:12], valid[:100], valid[:-1],
                   valid[:-4] + b';', valid + b'trailing metadata',
                   gif_fixture(b'\x21\xfe\xfftoo short'),
                   gif_fixture(b'\x21\xf9\x03abc\x00'),
                   gif_fixture(b'\x21\xf9\x04abcd\x01'),
                   gif_fixture(b'\x21\xaa\x00'),
                   gif_fixture(b'\x21\xff\x0cNETSCAPE2.00\x00'),
                   valid[:-12] + b'\x01' + valid[-11:])
        for data in invalid:
            with self.subTest(data=data[:20], length=len(data)):
                self.use_gif(data)
                with self.assertRaisesRegex(ValueError, 'Invalid GIF structure in public file'):
                    self.package()
        self.assertFalse(self.output.exists())


if __name__ == '__main__':
    unittest.main()
