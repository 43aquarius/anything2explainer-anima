# 时间轴（edge · en-US-AndrewNeural +0%，共 8644 帧 = 288.1s，690 词，语速 2.78 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–227 | 4.7s | 65 |  | You type shop.example and press Enter.｜Half a second later, the page appears. |
| S02 | 1 | 238–374 | 4.6s | 53 |  | Here is the strange part:｜no machine on the internet｜is named shop.example. |
| S03 | 1 | 385–478 | 3.1s | 32 |  | The internet doesn't speak names.｜It speaks numbers. |
| S04 | 1 | 489–567 | 2.6s | 37⚠ | ¶ | Names are for humans.｜Routing is for machines. |
| S05 | 1 | 613–758 | 4.9s | 62 |  | So in the first millisecond,｜your browser is holding｜an envelope with no address on it. |
| S06 | 1 | 769–873 | 3.5s | 50 |  | Before anything can be sent,｜the name has to become a number. |
| S07 | 1 | 884–1000 | 3.9s | 52 | ¶ | Somebody has to run that translation —｜every single time you press Enter. |
| S08 | 1 | 1031–1076 | 1.5s | 46 |  | It didn't always work this way. |
| S09 | 1 | 1087–1297 | 7.0s | 57 |  | For the internet's first decade,｜there was one text file, HOSTS.TXT —｜the whole network's contact list, |
| S10 | 1 | 1308–1433 | 4.2s | 60 |  | maintained by one office at SRI,｜updated when you phoned in a change. |
| S11 | 1 | 1444–1602 | 5.3s | 28⚠ | ¶ | Thousands of hosts, one file,｜one office, one phone line.｜That was the ceiling. |
| S12 | 1 | 1653–1816 | 5.5s | 38 |  | In 1983, Paul Mockapetris｜proposed a different design:｜no central book at all. |
| S13 | 1 | 1827–1940 | 3.8s | 38 |  | A hierarchy, distributed worldwide —｜the Domain Name System. |
| S14 | 1 | 1951–2126 | 5.9s | 48 |  | The spec we still run today｜was written in November 1987.｜It predates the web itself. |
| S15 | 1 | 2137–2210 | 2.5s | 43⚠ | ¶ | So how do you look things up｜in a book that has no center? |
| S16 | 2 | 2281–2509 | 7.6s | 107 |  | Your browser doesn't do the walking.｜It hands the question to a resolver —｜yours, or a public one like 1.1.1.1. |
| S17 | 2 | 2520–2628 | 3.6s | 51 |  | Think of the resolver as a librarian｜you've hired to fetch one book. |
| S18 | 2 | 2639–2726 | 2.9s | 31 |  | The librarian starts at the top:｜the root servers. |
| S19 | 2 | 2737–2826 | 3.0s | 23 |  | The root doesn't know shop.example.｜It never will. |
| S20 | 2 | 2837–2970 | 4.5s | 71 | ¶ | It answers one smaller question:｜who handles names ending in .example? |
| S21 | 2 | 3001–3117 | 3.9s | 55 |  | That's a referral —｜not the answer,｜just the address of the next counter. |
| S22 | 2 | 3128–3218 | 3.0s | 36 |  | The next counter is the TLD server｜for .example. |
| S23 | 2 | 3229–3338 | 3.7s | 48 |  | Same move: it points to the shop's｜authoritative name server. |
| S24 | 2 | 3349–3554 | 6.9s | 120 |  | That server, finally, holds the record:｜shop.example — 192.0.2.33. |
| S25 | 2 | 3565–3681 | 3.9s | 50 |  | The answer travels back to your browser.｜The envelope gets its address. |
| S26 | 2 | 3692–3770 | 2.6s | 35 |  | Four counters, and none of them｜knew the whole book. |
| S27 | 2 | 3781–3881 | 3.4s | 56 | ¶ | The whole walk usually finishes｜in well under a tenth of a second. |
| S28 | 2 | 3927–4025 | 3.3s | 31 |  | But if every Enter paid that full price,｜the root would melt. |
| S29 | 2 | 4036–4137 | 3.4s | 42⚠ | ¶ | Most of the time, nobody is actually｜walking the hallway at all. |
| S30 | 3 | 4213–4303 | 3.0s | 53 |  | Every answer along the way｜gets written on a sticky note. |
| S31 | 3 | 4314–4490 | 5.9s | 66 |  | Your browser keeps notes.｜Your operating system keeps notes.｜Your resolver keeps the biggest stack. |
| S32 | 3 | 4501–4656 | 5.2s | 48 |  | Next time you ask,｜the note answers in about a millisecond —｜faster than a camera shutter. |
| S33 | 3 | 4667–4796 | 4.3s | 40 |  | Each note carries a TTL —｜time to live —｜set by the record's owner. |
| S34 | 3 | 4807–4936 | 4.3s | 27⚠ | ¶ | It's the expiry date on the carton.｜Fresh until then.｜Questioned after. |
| S35 | 3 | 4982–5098 | 3.9s | 84 |  | That's what people call｜"DNS propagation" — but nothing is pushed. |
| S36 | 3 | 5109–5256 | 4.9s | 41 |  | You change the record,｜and old answers simply sit in caches｜until their dates pass. |
| S37 | 3 | 5267–5388 | 4.1s | 49 |  | In 2021, Facebook's nameservers｜went dark mid-maintenance. |
| S38 | 3 | 5399–5542 | 4.8s | 50 |  | For about eleven minutes,｜the world's caches still served｜the last correct copies. |
| S39 | 3 | 5553–5695 | 4.8s | 55 |  | Then they expired —｜and facebook.com simply｜stopped being an answer anywhere. |
| S40 | 3 | 5706–5943 | 7.9s | 79 | ¶ | That is how much of this system｜runs on sticky notes:｜1.1.1.1 alone answers｜about 1.9 trillion lookups a day. |
| S41 | 3 | 5989–6148 | 5.3s | 45 | ¶ | A phonebook this size, this fast,｜this uncritical —｜what could possibly go wrong? |
| S42 | 4 | 6204–6237 | 1.1s | 34 |  | Three honest answers. |
| S43 | 4 | 6248–6379 | 4.4s | 78 |  | First: the questions themselves｜were open postcards for 33 years. |
| S44 | 4 | 6390–6573 | 6.1s | 38 |  | Classic DNS rides plaintext UDP.｜Anyone on the path could read｜every name you looked up. |
| S45 | 4 | 6584–6811 | 7.6s | 64 |  | The fixes came in 2016 and 2018:｜DNS over TLS,｜DNS over HTTPS. |
| S46 | 4 | 6822–6871 | 1.7s | 50 |  | Second: the book can lie. |
| S47 | 4 | 6882–7083 | 6.7s | 67 |  | For 19 days in 2003,｜every mistyped .com name on Earth｜landed on one company's ad page. |
| S48 | 4 | 7094–7269 | 5.9s | 38⚠ | ¶ | No such domain — NXDOMAIN —｜is a signal the internet depends on.｜That wildcard broke it. |
| S49 | 4 | 7325–7463 | 4.6s | 31 |  | So the answers got signatures:｜DNSSEC — a chain of trust｜from the root down. |
| S50 | 4 | 7474–7626 | 5.1s | 71 |  | The root itself was signed in 2010,｜27 years after DNS was born. |
| S51 | 4 | 7637–7741 | 3.5s | 46 |  | Third: attack the book,｜and the readers go down with it. |
| S52 | 4 | 7752–7969 | 7.3s | 57 |  | In 2016, a botnet of hijacked｜cameras, printers and baby monitors｜flooded one DNS provider. |
| S53 | 4 | 7980–8161 | 6.1s | 44⚠ | ¶ | Twitter, Netflix, Spotify — gone.｜Their own servers never crashed.｜Only the shared phonebook did. |
| S54 | 4 | 8212–8293 | 2.7s | 31 |  | So — you pressed Enter,｜half a second ago. |
| S55 | 4 | 8304–8452 | 5.0s | 44 |  | One question, four counters,｜a stack of sticky notes,｜one envelope addressed. |
| S56 | 4 | 8463–8544 | 2.7s | 42⚠ | ¶ | A name is a question.｜DNS is the answer. |

## 章节起始帧
- 第1章 The Mystery：f86
- 第2章 The Lookup：f2266
- 第3章 The Cache：f4193
- 第4章 When It Breaks：f6204

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
