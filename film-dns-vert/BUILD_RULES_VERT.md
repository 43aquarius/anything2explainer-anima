# PCAP 竖版（TikTok）— 构建组补充规则（必读，优先级高于通用规则中冲突处）

工程：`/home/z/my-project/film-pcap-vert`（Remotion 4 + React 19 + TS，**720×1280@30fps 竖版**，`lang:'en'`，`bg:'dots'` 点阵波[已竖版化]）
通用协议先读 skill 的 `reference/agent-build-rules.md`（本文与其冲突处以本文为准）。

## 0. 必读文件（按顺序）
1. `/home/z/my-project/anything2explainer/reference/agent-build-rules.md`（协议）
2. 同目录 `reference/style-guide.md`、`reference/motion-vocabulary.md`、`reference/composition-and-light.md`
3. `/home/z/my-project/film-pcap-vert/分镜表.md` — 你负责的组的表 + 末尾「全局约束」（帧区间/节拍/白名单以此为准）
4. `/home/z/my-project/film-pcap-vert/script/timeline.md` — 每句的帧区间与字幕块（字幕由共用层渲染，**镜头里不要画字幕**）
5. `/home/z/my-project/film-pcap-vert/research/pcap-research.md` — 画面数字/术语的事实依据
6. 样片源码按需读：`/home/z/my-project/anything2explainer/examples/rag/shots_src/`（模式对照见 narration-storyboard.md §4；本片大量用到：主体+虚线框 = G1/SC01.tsx，比喻具象物 = G2/SC06.tsx，高光登场 = G2/SC08.tsx，年份/出处 = G2/SC09.tsx，流程 = G3/SC12.tsx，有序过程 = G4/SC16.tsx，点阵平面 = G4/SC17.tsx、G5/SC23.tsx，容器准入 = G4/SC19.tsx，请求→处理→回应 = G6/SC29.tsx，两列清单 = G7/SC33.tsx，循环 = G7/SC37.tsx，大数字 = G8/SC39-41.tsx，收尾象征物 = G8/SC43-44.tsx）

## 1. 本片专用图元（src/ui.tsx 追加，各组共用；不要在组内重造）
- `EXAMPLE` — 贯穿示例常量（url / apiHost / clientIp `198.51.100.24` / serverIp `203.0.113.10` / logLine / wsRows / pageLoad `9.0 s` / requestMs `60 ms` / fixedMs `0.9 s`）。**所有屏上示例文本一律从这里取**，不得自造。
- `PacketIcon` — 信封（= packet 全片母题）：`{cx, cy, w=64, h=44, color, accent(紫), glow, stamp, scale}`。
- `BrowserMock` — 浏览器窗口：`{x, y, w=470, h=380, url, skeleton, progress(0–1 载入条), barColor, dim}`。
- `LogCard` — 服务器日志卡：`{x, y, w≥600, h=320, title='server log', rows, highlight(该行 60 ms 橙显), dim, glow}`。
- `SwitchBox` — 交换机：`{cx, cy, w=560, h=140, ports=6, lit, N(指示灯闪), label, accent}`。
- `TapBox` — 分路器：`{cx, cy, w=180, h=120, label='TAP', accent}`。
- `NICIcon` — 网卡：`{cx, cy, w=420, h=180, chipGlow(混杂模式点亮), label}`。
- `WSWindow` — Wireshark 窗口框：`{x, y, w=1040, h=460, title, paneBorders:[b1,b2,b3](当前面板紫边), children}`。
- `WSRow` — 列表行：`{x, y, w=1040, row:EXAMPLE.wsRows[i], active(紫底光行), dim}`（重传行的 info 自动橙显）。
- `FilterBar` — 过滤条：`{x, y, w=880, h=64, text, shown(打字机字数), dotColor, glowColor}`。
- `ClockIcon` — 小时钟：`{cx, cy, r=60, N(秒针转), accent}`。
- 原有：`CText/TechText/MonoText/Box/Pill/TagBlock/Svg/LineArrow/ArrowH/Check/Cross/DocIcon/DBIcon/ChunkCard/LLMIcon/RackIcon/PersonIcon/CodeCard/Counter/SoftIn/...`（见 agent-build-rules §1）。

## 2. 英文片排版（硬规则）
- 拉丁字母**不 scaleX 压窄**（`SQUEEZE` 常量已按 lang='en' 返回 1，直接用）；居中文字 `dy` 用默认（`TEXT_DY`）。
- 估宽用 `textW(s, size, EM_*)`（`common/textfit.ts`）——一行英文比中文宽得多，别目测。
- 最小字号 22px；`TechText`（Exo 2 紫斜体）只给术语强调，不整句用。
- 直引号 `"` `'`，不用弯引号 `"` `"`；省略号用 `...`。

