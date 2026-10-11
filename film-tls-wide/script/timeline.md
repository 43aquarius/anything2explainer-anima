# 时间轴（edge · en-US-AndrewNeural +0%，共 6027 帧 = 200.9s，472 词，语速 2.77 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–190 | 3.5s | 67 |  | It's a coffee shop.｜You connect to the free Wi-Fi and log in. |
| S02 | 1 | 201–289 | 3.0s | 47 |  | The person at the next table｜is running a packet capture. |
| S03 | 1 | 300–441 | 4.7s | 31 |  | They can see every site you visit,｜every request you send —｜in plain text. |
| S04 | 1 | 452–599 | 4.9s | 86 |  | HTTP is a postcard.｜Anyone on the path can read it as it passes by. |
| S05 | 1 | 610–860 | 8.4s | 34⚠ | ¶ | In 2010, a Firefox extension｜called Firesheep made this a one-click game —｜log in as someone else,｜sitting right next to them. |
| S06 | 1 | 921–951 | 1.0s | 31 |  | The problem was old. |
| S07 | 1 | 962–1120 | 5.3s | 38 |  | In 1994, Netscape needed people｜to trust a credit-card number｜to an open network. |
| S08 | 1 | 1131–1217 | 2.9s | 37 |  | Their answer was SSL —｜a lock on the envelope. |
| S09 | 1 | 1228–1338 | 3.7s | 42 |  | It grew up, survived its mistakes,｜and became TLS. |
| S10 | 1 | 1349–1490 | 4.7s | 60 | ¶ | Today's version, TLS 1.3,｜was published in 2018. |
| S11 | 2 | 1546–1666 | 4.0s | 73 |  | Under the lock, the first move｜is a handshake that takes a single round trip. |
| S12 | 2 | 1677–1808 | 4.4s | 72 |  | Your browser sends a ClientHello —｜its list of ciphers and a key-share. |
| S13 | 2 | 1819–1911 | 3.1s | 31 |  | The server answers with its own hello｜and its certificate. |
| S14 | 2 | 1922–2098 | 5.9s | 49 | ¶ | Then something strange happens:｜both sides compute the same secret —｜without either one sending it. |
| S15 | 2 | 2154–2341 | 6.3s | 55 |  | From here on, everything is｜symmetric encryption, AES-GCM.｜Fast, stream-like, sealed. |
| S16 | 2 | 2352–2442 | 3.0s | 55 |  | The person at the next table｜still sees every packet. |
| S17 | 2 | 2453–2598 | 4.9s | 37 |  | The handshake itself is public.｜The envelopes still fly,｜addressed and timed. |
| S18 | 2 | 2609–2671 | 2.1s | 34⚠ | ¶ | But the letters inside｜have become noise. |
| S19 | 3 | 2747–2866 | 4.0s | 56 |  | How do two strangers agree on a secret｜on a channel everyone can read? |
| S20 | 3 | 2877–3033 | 5.2s | 33 |  | This is the Diffie-Hellman trick,｜published in 1976 —｜fifty years ago. |
| S21 | 3 | 3044–3138 | 3.2s | 33 |  | Each side mixes a private color｜into a public one. |
| S22 | 3 | 3149–3248 | 3.3s | 39 |  | Anyone watching sees the mixes —｜and cannot un-mix them. |
| S23 | 3 | 3259–3422 | 5.5s | 41⚠ | ¶ | The math version｜relies on one-way doors:｜multiplying is easy,｜undoing it is not. |
| S24 | 3 | 3468–3592 | 4.2s | 31 |  | That gives TLS a property｜worth saying out loud:｜forward secrecy. |
| S25 | 3 | 3603–3781 | 6.0s | 49 |  | If the server's private key｜is stolen tomorrow,｜the recordings from yesterday｜still cannot be decrypted. |
| S26 | 3 | 3792–3827 | 1.2s | 36 |  | The past stays sealed. |
| S27 | 3 | 3838–4091 | 8.5s | 83 | ¶ | TLS 1.3 makes this mandatory.｜No exceptions, no weak suites —｜five cipher suites, down from thirty-one. |
| S28 | 4 | 4162–4290 | 4.3s | 49 |  | One question is left:｜who vouches that this server｜really is shop.example? |
| S29 | 4 | 4301–4386 | 2.9s | 56 |  | A certificate —｜a stamp from a Certificate Authority. |
| S30 | 4 | 4397–4560 | 5.5s | 42 |  | Your browser ships with｜about a hundred and twenty｜of these authorities built in.｜Trust, pre-installed. |
| S31 | 4 | 4571–4748 | 5.9s | 59 |  | A man-in-the-middle attack fails here:｜the fake certificate isn't stamped｜by anyone your browser believes. |
| S32 | 4 | 4759–4975 | 7.2s | 72 | ¶ | In 2015, Let's Encrypt｜made certificates free and automatic.｜HTTPS stopped being a luxury. |
| S33 | 4 | 5021–5204 | 6.1s | 53 |  | Today, more than four out of five｜page loads travel over TLS.｜The little lock is just... normal. |
| S34 | 4 | 5215–5491 | 9.2s | 72 | ¶ | And the lock keeps being re-forged:｜encrypted ClientHello is now standard,｜and post-quantum key exchange｜already protects most browser traffic. |
| S35 | 4 | 5522–5555 | 1.1s | 34 |  | So — the coffee shop. |
| S36 | 4 | 5566–5664 | 3.3s | 61 |  | The person at the next table｜captured thousands of envelopes. |
| S37 | 4 | 5675–5762 | 2.9s | 41 |  | They can see who you talked to,｜when, and how much. |
| S38 | 4 | 5773–5827 | 1.8s | 25 |  | But every letter they open｜is noise. |
| S39 | 4 | 5838–5926 | 3.0s | 36⚠ | ¶ | Everyone can see the envelope.｜No one can read the letter. |

## 章节起始帧
- 第1章 The Open Postcard：f86
- 第2章 The Handshake：f1546
- 第3章 The Magic Trick：f2727
- 第4章 The Chain of Trust：f4147

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
