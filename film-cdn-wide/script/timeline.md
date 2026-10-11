# 时间轴（edge · en-US-AndrewNeural +0%，共 4464 帧 = 148.8s，380 词，语速 3.01 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–208 | 4.1s | 66 |  | Friday night, eight o'clock.｜You press play on a two-gigabyte movie. |
| S02 | 1 | 219–354 | 4.5s | 54 |  | The origin server sits on another continent —｜eight thousand kilometers away. |
| S03 | 1 | 365–507 | 4.8s | 63 |  | Light itself needs real time to cross that.｜Fiber carries it at two-thirds of c. |
| S04 | 1 | 518–666 | 5.0s | 73 |  | Even on a perfect 100-megabit line,｜two gigabytes would take about three minutes. |
| S05 | 1 | 677–730 | 1.8s | 54 |  | Yet your movie starts in one second. |
| S06 | 1 | 741–838 | 3.3s | 47 | ¶ | The data didn't come that far.｜It was already waiting in your city. |
| S07 | 2 | 914–993 | 2.7s | 38 |  | Bandwidth can be bought.｜The speed of light cannot. |
| S08 | 2 | 1004–1093 | 3.0s | 28 |  | The fix is not a faster network —｜it's a shorter one. |
| S09 | 2 | 1104–1274 | 5.7s | 66 |  | A CDN puts copies of the content｜in hundreds of cities —｜points of presence, edge nodes. |
| S10 | 2 | 1285–1416 | 4.4s | 46 |  | When you press play,｜you're not talking to the origin.｜You're talking to the nearest shelf. |
| S11 | 2 | 1427–1666 | 8.0s | 74 |  | The trick that routes you there｜is called anycast:｜one address, announced from everywhere.｜The network itself picks the closest copy. |
| S12 | 2 | 1692–1902 | 7.0s | 32⚠ | ¶ | And the first question of your request｜is answered by DNS —｜the name you type｜points to the edge,｜not to the origin. |
| S13 | 3 | 1958–2122 | 5.5s | 24 |  | Most requests never reach the origin at all.｜The edge answers from its cache —｜a cache hit. |
| S14 | 3 | 2133–2393 | 8.7s | 40 |  | The content lives there｜until its TTL expires;｜then the edge pulls one fresh copy｜from the origin — a cache miss —｜and the timer starts again. |
| S15 | 3 | 2404–2676 | 9.1s | 51 | ¶ | This is why most of what you stream｜never crosses an ocean.｜Video is more than half of all traffic now,｜and nearly all of it｜is served from someone's edge. |
| S16 | 4 | 2747–2803 | 1.9s | 57 |  | The idea predates the web boom. |
| S17 | 4 | 2814–3023 | 7.0s | 38 |  | In the nineties at MIT,｜a hard question circulated:｜if the whole world hits one server,｜that server will melt. |
| S18 | 4 | 3034–3290 | 8.6s | 81 |  | Akamai, spun out of MIT in 1998,｜became the answer —｜today its platform carries｜a meaningful share of the internet's traffic. |
| S19 | 4 | 3301–3474 | 5.8s | 59 | ¶ | Others followed:｜open appliances inside ISPs,｜edges in three hundred-plus cities. |
| S20 | 4 | 3520–3558 | 1.3s | 39 |  | And the failure mode flipped. |
| S21 | 4 | 3569–3778 | 7.0s | 43 |  | In 2021, one bad config at an edge provider｜took down roughly a tenth of the internet｜for forty-nine minutes. |
| S22 | 4 | 3789–4002 | 7.1s | 44⚠ | ¶ | The trick that beat distance｜also concentrates trust:｜the edge became a single point of failure｜for everyone at once. |
| S23 | 4 | 4048–4109 | 2.1s | 62 |  | So — Friday night, your movie. |
| S24 | 4 | 4120–4277 | 5.3s | 48 |  | One second in, it plays.｜Not because the network is fast —｜because the copy was close. |
| S25 | 4 | 4288–4364 | 2.6s | 21⚠ | ¶ | The internet isn't fast.｜It's close. |

## 章节起始帧
- 第1章 The Distance Problem：f86
- 第2章 The Edge Network：f894
- 第3章 The Cache Hit：f1958
- 第4章 The Invisible Half：f2732

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
