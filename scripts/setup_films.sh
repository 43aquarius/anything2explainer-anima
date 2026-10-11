#!/bin/bash
# 创建 EP2/EP3/EP4 六个工程（3横版+3竖版），复制上期工程为骨架
set -e
BASE=/home/z/my-project
WIDE=$BASE/film-pcap-wide
VERT=$BASE/film-pcap-vert

# 待创建: slug -> (src工程, 新目录)
declare -A FILMS=(
  [dns]=$BASE/film-dns-wide
  [tls]=$BASE/film-tls-wide
  [cdn]=$BASE/film-cdn-wide
)
declare -A FILMS_V=(
  [dns]=$BASE/film-dns-vert
  [tls]=$BASE/film-tls-vert
  [cdn]=$BASE/film-cdn-vert
)

# 复制函数：tar 管道复制，排除上期产物与 node_modules
copy_skel() {
  local SRC=$1 DST=$2
  mkdir -p "$DST"
  (cd "$SRC" && tar cf - \
    --exclude=node_modules --exclude=qc --exclude=stills --exclude=renders \
    --exclude=fin_frames --exclude=audio --exclude='build_dev_*' \
    --exclude=fin_count.txt --exclude=render.done \
    .) | (cd "$DST" && tar xf -)
}

for slug in dns tls cdn; do
  DST=${FILMS[$slug]}
  if [ ! -d "$DST/src" ]; then copy_skel "$WIDE" "$DST"; fi
  # 清理上期内容（保留模板层与代码骨架）
  rm -rf "$DST/research" "$DST/qc" "$DST/audio" "$DST/stills"
  mkdir -p "$DST/research" "$DST/public/assets"
  rm -f "$DST/分镜表.md" "$DST/BUILD_RULES_PCAP.md" "$DST/交付说明.md"
  rm -rf "$DST/public/assets/"*/
  # script 目录清空（tts 会重新生成）
  rm -rf "$DST/script" && mkdir -p "$DST/script"

  DSTV=${FILMS_V[$slug]}
  if [ ! -d "$DSTV/src" ]; then copy_skel "$VERT" "$DSTV"; fi
  rm -rf "$DSTV/research" "$DSTV/qc" "$DSTV/audio" "$DSTV/stills"
  mkdir -p "$DSTV/research" "$DSTV/public/assets"
  rm -f "$DSTV/分镜表.md" "$DSTV/BUILD_RULES_PCAP.md" "$DSTV/BUILD_RULES_VERT.md.bak" "$DSTV/交付说明.md"
  rm -rf "$DSTV/public/assets/"*/
  rm -rf "$DSTV/script" && mkdir -p "$DSTV/script"
done

echo "OK: 6 film projects created"
for d in dns tls cdn; do echo "--- $d wide:"; ls $BASE/film-$d-wide | head -5; done
