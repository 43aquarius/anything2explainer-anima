#!/bin/bash
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
A=$1; B=$2
[ -n "$A" ] && [ -n "$B" ] || { echo "usage: render_chunk.sh <a0> <b0>"; exit 1; }
[ -d build_full ] || npx remotion bundle src/index.ts --out-dir build_full --log=error
npx remotion render build_full Video "renders/chunk_${A}_${B}.mp4" --codec=h264 --crf=16 --concurrency=2 --frames=${A}-${B} --timeout=300000 --log=error
[ -s "renders/chunk_${A}_${B}.mp4" ] || { echo "CHUNK FAILED"; exit 1; }
echo "chunk ok: renders/chunk_${A}_${B}.mp4 ($(du -h renders/chunk_${A}_${B}.mp4 | cut -f1))"
