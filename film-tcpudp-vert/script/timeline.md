# 时间轴（edge · en-US-AndrewNeural +0%，共 1882 帧 = 62.7s，124 词，语速 2.53 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 0 | 41–187 | 4.9s | 61 | ¶ | Your voice and your photos｜ride the same wire —｜under two different sets of rules. |
| S02 | 0 | 218–316 | 3.3s | 33 |  | Everything you send becomes packets —｜envelopes of data. |
| S03 | 0 | 327–423 | 3.2s | 31 |  | And the network underneath, IP,｜promises nothing. |
| S04 | 0 | 434–526 | 3.1s | 93 | ¶ | No receipts. No retries. No order. |
| S05 | 0 | 557–638 | 2.7s | 82 |  | So your photo rides TCP — the courier. |
| S06 | 0 | 649–772 | 4.1s | 81 |  | First, a handshake:｜SYN. SYN-ACK. ACK. |
| S07 | 0 | 783–866 | 2.8s | 36 |  | Every envelope numbered,｜every number receipted. |
| S08 | 0 | 877–981 | 3.5s | 42⚠ | ¶ | Lost in transit? Sent again —｜on a timer that doubles. |
| S09 | 0 | 1024–1099 | 2.5s | 76 |  | Your voice rides UDP — the postcard. |
| S10 | 0 | 1110–1209 | 3.3s | 31 |  | No handshake. No receipts.｜Eight bytes of header. |
| S11 | 0 | 1220–1343 | 4.1s | 66 | ¶ | A late packet is a dead packet —｜the call plays a gap, and moves on. |
| S12 | 0 | 1384–1489 | 3.5s | 106 |  | Plot twist: the newest HTTP rides UDP. |
| S13 | 0 | 1500–1642 | 4.8s | 37⚠ | ¶ | QUIC rebuilt TCP's promises｜above the wire,｜where apps can evolve. |
| S14 | 0 | 1685–1730 | 1.5s | 46 |  | TCP never loses. |
| S15 | 0 | 1741–1782 | 1.4s | 42⚠ | ¶ | UDP never waits. |

## 章节起始帧

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
