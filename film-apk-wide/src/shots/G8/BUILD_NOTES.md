# G8 构建笔记（第 4 章上半：SC49–SC54，S49–S54）

工程：/home/z/my-project/anima/film-apk-wide · 组：G8 · Agent: apkwide-G8-builder
规则依据：BUILD_RULES_APK.md > agent-build-rules.md > style/motion/composition > 分镜表 G8 行 + 全局约束 > timeline S49–S54。

## 节拍核对（timeline S49–S54 字幕块）

S49 7335「In 2018, Google announced the App Bundle.」（单块）｜
S50 7439「Since August 2021,」/ 7499「every new app on the Play Store」/ 7549「has to use one.」（¶+gap15）｜
S51 7625「You no longer download one universal package」/ 7700「with every language」/ 7739「and every CPU architecture inside.」｜
S52 7822「Play assembles the splits for your exact device」/ 7893「and signs them on the way out.」｜
S53 7947「Your phone downloads only its own pieces.」（¶）｜
S54 8064「base.apk plus config APKs.」/ 8161「Still APKs. Still signed zips.」（¶）。

镜头区间（分镜表）：SC49 7327–7430 / SC50 7431–7616（¶）/ SC51 7617–7813 / SC52 7814–7938 / SC53 7939–8055（¶）/ SC54 8056–8265（¶）。
组界：上接章节卡「Still a Zip」7262–7326（Overlay.CHAPTER_CARDS 实算 = [S48.to+3, S49.from−9]；分镜表头部「7315–7359」为旧口径）与 G7b/SC48（至 7326）；下接 G8b/SC55（自 8266，全新照片场景，本组末 8 帧归零让位）。

## 白名单执行

- glitch：仅 SC50 `2021`（GlitchIn rgbSplit 5，包住年份计数文本）与 SC54 `still zips`（GlitchIn rgbSplit 6）。SC49/SC51/SC52/SC53 零 glitch。
- 扫光：本组无（不 import LightSweep/LightBar/StageLine/GhostText）。
- 高光时刻：本组无 ★（章 4 高光 = SC59 收束型 + SC48 反转次高光，均属 G8b）。
- 事实核对：屏显文本 = EXAMPLE（splitBase/splitAbi/splitDpi/aabYear 语域）+ 分镜表明文（2018 / Android App Bundle / base + splits / signed by Play / per device / 2021 / 月份格 AUG / your device / not yours / Play / base.apk + config.apk / still zips / base）。
  - SC51 的 12 枚标签：分镜表列了 `en de ja arm64 x86 hdpi…`（…为同类补全）→ 用 en/de/ja/fr/es/zh + arm64/x86 + hdpi/mdpi/xxhdpi/ldpi（语言 ISO 码与 Android 密度桶，与已核事实同语域，非数字/年份/专名）。
  - SC50 月格 12 个月份缩写（JAN–DEC）为日历家具（非事实清单数字/专名）。

## 逐镜记录

### SC49 App Bundle（7327–7430）✅
- 章节卡承接（G3/SC11 同款）：`2018`（Orbitron 84px 白 + 紫硬投影 + 16px 紫辉呼吸）首帧即出现在章节卡标题槽位 (640,372)，节拍 7335 起 kf 16 帧 easeInOutPow(2.5) 移到左上 (258,188)。
- 7335 中央大 Pill `Android App Bundle`（白边 460×108、36px 白字）自下 slideUp Δ110/22f + 边框白光呼吸（30f 周期，主角光；白光为分镜表「光」列明文）。
- 7341/7343/7345 三枚小灰标签（base + splits / signed by Play / per device，灰边盒 + 灰 22px）SoftIn + 内部打字机（2f/字，~7977 前后打完 → 7377）。
- 持续动作：Pill 白光呼吸 + 2018 紫辉呼吸 + 标签打字机。段内不判；末 8 帧归零（Pill 白光先灭 6f）。
- 主角：Bundle Pill 组（Pill 108 + 标签行 ≈ 190px）；光：Pill 白光。配角：2018 + 3 标签。

