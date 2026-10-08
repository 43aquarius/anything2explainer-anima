# G3 构建笔记（SC13–SC15 · 竖版 APK 片终章）

帧区间：SC13 1877–1997 / SC14 1998–2089 / SC15 2090–2249（= TOTAL 2249，片末不归零）。
tsc：三镜全部注册后 `npx tsc --noEmit` 零错误。

## 镜头表

| 镜头 | 帧 | 文件 | 内容 | 主角 / 高度 | 主角的光 | 高光时刻 | 运镜 | 配角数 |
|---|---|---|---|---|---|---|---|---|
| SC13 | 1877–1997 | SC13.tsx | 真实照片卡（android_statues.jpg 暗调+扫描线+出处行）+ 三枚 SplitChip（base 紫亮/两枚灰暗删除线）+ `still zips` 84px GlitchIn rgbSplit6 | `still zips` 84px（照片卡 244px 为载体） | base HeroGlow 呼吸 + 大字紫晕呼吸 | ★论点型（真实素材+论点） | 33 帧 1→1.1 @1913–1946（锚点 360,648） | 3（照片卡、三 chip） |
| SC14 | 1998–2089 | SC14.tsx | 承接 SplitChip 行（scale1.1 复现 SC13 末帧相机）淡出 + 缩微字节窗 0.45×（首两格 50 4B 紫亮）+ 引线 + `P, K` 150px GlitchIn rgbSplit6 + 紫晕爆发→呼吸 + 其余区域 30% 黑罩 | `P, K` 150px | 大字紫晕（爆发→呼吸） | —（段内无） | 无 | 2（缩微窗、引线） |
| SC15 | 2090–2249 | SC15.tsx | ★片尾收束：三轮 LightSweep（384/572/736 竖版几何）+ 发光竖线 draw-on + 白闪 3 帧 + `Every app is a zip / you can read.` 56px×2 GlitchIn rgbSplit8（前挂 −4）+ 3 信封 3px/帧纵向下行；不归零 | 大字两行 56px×2 | 扫光+白闪+紫晕（片尾唯一大面积光） | ★收束型（扫光白名单②，全片最后一次 glitch） | 无（末拍不运镜） | 3（3 信封） |

## 关键参数与编排决策

- **SC13 布局**（1.1 推近后的安全界内）：照片卡 (128,300,464×244)；三 chip cx 135/315/495（长标签 config.arm64_v8a.apk 放中列，墨迹右缘 1.1× 后 ≤599<620）；大字 cy 856 单行（Audiowide 84px 实测 399px 宽，fontTools 量取）。节拍：1885 照片滑入（Δ120 自左）→ 1887/1889/1891 chip 错峰 SoftIn → 1905 扫描线（周期 40）→ 1920/1926 删除线 wipe → 1957 大字 glitch → 1990–1997 末 8 帧归零。
- **删除线在运镜中段（1920/1926）划过**：运镜（1913–1946）期间无 GlitchIn、无错峰入场（chip 1899 已落位停 14 帧）；删除线是已落位元素的强调 wipe，非入场。运镜结束 1946 距 glitch 1957 有 11 帧静场、距离场 1990 有 44 帧（≥30 ✓）。
- **SC13→SC14 承接**：SC13 末 8 帧只归零「照片+大字」，SplitChip 行保持满态到 1997；SC14 以 `transformOrigin:'360px 648px' scale(1.1)` 同参数再现（与 CameraRig 数学等价），1998 起先灭光（2002–2007）再淡出（→2008），交界帧像素一致。
- **SC14 离场口径**：分镜表「离场 2054−8」为 S14.to+2 旧口径（与横版 SC15 BUILD_NOTES 记录的同类情况一致）——按镜头区间末 8 帧执行（2082–2089 归零），否则 2055–2089 将空场 35 帧。停留：大字入场 2006 → 离场 2082 = 76 帧 ≥30 ✓。
- **SC15 拍**：glitch 前挂 4 帧（f0=2094 = 节拍 2098−4），落定 2115；endingFade=6 压黑层自 2142 起（ENDING_RANGE = S15.to−6），满态 27 帧 + 光晕延续（双倍预算口径 (2148−6)−2098=44 ✓，glitch 12 帧半程暗帧已计入）。压黑后 2148–2249 纯黑尾段为设计使然（同 pcap 竖版 SC13 / 横版 SC42 尾段）。
- **SC15 大字断行**：`Every app is a zip`(436px) / `you can read.`(344px)——与横版 SC59 同断法；平衡断法 `a zip you can read.`(546px) 会出 x620 安全界 13px（Noto900 56px 实测），故不取。
- **SC15 信封**：3 枚 2112 起 3px/帧纵向下行（250,470)/(478,545)/(360,310)；至 2249 全程 y≤972，不进字幕带 y1002–1056；画在大字之前（从字后穿过），持续至压黑不归零。
- **MiniHex（SC14 缩微窗）**：分镜表「HexDump 缩微 0.45×」按 G1/SC04 主角字节窗（g1ui.VertHex）的**等参数移植**（g3ui.tsx VertHexMini，8 列×5 行同坐标同递推）后 0.45× 缩放——回扣视觉与 SC04 同源（本片从未出现 12 列共用 HexDump，G1 BUILD_NOTES 已记录其溢出竖版）。缩微后字粒 ~10.8px 为刻意的记忆回扣（非新信息），可读信息由 150px `P, K` 承担。
- 事实对账：photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons / base.apk / config.arm64_v8a.apk / config.en.apk / still zips / 50 4B（缩微窗首两格）/ P, K / Every app is a zip you can read.——全部在派单事实清单内；2016/2021 未上画面（字幕层文本不归本组）。

## 共用层建议

- PhotoCard 的 source 行未设 fontFamily（继承祖先）——本组在 SC13 根 div 上设 FONT_HEAVY 兜底；建议后续把 `fontFamily: FONT_HEAVY` 写进 ui.tsx PhotoCard。
- SplitChip 标签 17px 低于竖版最小字号 24px（共用组件，本组不改）——若 QC 认定问题，需在 ui.tsx 加 size prop。

## 自检记录

- `npx tsc --noEmit`：0 错误。
- test_render G3@1877（30 帧）：见下（补）。
- stills：见下（补）。
- motion_check：见下（补）。
