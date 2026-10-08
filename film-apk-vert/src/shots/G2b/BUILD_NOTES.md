# G2b 构建笔记（竖版 APK 片 · 安装流水线后半 SC09–SC12）

Agent: apkvert-G2b-builder · 区间 1365–1876（上承 G2/SC08 止 1364，下接 G3/SC13 起 1877）

## 进度
- [x] SC09 优化条（1365–1505）— tsc 通过
- [x] SC10 沙箱（1506–1645）— tsc 通过
- [x] SC11 从未解压（1646–1718）— tsc 通过
- [x] SC12 坐在 /data/app（1719–1876）— tsc 通过（4 镜已全部注册 index.ts）

## 镜头表（主力/光/运镜）

| 镜头 | 主角 | 主角高度 | 主角的光 | 高光时刻 | 运镜 | 配角数 |
|---|---|---|---|---|---|---|
| SC09 | 手机（屏内更新 UI） | 600px | HeroGlow 微呼吸 + 点亮图标紫光 | — | 无 | 4 图标 |
| SC10 | 围墙沙箱（围栏+小屋） | 围栏 352 + 整组 472px | 门牌 HeroGlow + 锁 GLOW_PURPLE_S + 窗灯暖白 | — | 无 | 3 徽章 |
| SC11 | 大字 never/unzipped | 102px×2 行 | 紫描边光 + GlowBlob 光池 | — | 无 | 拉链 |
| SC12 | 目录屋+包裹+光锥 | 屋 420px | 光锥白 10% + 被读部位紫 | — | 1.0→1.06 慢推 | 4 邻居包裹+缩微手机 |

## 偏离记录（对分镜表原文）
1. **SC10 围栏 y480–900（420 高）→ y472–824（352 高）**：三枚徽章须在围栏下方（分镜表「下缘三枚」），
   徽章圈 r48+UID 文本整体需到 y≈944；若围栏底到 900，徽章必进字幕带（y1002–1056）/超出内容区 y990。
   分镜表坐标按 agent-build-rules §0 属参考值，安全区优先。
2. **SC09 环绕图标「每 16 帧」→ 每 10 帧**：4 枚从 1432 起按 16f 间距，末枚 1480 落定 → 末 8 帧归零
   （1497 起）只余 ~11 帧稳定期，违反 ≥30。分镜表自身「末枚点亮 1432+30」即按 10f 间距核算（1432/1442/1452/1462），
   与横版 SC43 偏离 A3 同源。已按 10f 实现：末枚 1462 落定 → hold ≈31 ✓。
3. **SC10 门牌 glitch 时点**：分镜表动效列把门牌 GlitchIn 归在 1514 组；派单明确「1557 门牌 GlitchIn」且
   「停留：末圈落位 1557+26」按 1557 起算 → 门牌 glitch 定在 1557（c2「one hidden Linux user」），徽章同样
   1557 起 2f 错峰（与分镜表一致），末圈 1575 落位，hold ≈62 ✓。
4. **SC09 屏内字 20px→24px / SC12 read in pieces 22px→24px**：BUILD_RULES_VERT 竖版硬规则最小 24px
   （分镜表 20/22px 为横版习惯残留）。SC09 手机屏 360 宽，24px 等宽两行宽 ≈200px 无溢出。
5. **SC11 大字 104px→102px 且拆两行**：单行 "never unzipped" 104px 估宽（textW, EM_WIDE）≈578px，
   超竖版安全内容宽 560；拆 "never"/"unzipped" 两行，102px 时 "unzipped" ≈546+描边 ≈551 ≤560 ✓，仍满足大字 ≥96。
6. **SC10 徽章圈 r52→r48**：UID 文本 24px（最小字号）6 字符 ≈87px，r48（直径 96）恰容；y896 定位后
   圈底 944 + 文本底 ≈964，均在内容区 y990 内。

## 复用图元
- 共用：PhoneMock / ParcelIcon / ZipperLine / PersonIcon / CText / Box / HeroGlow / GlowBlob / GlitchIn
- g2bui.tsx（本组，自横版 g7ui·g7bui 移植到竖版坐标）：AppDotV / SandboxFenceV / SandboxHouseV /
  LockGlyphV / BadgeGlyphV / DirectoryHouseV / ReadConeV / MiniPhoneV / typedLen
