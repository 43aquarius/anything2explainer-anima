# G3 构建说明（第 2 章下：S14–S16，层叠金字塔 · SC08）

组员：SC08（stratum 金字塔——**本片高光时刻·论点型**；S14 1512/1539 + S15 1576 + S16 1656/1711/1779；¶+gap20 章末，TO=1842 停在 C3 章节卡 1843 前一帧）。

## 镜头表

| 镜头 | 帧 | 文件 | 主角 | 主角高度px | 主角的光 | 高光时刻 | 运镜 | 配角数 | motion_check 最长静止 / hold |
|---|---|---|---|---|---|---|---|---|---|
| SC08 | 1504–1842 | SC08.tsx | 全幅 stratum 阶梯金字塔（塔尖 AtomClock + 4 层 StratumTier + 2 渐隐层） | ~400px（y132–536，含塔尖） | 塔尖 GlowBlob 紫（r92，N 驱动低幅呼吸）+ 1656 白闪一拍 + 大字紫描边/紫晕 | **是**（论点型：分层金字塔论点 + `stratum 1–15` GlitchIn 收束） | 慢推 1.0→1.15（1504–1711）→ 段末拉远 33f 1.15→1.0（1744–1777，终镜收束；末 key 1777 ≤ TO−50 ✓） | 9（刻度尺 1–15 / `stratum` 术语标签+引线 / `stratum 1`+`talks to the atom` / 2 上行信封 / 层间短连线 / 底部大字） | 1.4s / 39f ✓ |

## 节拍落位（timeline 对齐；分镜表 1656/1711/1779 与 timeline S16 三块对齐后采用后者）
- **1507**（1512−5，容差 −6 内）：金字塔轮廓自顶向下 draw-on——塔尖占位柜体 8f → 6 条层条左→右 wipe 各 8f 链式错峰（一层画完下一层起，级联至 1563）+ 层间短连线随下层淡入。
- **1539**（S14.c2 from the source）：AtomClock 源头显现（0.94→1 缩入 + 交叉淡出占位轮廓；核心脉冲 + 读数末位翻动 = 持续动作）。
- **1576**（S15 NTP calls each layer a stratum）：`stratum` 术语标签（顶左 Exo 2 紫斜体 34px）SoftIn + 引线 draw-on 10f 指向塔尖 + 右缘刻度尺灰态浮现（导轨 + 15 刻度）。
- **1656**（S16.c1 stratum one talks to the atom）：塔尖点亮——白闪一拍（brightness 0.85 峰 + 扩散环）+ GlowBlob 紫光 + AtomClock 提亮 BLOOM + `stratum 1`（Orbitron 亮紫）/`talks to the atom`（灰 Exo 2）右侧错峰 SoftIn + 刻度①亮。
- **1711**（S16.c2 stratum two asks stratum one）：第二、三层错峰点亮（1711/1721，lit 切换 + 亮度闪光）+ 两枚上行信封沿右坡虚线飞向塔尖（1715/1737 起飞各 26f，到站吸收 + 小环闪；"asks"=请求上行）+ 刻度②③亮。
- **1779**（S16.c3 and so on, down to fifteen）：波次点亮到底（2f/层：T3@1779→G2@1785）+ 刻度 4…15 逐个亮（1.2f/个，末三个 13/14/15 渐隐 0.55/0.38/0.22）+ 底部 `stratum 1–15` 大字 GlitchIn（rgbSplit 6，**本镜唯一 glitch，白名单**）+ 塔低幅呼吸（GlowBlob 内建 + 大字紫晕微呼吸）。
- **尾部**：末拍拍点 1779 ≤ TO−45=1797 ✓；元素落位 ~1796 → 灭光 1834–1837（glowOffK(3,5)）→ 离场 1837–1842（exitOp 5）；hold 39f ≥30 ✓。

