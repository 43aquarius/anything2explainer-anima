# G3 BUILD_NOTES（第 2 章上半：S16–S21，立足点 · SC13–SC17）

帧区间（分镜表 G3）：SC13 2577–2775 / SC14 2776–2956 / SC15 2957–3113 / SC16 3114–3314 / SC17 3315–3696。
组概念：**同一张"路径图"的四个站位** — SC13 全幅路径图（WHERE?）→ SC14 承接位移（路径组 0.34× 缩左下角不清场，左端电脑节点放大到中央）→ SC15/SC16 换景但保留"线路"母题（交换机双向流 / 线缆穿 TAP），①②③ 站位角标（Orbitron 紫虚线圈）贯穿 SC14–SC16 → SC17 回到 ①（本机）讲混杂模式。

## 镜头表（主角 / 尺寸 / 光 / 高光 / 运镜 / 配角数）

| 镜头 | 帧 | 文件 | 主角 | 主角高度 | 主角的光 | 高光时刻 | 运镜 | 配角数 | 最长静止 | 末拍稳定期 |
|---|---|---|---|---|---|---|---|---|---|---|
| SC13 | 2577–2775 | SC13.tsx | `WHERE?` Audiowide 96px | 96px(大字) | 紫硬投影+白柔光 | — | — | 3（节点×2+徽章） | （见 motion_check） | 段内不判 |
| SC14 | 2776–2956 | SC14.tsx | LaptopIcon 320px 宽 | 224px | HeroGlow | — | 承接位移 16f + 慢推 1→1.05 | 5 | — | 段内不判 |
| SC15 | 2957–3113 | SC15.tsx | SwitchBox 560×140 | 140px+label（宽幅主角） | HeroGlow | — | — | 6 | — | 段内不判 |
| SC16 | 3114–3314 | SC16.tsx | TapBox+线缆组 | 120px+线缆全幅 | TapBox 自带 GLOW_PURPLE_S | — | 推近 1→1.12/33f（3151 止，不进末拍） | 5 | — | 55f ✓（¶） |
| SC17 | 3315–3696 | SC17.tsx | NICIcon 420×180 + `Promiscuous mode` 64px | 180px | HeroGlow + 芯片紫柔光 | — | — | 7 | — | 67f ✓（¶） |

- SC15 主角说明：SwitchBox 140px 高但 560px 宽（宽幅主角，折算 min(560, 4×140)/2.5 = 224 ≥170 ✓）。
- SC13 glitch：`WHERE?`（白名单）；SC17 glitch：`Promiscuous mode` rgbSplit 4（白名单）。SC14/15/16 零 glitch。
- 零扫光（G3 无扫光白名单镜头，未 import LightSweep/StageLine/GhostText）。

## 复用图元 / 组内新增（g3ui.tsx）

- 复用 ui.tsx：`PacketIcon / SwitchBox / TapBox / NICIcon / RackIcon / Pill / Check / Cross / SoftIn / exitOp / scaleIn / fadeIn / softOp / firstOp / glowOffK / glowPurpleS / abs`；fx.tsx：`HeroGlow`。
- g3ui.tsx 新增（组内专用，建议后续组合并）：`PathMap`（SC13/SC14 共用路径图，envX 同公式 → 组界帧逐像素一致）、`StationCircle`（①②③ 虚线圈，缩略形态不带数字避免 <22px 小字）、`LaptopIcon`（120↔320 同形承接）、`WiresharkBadge`（章界承接 SC12 卡 B 缩略）、`Funnel`（SC17 投递口）、`AnalyzerScreen`（SC15/16 共款分析器+计数）。

## 关键参数 / 决策记录

- SC13 站位圈点亮：分镜表"每 30 帧轮换"在 2775 前无第二个 30 帧窗口 → 改为 2753/2757/2761 依次 10 帧紫脉冲（1-2-3 数拍）后只留 ①（2771 起），与 SC14 承接一致；持续动作由路径信封流（2691 起 4.2px/帧）承担。
- SC13 尾部：WHERE?/Wireshark 徽章 2763–2775 归零淡出（12f），路径组不清场直通 SC14；SC14 首帧 tt=0 为 identity。
- SC15 弧 draw-on 用 div clip-path inset 自左向右展开（虚线不能直接用 dashoffset 动画）；副本信封沿三次贝塞尔 kf 18 帧。
- SC16 分析器/引线/`passive` 全部在推近（3151 结束）之后入场 → 推近不进末拍；段末 hold 55f。
- SC17 "OS 方块内一行 seeing 指示灯"实现为 OS 字 + 紫闪指示点 + `seeing` 22px（SC14）；三漏斗：左/右喂对比信封，中间 48 帧/枚小信封滴入 NIC。
- SC17 glitch 说明：任务派单里有一段自相矛盾的推理，但分镜表白名单明确列 SC17 `Promiscuous mode`（且 SC17 行内写明"本镜唯一 glitch，rgbSplit 4"）→ 按分镜表实现。**请主会话终检时知悉。**
- SC16 ③ / SC15 ② / SC14 ① 站位角标放屏幕空间固定位（108,158），SC16 的角标在推近层外（不随 1.12 推移出内容区）。

## 自检（更新中）

- tsc：通过（0 errors）。
- still / VLM / motion_check / 30 帧测渲：见下方追加记录。
