#!/bin/bash
# TLS + CDN 关键事实核实（z-ai web_search CLI 批量）
OUT=/home/z/my-project/research_search
mkdir -p $OUT
cd $OUT

run() { # $1=id, $2=query
  echo "== searching: $1"
  z-ai function -n web_search -a "{\"query\": \"$2\", \"num\": 6}" -o "$1.json" 2>/dev/null || echo "FAIL $1"
}

# --- TLS facts ---
run tls01 "Netscape SSL first version 1994 history secure sockets layer credit card"
run tls02 "TLS 1.3 RFC 8446 published 2018 one round trip handshake"
run tls03 "Diffie-Hellman 1976 New Directions in Cryptography paper"
run tls04 "Let's Encrypt launched 2015 free certificates HTTPS adoption"
run tls05 "Firefox telemetry percentage HTTPS page loads 2024 2025"
run tls06 "Firesheep 2010 sidejacking Firefox extension public wifi"
run tls07 "Chrome mark HTTP as Not secure 2018 password fields 2017"
run tls08 "Heartbleed OpenSSL bug 2014"
run tls09 "ECDHE forward secrecy TLS 1.3 mandatory cipher suites AES-GCM ChaCha20"
run tls10 "certificate authority root store how many root CAs browsers trust"

# --- CDN facts ---
run cdn01 "Akamai founded 1998 Tom Leighton Danny Lewin MIT business plan competition"
run cdn02 "Tim Berners-Lee challenge MIT congested network everyone access same server Akamai"
run cdn03 "Akamai delivers percentage of global internet traffic 15-30%"
run cdn04 "Cloudflare network cities countries 2024 2025"
run cdn05 "Netflix Open Connect appliances inside ISP network OCA"
run cdn06 "Sandvine Global Internet Phenomena video share of traffic 2023 65%"
run cdn07 "Fastly outage June 8 2021 49 minutes 10% internet"
run cdn08 "Cloudflare outage July 2 2019 regex 27 minutes"
run cdn09 "speed of light in fiber optic cable 200000 km per second latency"
run cdn10 "London Singapore round trip time latency milliseconds"

echo "ALL DONE"
ls -la $OUT/*.json | wc -l
