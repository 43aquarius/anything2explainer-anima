# 交付说明 · EP7《WiFi — The Conversation in the Air》横版 YouTube

## 成片规格
| 项 | 值 |
|---|---|
| 文件 | `WiFi_Explained_YouTube_1280x720.mp4`（17.4 MB） |
| 时长 | 1:40（100.0 s / 2997 帧 @30fps） |
| 画幅 | 1280×720（16:9，YouTube） |
| 章节 | 4 章 / 14 镜 / 5 构建组 |
| 配音 | edge-tts `en-US-AndrewNeural` +0%（253 词，3.21 词/s）；逐句缓存 `film-wifi-wide/audio/cache/` |
| 金句 | `One sky. One voice at a time.` |
| 系列收束 | 与 EP5 BGP（互相说的地图）、EP6 NTP（互相核的时间）构成"互联网的礼貌"三部曲 |

## 章节结构
1. **The Shared Air**（f86）— 看不见的空气满是对话；半双工；一次一人
2. **Taking Turns**（f611）— 先听后说；忙则随机多等一拍；没有裁判只有好礼貌
3. **The Crowd**（f1352）— 公寓拥挤；信道 1/6/11；隐藏节点；RTS/CTS 先报名
4. **The Promise**（f2250）— 1997 的 2 Mbit/s 到今天；"卡一口气"是空气在轮流

## 事实出处（一手核验，见 film-wifi-wide/research/wifi-research.md）
- Wikipedia IEEE 802.11：半双工家族、CSMA/CA 先听后说、802.11-1997 首发、2 Mbit/s
- Wikipedia CSMA/CA：随机等待、确认缺失→二进制指数退避、RTS/CTS 可选仲裁
- Wikipedia Hidden node problem：两设备互相听不见但都达 AP → 同时发→两败俱伤
- Wikipedia List of WLAN channels：2.4 GHz 信道 1/6/11 互不重叠

## 示例语境
`your laptop / your phone / your TV / the router`；三户 `net A / net B / you`；`1997` `2 Mbit/s`；`request → reply`

## 质检结论
- `tsc` 0 错误；`selfcheck` 0 问题
- `motion_check --frames fin_frames` 成片权威复测：**14/14 全过**（hold 33–168f；最长静止 ≤1.9s）
- `frame_metrics`：高 1 / 中 1 / 低 16——SC06 礼貌卡段主体偏小（156f 窗口）与 SC10 承接段（96f 窗口）记为已知版式项（motion/VLM 全过）
- VLM 抽查：全片 7 帧（各章代表帧 + 终镜）全部 PASS
- 尾部时序硬规则从分镜烧入——仅 3 镜轻调（SC01/SC02 弧循环镜改硬切承接不判；SC09 加 1836–1921 相机慢推破中段静止并增紧张感）
- 分块渲染 3 块 + concat

## 已知保留项
1. SC06（高）/SC10（中）空场窗口版式项
2. 低级标记 16 项（与历期同级）

## 复现
```bash
cd film-wifi-wide && npm install && python3 scripts/tts_build.py
bash scripts/render_chunk.sh 0 999 && bash scripts/render_chunk.sh 1000 1999 && bash scripts/render_chunk.sh 2000 2996
# + ffmpeg concat
```
