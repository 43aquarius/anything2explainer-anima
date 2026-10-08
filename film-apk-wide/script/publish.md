# APK — The Zip That Becomes an App · 发布物料（YouTube 横版）

> 三件套之二：平台标题与简介（封面为 Cover 合成渲染产物）。
> 文案已过 tools/humanize.py（--genre title / --genre description），事实存活 audit 通过（详见 publish_title_humanized.txt / publish_desc_humanized.txt 与 .audit 记录）。

## 主标题（≤70 字符，46 字符）

```
Every Android app is a ZIP file from 1989
```

- humanizer 输出原句为句尾带句号的 sentence case；按 YouTube 标题惯例去掉句号，其余未动。
- 事实存活：Android / ZIP / 1989 均在。

## 视频简介

```
Rename any APK to .zip and it just opens. Every Android app ships as a ZIP archive — a format from 1989. Google picked it in 2008 for a new phone operating system, and it hasn't changed. The format's inventor, Phil Katz, had just been sued over his first archiver; the ZIP file he built to answer it starts with his initials, P and K — still the first two bytes of every app you install.

Installing is not unzipping. In the ten seconds after you tap Install, Android checks a v2 signature that covers the entire file, reads the binary manifest, compiles classes.dex into machine code for your exact CPU with dex2oat, and gives the app its own sandboxed Linux user. The file is never unzipped — it sits in /data/app and is read in pieces.

Chapters:
0:02 The Trick
0:53 The Box
2:04 The Seal
4:04 Still a Zip

Sources:
- ZIP file format — Wikipedia
https://en.wikipedia.org/wiki/ZIP_(file_format)
- Android application package — Wikipedia
https://en.wikipedia.org/wiki/Android_application_package
- APK signing schemes — AOSP
https://source.android.com/docs/security/features/apksigning
- zipalign — Android Developers
https://developer.android.com/tools/zipalign
- Photo: Android lawn statues by Atomic Taco, CC BY-SA 2.0, Wikimedia Commons
https://commons.wikimedia.org/wiki/File:Android_Lawn_Paint.jpg
```

## 标签

```
android, apk, zip file, how android works, android internals, tech explainer, programming, dex2oat, apk signing, phil katz, android app install, wireshark-free networking
```

（末位标签为系列联动占位——若不做系列联动可删；前 11 个为正选。）

## 备选标题（人工草稿，未过 humanizer，仅存档）

- Rename any APK to .zip — it just opens
- What Android actually does when you tap Install
- The 1989 file format inside every Android app
