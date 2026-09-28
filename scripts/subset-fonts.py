#!/usr/bin/env python3
"""Regenerate the small WOFF2 fonts after copy changes: Nanum Pen Script, Gowun Batang, Gowun Dodum.

Requires fonttools[woff] (fontTools and brotli). Never changes the original fonts in assets/fonts/.
Run after scripts/build-studio.py, because the characters are read from the built pages.

Each font becomes three files, chosen by the page's @font-face unicode ranges:
  *-latin.woff2        every non-Korean character the site uses, plus Latin-1 for small edits;
  *-hangul.woff2       every Korean syllable on the Korean pages, loaded by /ko/ pages;
  *-hangul-core.woff2  only the few Korean words the English and French pages show.
subset-coverage.json records what each file covers, so the build can warn when copy outgrows it.
"""
from pathlib import Path
import json
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'assets' / 'fonts'
SOURCES = {'nanum-pen': 'NanumPenScript-Regular.ttf', 'gowun-batang': 'GowunBatang-Regular.ttf', 'gowun-dodum': 'GowunDodum-Regular.ttf'}


# Nanum Pen Script has no accented Latin letters. Robey's French letters and the pen captions need them,
# so they are drawn from the font's own strokes: its grave accent (mirrored for the acute), circumflex,
# full stops and comma. The original font file is left untouched.
# accent recipes: (source glyph, scale, mirror)
ACCENTS = {'grave': ('grave', .72, False), 'acute': ('grave', .72, True), 'circumflex': ('asciicircum', .5, False)}
LETTERS = {  # character: (base, mark)
    'à': ('a', 'grave'), 'â': ('a', 'circumflex'), 'ä': ('a', 'dieresis'), 'ç': ('c', 'cedilla'),
    'è': ('e', 'grave'), 'é': ('e', 'acute'), 'ê': ('e', 'circumflex'), 'ë': ('e', 'dieresis'),
    'î': ('i', 'circumflex'), 'ï': ('i', 'dieresis'), 'ô': ('o', 'circumflex'), 'ö': ('o', 'dieresis'),
    'ù': ('u', 'grave'), 'û': ('u', 'circumflex'), 'ü': ('u', 'dieresis'), 'ÿ': ('y', 'dieresis'),
    'À': ('A', 'grave'), 'Â': ('A', 'circumflex'), 'Ç': ('C', 'cedilla'), 'È': ('E', 'grave'), 'É': ('E', 'acute'),
    'Ê': ('E', 'circumflex'), 'Ë': ('E', 'dieresis'), 'Î': ('I', 'circumflex'), 'Ï': ('I', 'dieresis'),
    'Ô': ('O', 'circumflex'), 'Ù': ('U', 'grave'), 'Û': ('U', 'circumflex'), 'Ü': ('U', 'dieresis'),
}

def bounds(gs, name, transform=(1, 0, 0, 1, 0, 0)):
    pen = BoundsPen(gs)
    gs[name].draw(TransformPen(pen, transform))
    return pen.bounds

