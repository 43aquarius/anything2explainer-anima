# 《APK — The Zip That Becomes an App》竖版分镜表 src（英文片 · 13 镜 · 3 组）

总帧数 {TOTAL}（30fps）。单章（One Tap）。章起始帧：C1 {C1}。
镜头衔接规则：每个内容镜头的区间 = [首句 from−8, 下一镜头首句 from−9]，末镜到 {TOTAL}；末 8 帧离场、后一镜头首帧起入场；元素入场对齐"节拍"列（不晚于该帧 +3、不早于 −6）。**段末镜头**（表中标 ¶）末拍元素落位后停 ≥30 帧再离场；段内镜头间承接不清场。

## 常驻层（主会话负责，构建组不要画）
| 元素 | 帧 | 说明 |
|---|---|---|
| 片头 | 1–77 | 黑场 → 点阵波亮起 → 「APK」Audiowide 108px glitch（rgbSplit）+ Exo 2 副标 'The Zip That Becomes an App'（两行）+ 灰 tagline 'Every app is a zip.'；末 12 帧上摇出画 |
| 顶部 HUD 胶囊 | 全片 | 9 个条目（config.hud），换词 8 帧淡入 |
| 片尾 | {S15.to+2}–{TOTAL} | endingFade=6 压黑；无署名（builtBy=''） |

竖版安全区：内容主区 **y240–990、x40–620**（右侧 x>620 留给 TikTok 按钮列，顶部 y<240 留给平台 UI）；中轴 x=360；字幕带 **y1002–1056** 不放内容；进度条 **y1240–1280**。字号最小 22px 尽量 24+；自下滑入 Δ≤100、侧向 Δ≤180。

## 全局约束（全片的法律）
1. **贯穿示例**：与横版同源（ChatApp / 120 MB / ParcelIcon 包裹母题 / WaxSeal 火漆 = 签名 / ManifestCard 面单）；**所有屏上示例文本一律取自 `EXAMPLE`**。
2. **闪烁（GlitchIn）白名单**（每镜头 ≤1 处，只给这些词）：SC01 `ZIP`｜SC03 `ZIP archive`｜SC04 `P, K`｜SC05 `wax seal`｜SC06 `dies`｜SC07 `binary`｜SC08 `machine language`｜SC10 `sandbox`｜SC12 `/data/app`｜SC13 `still zips`｜SC14 `P, K`｜SC13(SC15) `Every app is a zip you can read.`。**不在表里的镜头零 glitch。**
3. **扫光白名单**（全片 ≤2 镜头）：SC04（PK 揭示）、SC13 收束镜（结尾大字）。其他镜头不得 import LightSweep/LightBar/StageLine/GhostText。
4. **高光时刻**（钩子前置在前 3 秒）：SC01 改后缀魔术（f86 起即钩子）｜SC04 PK 大字｜SC05 火漆盖下｜SC13 收束大字。
5. **运镜清单**（全片 ≥5 处）：SC01 推向改名瞬间｜SC03 拉远看手机世界｜SC04 推向 PK｜SC05 推向封印落章｜SC08 推向芯片｜SC13 推近收束。
6. **事实清单**（画面字面量对账）：1989 / 2016 / 2021 / 50 4B 03 04 / PK / 65,536（不用）/ /data/app / /data/data / classes.dex / AndroidManifest.xml / base.apk / dex2oat / v2。**清单外数字/年份/专名不得上画面**。
7. **TTS 读法对照**：口播 "data slash app" ↔ 屏显 `/data/app`；口播 "dex to oat" ↔ 屏显 `dex2oat`。

