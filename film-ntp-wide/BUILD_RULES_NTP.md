# NTP 片 — 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-ntp-wide`（Remotion 4 + React 19 + TS，1280×720@30fps，`lang:'en'`，`bg:'dots'` 点阵波）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`motion-vocabulary.md`、`composition-and-light.md`
3. `/home/z/my-project/film-ntp-wide/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-ntp-wide/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-ntp-wide/research/ntp-research.md` — 画面数字/术语的事实依据
6. 模式对照（上一部同管线影片源码，风格最接近）：`/home/z/my-project/film-cdn-wide/src/shots/`（G1–G6 各组；金句收尾看 G6/SC17.tsx；世界图+节点群看 CDN G2/SC05.tsx；年份数字看 G5/SC12.tsx；高光扫光看 G6/SC17.tsx——本片只有 G7/SC16 用扫光，你不用）

## 1. 本片专用图元（src/ui.tsx，各组共用；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（laptop `your laptop` / server `time.example` / totp `30 s` / code `493 021` / driftDay `a few seconds a day` / reads 四台读数 / readGood `12:00:00` / strata `stratum 1–15` / yearStart `1985` / rfc `RFC 958 → 5905` / leapCount `27 leap seconds` / lastLeap `2016` / utcTai `37 s` / finale1 finale2 credit）。**所有屏上示例文本一律从这里取**，不得自造。
- `ClockFace` — 大钟面（全片视觉母题）：`{cx, cy, r=110, N(必传，驱动针), rate(速率，漂移/追齐), offsetDeg, ghost(灰幽灵针), readout(盘下数字), readoutSize, opacity, glow, label, labelSize}`。
- `QuartzCrystal` — 石英晶振：`{cx, cy, w, h, N(微颤), amp, opacity, glow, label, labelSize}`。
- `AtomClock` — 原子钟（stratum 0 源头）：`{cx, cy, w=190, h=210, N(核心脉冲+读数翻动), opacity, glow, label, labelSize, small}`。
- `SatGlyph` — GPS 卫星：`{cx, cy, s(缩放), N(信号弧相位), opacity, glow, label, labelSize}`。
- `StratumTier` — stratum 层条：`{cx, y, w, h=54, n(内嵌服务器数), label, lit(紫光), dim(灰), opacity}`。
- `DriftLine` — 漂移双线（灰直=真时间 / 白弯=你的钟）：`{x, y, w, k(0–1 渐弯), gapPx=46, opacity, label, labelSize}`。
- 系列母题沿用：`PacketIcon`（信封=在途数据包）、`BrowserWin`（浏览器）、`ClockIcon`（时钟）。
- 原有模板图元照用：`CText/TechText/TechSub/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/DocIcon/DBIcon/ChunkCard/ClusterGrid/RackIcon/PersonIcon/CodeCard/Counter/ClockIcon/SoftIn/...`

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**（`SQUEEZE` 常量已按 lang='en' 返回 1，直接用）；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号；省略号用 `...`。

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词；**不在表里的镜头零 glitch**。NTP 片表：SC01 警示三角(4) / SC02 `≠`(4) / SC04 `contradiction`(6) / SC08 `stratum 1–15`(6) / SC10 `four servers`(4) / SC11 `the crowd keeps the time`(6) / SC13 `the pool`(6) / SC15 `no perfect clock`(4) / SC16 第一行(8)。**SC03/SC05/SC06/SC07/SC09/SC12/SC14 零 glitch**（SC16 由主会话构建）。
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC16 出现（主会话构建）；**你负责的组一律不得 import**。
- **高光时刻**：SC01 事件型（路由溶解）/ SC07 论点型（链条→地图画出自己）/ SC12 事件型（撤回+刷新墙）/ SC13 论点型（封蜡压落）。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容；自下滑入 Δ≤120。
- 幕底 `bg:'dots'` 常驻；SC11 需要 BG_G5 覆写 `{stars:'none', fog:false}`（黑暗舞台，镜头组件内再画局部深色渐晕即可，不要全屏纯黑 div）。

## 3.5 ⚠ 尾部时序硬规则（BGP 片实战教训，违者返工——分镜表顶部也有）
- **每个镜头的最后一个入场/动效拍 ≤ TO−45**；统一 `exitOp(N, TO, 5)` + `glowOffK(N, TO, 3, 5)`；禁 8 帧长淡出。
- 循环"持续动作"一律**低幅呼吸**（320×180 采样下 diff <1.5）；emphasisPulse ≤14f 且与拍同帧起。
- 相机最后 key ≤ TO−50。JSX 大坑：`style={{...abs(), opacity: x}}>` 结尾必须是**两个** `}`——写成 `)}>` 会把后面整段当属性表达式吞掉（BGP SC10 实案，esbuild 单文件可秒定位）。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（重试弧 / LED 流动 / 连线光点 / 涟漪 / spinner 旋转 / 封蜡呼吸 / 纸条流 / 计数滚落）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- **淡入不等于运动**（CDN 教训）：纯 opacity 入场在 320×180 采样下低于 0.35 变化阈值——真运动要 transform 位移/缩放/draw-on。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- **主体尺寸**：薄宽物折叠规则——卡片/纸条要宽 ≥200 或加连体边框/实心亮条头；纯边框空心盒可能被连通域打散（TLS 经验）。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. still 自检（VLM 看图）
```bash
/home/z/my-project/film-ntp-wide/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/film-ntp-wide/stills/<Gn> g<n>
z-ai vision -p "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges 3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD 5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). List concrete problems with locations, or say PASS." -i <still png>
```
发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。
- 每镜头 ≥6 帧 still（入场首+1、中段、落位、末帧）；高光时刻镜头 ≥10 帧。
- 与相邻组的组界帧各出一张（`boundary_*.png`）。
- VLM 若遇 429 限流：等 60 秒重试一次；仍失败则记录"VLM 不可用，肉眼 Read 检查"。

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间，相邻镜头首尾相接（SCxx 的 to = 下一个 SC 的 from−1）；`BG_Gn` 幕底覆写（除 SC11 所在组需要外一般留空）。
- `const N = useCurrentFrame() + F0`（F0 = 组内第一个镜头的 from）；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`（30 帧 3–15 s 属正常，本机 2 核偏慢）。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 7. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 两列读数）、复用图元、关键参数、still 清单与 VLM 发现、未完成/降级项。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。
