#!/usr/bin/env python3
"""Cut and grade the walk's five films so they feel like one evening in the studio.

Needs ffmpeg, Python with numpy and Pillow, and on macOS `avconvert`, which tone-maps the iPhone's
HDR (HLG) clips to ordinary video. The originals live outside this repository: the studio's shared
drive (04 Media Library/Originals/Video) and Jordan's Desktop. Writes media/web/world/video/*.mp4 and
their posters. Run it only when a film changes; the results are committed like the fonts.

Every film is cropped to its window (4:5 for the studio steps, 9:16 for the night), played at 24 frames
a second, and loops with a soft crossfade. Each is first brought to the same warm paper white and the
same middle brightness, as far as its own light allows, then all share one look: lifted blacks, navy in
the shadows, warm highlights, calmer colour, a soft vignette and a fine grain.
"""
from pathlib import Path
import json
import shutil
import subprocess
import tempfile
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'media' / 'web' / 'world' / 'video'
DRIVE = Path('/Users/jmonnet/Library/CloudStorage/GoogleDrive-jordan@studiomonjo.com/Shared drives/'
             'Studio Monjo — Operations/04 Media Library/Originals/Video')
DESKTOP = Path('/Users/jmonnet/Desktop')

# name: source, [(start, end, speed)], crop w:h:x:y in the upright source, output size, loop crossfade,
# how far to correct its white balance (1 = fully to the shared paper white), its middle brightness
FILMS = {
    # the whole gesture: the sheet arrives, is aligned, folded, creased with the bone folder, lifted away
    'fold': dict(src=DESKTOP / 'Sequence 01_9.mp4', cuts=[(386.75, 403.75, 1.0)], crop='720:900:300:560',
                 size=(720, 900), loop=0.8, strength=0.9, mid=0.40),
    # thread drawn through the fold; the only spine-sewing footage, filmed at 10 frames a second
    'sew': dict(src=ROOT / 'media/web/video/binding-thread.mp4', cuts=[(0, 13, 1.0)], crop='364:456:28:0',
                size=(720, 900), loop=0.8, strength=0.55, mid=0.34, interpolate=True),
    # inking; the press, the lift at 13.3 s and the red mark on the last page, all at their real pace;
    # a dissolve while the mark shows on both sides of it (the lid goes back on); the notebook closed on its cover
    'stamp': dict(src=DRIVE / 'IMG_7610.mov', hdr=True, cuts=[(3.0, 5.4, 1.0), (8.4, 15.1, 1.0), (16.7, 21.9, 1.0)],
                  crop='1080:1350:0:280', size=(720, 900), loop=0.6, strength=0.9, mid=0.42),
    # Robey's letter cards laid on the walnut desk
    'letters': dict(src=DRIVE / 'A001_09032044_C003.mov', cuts=[(0.8, 14.8, 1.0)], crop='2160:2700:0:820',
                    size=(720, 900), loop=0.8, strength=0.55, mid=0.40),
    # Jordan drawing by candlelight: four moments joined softly, and it stays warmer than the others
    'paint': dict(src=DESKTOP / 'painting.mp4', cuts=[(1.5, 6.5, 1.0), (10, 18, 1.0), (40, 48, 1.0), (60.5, 67, 1.0)],
                  crop='920:1634:0:0', size=(720, 1280), loop=0.8, strength=0.0, mid=0.30),
}
JOIN = 0.6                      # crossfade between two cuts of the same film
WHITE = np.array([239, 231, 216]) / 255   # the paper white every film is brought towards
LOOK = ("curves=all='0/0.035 0.3/0.29 0.7/0.72 1/0.955',"
        "colorbalance=rs=-0.03:gs=-0.01:bs=0.04:rh=0.02:gh=0.01:bh=-0.03,"
        "eq=saturation=0.84,vignette=angle=0.32,noise=alls=4:allf=t")
ENCODE = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
          '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart']


def run(*args):
    subprocess.run([str(a) for a in args], check=True)


def duration(cuts):
    return sum((end - start) / speed for start, end, speed in cuts) - JOIN * (len(cuts) - 1)


