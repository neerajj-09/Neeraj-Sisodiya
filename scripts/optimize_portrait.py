"""One-off: optimize the portrait photo for the hero avatar card."""
import os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img", "portrait-src.jpg")
DST = os.path.join(ROOT, "assets", "img", "portrait.jpg")

im = Image.open(SRC)
print("original:", im.size, im.mode)
im = ImageOps.exif_transpose(im)
# 10:11 card ratio; bias the crop upward so the face stays in frame
im = ImageOps.fit(im, (640, 704), Image.LANCZOS, centering=(0.5, 0.35))
im.save(DST, quality=86, optimize=True, progressive=True)
print("saved:", im.size, os.path.getsize(DST), "bytes")
os.remove(SRC)
print("removed source copy")
