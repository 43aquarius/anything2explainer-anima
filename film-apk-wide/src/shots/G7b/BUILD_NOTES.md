# G7b 构建笔记（第 3 章下半下半段：SC45–SC48，帧 6749–7326）

Agent: apkwide-G7b-builder（wave1，上下文耗尽中断于 SC47 后）+ 主会话补完 SC48。

## 节拍（timeline S45–S48）

S45 6757 / 6800｜S46 6905 / 6949（¶+gap15）｜S47 7033 / 7069｜S48 7125 / 7221（¶+gap20，末块 39⚠+gap20）。

## 白名单执行

- glitch：SC45 `/data/data`（门牌）@6800、SC46 `Ten seconds.` @6949。SC47 大字 SoftIn **不 glitch**（分镜表明示留给段末；实际段末 SC48 无 glitch 设计）；SC48 零 glitch。
- 扫光：本组零（全片扫光 = G3/SC15 与 G8b/SC59）。
- 高光：SC48 = 反转揭示·次高光（never unzipped 主题；不占章额度、不扫光）。
- 事实：/data/data / u10010 / u10024 / u10058 / Ten seconds. / never unzipped / /data/app / read in pieces / ChatApp。

## 逐镜记录

### SC45 沙箱（6749–6896）
- FENCE 480×300 围栏 + SandboxHouse（窗灯暖白呼吸）+ LockGlyph + 门牌 `/data/app`→`/data/data` 紫 mono + 三枚用户徽章（BadgeGlyph + 独立虚线圈 draw-on）。
- 围栏四面墙 18 帧依次合围；门牌 GlitchIn rgbSplit4 @6800；锁 draw-on 12 帧 + 紫光。

### SC46 图标出现（6897–7024）
- PhoneMock 0.8× 图标网格 ChatApp 格最后亮起（紫光 + scaleIn 14 帧 + 白闪）+ 绿 Check；右侧 `Ten seconds.` Audiowide 84px 白+紫描边 GlitchIn rgbSplit6 @6949 + emphasisPulse + MiniClock10 指针 snap 到 10s + 表盘橙光呼吸 + `done.` 灰 36px；手机屏 1.02 庆祝脉冲一轮。
- 停留：大字落位 6949+21 → 离场 6989−8 ✓。

### SC47 从未解压（7025–7116）
- 清场 → `and here is the thing:` 灰 34px 打字机（每 2 帧 1 字，7033 起）→ `never unzipped` Audiowide 110px 白+紫描边 SoftIn 8f @7069 + emphasisPulse（7073 起）+ 紫晕 30f 呼吸；大字落位光池（GlowBlob）60f 呼吸后收敛让位。
- 零 glitch ✓（分镜表：不 glitch——留给段末）。

### SC48 ★坐在那里被阅读（7117–7326）【主会话补完】
- 构成：DirectoryHouse48（150,300 基座；含 4 枚灰邻居包裹）+ 门牌 `/data/app` 紫 mono 22px @ (350,556) + 静坐包裹 ParcelIcon 190×132（openP 0.15，跨中线「坐」中排，±1.5px 48f 呼吸）+ ReadCone 白光锥（起点手机左缘 (1110,258)，指向包裹中心，±12° 摆动 75f 周期，halfDeg 6，len 777，clipY 614）+ MiniPhone (1160,258) 92×170。
- 6 块读取部位（2 列 × 3 行，包裹面内缩 4px）：锥角过窗触发（ROWS_THETA ±3.3°/0°，行↔锥角窗口按 777px 距离张角换算），触发后 40 帧指数衰减（紫填充 0.26k + 边框 0.55k + 触发瞬间 flash 闪）；列按半摆序交替（(halfSweeps+r)%2）→ 「逐一亮起」节奏。
- 手机眨屏：任一块触发后 6 帧内白闪衰减（「每发射一次眨一下」）。
- 7221 `read in pieces` 灰 24px 打字机（每 2 帧 1 字）@(640,588)。
- 运镜：CameraRig 1.0→1.06 慢推 130 帧（7125 起，对准 (520,400)）。
- 归零：章节卡 4 = S48.to+3=7262 → 内容 7253–7261 归零（末 8 帧；紫光/锥光先灭 6 帧 gk）；7262 起零输出（登记到 7326 = S49.from−9，G2/SC10 同款处理）。
- 停留（分镜表裁定）：末元素 = 光锥扫描持续动作至离场帧 ✓（摆动/触发/眨屏全持续，非静止收尾）。
- 触发清单（确定性预计算 TRIGGERS）：F0+1–FADE_TO 逐帧检测锥角过窗；无随机。

## 自检记录

- SC45–47：原 agent 中断前未跑完 stills/VLM（主会话补跑，见 worklog wave1 补检）。
- SC48：tsc 零错误；test_render / stills / VLM / motion_check 由主会话统一跑（见 worklog）。
