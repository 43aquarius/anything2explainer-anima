# 《DNS — The Internet's Phonebook》交付说明（The Invisible Internet · EP2）

## 成片
| 文件 | 规格 | 时长 | 大小 |
|---|---|---|---|
| DNS_Explained_YouTube_1280x720.mp4 | 横版 YouTube，1280×720@30fps，H.264 | 4:48 | 44 MB |
| DNS_Explained_TikTok_720x1280.mp4 | 竖版 TikTok，720×1280@30fps，H.264 | 1:09 | 9.4 MB |

## 内容
- 主线谜题：输入 shop.example 按回车，0.4 秒后页面出现——但互联网上没有任何一台机器叫这个名字。
- 四章（横版）：The Mystery（名字 vs 数字、HOSTS.TXT、1983 Mockapetris）→ The Lookup（resolver→root→TLD→authoritative 四级问路、A 记录）→ The Cache（便签、TTL、"传播"的真相、Facebook 2021 十一分钟）→ When It Breaks（明文 33 年与 DoT/DoH、SiteFinder 19 天、DNSSEC、Dyn 2016）。
- 金句结尾："A name is a question. DNS is the answer."
- 竖版为同一故事线的 70 秒压缩重制（11 镜）。
- 与 EP1《PCAP》同一视觉宇宙：信封=数据包母题、shop.example 示例语境、黑底点阵波幕底、紫橙配色。

## 配音
edge-tts `en-US-AndrewNeural`（+0% 原速，词级边界对齐字幕）。横版 690 词 / 288.1s；竖版 147 词 / 68.5s。

## 事实出处
全部画面数字/术语逐条可溯源至 film-dns-wide/research/dns-research.md（两轮核验，含 URL 与可信度分级）：
- 1983 RFC 882/883（Mockapetris）、1987 RFC 1034/1035（现行规范）、1974 RFC 608（HOSTS.TXT/SRI）
- 13 个根标识 A–M / 2,047 实例（root-servers.org 2026-10）、512 字节 UDP 限制
- ≈1 ms 缓存 / ≈100 ms 全程（NDSS 2026 实测标注 ≈）
- 2016 Dyn（Mirai：摄像头/打印机/婴儿监视器）、2021-10-04 Facebook（11 分钟缓存 + 30 倍查询）
- 1.9 万亿/天（Cloudflare 2025-02 官方）、DoT RFC 7858 (2016) / DoH RFC 8484 (2018)、DNSSEC 2010 根区签名
- 示意值（≈0.5s、192.0.2.33、60s TTL 等）在片中带 ≈ 或使用 RFC 5737/2606 文档保留段

## 质检结论
- tsc 零错误；motion_check 全镜头达标（段末镜头 hold ≥30 帧全过；段内镜头"段内不判"按分镜表记录）
- selfcheck：33 镜头帧覆盖与分镜表一致；闪烁白名单 17 条全部对齐；扫光 2 处（SC11 THE ROOT 登场 / SC33 结尾金句）
- frame_metrics（12 帧步进）：高 0 / 中 5 / 低 25——中级为 SC04/21/28/29/31 的局部主体偏小（信封前段/冰箱/链/卡构图），列为已知保留项
- VLM 视觉抽查因 z-ai API 持续 429 限流未能执行，以 motion_check + frame_metrics 量化替代

## 已知保留项
1. 五个镜头的构图中级标记（见上）；2. VLM 抽查未完成；3. 竖版沿用同套图元的竖版适配（无独立精修轮）。

## 目录
- film-dns-wide/：横版工程（research / script / 分镜表 / src / renders / qc / stills）
- film-dns-vert/：竖版工程（同构）
- 复用许可：画面全部代码绘制（Remotion）；风格致敬抖音 @图灵宇宙（见 anything2explainer README 致谢），画面原创。
