# TCP & UDP — 调研文档（双版共用）

> 主题：《TCP & UDP, Explained》— 横版 YouTube（4 章 ~5 min）+ 竖版 TikTok（~70 s）
> 调研方法：全部关键事实直接取自 IETF 原始 RFC 文本（rfc-editor.org，本机已拉取全文于 /home/z/my-project/research_tcpudp/direct/）；
> 联网搜索服务在调研当日持续 429 限流，故**只采用 RFC 可核事实**，未核实项全部列入文末【待核】并**不进解说词、不上画面**。
> 本片与《PCAP》同宇宙：沿用信封（packet）母题与 TEST-NET 示例语境；「1 s → 2 s → 4 s 重传回退」在 PCAP 片已核（RFC 6298），本片复用。

## 0 执行摘要

- IP 层（RFC 791，1981）**故意不提供可靠通信**：无确认、无重传、无顺序、无流控。可靠性不是网络给的，是两个传输层协议在端上补的：TCP（可靠、有序、有连接）与 UDP（无连接、无保证、8 字节头）。
- 最反直觉的两点：① UDP 的「不可靠」是**卖点**不是缺陷——实时语音丢包晚到即死，重传毫无意义（RFC 3550/3551）；② 最新版 HTTP/3（2022）反而跑在 UDP 上：QUIC（2021）在应用层重建了 TCP 的全部承诺（RFC 9000/9114）。
- 一句话主线：**同一条线上两种承诺——TCP 从不丢失，UDP 从不等待。**

## 1 处境与问题（贯穿示例）

贯穿示例（两版共用）：**你正在视频通话，同时给对方发一张照片**。
- 语音 = 每 20 ms 一个包的实时流（RFC 3551 默认打包间隔 20 ms，§5/payload 格式表；20 ms → 50 包/秒）
- 照片 ≈ 3 MB（示意值）→ 以 ≈1460 B 段载荷算 ≈2,055 个包 → 「超过两千个信封」
- 两者走**同一条网线、同一个 IP 层**，但需要**相反的保证**：照片一个都不能少；语音一毫秒都等不起。
- 示例 IP 用 TEST-NET（198.51.100.24 客户端 / 203.0.113.10 服务器，RFC 5737 保留段，PCAP 片已核）。

IP 只承诺「尽力而为」（best efforts）——RFC 791 原文（rfc791.txt L256, L284-289）：
> "transmitting blocks of data called datagrams from sources to destinations"
> "The internet protocol does not provide a reliable communication facility. There are no acknowledgments either end-to-end or hop-by-hop. There is no error control for data, only a header checksum. There are no retransmissions. There is no flow control."

这是**设计选择**不是缺陷（RFC 1958 §2.5/L91："the tool is the Internet Protocol, and the intelligence is end to end"；§3.5 "Keep it simple"）。

## 2 起源与关键节点（全部可核）

| 事实 | 出处 |
|---|---|
| TCP 思想起源：Cerf & Kahn《A Protocol for Packet Network Intercommunication》IEEE Trans. on Communications, Vol. COM-22, No. 5, pp 637-648, **May 1974** | RFC 793 参考文献 [1] 原文（rfc793.txt L2400+） |
| UDP：**RFC 768，28 Aug 1980**，作者 Jon Postel | rfc768.txt 文头 |
| TCP 现行标准：**RFC 793，September 1981**（"prepared for DARPA"） | rfc793.txt 文头 |
| IP：**RFC 791，September 1981** | rfc791.txt 文头 |
| DNS：**RFC 1035（Nov 1987）**，服务器同时监听 **UDP 端口 53 与 TCP 端口 53** | rfc1035.txt L1749-1754 |
| RTP（实时音视频传输）：**RFC 3550（2003）**；默认打包间隔 **20 ms**：**RFC 3551** | rfc3551.txt L1116: "The default packetization interval is 20 ms" |
| HLS（ buffered 流媒体）：**RFC 8216（2017）**"Data SHOULD be carried over HTTP"（= TCP） | rfc8216.txt L252 |
| 拥塞控制基数：**RFC 5681**：丢包时 ssthresh = max(FlightSize/2, 2·SMSS)（减半）；超时则 cwnd 降到 1 段重新慢启动；**IW = 10 段（RFC 6928）** | rfc5681.txt L376-407；rfc6928 |
| QUIC：**RFC 9000，May 2021**，标题即 "QUIC: A UDP-Based Multiplexed and Secure Transport"；"QUIC packets are carried in UDP datagrams"（rfc9000.txt L279） | rfc9000.txt |
| HTTP/3：**RFC 9114，June 2022** | rfc9114.txt 文头 |
| QUIC 早期设计文档：Roskind, J., "QUIC: Multiplexed Stream Transport Over UDP", **2 December 2013**（Google docs） | RFC 9000 参考文献 [EARLY-DESIGN]（rfc9000.txt L8147-8150） |
| 重传回退 1 s 起步指数翻倍 | RFC 6298（PCAP 片调研已核，复用） |
| 以太网 MTU 1500 B → TCP 段载荷 ≈1460 B | PCAP 片调研已核，复用 |

