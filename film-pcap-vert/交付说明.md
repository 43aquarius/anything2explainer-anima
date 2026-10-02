# 《PCAP — Packet Capture, Explained》竖版（TikTok）交付说明

## 成片
- `Packet_Capture_Explained_TikTok_720x1280.mp4`（v3）— **720×1280 竖版** @30fps H.264，69.2 s，英语
- v3 交付修订：①移除片尾 `built with Anything2Explainer` 署名画面（片尾改为压黑后 ≈1.2 s 黑场，总帧数 2132→2074）；②**修复进度条不显示 bug**——`BAR_H = 720 - BAR_TOP`（模板横版 720 高残留）为负值导致条体/填充完全不渲染，改用 lib `H=1280` 计算并把硬编码 720 全部换为 W；修复后填充位置经像素级校验与实际时间进度偏差 <1.5 px；③全片 13 镜逐一复检通过
- 配音：edge-tis `en-US-AndrewNeural`（与横版同一声音，形成系列感）
- 字幕：42px 白字黑边（y1002 字幕带，避开 TikTok 底部 UI 区）；单章进度条 y1240；HUD 胶囊 y150（避开顶部 UI）
- 结构：单章 13 镜头，四段节奏 — 钩子（9 秒之谜）→ 机制速览（信封/拷贝）→ 破案（三面板/重传翻倍/7 秒）→ 规则与金句（TLS/许可/believed vs happened/The wire doesn't lie.）

## 竖版化改造（对模板的适配）
- 画布 720×1280（lib W/H、Root 合成尺寸、Glitch 切片高度、Fog 宽高）
- 幕底点阵波：设计坐标 960×540 → 540×960（scale 1.33 均匀，点距屏显 48px 与横版一致）
- 字幕带 y637 → y1002、进度条 y687 → y1240、HUD (533,28) → 中轴 x360/y150（新增 TopCapsuleV）
- fx.tsx 去硬编码：CameraRig 用画布中心、sweepX/HaloRing/Vignette 用 W/H（竖版通用化）
- 安全区（TikTok UI 预留）：内容主区 y240–990、x40–620（右侧按钮列）；字号最小 22px、正文 24–30、大数字 130
- motion_check 采样竖版化（180×320 + y240–1000 内容区；修正了纵向运动被横版采样压缩 7 倍而测不到的问题）
- 分镜语言竖版化：信封纵向流动、三卡竖排（立足点）、Wireshark 三面板竖排、间隔大字纵列

## 与横版的关系
- 同一贯穿故事（9 秒结账页 → 重传翻倍 → 7 秒 → the wire doesn't lie.）、同一套事实出处（research/pcap-research.md）、同一视觉母题（信封=packet）与配色
- 竖版为快节奏剪辑：无章节卡、无 MTU/1992 BPF/pcapng 等横版深度内容；高潮同样落在 `7 s` 大数字与结尾扫光
- glitch 白名单 4 处：SC02 `60 ms` / SC04 `PACKET CAPTURE`（rgbSplit 6）/ SC09 `7 s`（rgbSplit 6）/ SC13 `The wire doesn't lie.`（rgbSplit 8）；扫光白名单 2 处：SC04（紧凑登场版）/ SC13（结尾回扣）

## 质检记录
- motion_check 组级 + 成片复测（--frames fin_frames）：**所有段末镜头 hold ≥30 ✓**（SC02 48f/SC04 81f/SC06 45f/SC07 165f/SC08 165f/SC10 72f/SC11 36f/SC13 75f）；最长静止全部 ≤3s，唯一例外 SC13 的 3.3s = 片尾压黑纯黑尾段（设计；fullres 变化像素 0，真静=黑屏）
- 段内镜头（SC01/03/05/09/12）hold<30 为句-镜序间衔接形态（与横版、参考样片一致，持续动作覆盖到离场）
- v1 构建中发现并修复：G2 组 index.ts 未注册（agent 被中断所致，整组渲染为空 → 主会话补注册）；G2 动作幅度增强（镜像虚线蚂蚁线行进、列表扫描条、时间轴游标、落点涟漪 — "小面积动作加大幅度"）
- VLM（glm-5v）终审：全片 72 抽样帧 4 张 contact sheet 全 CLEAN；SC12/SC13 全分辨率单帧复核 PASS
- 保留项：竖版未跑 frame_metrics（横版专用区域判据，竖版以 VLM 构图审查 + motion 竖版化复测替代）

## 目录
- `src/shots/G1–G3/`：13 个镜头组件 + BUILD_NOTES；`script/`：narration/timeline/storyboard + 分镜表.md
- `research/pcap-research.md`（与横版共享）；`renders/pcapvert_v1.mp4`；`fin_frames/`（2132 帧）
- 横版工程：`/home/z/my-project/film-pcap-wide`（对照其 交付说明.md）
