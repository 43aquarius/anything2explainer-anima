# G7 构建笔记（第 3 章下半上半段：SC40–SC44，S40–S44）

工程：/home/z/my-project/anima/film-apk-wide · 组：G7 · Agent: apkwide-G7-builder
规则依据：BUILD_RULES_APK.md > agent-build-rules.md > style/motion/composition > 分镜表 G7 + 全局约束 > timeline S40–S44。

## 节拍核对（timeline S40–S44 字幕块，subs.ts 实测）

S40 5832–5899「Then the real magic: dex2oat.」（段内）｜
S41 5910「Older Android ran apps through an interpreter,」/ 5988「Dalvik, a few lines at a time.」（段内）｜
S42 6058「Since Android 5.0, the runtime is ART,」/ 6165「and at install it compiles classes.dex」/ 6237「into machine code for your exact CPU.」（¶）｜
S43 6316「That is the optimizing bar you see」/ 6371「when your phone updates itself:」/ 6433「every app on the device, recompiled.」（段内）｜
S44 6511「A single dex file tops out」/ 6557「at 65,536 methods.」/ 6660「Big apps just carry more of them.」（¶+gap15）。

镜头区间（分镜表）：SC40 5824–5901 / SC41 5902–6049 / SC42 6050–6307（¶）/ SC43 6308–6502 / SC44 6503–6748（¶+gap15）。
组界：上行 G6/SC39 末 5823（已核 SC39.tsx：exitOp 至 5823 归零、目录屋 x 770–1110 不与本组首元素重叠）；下行 G7b/SC45 起 6749（SC44 末 8 帧归零即让位）。

## 白名单执行

- glitch：仅 SC40 `dex2oat`（rgbSplit 7 @5846）与 SC42 `ART`（rgbSplit 6 @6058）。SC41/SC43/SC44 零 glitch ✓。
- 扫光：本组无（未 import LightSweep/LightBar/StageLine/GhostText）✓。
- 高光时刻：SC40 = 章 3 最高潮（魔法型，分镜表 ★，无扫光编排——用清场 + GlitchIn + 光晕爆发 + 转换带）。
- 事实核对：屏显文本全部来自 EXAMPLE / 分镜表指定文案：dex2oat / the real magic: / THEN / 2008 / 2013 / Dalvik / interpreter · a few lines at a time / Android 5.0 / NOW / ART / classes.dex / install time / machine code / your exact CPU / Optimizing app / 1 of N / methods per dex / 65,536（= EXAMPLE.dexLimit）/ classes2.dex / classes3.dex / +65k（分镜表明文的示意注记）。滚动行内容为确定性伪随机 hex 字节（与共用 HexDump 同款纹理，无数值语义）。

## 逐镜记录（边做边 append）

### SC40 ★dex2oat（5824–5901）✅
- 清场（5824–5831 空镜）→ 5832 `the real magic:`（灰 34px）SoftIn → 5846 `dex2oat`（Orbitron 110px 白+3px 紫描边，≈538px 宽）**GlitchIn rgbSplit 7（本镜唯一）** → 5858 满态 + emphasisPulse 1.12 + 紫描边光晕爆发（34px→指数收敛 + 30f ±5px 呼吸，持续）。
- 5862 转换带（x 300–980，行 y 486/514/542）左右两段 16f 相向 wipe（左段自 x 300 向齿轮、右段自 x 980 向齿轮）+ 5858 齿轮 scaleIn 14f；左 3 行灰 hex 字节（TickerRow 18px，3.4px/f 右行）→ 齿轮（白 3px，1.5°/帧全镜旋转）→ 右 3 行绿 `0xA9BF` 样式机器码（4.8px/f）；两枚白色 › 流向小箭头（淡入）。
- 运镜：CameraRig 33f 1→1.15 推向大字（5824–5857，锚 (640,340)）。**偏离 A1**：末 11f 与 glitch 重叠（分镜表把 glitch 钉在 5832+14、33f 推近只能自镜头首帧起算才能同镜共存；easeInOut 尾段相机接近静止，且推完帧 = glitch 满态帧，与 G1/SC03「推近止于揭示瞬间」同型）。belt 落位 5878 后相机已静止 ≥16f（末拍无运镜 ✓）。
- 段内镜头（停留不判）；末 8 帧归零（大字光晕 glowOffK 先灭 6f）。
- 主角：`dex2oat` 110px（≥96px 大字）+ 转换带组；光：大字紫描边光晕（唯一大面积光）+ 齿轮白 bloom。配角：灰引导行 / 两段滚动带 / 两枚小箭头 = 4。

