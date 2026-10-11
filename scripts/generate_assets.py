"""
Generates brand images for the portfolio — no external dependencies.

  assets/img/og.png               1200x630  (social sharing preview)
  assets/img/apple-touch-icon.png  180x180  (iOS home-screen icon)
  assets/img/favicon-32.png         32x32   (fallback favicon)

Run from the project root:  python scripts/generate_assets.py
"""

import zlib
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img"

# ---------------------------------------------------------------- PNG writer

def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, w: int, h: int, px: bytearray) -> None:
    raw = b"".join(
        b"\x00" + bytes(px[y * w * 4 : (y + 1) * w * 4]) for y in range(h)
    )
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", ihdr)
        + _chunk(b"IDAT", zlib.compress(raw, 9))
        + _chunk(b"IEND", b"")
    )
    print(f"  wrote {path.relative_to(ROOT)}  ({path.stat().st_size:,} bytes)")


class Canvas:
    """Tiny RGBA canvas with helpers for glows and pixel-bitmap text."""

    def __init__(self, w: int, h: int, bg=(10, 12, 18, 255)):
        self.w, self.h = w, h
        self.px = bytearray(bytes(bg) * (w * h))

    def _blend(self, i: int, r: int, g: int, b: int, a: float) -> None:
        p = self.px
        p[i] = int(p[i] * (1 - a) + r * a)
        p[i + 1] = int(p[i + 1] * (1 - a) + g * a)
        p[i + 2] = int(p[i + 2] * (1 - a) + b * a)
        p[i + 3] = 255

    def glow(self, cx, cy, radius, rgb, strength=0.5):
        import math
        for y in range(self.h):
            dy = y - cy
            for x in range(self.w):
                d = math.hypot(x - cx, y - cy) / radius
                if d < 1.6:
                    a = strength * math.exp(-4.5 * d * d)
                    if a > 0.004:
                        self._blend((y * self.w + x) * 4, *rgb, a)

    def dots(self, step=28, rgb=(255, 255, 255), alpha=0.045, margin=0):
        for y in range(margin, self.h, step):
            for x in range(margin, self.w, step):
                self._blend((y * self.w + x) * 4, *rgb, alpha)

    def bitmap(self, rows, x0, y0, scale, color_fn):
        for ry, row in enumerate(rows):
            for rx, cell in enumerate(row):
                if cell != "X":
                    continue
                for yy in range(scale):
                    y = y0 + ry * scale + yy
                    if not (0 <= y < self.h):
                        continue
                    for xx in range(scale):
                        x = x0 + rx * scale + xx
                        if 0 <= x < self.w:
                            r, g, b = color_fn(x, y)
                            self._blend((y * self.w + x) * 4, r, g, b, 1.0)

    def rect(self, x0, y0, w, h, color_fn, alpha=1.0):
        for y in range(y0, min(y0 + h, self.h)):
            for x in range(x0, min(x0 + w, self.w)):
                r, g, b = color_fn(x, y)
                self._blend((y * self.w + x) * 4, r, g, b, alpha)


# ---------------------------------------------------------------- letter art

N = [
    "X...X",
    "XX..X",
    "XX..X",
    "X.X.X",
    "X..XX",
    "X..XX",
    "X...X",
]
S = [
    ".XXXX",
    "X....",
    "X....",
    ".XXX.",
    "....X",
    "....X",
    "XXXX.",
]

VIOLET = (140, 110, 255)
BLUE = (86, 140, 255)
INK = (238, 241, 248)


def lerp(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def letters_canvas(w, h, scale, gap, color_fn):
    """Draw N + S centered; returns Canvas."""
    c = Canvas(w, h)
    glyph_w = 5 * scale
    total = glyph_w * 2 + gap
    x0 = (w - total) // 2
    y0 = (h - 7 * scale) // 2
    c.bitmap(N, x0, y0, scale, color_fn)
    c.bitmap(S, x0 + glyph_w + gap, y0, scale, color_fn)
    return c, x0, y0, total, 7 * scale


# ---------------------------------------------------------------- images

def make_og():
    w, h = 1200, 630
    c = Canvas(w, h, bg=(10, 12, 18, 255))
    c.glow(w * 0.78, h * 0.22, 460, VIOLET, 0.34)
    c.glow(w * 0.12, h * 0.9, 520, BLUE, 0.22)
    c.dots()

    scale, gap = 36, 34
    glyph_w, total = 5 * scale, 5 * scale * 2 + gap
    x0 = (w - total) // 2
    y0 = (h - 7 * scale) // 2
    c.bitmap(N, x0, y0, scale, lambda x, y: INK)
    c.bitmap(S, x0 + glyph_w + gap, y0, scale, lambda x, y: INK)

    # accent underline bar with violet -> blue gradient
    bar_y = y0 + 7 * scale + 42
    c.rect(x0, bar_y, total, 7, lambda x, y: lerp(VIOLET, BLUE, x / max(total - 1, 1)))
    write_png(OUT / "og.png", w, h, c.px)


def make_touch_icon():
    w = h = 180
    scale, gap = 13, 12
    c, *_ = letters_canvas(
        w, h, scale, gap,
        lambda x, y: lerp(VIOLET, BLUE, (x + y) / (w + h)),
    )
    c.glow(w * 0.5, -60, 220, VIOLET, 0.35)
    # glow overwrites letters' alpha to 255 anyway; redraw letters last
    x0 = (w - (5 * scale * 2 + gap)) // 2
    y0 = (h - 7 * scale) // 2
    c.bitmap(N, x0, y0, scale, lambda x, y: lerp(VIOLET, BLUE, (x + y) / (w + h)))
    c.bitmap(S, x0 + 5 * scale + gap, y0, scale, lambda x, y: lerp(VIOLET, BLUE, (x + y) / (w + h)))
    write_png(OUT / "apple-touch-icon.png", w, h, c.px)


def make_favicon():
    w = h = 32
    scale, gap = 2, 2
    x0 = (w - (5 * scale * 2 + gap)) // 2
    y0 = (h - 7 * scale) // 2
    c = Canvas(w, h, bg=(0, 0, 0, 0))
    c.bitmap(N, x0, y0, scale, lambda x, y: INK)
    c.bitmap(S, x0 + 5 * scale + gap, y0, scale, lambda x, y: INK)
    write_png(OUT / "favicon-32.png", w, h, c.px)


if __name__ == "__main__":
    print("Generating brand assets…")
    make_og()
    make_touch_icon()
    make_favicon()
    print("Done.")
