# WiFi — The Conversation in the Air · 调研笔记（EP7）

> 方法：curl 直抓一手来源存 `research/`。所有画面数字须在本表有出处。

## 一、来源清单
| 文件 | 内容 | 用途 |
|---|---|---|
| `p_802.txt` | Wikipedia "IEEE 802.11"（2026-10 快照） | 半双工/CSMA-CA 定义/1997 首发/2 Mbit/s |
| `p_csma2.txt` | Wikipedia "CSMA with collision avoidance" | 先听后说/随机等待/确认失败→二进制指数退避/RTS-CTS |
| `p_chan.txt` | Wikipedia "List of WLAN channels" | 2.4 GHz 信道 1/6/11 不重叠 |
| `p_hidden.txt` | Wikipedia "Hidden node problem" | 隐藏节点：两设备互相听不见但都能达路由器 |

## 二、事实清单（每条带出处）
- **半双工**："consists of a series of half-duplex over-the-air modulation techniques"（p_802）→ 解说" radios can't talk and listen at the same time"。
- **CSMA/CA**："employs carrier-sense multiple access with collision avoidance (CSMA/CA) whereby equipment listens to a channel for other users before transmitting each frame"（p_802）。
- **先听后说 + 随机等待**："prior to transmitting, a node first listens to the shared medium... if another node was heard, we wait for a period of time (usually random) for the node to stop transmitting before listening again"（p_csma2）。
- **确认与退避**："the node awaits receipt of an acknowledgement packet from the Access Point... If such acknowledgement does not arrive in a timely manner, it assumes the transmission was lost, causing the node to enter a period of binary exponential backoff"（p_csma2）。
- **隐藏节点**："occurs when a node can communicate with a wireless access point (AP), but cannot directly communicate with other nodes... multiple nodes can send data packets to the AP simultaneously, which creates interference at the AP, resulting in no packet getting through"（p_hidden）。
- **RTS/CTS**："Request to Send/Clear to Send (RTS/CTS) may optionally be used at this point to mediate access"（p_csma2）→ 通俗版："路由器让他们先报名再发言"。
- **1997 / 2 Mbit/s**："802.11-1997 was the first wireless networking standard in the family"（p_802，原文含 2 Mbit/s 数据速率）。
- **信道 1/6/11**："the channel definition provides 3 MHz between 1, 6, and 11"（p_chan，不重叠三信道为通识结论）。

## 三、示例语境（全片统一）
- 示例设备：`your laptop` / `your phone` / `the router`
- 信道带：`1 6 11`（2.4 GHz）；示意邻居网络 `net A/B/C`
- 年份与速率：`1997` / `2 Mbit/s` → `today`
- 退避：`random pause`（示意）

## 四、术语表
- half-duplex（半双工）｜CSMA/CA（载波侦听多路访问/冲突避免）
- random backoff（随机退避）｜acknowledgement（确认帧）
- hidden node（隐藏节点）｜RTS/CTS（请求发送/清除发送）
- 2.4 GHz channels 1/6/11

## 五、待核清单
- ~~1997 / 2 Mbit/s~~ ✓ ｜~~1/6/11 不重叠~~ ✓ ｜~~先听后说/随机退避/隐藏节点/RTS-CTS~~ ✓
- 5 GHz/6E/WiFi 世代细节 → 不上画面（Ch4 只说 "faster radios, wider bands" 概括，有 p_802 上下文支撑）

## 六、叙事策略
- 处境开场：看不见的空气里满是"对话"
- 主线：半双工=一次只能一人说 → 先听后说+随机退避（礼貌的工程化）→ 公寓拥挤（信道 1/6/11 共享 + 隐藏节点 + RTS/CTS 报名制）→ 1997 的 2 Mbit/s 到今天（礼貌是速度的前提）
- 金句：`One sky.` `One voice at a time.`
- 与系列呼应：EP2 DNS（名字）、EP5 BGP（网络间的礼貌协商）、EP6 NTP（互相校对）——"礼貌"主题收束三部曲
