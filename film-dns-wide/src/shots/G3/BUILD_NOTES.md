# G3 BUILD_NOTES（SC10–SC13 · S16–S23 · Ch2 上①：resolver → root → referral）

## 镜头表
| id | 帧 | 文件 | 主角 | 主角高度 | 主角的光 | 高光 | 运镜 | 配角数 | 最长静止 | 末拍稳定期 |
|---|---|---|---|---|---|---|---|---|---|---|
| SC10 | 2273–2630 | SC10.tsx | 馆员 PersonIcon 200px + `1.1.1.1` 52px | 200px | `1.1.1.1` 紫硬投影；馆员白描边 | — | 慢推 1.0→1.05 | 3 | 1.5s | 18f（段内镜头，分镜表标"段内不判"；末拍元素 2540–2578 落定，离场 2622） |
| SC11 | 2631–2992 | SC11.tsx | `THE ROOT` Audiowide 96px + `13` 86px | 240px 行宽 | 白闪 + 紫硬投影（登场唯一大面积光） | ✅登场型·扫光① | — | 4 | 2.6s | 243f ✓ |
| SC12 | 2993–3119 | SC12.tsx | 定义卡 500×330 | 330px | 卡 HeroGlow + referral 紫字 | — | — | 4 | 3.0s | 90f ✓ |
| SC13 | 3120–3340 | SC13.tsx | TLD 柜台 260×160 + RackIcon 190 | 250px | `.example` Pill GLOW_PURPLE_S | — | 推近 1→1.15 (3255–3288) | 3 | 1.5s | 36f ✓（段内） |

## 复用图元
PersonIcon、BrowserWin、PacketIcon、RackIcon、Pill、Check/Cross、GlitchIn（SC10 `1.1.1.1`、SC12 `referral`）、LightSweep/StageLine/GhostText（SC11 扫光白名单①）、HeroGlow。

## motion_check 读数（组级）
SC10 1.5s/18f、SC11 2.6s/243f、SC12 3.0s/90f、SC13 1.5s/36f。
SC12 的 3.0s 恰好在限内（边界值）。段末镜头 SC11/SC12 hold 达标；SC10 段内不判；SC13 段内不判。

## 关键修复记录
- SC10 初版 still 4.9s：加三枚查询脉冲点无效（9px 在 0.5× 采样下不可见）→ 改用"大扫描框"（190×92 紫边框来回扫）+ 骨架呼吸，降到 1.5s。
- SC10 hold 18f 定位过程：dots 的 `(dotShow % 3) + 1` 尾部循环增减是 bug 已修（Math.min 冻结）；剩余 18f 为离场渐隐计入（段内镜头合规）。
- SC11 扫光三轮 + StageLine + GhostText + 白闪 + GlitchIn rgbSplit8 编排完整；`13` 计数 + A–M + 底行 `13 letters, 2,047 instances today`（事实清单核对 ✓）。

## 持续动作
- SC10 纸条弧线飞 + 查询脉冲（3 枚 90f 周期）+ 扫描框（44f 周期）+ dots 逐个 + 骨架呼吸（2572 冻结）
- SC11 信封飞来弹开 + referral 箭头 + 大字呼吸（pulse）
- SC12 Cross/Check draw-on + 箭头指出画外
- SC13 问号信封弧线 + Rack 指示灯换位闪烁（30f）
