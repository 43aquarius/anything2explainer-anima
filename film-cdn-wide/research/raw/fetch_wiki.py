#!/usr/bin/env python3
"""Fetch plain-text extracts of Wikipedia articles via the MediaWiki API.
Usage: python3 fetch_wiki.py "Title One" "Title Two" ...
Saves each article to raw/wiki-<slug>.txt and prints a short preview."""
import json
import re
import subprocess
import sys
import urllib.parse

UA = "cdn-research-bot/1.0 (educational video research; contact: local)"


def fetch(titles):
    # Full extracts only return one per API call -> loop one title per call
    out = {}
    redirects = []
    for title in titles:
        api = ("https://en.wikipedia.org/w/api.php?action=query&prop=extracts"
               "&explaintext=1&redirects=1&format=json&titles=" +
               urllib.parse.quote(title))
        raw = subprocess.run(
            ["curl", "-s", "--max-time", "90", "-A", UA, api],
            capture_output=True, text=True, check=True).stdout
        data = json.loads(raw)
        pages = data.get("query", {}).get("pages", {})
        redirects += data.get("query", {}).get("redirects", [])
        for pid, page in pages.items():
            real_title = page.get("title", "unknown")
            slug = re.sub(r"[^A-Za-z0-9]+", "-", real_title).strip("-").lower()
            text = page.get("extract", "")
            out[real_title] = (slug, text)
    return out, redirects


def main():
    titles = sys.argv[1:]
    results, redirects = fetch(titles)
    if redirects:
        for rd in redirects:
            print(f"[redirect] {rd.get('from')} -> {rd.get('to')}")
    for title, (slug, text) in sorted(results.items()):
        fname = f"/home/z/my-project/film-cdn-wide/research/raw/wiki-{slug}.txt"
        with open(fname, "w", encoding="utf-8") as f:
            f.write(f"# Wikipedia article: {title}\n")
            f.write(f"# URL: https://en.wikipedia.org/wiki/"
                    f"{title.replace(' ', '_')}\n")
            f.write(f"# Fetched: 2026-10-11 via MediaWiki API (explaintext)\n")
            f.write(f"# Length: {len(text)} chars\n\n")
            f.write(text)
        print(f"[saved] {title} -> {fname} ({len(text)} chars)")
        if not text:
            print("  !! EMPTY EXTRACT — page may not exist")


if __name__ == "__main__":
    main()
