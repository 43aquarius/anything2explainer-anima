# 时间轴（edge · en-US-AndrewNeural +0%，共 2249 帧 = 75.0s，157 词，语速 2.81 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–182 | 3.2s | 29 |  | Rename any APK to ZIP —｜it just opens. |
| S02 | 1 | 193–307 | 3.8s | 30 |  | The manifest, the code, the signatures:｜it's all right there. |
| S03 | 1 | 318–390 | 2.4s | 73 | ¶ | Every Android app ships as a ZIP archive. |
| S04 | 1 | 433–750 | 10.6s | 67 | ¶ | The format comes from 1989.｜A programmer named Phil Katz invented it｜after getting sued,｜and his initials, P, K,｜are still the first two bytes of the file. |
| S05 | 1 | 796–951 | 5.2s | 67 |  | When you hit Install,｜the phone checks the wax seal:｜one signature over the entire file. |
| S06 | 1 | 962–1023 | 2.1s | 33⚠ | ¶ | Flip one byte,｜the install dies. |
| S07 | 1 | 1069–1221 | 5.1s | 70 | ¶ | It reads the label:｜a binary manifest,｜permissions, screens, version. |
| S08 | 1 | 1252–1362 | 3.7s | 77 |  | Then it compiles the code｜into machine language for your exact CPU. |
| S09 | 1 | 1373–1483 | 3.7s | 52 | ¶ | That is the "optimizing apps" bar｜you see after a big update. |
| S10 | 1 | 1514–1608 | 3.2s | 52 | ¶ | And builds a sandbox:｜one hidden Linux user per app. |
| S11 | 1 | 1654–1716 | 2.1s | 63 |  | The zip itself? Never unzipped. |
| S12 | 1 | 1727–1839 | 3.8s | 40⚠ | ¶ | It just sits in /data/app,｜being read in pieces. |
| S13 | 1 | 1885–1995 | 3.7s | 39 |  | Google's app bundles from 2021?｜Still zips underneath. |
| S14 | 1 | 2006–2052 | 1.6s | 47 | ¶ | Two bytes in: P, K. |
| S15 | 1 | 2098–2148 | 1.7s | 51 | ¶ | Every app is a zip you can read. |

## 章节起始帧
- 第1章 One Tap：f86

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