---
## G1（钩子 → 改后缀 → 都是 zip → 1989 与 PK）
| 镜头 | 帧 | 节拍（字幕块起始） | 画面 | 动效 | 主角·尺寸 | 光 |
|---|---|---|---|---|---|---|
| SC01 ★改后缀钩子 | {S01.from-8}–{S02.from-9} | {S01.c1} 改名·APK→ZIP / {S01.c2} 就开了 | **开场即钩子（前 3 秒）**。竖构图：上 1/3 一张大文件名卡（x 60–620，y 300–460，白边圆角）：`chatapp-release.apk`（等宽 30px）；`.apk` 后缀被选中高亮（8 帧）→ 字符上抛换为 `.zip`（18 帧）→ 卡下一行大字 `ZIP`（Audiowide 130px 白+紫描边）+ 顶部一枚小包裹 ParcelIcon（w 130）拉链同步开齿。 | {S01.c1} 后缀选中 → 字符交换 powOut（`.apk` 末 4 字符上抛淡出、`.zip` 落入）→ 卡边框白闪 3 帧 → `ZIP` 大字 GlitchIn（rgbSplit 6，本镜唯一 glitch）+ emphasisPulse + 紫光晕 30 帧呼吸（持续）；包裹拉链 openP 0→0.4 与字符交换同步（持续动作）；运镜：33 帧 1→1.15 推向文件名卡。停留：段内不判。 | `ZIP` 130px | 大字紫晕 |
| SC02 全在里面 | {S02.from-8}–{S03.from-9} | {S02.c1} 面单·代码·签名 / {S02.c2} 都在这 | 承接：文件名卡缩到上 1/4；中段一条纵向文件列表（y 470–830）：4 行条目（`AndroidManifest.xml` / `classes.dex` / `resources.arsc` / `META-INF/`，等宽 24px）逐条展开 + 各配小图标；底部小字 `it's all right there`（灰 22px）。 | 承接缩位移 14 帧；{S02.c1} 四条目自上而下 2 帧错峰 slideIn + 图标 draw-on（节奏持续）；{S02.c2} 底部小字打字机；条目行持续轻微位移 0.5px 交替（列队感，持续动作）；末 8 帧归零。停留：段内不判。 | 文件列表 360px 高 | 当前条目白光 |
| SC03 全是 zip | {S03.from-8}–{S04.from-9} | {S03.c1} 每个安卓 app 都是 ZIP | 清场 → 中央大字两行 `every Android app`（Noto 900 46px 白）/ `is a ZIP archive`（Audiowide 92px 白+紫描边）；周围 8 枚小包裹（60px）绕大字环形排布。 | {S03.c1} 两行依次入场（第二行 GlitchIn rgbSplit 6 + emphasisPulse + 紫描边光晕）；8 枚小包裹 2 帧错峰缩放入场 + 每 36 帧随机一枚 wink（持续动作）；运镜：33 帧 1.15→1.0 拉远（世界感）。停留：段末（¶+gap12），大字落位 {S03.c1}+21 → 离场 {S03.to+2}−8，≥30 ✓（S03 末块 73）。 | 大字 92px | 大字紫描边 |
| SC04 ★1989·PK | {S04.from-8}–{S05.from-9} | {S04.c1} 1989 / {S04.c2} Phil Katz 被告 / {S04.c3} 回答是 ZIP / {S04.c4} P·K 前两字节 | **长镜·高光（扫光①）**。上段：`1989`（Orbitron 100px 白）+ 一行 `Phil Katz · sued → ZIP`（等宽 24px，起诉小闪电红 3px 划过）；下段：HexDump（x 60–620，y 640–960，5 行字节）首两格 `50 4B` 高亮 → **三轮紫光横扫** → 巨型 `PK`（Orbitron 200px 紫+白描边）浮出压在字节上。 | {S04.c1} `1989` 计数落位 + 紫投影脉冲；{S04.c2} 闪电 draw-on 12 帧划过 + 一行字打字机；{S04.c3} `ZIP` 小字（48px）scaleIn + 白闪一次；{S04.c4} `50 4B` 高亮 wipe（12 帧）→ **LightSweep 三轮**（f0+4/+22/+40，各 16 帧）→ `PK` 大字 GlitchIn（rgbSplit 8）+ emphasisPulse 1.13 + 紫光晕大爆发后收敛呼吸（持续）；其余字节变暗 35%；运镜：33 帧 1→1.18 推向 `PK`。停留：段末（¶+gap15），`PK` 满态 {S04.c4}+24 → 离场 {S04.to+2}−8，≥30 ✓（S04 末块 67）。 | `PK` 200px | 扫光+紫晕（全片最高光） |

