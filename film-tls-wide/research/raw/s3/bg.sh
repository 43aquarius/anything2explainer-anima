#!/bin/bash
# Patient retry loop: web searches + page fetches for the 10 unresolved items.
cd "$(dirname "$0")"

do_search() { # name query
  [ -s "$1.json" ] && return 0
  z-ai function -n web_search -a "{\"query\": \"$2\", \"num\": 6}" -o "$1.json" >/dev/null 2>&1
}
do_fetch() { # name url
  [ -s "$1.json" ] && return 0
  z-ai function -n page_reader -a "{\"url\": \"$2\"}" -o "$1.json" >/dev/null 2>&1
}

for round in $(seq 1 40); do
  do_search s_pq_chrome   "Chrome 131 X25519MLKEM768 post-quantum key exchange enabled by default November 2024"
  do_search s_pq_firefox  "Firefox 132 post-quantum ML-KEM key exchange enabled default"
  do_search s_ech2026     "Encrypted Client Hello ECH deployment status Chrome Firefox 2026"
  do_search s_httpsfirst  "Firefox HTTPS-Only HTTPS-First mode rollout status 2026"
  do_search s_ct_policy   "Chrome Certificate Transparency SCT required certificates issued after April 2018 policy"
  do_search s_ccadb_count "how many root certificates Mozilla Apple Microsoft root store CCADB report 2025 2026"
  do_search s_x25519_share "Cloudflare Radar X25519 key exchange share percentage of TLS handshakes"
  do_search s_pop         "world population 2025 UN estimate 8.2 billion"
  do_search s_2010https   "share of web page loads over HTTPS 2010 2011 percent telemetry"
  do_search s_firesheep   "Firesheep extension downloads first week October 2010 Eric Butler"
  do_fetch f_cf_pq        "https://blog.cloudflare.com/pq-2024/"
  do_fetch f_chrome_ct    "https://www.chromium.org/Home/chromium-security/certificate-transparency/"
  do_fetch f_wiki_pop     "https://en.wikipedia.org/wiki/World_population"
  do_fetch f_firesheep_wb "https://web.archive.org/web/20120820220335/http://codebutler.com/firesheep"
  done_ct=1
  for f in s_pq_chrome s_pq_firefox s_ech2026 s_httpsfirst s_ct_policy s_ccadb_count s_x25519_share s_pop s_2010https s_firesheep f_cf_pq f_chrome_ct f_wiki_pop f_firesheep_wb; do
    [ -s "$f.json" ] || { done_ct=0; }
  done
  n=$(ls -s *.json 2>/dev/null | wc -l)
  echo "$(date +%H:%M:%S) round $round: $n/14 files done"
  [ $done_ct -eq 1 ] && { echo "ALL DONE"; break; }
  sleep 120
done
echo "loop finished $(date +%H:%M:%S)"
