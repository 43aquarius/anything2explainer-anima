# G3（揭秘 → 结尾：SC09–SC13，S10–S15）构建笔记

竖版 720×1280；内容主区 y240–990 / x40–620，中轴 x360，字幕带 y1002–1056。帧区间严格按分镜表 G3 表。
镜头组件均为纯函数（N = useCurrentFrame()+F0），随机只用 `rnd`。tsc 零错误（2025-10-02 实测）。

## 镜头表

| id | 帧 | 文件 | 内容 | 主角 / 高度 | 主角的光 | 高光时刻 | 运镜 | 配角数 | motion_check 最长静止 / 末拍稳定期 |
|---|---|---|---|---|---|---|---|---|---|
| SC09 | 1397–1588 | SC09.tsx | 等式 1+2+4= → `7 s` 130px 橙计数→glitch→橙光晕爆发；server log 60ms 灰+删除线 | `7 s` 130px | 橙光晕 + 橙硬投影（全片唯一大面积橙） | **是（大数字型·全片最高潮）** | 推近 1→1.2 / 32f（1467–1499） | 3（等式/删除线/扩散环） | 0.9s / **6f⚠ 见下** |
| SC10 | 1589–1771 | SC10.tsx | 锁信封 + who/when/how much 三引线 + mini 时间轴 | 锁信封 230px | HeroGlow 紫常亮 | 否 | 无（分镜表未列） | 6 | 1.6s / 72f OK |
| SC11 | 1772–1852 | SC11.tsx | 许可状卡 authorized + 落章白闪 + 绿 Check + 边框绿光 | 许可状 300px | 章紫光 / Check 绿 | 否 | 无 | 3 | 0.9s / 33f OK |
| SC12 | 1853–1988 | SC12.tsx | believed 日志卡（缩微+气泡打字机）vs happened pcap 图标 + HaloRing + ≠ | 下卡 pcap 图标（卡组 240px×2） | HaloRing | 否 | 无 | 6 | 1.2s / **0f⚠ 段内不判** |
| SC13 | 1989–2132 | SC13.tsx | 三轮扫光 → 发光竖线 draw-on → 白闪 + `The wire doesn't lie.` 大字 glitch → 小灰字 + 3 信封下行 | 大字两行 72px×2 | 白闪 + 紫描边 + 线体柔光 | **是（象征物+回扣·扫光白名单②紧凑版）** | 线条 draw-on 后静止（分镜表） | 4 | **3.3s⚠ 纯黑尾段** / 75f~ 不归零 |

## 节拍与关键参数

- **SC09**：等式三数字 1399/1405/1411 错峰各 21 帧缩放 0.42→1（S10 块1 −6 入场）；`7 s` 计数 1435–1455（20 帧，块1 内落定）→ GlitchIn rgbSplit 6 @1455 + 橙光晕爆发（8 帧爬升 + 30 帧呼吸）+ emphasisPulse @1467；`server log: 60 ms` 灰 30px SoftIn @1459（=块2）；删除线 wipe 1490–1502（=块3，宽 270px 灰 2.5px）；离场 1580–1588。**运镜 32 帧**（1467–1499）：受两条硬约束夹逼——运镜不得与 glitch（1455–1467）重叠、须在删除线落位（1502）前结束，比派单的 40 帧短 8 帧，读数已在此记录。
- **SC10**：信封缩放入 1597（21 帧）+ 封口折线/小锁 draw-on；1648（=块2「not the envelopes」）信封白闪 + payload 点阵开始每 30 帧乱序重排（rnd 种子）；三引线 1687/1699/1711（=块3，各 12 帧 draw-on + 标签 SoftIn + 部位白闪）；mini 时间轴 1705 wipe + 橙点 1712 起错峰点亮并缓慢呼吸（30 帧周期）；秒针 ClockIcon 全程持续转。离场 1763–1771。
- **SC11**：卡缩放入 1780（21 帧）+ 签名线 draw-on；authorized 紫 Pill 1782；章落 1790–1800（kf 1.3→1 + 落章白闪 8 帧 + stampLit）；绿 Check draw-on 1792–1804；边框绿光 1804–1812（末拍）；get permission first 灰 26px @1788。Check 落位 1804 → 离场 1844，**40 帧 ✓（段末 ¶+gap）**。离场 1844–1852。
- **SC12**：上卡 slideUp 1861（Δ80/18 帧）+ believed 1863；思考气泡 1873（打字机 52/30/8 循环 90 帧，`60 ms` 橙显）；下卡 slideUp 1930 + happened 1932 + pcap 图标缩放入位；时间轴条 1938 起每 5 帧逐格点亮 + 白游标循环；HaloRing draw-on 1946–1966 + `≠` 56px 缩放入 1946；对撞脉冲 1950/1962（各 12 帧，上 +8px / 下 −8px）；离场 1980–1988。**段内不判**（分镜表 SC12 标注，末拍 1966 → 离场 1980）。
- **SC13**：三轮 LightSweep 1989/1999/2009（bars 定制在 y470–554，首轮与镜头首帧同拍）；竖线 draw-on 1989–2001（x360，y300–900，自中心向两端，白+紫柔光）；白闪 3 帧 + 大字 GlitchIn rgbSplit 8 @**1993（=S15 块 1997 的 −4 前挂，满态 2005）** + emphasisPulse 2005；小灰字 2007；3 枚紫信封 1995 起 3px/帧纵向下行（模 717 循环在 y258–975，信封画在大字之前→从字后穿过）；**不归零**（压黑层接管）。满态 2005 → 压黑 2026 = 21 帧 ≥20 ✓（按分镜表 endingFade=6 计）。

