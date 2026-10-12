# NTP — Why Every Clock Agrees · 调研笔记（EP6）

> 方法：curl 直抓一手来源存 `research/`。所有画面数字须在本表有出处。

## 一、来源清单
| 文件 | 内容 | 用途 |
|---|---|---|
| `rfc5905.txt` | RFC 5905（NTPv4，D. Mills 等，2010） | 协议权威定义（stratum 层级等） |
| `p_ntp.txt` | Wikipedia "Network Time Protocol"（2026-10 快照） | Mills/1985/交集算法/精度量级 |
| `p_leap.txt` | Wikipedia "Leap second"（2026-10 快照） | 27 次闰秒/UTC-TAI=37s/1972 |
| `p_drift.txt` | Wikipedia "Clock drift"（2026-10 快照） | 石英漂移 ppm→秒/天换算 |
| `p_pool.txt` | ntppool.org 官网（2026-10 快照） | 志愿者池的存在与运作 |

## 二、事实清单（每条带出处）
- **石英漂移**：漂移以 ppm 计，"each unit equates to 86.4 milliseconds of drift per day. Common market watches usually range from ±1 to ±100 ppm"（p_drift）。→ ±20ppm ≈ 1.7 s/天；±100ppm ≈ 8.6 s/天。解说用"每天几秒"（区间中值安全）。
- **NTP 精度**："NTP can usually maintain time to within tens of milliseconds over the public Internet, and can achieve better than one millisecond accuracy in local area networks"（p_ntp）。
- **算法**："It uses the intersection algorithm, a modified version of Marzullo's algorithm, to select accurate time servers and is designed to mitigate the effects of variable network latency"（p_ntp）→ 通俗版：问一群服务器，信互相 agree 的，drop 掉离群的。
- **stratum**：RFC 5905："Primary servers are assigned stratum one; secondary servers at each lower level are assigned stratum numbers one greater"（rfc5905 L368）；stratum 0 = 基准（原子钟/GPS），1–15 为有效层级，16 = 未同步（RFC 5905 §7.1 语义）。
- **人物与年代**：Developed by **David L. Mills**, Harlan Stenn, Network Time Foundation；Introduced **1985**（p_ntp 信息框；RFC 958 为首版）。
- **闰秒**："Since 1972, 27 leap seconds have been added to UTC, with the most recent occurring on 31 December 2016; thus the difference between UTC and TAI is now 37 seconds. All have so far been positive"（p_leap）。
- **池**：pool.ntp.org = "the internet cluster of ntp servers"，志愿者加入（p_pool 首屏文字）。数量级："thousands of servers"（池官方惯用表述；具体计数不上画面）。
- **为什么在乎（画面三例）**：TOTP 登录码 30 秒窗口（RFC 6238 常识）；证书 NotBefore/NotAfter 两时刻之间有效；分布式数据库依赖时间戳定序。三项均为协议常识，画面以示意呈现。

## 三、示例语境（全片统一）
- 示例设备：`your laptop`；示例服务器 `time.example`（.example 保留域）
- 示例读数：`11:59:58` / `±0.03 s`（tens of milliseconds 量级示意）/ `stratum 1–15`
- 年份：`1985` / `2016`（末次闰秒）；`27 leap seconds`

## 四、术语表
- NTP（Network Time Protocol）/ UTC / TAI
- stratum 0–15（层级；0=原子钟/GPS 基准源）
- intersection algorithm（交集算法，Marzullo 改进版）
- slew（渐调：微调快慢追平，不跳变）/ step（跳变，NTP 只在大偏差时用）
- pool.ntp.org（公共志愿者池）

## 五、待核清单
- ~~石英漂移量级~~ ✓（p_drift）
- ~~27 闰秒 / 1972 / 2016-12-31~~ ✓（p_leap）
- ~~1985 / Mills / RFC 5905~~ ✓（p_ntp + RFC 原文）
- 池的具体服务器数 → 不上画面（"thousands"）

## 六、叙事策略
- 处境开场：你的时钟现在就是错的（漂移可视化：真时间线 vs 走偏的线）
- 主线：漂移会坏事（三例）→ 时间金字塔（原子钟→GPS→服务器链）→ 交叉核对（信一致、弃离群、缓调不跳）→ 志愿者委员会（池/1985/27 闰秒）
- 金句：`Time isn't kept. It's agreed.`
- 与系列呼应：EP3 TLS（证书验证依赖时间）、EP5 BGP（地图靠互相说，时间靠互相核——"committee"主题对位）
