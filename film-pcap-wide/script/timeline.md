# 时间轴（edge · en-US-AndrewNeural +0%，共 9575 帧 = 319.2s，770 词，语速 2.74 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–207 | 4.1s | 37 |  | Your checkout page takes nine seconds to load.｜Customers give up on it. |
| S02 | 1 | 218–350 | 4.4s | 55 |  | The server logs say｜every request was answered｜in about sixty milliseconds. |
| S03 | 1 | 361–460 | 3.3s | 57 | ¶ | Both readings are true.｜The missing time lives somewhere between them. |
| S04 | 1 | 491–583 | 3.1s | 52 |  | To find it, you have to see｜what the network actually carried. |
| S05 | 1 | 594–713 | 4.0s | 45 |  | Everything you send travels as packets —｜small envelopes of data. |
| S06 | 1 | 724–872 | 5.0s | 61 |  | Each one has a header,｜the address on the envelope,｜and a payload, the letter inside. |
| S07 | 1 | 883–1033 | 5.0s | 54 |  | And they nest: TCP rides inside IP,｜IP rides inside Ethernet. |
| S08 | 1 | 1044–1205 | 5.4s | 61 | ¶ | One packet carries about 1,500 bytes —｜roughly one paragraph of text. |
| S09 | 1 | 1236–1423 | 6.3s | 56 |  | A packet capture is exactly what it sounds like:｜catching a copy of the packets｜as they pass a point in the network. |
| S10 | 1 | 1434–1639 | 6.9s | 62 |  | Not intercepting. Not changing.｜Just copying —｜a checkpoint that photocopies｜every envelope that drives past. |
| S11 | 1 | 1650–1822 | 5.8s | 56 |  | With that copy in hand,｜you can replay the whole conversation:｜every byte, every timestamp. |
| S12 | 1 | 1833–1999 | 5.6s | 63 | ¶ | It's how networks are debugged,｜how intrusions are caught,｜and how our nine seconds get explained. |
| S13 | 1 | 2030–2188 | 5.3s | 94 |  | Engineers have done this for decades.｜tcpdump was born at Berkeley Lab in 1988. |
| S14 | 1 | 2199–2431 | 7.8s | 102 |  | Ten years later, Gerald Combs｜built a graphical analyzer around it —｜Ethereal, renamed Wireshark in 2006. |
| S15 | 1 | 2442–2529 | 2.9s | 48 | ¶ | It's what most of the internet｜debugs its networks with. |
| S16 | 2 | 2585–2773 | 6.3s | 25 |  | The tool is the easy part.｜The real question is where you stand｜to get your copy of the packets.｜Three answers. |
| S17 | 2 | 2784–2954 | 5.7s | 33 |  | On your own machine, the operating system｜already sees its own traffic —｜that's the easy one. |
| S18 | 2 | 2965–3111 | 4.9s | 37 |  | On a shared switch,｜port mirroring copies one port's traffic｜to a monitoring port. |
| S19 | 2 | 3122–3277 | 5.2s | 35⚠ | ¶ | And on the physical link,｜a network tap passively splits the signal｜and hands you a copy. |
| S20 | 2 | 3323–3502 | 6.0s | 57 |  | On your own machine, one catch:｜a network card normally drops｜frames addressed to someone else. |
| S21 | 2 | 3513–3674 | 5.4s | 62 | ¶ | Promiscuous mode tells it:｜keep everything you see.｜Wireshark turns this on by default. |
| S22 | 2 | 3705–3951 | 8.2s | 39 |  | Between the hardware and the tool｜sits a small, old, brilliant stack:｜libpcap on Linux and macOS,｜Npcap on Windows. |
| S23 | 2 | 3962–4107 | 4.9s | 44 |  | And underneath, a kernel filter from 1992:｜the Berkeley Packet Filter. |
| S24 | 2 | 4118–4288 | 5.7s | 65 | ¶ | It drops the packets you don't want｜before they ever leave the kernel,｜so filtering a firehose stays cheap. |
| S25 | 2 | 4319–4474 | 5.2s | 60 |  | Whatever survives the filter｜lands in a capture file.｜The classic format is called pcap. |
| S26 | 2 | 4485–4656 | 5.7s | 33 |  | Per packet, it stores exactly three things:｜a timestamp, a length,｜and the raw bytes. |
| S27 | 2 | 4667–4787 | 4.0s | 67 |  | Its successor, pcapng,｜is what modern Wireshark saves by default. |
| S28 | 2 | 4798–4977 | 6.0s | 69 |  | Nothing is decoded yet.｜Interpretation happens later,｜on your machine, every time you open it. |
| S29 | 2 | 4988–5142 | 5.2s | 30⚠ | ¶ | Which makes the file evidence, not testimony.｜It never argues.｜It just remembers. |
| S30 | 3 | 5218–5350 | 4.4s | 35 |  | Open that file in Wireshark,｜and you get three zoom levels｜on the same evidence. |
| S31 | 3 | 5361–5535 | 5.8s | 95 |  | The packet list: one row per packet,｜time, source, destination, protocol. |
| S32 | 3 | 5546–5772 | 7.6s | 104 |  | The packet details:｜the envelope peeled open layer by layer,｜Ethernet, IP, TCP, TLS. |
| S33 | 3 | 5783–5913 | 4.4s | 54 | ¶ | The packet bytes: raw hexadecimal,｜exactly as it crossed the wire. |
| S34 | 3 | 5944–6016 | 2.4s | 34 |  | Too many packets?｜Two different filters. |
| S35 | 3 | 6027–6171 | 4.8s | 78 |  | A capture filter runs while recording:｜kernel-level, strict syntax, cheap. |
| S36 | 3 | 6182–6362 | 6.0s | 44 |  | A display filter runs after the fact:｜http or dns,｜just hiding what you don't need. |
| S37 | 3 | 6373–6551 | 6.0s | 81 | ¶ | And when you find one conversation,｜Follow TCP Stream｜reassembles it into a readable transcript. |
| S38 | 3 | 6582–6769 | 6.3s | 44 |  | So — the checkout page.｜Filter to the API host,｜follow the stream,｜and read the timestamps. |
| S39 | 3 | 6780–6887 | 3.6s | 43 |  | The request leaves instantly.｜The response doesn't arrive. |
| S40 | 3 | 6898–7094 | 6.6s | 71 |  | The same data is sent again, and again —｜each gap doubling:｜one second, two, then four. |
| S41 | 3 | 7105–7298 | 6.5s | 36 |  | Those are retransmissions.｜A letter vanished in transit,｜and the sender waited by the mailbox｜on a doubling timer. |
| S42 | 3 | 7309–7418 | 3.7s | 46 |  | Wireshark even marks them for you,｜in its expert information. |
| S43 | 3 | 7429–7584 | 5.2s | 77 |  | Seven seconds of waiting,｜inside a response｜the server logged as sixty milliseconds. |
| S44 | 3 | 7595–7770 | 5.9s | 34⚠ | ¶ | Packet loss on the path.｜The server never knew.｜The browser couldn't say why.｜Only the wire saw it. |
| S45 | 4 | 7841–7937 | 3.2s | 37 |  | Before you go capturing everything,｜two honest limits. |
| S46 | 4 | 7948–8229 | 9.4s | 51 |  | First, encryption.｜Almost everything now rides TLS 1.3,｜whose handshake takes a single round trip,｜and whose content you cannot read. |
| S47 | 4 | 8240–8366 | 4.2s | 78 |  | You still see the envelopes:｜who talked to whom, when, and how much. |
| S48 | 4 | 8377–8517 | 4.7s | 28⚠ | ¶ | That was enough for our mystery —｜we never read the checkout data,｜only its timing. |
| S49 | 4 | 8568–8805 | 7.9s | 64 |  | Second, permission.｜Capturing traffic you're not authorized to see｜is a crime in many places,｜and a firing offense almost anywhere. |
| S50 | 4 | 8816–8869 | 1.8s | 54 |  | So get explicit permission first. |
| S51 | 4 | 8880–9014 | 4.5s | 56 | ¶ | On networks you own, capture everything.｜It's the best way to learn this craft. |
| S52 | 4 | 9045–9218 | 5.8s | 59 |  | As for our checkout page:｜the loss traced to a failing switch port,｜and nine seconds became under one. |
| S53 | 4 | 9229–9283 | 1.8s | 55 |  | The lesson outlives the story. |
| S54 | 4 | 9294–9362 | 2.3s | 47 |  | A log tells you｜what a program believed happened. |
| S55 | 4 | 9373–9429 | 1.9s | 33 |  | A capture tells you｜what actually happened. |
| S56 | 4 | 9440–9475 | 1.2s | 36⚠ | ¶ | The wire doesn't lie. |

## 章节起始帧
- 第1章 The Mystery：f86
- 第2章 How It Works：f2585
- 第3章 Wireshark：f5198
- 第4章 Limits & Laws：f7826

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