def add_pen_accents(font):
    gs = font.getGlyphSet(); cmap = font.getBestCmap(); glyf = font['glyf']; hmtx = font['hmtx']
    name_of = lambda ch: cmap[ord(ch)]
    made = {}
    def put(char, parts, advance):
        pen = TTGlyphPen(gs)
        for glyph, transform in parts:
            gs[glyph].draw(TransformPen(pen, transform))
        new = pen.glyph()
        name = 'uni%04X' % ord(char)
        glyf[name] = new
        new.recalcBounds(glyf)
        hmtx[name] = (advance, getattr(new, 'xMin', 0))
        made[ord(char)] = name
    for char, (base, mark) in LETTERS.items():
        b = name_of(base); bx0, by0, bx1, by1 = bounds(gs, b); adv = hmtx[b][0]
        cx = (bx0 + bx1) / 2 + (bx1 - bx0) * .04          # the hand leans a little to the right
        cap = base.isupper()
        if mark in ACCENTS:
            src, s, mirror = ACCENTS[mark]; sx = -s if mirror else s
            ax0, ay0, ax1, ay1 = bounds(gs, name_of({'grave': '`', 'asciicircum': '^'}[src]), (sx, 0, 0, s, 0, 0))
            top = by1 + (34 if cap else 26)
            if base in 'iI':
                top = by1 + 18
            t = (sx, 0, 0, s, cx - (ax0 + ax1) / 2, top - ay0)
            put(char, [(b, (1, 0, 0, 1, 0, 0)), (name_of({'grave': '`', 'asciicircum': '^'}[src]), t)], adv)
        elif mark == 'dieresis':
            s = .62; p = name_of('.'); px0, py0, px1, py1 = bounds(gs, p, (s, 0, 0, s, 0, 0)); w = px1 - px0
            top = by1 + (40 if cap else 34); gap = max(46, (bx1 - bx0) * .28)
            parts = [(b, (1, 0, 0, 1, 0, 0))]
            for k in (-1, 1):
                parts.append((p, (s, 0, 0, s, cx + k * gap / 2 - w / 2 - px0, top - py0)))
            put(char, parts, adv)
        elif mark == 'cedilla':
            s = 1.0; c = name_of(','); cx0, cy0, cx1, cy1 = bounds(gs, c, (s, 0, 0, s, 0, 0))
            t = (s, 0, 0, s, cx - (cx0 + cx1) / 2 - 8, by0 + 22 - cy1)
            put(char, [(b, (1, 0, 0, 1, 0, 0)), (c, t)], adv)
    # the ellipsis: three of its own full stops, a little closer than when typed
    p = name_of('.'); padv = hmtx[p][0]; step = padv * .78
    put('…', [(p, (1, 0, 0, 1, k * step, 0)) for k in range(3)], int(step * 2 + padv))
    # the middle dot of the captions: a full stop lifted to the middle of the letters
    x0, y0, x1, y1 = bounds(gs, name_of('x'))
    put('·', [(p, (1, 0, 0, 1, 0, (y0 + y1) / 2 - 147))], padv)
    # œ: the o and the e written together
    o, ee = name_of('o'), name_of('e')
    put('œ', [(o, (1, 0, 0, 1, 0, 0)), (ee, (1, 0, 0, 1, hmtx[o][0] - 44, 0))], hmtx[o][0] - 44 + hmtx[ee][0])
    space = name_of(' ')
    made[0xA0] = space; made[0x202F] = space
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap.update({code: name for code, name in made.items() if code <= 0xFFFF or table.format in (12, 13)})
    font.setGlyphOrder(glyf.glyphOrder)
    return made


def korean(char):
    code = ord(char)
    return 0x1100 <= code <= 0x11FF or 0x3000 <= code <= 0x303F or 0x3130 <= code <= 0x318F or 0xAC00 <= code <= 0xD7A3 or 0xFF00 <= code <= 0xFFEF


def text(*folders):
    return ''.join(path.read_text() for folder in folders for path in (ROOT / folder).rglob('*.html'))


shared = ''.join(path.read_text() for path in (ROOT / 'js').glob('*.js')) + (ROOT / 'content' / 'prompts.json').read_text()
english_french = text('en', 'fr') + (ROOT / '404.html').read_text() + shared
everything = english_french + text('ko') + ''.join(path.read_text() for path in (ROOT / 'content').glob('*.json'))
# Latin-1 and the site's typographic marks stay available, so a small edit never falls back to another font.
latin = {c for c in everything if not korean(c) and c >= ' '} | {chr(i) for i in range(32, 256)} | set('‘’“”–—…·₩€→↗↓×')
sets = {'latin': ''.join(sorted(latin)),
        'hangul': ''.join(sorted({c for c in everything if korean(c)})),
        'hangul-core': ''.join(sorted({c for c in english_french if korean(c)}))}

coverage = {}
for name, source in SOURCES.items():
    for part, chars in sets.items():
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = ['*']
        options.name_IDs = ['*']            # keep the copyright and SIL Open Font License notices
        options.notdef_outline = True
        font = TTFont(str(FONTS / source))
        if name == 'nanum-pen':
            add_pen_accents(font)
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=chars)
        subsetter.subset(font)
        covered = set(chr(code) for code in font.getBestCmap())
        dest = FONTS / f'{name}-{part}.woff2'
        subset.save_font(font, str(dest), options)
        coverage[f'{name}-{part}'] = ''.join(sorted(covered))
        missing = ''.join(sorted(set(chars) - covered - set(' \n\t')))
        print(f'{dest.name}: {dest.stat().st_size:,} bytes, {len(covered)} characters'
              + (f'; not in {source}: {missing[:60]}' if missing and part != 'latin' else ''))
(FONTS / 'subset-coverage.json').write_text(json.dumps(coverage, ensure_ascii=False, indent=1) + '\n')
