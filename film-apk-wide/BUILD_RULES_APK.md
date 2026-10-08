# APK 片（横版）— 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/anima/film-apk-wide`（Remotion 4 + React 19 + TS，1280×720@30fps，`lang:'en'`，`bg:'dots'` 点阵波，slug `apkwide`，TOTAL=8999）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`reference/motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/anima/film-apk-wide/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/anima/film-apk-wide/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/anima/film-apk-wide/research/apk-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4；本片常用：主体+虚线框 = G1/SC01.tsx，比喻具象物 = G2/SC06.tsx，高光登场 = G2/SC08.tsx，年份/出处 = G2/SC09.tsx，流程 = G3/SC12.tsx，有序过程 = G4/SC16.tsx，点阵平面 = G4/SC17.tsx、G5/SC23.tsx，两列清单 = G7/SC33.tsx，循环 = G7/SC37.tsx，大数字 = G8/SC39-41.tsx，收尾象征物 = G8/SC43-44.tsx）

## 1. 本片专用图元（src/ui.tsx，APK 段在文件末尾；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（appName `ChatApp` / appPkg `com.example.chat` / appSize `120 MB`（示意）/ fileName `chatapp-release.apk` / hexFirst `50 4B 03 04` / zipYear 1989 / v2Year 2016 / artYear 2014 / dexLimit `65,536` / dataApp `/data/app` / dataData `/data/data` / aabYear 2018 / aabRule `Aug 2021` / splitBase `base.apk` / splitAbi / splitDpi / manifestRows）。**所有屏上示例文本一律从这里取**，不得自造。
- `ParcelIcon` — 包裹（= APK 母题）：`{cx, cy, w, h, accent(紫), glow, scale, openP(0–1 拉链开齿两半分离), label('APK'), labelColor, sealP(0–1 底部火漆封条)}`。
- `HexDump` — 十六进制窗口：`{x, y, w, h, rows, highlightP(0–1 首四字节高亮), bigPK(0–1 大字叠加), dim, title}`。
- `ManifestCard` — 面单（= AndroidManifest.xml）：`{x, y, w, h, rows, revealP(0–1 行 reveal), active(紫), title}`。
- `WaxSeal` — 火漆封印（= v2 签名）：`{cx, cy, r, glow, crackP(0–1 裂纹), stampP(0–1), scale, letter}`。
- `KeyGlyph` — 钥匙：`{cx, cy, w, rotate, glow, scale}`。
- `PhoneMock` — 手机：`{x, y, w, h, installP(0–1 进度), litN(点亮图标数), iconN, screenLabel, glow, dim}`。
- `PathRow` — 路径行：`{x, y, w, path, note, active(紫), size}`。
- `ZipperLine` — 拉链条（横）：`{cx, y, w, openP, tooth}`。
- `SplitChip` — split APK 卡：`{cx, cy, label, dim, active}`。
- `PhotoCard` — 真实照片卡：`{x, y, w, h, src(文件名，public/assets/apkwide/), source, note, scanP, opacity}`。**仅 SC55（android_statues.jpg）允许用**；出处行常驻 ≥75 帧 ≥50% α。
- `ClockIcon` — 时钟：`{cx, cy, r, N, accent}`。
- 原有模板图元照旧可用：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/DocIcon/DBIcon/ChunkCard/GPUChip/RackIcon/PersonIcon/CodeCard/Counter/SoftIn/...`（见 agent-build-rules §1）。

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号；省略号用 `...`。

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词（SC03 `ZIP`｜SC06 `is a ZIP archive`｜SC08 `1989`｜SC12 `ZIP`｜SC15 `PK`｜SC16 `an index`｜SC21 `JAR`｜SC28 `tampered?`｜SC32 `SIGNING BLOCK`｜SC34 `faster`｜SC39 `/data/app`｜SC40 `dex2oat`｜SC42 `ART`｜SC45 `/data/data`｜SC46 `Ten seconds.`｜SC50 `2021`｜SC54 `still zips`｜SC58 `P, K`｜SC59 `Every app is a zip you can read.`）。**不在表里的镜头零 glitch。**
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC15 与 SC59 出现；其他镜头不得 import。
- **高光时刻**：SC03 揭示型｜SC15 大字型（PK，扫光①）｜SC32 落章型（v2 签名块）｜SC48 反转次高光（never unzipped，不扫光不 glitch 大字外的额外特效）｜SC59 收束型（扫光②）。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容；自下滑入 Δ≤120。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（字符交换、打字机、光标巡行、光锥扫描、齿轮旋转、格阵级联、光晕呼吸）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. still 自检（本片用 VLM 看图，替代肉眼）
```bash
/home/z/my-project/anima/film-apk-wide/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/anima/film-apk-wide/stills/<Gn> g<n>
z-ai vision -p "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges 3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD 5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). List concrete problems with locations, or say PASS." -i <still 路径>
```
⚠️ z-ai 网关可能 429 限流：每次出 still 后重试 2–3 次（间隔 30–60 s）；仍失败则**降级为 PIL 像素自检**（四象限亮度、主角包围盒存在、边缘裁切检测），并在 BUILD_NOTES 记录「VLM 不可用，已像素自检」。发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。
- 每镜头 ≥6 帧 still；高光时刻镜头 ≥10 帧覆盖扫光/白闪/glitch 三段。
- 与相邻组的组界帧各出一张（`boundary_*.png`）。

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间，相邻镜头首尾相接；`BG_Gn` 幕底覆写（本片一般留空）。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 章界承接（分镜表全局约束 7）：G3 首镜 SC10 承接章节卡 `1989` 时间倒转、G5 首镜 SC26 承接 SC25 包裹飞入手机、G6/G7/G8 按分镜表承接写法做。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`（30 帧 3–15 s 属正常，本机 2 核偏慢）。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。
