#!/usr/bin/env python3
"""Fetch a URL with a browser-like UA and dump readable plain text."""
import sys, subprocess, re, html

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def main():
    url, outfile = sys.argv[1], sys.argv[2]
    r = subprocess.run(["curl", "-sL", "-m", "40", "-A", UA, url], capture_output=True, text=True)
    doc = r.stdout
    # strip scripts/styles
    doc = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", " ", doc, flags=re.I)
    # convert via pandoc
    p = subprocess.run(["pandoc", "-f", "html", "-t", "plain", "--wrap=none"],
                       input=doc, capture_output=True, text=True)
    text = p.stdout
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    with open(outfile, "w") as f:
        f.write(f"URL: {url}\n\n{text}\n")
    print(f"[ok] {url} -> {outfile} ({len(text)} chars)")

if __name__ == "__main__":
    main()
