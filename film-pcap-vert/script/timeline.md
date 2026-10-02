# 时间轴（edge · en-US-AndrewNeural +0%，共 2132 帧 = 71.1s，166 词，语速 2.85 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 0 | 41–143 | 3.4s | 32 |  | Your page takes nine seconds to load.｜Customers are leaving. |
| S02 | 0 | 154–212 | 2.0s | 59 |  | The logs say sixty milliseconds. |
| S03 | 0 | 223–304 | 2.7s | 52 | ¶ | Both are true.｜The missing time is on the wire. |
| S04 | 0 | 335–477 | 4.8s | 64 |  | Everything you send travels as packets —｜envelopes with a header and a payload. |
| S05 | 0 | 488–635 | 4.9s | 52 | ¶ | Packet capture means catching a copy｜of every envelope｜passing a point in the network. |
| S06 | 0 | 666–854 | 6.3s | 57 |  | Three places to stand:｜your own machine,｜a mirrored port on the switch,｜or a tap spliced into the cable. |
| S07 | 0 | 865–1078 | 7.1s | 30⚠ | ¶ | Wireshark turns that copy into three panes:｜one row per packet,｜the layers peeled open,｜the raw bytes. |
| S08 | 0 | 1109–1201 | 3.1s | 43 |  | Now follow one conversation｜and read the timestamps. |
| S09 | 0 | 1224–1394 | 5.7s | 71 |  | The response is retransmitted,｜each wait doubling:｜one second, two, then four. |
| S10 | 0 | 1405–1566 | 5.4s | 77 | ¶ | Seven seconds of silence,｜inside a response｜the server logged as sixty milliseconds. |
| S11 | 0 | 1597–1769 | 5.8s | 83 |  | TLS hides the letters,｜not the envelopes —｜who, when, and how much still shows. |
| S12 | 0 | 1780–1840 | 2.0s | 61 |  | So capture only what you're authorized to. |
| S13 | 0 | 1861–1919 | 2.0s | 59 |  | A log tells you what a program believed. |
| S14 | 0 | 1930–1986 | 1.9s | 57 |  | A capture tells you what actually happened. |
| S15 | 0 | 1997–2032 | 1.2s | 36⚠ | ¶ | The wire doesn't lie. |

## 章节起始帧

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
