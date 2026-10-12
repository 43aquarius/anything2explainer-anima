#!/bin/bash
# 分块渲染（沙箱 10 分钟工具超时限制）：render_chunk.sh <起帧0基> <止帧0基inclusive> <输出>
# 用法（分三次调用，每次 <10 分钟）：chunk 0 3199 / chunk 3199 6399 / chunk 6399 9574 → assemble.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
A=$1; B=$2; OUT=renders/chunk_${A}_${B}.mp4
[ -n "$A" ] && [ -n "$B" ] || { echo "usage: render_chunk.sh <a0> <b0>"; exit 1; }
[ -d build_full ] || npx remotion bundle src/index.ts --out-dir build_full --log=error
npx remotion render build_full Video "$OUT" --codec=h264 --crf=16 --concurrency=2 --frames=${A}-${B} --timeout=300000 --log=error
[ -s "$OUT" ] || { echo "CHUNK FAILED"; exit 1; }
echo "chunk ok: $OUT ($(du -h $OUT | cut -f1))"
