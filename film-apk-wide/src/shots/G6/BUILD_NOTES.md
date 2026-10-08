# G6 构建笔记（第 3 章中段：SC35–SC39，S35–S39）

工程：/home/z/my-project/anima/film-apk-wide · 组：G6 · Agent: apkwide-G6
规则依据：BUILD_RULES_APK.md > agent-build-rules.md > style/motion/composition > 分镜表 G6 + 全局约束 > timeline S35–S39。

## 节拍核对（timeline S35–S39 字幕块，subs.ts 实测）

S35 5066「The key is the developer's identity.」/ 5132「There is no certificate authority.」｜
S36 5191「You sign your own app,」/ 5229「and only the same key can ship an update.」（¶）｜
S37 5337「Verification passes.」/ 5385「Now Android reads the label.」｜
S38 5445「The manifest is binary XML:」/ 5517「name, version, every permission the app wants,」/ 5619「every screen it can show.」｜
S39 5669「The package gets copied to its home,」/ 5732「under /data/app.」（¶+gap12）。

镜头区间（分镜表）：SC35 5058–5182 / SC36 5183–5328（¶）/ SC37 5329–5436 / SC38 5437–5660 / SC39 5661–5823（¶+gap12）。

## 白名单执行

- glitch：仅 SC39 `/data/app`（rgbSplit 4 @5732，门牌 GlitchIn）。SC35–SC38 零 glitch。
- 扫光：本组无（不 import LightSweep/LightBar/StageLine/GhostText）。
- 高光时刻：本组无 ★（章 3 高光 = SC32 落章型，属 G5）。
- 事实核对：屏显文本只用 EXAMPLE（appPkg/manifestRows/dataApp/fileName 语域）+ 分镜表指定文案（v1.0/v2.0/same key/different key/signature mismatch/no certificate authority/you are your own authority/verified/text XML/binary）；v1.0/v2.0 为分镜表明文指定的示意版本号（非事实清单数字，见偏离记录 §A1）。

## 逐镜记录（边做边 append）

### SC35 钥匙即身份（5058–5182）✅
- 5066 大 KeyGlyph（w 480 → 高 240px，主角）scaleIn 21f + 齿端 GlowBlob(604,335) 紫光呼吸（30f 周期）+ 每 36 帧 ±2° 轻转；钥匙环挂小包裹（w 96，配角）+ 链线随旋转端点走（锁住感）。
- 5132 「无 CA」对照卡 SoftIn → 柱式图标（PillarIcon，g6ui）自左 wipe 14f → 5150 灰删除线 10f（非红——「不是重点」）→ 5156 `no certificate authority`（灰 24px）；5148 底部 `you are your own authority`（灰 26px）。
- 段内镜头（停留不判）；末 8 帧归零（齿端紫光 glowOffK 6f 先灭）。
- 主角：大钥匙 240px；光：钥匙 GLOW_PURPLE_S + 齿端紫斑（本镜唯一大面积光）。配角：钥匙链包裹 / CA 卡 / 底行 = 3。

### SC36 同钥匙才能更新（5183–5328，¶）✅
- 上半（正例）：5191 `v1.0` 包裹 + 紫钥匙 + `same key`；5200 `v2.0` 更新卡自右滑入（Δ240/16f powOut）；5216 绿 Check draw-on 12f。
- 下半（反例）：5229 同款 `v1.0` 包裹 + 灰钥匙 + `different key` + 分隔虚线 + 上排渐暗 38%；5237 更新卡 powIn(2.2) 加速接近 14f → 5251 白闪 2f + Cross draw-on 12f + powOut 弹开（660→802，左倾 −10°）→ 5257 `signature mismatch`（橙 24px 打字机 2f/字，~5295 完）。
- 段末 hold：Cross/弹开落位 ~5267 → 离场 5321（TO−8），54f ≥30 ✓。分镜表「离场 5296−8」为 S36.to+2 旧口径，按 G3/G4 先例执行镜头末 8 帧（偏离记录 §A2）。
- 主角：双行演示组（两行各 ~180px，组合 >240px 宽）；光：上绿下红事件光（Check/Cross 均非大面积紫）；紫钥匙 GLOW_PURPLE_S（上半主角光）。配角：2 包裹 + 2 更新卡 + 2 标签 = 6。

## 偏离记录

- A1 `v1.0`/`v2.0`：分镜表 36 行明文指定（画面列 + 动效列），但不在 EXAMPLE 常量与事实清单内 —— 按分镜表执行（示例版本号，与 EXAMPLE.manifestRows 的 version 2.4.1 语域不冲突：那是「当前装的面单」，此处是「新旧两版更新」的示意）。**需主会话知悉**。
- A2 段末停留口径：分镜表 G6 各镜「离场 X−8」用的是 S 句 to+2 旧口径；本片镜头区间到下一镜首句 from−9，按镜头末 8 帧归零执行（G3 SC15 / G4 SC17 同例已获认）。SC36 hold 54f、SC39 hold ~58f，均 ≥30。

