#!/usr/bin/env python3
"""Oznaka verzije na lokalnim CSS i JS poveznicama (brand/44 C), da preglednici nakon objave ne drže stari CSS i JS.

Pokretanje iz korijena stranice, pri svakoj objavi:
    python3 tools/set_version.py              # današnji datum: 2026-11-13-1, isti dan ponovno: 2026-11-13-2 ...
    python3 tools/set_version.py 2026-11-13-5 # točno ta oznaka

Mijenja svako href="….css" i src="….js" u HTML stranicama (bez qa/) u href="….css?v=<oznaka>".
Vanjske poveznice (https://, //) se ne diraju. Ispiše oznaku i broj promijenjenih poveznica po datoteci.
"""
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINK = re.compile(r'\b(href|src)="(?!https?:|//|data:)([^"?#]+\.(?:css|js))(?:\?v=([^"]*))?"')
SKIP = {"qa", ".git", "node_modules", ".playwright-mcp"}


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        if not SKIP.intersection(p.relative_to(ROOT).parts):
            yield p


def next_tag():
    today = datetime.date.today().isoformat()
    n = 0
    for p in pages():
        for m in LINK.finditer(p.read_text(encoding="utf-8")):
            old = m.group(3) or ""
            if old.startswith(today + "-") and old[len(today) + 1:].isdigit():
                n = max(n, int(old[len(today) + 1:]))
    return "%s-%d" % (today, n + 1)


def main():
    tag = sys.argv[1] if len(sys.argv) > 1 else next_tag()
    if not re.fullmatch(r"[\w.-]+", tag):
        sys.exit("oznaka smije imati samo slova, brojke, točku, crticu i _")
    total = 0
    for p in pages():
        s = p.read_text(encoding="utf-8")
        new, n = LINK.subn(lambda m: '%s="%s?v=%s"' % (m.group(1), m.group(2), tag), s)
        if new != s:
            p.write_text(new, encoding="utf-8")
        if n:
            total += n
            print("%3d  %s" % (n, p.relative_to(ROOT)))
    print("oznaka %s, %d poveznica" % (tag, total))


if __name__ == "__main__":
    main()
