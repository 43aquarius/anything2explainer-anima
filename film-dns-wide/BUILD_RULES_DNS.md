# DNS 片 — 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-dns-wide`（Remotion 4 + React 19 + TS，1280×720@30fps，`lang:'en'`，`bg:'dots'` 点阵波）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/film-dns-wide/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-dns-wide/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-dns-wide/research/dns-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4；本片常用：主体+虚线框 = G1/SC01.tsx，比喻具象物 = G2/SC06.tsx，高光登场 = G2/SC08.tsx，年份/出处 = G2/SC09.tsx，有序过程 = G4/SC16.tsx，请求→处理→回应 = G6/SC29.tsx，两列清单 = G7/SC33.tsx，大数字 = G8/SC39-41.tsx，收尾象征物 = G8/SC43-44.tsx）

## 1. 本片专用图元（src/ui.tsx 追加，各组共用；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（domain `shop.example` / ip `192.0.2.33` / tld `.example` / resolver `1.1.1.1` / enterMs `≈0.5 s` / walkMs `≈100 ms` / cacheMs `≈1 ms` / ttl `60 s` / rootLetters `A – M` / rootCount `13` / instCount `2,047` / fbMin `11 min` / volDay `1.9 T` / volSec `22,000,000 / second` / noteRows）。**所有屏上示例文本一律从这里取**，不得自造。
- `PacketIcon` — 信封（系列母题，跨片沿用）：`{cx, cy, w, h, color, accent(紫), glow, stamp, scale}`。DNS 片中 = 在途请求/数据。
- `StickyNote` — 便签（= 缓存答案母题）：`{x, y, w, h, lines[], ttl, ttlColor, lit, tilt, seed}`。
- `MilkCarton` — 牛奶盒（TTL 保质期比喻）：`{cx, cy, w, h, label, dateText, glow}`。
- `PostcardIcon` — 明信片（plaintext 比喻）：`{x, y, w, h, lines[], stampText, dim}`。
- `PhoneBookIcon` — 电话簿（书名 `DNS`）：`{cx, cy, w, h, label, fallen(倒下), tilt}`。
- `PhoneIcon` — 老电话（HOSTS.TXT 时代）：`{cx, cy, w, h, lift(0..1 听筒提起), accent}`。
- `StampSeal` — 圆章（DNSSEC 签名）：`{cx, cy, r, text, p(0..1 盖下), color}`。
- `TreeTier` — 层级树（root→TLD→叶）：`{cx, cy, w, tlds[], leafCount, progress(0..1), litLeaf}`。
- `EyeGlyph` — 眼睛（明文被读）：`{cx, cy, w, open(0..1)}`。
- `RootTower` — 根塔（THE ROOT 具象）：`{cx, cy, w, h, units, heat(0..1 熔化橙)}`。
- 原有模板图元照用：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/DocIcon/DBIcon/ChunkCard/RackIcon/PersonIcon/CodeCard/Counter/ClockIcon/SoftIn/...`

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**（`SQUEEZE` 常量已按 lang='en' 返回 1，直接用）；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号；省略号用 `...`。

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词；**不在表里的镜头零 glitch**。重口味（rgbSplit/slices）只给 SC08 / SC11 / SC14 / SC16 / SC23 / SC27 / SC28 / SC33。
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC11 与 SC33 出现；其他镜头不得 import。
- **高光时刻**：SC08 论点型（层级树+大字）/ SC11 登场型（扫光全套）/ SC16 论点型（四柜台全景）/ SC23 大数字型（BigNumber+橙光晕，全片最高潮）/ SC33 象征物型（扫光紧凑版）。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容（Ch2 有流程轨 y<175）；自下滑入 Δ≤120。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（信封流 / 倒计时 / 打字机 / 逐行 wipe / 指示灯闪 / 热浪 / 眨眼 / 潮汐漫涨）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. still 自检（本片用 VLM 看图，替代肉眼）
```bash
# 出 still（脚本是 bash）
/home/z/my-project/film-dns-wide/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/film-dns-wide/stills/<Gn> g<n>
# 用视觉模型检查（每镜头至少 6 帧：入场首+1、中段、落位、末帧）：
z-ai vision -p "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges 3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD 5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). List concrete problems with locations, or say PASS." -i /home/z/my-project/film-dns-wide/stills/<Gn>/f_XXXX.png
```
发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。
- 每镜头 ≥6 帧 still；高光时刻镜头 ≥10 帧覆盖扫光/白闪/glitch 三段。
- 与相邻组的组界帧各出一张（`boundary_*.png`）。
- VLM 若遇 429 限流：等 60 秒重试；连续失败则自己肉眼 Read 图片检查并记录"VLM 不可用，肉眼检查"。

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间，相邻镜头首尾相接；`BG_Gn` 幕底覆写（本片一般留空）。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 完工前：`npx tsc --noEmit` + `scripts/test_render.sh <Gn> <起始帧> g<n>`（30 帧 3–15 s 属正常，本机 2 核偏慢）。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 7. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 两列读数）、复用图元、关键参数、still 清单与 VLM 发现、未完成/降级项。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。
