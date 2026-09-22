#!/usr/bin/env python3
"""Regenerate small variable WOFF2 fonts after adding new translated characters.
Requires fonttools[woff] (fontTools and brotli). Never changes original fonts.
"""
from pathlib import Path
from html.parser import HTMLParser
from fontTools import subset
ROOT = Path(__file__).resolve().parents[1]
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]
    def handle_data(self, text): self.parts.append(text)
parser=Text()
for lang in ('en','fr','ko'):
    for file in (ROOT/lang).rglob('*.html'): parser.feed(file.read_text())
text=''.join(parser.parts)+''.join(p.read_text() for p in (ROOT/'content').glob('*.json'))+''.join(chr(i) for i in range(32,255))+'₩→↗↓⌄×…–—'
for family in ('Serif','Sans'):
    options=subset.Options()
    options.flavor='woff2'
    options.layout_features=['*']
    source=ROOT/'assets/fonts'/f'Noto{family}KR-VariableFont_wght.ttf'
    dest=ROOT/'assets/fonts'/f'Studio{family}.woff2'
    font=subset.load_font(str(source),options)
    subsetter=subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font,str(dest),options)
    print(f'{dest.name}: {dest.stat().st_size:,} bytes')