### SC37 验签通过（5329–5436）✅
- 左半：5337 WaxSeal（r 92）scaleIn 16f + 5341 绿 Check draw-on 16f（盖在封印中心）+ 5353 `verified`（绿 28px 打字机 2f/字）+ 封印绿光晕一次（HeroGlow color GREEN，k 脉冲 0→0.9→0.24）；抽面单起左侧渐暗 30%（焦点转移）。
- 右半：5349 灰色缩微包裹（118×84，配角）；5385 面单 ManifestCard 缩影从包裹后抽出（kf 18f，中心 620,462 → 890,285，0.25×→0.72× 藏→显）+ 白色轨迹线渐隐（8f）+ 5403–5418 revealP 0→0.8（前 4 行）+ 卡边 HeroGlow 紫微光呼吸。
- 段内镜头（停留不判）：末拍 reveal ~5418 完 → 离场 5429（TO−8），hold ~11f（段内镜头，motion_check 读数记录但不判）；末 8 帧归零。
- 主角：验签组（封印 184px + Check）+ 抽出后的面单（238×216，落位后）；光：绿光晕一次 + 面单紫微光。配角：缩微包裹 = 1。

### SC38 面单字段（5437–5660）✅
- 5445 大 ManifestCard（基准 350×330 外包 scale 1.4 → 490×462，主角 ≥170 ✓）slideUp Δ110/22f；`AXML · binary` 徽标为卡内置顶栏随卡入场（分镜表「stampIn」改为落地白闪 brightness 1.45→1 / 3f —— 徽标不可独立动画，见偏离 §A3）+ 卡后 HeroGlow 紫柔光呼吸（主角光）。
- 运镜：5468–5501 推 1→1.08 / 33f（CameraRig 屏空间中心 (640,355)；结束 5501 ≤ 离场 5653−30 ✓；卡顶 132→114、底 594→613 均在内容区 y110–620 内）。
- 5501–5516 左下小注：`text XML` DocIcon（灰）+ 灰删除线 8f → 箭头 draw-on 10f → `binary` 白块（SoftIn）——全部落在运镜结束后、第二块字幕（5517）前，零重叠。
- 5517/5533/5553/5573/5619 五行逐行 reveal：revealP 阶梯（shown=round(revealP·5)）+ 行遮罩左→右 10f wipe（显影感）；**permission 两行橙色**（卡内置 ORANGE 键色）+ 橙色闪现渐稳底光（0.26→0.09）；**读取光标**（紫下划线 318×4 + 紫光，24f 周期闪烁）逐行下移，5577–5619 停驻末行 permission，5629 到 activity 行（对齐 5619 节拍 +10f）后停驻闪烁至离场（持续动作）。
- 行数据 = EXAMPLE.manifestRows（package com.example.chat / version 2.4.1 / permission INTERNET / permission CAMERA / activity .ChatActivity）。
- 段内镜头（停留不判）：末行 reveal 5629 → 离场 5653（TO−8），hold ~24f（段内，读数记录）；末 8 帧归零（紫光先灭）。
- 主角：面单卡 462px 高；光：卡后紫柔光（唯一大面积光）+ permission 橙底光（指标语义）。配角：左下注解组 = 3。

### SC39 落位 /data/app（5661–5823，¶+gap12）✅
- 5669 虚线路径 draw-on 12f（clipPath 自左 wipe，x 单调二次贝塞尔 M300,415 Q575,515 857,391）→ 5681 包裹（140×98，label APK）沿路径 easeInOut 滑入 24f（= 「复制到家」动作）→ 5705 到位。
- 5726 目录屋（DirectoryHouse：屋体 340×210 + 屋顶 72，主角 282px 高；5 枚灰暗邻居小包裹 = 其他 app）slideUp Δ80/18f（节拍 5732 −6 允差内）——屋起在已落位的包裹周围（屋在包裹下层渲染）。
- 5732 门牌立牌（屋前地面立式，SoftIn 前挂 −4f）+ `/data/app`（EXAMPLE.dataApp，等宽 26px 紫）**GlitchIn rgbSplit 4（本组唯一 glitch）** + 立牌紫光呼吸（主角光）；门牌不随屋入场 → glitch 稳定可读。
- 5734 路径轨迹渐隐 12f；5746 目标槽（第 2 行左）紫光描边 draw-on + 包裹缩位 1→0.62 入格（12f，「包裹入住」）+ 槽位紫光斑。
- 段末 hold：缩位/槽光落位 5758 → 离场 5816（TO−8），**hold 58f ≥30 ✓**（分镜表「5791−8」旧口径见 §A2）；末 8 帧归零（门牌/槽光先灭 6f）。
- 主角：目录屋 282px；光：门牌紫光（唯一大面积紫）+ 槽位紫斑。配角：包裹 + 5 邻居 + 门牌 = 7。
- G7/SC48「/data/app 目录屋（承接 SC39 同款）」：几何在 g6ui.tsx DirectoryHouse（x 770 y 285 w 340 h 210 roof 72；目标槽 = 第 2 行左，中心 ≈ (857,390)）。