## 3 机制对比（画面主轴）

### TCP（RFC 793）
- **有连接、端到端可靠**："TCP is a connection-oriented, end-to-end reliable protocol"（rfc793.txt L277-279）
- **三路握手**："A 'three-way handshake' is the procedure used to establish a connection"（L1981；L1836："necessary because sequence numbers are not…"）；握手消息即 SYN → SYN-ACK → ACK（L250 前后 §3.1 标志位 SYN/ACK）
- **可靠性的机制本体**："Transmission is made reliable via the use of sequence numbers and acknowledgments"（L771）；"If the ACK is not received by the timeout the data is retransmitted"（L441 意译，RFC 6298 规定 1 s 起、每超时翻倍）
- **流控**："To govern the flow of data between TCPs, a flow control mechanism is used... window"（L787+）；接收方通告窗口
- **头部**：RFC 793 §3.1 字段图：Source Port / Destination Port / Sequence Number / Acknowledgment Number / Data Offset+Flags(URG·ACK·PSH·RST·SYN·FIN) / Window / Checksum / Urgent Pointer / Options；**最小 20 字节（Data Offset ≥ 5 × 32 bit words），最大 60 字节**
- **排序重组**：接收端按序号重组、缺号等待（L632 "ensure reliable ordered data transmission"）
- **拥塞控制**（RFC 5681）：慢启动（从 IW=10 段）→ 拥塞避免线性加性增大 → 丢包减半 → 超时回 1 段

### UDP（RFC 768）
- 原文定位（rfc768.txt L20-26）："This protocol provides a procedure for application programs to send messages to other programs with **a minimum of protocol mechanism**. The protocol is transaction oriented, and **delivery and duplicate protection are not guaranteed**. Applications requiring ordered reliable delivery of streams of data should use the Transmission Control Protocol (TCP)."
- **头部 8 字节，4 字段**：Source Port(16b) / Destination Port(16b) / Length(16b) / Checksum(16b)（RFC 768 Format 节）
- 无握手、无连接状态、无重传、无排序、无流控——「寄明信片」

### 共同点：端口
- 16 位端口号 0–65535（RFC 793/768 头部定义）；**TCP 与 UDP 是两个独立的端口空间**（同号不同协议）
- 画面示例：TCP:443（HTTPS）、UDP:53（DNS）、UDP:443（QUIC——RFC 9000）

### 实时 vs 缓冲的分界
- 实时音视频：RTP over UDP（RFC 3550，RTP 本身也不保证传输——"It does not guarantee delivery or prevent out-of-order delivery"）；20 ms 打包（RFC 3551）→ 每秒 50 包；晚到的语音包 = 死包，下一包已在路上
- 缓冲流媒体（点播/HLS）：over HTTP/TCP（RFC 8216）——「宁可晚到也要完整」与实时相反
- DNS：一问一答各一个包（RFC 1035，UDP 53）——握手成本 > 传输本身

## 4 QUIC 翻转（第 4 章）
- QUIC 在 UDP 之上**重建了** TCP 式的可靠性与拥塞控制（rfc9000.txt L289-294 "QUIC provides the necessary feedback to implement reliable delivery and congestion control"）
- 连接迁移（L296-299 "QUIC connections are not strictly bound to a single network path... connection identifiers"）——WiFi→蜂窝不断线
- 加密内建（标题 "...and Secure Transport"）
- HTTP/3 = HTTP semantics over QUIC（RFC 9114）
- 解读（画面用）：内核里的 TCP 冻结了几十年、升级不动；UDP 是一张白纸，可靠性可以在**应用层**快速迭代——「可靠性搬了个家，从内核搬到应用」

