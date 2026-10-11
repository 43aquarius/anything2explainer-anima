#!/bin/bash
# Patient background retry of web searches while the API rate limit cools down.
cd "$(dirname "$0")"
declare -a QUERIES=(
  "s_firesheep_dl|Firesheep extension 100,000 downloads first week Eric Butler 2010"
  "s_chrome_ct|Chrome requires Certificate Transparency SCT certificates since April 2018"
  "s_httpsfirst|Firefox HTTPS-First mode rollout status 2026"
  "s_ech_status|Encrypted Client Hello ECH deployment status Chrome Firefox 2026"
  "s_cert_price|SSL certificate price per year 2014 before Let's Encrypt fifty dollars"
  "s_tls13_share|Cloudflare Radar TLS 1.3 adoption percentage of HTTPS connections"
  "s_roots|Mozilla included root certificates count CCADB root store report"
  "s_atoms|number of atoms in the observable universe 10 to the 80"
)
for round in $(seq 1 18); do
  ok=0
  for q in "${QUERIES[@]}"; do
    OUT="${q%%|*}"; QUERY="${q#*|}"
    if [ -s "${OUT}.json" ]; then ok=$((ok+1)); continue; fi
    if z-ai function -n web_search -a "{\"query\": \"$QUERY\", \"num\": 6}" -o "${OUT}.json" >/dev/null 2>&1; then
      echo "$(date +%H:%M:%S) OK $OUT (round $round)"
      sleep 20
    else
      echo "$(date +%H:%M:%S) fail $OUT (round $round)"
      break
    fi
  done
  [ $ok -eq ${#QUERIES[@]} ] && { echo "ALL DONE round $round"; break; }
  sleep 150
done
echo "background search loop finished $(date +%H:%M:%S)"