### SC41 Dalvik 时代（5902–6049）✅
- 5910 代码卡（400,220,480×280，主角组 280px）slideUp Δ90/18f + 手指 firstOp；5910 `THEN` 灰 Pill SoftIn + 5912 时间轴小段（118–318 灰线 + 箭头 + `2008`/`2013` 22px 灰 + 3 刻度）。
- 5916 起手指每 14f 步进一个 3 行窗（12 行 / 4 窗，取模回卷 = 解释器循环；步进后 5f 平滑滑到位），当前窗白亮 0.94±0.06 闪（解释执行感，行相位错开），旧窗 10f 内 0.9→0.4 渐暗，未照行 0.3。
- 5988 `Dalvik` 灰 Pill（415,172）+ 卡下 `interpreter · a few lines at a time`（灰 mono 20px @ (640,538)）SoftIn。
- 段内镜头；末 8 帧归零（手指步进持续到离场帧，全程持续动作 ✓）。
- 主角：代码卡+手指 280px；光：亮行白（分镜表「亮行白」——非紫，大面光留白是本镜刻意的「旧时代暗感」）。配角：THEN Pill / 时间轴 / Dalvik 标 / 底行小字 = 4。

### SC42 ART 到来（6050–6307，¶）✅
- 6058 `Android 5.0` 白 Pill + `NOW` 紫 Pill stampIn（1.35→1 powIn 10f + 白闪 2f，2f 错峰）+ 芯片上方 `ART`（Audiowide 84px 白+紫描边）**GlitchIn rgbSplit 6（本镜唯一）**；6064 GPUChip（cx 900，cy 330，size 260，grid 6×6）scaleIn 21f（主角 260px，恒定 0.5 紫光）。
- 6165 classes.dex 卡（DexFileCard 250×160 @ 250,265：白边 + 折角 dex 图标 + `classes.dex` mono 20px + 3 行 16px 滚动 hex 源码流动）slideUp Δ90/16f + 6168 粗箭头（506→748，rodW 5）draw-on 20f + `install time`（mono 20px @ (627,298)）6180 SoftIn。
- 格阵级联：GPUChip lit=(N−6165)/72，**2f/格 × 36 格 = 72f，完成于 6237**（分镜表「每格 3 帧」×36=108f 与「6237 点亮完成」自相矛盾，取 6237 完成口径，见偏离 A2）。
- 6237 完成时：芯片 HeroGlow 紫光爆发（k 0→0.95@6244→0.35 收敛 + 30f 呼吸）+ GPUChip glowK 脉冲 0.5→1→0.72 + `machine code`（mono 22px 白 @ (900,497)）打字机 2f/字 + 等宽光标闪烁（6261 完）+ `your exact CPU`（灰 mono 20px @ (1100,182) + 引线指向芯片角）6240 SoftIn。
- 停留：末拍（machine code 6261 完 / your exact CPU ~6248 完）→ 离场 6300（TO−8），hold ≥38f ✓；末 8 帧归零。
- 主角：芯片 260px；光：芯片紫光（爆发 + 呼吸，唯一大面积光）。配角：两 Pill / dex 卡 / 箭头+标签 / machine code / your exact CPU = 6。

### SC43 优化条（6308–6502）✅
- 6309 PhoneMock（0.9×：216×432 @ 532,154，主角 432px）slideUp Δ100/18f；6316 屏内 `Optimizing app` / `1 of N`（mono 20px 两行 @ cy 322/352）+ 进度条（156×12 @ (562,396)）SoftIn + 百分比（Orbitron 26px 紫）计数推进（6320→6490 到 100%，持续动作）。
- 6371 更新帽 stampIn（1.35→1 + 白闪 2f，帽顶 y 124 不进 HUD 区）。
- 6433 六枚环绕 app 图标（AppDot r 22，椭圆环布位避开手机正上（帽子）与正下：左上/左/左下/右下/右/右上）逐一 pop + 白闪 2f + 紫光保持。**偏离 A3**：分镜表「每 16 帧」装不下（6433+5×16=6513 > 离场 6495，第 6 枚永远点不亮，与「每一个都重编」语义冲突）→ 取 10f 间隔（6433…6483），全部点亮 ≈6489、进度条同步到 100%。
- 段内镜头；末 8 帧归零。
- 主角：手机 432px；光：屏内进度条紫光 + 点亮图标紫光。配角：更新帽 / 6 图标 / 屏内文字 = 8。

