#!/bin/bash
# Usage: fetch_retry.sh URL output.json
U="$1"; OUT="$2"
cd "$(dirname "$0")"
for i in $(seq 1 10); do
  if z-ai function -n page_reader -a "{\"url\": \"$U\"}" -o "$OUT" >/dev/null 2>&1; then
    echo "OK $OUT (attempt $i)"; exit 0
  fi
  S=$((45 + i * 15))
  echo "attempt $i failed, sleeping ${S}s ($OUT)"; sleep "$S"
done
echo "GAVE UP: $OUT"
exit 1
