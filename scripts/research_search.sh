#!/bin/bash
# 抓包主题调研：批量搜索并保存 JSON
mkdir -p /home/z/my-project/research_search
cd /home/z/my-project/research_search
run() {
  local name="$1"; local query="$2"
  z-ai function -n web_search -a "{\"query\": \"$query\", \"num\": 6}" -o "$name.json" 2>/dev/null && echo "OK: $name" || echo "FAIL: $name"
}
run wireshark_hist "Wireshark history Ethereal 1998 Gerald Combs renamed 2006"
run tcpdump_hist "tcpdump history Van Jacobson Lawrence Berkeley Laboratory year written"
run bpf_paper "Berkeley Packet Filter McCanne Jacobson 1992 USENIX paper BPF"
run npcap "Npcap packet capture library Windows Nmap project 2017"
run pcap_format "pcap file format record header timestamp length packet data libpcap"
run pcapng "pcapng next generation capture file format"
run promisc "promiscuous mode network interface card Wireshark"
run span_mirror "port mirroring SPAN switch Cisco copy traffic monitoring"
run networktap "network tap passive monitoring device inline splitter"
run tls13 "TLS 1.3 RFC 8446 handshake 1-RTT encryption"
run tcp_rto "TCP retransmission timeout RFC 6298 initial RTO one second doubling"
run mtu "Ethernet MTU 1500 bytes maximum transmission unit"
echo "ALL DONE"