## G2（安装流水线：火漆 → 面单 → 编译 → 沙箱 → 从未解压）
| 镜头 | 帧 | 节拍 | 画面 | 动效 | 主角·尺寸 | 光 |
|---|---|---|---|---|---|---|
| SC05 ★火漆盖下 | {S05.from-8}–{S06.from-9} | {S05.c1} 你点 Install / {S05.c2} 查火漆 / {S05.c3} 整个文件一个签名 | 上段：一枚大包裹（cx 360，cy 480，w 340 h 240）+ 一枚大 WaxSeal（r 120）自上 stampIn 落到包裹正中（盖住中缝）；下段一行 `v2 · one signature`（等宽 22px 灰）+ 右上小 `Android 7.0` Pill。 | {S05.c1} 包裹 scaleIn + HeroGlow；{S05.c2} WaxSeal scale 1.5→1 powIn 落章（14 帧）+ 包裹 1.03 微震 + 白闪 2 帧 + `wax seal` 小字 GlitchIn（本镜唯一 glitch，rgbSplit 4）；{S05.c3} 封印后包裹整体描边变紫（12 帧渐变）+ 封印紫光晕呼吸（持续）+ 覆盖弧线 draw-on 兜一圈（"整个文件"）；运镜：33 帧 1→1.12 推向封印。停留：段内不判。 | 火漆+包裹 300px | 封印紫晕 |
| SC06 改一字节就死 | {S06.from-8}–{S07.from-9} | {S06.c1} 改一个字节 / {S06.c2} 安装就死 | 承接封印包裹（0.7× 缩上移）+ 其下一条压缩"字节链"（y 560：一排小方格）：一枚红字节飞入链上任意格（kf 14 帧）→ 冲击波两圈 → 链裂开（红线 draw-on）+ 大 `✕`（红 80px）+ `install dies`（橙 30px）。 | {S06.c1} 红字节飞行 + 命中白闪；{S06.c2} 裂纹 + Cross scaleIn（12 帧）+ `dies` 字 GlitchIn（本镜唯一 glitch，rgbSplit 5）+ `install denied` 打字机 + 包裹与封印变暗 50%；末 8 帧归零（¶+gap15）。停留：`✕` 落位 {S06.c2}+18 → 离场 {S06.to+2}−8，≥30 ✓（S06 末块 33+gap15）。 | 红字节+裂链 260px | 冲击波红 |
| SC07 读面单 | {S07.from-8}–{S08.from-9} | {S07.c1} 读面单 / {S07.c2} 二进制 manifest·权限·屏幕·版本 | 居中大 ManifestCard（x 100–620，y 420–960，revealP 逐行 4 行）+ 卡顶 `AXML · binary` 徽标；卡左上一枚小放大镜。 | {S07.c1} 卡 slideUp + `binary` 徽标 GlitchIn（本镜唯一 glitch，rgbSplit 4）+ 放大镜 slideIn；{S07.c2} 四行字段逐行 reveal（每行 10 帧，permission 行橙）；读取光标逐行下移（持续动作）；运镜：1.0→1.05 慢推。停留：段末（¶），末行落位 {S07.c2}+24 → 离场 {S07.to+2}−8，≥30 ✓（S07 末块 70）。 | 面单卡 540px 高 | permission 橙光 |
| SC08 编译 | {S08.from-8}–{S09.from-9} | {S08.c1} 编译成机器语言 / {S08.c2} 为你这颗 CPU | 纵向流水：上 classes.dex 卡（x 210–510，y 380–540）→ 中一枚旋转编译齿轮（白，持续旋转）→ 下 GPUChip（cx 360，cy 800，size 300，核心格阵级联点亮）+ 芯片下 `dex2oat`（Orbitron 44px 白+紫描边）。 | {S08.c1} dex 卡 slideIn（字符滚动持续）→ 齿轮 draw-on + 持续旋转（1.5°/帧）→ 芯片格阵自左上角级联点亮（每格 3 帧，36 格，持续动作）→ 点亮完成紫光爆发；`machine language` 小字打字机 + `machine language` GlitchIn（本镜唯一 glitch，rgbSplit 5）；运镜：33 帧 1→1.12 推向芯片。停留：段内不判。 | 芯片 300px | 芯片紫光 |
| SC09 优化条 | {S09.from-8}–{S10.from-9} | {S09.c1} 优化条 / {S09.c2} 大更新后见 | 居中 PhoneMock 缩窄（x 180–540，y 380–980，0.8×）屏上 `Optimizing app 1 of N`（等宽 20px）+ 进度推进 + 屏四周 4 枚小 app 图标逐一点亮紫（重编）。 | {S09.c1} 手机屏进度条 SoftIn + 百分比推进（持续动作）；{S09.c2} 4 枚环绕图标每 16 帧点亮一枚（白闪 2 帧 + 紫光保持）；末 8 帧归零（¶）。停留：末枚点亮 {S09.c2}+30 → 离场 {S09.to+2}−8，≥30 ✓（S09 末块 52）。 | 手机+图标 300px | 点亮图标紫 |
| SC10 沙箱 | {S10.from-8}–{S11.from-9} | {S10.c1} 最后·沙箱 / {S10.c2} 一个 app 一个隐藏 Linux 用户 | 居中"围墙沙箱"（x 100–620，y 480–900：白边围栏 + 内小屋 + 门牌 `/data/data`）+ 围栏锁（draw-on）+ 下缘三枚用户徽章（u10010/u10024/u10058）各配独立虚线圈。 | {S10.c1} 围栏四面墙 draw-on（18 帧）+ 门牌 GlitchIn（本镜唯一 glitch，rgbSplit 4）+ 锁 draw-on + 紫光；{S10.c2} 三枚徽章 2 帧错峰 SoftIn + 各自虚线圈 draw-on（每圈 10 帧）；小屋窗灯亮起持续呼吸；末 8 帧归零（¶）。停留：末圈落位 {S10.c2}+26 → 离场 {S10.to+2}−8，≥30 ✓（S10 末块 52）。 | 沙箱 420px | 门牌+锁紫 |
| SC11 从未解压 | {S11.from-8}–{S12.from-9} | {S11.c1} zip 自己？从没解压 | 清场 → 中央大字 `never unzipped`（Audiowide 104px 白+紫描边）+ 大字下一条小拉链 ZipperLine（openP 呼吸 ±0.05，持续动作）。 | {S11.c1} 大字 SoftIn + emphasisPulse + 紫描边光（不 glitch——留给段末）；拉链开齿呼吸；末 8 帧归零。停留：段内不判。 | 大字 104px | 大字紫描边 |
| SC12 坐在 /data/app | {S12.from-8}–{S13.from-9} | {S12.c1} 坐在 /data/app / {S12.c2} 被一截一截读 | 上段 `/data/app` 目录屋（承接门牌语言：屋形框+门牌等宽 26px 紫）内一枚包裹静坐（0.75×）；下段一束"读取光锥"自右侧手机缩微射向包裹，光锥 ±10° 摆动扫描（持续动作），被扫到的部位亮紫后渐隐。 | {S12.c1} 目录屋 slideUp + 门牌 `/data/app` GlitchIn（本镜唯一 glitch，rgbSplit 4）+ 包裹 SoftIn；{S12.c2} 光锥扫描全镜持续 + 被读部位逐块亮起（6 块）；`read in pieces` 灰 22px 打字机；运镜：1.0→1.06 慢推；末 8 帧归零（¶+gap15）。停留：光锥扫描持续至离场帧 ✓（S12 末块 40+gap15）。 | 屋+包裹+光锥 300px | 光锥白；被读部位紫 |

