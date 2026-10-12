# BGP — The Internet's Diplomats · 调研笔记（EP5）

> 方法：curl 直抓一手来源存 `research/`（TLS 期 429 绕行方案）。所有画面数字须在本表有出处。

## 一、来源清单

| 文件 | 内容 | 用途 |
|---|---|---|
| `rfc4271.txt` | RFC 4271 "BGP-4"（Rekhter/Li/Hares，2006-01，废止 RFC 1771） | 协议权威定义 |
| `p_cf_bgp.txt` | Cloudflare 官方博文《Why the Facebook outage today was about BGP》（2021-10-04） | FB 断网事件一手数据 + BGP 通俗讲解框架 |
| `p_fb_outage.txt` | FB engineering 博客（已 404 迁移，仅存 404 页） | 未用，事件以 Cloudflare 侧数据为准 |
| `p_bgp_hijack.txt` | Wikipedia "BGP hijacking"（2026-10 快照） | 2008 巴基斯坦/YouTube 案例 + 事故年表 |
| `p_asn.txt` | Wikipedia "Autonomous system (Internet)"（2026-10 快照，引 potaroo） | ASN 数量增长史 |

## 二、事实与数字清单（每条带出处）

### 协议本质
- **"The Internet is a network of networks, and it's bound together by BGP."**（p_cf_bgp）
- BGP = Border Gateway Protocol，让一个网络向其他网络"advertise its presence"（宣告自己的存在/可达前缀）。（p_cf_bgp）
- **AS 定义**："a set of routers under a single technical administration, using an interior gateway protocol..."（rfc4271 L218/L415）
- 每个 AS 有 ASN（Autonomous System Number）；Cloudflare 的 ASN = **AS13335**（p_cf_bgp）。
- AS 能 **originate**（自有前缀）或 **transit**（转送他人的前缀）。（p_cf_bgp）
- "Every ASN needs to announce its prefix routes to the Internet using BGP; otherwise, no one will know how to connect and where to find us."（p_cf_bgp）
- **选路规则**（简化）：RFC 4271 §9.1 决策中，local-pref 后比 **AS_PATH 短者优先**（rfc4271 L983 起；讲解简化为"路过的网络名单最短者胜，大致上"）。
- **无中央地图**：路由表由全网各自声明、互相转告拼成（Cloudflare 全篇框架；"That trust, standardization, and cooperation between entities are at the center of making it work"）。
- 抽象示例（p_cf_bgp）：AS1→AS2→AS3 快路径 vs AS1→AS6→AS5→AS4→AS3 备路径。

### 规模
- 路由系统中的独立网络数：1999 年 >5,000；2008 年末 >30,000；2018 年初 >60,000；**2025 年已分配 ASN 约 120,000**。（p_asn，引 potaroo）
- 互联网约 50 亿活跃用户。（p_cf_bgp："almost five billion active users worldwide"）

