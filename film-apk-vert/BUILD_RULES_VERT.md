# APK 竖版（TikTok）— 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/anima/film-apk-vert`（Remotion 4 + React 19 + TS，**720×1280@30fps 竖版**，`lang:'en'`，`bg:'dots'` 点阵波[已竖版化]，slug `apkvert`，TOTAL=2249）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`reference/motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/anima/film-apk-vert/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/anima/film-apk-vert/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/anima/film-apk-vert/research/apk-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4）

## 1. 本片专用图元（src/ui.tsx，APK 段在文件末尾；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（同横版源：appName `ChatApp` / appSize `120 MB`（示意）/ hexFirst `50 4B 03 04` / dataApp `/data/app` / splitBase `base.apk` / manifestRows 等）。
- `ParcelIcon` — 包裹（= APK 母题，竖版加大默认 190×140）：`{cx, cy, w, h, accent, glow, scale, openP, label, sealP}`。
- `HexDump` — 十六进制窗口（竖版 600×260 默认）：`{x, y, w, h, rows, highlightP, bigPK, dim, title}`。
- `ManifestCard` — 面单卡：`{x, y, w, h, rows, revealP, active, title}`。
- `WaxSeal` — 火漆封印：`{cx, cy, r, glow, crackP, stampP, scale, letter}`。
- `PhoneMock` — 手机（竖版 300×560 默认）：`{x, y, w, h, installP, litN, iconN, screenLabel, glow, dim}`。
- `PathRow` — 路径行：`{x, y, w, path, note, active, size}`。
- `ZipperLine` — 拉链条：`{cx, y, w, openP, tooth}`。
- `SplitChip` — split APK 卡：`{cx, cy, label, dim, active}`。
- `PhotoCard` — 真实照片卡：`{x, y, w, h, src, source, note, scanP, opacity}`。**仅 SC13（android_statues.jpg）允许用**；出处行常驻 ≥75 帧 ≥50% α。
- `ClockIcon` — 时钟：`{cx, cy, r, N, accent}`。
- 原有模板图元照旧：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/Check/Cross/PersonIcon/Counter/SoftIn/GPUChip/ChunkCard/...`。

## 2. 竖版安全区（替代横版的 y110–620 / x60–1220）
- **内容主区：y 240–990、x 40–620**（右侧 x>620 是 TikTok 按钮列预留；顶部 y<240 是 TikTok UI 预留，HUD 胶囊除外）
- 字幕带 **y1002–1056**、进度条 **y1240–1280** 不放内容
- 中轴 x=360（不是 640！）；安全内容宽度 560（估宽用 textW 时以此为准）
- 字幕由共用层渲染在 y1002，镜头里不要画字幕
- 最小字号 24px（手机观看，尽量 26+）；大字可以到 130px+（PK 可到 200px）
- 自下滑入 Δ≤100；侧向滑入 Δ≤180

## 3. 英文片排版（硬规则）
- 拉丁字母不 scaleX 压窄（`SQUEEZE`=1）；估宽用 `textW()`；直引号；省略号 `...`。

## 4. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处：SC01 `ZIP`｜SC03 `is a ZIP archive`｜SC04 `PK`｜SC05 `wax seal`｜SC06 `dies`｜SC07 `binary`｜SC08 `machine language`｜SC10 `/data/data`｜SC12 `/data/app`｜SC13 `still zips`｜SC14 `P, K`｜SC15 `Every app is a zip you can read.`。**不在表里的镜头零 glitch。**
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC04 与 SC15 出现；其他镜头不得 import。
- **高光时刻**：SC01 钩子（改名魔术，前 3 秒）｜SC04 大字型（PK，扫光①）｜SC05 落章型（火漆）｜SC13 论点型（still zips）｜SC15 收束型（扫光②）。
- **运镜清单**（全片 ≥5 处，不进末拍）：SC01 推 1→1.15｜SC03 拉远 1.15→1.0｜SC04 推 1→1.18｜SC05 推 1→1.12｜SC08 推 1→1.12｜SC15 推近收束。

## 5. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（字符交换/打字机/齿轮旋转/格阵级联/光锥扫描/光晕呼吸）。
- **不为凑动作给静止物体加漂浮**；段末镜头末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根，已竖版化采样）。

## 6. still 自检（VLM 看图）
```bash
/home/z/my-project/anima/film-apk-vert/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/anima/film-apk-vert/stills/<Gn> g<n>
z-ai vision -p "Frame from a vertical (720x1280) black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping 2) anything cut off at canvas edges or in the right-edge x>620 danger zone or top y<240 / bottom y>1000 UI zones 3) text too small 4) color rule violations. List concrete problems with locations, or say PASS." -i <still 路径>
```
⚠️ 429 限流重试 2–3 次；降级 PIL 像素自检并在 BUILD_NOTES 记录。改码后 `rm -rf build_dev_g<n>`。每镜头 ≥6 帧 still；高光 ≥10 帧；组界各 1 帧。

## 7. 工程约定
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn` 填满分镜表区间；`BG_Gn` 留空。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`；单帧 DOM ≤600；禁 `feConvolveMatrix`、σ≥1 blur。
- `fx.tsx` 的 `CameraRig` 是画布感知的（竖版 720×1280 自动对），运镜直接用；**`LightSweep` 的默认 `SWEEP_BARS` y 值是横版时代的（y292–378），竖版镜头必须传自定义 `bars`**（参考 tcpudp 竖版 SC13 用过 y470–554）。`StageLine` 默认 cx=640 是横版值，竖版传 `cx={360}`。
- 完工前：`npx tsc --noEmit` + `bash scripts/test_render.sh <Gn> <起始帧> g<n>`。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。
