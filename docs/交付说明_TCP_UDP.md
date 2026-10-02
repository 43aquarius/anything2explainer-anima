# 交付说明 — 《TCP & UDP — Two Ways to Travel》

## 成片

| 版本 | 文件 | 规格 |
|---|---|---|
| YouTube 横版 | `TCP_UDP_Explained_YouTube_1280x720.mp4` | 1280×720 @30fps · 5 min 45 s · H.264 + AAC · 57 MB |
| TikTok 竖版 | `TCP_UDP_Explained_TikTok_720x1280.mp4` | 720×1280 @30fps · 60.9 s · H.264 + AAC · 9.6 MB |

两片共享一条故事主线与一套视觉母题（信封 = TCP 段、明信片 = UDP 数据报、`TCP never loses. / UDP never waits.` 收尾），英文配音（edge-tts en-US-AndrewNeural，原速）。

## 故事结构

- **主线**：你正在视频通话，中途给朋友发一张照片——语音与照片走同一条网线，却需要相反的保证（照片一个都不能少；语音一毫秒都等不起）→ IP 只承诺 best-effort（RFC 791：无确认、无重传、无顺序、无流控）→ 两种传输层补全：TCP（挂号信：三路握手、编号回执、翻倍重传、流控、拥塞减半）与 UDP（明信片：8 字节头、无仪式、晚到即死）→ DNS 一问一答 / 游戏同款 → QUIC 在 UDP 上重建一切（连接迁移）→ 收尾两行大字。
- **横版 4 章**（The Best-Effort Wire / TCP — The Courier / UDP — The Postcard / Choosing Sides）37 镜；竖版单线 12 镜。

## 事实出处（全部可核，详见 `film-tcpudp-wide/research/tcpudp-research.md`）

Cerf & Kahn 1974 论文（RFC 793 参考文献[1]）｜RFC 793 (1981-09)｜RFC 768 (1980-08-28, Jon Postel)｜RFC 791 "no acknowledgments... no retransmissions" 原文｜RFC 1035 DNS UDP/TCP 53｜RFC 3551 默认打包 20 ms｜RFC 5681 拥塞减半｜RFC 6298 重传翻倍（复用 PCAP 片调研）｜RFC 9000 QUIC (2021-05)｜RFC 9114 HTTP/3 (2022-06)｜RFC 9000 [EARLY-DESIGN] Roskind 2013-12-02。
示意值（画面标注「示意」语境）：照片 3 MB → 2,000+ 信封（3,000,000÷1460≈2,055）；通话时长 04:12；连接 ID 7f3a；TEST-NET IP（198.51.100.24 / 203.0.113.10，RFC 5737 保留段）。

## 真实素材（仅横版 SC03/SC11）

- SC03：海底/陆上光纤照片（`fiber_strip.jpg`，Wikimedia Commons，Asurnipal，CC BY-SA 4.0）
- SC11：Vint Cerf（`cerf_2007.jpg`，Charles Haynes，CC BY-SA 2.0）与 Bob Kahn（`kahn_modern.jpg`，Вени Марковски，CC BY-SA 3.0）单人像（Commons 无二人合影，双卡并列）
- 全部经 `PhotoCard` 图元渲染（白框 + 暗调 grade + 画面内 `photo: Wikimedia Commons` 出处行，≥75 帧 ≥50% α）；完整登记在 `film-tcpudp-wide/public/assets/tcpudpwide/MANIFEST.md`。竖版全代码绘制。

## 质检结论

- **节奏（motion_check 成片复测，判据口径）**：横版 37 镜 0 失败（最长静止全部 ≤3 s；全部段末镜头 hold ≥30 帧）；竖版 12 镜段末镜头全过（段内镜头按规范不判）。修复历程：三轮迭代（真静窗加持续动作并控制幅度、末拍元素前挂、离场/灭光推迟、连续微动在末 46 帧冻结——"落位停留"的稳定期语义）。
- **进度条像素校验**（对上一片用户反馈的专项复检）：横版 8 采样点填充右缘偏差 ≤1 px（PNG 精确校验 0 px）；竖版条体可见、6 采样点偏差 0–1 px（横向填充，宽度按 N/TOTAL 推导，无横版 720 硬编码残留）。
- **白名单**：闪烁 GlitchIn 逐镜对账——横版 10/10 精确命中（SC05 IP / SC06 NOTHING / SC10 TWO / SC12 THE HANDSHAKE / SC15 红× / SC22 POSTCARD / SC24 8 bytes / SC27 LATE / SC32 HTTP/3 / SC37 TCP never loses.），竖版 7/7；扫光只出现在分镜白名单镜头（横版 SC10/SC37，竖版 SC12）。
- **帧覆盖**：两片镜头区间首尾相接无空洞（章界空白 = 章节卡，设计内）；`selfcheck.py` 全部通过。
- **内容完整性**：全部镜头中点帧内容存在（像素验证），无空白镜头、无字幕带越界。
- **VLM 抽查**：制作期间 AI 网关持续 429 限流，视觉抽查降级为 PIL 像素自检（四象限亮度 / 主角包围盒 / 边缘裁切 / 内容存在性），全过；建议发布前人工快进过一遍。

## 已知保留项

1. 横版 SC02/SC08/SC14/SC18 等段内镜头的 hold 读数为 0——按规范「段内句不需要停留」不判；成片上这些镜头全程有动词动作。
2. 真实照片因沙箱 IP 被 upload.wikimedia.org 限流，经 wsrv.nl 图片代理下载（字节内容一致，已按 MANIFEST 登记 sha256）。
3. 调研当日 z-ai web_search 持续限流：全部事实改用 rfc-editor.org 原始 RFC 文本核实（更权威）；【待核】清单中的 3 项（ARPANET flag day 等）未进解说词与画面。
