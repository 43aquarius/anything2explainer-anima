# TLS — The Little Lock: Research Document

- **Series**: "The Invisible Internet" EP3 (EP1: Packet Capture / Wireshark; EP2: DNS)
- **Deliverable**: Fact research doc for a ~4.5–5 min English motion-graphics explainer
- **Research date**: 2026-10-11
- **Core puzzle**: Same café, same free WiFi, someone in the room is sniffing with Wireshark (callback to EP1). They can see every site you visit and every request in plaintext — but your password is gibberish. Why is the same network half transparent, half opaque?
- **Recurring visual motif**: envelope = packet; running example context: `shop.example` checkout page, typing a password.

**Source confidence legend (used in §7 and throughout):**
- ★★★ = primary source (RFC, original paper, official spec/standard)
- ★★ = official blog / authoritative single dataset (vendor telemetry, CA stats)
- ★ = secondary (reputable tech media, widely cited but not primary)

**Status note**: Document written incrementally during research; each section filled as verified. Items not yet confirmed are marked 【to verify】.

**Retry session (session 2), 2026-10-11**: the `web_search` API was rate-limited (HTTP 429) for the entire retry session, exactly as in session 1. Session 2 switched strategy — direct fetches of primary pages (saved under `research/raw/s3/pages/`) — and closed or narrowed 6 of session 1's 10 open items. What changed is integrated in-place (§1.4, §2, §5, §6.3, §7.1) and logged in §9; the appendix was rewritten to the final state.

---

## 0. Executive summary

*Written 2026-10-11, after body sections 1–6 were verified.*

- **What this is**: TLS (Transport Layer Security) is the cryptographic layer that wraps roughly 5 in 6 of all web page loads (Firefox telemetry, full months 2025–Sep 2026: ~81–86%) in a scrambled envelope. It is the difference between the café sniffer reading your password off the air and seeing only noise.
- **Why it's worth telling**: the protocol is 30 years old (Netscape SSL, 1994–96), sits under nearly everything everyone does online, and yet its core trick — two strangers agreeing on a secret *out loud*, over a wire anyone can tap — still feels like magic. The episode resolves EP1's cliffhanger: packets ARE all visible; TLS makes only the *inside* of the envelope unreadable.
- **Most counter-intuitive point (the thesis)**: the sniffer sees *every single message* of the TLS handshake — including the key exchange — and it doesn't help. Diffie–Hellman lets two parties compute a shared secret from values an eavesdropper also has (discrete logarithm is a one-way street), so "public ≠ secret." Supporting twist: the lock on your connection isn't certified by the website at all — it's certified by ~120 stamp-issuing authorities your browser shipped with (Firefox NSS store, counted from primary source Oct 2026 — §5), and the system mostly works.
- **Second counter-intuitive beat**: if `shop.example`'s private key is stolen *tomorrow*, yesterday's captured traffic stays unreadable — forward secrecy throws away the keys after each conversation (RFC 8446 §1.2).
- **Story spine**: postcard (HTTP) → Firesheep (2010, why it got urgent) → the handshake (agree out loud, verify with a stamp) → the padlock becomes default (Chrome 2017–18 labels, ~80–95% of loads today).
- **2026 status beats (all verified in session 2, fetched 2026-10-11)**: ECH became a formal RFC in March 2026 (RFC 9849); ~70% of browser traffic to Cloudflare is *already* post-quantum (Cloudflare Radar, Sept 2026); a US executive order (June 22, 2026) sets federal 2030/2031 deadlines for post-quantum migration — the lock keeps being re-cut while nobody is looking.

## 1. Situation & the mystery

