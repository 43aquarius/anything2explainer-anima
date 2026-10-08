# G5 构建笔记（第 3 章上半：SC26–SC34，S26–S34）

工程：/home/z/my-project/anima/film-apk-wide · 组：G5 · Agent: apkwide-G5
规则依据：BUILD_RULES_APK.md > agent-build-rules.md > style/motion/composition > 分镜表 G5 + 全局约束 > timeline S26–S34。

## 节拍核对（timeline S26–S34 字幕块）

S26 3742｜S27 3783 / 3851｜S28 3930 / 3958（¶+gap15）｜S29 4040 / 4134 / 4174｜S30 4272 / 4332（¶）｜S31 4439 / 4529 / 4576｜S32 4626 / 4691 / 4736｜S33 4828 / 4873｜S34 4920 / 4970（¶，末块 51）。

## 白名单执行

- glitch：仅 SC28 `tampered?`（rgbSplit 6 @3958）、SC32 `SIGNING BLOCK`（rgbSplit 5 @4693）、SC34 `faster`（rgbSplit 5 @4970）。其余镜头零 glitch。
- 扫光：本组无（不 import LightSweep/LightBar/StageLine/GhostText；本片扫光在 G3 SC15 与 G8 SC59）。
- 高光时刻：SC32 落章型（v2 签名块覆盖整文件，章 3 唯一）。
- 事实核对：屏显文本 = Install / ChatApp / 120 MB（EXAMPLE.appSize）/ question one: / tampered? / or / v1 / JAR signing / sha1 / from the Java world / hash, file by file / Android 7.0 / v2 / SIGNING BLOCK / immediately before the central directory / the entire APK / local file headers / central directory / EOCD / install denied / faster —— 全部来自分镜表 G5 各行 + research §4（AOSP apksigning：v1=JAR signing、v2=Android 7.0、Signing Block 在中央目录之前、whole-file 覆盖、装得更快）+ EXAMPLE 常量；ID 0x7109871a 按要求不上画面；无自造数字。
- 分镜表全局约束 §2 的白名单编号与 G5 各行不一致（SC28 写 `wax seal`、SC32 写 `v2`），按派单 + G5 表内行 + BUILD_RULES 摘要执行：`tampered?` / `SIGNING BLOCK` / `faster`。

## 逐镜记录（边做边 append）

### SC26 点下安装（3734–3774）✅
- **章界承接**：包裹按 SC25 分镜表终态参数（cx 640, cy 340, 280×200, openP 0.25, sealP 1, label 'ZIP'）kf 24 帧 easeInOutPow(2.5) 飞入手机屏 (272, 210)，缩至 0.2×；主角光随飞行 0.85→0.12 收敛（SC25 实际实现由 G4 组并行构建，按分镜表参数锚定，见「需裁定」①）。
- 3742 按下：手指 3 帧降 10px + 按钮 pressAt−2 蓄力 1.06 → +3 压扁 0.97 保持 + 绿波纹两圈（12 帧，r 72→152 / 72→126）+ 按钮描边 6 帧绿→灰（已按下）；3756 手机屏顶下载完成绿点 + 一次扩散脉冲。
- 手机 = PhoneMock (140,140,260,470) litN=1（SC01 同款机位语言）。末 8 帧归零。
- 主角：手机+按钮组 470px；光：绿波纹 + 包裹紫晕（飞行中）。零 glitch、无运镜（分镜表 G5 行未给）。

### SC27 陌生人的包裹（3775–3921）✅
- 3783 网线 (70,330)→(952,330) draw-on 12 帧 + 箭头 + 包裹自画外左滑入 20 帧（easeOutCubic）停 (400,320) w200 + HeroGlow 8 帧点亮（30 帧呼吸）。
- 3851 三枚灰问号循环上浮 2px/帧（rnd 相位、渐显渐隐，持续）+ `120 MB` Orbitron 44px countTo 14 帧 + 封条区红点 30 帧周期闪烁（待验证）。
- 右半手机缩微 0.45×（108×216，iconN=0 + screenLabel 'ChatApp'）等待接收。
- 停留：120MB 落位 3865 → 离场 3914，49 帧 ✓（段内不判，实际富余）。末 8 帧归零。
- 主角：包裹+问号组 220px；光：包裹 HeroGlow + 红点警示闪。零 glitch。
