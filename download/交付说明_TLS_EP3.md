# 《TLS — The Little Lock》横版 YouTube 版 · 交付说明（EP3 / The Invisible Internet 系列）

## 成片
- **文件**：`TLS_Explained_YouTube_1280x720.mp4`（38.8 MB · 3 min 21 s · 30fps · H.264 + AAC）
- **规格**：1280×720（YouTube 16:9）；黑底点阵波幕底 + 白线条图形 + 紫色重点 + 章节进度条 + 顶部胶囊 HUD
- **结构**：4 章 27 镜
  - Ch1 The Open Postcard（咖啡馆明文 → Firesheep → SSL 锁登场·扫光① → TLS 1.3）
  - Ch2 The Handshake（1-RTT → ClientHello → 同一个秘密★ → AES-GCM 封流 → 字已噪声）
  - Ch3 The Magic Trick（DH 1976 → 颜料混合★ → 单向门 → 前向保密 → 五套件）
  - Ch4 The Chain of Trust（谁来担保 → ≈120 邮戳墙★ → MITM 失败 → Let's Encrypt → 4in5 → 锁在重锻 → 金句扫光②）
- **金句**：Everyone can see the envelope. No one can read the letter.

## 质检结论
- tsc 0 错；selfcheck 0 问题（帧覆盖对账 / 闪烁白名单 / 扫光白名单 SC06+SC27 = 2 处 / 事实清单）
- motion_check 成片复测：**全部 9 个段末镜头 hold 42–159 帧 ✓，终镜金句 33 帧 ✓**；6 个段内镜头按「段内不停顿」约定记录（SC01/02/05/11/15/17）
- frame_metrics 终检：**高 0 / 中 0 / 低 29**（低项为过场次要时刻的主角光密度与紫色碎片计数，参考 composition-and-light §6；与 DNS 片 v1 交付时同档）
- 已知保留项：段内镜头 hold 读数（设计内）；SC12 热噪声高潮与压黑衔接紧凑（成片复测 51f 达标）

## 事实与出处（画面每个数字/术语）
- 5 in 6 页面加载走 TLS：Firefox 遥测 2025–2026 月度 81.6–85.8%（tls-research.md §6）
- TLS 1.3 = RFC 8446（2018）；套件 31→5（RFC 5246 App A.5 → RFC 8446 §B.4，全 AEAD）
- 前向保密强制：RFC 8446 §1.2（static RSA/DH 套件移除）
- Firesheep：2010-10-24 ToorCon 12 发布，Eric Butler（GRC SN-272 转引发布帖）
- ≈120 CA 根：Mozilla NSS certdata.txt 一手解析（172 枚中 121 枚受信签发 TLS 服务器证书，2026-10 抓取）
- Let's Encrypt：2014-11 组建 / 2015-12 公测，免费+ACME 自动化（RFC 8555）
- ECH：RFC 9849（2026-03，Standards Track）
- 后量子 ≈70%：Cloudflare Radar 2026-09（X25519MLKEM768 混合）
- 示意数据：`shop.example`（RFC 2606）/ `cafe2026` 演示密码 / `150 B` / `0.041 s` / 密文行
- 全部出处见 `film-tls-wide/research/tls-research.md`（一手源逐条带 URL）

## 配音
- edge-tts `en-US-AndrewNeural` +0%（与 EP1/EP2 同嗓）；TTS 逐句缓存已入库（`audio/cache/`），重跑 `python3 scripts/tts_build.py` 位稳定复现（容器重置后实测：6027 帧/200.9s 与原时间轴完全一致）

## 源码与复现
- Remotion 工程：`film-tls-wide/`（27 镜 = G1–G8 八组；分块渲染 `scripts/render_chunk.sh` × 3 + ffmpeg concat demuxer）
- 分镜表：`film-tls-wide/分镜表.md`（v2：段末镜头跨段间隙延伸，消除覆盖空洞）
- 工程备注：各组 `src/shots/Gn/BUILD_NOTES.md`
