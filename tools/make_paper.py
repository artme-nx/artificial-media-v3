"""Tekstura papira za scenarij (img/paper.png): 256×256, ponavlja se bez šava.
Sitno zrno + blaga oblačnost papira, kao prozirni sloj preko boje pozadine (--bg)."""
import numpy as np
from PIL import Image, ImageFilter
N = 256; rng = np.random.default_rng(11)
def tile_blur(a, r):          # zamućenje koje se nastavlja preko rubova (bez šava)
    big = np.tile(a, (3, 3)); im = Image.fromarray(((big - big.min()) / (np.ptp(big) + 1e-9) * 255).astype(np.uint8))
    im = im.filter(ImageFilter.GaussianBlur(r)); b = np.asarray(im, np.float32) / 255.0
    return b[N:2 * N, N:2 * N]
grain = rng.normal(0, 1, (N, N))                       # zrno
cloud = tile_blur(rng.normal(0, 1, (N, N)), 18) - 0.5    # oblačnost
fiber = tile_blur(rng.normal(0, 1, (N, N)), 1.2) - 0.5   # vlakna
v = grain * 0.55 + fiber * 2.2 + cloud * 3.0
v = (v - v.mean()) / v.std()
dark = np.clip(v, 0, None); light = np.clip(-v, 0, None)
rgba = np.zeros((N, N, 4), np.float32)
# tamna mjesta: topla smeđe-siva; svijetla: topla bijela; prozirnost mala
a_d = np.clip(dark * 0.035, 0, 0.12); a_l = np.clip(light * 0.03, 0, 0.10)
use_dark = a_d >= a_l
rgba[..., 0] = np.where(use_dark, 70, 255); rgba[..., 1] = np.where(use_dark, 60, 252); rgba[..., 2] = np.where(use_dark, 45, 245)
rgba[..., 3] = np.where(use_dark, a_d, a_l) * 255
Image.fromarray(rgba.astype(np.uint8), "RGBA").save("img/paper.png", optimize=True)
print("ok")
