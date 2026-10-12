# 时间轴（edge · en-US-AndrewNeural +0%，共 4143 帧 = 138.1s，317 词，语速 2.77 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–206 | 4.0s | 51 |  | October fourth, twenty twenty-one.｜The internet forgets Facebook. |
| S02 | 1 | 217–315 | 3.3s | 33 |  | Instagram, WhatsApp — gone.｜Everywhere at once. |
| S03 | 1 | 326–447 | 4.1s | 56 |  | Not a hack. Not a cable cut.｜The address itself... vanished. |
| S04 | 1 | 458–553 | 3.2s | 47 |  | The internet has no map.｜No one holds the master list. |
| S05 | 1 | 564–684 | 4.0s | 53 | ¶ | Every network announces where things are —｜and every other network believes it. |
| S06 | 2 | 760–872 | 3.8s | 51 |  | The internet isn't one network.｜It's about a hundred thousand of them: |
| S07 | 2 | 883–1062 | 6.0s | 87 |  | ISPs, clouds, universities —｜each one an autonomous system, an AS. |
| S08 | 2 | 1073–1196 | 4.1s | 76 |  | Each has a number, and speaks｜for its own corner of the map — a diplomat. |
| S09 | 2 | 1207–1315 | 3.6s | 64 |  | These diplomats trade notes｜with a protocol called BGP: |
| S10 | 2 | 1326–1444 | 4.0s | 67 |  | "I can reach this address block,｜through these networks." Pass it on. |
| S11 | 2 | 1455–1622 | 5.6s | 42 |  | Your packet hops from AS to AS —｜a chain of strangers,｜each trusting the last. |
| S12 | 2 | 1633–1744 | 3.7s | 51 |  | Stitch every announcement together,｜and the map draws itself. |
| S13 | 2 | 1755–1884 | 4.3s | 63 | ¶ | No boss. No central brain.｜Just a hundred thousand voices agreeing. |
| S14 | 3 | 1960–2004 | 1.5s | 45 |  | But a spoken map can lie. |
| S15 | 3 | 2015–2139 | 4.2s | 34 |  | Nineteen ninety-seven:｜one small provider announced｜more than it owned — |
| S16 | 3 | 2150–2252 | 3.4s | 56 |  | and the internet believed it.｜Large parts of the net went dark. |
| S17 | 3 | 2263–2352 | 3.0s | 58 |  | Two thousand eight:｜Pakistan blocked YouTube at home. |
| S18 | 3 | 2363–2462 | 3.3s | 21 |  | The block leaked —｜and the world's YouTube traffic｜went with it. |
| S19 | 3 | 2473–2622 | 5.0s | 66 |  | BGP trusts the more specific claim:｜name the exact address, and you win. |
| S20 | 3 | 2633–2739 | 3.6s | 40⚠ | ¶ | No signature. No password.｜Just a voice in the dark. |
| S21 | 3 | 2785–2939 | 5.2s | 93 |  | That October day, Facebook withdrew｜its own routes, by mistake, from inside. |
| S22 | 3 | 2950–3043 | 3.1s | 39 |  | Within minutes, the map stopped｜knowing Facebook's name. |
| S23 | 3 | 3054–3150 | 3.2s | 51 | ¶ | For almost six hours,｜billions of people hit reload. |
| S24 | 4 | 3221–3321 | 3.4s | 57 |  | The fix is arriving:｜cryptography for the map itself. |
| S25 | 4 | 3332–3478 | 4.9s | 69 |  | With RPKI, the real owner of an address｜signs: "these routes are mine." |
| S26 | 4 | 3489–3576 | 2.9s | 33 |  | A false announcement can be checked —｜and simply ignored. |
| S27 | 4 | 3587–3638 | 1.7s | 52 |  | Trust, replaced by proof. |
| S28 | 4 | 3649–3751 | 3.4s | 36 |  | And the map still redraws itself,｜every few seconds, |
| S29 | 4 | 3762–3866 | 3.5s | 55 |  | a hundred thousand diplomats｜saying where everything is. |
| S30 | 4 | 3877–3924 | 1.6s | 48 |  | It works because they keep talking. |
| S31 | 4 | 3935–4042 | 3.6s | 59 | ¶ | The internet has no map.｜It remembers one — out loud. |

## 章节起始帧
- 第1章 The Vanishing：f86
- 第2章 A Network of Networks：f740
- 第3章 Trust Has No Locks：f1940
- 第4章 Signing the Map：f3206

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