### SC50 2021 强制（7431–7616，¶+gap15）✅
- 7439 日历卡（440–840 × 200–440，白边 r12）slideUp Δ100/22f；顶部年份条 `2021` **GlitchIn rgbSplit 5（本镜唯一 glitch）** + 年份计数 2018→2021（kf 16f 取整，落 2021）——从上一镜的 2018 滚到 2021（「两年后强制」）。
- 7452 AUG 格（4×3 月格第 8 格）紫底高亮 wipe 12f（scaleX 左→右）+ 紫光呼吸（主角光，30f 周期）；其余 11 格灰边灰字（等宽 22px）。
- 7495–7499 三枚 app 图标（白边圆 r26）SoftIn 卡下（y505）→ 7499/7524/7549 逐一 kf 跳入 AUG 格（14f：x 线性、y powIn(1.5) 下落 + 86px 上抛弧；末段 r 26→7.5 缩成小点「被收纳」，驻留 AUG 格）。
- 每次落格：AUG 白闪 3f + 卡 1.03 微脉冲（6/2/6f）。落位：7513/7538/7563 → 离场 7608（TO−8），hold 45f ≥30 ✓（¶）。
- 持续动作：AUG 紫光呼吸；图标收纳后停驻（<3s）。末 8 帧归零（AUG 紫光先灭）。
- 主角：日历卡 240px；光：AUG 格紫。配角：3 图标。

### SC51 不再一包走天下（7617–7813）✅
- 7625 左半大包裹（240×170，label APK）scaleIn 21f（0.55→1）。
- 7700–7736 十二枚小标签（等宽 16px 灰）2 帧错峰自包裹中心辐射到密集圆环（半径 148–190、基角 30° 均分 ±7° rnd 抖动；每枚 14f easeOutCubic）；末枚落位 ~7736（节拍 7739 −3 ✓）。
- 环绕层缓慢旋转 0.3°/f（标签沿环公转、文字保持直立；持续动作）；包裹被标签重量压得下沉 4px（附着比例 ×4）。
- ~7650 右半虚线空区 `your device`（灰 28px + 灰虚线盒 330×220）SoftIn + 虚线呼吸（0.6–0.85，45f 周期，持续动作）。
- 段内不判；末 8 帧归零。零紫光（「万能包」= 反面重物，灰处理为分镜表「光：标签灰」明文）。
- 主角：万能包 + 标签环组 ~380px 宽（260px 高语域）；光：白 bloom（结构线）。配角：右空区。

### SC52 Play 组装（7814–7938）✅
- 7822 传送带（x 220–1060，y 350/375 双白线）自左 draw-on 18f + 6 只传送辊（r 9.5，辐条 N×6°/f **持续旋转至离场**）；左端 Store 徽标（白边方 + 播放三角，g8ui.StoreBadge）+ `Play` 灰 22px。
- base 包裹（92×64，label base）7823 上带右行（**8px/f**，见偏离 A1）→ 途经签名工位（龙门臂 + 悬挂缩微 WaxSeal r30）：7881–7888 powIn(2.2) 落章 + 白闪环 + 7889 包裹边框闪紫（accent）+ sealP 0→1 封条（正对节拍 7893「signs them on the way out」）→ 7891–7897 抬章。
- 7893 包裹中心抵手机口（0.35× 缩微 MiniPhone 84×168，左缘「张口」凹口正对传送带）→ 7893–7900 缩入（scale 1→0.3 + 淡出）；7893 屏闪绿光（3f 升 3f 降）+ 7895–7903 小 Check（绿，draw-on）。
- 持续动作：辊旋转（全镜）；段内不判（Check 7903 落定 → 离场 7930，辊继续转）。末 8 帧归零。
- 主角：组装线整体（840×~200）；光：落章紫闪 + 手机绿光（事件光）。配角：Store 徽标 / 工位 / 手机。

### SC53 只下自己的（7939–8055，¶）✅
- 7947 三枚 SplitChipG8（260×132 放大版 SplitChip + 顶部小天线；cx 320/640/960，cy 400）2 帧错峰 SoftIn：`base.apk`（紫边亮）/ `config.arm64_v8a.apk`（灰暗）/ `config.xxhdpi.apk`（灰暗）——标签全取 EXAMPLE。
- base 标签打字机（7955 起 2f/字）+ 芯片紫光保持（glowPurpleS 0.55±0.2 呼吸，主角光）；7962 起 base 天线波纹（3 段圆弧 24f 周期循环，持续动作 =「下载中」）。
- 7975/7989 两枚灰暗芯片被灰删除线划过（244×3 GREY_MID，10f scaleX wipe——灰非红：不是错误是不需要）+ 7985/7997 小灰章 `not yours`（等宽 16px，旋转 −12°，stampIn 1.45→1.0 / 8f）。
- 停留：末枚灰章落位 8005 → 离场 8047（TO−8），hold 42f ≥30 ✓（¶）。末 8 帧归零（base 紫光先灭）。
- 主角：SplitChip 行（组宽 940、高 ~200 含天线波纹）；光：base 紫光。配角：2 灰芯片 + 2 灰章。

