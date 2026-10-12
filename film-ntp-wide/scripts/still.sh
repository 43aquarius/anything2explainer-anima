#!/bin/bash
# 出 still（bash 版，容器内无 zsh）：still.sh <Comp: Video|Overlay|Icons|G1..G8> <帧号列表 1 起,逗号分隔> <输出目录(绝对路径)> [tag]
# ⚠ 每个构建组只用一个 tag（如 g3），改代码后 rm -rf build_dev_<tag> 再跑；不要每次换新 tag（每个 bundle ≈40MB）。
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
COMP=$1; FRAMES=$2; OUT=$3; TAG=${4:-$COMP}
[ -n "$COMP" ] && [ -n "$FRAMES" ] && [ -n "$OUT" ] || { echo "usage: still.sh <Comp> <frames> <out_dir_abs> [tag]"; exit 1; }
B=build_dev_$TAG
[ -d "$B" ] || npx remotion bundle src/index.ts --out-dir "$B" --log=error
mkdir -p "$OUT"
IFS=',' read -ra FL <<< "$FRAMES"
for N in "${FL[@]}"; do
  npx remotion still "$B" "$COMP" "$OUT/f_$(printf %04d "$N").png" --frame=$((N-1)) --log=error
done
ls "$OUT" | wc -l
