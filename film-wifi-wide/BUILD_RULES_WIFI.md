# WiFi 片 — 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-wifi-wide`（Remotion 4 + React 19 + TS，1280×720@30fps，`lang:'en'`，`bg:'dots'` 点阵波）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。
> 本文件由 `film-ntp-wide/BUILD_RULES_NTP.md` 复制改写（NTP → WiFi）；与 WiFi 分镜表冲突处，以分镜表为准。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`motion-vocabulary.md`、`composition-and-light.md`
3. `/home/z/my-project/film-wifi-wide/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-wifi-wide/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-wifi-wide/research/wifi-research.md` — 画面数字/术语的事实依据
6. 模式对照（上一部同管线影片源码，风格最接近）：`/home/z/my-project/film-ntp-wide/src/shots/`（G1–G4 各组；组内共用件看 G2/g2ui.tsx；章首承接看 G2/SC05.tsx）

## 1. 本片专用图元（派单口径为 src/ui.tsx 已备；**实测 ui.tsx 仍是 CDN 片图元，WiFi 件缺失**）
- `BackoffRing`（随机暂停环）/ `DeviceGlyph`（笔记本·手机·电视）/ `AirPulse`（说话弧）/ `RouterGlyph`（路由器）/ `ChannelBand`（2.4 GHz 频谱带）——缺件时按协议「缺什么在组目录补」，全套建在 `src/shots/<Gn>/g2ui.tsx`（G2 组已建 BackoffRing/DeviceGlyph/AirPulse/RouterGlyph/EarGlyph + EX，可直接复制提升进 ui.tsx；ChannelBand 未建，G3 需要）。
- `EXAMPLE`（全片统一示例语境，分镜表 全局约束 §2）：`your laptop` / `your phone` / `your TV` / `the router` / `net A` / `net B` / `you` / `1997` / `2 Mbit/s` / `1` `6` `11` / `request` / `reply`。**ui.tsx 现存 EXAMPLE 是 CDN 片内容，勿用**；G2 组在 g2ui.tsx 的 `EX` 提供同口径子集。
- 系列母题沿用：`PacketIcon`（信封）、`BrowserWin`（浏览器/播放器）、`ClockIcon`、`GPUChip`（芯片）、原有模板图元照用（`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/SoftIn/...`）。

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**（`SQUEEZE` 常量已按 lang='en' 返回 1，直接用）；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号；省略号用 `...`。

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词；**不在表里的镜头零 glitch**。WiFi 片表：SC03 `one talker at a time`(6) / SC09 `neither is heard`(4) / SC13 `the air, taking turns`(6, 高光) / SC14 第一行(8)。**SC01/SC02/SC04/SC05/SC06/SC07/SC08/SC10/SC11/SC12 零 glitch**（SC14 由主会话构建）。
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC14（主会话构建）；**其余镜头一律不得 import**。
- **高光时刻**：SC03 论点型（轮流聚光）｜SC09 事件型（隐藏节点撞车）｜SC13 论点型（空气在轮流）｜SC14 金句收束。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容；自下滑入 Δ≤120；无流程轨章（内容主区 y 110–620）。
- 幕底 `bg:'dots'` 常驻；不画不透明黑底。

## 3.5 ⚠ 尾部时序硬规则（BGP 片实战教训，违者返工——分镜表顶部也有）
- **每个镜头的最后一个入场/动效拍 ≤ TO−45**；统一 `exitOp(N, TO, 5)` + `glowOffK(N, TO, 3, 5)`；禁 8 帧长淡出。
- 循环"持续动作"一律**低幅呼吸**（320×180 采样下 diff <1.5）；emphasisPulse ≤14f 且与拍同帧起。
- 相机最后 key ≤ TO−50。JSX 大坑：`style={{...abs(), opacity: x}}>` 结尾必须是**两个** `}`——写成 `)}>` 会把后面整段当属性表达式吞掉（BGP SC10 实案，esbuild 单文件可秒定位）。
- 末拍簇需在离场前留 ≥36f 安静（含 6f 灭光扣除，motion hold 数学）。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（弧循环 / LED 闪 / 扫描呼吸 / 骰点呼吸）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- **淡入不等于运动**：真运动要 transform 位移/缩放/draw-on。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- **主体尺寸**：卡片宽 ≥200 或加连体边框；纯边框空心盒可能被连通域打散。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. 自检（摘要）
- 每镜头 ≥6 帧 still + 组界 2 帧；VLM 429 时等 60s 重试一次，仍失败记录后肉眼 Read 检查。
- 发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间；`BG_Gn` 留空（dots 幕底常驻）。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600；SVG filter 实例 ≤6。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 7. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 读数）、复用图元、关键参数、still 清单与 VLM 发现、未完成/降级项、对共用层的建议。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。