## G3（照片 → 2021 还是 zip → PK → ★收束）
| 镜头 | 帧 | 节拍 | 画面 | 动效 | 主角·尺寸 | 光 |
|---|---|---|---|---|---|---|
| SC13 ★2021 还是 zip | {S13.from-8}–{S14.from-9} | {S13.c1} 2021 的 bundle？ / {S13.c2} 底下还是 zip | **真实素材+论点镜**。上段：一张 PhotoCard（x 90–630，y 300–560：android_statues.jpg，白框，暗调 grade）+ 下缘灰 20px 出处小字 `photo: Atomic Taco · CC BY-SA 2.0 · Wikimedia Commons`；下段：三枚 SplitChip（cx 170/360/550，`base.apk` 紫亮 / `config.arm64_v8a.apk` 灰 / `config.en.apk` 灰）+ 大字 `still zips`（Audiowide 84px 白+紫描边）。 | {S13.c1} PhotoCard 自左滑入（Δ120）+ 内部紫扫描线每 40 帧扫过（持续动作）+ 出处小字 ≥75 帧 ≥50% α；三枚 SplitChip 2 帧错峰 SoftIn（base 保持紫光，两枚灰暗被"不需要"删除线划过）；{S13.c2} `still zips` GlitchIn（本镜唯一 glitch，rgbSplit 6）+ emphasisPulse + 紫光晕呼吸（持续）；运镜：33 帧 1→1.1 推向大字。停留：段末（¶），大字落位 {S13.c2}+21 → 离场 {S13.to+2}−8，≥30 ✓（S13 末块 39）。 | `still zips` 84px | base 紫光+大字紫晕 |
| SC14 两字节 P·K | {S14.from-8}–{S15.from-9} | {S14.c1} 头两个字节·P·K | 承接：SplitChip 淡出，中央大字 `P, K`（Orbitron 150px 白+紫描边）+ 字上方一枚小 HexDump 缩微（0.45×，首两格保持紫亮）+ 引线。 | {S14.c1} 缩微 HexDump 淡入 + 引线 draw-on（10 帧）→ `P, K` GlitchIn（本镜唯一 glitch，rgbSplit 6）+ emphasisPulse + 紫光晕爆发后呼吸（持续）；其余区域变暗 30%；末 8 帧归零（¶）。停留：大字落位 {S14.c1}+21 → 离场 {S14.to+2}−8，≥30 ✓（S14 末块 47）。 | `P, K` 150px | 大字紫晕 |
| SC15 ★收束 | {S15.from-8}–{TOTAL} | {S15.c1} 每个 app 都是 zip | **片尾收束·扫光②**。清场 → 三轮紫光横扫（{S15.from-8}+4/+22/+40，各 16 帧）→ 发光竖线自中心 draw-on（12 帧，x360 上下柔光）→ 大字 `Every app is a zip you can read.`（Noto 900 56px 两行白+紫描边，GlitchIn rgbSplit 8，全片最后一次 glitch）+ emphasisPulse → 3 枚小信封 3px/帧纵向下行至压黑；不归零（压黑层接管，endingFade=6）。 | 三轮 LightSweep（每轮 3 条 16 帧）；白线 draw-on + 白闪 3 帧；大字 GlitchIn（前挂 −4 帧对齐节拍：{S15.c1}+17 落定 → (S15.to−6)−({S15.c1}+17) = 2142−2115 = 27 帧满态 + 光晕延续 ✓（末块 51 帧预算已核）；信封纵向下行（持续动作）；压黑由常驻层接管。停留：大字满态 ≥27 帧满亮 + 渐晕光至压黑（分镜表末镜表已核）。 | 大字 56px×2 行 | 扫光+白闪+紫晕（片尾唯一大面积光） |
