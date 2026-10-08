# PCAP — Packet Capture, Explained · 发布物料（YouTube 横版）

> 回补规范（制作流程 §8.5 对第三部起强制；本片为第一部，按同标准回补）。
> 文案已过 tools/humanize.py（--genre title / --genre description）；章节时间戳按 script/timeline.json 实测校正。

## 主标题（humanizer 输出，29 字符）

```
How packet capture works
```

- humanizer 去掉了草稿的冒号钩子结构（AI 腔判定）；备选人工稿「The wire doesn't lie: how packet capture works」存档于 publish_title_draft.txt。
- 事实存活：packet capture 在。

## 视频简介

```
Your internet traffic travels as numbered envelopes. Anyone on the path can read the outside: source, destination, size, and timing. This is packet capture — the same trick Wireshark uses, the same trick your ISP's gear can do, and the same trick law enforcement needs a warrant for.

This film follows one slow checkout page to a TCP retransmission, shows what a switch sees, what TLS 1.3 actually hides (and what it deliberately leaves in the clear), and where the line sits between debugging and wiretapping.

Chapters:
0:02 The Mystery
1:26 How It Works
2:53 Wireshark
4:21 Limits & Laws

Sources:
- Wireshark — https://www.wireshark.org/
- pcap file format — https://en.wikipedia.org/wiki/Pcap
- TCP retransmission timer — RFC 6298 https://www.rfc-editor.org/rfc/rfc6298
- TLS 1.3 — RFC 8446 https://www.rfc-editor.org/rfc/rfc8446
```

## 标签

```
packet capture, wireshark, networking, pcap, tcp, tls, tech explainer, how networks work, tcpdump
```

## 封面

`out/cover_pcap_wide.png`（Cover 合成：三连信封母题 + 「THE WIRE DOESN'T LIE.」+ tcp.retransmission 过滤器卡 + Wireshark/1988 chips）；Release 资产名 `PCAP_Cover_YouTube_1280x720.png`。
