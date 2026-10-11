#!/bin/bash
# Usage: search_retry.sh "query" output.json num_results
# Retries on 429 with backoff. Outputs JSON to file.
Q="$1"; OUT="$2"; NUM="${3:-8}"
cd "$(dirname "$0")"
for i in $(seq 1 12); do
  if z-ai function -n web_search -a "{\"query\": \"$Q\", \"num\": $NUM}" -o "$OUT" >/dev/null 2>&1; then
    echo "OK $OUT (attempt $i)"; exit 0
  fi
  S=$((45 + i * 15))
  echo "attempt $i failed, sleeping ${S}s ($OUT)"; sleep "$S"
done
echo "GAVE UP: $OUT"
exit 1