*Verified 2026-10-11 (primary quotes from the Security Now! 272 transcript, which quotes Eric Butler's release post directly).*

### 1.1 HTTP is a postcard

*Verified 2026-10-11.*

- HTTP carries everything as plaintext: the full URL (path, query string), headers (cookies, user agent), and the request body — including anything you type into a form. On the wire, a login POST to `http://shop.example/login` shows the password as literal text in the packet's payload bytes (exactly what the Wireshark "Follow TCP Stream" view from EP1 reveals).
  - Primary cite: RFC 2818 "HTTP Over TLS" (E. Rescorla, May 2000): *"HTTP was originally used in the clear on the Internet. However, increased use of HTTP for sensitive applications has required security measures."* — https://www.rfc-editor.org/rfc/rfc2818.txt (★★★)
- Analogy: an HTTP packet is a **postcard** — everyone handling it (WiFi access point, café router, ISP, backbone, the site's host) can read it, not just the recipient.
- On a shared WiFi network, a sniffer in monitor mode sees every packet broadcast in the air, not just ones addressed to them. This is the EP1 callback: EP1 already showed "packet capture sees everything on the line."

### 1.2 Firesheep (2010): the moment "open WiFi hijacking" became one-click news

*Verified 2026-10-11.*

- **Firesheep**, a **Firefox extension by Eric Butler**, released **October 24, 2010, at ToorCon 12** (annual security conference, San Diego; ran Friday–Sunday, Oct 22–24 — transcript: "on the 24th of October, the ToorCon 12 Annual Security Conference occurred"). It used a packet sniffer to intercept **unencrypted session cookies** on open WiFi (Facebook, Twitter, Google, etc.), showed victims in a sidebar, and let the attacker **double-click a name to take over that session** ("sidejacking"). Sites encrypted the login page but dropped back to HTTP afterward — the cookie was the plaintext key to the account.
  - Butler's own words (release post, quoted verbatim in the transcript): *"We're bringing up this tired issue to remind people of the risks they face, especially when on open WiFi networks... we are releasing an open source tool at ToorCon 12 which shows you a 'buddy list' of people's online accounts being used around you, and lets you simply double-click to hijack them."* Sources: GRC "Security Now!" episode 272 transcript (recorded Oct 27, 2010; dated Oct 28, 2010) — https://www.grc.com/sn/sn-272.htm ; Wikipedia "Firesheep" — https://en.wikipedia.org/wiki/Firesheep (★). 【to verify: the primary codebutler.com page itself is offline; Wayback unreachable from the sandbox — cite via archive URL in video description: web.archive.org/web/20120820220335/http://codebutler.com/firesheep】
- Why it made headlines: session hijacking over open WiFi was well known among experts; Firesheep made it a **one-click tool** for anyone. Mozilla initially declined to blacklist it ("no kill switch," Computerworld, Oct 28, 2010 — cited in Wikipedia article above). Firesheep was later removed from the Firefox add-on store.
- Consequence often credited to it: push for HTTPS-everywhere on major sites. Careful with dates: EFF's **HTTPS Everywhere** extension (with the Tor Project) predates Firesheep by ~4 months — launched as a public beta **June 17, 2010** (Peter Eckersley, EFF Deeplinks — primary page fetched & read: "Today EFF and the Tor Project are launching a public beta of a new Firefox extension called HTTPS Everywhere") — https://www.eff.org/deeplinks/2010/06/encrypt-web-https-everywhere-firefox-extension (★★★). State causality carefully: Firesheep *popularized* awareness; it didn't single-handedly flip the web.
- **Download scale (verified from a contemporary reading of the official counter)**: on *Security Now!* 272 (recorded Oct 27, 2010 — 3 days after release), Steve Gibson reads the codebutler.com counter live: "when I went there this morning there were 300,724 downloads" → "325,985 downloads" a couple of hours later — i.e., **~300,000 downloads in the first ~3 days** after the Oct 24 release. Source: https://www.grc.com/sn/sn-272.htm (★, reading the official counter) 【to verify against a print outlet if a cleaner citation is wanted; the primary codebutler.com page is offline】

### 1.3 The moment you type your password

- What changes between the two worlds: at `https://shop.example/checkout`, the same TCP flow that EP1 captured is wrapped in a TLS session. The sniffer still sees envelopes (packets: IP addresses, sizes, timing, SNI hostname) — but the letter inside (the password, the cart, the card number) is ciphertext.
- The mystery stated for the video: the sniffer can still see *that* you're talking to `shop.example` and roughly how much you're saying — but not *what* you're saying. Half-transparent, half-opaque. (Note for honesty: DNS lookups may also be visible unless encrypted — EP2 tie-in; mark as optional line.)

### 1.4 What the attacker still sees on an HTTPS connection (worth stating for accuracy)

- Destination IP, SNI hostname (unless ECH), certificate (public info), packet sizes and timing. TLS hides *content*, not the existence of the conversation.
  - Primary cite: RFC 8446 §E.3 (Traffic Analysis): *"TLS is susceptible to a variety of traffic analysis attacks based on observing the length and timing of encrypted packets."* — https://www.rfc-editor.org/rfc/rfc8446.txt (★★★)
- Optional 2026-current angle: **Encrypted Client Hello (ECH)** and encrypted DNS (EP2 tie-in) shrink the remaining visible metadata. **Verified in session 2**: ECH is now a formal standard — **RFC 9849 "TLS Encrypted Client Hello"** (E. Rescorla, K. Oku (Fastly), N. Sullivan, C. A. Wood (Apple); **March 2026**, Standards Track; header fetched & verified: https://www.rfc-editor.org/rfc/rfc9849.txt ★★★). Browser status (Wikipedia SNI/ECH article, fetched 2026-10-11, last edited 2026-09-06): **Chromium 117 (Sept 2023) enabled ECH by default** (requires HTTPS DNS records); **ECH enabled in Firefox by default since v119 (Oct 2023)**, recommended with DoH; Cloudflare has served ECH for hosted domains since Sept 2023; nginx gained ECH with OpenSSL 4 in Dec 2025. — https://en.wikipedia.org/wiki/Encrypted_Client_Hello (★)
- Post-quantum note (2024+) — **verified in session 2, see §2/§9**: Chrome enabled hybrid post-quantum key exchange by default as of Chrome 124 (Chromium blog, fetched), Firefox 132 (Oct 2024) added mlkem768x25519 (official release notes, fetched); by Sept 2026 ~70% of browser→Cloudflare traffic uses it (Cloudflare Radar). Optional "the lock is being upgraded again" beat.

## 2. Origins & key milestones

*Verified 2026-10-11 against RFCs (primary) + Wikipedia TLS history (secondary, well-sourced).*

| Year | Event | Verification |
|---|---|---|
| 1994–96 | Netscape develops SSL "for adding the HTTPS protocol to their Netscape Navigator web browser." **Taher Elgamal** (Netscape chief scientist 1995–98) is described as the **"father of SSL"** (Network World, 2011/2012) | ★ Wikipedia (citing Network World): https://en.wikipedia.org/wiki/Transport_Layer_Security |
| (unreleased) | **SSL 1.0 never publicly released** — "serious security flaws in the protocol" | ★ same article |
| Feb 1995 | **SSL 2.0 released**; "quickly found to contain a number of security and usability flaws" (same keys for MAC+encryption, weak MD5 MAC, no handshake protection, MITM could go undetected). Deprecated later by RFC 6176 (2011) | ★ Wikipedia + ★★★ RFC 6176 |
| 1996 | **SSL 3.0 released** — a complete redesign: **Paul Kocher** working with Netscape engineers **Phil Karlton & Alan Freier**; reference implementation by Christopher Allen & Tim Dierks (Certicom). "Newer versions of SSL/TLS are based on SSL 3.0." The 1996 SSL 3.0 draft was later published by the IETF as **RFC 6101** (Historic, 2011) | ★ Wikipedia + ★★★ RFC 6101 header (A. Freier, P. Karlton, P. Kocher, August 2011) — https://www.rfc-editor.org/rfc/rfc6101.txt |
| Jan 1999 | **TLS 1.0 = RFC 2246** — authors **T. Dierks & C. Allen (Certicom)**. RFC (verbatim, fetched): "The differences between this protocol and SSL 3.0 are not dramatic, but they are significant enough that TLS 1.0 and SSL 3.0 do not interoperate." | ★★★ RFC 2246 — https://www.rfc-editor.org/rfc/rfc2246.txt |
| — | **The rename, from the horse's mouth** — Tim Dierks, "Security Standards and Name Changes in the Browser Wars" (May 23, 2014; page fetched & quote verified verbatim): "As a part of the horsetrading, we had to make some changes to SSL 3.0 (so it wouldn't look the IETF was just rubberstamping Netscape's protocol), and we had to rename the protocol (for the same reason). And thus was born TLS 1.0 (which was really SSL 3.1)." Same post: Microsoft had tried its own SSL 2-derived "PCT" protocol; Netscape built SSL 3.0 rather than let Microsoft lead; the IETF takeover was the peace deal (Dierks + Christopher Allen of Consensus Development hosted the Netscape–Microsoft meeting; Paul Kocher had designed SSL 3). | ★★★ primary blog (fetched): http://tim.dierks.org/2014/05/security-standards-and-name-changes-in.html |
| Apr 2006 | TLS 1.1 = RFC 4346 (CBC fixes; skip in video) | ★★★ |
| Aug 2008 | **TLS 1.2 = RFC 5246** (T. Dierks, E. Rescorla) — adds SHA-256 cipher suites and AEAD (AES-GCM); the workhorse of the 2010s | ★★★ RFC 5246 — https://www.rfc-editor.org/rfc/rfc5246.txt |
| Oct 2014 | POODLE (CVE-2014-3566) breaks SSL 3.0's CBC ciphers; browsers drop SSL 3.0 that autumn | ★ Wikipedia (CVE given) 【to verify exact browser-removal dates if used on screen】 |
| Aug 2018 | **TLS 1.3 = RFC 8446** (E. Rescorla, Mozilla; obsoletes 5246) | ★★★ https://www.rfc-editor.org/rfc/rfc8446.txt |
| Oct 2018 → Mar 2020 | Apple/Google/Microsoft/Mozilla jointly announce deprecation of TLS 1.0/1.1 (Ars Technica, Oct 17, 2018); disabled in browsers ~2020; **formally deprecated by RFC 8996 (March 2021)** | ★ + ★★★ RFC 8996 — https://www.rfc-editor.org/rfc/rfc8996.txt |

**TLS 1.3's own "what changed" list (RFC 8446 §1.2, verbatim points)** — this is the primary-source gold for the "delete weak crypto / force forward secrecy" claims:
- "The list of supported symmetric encryption algorithms has been pruned of all algorithms that are considered legacy. Those that remain are all Authenticated Encryption with Associated Data (AEAD) algorithms."
- "A zero round-trip time (0-RTT) mode was added, saving a round trip at connection setup for some application data, at the cost of certain security properties."
- "Static RSA and Diffie-Hellman cipher suites have been removed; **all public-key based key exchange mechanisms now provide forward secrecy**."
- "All handshake messages after the ServerHello are now encrypted."
- "Elliptic curve algorithms are now in the base spec"; RSA padding → RSASSA-PSS; compression and DSA removed.

**TLS 1.3 cipher suites — exactly 5, all AEAD** (RFC 8446 §B.4): `TLS_AES_128_GCM_SHA256` (MUST implement), `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256` (both SHOULD), `TLS_AES_128_CCM_SHA256`, `TLS_AES_128_CCM_8_SHA256`.

- Origin-story framing for the video: Netscape's goal was making people **dare to type a credit-card number on an open network** into the brand-new commercial web (Navigator + early e-commerce, 1994–95; Netscape's commerce line was literally "Netsite Commerce Server, the Communications server with SSL (https) added" — ★ Wikipedia "Netscape", citing the archived product list). Citable primary "why": the SSL 3.0 spec abstract (published verbatim as RFC 6101, 2011, fetched): *"a security protocol that provides communications privacy over the Internet... designed to prevent eavesdropping, tampering, or message forgery"* — https://www.rfc-editor.org/rfc/rfc6101.txt (★★★)
- Bonus future-facing fact (optional "what's next" beat) — **verified in session 2 (all three pages fetched 2026-10-11)**:
  - Chromium blog, "Advancing Our Amazing Bet on Asymmetric Cryptography" (Apr/May 2024, verbatim): *"we have enabled the latest Kyber draft specification by default for TLS 1.3 and QUIC on all desktop Chrome platforms as of Chrome 124"* — the hybrid X25519Kyber768; *"A Kyber key exchange is ~1KB transmitted per peer, whereas an X25519 key exchange is only 32 bytes per peer, an over 30x increase"*, causing a *"4% median latency increase to all TLS handshakes in Chrome on desktop"*. — https://blog.chromium.org/2024/05/advancing-our-amazing-bet-on-asymmetric.html (★★★)
  - Firefox 132 release notes (official, verbatim): *"Added support for a post-quantum key exchange mechanism for TLS 1.3 (mlkem768x25519) which secures communications against advanced / long-term threats"* (+ "Added support for Certificate Compression"). — https://www.mozilla.org/en-US/firefox/132.0/releasenotes/ (★★★)
  - Status by Sept 2026 (Cloudflare, 2026-09-29, verbatim): *"about 70% of browser-generated traffic hitting Cloudflare's network (on the visitor-to-Cloudflare connection) is protected with post-quantum encryption using hybrid ML-KEM (FIPS 203)"*; *"just about 15% of origins that Cloudflare connects to use hybrid ML-KEM"*; *"the key exchange group X25519MLKEM768 is ... now the algorithm preferred by most major browsers"*. — https://blog.cloudflare.com/post-quantum-visibility (★★)
  - The specific "Chrome 131 (Nov 2024) switched to the final X25519MLKEM768 parameters" version detail remains 【to verify — chromereleases.google.com unreachable from the sandbox; Chrome 131 beta post carries no mention】. On-screen-safe phrasing avoids the version number entirely.

## 3. How it works (TLS 1.3 handshake)

*Verified 2026-10-11 against RFC 8446 (primary). Message flow from RFC 8446 Figure 1 (full handshake):*

```
       Client                                               Server
       ClientHello
       + key_share             -------->
                                                 ServerHello
                                                 + key_share
                                       {EncryptedExtensions}
                                       {CertificateRequest*}
                                              {Certificate*}
                                        {CertificateVerify*}
                                                  {Finished}
                                <--------     [Application Data*]
       {Certificate*}
       {CertificateVerify*}
       {Finished}              -------->
       [Application Data]      <------->      [Application Data]
```
*(braces = encrypted; RFC 8446 §2.1 — every server message after ServerHello is already encrypted.)*

- **Key facts, all from RFC 8446:**
  - ClientHello carries a `key_share` extension — the client's **ephemeral ECDHE public value** — in the very first message. Cipher suites and the SNI hostname also ride in ClientHello. (RFC 8446 §4.1.2, §4.2.8)
  - ServerHello returns the server's `key_share`; then EncryptedExtensions, Certificate, CertificateVerify (a signature over the whole handshake transcript), and Finished — **all encrypted** (§1.2: "All handshake messages after the ServerHello are now encrypted").
  - Both sides derive the same session keys locally: "the client and server derive the keying material required by the record layer to exchange application-layer data protected through authenticated encryption" (§2.1).
  - **CertificateVerify + Finished kill the man-in-the-middle**: the Finished message is a MAC over the entire transcript; CertificateVerify binds the server's certified identity to the exchanged keys — an attacker without `shop.example`'s certified private key cannot produce a valid signature, so a MITM cannot complete both handshakes undetected. (§4.4.3, §4.4.4)
  - **1-RTT vs 2-RTT (now fully primary-sourced)**: RFC 8446 repeatedly calls the baseline a "1-RTT handshake" (e.g., §2.3: "the 0-RTT data is just added to the 1-RTT handshake in the first flight"). For TLS 1.2, RFC 5246 Figure 1 shows application data flowing only after the fourth flight, and §7.4.9 requires a side to have *received and validated* the peer's Finished before sending application data — i.e., **2 round trips** for a full TLS 1.2 handshake before the client sends app data (RFC 5246 Fig. 1 + §7.4.9: "Once a side has sent its Finished message and received and validated the Finished message from its peer, it may begin to send and receive application data").
  - **0-RTT (optional beat)**: with a pre-shared key from a prior connection the client may send "early data" in its first flight; "the security properties for 0-RTT data are weaker" (RFC 8446 §2.3, IMPORTANT NOTE; replay risk).
- **After the handshake** every record is AEAD-protected; TLS 1.3 permits only AEAD suites: `TLS_AES_128_GCM_SHA256` (MUST), `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256` (SHOULD), + 2 CCM variants (RFC 8446 §B.4; ChaCha20-Poly1305 specified in RFC 8439). Why both: RFC 8439 §1 (fetched, verbatim): "AES is very fast on dedicated hardware, [but] its performance on platforms that lack such hardware is considerably lower"; ChaCha20 is "considerably faster than AES in software-only implementations on ... platforms that lack specialized AES hardware" — i.e., AES-GCM for chips with AES instructions, ChaCha20-Poly1305 for phones without (★★★ RFC 8439 §1).
- **Forward secrecy**: "Static RSA and Diffie-Hellman cipher suites have been removed; all public-key based key exchange mechanisms now provide forward secrecy" (RFC 8446 §1.2). Ephemeral keys are discarded after use — a later leak of the server's long-term key cannot decrypt yesterday's captured traffic. Contrast: in TLS ≤1.2 RSA-key-transport sessions, the server's private key alone decrypts any recorded traffic.

## 4. The key exchange (Diffie–Hellman)

*Verified 2026-10-11: paper PDF fetched from Stanford (primary) + Wikipedia citation details.*

- **The paper**: **Whitfield Diffie & Martin E. Hellman, "New Directions in Cryptography," *IEEE Transactions on Information Theory*, vol. IT-22, no. 6, pp. 644–654, November 1976** (DOI 10.1109/TIT.1976.1055638). Primary copy (fetched & read): https://ee.stanford.edu/~hellman/publications/24.pdf (★★★)
  - Abstract framing (why it mattered): new systems that "minimize the need for **secure key distribution channels**" — before 1976, encrypted communication required first exchanging keys by a secure physical means (couriers, paper key lists). DH removed the courier.
  - The paper itself credits **Ralph Merkle** ("Merkle has independently studied the problem... a partial solution of a different form" — Merkle puzzles). Hellman has since argued the name should be "Diffie–Hellman–Merkle." (★ Wikipedia: https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
  - Recognition: **Diffie & Hellman received the 2015 ACM A.M. Turing Award** (announced March 2016). ★ Wikipedia (Whitfield Diffie) — https://en.wikipedia.org/wiki/Whitfield_Diffie 【note: Merkle did NOT share this award — correct if the draft says otherwise】
  - Declassified history nugget (optional): GCHQ's James Ellis, Clifford Cocks, and Malcolm Williamson had shown public-key cryptography was possible in the late 1960s–70s; revealed publicly in 1997. (★ Wikipedia DH article, citing BBC/GCHQ documents)
- **The core trick**: two people who have never met **agree on a shared secret while an eavesdropper hears every single word** — math where going forward is easy but going backward is (believed) infeasible.
- The mechanism in one breath: agree publicly on a prime *p* and generator *g*; Alice picks secret *a*, sends *g^a mod p*; Bob picks secret *b*, sends *g^b mod p*; each raises the other's public value to their own secret: (g^b)^a = (g^a)^b = g^(ab) mod p. The eavesdropper sees *g*, *p*, *g^a*, *g^b* — recovering *a* or *b* is the **discrete logarithm problem**, believed infeasible for well-chosen parameters.
- **Paint-mixing analogy** (canonical version, used in the Wikipedia DH article — public yellow base; Alice's red & Bob's cyan kept secret; mixed pots cross the table; each adds their own secret to the received pot; both end at the identical "yellow-brown"; eavesdropper sees the pots but can't un-mix):
  - *Fits*: commutative combination (order doesn't matter), everything transits publicly, secret ingredients never travel.
  - *Distorts*: paint is *physically* un-mixable (chemistry), DH is only *computationally* hard — and specifically falls to a large quantum computer running **Shor's algorithm** (invented 1994 by Peter Shor) — ★ https://en.wikipedia.org/wiki/Shor%27s_algorithm. Also paint is continuous/analog, DH is discrete arithmetic.
- TLS 1.3 uses the elliptic-curve variant **ECDHE** (Elliptic-curve Diffie–Hellman Ephemeral), typically the curve **X25519** (RFC 7748, Langley/Hamburg/Turner, Jan 2016 — fetched: https://www.rfc-editor.org/rfc/rfc7748.txt) — same idea, points on a curve, tiny keys for high security: RFC 7748 §5 specifies that "public keys are 32-byte strings" for X25519 (fetched, verbatim) — versus the multi-kilobyte finite-field numbers classic DH needs for comparable security (★★★). 【to verify X25519's real-world share of handshakes — Cloudflare Radar or Mozilla telemetry, if a % is needed; otherwise say "the default in Chrome/Firefox/OpenSSL"】
- One-line wonder for the video: the café sniffer sees *every message* of the key exchange — and it doesn't help. Public ≠ secret.


## 5. Certificates & trust

*Partially verified 2026-10-11; remaining items flagged.*

- **Why keys alone aren't enough**: DH solves "we both end up with a secret nobody else knows" — but the café sniffer could simply *interpose* themselves: run DH with you, run DH with `shop.example`, and relay both (a **man-in-the-middle attack**). Shared secret ≠ known identity. You'd have a private line — to the wrong person. (RFC 8446 handles this via CertificateVerify/Finished — see §3.)
- **Certificate = a CA's stamp binding a domain name to a public key**: "the party that controls `shop.example` owns this public key," signed by a **Certificate Authority (CA)** whose own key the browser already trusts.
- **Chain of trust**: leaf (website) ← **intermediate CA** ← **root CA**. Roots are trusted because they ship *inside* the browser/OS (**root store**).
- **Root store counts (citable, as of Aug 24, 2020 — Wikipedia "Certificate authority", citing MozillaWiki / Apple / CCADB)**:
  - Mozilla Firefox: **147 root certificates, 52 organizations**
  - macOS: 168 roots, 60 organizations; Microsoft Windows: 255 roots, 101 organizations; Android: "over 100 CAs"
  - Sanity check, Oct 2026: this research sandbox's Debian ca-certificates (Mozilla-synced) contains **150** Mozilla root files. Source: Wikipedia — https://en.wikipedia.org/wiki/Certificate_authority (★, citing official lists)
  - **Session 2 primary count (2026-10-11, strongest source in this doc)**: parsed directly from the source of Firefox's shipped root store — mozilla-central `security/nss/lib/ckfw/builtins/certdata.txt` (fetched 2026-10-11): the NSS built-in module contains **172 certificates, of which 121 are currently trusted to issue TLS server certificates** (trust bit `CKA_TRUST_SERVER_AUTH = CKT_NSS_TRUSTED_DELEGATOR`); the other 51 are legacy/expired/distrusted roots kept only for old chain building (e.g., GlobalSign Root CA 1998, Entrust.net Premium 2048, QuoVadis Root CA 2/3 — and, as of this fetch, DigiCert Global Root CA 2006, now `MUST_VERIFY`). Roughly **~55 distinct CA organizations** among the 121 (first-token count; "~50 companies" is the safe on-screen rounding). Source: https://hg.mozilla.org/mozilla-central/raw-file/tip/security/nss/lib/ckfw/builtins/certdata.txt (★★★ primary, live). Interpretation: the count has *fallen* from 147 (Aug 2020) as legacy roots expired/retired — good sign, not bad.
  - On-screen phrasing: "your browser ships with roughly 120 pre-installed 'passport stamps' from ~50 companies." 【to verify against a CCADB report if an exact same-day CCADB tally is needed — NSS-module count and CCADB-included count differ by inclusion semantics】
- **Why the MITM fails**: the attacker can't forge `shop.example`'s certificate — no CA will issue for a domain the requester doesn't control (domain validation), and the browser shows a full-page error if the chain doesn't verify.
- **Let's Encrypt** — verified via Wikipedia + live official stats:
  - Formed Nov 18, 2014 (EFF, Mozilla, University of Michigan, Akamai, Cisco; run by ISRG). **Public beta Dec 3, 2015** (free certificates). ACME protocol submitted to IETF in 2015; **ACME v2 + wildcard certs March 2018**; ACME standardized as **RFC 8555 (March 2019)**. Source: https://en.wikipedia.org/wiki/Let%27s_Encrypt (★) + https://www.rfc-editor.org/rfc/rfc8555.txt (★★★, fetched, header verified: March 2019)
  - **Live adoption numbers (official Let's Encrypt daily stats, fetched 2026-10-11)** — https://d1dfn7jg27m4cf.cloudfront.net/cert-daily-stats.tsv (the data behind https://letsencrypt.org/stats/):
    - 2026-10-10: **710,175,412 active certificates**; 726,653,577 fully-qualified domains; 234,091,719 registered domains
    - End-2015: 228k active certs → end-2018: 87.7M → end-2021: 219.7M → end-2024: 464.6M → end-2025: 653.1M (all from same dataset; ★★ official)
  - Everyday-scale line: **roughly one active certificate for every 12 people alive** (710M certs vs **~8.3B world population, as of 2026** — verified session 2 from Wikipedia "World population", fetched 2026-10-11: "As of 2026, the world population is approximately 8.3 billion"; UN: 8 billion reached Nov 15, 2022 — https://en.wikipedia.org/wiki/World_population). 710M/8.3B ≈ 1 cert per 11.7 people → "one per 12 people" holds.
- **Certificate Transparency (CT)** — RFC 6962 (Laurie, Langley, Kasper; June 2013, Experimental) — "publicly logging the existence of TLS certificates as they are issued or observed, in a manner that allows anyone to audit certificate authority (CA) activity" (abstract, verbatim). Successor: **RFC 9162 (Dec 2021)**. Browsers enforce it: RFC 9162 §6.2 (fetched): "at the time of writing, Chromium [Chromium.Log.Policy] requires multiple SCTs to be presented with Extended Validation (EV) certificates in order for the EV indicator to be shown." (★★★ RFC 6962 fetched — https://www.rfc-editor.org/rfc/rfc6962.txt; RFC 9162 fetched — https://www.rfc-editor.org/rfc/rfc9162.txt. **Chrome enforcement verified in session 2** against the current official policy page (chromium.org's CT page redirects there via goo.gl/chrome/ct-policy): *"In CT-enforcing versions of Chrome, all publicly-trusted TLS certificates are required to be CT Compliant to successfully validate"*, where a certificate is CT Compliant when *"accompanied by SCTs"* satisfying the policy — https://googlechrome.github.io/CertificateTransparency/ct_policy.html (fetched 2026-10-11; ★★★ official policy). Note: the current policy text no longer carries the historical "issued after April 30, 2018" date line; the on-screen-safe phrasing is simply "Chrome rejects certificates that aren't logged in public CT logs.")
- **DigiNotar (2011) — the canonical "why CT exists" story** (all from Wikipedia, well-sourced):
  - Dutch CA, hacked **June 2011** (intrusion detected internally July 19, 2011; not disclosed then). On **July 10, 2011** the attacker issued a **wildcard certificate for Google**, used for MITM interception of Google services (incl. Gmail) on Iranian ISPs — the Dutch-government-commissioned Fox-IT investigation later identified **~300,000 Iranian Gmail users** as the main target.
  - **531+ fraudulent certificates** ultimately identified (Google blacklisted 247 in Chromium within days). Source: Gervase Markham's CN list, Sept 4, 2011.
  - Browsers removed DigiNotar roots; Dutch government took over its systems Sept 3, 2011; **bankruptcy filed Sept 20, 2011** — a company that had operated since 1998 was dead in ~3 months.
  - Primary Google blog: "An update on attempted man-in-the-middle attacks" (Heather Adkins, Aug 29, 2011) — https://googleonlinesecurity.blogspot.com/2011/08/update-on-attempted-man-in-middle.html
  - Slate explainer (Josephine Wolff, Dec 21, 2016): "How a 2011 Hack You've Never Heard of Changed the Internet's Infrastructure" — https://slate.com/technology/2016/12/how-the-2011-hack-of-diginotar-changed-the-internets-infrastructure.html (★)
- **Heartbleed (April 2014)** — verified via heartbleed.com (primary, run by the discoverers at Codenomicon) + Wikipedia:
  - **CVE-2014-0160**; bug in OpenSSL's TLS heartbeat extension implementation (not in the TLS protocol). **OpenSSL 1.0.1 through 1.0.1f vulnerable; 1.0.1g (released April 7, 2014) fixes it.**
  - Leak size: "the attacker... can keep reconnecting or during an active TLS connection keep requesting arbitrary number of 64 kilobyte chunks" — **64 KB per heartbeat, repeatable** (heartbleed.com FAQ).
  - Discovered independently by **Neel Mehta (Google Security)** and **Codenomicon** (their discovery date: April 3, 2014); name + logo + heartbleed.com by Codenomicon.
  - Scale: **"some 17% (around half a million) of the Internet's secure web servers certified by trusted authorities were believed to be vulnerable"** — Netcraft (Paul Mutton), April 8, 2014 — http://news.netcraft.com/archives/2014/04/08/half-a-million-widely-trusted-websites-vulnerable-to-heartbleed-bug.html
  - Video framing: *the math was fine; the code wasn't* — protocol security vs implementation bugs. (EFF's companion piece: "Why the Web Needs Perfect Forward Secrecy More Than Ever," Yan Zhu, April 8, 2014 — https://www.eff.org/deeplinks/2014/04/why-web-needs-perfect-forward-secrecy)

## 6. HTTPS today

*Verified 2026-10-11. The telemetry numbers below were computed from the raw Firefox-telemetry dataset that powers Let's Encrypt's "HTTPS adoption" chart (probe `HTTP_PAGELOAD_IS_SSL`; aggregation methodology per Mozilla bug 1414839 comment 19: SUM(ratio × normalized_pageloads) over included countries).*

### 6.1 Chrome's "Not secure" escalation (all official ★★ sources, fetched & read)

| Milestone | What changed | Source |
|---|---|---|
| **Chrome 56, January 2017** | HTTP pages **with password or credit-card fields** marked "Not secure" in the omnibox | Google Online Security Blog, "Next Steps Toward More Connection Security" (Emily Schechter, April 27, 2017): "In January, we began our quest… Chrome now marks HTTP pages as 'Not secure' if they have password or credit card fields." — https://security.googleblog.com/2017/04/next-steps-toward-more-connection.html |
| **Chrome 62, October 2017** | Extended to HTTP pages **with any data entry**, and **all HTTP pages in Incognito** | same post: "Beginning in October 2017, Chrome will show the 'Not secure' warning in two additional situations: when users enter data on an HTTP page, and on all HTTP pages visited in Incognito mode." |
| **Chrome 68, July 2018** | **Every** HTTP page marked "Not secure" | Chromium Blog, "A secure web is here to stay" (Emily Schechter, Feb 8, 2018): "Beginning in July 2018 with the release of Chrome 68, Chrome will mark all HTTP sites as 'not secure'." — https://blog.chromium.org/2018/02/a-secure-web-is-here-to-stay.html |

- Bonus stat from the Feb 2018 post: *"Over 68% of Chrome traffic on both Android and Windows is now protected; over 78% on Chrome OS and Mac; 81 of the top 100 sites use HTTPS by default"* (as of Feb 2018).
- Bonus stat from the Apr 2017 post: after Chrome 56's marking, **"a 23% reduction in the fraction of navigations to HTTP pages with password or credit card forms on desktop."** — a great causal-flip number for the video.
- Chrome's traffic grew so much that Google discontinued its HTTPS Transparency Report (archived 2023) — 【optional; verify if mentioned on screen】.

### 6.2 Firefox telemetry: share of page loads over HTTPS (HTTP_PAGELOAD_IS_SSL)

Dataset: https://d1dfn7jg27m4cf.cloudfront.net/current-https-adoption.csv + historical-https-adoption.csv (fetched 2026-10-11; these are the files behind the chart at https://letsencrypt.org/stats/ — Let's Encrypt republishes Mozilla's public telemetry because the original Firefox Public Data Report was retired). Aggregation per Mozilla bug 1414839#c19 (fetched: https://bugzilla.mozilla.org/show_bug.cgi?id=1414839#c19).

Monthly, "all users" (US+JP+OTHER weighted):

| Date | HTTPS share | Context |
|---|---|---|
| Oct 2013 (first month of data) | **28.9%** | dataset begins |
| Jan 2016 | 40.2% | |
| Nov 2016 | ~49% | crossed 50% around here |
| Jan 2017 | 51.2% | Chrome 56 marking begins |
| Jul 2018 | 73.0% | Chrome 68 marking lands |
| Apr 2020 | 85.6% | pandemic-era peak (monthly avg) |
| 2024 (monthly range) | **79.5% – 82.7%** | |
| 2025 (monthly range) | **81.6% – 85.8%** | |
| Sep 2026 | 83.1% | most recent full month |

- Per-line detail (the LE chart shows three lines; monthly means computed from the same CSV): **US-only ran ~94–96%** through 2025 (e.g., Jan 2025: 95.0%, Jul 2025: 94.8%, Dec 2025: 95.3%); **Japan-only ~91–94%** (Jan 2025: 91.1% → Sep 2026: 93.4%); rest-of-world "OTHER" line ~78–82%. I.e., the brief's "80–93% (2024–2025)" range corresponds to the spread between the global weighted line and the US/JP lines. (Partial-period caveat: single-day rows can swing ±10 pts, and Oct 2026 (71.9% aggregate) covers only 9 days — a partial-month artifact, not a crash; full months are the defensible series.)
- **Important honesty note for the video**: this measures *Firefox page loads* (one browser, its users skew technical); it is *not* "the web is X% HTTPS." Phrase as "of every page Firefox users loaded last month, ~5 in 6 came over HTTPS."
- The 2010 Firesheep-era baseline: this dataset starts Oct 2013 (28.9%) — 【to verify: a defensible 2010-era HTTPS share if the video wants a "then vs now" number; candidates: Firefox telemetry pre-2013 is not in this dataset — likely keep "under a third" (2013) instead of guessing 2010】.

### 6.3 Where it's going (2025–2026 status)

- **ECH (now verified — §1.4)**: RFC 9849 (March 2026); default in Chrome since 117 (Sept 2023) and Firefox since 119 (Oct 2023); hides the SNI hostname from the café sniffer.
- **HTTPS-Only/HTTPS-First**: "Forcing a web browser to load only HTTPS content has been supported in Firefox starting in version 83" (HTTPS-Only Mode, 2020 — Wikipedia HTTPS article, fetched locally, citing support.mozilla.org); Chrome has an HTTPS-First Mode in testing since 2021. Current 2026 default-rollout status: 【to verify — all Mozilla/Google support properties are bot-challenged or unreachable from the sandbox】. Safe phrasing: "browsers are moving from warning about HTTP to just refusing it."
- **Post-quantum (verified — §2/§9)**: X25519MLKEM768 is "the algorithm preferred by most major browsers"; ~70% of browser→Cloudflare traffic already post-quantum (Sept 2026). Policy horizon: **US Executive Order 14412**, "Securing the Nation Against Advanced Cryptographic Attacks" (signed June 22, 2026) — deadlines Dec 31, 2030 (post-quantum encryption for federal agencies' most sensitive systems) and Dec 31, 2031 (post-quantum authentication); NIST-track guidance deprecates RSA/ECC by 2030, disallows by 2035 (per Cloudflare's Aug 2026 post, fetched: https://blog.cloudflare.com/post-quantum-eo-2026 ★★; same post: "The TLS community went the opposite way, converging on a single hybrid key agreement (X25519MLKEM768), and deployment followed quickly.").
- Suggested closer beat: the padlock, once a checkout-page luxury, is now the default; plaintext is the flagged exception. The invisible layer became the norm so quietly most people never noticed the flip — and it is being re-cut again (ECH, post-quantum) while nobody is looking.


## 7. Numbers & analogies list

*All numbers below carry verified sources + confidence ratings (★★★ primary: RFC / original paper / official spec; ★★ official blog or single authoritative dataset; ★ reputable secondary). Everyday-scale renderings are suggestions for the VO.*

### 7.1 Numbers (14–16, each verified, with confidence + an everyday-scale rendering)

1. **2 → 1 round trips** — a full TLS 1.2 handshake needs 2 round trips before the client may send application data (RFC 5246 Fig. 1 + §7.4.9); TLS 1.3's baseline is the "1-RTT handshake" (RFC 8446 §2.3). Everyday scale: in the old protocol you had to exchange envelopes twice before the first secret letter; now once. (★★★)
2. **31 → 5 cipher suites** — the TLS 1.2 spec itself lists 31 suites in its appendix (RFC 5246 App. A.5, including NULL/RC4/3DES relics); TLS 1.3 defines exactly 5, all AEAD (RFC 8446 §B.4); the IANA registry has meanwhile accumulated 356 named suites (parsed 2026-10-11 from https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml). Everyday scale: a 31-page wine list replaced by a 5-course set menu — and nothing on it is rotten anymore. (★★★)
3. **1976 — 50 years ago** — Diffie–Hellman, "New Directions in Cryptography" (IEEE Trans. Inf. Theory, Nov 1976): public-key crypto is half a century old. Everyday scale: older than the personal computer *and* the compact disc. (★★★)
4. **32 bytes** — an X25519 public key is a 32-byte string (RFC 7748 §5, verbatim). Everyday scale: the public half of the café conversation's key fits in a tweet; the shared secret it produces is 32 bytes too. (★★★)
5. **2^256 ≈ 1.2 × 10^77** — keyspace of a 256-bit symmetric key. **Scale reference verified in session 2** (Wikipedia "Observable universe", fetched 2026-10-11): the observable universe contains *"approximately 10^80 hydrogen atoms"* (the Eddington number; a footnote cite runs to 10^82). So a 256-bit keyspace is about **one possible key for every 1,000 atoms in the observable universe** (10^80 / 10^77). Correction of an earlier draft: do NOT say "finding one specific atom in the universe" — that overstates the difficulty by ~1,000× (there are ~1,000× more atoms than keys). On-screen-safe phrasing: "one possible key for every thousand atoms in the observable universe," or sidestep to time: trying a trillion keys per second since the Big Bang (~4.3×10^17 s) covers ~4×10^29 of the 10^77 — a rounding error. (★★ for the atom figure; ★★★ for 2^256)
6. **~300,000 downloads in ~3 days** — Firesheep's official counter read 300,724 on the morning of Oct 27, 2010, three days after its Oct 24 release at ToorCon 12 (read live off codebutler.com in the Security Now! 272 transcript). Everyday scale: a stadium-full of people grabbed a one-click account-hijacking tool in a long weekend. (★)
7. **710,175,412 active Let's Encrypt certificates (Oct 10, 2026)** — official daily stats; growth: 228k (end-2015) → 87.7M (end-2018) → 219.7M (end-2021) → 464.6M (end-2024) → 653.1M (end-2025). Everyday scale: roughly one active certificate for every 12 humans alive. (★★ official dataset)
8. **79.5–82.7% (2024), 81.6–85.8% (2025), 83.1% (Sep 2026)** — share of Firefox page loads over HTTPS, monthly range (HTTP_PAGELOAD_IS_SSL weighted aggregate; US-only line ~95%). Everyday scale: 5 out of 6 envelopes the browser mails are sealed. (★★ Mozilla telemetry via LE-published dataset)
9. **28.9% (October 2013)** — first month of that same telemetry: the "before" anchor for the then-vs-now flip. Everyday scale: back then, fewer than 1 in 3 page loads was protected; the padlock was the exception. (★★)
10. **23% reduction** — fraction of desktop navigations to HTTP pages *with password or credit-card forms* dropped after Chrome 56 began marking them "Not secure" (Jan–Apr 2017). Everyday scale: a browser relabeling the envelope was enough to retire a quarter of the worst forms in three months. (★★ Google Online Security Blog, Apr 27, 2017)
11. **68% / 78% and 81 of the top 100** — share of Chrome traffic already protected (Android+Windows / ChromeOS+Mac) and top-100 sites on HTTPS by default, as of Feb 2018 (Chromium blog, "A secure web is here to stay"). Everyday scale: the milestone post for the flip — four-fifths of the biggest sites had already gone over. (★★)
12. **~120 live TLS root certificates from ~50 organizations (Firefox, Oct 2026, primary count)** — Mozilla's NSS built-in store (mozilla-central `certdata.txt`, fetched 2026-10-11): 172 certificates in the module, **121 currently trusted to issue TLS server certificates**, ~55 CA organizations by rough token count; the other 51 are retired/legacy kept for old chains. (History: 147/52 as of Aug 2020 per Wikipedia; Debian's Mozilla-synced bundle still ships 150 files incl. untrusted-for-TLS entries.) Everyday scale: ~120 passport offices the whole world is pre-programmed to trust, baked into your browser before you first open it — and any office that stamps for the wrong domain gets deleted from every browser at once (see #13). (★★★ primary-source count 【to verify against a CCADB report for an exact same-day CCADB tally】)
13. **531+ fraudulent certificates, dead in ~3 months** — DigiNotar: hacked June 2011, fraudulent Google wildcard used in Iran in July, roots pulled and bankruptcy filed Sept 20, 2011. Everyday scale: one bad notary's entire business evaporated in a summer — the punishment that keeps the other ~120 honest. (★ Wikipedia, well-sourced, citing Google/security blogs)
14. **64 KB per heartbeat, repeatable** — Heartbleed's leak per malicious heartbeat request (CVE-2014-0160); ~17% (~half a million) of trusted secure web servers believed vulnerable (Netcraft, Apr 8, 2014). Everyday scale: each request could cough up a small document's worth of the server's memory — passwords, private keys — and you could ask forever. (★★ heartbleed.com FAQ + Netcraft)
15. **27 years (Jan 1999 → 2026)** — since RFC 2246 turned SSL into TLS. Everyday scale: the company that created SSL (Netscape) is long gone; its protocol now carries most of the web. (★★★)
16. **~70% of browser traffic is already post-quantum (Sept 2026)** — *"about 70% of browser-generated traffic hitting Cloudflare's network ... is protected with post-quantum encryption using hybrid ML-KEM (FIPS 203)"* (Cloudflare Radar, 2026-09-29, fetched; same post: only ~15% of origin connections are). Rollout, verified: Chrome enabled the hybrid exchange by default as of **Chrome 124** (Apr 2024, Chromium blog, fetched); **Firefox 132** (Oct 2024) added mlkem768x25519 (official release notes, fetched). Exact "Chrome 131 = final ML-KEM switch" version detail: 【to verify】— phrase without version numbers on screen. Bonus number from the same Chromium post: the PQ key share is ~1 KB per peer vs X25519's 32 bytes — "an over 30x increase" — for a "4% median latency increase." Everyday scale: the café's "un-mixable paint" quietly got a quantum-proof repaint for most of the web — within two years of the standard landing. (★★)

### 7.2 Analogies (5, each with fit & distortion)

1. **Postcard vs. tamper-evident envelope** — HTTP = postcard (every handler reads it); HTTPS = sealed envelope (address visible, contents private). *Fit*: addresses/contents split maps to metadata vs. payload. *Distortion*: a paper envelope can be steamed open; TLS's sealing is cryptographic and tamper-*evident* (AEAD tag breaks if any bit is flipped), not just tamper-resistant.
2. **Agreeing on a secret password by shouting across a crowded room** (DH) — everything spoken is public, yet only the two parties can compute the result. *Fit*: captures "public channel, private result," the single most counter-intuitive fact of the episode. *Distortion*: shouting feels like it *should* leak the secret; the math's one-wayness has no everyday equivalent — hence the paint analogy to bridge it.
3. **Paint mixing** (DH visual) — public base color + secret colors; mixed pots cross the table; each adds their secret to the other's pot; same final color. *Fit*: commutative combination (order doesn't matter), visible intermediates, hidden ingredients. *Distortion*: paint is truly un-mixable (chemistry), DH is *computationally* hard (could fall to quantum computers — Shor's algorithm); also paint mixes are continuous, DH values are discrete.
4. **Notary seal / official stamp on a letter** (certificate) — a CA is a notary: it checks you own the domain, then stamps your public key. *Distortion*: a physical notary checks identity face-to-face and takes responsibility; CAs do automated domain checks at scale (the cheap "Domain Validation" tier doesn't prove *who* you are, only that you control the name) — and there are ~120 trusted ones, any of which can stamp for any domain (the CT logs exist precisely because that trust is broad).
5. **Registered-mail envelope: you can see it's addressed to shop.example, but not read the letter** (what the café sniffer gets) — the final state of the cold open. *Fit*: SNI/IP remain visible; payload encrypted. *Distortion*: "registered" implies the courier *knows* the contents' value/handles them specially — TLS hides from *everyone* en route, including the postman; and TLS also proves *sender identity* (server authentication), which registered mail doesn't.

## 8. Terminology (on-screen spellings, 25)

*Exact capitalization/spelling to use on screen; checked against the RFCs cited above.*

1. **TLS** — "Transport Layer Security" on first mention
2. **SSL** — "Secure Sockets Layer" on first mention (historical only)
3. **HTTPS** — all caps (never "https")
4. **handshake** — lowercase
5. **ClientHello** — one word, capital C and H (RFC 8446 spelling)
6. **ServerHello** — one word, capital S and H (RFC 8446 spelling)
7. **key exchange** — two words
8. **Diffie–Hellman** — en dash in prose; on screen "Diffie-Hellman" (plain hyphen) is acceptable
9. **ECDHE** — "elliptic-curve Diffie–Hellman ephemeral" on first mention
10. **X25519** — no hyphen, capital X
11. **session key** — two words
12. **symmetric encryption** — as opposed to asymmetric
13. **AEAD** — "Authenticated Encryption with Associated Data" (RFC 8446)
14. **AES-GCM** — hyphenated; full suite names in RFC 8446 style: `TLS_AES_128_GCM_SHA256`, `TLS_AES_256_GCM_SHA384`
15. **ChaCha20-Poly1305** — capital C, C; suite: `TLS_CHACHA20_POLY1305_SHA256`
16. **forward secrecy** — two words (some sources say "perfect forward secrecy"; TLS 1.3 context drops "perfect")
17. **certificate** — lowercase when generic
18. **Certificate Authority (CA)** — caps when naming the role
19. **root store** — the pre-installed roots in a browser/OS
20. **chain of trust** — three words
21. **Let's Encrypt** — apostrophe, capital L and E (no space after "Let's")
22. **Certificate Transparency** — caps; abbreviation **CT** after first use
23. **Heartbleed** — one word, capital H
24. **SNI** — "Server Name Indication"; visible hostname in ClientHello
25. **man-in-the-middle (MITM)** — hyphenated as an adjective

*Spare pool (use only if the script needs them): HTTP, Wireshark, Firesheep, sidejacking, ACME, monitor mode, plaintext, ciphertext, discrete logarithm problem, ECH ("Encrypted Client Hello"), ML-KEM / X25519MLKEM768, Certificate Transparency (CT), RFC 9849.*

## 9. Session 2 verification log (retry, 2026-10-11)

*The `web_search` API returned HTTP 429 for every call in the retry session (same as session 1 — the previous session's background loops retried for hours without success). Session 2 therefore fetched primary pages directly (plain curl from the sandbox — which DOES have network access — saving everything under `research/raw/s3/pages/`). All pages were read as data only; no instructions found in any page were executed.*

| # | Item (from session-1 appendix) | Result | Source (all fetched 2026-10-11) |
|---|---|---|---|
| 1 | ECH deployment status | **CLOSED.** ECH is now RFC 9849 "TLS Encrypted Client Hello" (Rescorla/Oku/Sullivan/Wood, March 2026, Standards Track). Chromium 117 enabled ECH by default Sept 2023 (needs HTTPS DNS records); Firefox since v119 (Oct 2023); Cloudflare serves ECH since Sept 2023; nginx + OpenSSL 4 since Dec 2025 | https://www.rfc-editor.org/rfc/rfc9849.txt (header verified, ★★★); https://en.wikipedia.org/wiki/Encrypted_Client_Hello (★) |
| 2 | Chrome CT/SCT requirement | **CLOSED.** Current official policy: "In CT-enforcing versions of Chrome, all publicly-trusted TLS certificates are required to be CT Compliant to successfully validate" (CT Compliant = accompanied by SCTs meeting the policy). The old "issued after April 30, 2018" date line is gone from the live policy text | https://googlechrome.github.io/CertificateTransparency/ct_policy.html (★★★; chromium.org CT page redirects here via goo.gl/chrome/ct-policy) |
| 3 | Current root-store counts | **CLOSED (Mozilla, primary).** NSS built-in module (the store Firefox ships): 172 certs, **121 currently trusted for TLS server-auth**, ~55 distinct CA orgs; other 51 are retired/legacy (GlobalSign R1 1998, Entrust 2048, QuoVadis 2/3, DigiCert Global Root CA 2006 now MUST_VERIFY). Microsoft/Apple current counts NOT obtained (learn.microsoft.com 429s; Apple's old list page retired) — keep 2020 Wikipedia numbers for those, use Mozilla's on screen | https://hg.mozilla.org/mozilla-central/raw-file/tip/security/nss/lib/ckfw/builtins/certdata.txt (parsed: trust bit CKA_TRUST_SERVER_AUTH = TRUSTED_DELEGATOR; ★★★) |
| 4 | X25519 / key-exchange share | **CLOSED BY SUBSTITUTION.** No direct classical-X25519 % found, but the fresher fact is better: ~70% of browser→Cloudflare traffic already uses hybrid ML-KEM (Sept 2026); Kyber-era post: X25519 key = 32 bytes vs Kyber ~1 KB per peer ("over 30x increase", "4% median latency increase") | https://blog.cloudflare.com/post-quantum-visibility (★★, 2026-09-29); https://blog.chromium.org/2024/05/advancing-our-amazing-bet-on-asymmetric.html (★★★) |
| 5 | Post-quantum browser defaults | **MOSTLY CLOSED.** Chrome 124 = hybrid PQ by default on desktop (Chromium blog, verbatim); Firefox 132 = mlkem768x25519 (official release notes, verbatim); "X25519MLKEM768 ... now the algorithm preferred by most major browsers" (Cloudflare, Sept 2026). Exact "Chrome 131 = final ML-KEM" version detail still 【to verify】 (chromereleases.google.com blocked; Chrome 131 beta post has no mention) | URLs in §2 |
| 6 | World population | **CLOSED.** "As of 2026, the world population is approximately 8.3 billion" → the "1 Let's Encrypt cert per ~12 people" line holds (710M/8.3B ≈ 1/11.7) | https://en.wikipedia.org/wiki/World_population (fetched; UN 8-billion milestone: Nov 15, 2022) |
| 7 | Atoms in observable universe (§7.1 #5 scale) | **CLOSED & CORRECTED.** "approximately 10^80 hydrogen atoms" (Eddington number; footnote cites 10^82). Fixed the draft's "find one atom in the universe" line, which overstated 2^256's keyspace by ~1,000× — correct rendering: one key per ~1,000 atoms | https://en.wikipedia.org/wiki/Observable_universe (fetched) |
| 8 | PQ policy horizon (bonus) | **ADDED.** US Executive Order 14412 "Securing the Nation Against Advanced Cryptographic Attacks" (signed June 22, 2026): federal deadlines Dec 31, 2030 (PQ encryption), Dec 31, 2031 (PQ authentication); RSA/ECC deprecated by 2030, disallowed by 2035 | https://blog.cloudflare.com/post-quantum-eo-2026 (★★, Aug 2026, authors Sharon Goldberg & Vincent Voci) |
| 9 | Firefox HTTPS-First status | **NARROWED.** Verified only: HTTPS-Only mode supported "in Firefox starting in version 83" (Wikipedia HTTPS article, citing support.mozilla.org); Chrome HTTPS-First Mode in testing since 2021. 2026 default status still open — all Mozilla properties (mozilla.org, support.mozilla.org, wiki.mozilla.org) serve a JS client challenge to this sandbox | local: research/raw/pages/wiki_https.txt |
| 10 | Firesheep primary / Wayback | **NOT RESOLVED (network).** web.archive.org is unreachable from the sandbox (all requests time out — re-confirmed this session); codebutler.com offline; Mozilla add-on archive challenged. Workaround stands: cite the Security Now! 272 transcript + archive.org URL in the video description | n/a |

*Fetch-method note: session-2 pages were retrieved with plain HTTPS requests (curl) after the SDK's search/reader functions rate-limited; HTTP 200 + content checked for each URL cited above. Wikipedia requests were throttled (~10–15 s apart) after a burst of 429s. learn.microsoft.com and datatracker.ietf.org remained blocked (429/403); chromereleases.google.com and web.archive.org timed out at the network level.*

## Appendix: Unverified / unresolved points (final state after session 2)

*Final state, 2026-10-11, after two sessions. Session 1: web_search rate-limited all day; built the doc from direct page fetches. Session 2 (retry): web_search still 429 — switched to direct primary-page fetches via plain HTTPS and closed 6+ items (see §9). What remains open, each with its safe workaround:*

1. **2010-era HTTPS share of page loads** — NOT RESOLVED, likely unresolvable: the Firefox telemetry series (the only continuous public dataset) begins **Oct 2013 (28.9%)**; no contemporaneous defensible number exists in any fetched source (EFF's 2010 posts carry no percentages). *Workaround*: use "under 1 in 3 page loads by late 2013" as the "before" anchor; do NOT quote a 2010 %.
2. **Firesheep primary source** — NOT RESOLVED (network-level): codebutler.com/firesheep is offline; **web.archive.org is unreachable from this sandbox** (re-confirmed in session 2 — all requests time out); Mozilla's add-on archive serves a JS challenge. The ~300,000-downloads figure rests on the official counter being read aloud on *Security Now!* 272 (recorded Oct 27, 2010, three days post-release), matching media coverage. *Workaround*: cite the transcript URL + archive.org snapshot of the codebutler page in the video description.
3. **"Chrome 131 = final X25519MLKEM768" version detail** — PARTIAL: Chrome 124 (hybrid draft Kyber, by default) is primary-verified (Chromium blog, fetched, verbatim); Firefox 132 (mlkem768x25519) primary-verified (official release notes, fetched); "preferred by most major browsers" as of Sept 2026 (Cloudflare, fetched). The specific Nov-2024/Chrome-131 switch statement could not be fetched (chromereleases.google.com blocked; Chrome 131 beta post silent). *Workaround*: phrase without version numbers: "through 2024, both browsers turned the hybrid post-quantum exchange on by default."
4. **Firefox HTTPS-First default status, 2026** — NOT RESOLVED (all Mozilla web properties — mozilla.org, support.mozilla.org, wiki.mozilla.org — serve a JS client challenge to this sandbox; Wayback unreachable). Verified only: HTTPS-Only Mode exists since Firefox 83 (2020, Wikipedia citing support.mozilla.org). *Workaround*: optional beat; phrase generically ("browsers are moving from warning about HTTP to refusing it").
5. **Microsoft / Apple current root-store counts (2026)** — NOT RESOLVED: learn.microsoft.com returns 429 to the sandbox; Apple's old trusted-roots page (HT202127) is retired and the successor page wasn't located. *Workaround*: use Mozilla's primary-verified count on screen (121 trusted TLS roots, Oct 2026 — §5); keep the Aug-2020 Wikipedia numbers (Windows 255/101, macOS 168/60) off screen or explicitly dated.
6. **CCADB cross-check of the 121-root count** — new, minor: the NSS `certdata.txt` parse is primary, but CCADB's own "included roots" tally may differ slightly (inclusion vs trust-bit semantics, plus intermediate handling). If an exact number goes on screen, pull the CCADB root-store report same-day.
7. **Pre-2015 DV certificate street price ($50–300/yr)** — NOT RESOLVED; left OUT of §7.1 (safe). If needed, cite an archived 2014-era CA price page (Wayback required — unreachable from sandbox).
8. **Chrome 56's exact "23% reduction" window** — the Apr 2017 Google blog (fetched, verbatim) says "Since the change in Chrome 56, there has been a 23% reduction in the fraction of navigations to HTTP pages with password or credit card forms on desktop" — window is Jan→Apr 2017 by context, not stated as explicit dates. Present as "within months," not a day-count.

**Notes on derivations (safe but derived):**
- **"TLS 1.2 = 2 RTT"** is derived from RFC 5246 Figure 1 + §7.4.9 (no single sentence in an RFC says "2-RTT"); RFC 8446's own "1-RTT handshake" terminology is explicit. Both citations fetched and quoted in §3.
- **IANA suite count (356)** was parsed from the live TLS parameters page on 2026-10-11 (includes draft-era AEGIS/ASCON entries); the on-screen-safe pairing is "31 defined by TLS 1.2's spec (RFC 5246 App. A.5) → 5 by TLS 1.3 (RFC 8446 §B.4)."
- **Firefox monthly aggregates** in §6.2/§7.1 were computed from the LE-published raw CSV (methodology per Mozilla bug 1414839#c19); single-day rows swing ±10 pts, monthly means are the defensible series.
- **Mozilla root count (121)** derived by parsing trust bits in NSS `certdata.txt` (172 certs; 51 without TLS CA trust); org count (~55) is a rough first-token grouping — present as "~50 companies."

**Prompt-injection check (both sessions)**: all fetched pages were scanned for instruction-like text aimed at the researcher; none found, none executed. The only "MUST ignore"/"follow these steps" strings in the corpus are standard RFC normative language and Wikipedia template text.

