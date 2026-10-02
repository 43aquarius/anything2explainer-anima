# Packet Capture — Research Doc (for the explainer film)

Purpose: fact base for the film "PCAP — Packet Capture, Explained" (landscape 4.5 min + vertical ~70 s, English).
Rule: every number / name / year / term that appears ON SCREEN or in narration must trace to this doc. Anything unverified stays off screen.
Numbers that belong to the film's illustrative example are marked (ILLUSTRATIVE) and are internally consistent (see §Numbers).

## Executive summary
Packet capture = making a copy of network traffic at a point in the network, then decoding it after the fact. It is the arbiter in disputes where server logs and client symptoms disagree, because it observes the wire between the two. The film's spine: a checkout page takes 9 seconds; server logs say every request was served in ~60 ms; the capture shows three lost segments whose retransmission timers (1 s → 2 s → 4 s, doubling per RFC 6298) account for essentially all the missing time. Chapters: 1 The Mystery (what a packet is, what capture is), 2 How It Works (vantage points, promiscuous mode, the capture stack, the pcap file), 3 Wireshark (three panes, decapsulation, filters, follow stream, the reveal), 4 Limits & Laws (TLS 1.3 encrypts content but not metadata; consent/authorization; resolution).

## The fact list (with sources)

### History
- Wireshark: "In late 1997 Gerald Combs needed a tool for tracking down network problems … In 2006 the project moved house and re-emerged under a new name: Wireshark." First released 1998 as Ethereal; renamed Wireshark in June 2006 (trademark issues).
  - https://www.wireshark.org/docs/wsug_html_chunked/ChIntroHistory.html
  - https://en.wikipedia.org/wiki/Wireshark ("Originally named Ethereal, the project was renamed Wireshark in May 2006 due to trademark issues. Original author Gerald Combs. Release 1998")
  - https://www.wireshark.org/news/20060607.html ("Ethereal is now Wireshark, June 7, 2006")
- Wireshark calls itself "the world's foremost network protocol analyzer".
  - https://www.wireshark.org/ (homepage tagline; code-of-conduct page says "the world's leading network protocol analyzer")
- tcpdump: "originally written in 1988 by Van Jacobson, Craig Leres and Steven McCanne … working in the Lawrence Berkeley Laboratory Network Research Group".
  - https://en.wikipedia.org/wiki/Tcpdump
  - (OpenBSD source comment says "first written in 1987" — sources differ by one year; the film uses 1988 per Wikipedia/Linux man. On screen: "1988".)
- BPF (Berkeley Packet Filter): original paper by Steven McCanne and Van Jacobson, written 1992 at LBNL, published at the USENIX Winter 1993 conference: "The BSD Packet Filter: A New Architecture for User-level Packet Capture" — a kernel architecture for packet capture offering substantial performance improvement (filtering in the kernel before packets are copied to user space).
  - https://en.wikipedia.org/wiki/Berkeley_Packet_Filter
  - https://www.tcpdump.org/papers/bpf-usenix93.pdf
- Npcap: "the packet capture and injection library for Windows by the Nmap Project", "a complete update to the unmaintained WinPcap project". Site: "Npcap is the packet capture library for Windows 10 and 11."
  - https://npcap.com
  - https://github.com/nmap/npcap

### What a packet is / encapsulation
- "Packets consist of two portions: the header and the payload. The header contains information about the packet, such as its origin and destination IP addresses…"
  - https://www.cloudflare.com/learning/network-layer/what-is-a-packet
- Encapsulation ("the entire TCP header + TCP payload is the payload of IP", i.e. each layer wraps the one above): general model, source ibid. (Cloudflare learning center, network-layer pages).
- Ethernet MTU: "Standard Ethernet supports an MTU of 1500 bytes" (jumbo frames up to 9000).
  - https://en.wikipedia.org/wiki/Maximum_transmission_unit
  - https://www.cloudflare.com/learning/network-layer/what-is-mtu

### Where you can capture (vantage points)
- On an endpoint: the OS itself sees its own traffic. The NIC normally drops frames not addressed to it.
- Promiscuous mode: "a network interface mode in which the NIC reports every packet that it sees" (passes frames with unicast destination MAC addresses other than its own to the OS). Wireshark turns it on by default.
  - https://www.networkworld.com/article/757658/wireshark-and-promiscuous-mode.html
  - https://www.techtarget.com/cybersecurity/definition/What-is-promiscuous-mode-in-networking
  - https://osqa-ask.wireshark.org/questions/42225/how-to-capture-in-promiscuous-mode
- Switch SPAN / port mirroring: "The SPAN feature, which is sometimes called port mirroring or port monitoring, selects network traffic for analysis by a network analyzer" — copies traffic from one or more source ports to a destination port.
  - https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6500-series-switches/10570-41.html (SPAN configuration example doc)
- Network tap: "a dedicated traffic-access device placed on a network link to provide monitoring and security tools with a copy of the traffic"; passive optical splitting, no power needed.
  - https://www.niagaranetworks.com/products/network-tap-how-to-guide
  - https://www.gigamon.com/resources/resource-library/white-paper/understanding-network-taps-first-step-to-visibility.html

### The capture stack
- Kernel-level filtering (BPF) drops unwanted packets cheaply before they reach the capture program; libpcap (Unix) / Npcap (Windows) sit between the kernel and the app; tcpdump and Wireshark are built on top of libpcap/Npcap.
  - https://en.wikipedia.org/wiki/Berkeley_Packet_Filter ; https://en.wikipedia.org/wiki/Libpcap ; https://npcap.com