## 5 边界与常见误解（QC 判据）
- ❌「视频网站都走 UDP」——错。Netflix/YouTube 点播走 HTTPS/HLS = TCP（RFC 8216）；走 UDP 的是**实时**通话（RTP/WebRTC 类）
- ❌「UDP 比 TCP 快」——不准确。UDP 更**简**（无握手延迟、无状态、头小 8 vs 20+）；吞吐上限不取决于头部长度
- ❌「TCP 有连接、UDP 是新协议」——倒序：UDP RFC 768（1980.8）比 TCP RFC 793（1981.9）还早
- ❌「QUIC 取代了 UDP」——QUIC **建在** UDP 上（RFC 9000 标题）
- DNS 大响应/区域传输走 TCP 回退（RFC 1035 L1749-1750），「DNS 只用 UDP」过简化——画面措辞用 "a DNS lookup is one question, one answer, usually UDP"（解说词避开绝对化）

## 6 数字与比喻清单（上画面的每个数字都在这）

| # | 数字/事实 | 出处 | 可信度 |
|---|---|---|---|
| 1 | 照片 3 MB → >2,000 个信封（3,000,000/1460 ≈ 2,055） | MTU 1500（PCAP 片已核）+ 示意值 | ★★示意 |
| 2 | 每 20 ms 一个语音包 → 50 包/秒 | RFC 3551 L1116 | ★★★ |
| 3 | TCP 头最小 20 B / 最大 60 B | RFC 793 §3.1 | ★★★ |
| 4 | UDP 头 8 B、4 字段 | RFC 768 Format | ★★★ |
| 5 | SYN → SYN-ACK → ACK | RFC 793（three-way handshake, L1981） | ★★★ |
| 6 | 重传计时器 1 s 起、翻倍（1→2→4） | RFC 6298（复用 PCAP） | ★★★ |
| 7 | 拥塞窗口丢包减半；超时回 1 段；IW=10 段 | RFC 5681 / RFC 6928 | ★★★ |
| 8 | 端口 0–65535，16 位 | RFC 793/768 头部 | ★★★ |
| 9 | 1974-05 Cerf & Kahn 论文 | RFC 793 参考文献[1] | ★★★ |
| 10 | RFC 768 = 1980-08-28；RFC 793 = 1981-09 | RFC 文头 | ★★★ |
| 11 | DNS：UDP 53（一问一答） | RFC 1035 | ★★★ |
| 12 | HTTP/3 = RFC 9114，2022-06；QUIC = RFC 9000，2021-05 | RFC 文头 | ★★★ |
| 13 | QUIC 跑在 UDP 上；连接迁移；内建加密 | RFC 9000 | ★★★ |
| 14 | IP「无确认、无重传、无流控」 | RFC 791 L284-289 原文 | ★★★ |
| 15 | 点播视频走 HTTP（TCP） | RFC 8216 L252 | ★★★ |
| 16 | QUIC 早期设计 2013-12-02（Roskind） | RFC 9000 [EARLY-DESIGN] | ★★★ |

比喻（各写贴切与失真）：
1. **信封 vs 明信片**：TCP 段=挂号信（编号+回执），UDP=明信片（写完就投）。失真：明信片内容公开可见，UDP 载荷同样不加密（QUIC/DNS over TLS 才补上）。
2. **三路握手=打电话开头**："能听到吗？""能，你呢？""能"。失真：电话这句话本身也走同一条线，TCP 握手包也是包。
3. **电话答录机 vs 广播电台**：TCP 像答录机（没收到就重放），UDP 像现场直播（错过就是错过）。失真：电台无差错校验，UDP 有校验和（可选但常开）。
4. **快递单号 vs 不写寄件人**：序列号=快递单号可查可追；UDP 无单号。失真：UDP 有校验和，不是完全不管。
5. **高速公路 vs 城市道路**：拥塞控制=看到堵车自觉半速。失真：TCP 看不到「堵车」，只看到「超时/重复确认」这个症状。

## 7 术语表（上画面用直引号、非缩写场景先展开）
TCP (Transmission Control Protocol) / UDP (User Datagram Protocol) / IP (Internet Protocol) / RFC / SYN / ACK / SYN-ACK / sequence number / three-way handshake / retransmission / RTO (retransmission timeout) / flow control / receive window / congestion control / slow start / MSS / port / datagram / postcard / RTP / packetization / DNS / QUIC / HTTP/3 / connection migration / best effort

## 8 【待核】——不进解说词、不上画面
- 1983-01-01 ARPANET「flag day」切换 TCP/IP（搜索限流未核）
- 1978 年 TCP/IP 拆分细节（同上）
- Van Jacobson 1988 SIGCOMM 论文年份署名（拥塞控制在画面上只提「RFC 5681 规定」，不提人名）
- WebRTC 具体栈（只说 "real-time calls"）
- Google QUIC 2013 部署细节（只用 RFC 9000 [EARLY-DESIGN] 的 2013-12-02 文档日期）
