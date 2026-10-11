# 《CDN — Why Your Video Never Buffers》横版 YouTube 版 · 交付说明（EP4 / The Invisible Internet 系列）

## 成片
- **文件**：`CDN_Explained_YouTube_1280x720.mp4`（28.1 MB · 2 min 29 s · 30fps · H.264 + AAC）
- **结构**：4 章 17 镜
  - Ch1 The Distance Problem（周五夜 8,000km → 光速数学 3min vs 1s → 已在城里）
  - Ch2 The Edge Network（光速买不到 → 边缘节点网络 → 最近的货架 → 任播 one IP → DNS 指到边缘）
  - Ch3 The Cache Hit（缓存命中 → TTL 回源循环 → 不过洋 >½ 流量）
  - Ch4 The Invisible Half（九十年代 MIT 之问 → Akamai 1998 → 300+ 城 → 2021 Fastly ~1/10 49min → 信任天平 → 金句扫光）
- **金句**：The internet isn't fast. It's close.

## 质检结论
- tsc 0 错；selfcheck 0 问题（帧覆盖 17/17 / 闪烁白名单 / 扫光仅 SC17 一处 / 事实清单）
- motion_check 成片复测：**全部段末镜头 hold 30–225 帧 ✓，终镜 21f~（压黑承接判定 OK）**；段内镜头（SC04/SC06/SC12）按「段内不停顿」约定记录
- frame_metrics 终检：**高 1 / 中 0 / 低 16**（SC11 开场海图构建窗空场读数——线稿 ramp 期，旁白承载；其余低项为主角光密度/紫色碎片）
- 覆盖层终镜压黑调至末句后 14 帧（金句停留拉满，TLS 同款策略）

## 事实与出处（画面数字/术语）
- `2 GB`/`8,000 km`/`100 Mb/s`/`≈3 min`/`1 s`：示意尺度换算（cdn-research.md 光纤 ⅔ c、RTT 换算）
- `hundreds of cities` / `300+ cities`：Akamai/Fastly 公开网络规模（调研 §4）
- `1990s MIT` / `Akamai 1998`：MIT 挑战问题 + Leighton/Lewin 分拆史（一手 10-K 与 讣告）
- `2021` `~1/10` `49 min`：Fastly 2021-06-08 停机（官方事后报告；CNBC 覆盖）
- `video > ½ of traffic`：Sandvine 2024/2025 报告（视频占全部流量过半，几乎全部经边缘分发）
- 示意：`movie.mp4` `60 s` TTL `hit/miss`
- 全部出处见 `film-cdn-wide/research/cdn-research.md`

## 配音
- edge-tts `en-US-AndrewNeural` +0%（系列统一）；TTS 逐句缓存已入库，重跑位稳定

## 源码与复现
- Remotion 工程：`film-cdn-wide/`（17 镜 = G1–G6 六组）；分块渲染 ×3 + concat demuxer
- 新图元：EdgeNode（城市边缘节点）/ GlobeArc（任播圆环）/ CacheShelf（边缘缓存货架）
