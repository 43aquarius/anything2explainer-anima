#!/usr/bin/env python3
"""DuckDuckGo HTML search fallback: returns top organic results (title, url, snippet)."""
import sys, re, subprocess, html, urllib.parse

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def search(query, out):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    r = subprocess.run(["curl", "-sL", "-m", "30", "-A", UA, url], capture_output=True, text=True)
    doc = r.stdout
    results = []
    # DDG html results use class="result__a" for links, "result__snippet" for snippets
    links = re.findall(r'<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', doc, re.S)
    snips = re.findall(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', doc, re.S)
    for i, (href, title) in enumerate(links[:10]):
        # DDG wraps urls: //duckduckgo.com/l/?uddg=<encoded>
        m = re.search(r'uddg=([^&]+)', href)
        real = urllib.parse.unquote(m.group(1)) if m else href
        title = html.unescape(re.sub(r"<[^>]+>", "", title)).strip()
        snip = html.unescape(re.sub(r"<[^>]+>", "", snips[i])).strip() if i < len(snips) else ""
        results.append((title, real, snip))
    with open(out, "w") as f:
        for t, u, s in results:
            f.write(f"TITLE: {t}\nURL: {u}\nSNIPPET: {s}\n\n")
    print(f"[ddg] {len(results)} results for: {query}")
    for t, u, s in results[:5]:
        print(f"  - {t} :: {u}")

if __name__ == "__main__":
    search(sys.argv[1], sys.argv[2])
