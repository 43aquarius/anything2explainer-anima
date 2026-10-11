#!/bin/bash
# 清空六工程的上期镜头代码（保留 index stub 与 Preview）
set -e
BASE=/home/z/my-project

reset_wide() {
  local D=$1 N=$2
  for i in $(seq 1 $N); do
    G=$D/src/shots/G$i
    # 删除旧镜头组件
    find "$G" -name "SC*.tsx" -delete 2>/dev/null
    rm -f "$G/g${i}ui.tsx" "$G/layout.tsx" "$G/parts.tsx" "$G/vspace.ts" 2>/dev/null
    # index.ts 置空 stub
    cat > "$G/index.ts" << EOF
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
export const SHOTS_G$i: ShotDef[] = [];
export const BG_G$i: BgSpec[] = [];
export const FOOTAGE_G$i: FootageSpec[] = [];
EOF
  done
}

reset_wide $BASE/film-dns-wide 8
reset_wide $BASE/film-tls-wide 8
reset_wide $BASE/film-cdn-wide 8
reset_wide $BASE/film-dns-vert 3
reset_wide $BASE/film-tls-vert 3
reset_wide $BASE/film-cdn-vert 3

echo "shots reset done"
