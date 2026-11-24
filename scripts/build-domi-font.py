"""Build the offline cute font. Requires fonttools[woff] and brotli.

Source: https://github.com/google/fonts/tree/main/ofl/zcoolkuaile
License: SIL OFL 1.1, retained with the generated stylesheet.
"""
import base64
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'font-sources'
APP = ROOT / 'miniprogram'

# GB2312 level-one common characters plus every character used by the app.
# Less common user-entered characters retain the system font as a fallback.
chars = {chr(n) for n in range(32, 127)}
chars.update(chr(n) for n in range(0x3000, 0x3040))
for high in range(0xB0, 0xD8):
    for low in range(0xA1, 0xFF):
        try:
            chars.update(bytes([high, low]).decode('gb2312'))
        except UnicodeDecodeError:
            pass
for source_file in APP.rglob('*'):
    if source_file.suffix in {'.js', '.json', '.wxml', '.wxss'} and source_file.name != 'cute-font.wxss':
        chars.update(source_file.read_text(encoding='utf-8-sig'))

font = TTFont(SOURCE / 'ZCOOLKuaiLe-Regular.ttf')
options = subset.Options()
options.flavor = 'woff2'
builder = subset.Subsetter(options=options)
builder.populate(text=''.join(sorted(chars)))
builder.subset(font)
font.flavor = 'woff2'
from io import BytesIO
buffer = BytesIO()
font.save(buffer)
encoded = base64.b64encode(buffer.getvalue()).decode('ascii')
styles = APP / 'styles'
styles.mkdir(exist_ok=True)
css = ('/* ZCOOL KuaiLe subset, SIL OFL 1.1. See FONT-LICENSE.txt. */\n'
       '@font-face { font-family: "DomiCute"; font-style: normal; font-weight: 400; '
       f'src: url("data:font/woff2;base64,{encoded}") format("woff2"); font-display: swap; }}\n')
(styles / 'cute-font.wxss').write_text(css, encoding='utf-8')
(styles / 'FONT-LICENSE.txt').write_text((SOURCE / 'OFL.txt').read_text(encoding='utf-8'), encoding='utf-8')
print(f'Built offline cute font: {len(font.getBestCmap())} characters, {len(buffer.getvalue())} font bytes')