## 2.5 竖版安全区（替代横版的 y110–620 / x60–1220）
- **内容主区：y 240–990、x 40–620**（右侧 x>620 是 TikTok 按钮列预留；顶部 y<240 是 TikTok UI 预留，HUD 胶囊除外）
- 字幕带 **y1002–1056**、进度条 **y1240–1280** 不放内容
- 中轴 x=360（不是 640！）；安全内容宽度 580（估宽用 textW 时以此为准）
- 字幕由共用层渲染在 y1002（SubtitleLine 已竖版化），镜头里不要画字幕
- 最小字号 22px（手机观看，尽量 24+）；大字可以到 130px
- 自下滑入 Δ≤100；侧向滑入 Δ≤180

## 3. 白名单（分镜表「全局约束」的摘要，冲突以分镜表为准）
- **闪烁（GlitchIn）**：每镜头 ≤1 处，只给分镜表白名单列出的词；**不在表里的镜头零 glitch**。重口味（rgbSplit/slices）只给 SC08 / SC22 / SC33 / SC42。
- **扫光（LightSweep/LightBar/StageLine/GhostText）**：只允许 SC08 与 SC42 出现；其他镜头不得 import。
- **高光时刻**：SC08 登场型（扫光全套）/ SC22 论点型（大字+HaloRing）/ SC33 大数字型（BigNumber+橙光晕）/ SC42 象征物型（扫光紧凑版）。
- **字幕带 y637–690、进度条 y687–720 不放内容**；HUD 区 y<110 不放内容；自下滑入 Δ≤120。

## 4. 持续动作与落位停留（motion_check 达标线）
- 每个字幕块的动词有持续到下一拍的动作（信封流动 / 计数器 / 打字机 / 逐格点亮 / 波纹 / 指示灯闪）。
- **不为凑动作给静止物体加漂浮/呼吸**；找不到动词动作就让它静着（≤3 s 不是缺陷）。
- 段末镜头（分镜表标 ¶ 的）末拍元素落位后停 ≥30 帧再离场；运镜不进末拍。
- 完工前跑：`python3 scripts/motion_check.py <Gn>`（在项目根）。

## 5. still 自检（本片用 VLM 看图，替代肉眼）
```bash
# 出 still（注意：脚本是 bash，不是 zsh）
/home/z/my-project/film-pcap-vert/scripts/still.sh <Gn> <帧列表,逗号分隔> /home/z/my-project/film-pcap-vert/stills/<Gn> g<n>
# 用视觉模型检查（每镜头至少 6 帧：入场首+1、中段、落位、末帧）：
z-ai vision -p "Frame from a black-canvas white-line-art motion graphics explainer (purple accents). Check: 1) any text overlapping other text/elements 2) anything cut off at canvas edges 3) text too small/blurry 4) elements in the bottom subtitle band (y637-690) or under the top HUD 5) color rule violations (only purple=focus, orange=metric/warning, grey=inactive, green=correct). List concrete problems with locations, or say PASS." -i /home/z/my-project/film-pcap-vert/stills/<Gn>/f_XXXX.png
```
发现问题改代码后：`rm -rf build_dev_g<n>` 再重出（bundle 缓存）。
- 每镜头 ≥6 帧 still；高光时刻镜头 ≥10 帧覆盖扫光/白闪/glitch 三段。
- 与相邻组的组界帧各出一张（`boundary_*.png`）。
- still 命令里的 Comp 用 G1/G2/G3（竖版只有 3 组）

## 6. 工程约定（摘要，细则见 agent-build-rules.md）
- 只改 `src/shots/<Gn>/**`；`SHOTS_Gn`（ShotDef[]）填满分镜表区间，相邻镜头首尾相接；`BG_Gn` 幕底覆写（本片一般留空）。
- `const N = useCurrentFrame() + F0`；纯函数；随机只用 `rnd`；禁 `Math.random`。
- 性能红线：禁 `feConvolveMatrix`、`filter: blur()` σ≥1；单帧 DOM ≤600。
- 完工前：`npx tsc --noEmit` + `scripts/test_render.sh <Gn> <起始帧> g<n>`（30 帧 3–15 s 属正常，本机 2 核偏慢）。
- 边做边写盘：每完成 1–2 个镜头就更新 index.ts + BUILD_NOTES.md。

## 7. 交付
`src/shots/<Gn>/BUILD_NOTES.md`：镜头表（id/帧/文件/主角/主角高度px/主角的光/是否高光时刻/运镜/配角数 + motion_check 两列读数）、复用图元、关键参数、still 清单与 VLM 发现、未完成/降级项。
最终回复只需：完成镜头数、tsc 结果、测渲耗时、still 目录、需要主会话决定的事项。
