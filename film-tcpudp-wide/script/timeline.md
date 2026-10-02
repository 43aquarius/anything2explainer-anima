# 时间轴（edge · en-US-AndrewNeural +0%，共 10401 帧 = 346.7s，779 词，语速 2.69 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–204 | 4.0s | 60 |  | You're on a video call with a friend,｜and mid-sentence, you send a photo. |
| S02 | 1 | 215–341 | 4.2s | 34 |  | Your voice and your photo｜leave the same machine,｜over the same wire. |
| S03 | 1 | 352–399 | 1.6s | 48 | ¶ | They will not travel the same way. |
| S04 | 1 | 430–621 | 6.4s | 75 |  | Underneath every app,｜the internet has one delivery service:｜packets — small envelopes of data. |
| S05 | 1 | 632–795 | 5.5s | 47 |  | Each envelope carries about 1,500 bytes,｜addressed to your friend's machine. |
| S06 | 1 | 806–927 | 4.1s | 53 | ¶ | Your photo is three megabytes —｜more than two thousand envelopes. |
| S07 | 1 | 958–1065 | 3.6s | 34 |  | That delivery service is called IP,｜the Internet Protocol. |
| S08 | 1 | 1076–1180 | 3.5s | 57 |  | And here is the strange part:｜IP promises you almost nothing. |
| S09 | 1 | 1191–1340 | 5.0s | 61 | ¶ | No acknowledgments. No retransmissions.｜No ordering. No flow control. |
| S10 | 1 | 1371–1431 | 2.0s | 25 |  | That is not a flaw.｜It's the design. |
| S11 | 1 | 1442–1547 | 3.5s | 61 | ¶ | Keep the network simple;｜put the intelligence at the endpoints. |
| S12 | 1 | 1578–1735 | 5.3s | 36 |  | So in transit, an envelope can be lost,｜delivered out of order,｜or copied twice. |
| S13 | 1 | 1746–1801 | 1.9s | 56 |  | For your photo, that would be fatal. |
| S14 | 1 | 1812–1867 | 1.9s | 56 | ¶ | For your voice, it might not matter. |
| S15 | 1 | 1898–1974 | 2.6s | 77 |  | Two kinds of traffic, one careless wire. |
| S16 | 1 | 1985–2068 | 2.8s | 41 |  | The internet's answer was never｜one perfect protocol. |
| S17 | 1 | 2079–2144 | 2.2s | 42⚠ | ¶ | It was two —｜with opposite promises. |
| S18 | 2 | 2230–2507 | 9.3s | 108 | ¶ | The first is TCP,｜from a 1974 paper by Vint Cerf and Bob Kahn,｜sealed as RFC 793 in 1981. |
| S19 | 2 | 2538–2633 | 3.2s | 96 |  | Before TCP moves any data, it makes a call. |
| S20 | 2 | 2644–2692 | 1.6s | 49 |  | SYN — "Can you hear me?" |
| S21 | 2 | 2703–2787 | 2.8s | 85 |  | SYN-ACK — "I hear you. Can you hear me?" |
| S22 | 2 | 2798–2844 | 1.6s | 47 |  | ACK — "I hear you." |
| S23 | 2 | 2855–2970 | 3.9s | 44⚠ | ¶ | Three messages, and both sides agree｜on where the numbering starts. |
| S24 | 2 | 3013–3053 | 1.4s | 41 |  | Then the rules of the courier. |
| S25 | 2 | 3064–3163 | 3.3s | 44 |  | Every envelope is numbered.｜Every number is acknowledged. |
| S26 | 2 | 3174–3402 | 7.6s | 69 | ¶ | If a receipt doesn't come back in time,｜the letter is sent again —｜and the wait doubles:｜one second, two, then four. |
| S27 | 2 | 3433–3641 | 7.0s | 49 | ¶ | On the other end,｜the receiver re-stacks the envelopes in order,｜and holds the gap open｜until the missing one arrives. |
| S28 | 2 | 3672–3863 | 6.4s | 41⚠ | ¶ | The receiver also advertises｜how much it can hold — a window —｜so a fast sender｜never drowns a slow one. |
| S29 | 2 | 3906–3966 | 2.0s | 61 |  | And TCP listens to the network. |
| S30 | 2 | 3977–4197 | 7.4s | 52 | ¶ | When envelopes start disappearing,｜it cuts its sending rate in half;｜when they flow again,｜it ramps carefully back up. |
| S31 | 2 | 4228–4405 | 5.9s | 50 |  | That's the contract:｜what you send arrives —｜complete and in order —｜or the connection tells you it failed. |
| S32 | 2 | 4416–4626 | 7.0s | 59 | ¶ | The price: talk before you talk,｜remember everything,｜and pay at least twenty bytes｜of instructions on every envelope. |
| S33 | 2 | 4657–4746 | 3.0s | 37 |  | Your photo rides TCP,｜and it arrives perfect. |
| S34 | 2 | 4757–4912 | 5.2s | 36 |  | But your voice can't dial before every word.｜Fifty times a second,｜it has something to say. |
| S35 | 2 | 4923–4997 | 2.5s | 75 | ¶ | Sometimes, waiting is worse than losing. |
| S36 | 3 | 5068–5297 | 7.7s | 155 | ¶ | For that, there is a second protocol:｜UDP, from RFC 768, 1980, by Jon Postel. |
| S37 | 3 | 5328–5388 | 2.0s | 61 |  | A UDP packet is a postcard. |
| S38 | 3 | 5399–5529 | 4.4s | 39 |  | You write it, you address it,｜you drop it in the mail.｜That's the whole ceremony. |
| S39 | 3 | 5540–5708 | 5.6s | 70 | ¶ | No handshake. No numbers. No receipts.｜Eight bytes of header, four small fields. |
| S40 | 3 | 5739–5830 | 3.1s | 56 |  | The spec is honest:｜delivery is not guaranteed. |
| S41 | 3 | 5841–5917 | 2.6s | 37⚠ | ¶ | Even duplicate protection｜is not guaranteed. |
| S42 | 3 | 5963–6025 | 2.1s | 63 | ¶ | And still, the internet runs on it. |
| S43 | 3 | 6056–6157 | 3.4s | 42 |  | Because sometimes the exchange is smaller｜than the ceremony would be. |
| S44 | 3 | 6168–6339 | 5.7s | 50 |  | A DNS lookup is one small question｜and one small answer —｜usually one packet each way. |
| S45 | 3 | 6350–6417 | 2.3s | 26⚠ | ¶ | A handshake would cost more｜than the delivery. |
| S46 | 3 | 6463–6521 | 2.0s | 59 |  | And sometimes, late means dead. |
| S47 | 3 | 6532–6663 | 4.4s | 61 |  | Your voice is a stream of packets,｜one every twenty milliseconds. |
| S48 | 3 | 6674–6800 | 4.2s | 57 |  | If one is lost, the call doesn't wait｜a second for the copy to arrive. |
| S49 | 3 | 6811–6858 | 1.6s | 48 |  | The moment is already gone. |
| S50 | 3 | 6869–6934 | 2.2s | 66 | ¶ | It plays a tiny gap, and moves on. |
| S51 | 3 | 6965–7147 | 6.1s | 43⚠ | ¶ | A multiplayer game makes the same choice:｜your position right now｜matters more than｜your position a second ago. |
| S52 | 3 | 7190–7239 | 1.7s | 50 |  | UDP isn't careless. |
| S53 | 3 | 7250–7412 | 5.4s | 40⚠ | ¶ | It's honest about what the wire already is —｜and it lets the application decide｜what is worth waiting for. |
| S54 | 4 | 7495–7526 | 1.1s | 32 |  | So the rule of thumb. |
| S55 | 4 | 7537–7689 | 5.1s | 119 |  | Need every byte?｜TCP: web pages, files, email, banking. |
| S56 | 4 | 7700–7817 | 3.9s | 88 | ¶ | Need it live?｜UDP: calls, games, lookups. |
| S57 | 4 | 7848–8081 | 7.8s | 44 |  | Both protocols share one trick: ports —｜sixteen-bit numbers,｜zero to sixty-five thousand｜five hundred thirty-five. |
| S58 | 4 | 8092–8194 | 3.4s | 56 |  | A space for TCP,｜and a separate space for UDP. |
| S59 | 4 | 8205–8348 | 4.8s | 62 | ¶ | Port 443 speaks TCP.｜Port 53 speaks UDP. |
| S60 | 4 | 8379–8428 | 1.7s | 50 |  | And the story has one more twist. |
| S61 | 4 | 8439–8732 | 9.8s | 100 |  | The newest version of HTTP —｜HTTP/3, standardized in 2022 —｜no longer rides TCP. It rides QUIC. |
| S62 | 4 | 8743–8888 | 4.9s | 46 | ¶ | And QUIC, standardized in 2021,｜is built on UDP. |
| S63 | 4 | 8919–9178 | 8.7s | 38 |  | Handshakes, sequence numbers,｜recovery, encryption —｜everything TCP does,｜rebuilt above the wire,｜where apps can evolve. |
| S64 | 4 | 9189–9380 | 6.4s | 29⚠ | ¶ | A QUIC connection carries an ID,｜not an address —｜switch from Wi-Fi to cellular,｜and it survives. |
| S65 | 4 | 9426–9514 | 3.0s | 63 |  | So the real question｜was never "reliable or fast". |
| S66 | 4 | 9525–9721 | 6.6s | 36⚠ | ¶ | It's where the reliability lives:｜frozen in every kernel,｜or in the application,｜one update away. |
| S67 | 4 | 9767–9790 | 0.8s | 24 |  | Back to your call. |
| S68 | 4 | 9801–9921 | 4.0s | 65 |  | Your voice rides UDP —｜unnumbered, unwaited, alive. |
| S69 | 4 | 9932–10051 | 4.0s | 63 |  | Your photo rides TCP —｜numbered, receipted, perfect. |
| S70 | 4 | 10062–10157 | 3.2s | 27⚠ | ¶ | Same wire. Same envelopes.｜Two promises. |
| S71 | 4 | 10203–10249 | 1.6s | 47 |  | TCP never loses. |
| S72 | 4 | 10260–10300 | 1.4s | 41⚠ | ¶ | UDP never waits. |

## 章节起始帧
- 第1章 The Best-Effort Wire：f86
- 第2章 TCP — The Courier：f2200
- 第3章 UDP — The Postcard：f5053
- 第4章 Choosing Sides：f7468

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