### SC44 65536（6503–6748，¶+gap15）✅
- 6511 `methods per dex`（灰 24px @ (640,208)）SoftIn；6557 `65,536`（Orbitron 120px 白+紫硬投影，终值 = EXAMPLE.dexLimit）20f 计数 0→65,536 → 6577 落定 + emphasisPulse 1.12 + 紫投影偏移脉冲一次（6→10→6 / 16f）→ tabular 呼吸微光（0 0 24±10px，30f 周期，持续）。
- 6660 三枚 dex 卡（200×82 @ cx 400/640/880, y 468）2f 错峰 slideUp Δ70/16f → 逐张亮起（6674/6688/6702：灰边→紫边 + GLOW_PURPLE_S 8f 渐亮），每张亮起时上方 `+65k`（Orbitron 22px 灰）浮出上移 14px / 30f 渐隐。
- 停留：末张亮起完成 6710 → 离场 6741（TO−8），hold ~31f ≥30 ✓（分镜表「离场 6713−8」为 S44.to+2 旧口径，按镜头区间 6748 执行，与 G6 BUILD_NOTES §A2 同例——组界 6748|6749 给 G7b SC45 起新场景）。
- 主角：`65,536` 120px 大字（≥96px）；光：紫硬投影 + 呼吸微光（唯一大面积光）。配角：三 dex 卡 + 上方小字 = 4。

## 镜头表（composition-and-light §5）

| 镜头 | 主角 | 主角高度 | 主角的光 | 高光时刻 | 配角/标签 | motion_check（见下） |
|---|---|---|---|---|---|---|
| SC40 | `dex2oat` 大字+转换带 | 110px 大字 | 大字紫描边光晕（爆发+呼吸） | ★章 3 最高潮（魔法型） | 4 | 见自检节 |
| SC41 | 代码卡+手指 | 280px | 亮行白（分镜表指定） | — | 4 | 见自检节 |
| SC42 | GPUChip | 260px | 芯片紫光（爆发+呼吸） | — | 6 | 见自检节 |
| SC43 | PhoneMock 0.9× | 432px | 进度条+点亮图标紫 | — | 8 | 见自检节 |
| SC44 | `65,536` 大数字 | 120px 大字 | 紫硬投影+呼吸微光 | — | 4 | 见自检节 |

## 偏离记录

- A1 SC40 运镜/glitch 重叠 11f：见逐镜记录（分镜表钉死 glitch@5832+14 与 33f 推近，二者在本镜 78f 内无法完全错开；取「推近止于揭示」编排，推完 = glitch 满态帧 5858）。
- A2 SC42 格阵级联节奏：分镜表「每格 3 帧级联，共 36 格」（108f）与其「6237 点亮完成」（6165+72f）矛盾；取 6237 完成口径（2f/格），点亮完成帧与 S42 第三块字幕「into machine code for your exact CPU」严格同步。
- A3 SC43 图标点亮间隔 16f→10f：见逐镜记录（区间装不下 6 枚×16f）。
- A4 字号：分镜表明文指定的等宽纹理/小标签沿用其 18/20px（字节码滚动行、install time、your exact CPU、屏内 Optimizing、dex 卡标签），与本片共用图元先例一致（HexDump 18px 字节、ManifestCard 16px 行）；其余新加文字一律 ≥22px。
- A5 SC41 手指步进窗口到顶后取模回卷（分镜表未写回卷；「解释器循环执行」语义 + 镜头 148f 长于 4 窗×14f 步进，回卷保证持续动作不穿卡底）。

## 自检（完工后回填）

- tsc：待跑
- test_render：待跑
- stills / VLM / motion_check：待跑
