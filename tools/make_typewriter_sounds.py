"""Zvukovi starog (mehaničkog) pisaćeg stroja, sintetizirani iz fizike udarca, bez tuđih snimaka.
Izlaz: js/typewriter-sounds.js (WAV-ovi kao base64, da radi i kad se index.html otvori ravno s diska).

Jedan udarac slova:
  0 ms      prst pritisne tipku (tihi klik)
  ~14 ms    slovna poluga udari u valjak: kratki prasak + tupi udarac gume/drva + metalno zvonjenje poluge
  ~45 ms    kočnica pomakne valjak za jedno mjesto (sitni metalni tik)
Razmak: nema udarca poluge, samo tupi pritisak i tik pomaka.
Povrat valjka: zupčasto čegrtanje dok valjak klizi, pa udarac na kraju.
Zvonce: kratko zvono na kraju posljednjeg reda."""
import io, os, wave, base64, json
import numpy as np

SR = 32000
rng = np.random.default_rng(2026)

def t_axis(dur): return np.arange(int(SR * dur)) / SR
def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc = (1 - a) * v + a * acc; y[i] = acc
    return y
def onepole_hp(x, fc): return x - onepole_lp(x, fc)
def band(x, lo, hi): return onepole_lp(onepole_hp(x, lo), hi)
def place(buf, sig, at):
    i = int(SR * at); n = min(len(sig), len(buf) - i)
    if n > 0: buf[i:i + n] += sig[:n]
def decay_noise(dur, tau, lo=None, hi=None):
    t = t_axis(dur); n = rng.normal(0, 1, len(t))
    if lo or hi: n = band(n, lo or 20, hi or SR / 2.2)
    n /= (np.abs(n).max() + 1e-9)
    return n * np.exp(-t / tau)
def modes(dur, freqs, amps, taus, jitter=0.04):
    t = t_axis(dur); out = np.zeros_like(t)
    for f, a, tau in zip(freqs, amps, taus):
        f *= 1 + rng.uniform(-jitter, jitter)
        out += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) * np.exp(-t / tau)
    att = np.clip(t / 0.0004, 0, 1)            # bez klika na početku
    return out * att
def transient(dur=0.004, tau=0.0007, amp=1.0, lo=300):
    return amp * decay_noise(dur, tau, lo=lo)

def key_strike(v):
    buf = np.zeros(int(SR * 0.2))
    place(buf, transient(0.006, 0.0012, 0.10, lo=2500), 0.0)                       # pritisak tipke
    hit = 0.014 + rng.uniform(-0.003, 0.003)
    place(buf, transient(0.006, 0.0006, 1.0, lo=400), hit)                         # prasak poluge o valjak
    place(buf, 0.55 * decay_noise(0.06, 0.010, lo=60, hi=520), hit)               # tupi udarac (guma valjka, drvo)
    place(buf, 0.18 * modes(0.05, [205], [1.0], [0.012], 0.08), hit)
    place(buf, 0.35 * decay_noise(0.04, 0.006, lo=700, hi=1700), hit)             # tijelo stroja
    base = [1180, 2310, 3470, 4890, 6120]
    place(buf, 0.28 * modes(0.08, [f * v for f in base], [0.35, 0.5, 0.3, 0.22, 0.12], [0.022, 0.016, 0.012, 0.008, 0.006]), hit)  # metal poluge (kratko, da ne zvoni)
    esc = hit + 0.031 + rng.uniform(-0.005, 0.006)
    place(buf, 0.16 * transient(0.004, 0.0005, 1.0, lo=1500), esc)               # kočnica pomaka
    place(buf, 0.14 * modes(0.03, [2650 * v, 4150 * v, 5750 * v], [1, 0.7, 0.4], [0.008, 0.006, 0.004]), esc)
    buf = onepole_lp(buf, 9500)
    return buf

def space_strike():
    buf = np.zeros(int(SR * 0.13))
    place(buf, transient(0.006, 0.0015, 0.12, lo=1500), 0.0)
    place(buf, 0.6 * decay_noise(0.07, 0.016, lo=50, hi=420), 0.006)             # široka tipka razmaka
    place(buf, 0.15 * modes(0.05, [150], [1.0], [0.014], 0.08), 0.006)
    esc = 0.028 + rng.uniform(-0.004, 0.004)
    place(buf, 0.22 * transient(0.004, 0.0005, 1.0, lo=1500), esc)
    place(buf, 0.18 * modes(0.03, [2650, 4150], [1, 0.6], [0.008, 0.006]), esc)
    return onepole_lp(buf, 8000)

def carriage_return():
    dur = 0.62; buf = np.zeros(int(SR * dur))
    t0 = 0.02; gaps = np.linspace(0.042, 0.022, 11)                              # zupci čegrtaljke, sve brže
    tt = t0
    for i, gp in enumerate(gaps):
        place(buf, 0.20 * transient(0.004, 0.0006, 1.0, lo=1800), tt)
        place(buf, 0.10 * modes(0.025, [3100, 4700], [1, 0.6], [0.006, 0.004], 0.06), tt)
        tt += gp
    slide = decay_noise(tt - t0, 10.0, lo=900, hi=3200) * 0.10                     # klizanje valjka
    env = np.sin(np.linspace(0, np.pi, len(slide))) ** 0.6
    place(buf, slide * env, t0)
    end = tt + 0.01                                                                # udarac na kraju
    place(buf, transient(0.008, 0.001, 0.9, lo=200), end)
    place(buf, 0.7 * decay_noise(0.08, 0.018, lo=50, hi=600), end)
    place(buf, 0.35 * modes(0.15, [980, 2210, 3390], [0.6, 0.45, 0.3], [0.06, 0.04, 0.025]), end)
    return onepole_lp(buf, 9000)

def bell():
    dur = 1.4; t = t_axis(dur)
    f0 = 2080
    out = modes(dur, [f0, f0 * 2.32, f0 * 4.25, f0 * 1.003], [1.0, 0.35, 0.15, 0.6], [0.55, 0.22, 0.09, 0.5], 0.0)
    buf = np.zeros(len(t)); buf += out
    place(buf, 0.35 * transient(0.006, 0.0008, 1.0, lo=2000), 0.0)
    return onepole_lp(buf, 10000)

def to_wav_b64(x, peak):
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(len(x), int(SR * 0.004)); x[-fade:] *= np.linspace(1, 0, fade)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    bio = io.BytesIO()
    with wave.open(bio, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    return base64.b64encode(bio.getvalue()).decode()

if __name__ == "__main__":
    keys = [to_wav_b64(key_strike(v), 0.9) for v in (0.97, 1.0, 1.03, 0.99, 1.02, 0.95)]
    spaces = [to_wav_b64(space_strike(), 0.7) for _ in range(2)]
    data = dict(key=keys, space=spaces, ret=to_wav_b64(carriage_return(), 0.75), bell=to_wav_b64(bell(), 0.45))
    os.makedirs("js", exist_ok=True)
    open(os.path.join("js", "typewriter-sounds.js"), "w").write(
        "/* Generirano: tools/make_typewriter_sounds.py (sintetizirani zvukovi pisaćeg stroja). Ne uređivati ručno. */\n"
        "window.AM_TW = " + json.dumps(data) + ";\n")
    print("ok", sum(len(v) for v in keys + spaces) + len(data["ret"]) + len(data["bell"]), "znakova base64")
