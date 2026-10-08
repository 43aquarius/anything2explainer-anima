# TCP/UDP 片（横版）— 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-tcpudp-wide`（Remotion 4 + React 19 + TS，1280×720@30fps，`lang:'en'`，`bg:'dots'` 点阵波，slug `tcpudpwide`，TOTAL=10340）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`reference/motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/film-tcpudp-wide/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-tcpudp-wide/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-tcpudp-wide/research/tcpudp-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4；本片常用：主体+虚线框 = G1/SC01.tsx，比喻具象物 = G2/SC06.tsx，高光登场 = G2/SC08.tsx，年份/出处 = G2/SC09.tsx，流程 = G3/SC12.tsx，有序过程 = G4/SC16.tsx，点阵平面 = G4/SC17.tsx、G5/SC23.tsx，两列清单 = G7/SC33.tsx，循环 = G7/SC37.tsx，大数字 = G8/SC39-41.tsx，收尾象征物 = G8/SC43-44.tsx）

## 1. 本片专用图元（src/ui.tsx，追加段在文件末尾；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（call `video call · call.example` / timer `04:12`（示意）/ photoMb `3 MB` / envelopes `2,000+` / to `to: 203.0.113.10` / dnsQuery `where is call.example?` → dnsAnswer `203.0.113.10` / quicId `ID: 7f3a`（示意）/ seqs `#1..#6` / waits `1 s/2 s/4 s` / totalWait `7 s`）。**所有屏上示例文本一律从这里取**，不得自造。
- `PhotoCard` — 真实照片卡：`{x, y, w, h, src(文件名，public/assets/tcpudpwide/), source?('photo: Wikimedia Commons'), note?, scanP?(0–1 扫描线), opacity, children}`。**仅 SC03（fiber_strip.jpg）与 SC11（kahn_modern.jpg + cerf_2007.jpg 双卡）允许用**；出处行常驻 ≥75 帧 ≥50% α。
- `PostcardIcon` — 明信片（= UDP 母题）：`{cx, cy, w=110, h=76, accent(紫), glow, stampP(邮票 0–1), scale}`。
- `PacketIcon` — 信封（= packet/TCP 母题，横版沿用）：`{cx, cy, w, h, color, accent, glow, stamp, scale}`。
- `SeqStamp` — 编号章：`{cx, cy, label('#3'), color=ORANGE, size=40, scale(stampIn 1.4→1), glow}`。
- `HeaderBar` — 头部分段条（UDP 8B / TCP 20B 字段图）：`{x, y, w, h=56, fields:[{label, weight}], accent, labelSize=20, dim, progress(自左 wipe 0–1)}`。
- `CallWindow` — 通话窗口 mock（SC01/SC36 必须用同一组件保证一致）：`{x, y, w=680, h=420, timer, progress(照片环形 0–1), haloP(头像光环 0–1), dim, opacity}`。
- `WaveformStrip` — 语音波形：`{x, y, w, h=120, bars=26, gapFrom/gapTo(豁口索引), breatheP(0–1), revealP(自左展开), color}`。
- `MailboxIcon` / `NodeDot` / `PuzzlePhoto` / `PortRail` / `GamepadIcon` — 见源码注释（邮箱/端点圆/拼图照片/端口数轴/手柄）。
- 原有模板图元照旧可用：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/DocIcon/RackIcon/PersonIcon/Counter/SoftIn/...`（见 agent-build-rules §1）。

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**（`SQUEEZE` 常量已按 lang='en' 返回 1，直接用）；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号；省略号用 `...`。

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词：SC05 `IP`｜SC06 `NOTHING`｜SC10 `TWO`｜SC12 `THE HANDSHAKE`｜SC15 红 `×`｜SC22 `POSTCARD`｜SC24 `8 bytes`｜SC27 `LATE`｜SC32 `HTTP/3`｜SC37 `TCP never loses.`。**不在表里的镜头零 glitch。**
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC10 与 SC37 出现；其他镜头不得 import。
- **高光时刻**：SC06 论点型｜SC10 登场型（扫光）｜SC15 大数字型（1+2+4=7 s，本片最高潮）｜SC24 论点型（8 bytes）｜SC27 论点型（LATE/MEANS DEAD.）｜SC32 论点型（HTTP/3→QUIC→UDP）｜SC37 象征物+回扣型（扫光紧凑版）。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容；自下滑入 Δ≤120。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（信封/明信片流动、编号 stamp、回执折返、打字机、逐格点亮、波形律动、光晕呼吸）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. still 自检（本片用 VLM 看图，替代肉眼）
```bash
/home/z/my-project/film-tcpudp-wide/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/film-tcpudp-wide/stills/<Gn> g<n>
z-ai vision -p "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges 3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD 5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). List concrete problems with locations, or say PASS." -i <still 路径>
```
⚠️ z-ai 网关当前可能 429 限流：每次出 still 后重试 2–3 次（间隔 30–60 s）；仍失败则**降级为 PIL 像素自检**（四象限亮度、主角包围盒存在、边缘裁切检测），并在 BUILD_NOTES 记录「VLM 不可用，已像素自检」。发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。
- 每镜头 ≥6 帧 still；高光时刻镜头 ≥10 帧覆盖扫光/白闪/glitch 三段。
- 与相邻组的组界帧各出一张（`boundary_*.png`）。

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间，相邻镜头首尾相接；`BG_Gn` 幕底覆写（本片一般留空）。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 章界承接（分镜表全局约束 7）：G3 首镜承接章节卡的 TCP 卡、G5 首镜承接 UDP 卡、G7 首镜承接明信片/信封两列——按分镜表写法做。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`（30 帧 3–15 s 属正常，本机 2 核偏慢）。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 7. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 两列读数）、复用图元、关键参数、still 清单与 VLM/像素自检发现、未完成/降级项。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。不要贴大段代码。