## 复用与新增

- 复用共用层：CText/Pill/Box/Check/LogCard/ClockIcon/PacketIcon/MonoText/SoftIn/GlitchIn/HeroGlow/HaloRing/LightSweep/LightBar/emphasisPulse/kf/camAt/countTo/scaleIn/exitOp/firstOp/fadeIn/mixHex/abs/rnd。
- 组内新增 `g3ui.tsx`：`CamRigV`（fx 的 CameraRig 写死 1280×720 的 translate(640,360)，竖版画布需要 translate(360,640)——插值仍用共用层 camAt）、`OrangeGlow`（横版 g6ui 移植，加 amp 参数）、`LockGlyph` / `PermitCard`（横版 g7ui 移植，竖版尺寸适配）、`tri`。**建议主会话把 CameraRig 竖版化或提供 V 版进 fx.tsx**（G1/G2 若要运镜会再撞一次）。

## 自检

- `npx tsc --noEmit`：零错误。
- `scripts/test_render.sh G3 1397 g3`：30 帧 6.1s（≈4.9 fps）；SC13 段（1993 起）30 帧 4.9s（≈6.1 fps）。
- stills/G3：43 张 f_*.png + boundary_1397 / boundary_2132。SC09 12 张（含计数/glitch/光晕/推近/删除线/尾段）、SC10 7 张、SC11 6 张、SC12 6 张、SC13 12 张（含扫光三轮/竖线/白闪/满态/压黑）。z-ai vision 全部 PASS（5 批，含逐帧描述复核 f_1730 / f_1962：标签、引线指向、卡片内容、无越界无重叠）。
- `python3 scripts/motion_check.py G3` 读数与解释：
  - SC09 6.4s / still 27% / longest 0.9s / **hold 6f**：⚠ 指标伪影——S10→S11 的字幕空窗（1567 起字幕消失）落在脚本的采样窗内（其内容区含字幕带 y1002–1056），1564→1567 帧差 2.63 全部来自字幕带（内容本体仅 0.32，已逐带验证）。镜头自身删除线落位 1502 → 离场 1580 稳定 78 帧 ✓。另为让大面积橙光的呼吸不盖过停留读数，1520 起呼吸幅度从 ±15% 收敛到 ±5%（爆发段仍是 ±15%）。
  - SC10 OK / SC11 OK。
  - SC12 hold 0f：分镜表「段内不判」（片末镜承接）；末拍 1966 → 离场 1980，且打字机 1963 重启——与横版 SC41 同类读数，已记录。
  - SC13 still 3.3s：压黑后纯黑尾段 + 一行 22px 署名（EndCredit builtBy），设计使然（横版 SC42 同读数 3.4s）；hold 75f~（不归零）。

## ⚠ 需主会话裁定

1. **config.ts `endingFade: 30` 与分镜表/task 的 endingFade=6 不一致**（分镜表 SC13 行、G3 派单、常驻层文字三处均写 6，从 {S15.to}−6=2026 起压黑）。当前 30 会让压黑从 2002 就开始、SC13 大字满态即被 10% 黑纱罩住并渐暗，破坏「满态 → 压黑 ≥20 帧」的设计。**建议改为 `endingFade: 6`**；相应地分镜表常驻层「片尾 2003–2132」应更正为 2026–2132（2003 是 fade=30 的算术残留）。本组镜头按 6 的时序构建，未改 config（越界）。
2. fx.tsx 的 CameraRig / Vignette / HaloRing 的 svg 容器仍按 1280×720 硬编码（CameraRig 在竖版画布上整体偏移 (−280,+280) 不可用；HaloRing/Vignette 恰好不致命）。G3 已用组内 CamRigV 绕开；见上「复用与新增」。

## 未完成 / 降级项

- 无未完成镜头。SC09 运镜 32 帧（派单 40 帧）与 SC13 大字 −4 前挂均为硬约束下的有意取舍，已在节拍段记录理由。
