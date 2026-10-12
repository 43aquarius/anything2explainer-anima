# 交付说明 · EP6《NTP — Why Every Clock Agrees》横版 YouTube

## 成片规格
| 项 | 值 |
|---|---|
| 文件 | `NTP_Explained_YouTube_1280x720.mp4`（20.8 MB） |
| 时长 | 1:57.5（117.6 s / 3524 帧 @30fps） |
| 画幅 | 1280×720（16:9，YouTube） |
| 章节 | 4 章 / 16 镜 / 7 构建组 |
| 配音 | edge-tts `en-US-AndrewNeural` +0%（285 词，3.01 词/s）；逐句缓存 `film-ntp-wide/audio/cache/` |
| 金句 | `Time isn't kept. It's agreed.` |
| 系列回指 | EP3 TLS（证书验证依赖时间）、EP5 BGP（"互相说"与"互相核"主题对位） |

## 章节结构
1. **The Drift**（f86）— 你的钟现在就是错的；石英每天漂几秒；三例坏事（30 秒码/证书窗口/数据库乱序）
2. **The Pyramid**（f979）— 原子钟 → GPS 耳语 → 服务器链 → stratum 1–15 层叠金字塔
3. **The Cross-Check**（f1896）— 答案会迟到；四台答案；信互相一致的、弃离群的；缓调不跳
4. **The Committee**（f2670）— 志愿者池；1985 与 27 次闰秒；没有完美钟，只有永远互相核对的钟

## 事实出处（一手核验，见 film-ntp-wide/research/ntp-research.md）
- RFC 5905 原文（stratum 层级语义）；Wikipedia NTP 条目（Mills/1985/交集算法=Marzullo 改进版/公网几十毫秒·局域亚毫秒）
- Wikipedia Leap second：1972 年以来 27 次闰秒、末次 2016-12-31、UTC−TAI=37 s
- Wikipedia Clock drift：1 ppm=86.4 ms/天；市售表 ±1–100 ppm（"每天几秒"取区间中值）
- ntppool.org：志愿者公共池（具体服务器数不上画面）

## 示例语境
`your laptop` / `time.example`；四台示意读数 `11:59:58/59` `12:00:01` `11:59:52`（D 台偏差）；`493 021`（示意一次性码）；`12:00:00`（同步目标）；`1985` / `2016` / `37 s` / `27 leap seconds`

## 质检结论
- `tsc` 0 错误；`selfcheck` 0 问题
- `motion_check --frames fin_frames` 成片权威复测：**16/16 全过**（hold 33–240f；最长静止 ≤1.9s）
- `frame_metrics`：高 3 / 中 1 / 低 19——高项均为**问句导入段主体偏小**的版式项（SC05/SC06/SC07 前段），视觉与节奏检查全过，按 CDN SC11 先例记为已知项；SC13 章首段已从 124f 改善至 92f
- VLM 抽查：G1–G7 随机 13 帧 + 终镜 3 帧全部 PASS（1 帧为 GlitchIn 入场中间帧的 rgbSplit 效果，属设计）
- 尾部时序新规（末拍 ≤TO−45 + exitOp5 + glowOffK(3,5)）从分镜阶段烧入——全片一次通过 hold 判据，仅 2 镜轻调
- 分块渲染 3×~4 分钟 + concat（块间音差 ≤0.06s，同系列管线水平）

## 已知保留项
1. SC05/06/07 问句导入段主体 <80px 窗口（64/96/64 帧）——版式项
2. SC13 章首段 92 帧窗口（中项）
3. 低级标记 19 项（主角无光/碎片类，与历期同级）

## 复现
```bash
cd film-ntp-wide && npm install && python3 scripts/tts_build.py
bash scripts/render_chunk.sh 0 1179 && bash scripts/render_chunk.sh 1180 2359 && bash scripts/render_chunk.sh 2360 3523
# + ffmpeg concat（见 renders/ 顺序）
```
