# 《PCAP — Packet Capture, Explained》横版（YouTube）交付说明

## 成片
- `Packet_Capture_Explained_YouTube_1280x720.mp4`（v3）— 1280×720 @30fps H.264，317.4 s（5:17），英语
- v3 交付修订：①移除片尾 `built with Anything2Explainer` 署名画面（片尾改为压黑后 ≈1.4 s 黑场，总帧数 9575→9517）；②进度条分隔线与章名槽位改为**实际章节边界**（原等宽分隔与真实章起点偏差最大 ~7%）——分隔线落在章节卡出现帧，填充右缘扫线的瞬间即章名点亮瞬间；③全片 42 镜 + 尾段逐一复检（每镜中点 + 入场后 15 帧 + 章节卡 + 片尾，像素级校验全部通过）
- 配音：edge-tts `en-US-AndrewNeural`（+0% 原速，词级边界 → 字幕帧精确对齐）
- 字幕：44px 白字黑边，底部字幕带；章节进度条 + 顶部 HUD 胶囊导航（14 个小节名）
- 结构：4 章 / 42 镜头 — The Mystery（症状 → 包是什么 → 抓包定义 → tcpdump/Wireshark 谱系）/ How It Works（三个立足点 → 混杂模式 → libpcap·BPF 栈 → pcap 文件）/ Wireshark（三面板 → 两种过滤器 → Follow Stream → 破案：重传翻倍）/ Limits & Laws（TLS 1.3 → 许可 → 结案回扣）

## 事实与出处（research/pcap-research.md，全部带 URL）
- tcpdump 1988（Wikipedia Tcpdump）；BPF 论文 1992/USENIX 1993 McCanne & Jacobson（tcpdump.org/papers/bpf-usenix93.pdf）
- Ethereal 1998 / 改名 Wireshark 2006（wireshark.org 官方历史页）；Gerald Combs
- pcap 记录 = 时间戳 + 长度 + 原始字节（IETF draft-gharis-opsawg-pcap、Endace）；pcapng（pcapng.com）
- SPAN/port mirroring（Cisco 文档）、network tap（Niagara Networks/Gigamon）、promiscuous mode（TechTarget/Network World）
- TLS 1.3 = RFC 8446，1-RTT 握手；RTO 初始 1s、翻倍（RFC 6298）→ 故事的 1+2+4=7 s
- MTU 1,500 bytes（Wikipedia/Cloudflare）；Wireshark 三面板（官方 User's Guide）
- 合法性：Wireshark FAQ / IEEE（未授权抓包在多地违法）
- 示意数据（标注 ILLUSTRATIVE，画面自洽）：结账页 9.0 s、服务器日志 60 ms、修复后 0.9 s、IP 用 TEST-NET 文档段 198.51.100.24 / 203.0.113.10

## 贯穿示例语境
`shop.example/checkout` 页面加载 9.0 s ↔ 服务器日志 60 ms 的矛盾 → 抓包 → Follow Stream → 三个重传（1s/2s/4s）→ 7 s 缺口 → 交换机端口故障。全片所有组的屏上文本共用 `ui.tsx` 的 `EXAMPLE` 常量。

## 视觉体系
- 黑底点阵波幕底（DotFieldBg，720×1280 竖版已另行适配）+ 白线条图形 2–3px + 紫 #6630F8 重点 + 橙 #F05F41 指标 + 绿勾
- 全片视觉母题：**信封 = packet**（header=信封地址面 / payload=信纸）；复印检查站=抓包；马克笔=expert 标记
- 高光时刻 4 处：SC08 概念登场（三轮扫光，全片两处扫光之一）/ SC22 论点型 EVIDENCE, NOT TESTIMONY / SC33 大数字型 `7 s`（全片唯一大面积橙光）/ SC42 结尾回扣（扫光之二）
- glitch 白名单 12 处（SC02/08/10/12/13/17/18/22/28/33/36/42），其余镜头零闪烁；`selfcheck.py` 计数核对通过
- 运镜：每章 ≥3 次（推近/承接位移/慢推/拉远），运镜不进末拍（段末镜头 ≥30 帧稳定期）

## 质检记录（qc/）
- v1 → frame_metrics：高 2 / 中 4 / 低 34 → **v2 全部高/中已修**：
  - SC04 高空场（<80px 196 帧）→ 流信封 84px + 端点节点（浏览器/服务器图形）+ 主角信封 110→240px
  - SC17 高空场 → NIC 提前到开场入场（节拍对齐 −5）
  - SC09 中空场 → 复印机提前到 1432
  - SC19 中碎屑 → 随机散点改为 8 车道并行流（VLM 复核："reads as an intentional, regular multi-lane data stream"）
  - SC42 中空场/静止 99 帧 = 片尾压黑设计（保留项）
  - SC07 4.4s 静止（v1 高亮条被卡体遮挡的 bug）→ z 序修复 + 连续滑移；SC12 3.7s 静止 → 顶部信封流；SC33 3.8s → 马克笔 + 推近拉长；motion_check 全片复测所有镜头最长静止 ≤3 s
- 保留项（低）：frame_metrics 的"主角无光"低级标记多为文本主角紫硬投影不被柔光检测识别的假阴性（BigNumber/大字类主角均有紫投影+光晕）；紫色碎片低级标记出现在扫光（SC08/42，设计允许）与多紫元素镜头（交换机端口灯等）；段内镜头 hold<30 为句-镜结构的固有序间衔接形态（与参考样片《RAG》一致）
- motion_check 组级读数 + 成片复测；每镜 ≥6 帧 still + VLM（glm-5v）全分辨率抽查通过

## 时长结构（tts_build 时间轴）
9517 帧（v3，原 9575 去除署名尾部）：片头 1–77 / Ch1 f86（The Mystery）/ Ch2 f2585（How It Works）/ Ch3 f5198（Wireshark）/ Ch4 f7826（Limits & Laws）/ 片尾压黑（末句字幕在压黑之上可读到 9475，与 v2 设计一致）。章末钩子→章首承接按 narration-guidance §13 设计（"The tool is the easy part…" / "Open that file in Wireshark…" / "Before you go capturing everything…"）。
进度条章节边界（v3 实测像素位）：x=341（Ch2 卡）/ x=692（Ch3 卡）/ x=1045（Ch4 卡），与填充右缘到达帧同拍。

## 目录
- `src/shots/G1–G8/`：42 个镜头组件（每镜头一文件）+ 各组 BUILD_NOTES.md
- `script/`：narration.txt / timeline.json / timeline.md / storyboard_src.md；`分镜表.md`（帧号已填充）
- `research/pcap-research.md`：事实清单与出处
- `qc/`：frame_metrics_v1.md 等
- `stills/G*/`：各组自检帧 + boundary 组界帧
