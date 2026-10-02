# TCP/UDP 竖版（TikTok）— 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-tcpudp-vert`（Remotion 4 + React 19 + TS，**720×1280@30fps 竖版**，`lang:'en'`，`bg:'dots'` 点阵波[已竖版化]，slug `tcpudpvert`，TOTAL=1822）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`reference/motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/film-tcpudp-vert/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-tcpudp-vert/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-tcpudp-vert/research/tcpudp-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4）

## 1. 本片专用图元（src/ui.tsx，追加段在文件末尾；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（同横版：call/timer `04:12`/to `to: 203.0.113.10`/seqs/waits/totalWait 等）。
- `PostcardIcon` — 明信片（= UDP 母题）：`{cx, cy, w=110, h=76, accent, glow, stampP, scale}`。
- `PacketIcon` — 信封（= TCP 母题）：`{cx, cy, w, h, color, accent, glow, stamp, scale}`。
- `SeqStamp` — 编号章：`{cx, cy, label('#3'), color=ORANGE, size=40, scale, glow}`。
- `HeaderBar` — 头部分段条（`8 bytes` vs `≥ 20 bytes`）：`{x, y, w, h=56, fields:[{label, weight}], accent, labelSize=20, dim, progress}`。
- `WaveformStrip` — 语音波形（豁口/呼吸/展开）：`{x, y, w, h, bars, gapFrom/gapTo, breatheP, revealP, color}`。
- `MailboxIcon` / `NodeDot` — 邮箱/端点圆。
- 原有模板图元照旧：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/Check/Cross/PersonIcon/Counter/SoftIn/...`。
- SC01 的手机 mock 用 Box + 圆角 + PersonIcon + Pill 自绘（单镜一次性，不必进 ui.tsx）。

## 2. 竖版安全区（替代横版的 y110–620 / x60–1220）
- **内容主区：y 240–990、x 40–620**（右侧 x>620 是 TikTok 按钮列预留；顶部 y<240 是 TikTok UI 预留，HUD 胶囊除外）
- 字幕带 **y1002–1056**、进度条 **y1240–1280** 不放内容
- 中轴 x=360（不是 640！）；安全内容宽度 560（估宽用 textW 时以此为准）
- 字幕由共用层渲染在 y1002，镜头里不要画字幕
- 最小字号 24px（手机观看，尽量 26+）；大字可以到 130px
- 自下滑入 Δ≤100；侧向滑入 Δ≤180

## 3. 英文片排版（硬规则）
- 拉丁字母不 scaleX 压窄（`SQUEEZE`=1）；估宽用 `textW()`；直引号；省略号 `...`。

## 4. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处：SC01 `TWO RULES`｜SC03 `IP`｜SC07 `7 s`｜SC08 `POSTCARD`｜SC09 `8 bytes`｜SC11 `HTTP/3`｜SC12 `TCP never loses.`。**其余镜头（SC02/04/05/06/10）零 glitch。**
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC12（结尾）出现；其他镜头不得 import。
- **高光时刻**：SC07 大数字型（1+2+4=7 s，全片最高潮）｜SC12 象征物+回扣型。
- **运镜清单**（全片 ≥4 处，不进末拍）：SC04 慢推｜SC06 慢推｜SC07 推近 1→1.22｜SC08 慢推 1→1.06｜SC09 推近 1→1.15｜SC10 推近 1→1.18。

## 5. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（信封瀑布/橙点节拍/编号 stamp/回执折返/打字机/光晕呼吸）。
- **不为凑动作给静止物体加漂浮**；段末镜头末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根，已竖版化采样）。

## 6. still 自检（VLM 可能 429：重试 2–3 次，仍败降级 PIL 像素自检并记 BUILD_NOTES）
```bash
/home/z/my-project/film-tcpudp-vert/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/film-tcpudp-vert/stills/<Gn> g<n>
z-ai vision -p "Frame from a black-canvas white-line-art vertical (720x1280) motion graphics explainer (purple accents). Check: 1) any text overlapping 2) anything cut off at edges 3) text too small 4) elements in the bottom subtitle band (y1002-1056) or beyond x=620 5) color rule violations. List concrete problems, or say PASS." -i <still 路径>
```
改码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。每镜头 ≥6 帧；高光镜头 ≥10 帧；组界帧各一张。
- still 命令里的 Comp 用 G1/G2/G3（竖版只有 3 组）

## 7. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn` 填满分镜表区间，相邻镜头首尾相接；`BG_Gn` 一般留空。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 8. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 两列读数）、复用图元、关键参数、still 清单与 VLM/像素自检发现、未完成/降级项。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。不要贴大段代码。
