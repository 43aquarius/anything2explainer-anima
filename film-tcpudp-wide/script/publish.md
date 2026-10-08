# TCP & UDP — Two Ways to Travel · 发布物料（YouTube 横版）

> 回补规范（制作流程 §8.5 对第三部起强制；本片为第二部，按同标准回补）。
> 简介已过 humanizer（--genre description），8-byte 事实按 audit 手工复原，章节时间戳按 timeline 实测校正。

## 主标题（34 字符，取影片收尾句；humanizer 扩写版见下）

```
TCP never loses. UDP never waits.
```

- humanizer 输出为「TCP never loses packets. UDP never waits for an acknowledgment.」（67 字符）——扩写版更"完整"但丢了收尾句的记忆点；人工裁定主标题用影片自己的收尾句（真实对仗、非凑数排比），扩写版记录于此备查。

## 视频简介（humanized + 手工复原 8-byte）

```
One network, two couriers. TCP numbers every envelope, waits for receipts, and re-sends lost packets — good for a photo, bad for a live call. UDP just throws an 8-byte header with no ceremony; if they arrive late, they're useless. Your video call uses UDP for the voice and TCP for signaling. DNS asks questions over UDP. QUIC rebuilt some of TCP's guarantees on top of UDP.

Chapters:
0:02 The Best-Effort Wire
1:14 TCP — The Courier
2:48 UDP — The Postcard
4:09 Choosing Sides

Sources:
- RFC 793 (TCP) — https://www.rfc-editor.org/rfc/rfc793
- RFC 768 (UDP) — https://www.rfc-editor.org/rfc/rfc768
- RFC 791 (IP, best-effort) — https://www.rfc-editor.org/rfc/rfc791
- RFC 6298 (retransmission timer) — https://www.rfc-editor.org/rfc/rfc6298
- RFC 9000 (QUIC) — https://www.rfc-editor.org/rfc/rfc9000
```

## 标签

```
tcp, udp, networking, how the internet works, quic, dns, tech explainer, transport layer, rfc
```

## 封面

`out/cover_tcpudp_wide.png`（信封 TCP vs 明信片 UDP + 「TWO WAYS TO TRAVEL」+ RFC 793/768 chips）；Release 资产名 `TCP_UDP_Cover_YouTube_1280x720.png`。
