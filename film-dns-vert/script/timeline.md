# 时间轴（edge · en-US-AndrewNeural +0%，共 2056 帧 = 68.5s，147 词，语速 2.70 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 0 | 41–173 | 4.4s | 56 |  | You type shop.example and press Enter.｜The page appears in half a second. |
| S02 | 0 | 184–337 | 5.1s | 57 | ¶ | But no machine on the internet｜is named shop.example.｜The internet only speaks numbers. |
| S03 | 0 | 368–446 | 2.6s | 30 |  | So someone has to translate —｜every single time. |
| S04 | 0 | 457–597 | 4.7s | 58 |  | Before 1983: one text file,｜one office, one phone line. |
| S05 | 0 | 608–705 | 3.3s | 39⚠ | ¶ | Then DNS: a hierarchy｜with no center at all. |
| S06 | 0 | 761–852 | 3.1s | 40 |  | Your resolver asks the root:｜"who handles .example?" |
| S07 | 0 | 863–924 | 2.1s | 30 |  | The root only points｜to the next counter. |
| S08 | 0 | 935–1010 | 2.5s | 40 |  | The TLD counter points｜to the shop's own server. |
| S09 | 0 | 1021–1164 | 4.8s | 94 | ¶ | That server holds the answer:｜192.0.2.33. |
| S10 | 0 | 1210–1283 | 2.5s | 42 |  | The whole walk?｜Under a tenth of a second. |
| S11 | 0 | 1294–1399 | 3.5s | 54 |  | And most walks never happen —｜answers live on sticky notes. |
| S12 | 0 | 1410–1489 | 2.7s | 30 |  | Each note has a TTL —｜an expiry date. |
| S13 | 0 | 1500–1681 | 6.1s | 35⚠ | ¶ | In 2021, Facebook went dark:｜caches held the last correct copies｜for eleven minutes. |
| S14 | 0 | 1737–1863 | 4.2s | 79 |  | One resolver alone answers｜1.9 trillion lookups a day. |
| S15 | 0 | 1874–1955 | 2.7s | 42⚠ | ¶ | A name is a question.｜DNS is the answer. |

## 章节起始帧

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