### SC54 还是 zip（8056–8265，¶）✅
- 8064 中央公式 `base.apk + config.apk`（等宽 30px 白，打字机 2f/字 + 光标闪烁至打完 ~8106）。
- 8161 大箭头 draw-on 12f（LineArrow 640,272→640,344，rodW 5）→ 8175 `still zips`（Audiowide 96px 白 + 2.5px 紫描边 + 紫硬投影）**GlitchIn rgbSplit 6（本镜唯一 glitch）** → 8187 emphasisPulse 1.11 → 紫描边光晕 30f 呼吸（持续）。
- 8193/8195 小包裹（112×80，紫边 + sealP 封条，label APK）+ 小 WaxSeal（r36，压在包裹下半 = 呼应第 3 章「签了名的 zip」）2 帧错峰 SoftIn（右下侧 1025,445/468）。
- 停留：脉冲结束 8217 / 象征物落位 ~8203 → 离场 8257（TO−8），hold 40f ≥30 ✓（¶）。末 8 帧归零（大字光晕先灭；SC55 自 8266 起新照片场景，交接干净）。
- 主角：`still zips` 96px（行宽 ~540px）；光：大字紫描边光晕（唯一大面积）。配角：公式 / 箭头 / 小包裹 + 小封印。

## 镜头表（composition §5）

| 镜头 | 主角 | 主角高度 | 主角的光 | 高光时刻 | 配角数 | motion_check（最长静止 / hold） |
|---|---|---|---|---|---|---|
| SC49 | Bundle Pill 组 | ~190px | Pill 白光呼吸（分镜表明文） | 无 | 4 | 待测 / 段内不判 |
| SC50 | 日历卡 | 240px | AUG 格紫光呼吸 | 无 | 3 | 待测 / 45f |
| SC51 | 万能包+标签环 | ~380px 宽（环径） | 白 bloom（灰处理，分镜表明文） | 无 | 1 | 待测 / 段内不判 |
| SC52 | 组装线 | 840×~200 | 落章紫闪 + 手机绿光 | 无 | 3 | 待测 / 段内不判 |
| SC53 | SplitChip 行 | ~200px（含天线） | base 紫光呼吸 | 无 | 4 | 待测 / 42f |
| SC54 | still zips 大字 | 96px（行宽 ~540） | 紫描边光晕呼吸 | 无（章 4 ★=SC59 属 G8b） | 4 | 待测 / 40f |

## 偏离记录

- **A1 SC52 包裹速度**：分镜表 1.8px/f 与「7822 上带 → 途经签名工位 → 7893 手机接收」在 125 帧镜头内几何不相容（1.8px/f×70f 仅 126px，不足 Store→工位→手机的 ~560px 行程）。取 8px/f：7881–7888 落章、7889 边框闪紫（节拍 7893 −4 ✓）、7893 恰抵手机口 → 屏闪绿 + Check。工位放在手机口前 56px——「signs them on the way out」= 出门那一刻盖章，语义吻合。**需主会话知悉**。
- A2 SC50 图标起跳帧：分镜表「7499–7549 三枚依次跳入」，取 7499/7524/7549（等距 25f，第三枚正对节拍 7549；末枚落位 7563 → 离场 7608，hold 45f ≥30 ✓）。分镜表「末枚落位 7549+24」按 14f 跳跃时长取 7549+14=7563（+24 无 14f 跳跃支撑的来源）。
- A3 SC49 Pill 尺寸：分镜表 320×90 与「Android App Bundle」36px 白字（textW≈354px + padding）不相容，取 460×108（主角 ≥170 语域：Pill 108 + 标签行 ≈190 组高）。
- A4 小字号：SC51 十二标签 / SC53 灰章 `not yours` / SplitChipG8 标签取分镜表明文 16px（等宽纹理字，与 ui.tsx SplitChip/HexDump/TickerRow 同语域；本片最小可读字号 22px 约束针对「需要阅读的说明文字」）。
- A5 章节卡区间：分镜表头部常驻层「7315–7359」与 Overlay 实算 [S48.to+3, S49.from−9] = 7262–7326 不符（旧口径）；承接按 SC11 先例取「卡已出画后的标题槽位 (640,372)」。