def base(name, film, work):
    """The ungraded film: cuts joined with crossfades, cropped, at 24 frames a second, looping softly."""
    src = film['src']
    if film.get('hdr'):
        # the crop is given in this 1080 × 1920 tone-mapped copy
        sdr = work / f'{name}-sdr.mov'
        run('avconvert', '--source', src, '--preset', 'Preset1920x1080', '--output', sdr, '--replace')
        src = sdr
    w, h = film['size']
    # blended, not motion-estimated: estimation warps dark hands, blending reads as a soft motion blur
    motion = ',framerate=fps=24:interp_start=0:interp_end=255:scene=100' if film.get('interpolate') else ''
    parts, labels = [], []
    for i, (start, end, speed) in enumerate(film['cuts']):
        parts.append(f"[0:v]trim={start}:{end},setpts=(PTS-STARTPTS)/{speed},crop={film['crop']}{motion},"
                     f"scale={w}:{h}:flags=lanczos,fps=24,format=yuv420p[c{i}]")
        labels.append(f'c{i}')
    chain, length, last = parts, 0.0, labels[0]
    for i in range(1, len(labels)):
        start, end, speed = film['cuts'][i - 1]
        length += (end - start) / speed - (JOIN if i > 1 else 0)    # the joined film so far
        chain.append(f'[{last}][{labels[i]}]xfade=transition=fade:duration={JOIN}:offset={length - JOIN:.3f}[j{i}]')
        last = f'j{i}'
    total, f = duration(film['cuts']), film['loop']
    # A seamless loop: the film starts f seconds in, and its end dissolves into its own beginning.
    chain.append(f'[{last}]split[a][b];[a]trim=start={f},setpts=PTS-STARTPTS[tail];[b]trim=end={f},setpts=PTS-STARTPTS[head];'
                 f'[tail][head]xfade=transition=fade:duration={f}:offset={total - 2 * f:.3f}[out]')
    out = work / f'{name}-base.mp4'
    run('ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', ';'.join(chain), '-map', '[out]',
        '-an', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-pix_fmt', 'yuv420p', out)
    return out


def measure(path, work):
    """The film's paper white and middle brightness, from twelve frames."""
    frames = work / f'{path.stem}-frames'
    frames.mkdir(exist_ok=True)
    run('ffmpeg', '-v', 'error', '-y', '-i', path, '-vf', 'fps=12/10,scale=320:-2', frames / 'f%03d.png')
    px = np.concatenate([np.asarray(Image.open(p).convert('RGB'), dtype=float).reshape(-1, 3) / 255 for p in sorted(frames.glob('*.png'))])
    luma = px @ np.array([0.2126, 0.7152, 0.0722])
    lo, hi = np.percentile(luma, [96.5, 99.5])
    white = px[(luma >= lo) & (luma <= hi) & (px.max(axis=1) < 0.985)].mean(axis=0)
    return white, float(np.median(luma))


def correction(white, mid, film):
    gains = 1 + film['strength'] * (WHITE / np.maximum(white, 1e-3) - 1)
    gains = gains / max(1.0, gains.max() / 1.25)          # never push a channel far beyond its light
    new_mid = min(0.98, mid * float(gains @ np.array([0.2126, 0.7152, 0.0722])))
    gamma = float(np.clip(np.log(film['mid']) / np.log(max(new_mid, 1e-3)), 0.75, 1.35))
    return gains, gamma


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=OUT, help='where to write the films (default: the site)')
    parser.add_argument('names', nargs='*', help='films to render (default: all)')
    args = parser.parse_args()
    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)
    report = {}
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        for name, film in FILMS.items():
            if args.names and name not in args.names:
                continue
            b = base(name, film, work)
            white, mid = measure(b, work)
            gains, gamma = correction(white, mid, film)
            grade = (f'colorchannelmixer=rr={gains[0]:.4f}:gg={gains[1]:.4f}:bb={gains[2]:.4f},'
                     f'eq=gamma={1 / gamma:.4f},{LOOK},setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv')
            dest = out_dir / f'{name}.mp4'
            run('ffmpeg', '-v', 'error', '-y', '-i', b, '-vf', grade, *ENCODE, dest)
            run('ffmpeg', '-v', 'error', '-y', '-i', dest, '-frames:v', '1', '-q:v', '3', out_dir / f'{name}.jpg')
            report[name] = {'white_before': [round(v * 255) for v in white], 'mid_before': round(mid, 3),
                            'gains': [round(g, 3) for g in gains], 'gamma': round(gamma, 3),
                            'bytes': dest.stat().st_size}
            print(name, json.dumps(report[name]))


if __name__ == '__main__':
    main()