- Capture filters are BPF syntax (`tcp port 443`), applied while recording; display filters are applied after capture inside Wireshark. (Wireshark User's Guide, capture-filters chapter: https://www.wireshark.org/docs/wsug_html )

### The pcap file format
- "In a PCAP file, the file header is followed by a series of packet records. Each packet record represents a single packet captured from the network" — timestamp + captured length + raw bytes.
  - https://www.endace.com/learn/what-is-a-pcap-file
  - https://www.ietf.org/archive/id/draft-gharris-opsawg-pcap-01.html (IETF draft "PCAP Capture File Format")
  - https://wiki.wireshark.org/Development/LibpcapFileFormat
- pcapng ("PCAP Next Generation"): "designed to overcome limitations in the original libpcap format"; default capture format in Wireshark since version 1.8 (2012).
  - https://pcapng.com

### Reading a capture in Wireshark
- Three panes: the packet list pane (all packets in the capture), the packet details pane (decoded protocol layers of the selected packet), the packet bytes pane (hexdump of the same packet).
  - https://www.wireshark.org/docs/wsug_html (User's Guide)
  - https://www.wireshark.org/docs/wsug_html_chunked/ChUsePacketListPaneSection.html
- "Follow TCP Stream": reassembles both directions of one TCP conversation.
  - Wireshark User's Guide "The Follow TCP Stream dialog box" https://www.wireshark.org/docs/wsug_html_chunked
- Wireshark flags retransmissions in the packet list (Expert info / TCP analysis).
  - Wireshark User's Guide "TCP Analysis" chapter.

### TCP retransmission timers (the reveal)
- RFC 6298 (Computing TCP's Retransmission Timer, June 2011): initial RTO = 1 second; "Whenever RTO computation is performed, if it is less than 1 second, then the RTO SHOULD be rounded up to 1 second"; on each retransmission timeout the timer doubles (exponential backoff).
  - https://www.rfc-editor.org/info/rfc6298
  - https://superuser.com/questions/1718914/retransmission-in-less-than-one-second (quotes the doubling language)

### TLS / encryption limits
- TLS 1.3 = RFC 8446 (August 2018). Full handshake completes in ONE round trip (1-RTT) instead of TLS 1.2's two.
  - https://www.rfc-editor.org/rfc/rfc8446
  - https://blog.cloudflare.com/rfc-8446-aka-tls-1-3
- Content (HTTP headers, bodies) is encrypted; destination IP addresses, packet sizes and timing are still visible on the wire. (Consistent with Cloudflare/SSLStore TLS pages.)

### Legality / ethics
- Wireshark is legal to use; monitoring a network without explicit authorization is not. "Never capture traffic on a network without explicit permission — this is both a legal requirement and a professional ethical obligation."
  - https://www.wireshark.org/faq
  - https://mycybersecuritypath.com/tools/wireshark
  - https://ieeexplore.ieee.org/document/9822222 ("Wireshark is legal to use, but it can become illegal if … monitor a network that they do not have explicit authorization")

## Numbers & analogies list (for the film)
| Number / analogy | Value | Status | Source |
|---|---|---|---|
| Checkout page load | 9.0 s | ILLUSTRATIVE (story) | internal consistency: ~1 s setup + ~0.1 s response + 1+2+4 s retransmit waits ≈ 8–9 s (shown on screen as ≈) |
| Server log per request | 60 ms | ILLUSTRATIVE (story) | — |
| Ethernet MTU | 1500 bytes | FACT | Wikipedia MTU / Cloudflare |
| RTO initial / backoff | 1 s, doubling | FACT | RFC 6298 |
| Retransmit waits in story | 1 s + 2 s + 4 s = 7 s | derived from FACT | RFC 6298 |
| tcpdump born | 1988, LBNL | FACT | Wikipedia Tcpdump |
| BPF paper | 1992/1993 McCanne & Jacobson | FACT | Wikipedia BPF / bpf-usenix93.pdf |
| Ethereal first release | 1998, Gerald Combs | FACT | wireshark.org history |
| Renamed Wireshark | 2006 | FACT | wireshark.org news / Wikipedia |
| TLS 1.3 handshake | 1-RTT | FACT | RFC 8446 |
| Story latency numbers (DNS/TCP/TLS in ch3 timeline) | marked ≈ | ILLUSTRATIVE | — |
| Analogy 1 | envelope: header = address on the envelope, payload = the letter inside | carries through film | Cloudflare definition |
| Analogy 2 | capture = a photocopy of every envelope passing a checkpoint (copies, does not open the mail route) | ch1–2 | — |
| Analogy 3 | three panes = three zoom levels: the shipping log / the opened envelope / the raw bytes | ch3 | — |

## Terminology (EN terms used on screen — spell exactly)
packet · header · payload · encapsulation · Ethernet · IP · TCP · TLS · packet capture · sniffer · promiscuous mode · SPAN / port mirroring · network TAP · libpcap · Npcap · BPF (Berkeley Packet Filter) · capture filter · display filter · pcap / pcapng · tcpdump · Wireshark · Ethereal · retransmission · RTO (retransmission timeout) · round trip · 1-RTT · Follow TCP Stream · packet list / packet details / packet bytes pane · "the wire"

## Open questions / not shown
- ECH (Encrypted Client Hello) — too deep; not mentioned.
- Monitor mode (Wi-Fi) — skipped entirely to keep length; promiscuous mode is the taught term.
- Wi-Fi management frames — out of scope.
- 0-RTT early data — not needed.
- tcpdump 1987 vs 1988 — on screen we use "1988" (Wikipedia + Linux man page agree); discrepancy noted here.
