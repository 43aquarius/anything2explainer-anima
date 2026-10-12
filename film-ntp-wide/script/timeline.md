# 时间轴（edge · en-US-AndrewNeural +0%，共 3524 帧 = 117.5s，285 词，语速 3.01 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–140 | 1.8s | 18 |  | Your clock is wrong.｜Right now. |
| S02 | 1 | 151–265 | 3.8s | 61 |  | Not broken — just drifting.｜A quartz crystal counts the seconds, |
| S03 | 1 | 276–349 | 2.5s | 51 |  | and quartz drifts｜a few of them every single day. |
| S04 | 1 | 360–469 | 3.7s | 51 |  | For a wristwatch, that's fine.｜For the internet, it's a problem. |
| S05 | 1 | 480–552 | 2.4s | 73 |  | Login codes expire in thirty seconds. |
| S06 | 1 | 563–665 | 3.4s | 64 |  | Certificates are valid｜only between two exact moments. |
| S07 | 1 | 676–787 | 3.7s | 57 |  | A database told the same thing｜writes it down in a different order. |
| S08 | 1 | 798–923 | 4.2s | 32⚠ | ¶ | On a network,｜wrong time isn't a nuisance.｜It's a contradiction. |
| S09 | 2 | 999–1037 | 1.3s | 39 |  | So who has the right time? |
| S10 | 2 | 1048–1170 | 4.1s | 46 |  | Atomic clocks do —｜the world's best,｜run by national labs. |
| S11 | 2 | 1181–1318 | 4.6s | 56 |  | GPS satellites each carry one,｜and whisper the time down to earth. |
| S12 | 2 | 1329–1402 | 2.5s | 33 |  | But your laptop can't afford｜an atomic clock. |
| S13 | 2 | 1413–1501 | 3.0s | 42 |  | So it asks a server —｜and that server asks another, |
| S14 | 2 | 1512–1565 | 1.8s | 27 |  | each one a little further｜from the source. |
| S15 | 2 | 1576–1645 | 2.3s | 70 |  | NTP calls each layer a stratum: |
| S16 | 2 | 1656–1840 | 6.2s | 62 | ¶ | stratum one talks to the atom;｜stratum two asks stratum one —｜and so on, down to fifteen. |
| S17 | 3 | 1916–2002 | 2.9s | 44 |  | But networks lie a little.｜Every answer arrives late. |
| S18 | 3 | 2013–2083 | 2.4s | 38 |  | So your laptop asks｜four servers at once. |
| S19 | 3 | 2094–2161 | 2.3s | 28 |  | Their answers disagree —｜of course they do. |
| S20 | 3 | 2172–2253 | 2.7s | 36 |  | The trick: trust the ones｜that agree with each other. |
| S21 | 3 | 2264–2353 | 3.0s | 40 |  | The odd one out gets dropped.｜The crowd keeps the time. |
| S22 | 3 | 2364–2444 | 2.7s | 33 |  | And here's the gentle part:｜no sudden jumps. |
| S23 | 3 | 2455–2538 | 2.8s | 34 |  | The clock just speeds up,｜or slows down a little, |
| S24 | 3 | 2549–2614 | 2.2s | 21⚠ | ¶ | until it walks quietly back｜into step. |
| S25 | 4 | 2685–2747 | 2.1s | 26 |  | Who runs all this?｜Volunteers. |
| S26 | 4 | 2758–2880 | 4.1s | 46 |  | A public pool, thousands of servers,｜lending the internet their time. |
| S27 | 4 | 2891–3014 | 4.1s | 62 |  | Since nineteen eighty-five, NTP｜has kept the world's computers agreeing — |
| S28 | 4 | 3025–3156 | 4.4s | 61 |  | across borders, across vendors,｜across twenty-seven leap seconds. |
| S29 | 4 | 3167–3236 | 2.3s | 26 |  | It isn't one perfect clock｜ruling them all. |
| S30 | 4 | 3247–3358 | 3.7s | 52 |  | It's thousands of ordinary ones,｜checking each other — forever. |
| S31 | 4 | 3369–3393 | 0.8s | 25 |  | Time isn't kept. |
| S32 | 4 | 3404–3423 | 0.7s | 20⚠ | ¶ | It's agreed. |

## 章节起始帧
- 第1章 The Drift：f86
- 第2章 The Pyramid：f979
- 第3章 The Cross-Check：f1896
- 第4章 The Committee：f2670

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
