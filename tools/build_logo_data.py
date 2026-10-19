"""Iz obrisa pisma AM Puni (brand/05-logo/runda9-font/out/glyphs.json) radi js/logo-data.js za masku slova u heroju,
a iz fonts/AMPuni-Regular.woff radi css/ampuni-font.css (pismo ugrađeno u CSS, pa radi i kad se index.html otvori ravno s diska).
Pokretanje iz mape artificial-media-v3:  python3 tools/build_logo_data.py ../brand/05-logo/runda9-font/out/glyphs.json
Jedinice: visina velikog slova = 100, y prema dolje."""
import sys, os, json, re
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join("..", "brand", "05-logo", "runda9-font", "out", "glyphs.json")
J = json.load(open(src))
G, CH = J["glyphs"], J["chars"]
LEAD = 116.0
need = sorted(set("ARTIFICIALMEDIA"))
glyphs = {ch: dict(adv=G[CH[ch]]["adv"], d=G[CH[ch]]["d"]) for ch in need}

def xs(d): return [float(v) for v in re.findall(r"[ML](-?[\d.]+),", d)]

# sidro za zumiranje: sredina punog slova D u drugom redu (MEDIA)
x = 0.0
for ch in "MEDIA":
    if ch == "D":
        a, b = min(xs(glyphs["D"]["d"])), max(xs(glyphs["D"]["d"]))
        anchor = dict(x=round(x + a + (b - a) * 0.46, 2), y=LEAD + 50, halfW=round((b - a) * 0.46, 2), chamfer=24)
        break
    x += glyphs[ch]["adv"]
lines = ["ARTIFICIAL", "MEDIA"]
widths = [round(sum(glyphs[c]["adv"] for c in L), 2) for L in lines]
out = dict(lead=LEAD, lines=lines, widths=widths, anchor=anchor, glyphs=glyphs)
os.makedirs("js", exist_ok=True)
open(os.path.join("js", "logo-data.js"), "w").write(
    "/* Generirano: tools/build_logo_data.py iz pisma AM Puni. Ne uređivati ručno. */\nwindow.AM_LOGO = " + json.dumps(out, separators=(",", ":")) + ";\n")
import base64
from fontTools.ttLib import TTFont          # .woff se radi iz fonts/AMPuni-Regular.ttf
f = TTFont(os.path.join("fonts", "AMPuni-Regular.ttf")); f.flavor = "woff"; f.save(os.path.join("fonts", "AMPuni-Regular.woff"))
b64 = base64.b64encode(open(os.path.join("fonts", "AMPuni-Regular.woff"), "rb").read()).decode()
open(os.path.join("css", "ampuni-font.css"), "w").write(
    "/* Generirano: tools/build_logo_data.py. Pismo AM Puni ugrađeno, da radi i bez servera (file://). */\n"
    '@font-face{font-family:"AM Puni";src:url(data:font/woff;base64,' + b64 + ') format("woff");font-display:block}\n')
print("ok", widths, anchor)