## 关键几何与参数
- 塔尖 AtomClock w132×h146（cy 205，读数 16px×0.69≈11px 图标级——SC05 才是原子钟主场，此处为塔尖徽记）；4 层 StratumTier y 290/334/378/422（h36，w 270→560，n 芯片 2→4，向下 wrapper 透明度 1→0.88 渐灰）；2 ghost 层 y 466/506（h 32/30，w 680/700，dim+op 0.4/0.2 表示"到十五"的延续渐隐）。
- 右缘刻度尺为**独立数量轴**（Orbitron 22px，y 204–561 均布 25.5px/格，数字右缘 x1030）：①对齐塔尖 cy、⑮沉入渐隐区下方——金字塔是定性示意（5+2 层），刻度尺把数数到 15；分镜表"逐层刻度"按此解读（行对齐在 15 均匀刻度下数学不可行，已在表内记录）。
- 上行信封为**右坡飞行**（T1/T2 右肩 → 塔尖右下角 (668,232)，quad 贝塞尔 + 虚线引导）：分镜表"层间连线上行信封小点"在 7px 层缝中不可见，改为沿坡爬升 150px（视觉等价：请求逐层上行）；层间短连线仍按原意保留（每缝 3 根 GREY_MID 短竖线）。
- 底部大字 `stratum 1–15`（EXAMPLE.strata，Noto 900 52px 白 + 2.5px 紫描边 + 紫晕）cy 566——textW≈380px，无溢出。

## 复用图元
- ui：`AtomClock`（塔尖）/`StratumTier`×6（层条）/`PacketIcon`（上行信封 accent 紫）/`TechText`+`TechSub`（术语 + 灰副标）/`CText`（大字 + `stratum 1`）/`EXAMPLE.strata`/`softOp`/`firstOp`/`exitOp`/`glowOffK`/`mix`/`abs`。
- fx：`CameraRig`（慢推 + 段末拉远）/`GlowBlob`（塔尖主角紫光，内建低幅呼吸）。
- common：`GlitchIn`（仅大字一处，rgbSplit 6）/`easeOutCubic`/`easeInOutPow`/`clamp01`/`FONT_ORB`。

## 自检记录
- **tsc**：`npx tsc --noEmit` **0 错误**（全项目）。
- **测渲**：`test_render.sh G3 1504 g3` 30 帧 **3.5s（≈8.5fps）** > 3fps 红线 ✓。
- **motion_check G3**（字体修复后 fresh bundle）：SC08 11.3s / still 29% / 最长静止 **1.4s**（≤3s ✓）/ hold **39f**（≥30 ✓）/ **shots failing: 0**。
- **still**：`stills/G3/` 15 帧（任务指定 7 帧 1510,1560,1600,1680,1750,1800,1842 + 高光补足 1516,1541,1578,1660,1715,1725,1783,1835——覆盖 draw-on 级联/源头显现/术语标签/白闪/信封飞行/波次+glitch/落位停留/离场）+ `boundary_first_SC08_1504.png` + `boundary_last_SC08_1842.png`（与 G2 组界 / C3 章节卡交接）。
- **z-ai vision**：16 帧标准检查**全部 PASS**；f_1800 内容核验确认（金字塔+塔尖钟+右缘 1–15 列+顶左 `stratum`+底部 `stratum 1-15`+ghost 渐隐+S16.c3 字幕同步）。f_1842 末帧内容归零以像素审计替代复核（内容区亮像素 24889→947、max 255→177，离场干净）。后续 2 次 VLM 追问遇 429 限流（按规则等 60s 重试一次仍失败，已记录；该帧非必需项）。

## ⚠ 对主会话的重要报告（环境资产，非本组代码）
1. **public/fonts/ 四个字体文件全缺失**（NotoSansSC/Exo2-Italic/Audiowide-Regular/Orbitron——BGP 工程里有，本工程 public/ 只有 assets）。渲染会 fallback sans-serif 且 log 刷 404。**本组已从 film-bgp-wide/public/fonts/ 复制恢复**（纯静态资产恢复，未改任何共用代码），修复后 fresh bundle 复测通过。请主会话确认此目录入 git（其他并行组同样受益）。
2. 刻度尺"行对齐 vs 均匀刻度"与信封"右坡飞行"两处对分镜表的解读偏差已在上文记录，如坚持原文需返工可指出。

## 未完成 / 降级项
- 无未完成镜头。塔尖 AtomClock 读数在 0.69 缩放下 ≈11px（图标级微文本，沿用 G8/PCAP 缩微件先例；原子钟主场在 SC05）。
