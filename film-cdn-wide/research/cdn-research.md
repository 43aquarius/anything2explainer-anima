# CDN — Why Your Video Never Buffers
## Research Document for "The Invisible Internet" EP4

- **Date:** 2026-10-11
- **Researcher:** sub-agent (fact-finding pass)
- **Series context:** "The Invisible Internet" — EP1 Packet Capture, EP2 DNS, EP3 TLS. EP4 = CDN.
- **Core mystery:** Friday 8 PM. You press play on a 2 GB movie. The origin server is 8,000 km away on another continent — yet playback starts in ~1 second. The data never crossed that distance: it was already waiting in your city.
- **Visual motif:** envelope = packet. Example context: `shop.example`.
- **Credibility marks:** ★★★ RFC / official / primary source · ★★ official blog / single dataset · ★ secondary source. Unverified items are flagged 【to verify】 and collected in the appendix.

---

## 0. Executive Summary (the 1-minute version)

> [FILL IN — one-paragraph version of the whole story for a 60-second pitch]

---

## 1. Situation & Mystery (latency = distance)

> [FILL IN: speed of light in fiber ≈ 200,000 km/s; measured London–Singapore RTT; the 2 GB / 8,000 km / 100 Mbps ≈ 3 minutes vs 1-second-start contradiction; streaming vs download distinction]

**Facts table:**

| Fact | Value | Source URL | Credibility |
|---|---|---|---|
| Speed of light in vacuum | 299,792 km/s | [TBD] | |
| Speed of light in fiber (c/n, n≈1.47) | ≈ 200,000 km/s (⅔ c) | [TBD] | |
| London–Singapore great-circle distance | ~10,800 km | [TBD] | |
| London–Singapore typical RTT | [TBD] ms | [TBD] | |
| 2 GB over 100 Mbps (whole file) | ≈ 160 s ≈ 2.7 min | [TBD] calculation | |
| Video start budget (streaming) | < 1 s from edge | [TBD] | |

---

## 2. Origins (the neighbor problem → Akamai)

> [FILL IN: Tim Berners-Lee at MIT/LCS 1995–1997 challenge — "congestion will kill the web"; Tom Leighton (MIT applied math professor) + Danny Lewin (grad student); 1998 MIT business plan competition; founding; Akamai = Hawaiian for "intelligent/clever"; 15–30% of global web traffic claim; Danny Lewin 9/11 story (handle with care — verify)]

**Key facts:**

- [TBD] Berners-Lee's exact challenge and year
- [TBD] Competition name ($50K vs $100K in 1998 — verify), result (finalist/winner?)
- [TBD] Akamai founding date, IPO 1999-10-28 (verify)
- [TBD] "15–30% of all web traffic" claim — who says it, where

---

## 3. How It Works (POP / edge / Anycast / cache)

> [FILL IN: POP and edge terminology; Anycast = one IP, many locations, BGP picks nearest; RFC 4786; cache HIT vs MISS (origin pull); TTL and stale-while-revalidate (RFC 5861); CNAME chain shop.example → d123.shop.example.cdn-provider.net — callback to EP2 DNS]

**Sub-topics:**

- 3.1 POP (Point of Presence) / edge server / edge PoP definitions
- 3.2 Anycast (RFC 4786, RFC 1546): same IP announced from many places; BGP shortest path → "nearest"POP; fallback story
- 3.3 Cache HIT vs MISS; origin shield / parent cache
- 3.4 Freshness: TTL, `Cache-Control: max-age`, stale-while-revalidate, stale-if-error (RFC 5861)
- 3.5 DNS plumbing: CNAME (RFC 2181 §10.1 / RFC 1035), why CDNs love CNAMEs, GeoDNS split
- 3.6 The path of one envelope: browser → LDNS → CNAME chain → anycast IP → edge POP → cache HIT → 1s start

---

## 4. Players & Scale (2024–2025 numbers)

> [FILL IN: Cloudflare cities/countries count; Akamai edge platform size; Netflix Open Connect OCA model (servers inside ISP racks, ~6,000 locations / 175+ countries — verify); Google GGC; Fastly; Sandvine video ≈65% of internet traffic (2023–2024)]

| Player | Scale metric | Value | Date | Source | Credibility |
|---|---|---|---|---|---|
| Cloudflare | cities / countries | [TBD] | 2024–2025 | [TBD] | |
| Akamai | traffic share of web | 15–30% claim | [TBD] | [TBD] | |
| Netflix | OCA locations | [TBD] | [TBD] | [TBD] | |
| Google GGC | edge nodes | [TBD] | [TBD] | [TBD] | |
| Fastly | network POPs | [TBD] | [TBD] | [TBD] | |
| Sandvine | video share of all traffic | ~65% | 2023 | [TBD] | |

---

## 5. Trade-offs & Limits

> [FILL IN: cacheable (static video segments) vs personalized/real-time (auth, search, live captions); cache consistency & purge propagation (minutes); cost asymmetry — origin transit expensive, edge serve cheap; centralization critique (a handful of companies carry most of the web → EP6 hook?); personal data & logging at edge; geo-blocking complexities]

---

## 6. Real Cases (the edge is a single point of failure — irony)

> [FILL IN: 2019-07-02 Cloudflare global regex outage, 27 minutes, ~worldwide, cause = catastrophic backtracking in WAF rule; 2021-06-08 Fastly outage, 49 minutes, ~10% of requests? (VERIFY exact framing — Fastly's own post says "up to 10% of our network"?? check), trigger = valid customer config change + latent bug; websites affected: NYT, Guardian, Reddit, Twitch, UK gov; the irony — a company built to decentralize the web took down a chunk of it]

**Incident cards:**

- 6.1 Cloudflare 2019-07-02 — [TBD exact numbers: 27 min? which services? ~50% HTTP requests?]
- 6.2 Fastly 2021-06-08 — [TBD exact numbers: 49 min, 95% recovery timeline, 10% of requests framing]

---

## 7. Numbers & Metaphors Checklist (14–16 numbers with sources + everyday-scale conversions)

> [FILL IN: 14–16 punchy numbers, each with source URL + credibility + "human scale" conversion; plus the 5 animation metaphor sketches: chain supermarkets vs central warehouse / library branches / rooftop water tower / delivery dark store (前置仓) / local copy of the record)]

**Numbers:**

1. [TBD]
2. [TBD]
...

**Metaphors (5):**

1. Chain supermarkets vs one central warehouse — [how to use]
2. Library branches — [how to use]
3. Water tower on the roof — [how to use]
4. Delivery dark-store / 前置仓 — [how to use]
5. The record store keeps a local copy — [how to use]

---

## 8. Glossary (≤ 25 terms, plain-English, script-ready)

> [TBD: CDN, POP, edge, origin, Anycast, BGP, cache, HIT/MISS, TTL, stale-while-revalidate, CNAME, GeoDNS, latency, RTT, propagation delay, bandwidth, throughput, Mbps, GB, cache key, purge, shield/parent, OCA, GGC, streaming, ABR, bitrate, chunking (HLS/DASH), peering, IX...]

---

## Appendix A. Unverified / to-verify list

> [TBD]

## Appendix B. Raw source archive

> Pages saved under `research/raw/` — [index of files]