### 信任的裂缝（事故史）
- **1997-04：AS7007 事件**——小 ISP 错误宣告大量前缀，全球流量被吸入黑洞（p_bgp_hijack 事故年表第一条；"the day the Internet broke"是通称，画面用"1997"即可）。
- **2008-02-24：巴基斯坦/YouTube 事件**——PTA 下令国内屏蔽 YouTube，Pakistan Telecom 的屏蔽路由泄漏到全球 BGP 表，"accidentally black-holed the route in the global BGP table"，YouTube 全球不可用（p_bgp_hijack）。机制：**更具体的前缀（长掩码）胜出**——屏蔽方宣告了 YouTube 地址的更细分段，全世界流量按"最长匹配"原则改道。（Wikipedia 只写 black-hole；最长匹配机制在 p_cf_bgp/CF 学习中心框架 + RFC 4271 语境下属通识，画面按"更具体的宣告赢得流量"呈现。）
- **2021-10-04：Facebook 断网**（本片主案例）：
  - **15:40 UTC** 前后：Cloudflare 看到 FB 路由变更洪峰（p_cf_bgp："at around 15:40 UTC we saw a peak of routing changes"）
  - 路由撤回（withdraw）→ FB 的 DNS 服务器无法到达 → 1.1.1.1 / 8.8.8.8 返回 SERVFAIL（p_cf_bgp）
  - "With those withdrawals, Facebook and its sites had effectively disconnected themselves from the Internet."（p_cf_bgp）
  - **DNS 洪峰：正常量的 30 倍**（p_cf_bgp："30x more queries than usual"）
  - facebook.com 在 1.1.1.1 的可用性：**约 15:50 UTC 停止，约 21:20 UTC 恢复**；21:00 UTC 起 FB 侧重新出现 BGP 活动，21:17 达峰，21:28 确认重连（p_cf_bgp Update 段）
  - **全程约 6 小时**（15:40→21:20 ≈ 5h40m，服务完全恢复更晚；解说说"almost six hours"有据）
  - FB 的 ASN = **32934**（p_cf_bgp："Facebook's affected ASN 32934"）
  - 通俗框架（画面金句候选）："**The internet forgot Facebook's address.**"（CF 博文事实的比喻化表达——BGP 撤回=地图上把 FB 的地址抹掉了）

### 修复
- **RPKI**：给"谁拥有哪个前缀"加**密码学签名**，宣告可验真伪（p_bgp_hijack 提及 RPKI；概念级呈现，不引百分比——当前采纳率各源分歧大，不上具体数字）。
- BGP anycast：根 DNS 服务器用它防 DoS（p_bgp_hijack；与 EP2 DNS 呼应但本片不展开）。

## 三、示例语境（全片统一）
- 示例用户查询 `shop.example`（沿用系列惯例保留 .example）
- 示例 AS 号（画面虚构标注）：`AS64512`（文档保留段 64,512–65,534 内，RFC 6996 保留给 Private Use——p_asn 提及保留段；用它安全）
- 示例前缀：`203.0.113.0/24`（TEST-NET-3，RFC 5737 文档段）
- 世界图节点用 `you` / `AS64512` / `the world` 等泛称

## 四、术语表
- AS（Autonomous System）自治系统：一个统一管理的大网（ISP、云、大学、大公司）
- ASN：自治系统号
- announce / withdraw：宣告 / 撤回（BGP UPDATE 的两种动作）
- AS_PATH：路由经过的 AS 名单（越长越"远"）
- prefix：一段 IP 地址（如 203.0.113.0/24）
- longest match：最长前缀匹配（更具体者胜）

## 五、待核清单（不解决不上画面）
- ~~FB 断网时长~~ ✓（CF 博文 Update 段时间戳）
- ~~巴基斯坦事件日期~~ ✓（2008-02-24，Wikipedia 事故年表）
- ~~AS 数量~~ ✓（2025 约 120,000 已分配，Wikipedia/potaroo）
- ~~AS_PATH 选路~~ ✓（RFC 4271 §9.1）
- RPKI 具体百分比 → **不上画面**（各源分歧，概念级呈现）

## 六、叙事策略（与系列风格对齐）
- 处境开场：`site not found`？不，是整个 internet 找不到 FB（15:40 那一分钟，几十亿人同时刷新）
- 主线：互联网没有中央地图 → 12 万个网络互相"喊路"画出地图（diplomats 比喻：外交官们互相交换使团名单）→ 地图是信任做的（2008 巴基斯坦、1997 AS7007）→ 2021 FB 把自己从地图上抹掉 6 小时 → 签名（RPKI）正在补上信任的缺口
- 金句候选：`The internet has no map. It's drawn by hand, every few seconds.` / `No one owns the map. Everyone does.` / `The internet forgot Facebook's address.`
- 与系列呼应：EP2 DNS（名字→地址，BGP 管"地址怎么到"）、EP4 CDN（anycast 本身就是 BGP 宣告技巧）——一两句回指即可，不展开
