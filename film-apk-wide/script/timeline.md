# 时间轴（edge · en-US-AndrewNeural +0%，共 8999 帧 = 300.0s，683 词，语速 2.75 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–249 | 5.5s | 57 |  | You just downloaded a chat app.｜One hundred and twenty megabytes.｜Your thumb is hovering over Install. |
| S02 | 1 | 260–329 | 2.3s | 25 |  | But before you tap that button,｜try something. |
| S03 | 1 | 340–408 | 2.3s | 36⚠ | ¶ | Rename the file.｜APK to ZIP. |
| S04 | 1 | 454–649 | 6.5s | 61 |  | It opens.｜Every file is right there:｜the manifest, the code,｜the resources, the signatures. |
| S05 | 1 | 660–868 | 7.0s | 95 |  | AndroidManifest.xml.｜classes.dex.｜resources.arsc, res, META-INF. |
| S06 | 1 | 879–971 | 3.1s | 55 | ¶ | Every Android app on Earth｜ships as a ZIP archive. |
| S07 | 1 | 1002–1152 | 5.0s | 69 |  | In 2008, Google needed a package format｜for a brand-new phone operating system. |
| S08 | 1 | 1163–1222 | 2.0s | 60 | ¶ | They picked one from 1989. |
| S09 | 1 | 1268–1423 | 5.2s | 94 |  | Why would the world's biggest mobile OS｜wrap its apps in a DOS-era compression format? |
| S10 | 1 | 1434–1529 | 3.2s | 64 | ¶ | And what actually happens｜in the ten seconds after you tap Install? |
| S11 | 2 | 1605–1711 | 3.6s | 67 |  | 1989.｜Phil Katz, PKWARE, Milwaukee. |
| S12 | 2 | 1722–1941 | 7.3s | 59 | ¶ | He had just been sued over his archiver, PKARC,｜by the makers of ARC,｜and his answer to the lawsuit｜was a new format: ZIP. |
| S13 | 2 | 1972–2021 | 1.7s | 50 |  | His initials are still in the file. |
| S14 | 2 | 2032–2168 | 4.6s | 71 |  | Open any zip in a hex editor:｜the first two bytes are P, K. |
| S15 | 2 | 2179–2288 | 3.7s | 72 | ¶ | Fifty, 4B.｜Every APK on your phone starts with them. |
| S16 | 2 | 2334–2437 | 3.5s | 29 |  | A zip is not really about compression, though.｜It is an index. |
| S17 | 2 | 2448–2635 | 6.3s | 68 | ¶ | Local file headers,｜a central directory,｜and at the very end,｜a record that says where everything is. |
| S18 | 2 | 2666–2718 | 1.8s | 53 |  | That index is why Android picked it. |
| S19 | 2 | 2729–2856 | 4.3s | 53 |  | The system can open one file inside the package｜without unpacking the rest. |
| S20 | 2 | 2867–2992 | 4.2s | 63 |  | The tooling was everywhere, too,｜twenty years of it by 2008. |
| S21 | 2 | 3003–3206 | 6.8s | 63 | ¶ | And Android was built on Java:｜a Java app already shipped as a JAR,｜which is a zip with a manifest inside. |
| S22 | 2 | 3252–3277 | 0.9s | 26 |  | One more twist. |
| S23 | 2 | 3288–3363 | 2.5s | 76 |  | Not everything in an APK is compressed. |
| S24 | 2 | 3374–3602 | 7.6s | 75 |  | The resource table must be stored uncompressed,｜aligned to four-byte boundaries,｜so Android can map it straight into memory. |
| S25 | 2 | 3613–3666 | 1.8s | 54 | ¶ | The box is smarter than it looks. |
| S26 | 3 | 3742–3772 | 1.0s | 31 |  | So you tap Install. |
| S27 | 3 | 3783–3919 | 4.6s | 69 |  | The phone is holding a zip from the internet,｜a hundred and twenty megabytes from a stranger. |
| S28 | 3 | 3930–3994 | 2.2s | 37⚠ | ¶ | First question:｜has anyone tampered with it? |
| S29 | 3 | 4040–4261 | 7.4s | 88 |  | The old scheme, v1, was JAR signing｜from the Java world:｜a signed receipt for every file inside the box. |
| S30 | 3 | 4272–4408 | 4.6s | 77 | ¶ | To check it, Android had to walk｜every entry and hash it, one at a time. |
| S31 | 3 | 4439–4615 | 5.9s | 40 |  | Android 7.0 added scheme v2,｜and it works like a wax seal｜around the whole package. |
| S32 | 3 | 4626–4817 | 6.4s | 82 |  | The signing block sits between the files｜and the central directory,｜and the signature covers the entire APK. |
| S33 | 3 | 4828–4909 | 2.7s | 37 |  | Change one byte anywhere,｜and the install dies. |
| S34 | 3 | 4920–5020 | 3.4s | 51 | ¶ | And installs got faster:｜no more walking every file. |
| S35 | 3 | 5066–5180 | 3.8s | 49 |  | The key is the developer's identity.｜There is no certificate authority. |
| S36 | 3 | 5191–5294 | 3.5s | 66 | ¶ | You sign your own app,｜and only the same key can ship an update. |
| S37 | 3 | 5337–5434 | 3.3s | 50 |  | Verification passes.｜Now Android reads the label. |
| S38 | 3 | 5445–5658 | 7.1s | 40 |  | The manifest is binary XML:｜name, version, every permission the app wants,｜every screen it can show. |
| S39 | 3 | 5669–5789 | 4.0s | 58 | ¶ | The package gets copied to its home,｜under /data/app. |
| S40 | 3 | 5832–5899 | 2.3s | 68 |  | Then the real magic: dex2oat. |
| S41 | 3 | 5910–6047 | 4.6s | 60 |  | Older Android ran apps through an interpreter,｜Dalvik, a few lines at a time. |
| S42 | 3 | 6058–6305 | 8.3s | 69 |  | Since Android 5.0, the runtime is ART,｜and at install it compiles classes.dex｜into machine code for your exact CPU. |
| S43 | 3 | 6316–6500 | 6.2s | 68 |  | That is the optimizing bar you see｜when your phone updates itself:｜every app on the device, recompiled. |
| S44 | 3 | 6511–6711 | 6.7s | 52 | ¶ | A single dex file tops out｜at 65,536 methods.｜Big apps just carry more of them. |
| S45 | 3 | 6757–6894 | 4.6s | 95 |  | Finally, a sandbox:｜/data/data, one Linux user per app. |
| S46 | 3 | 6905–6987 | 2.8s | 39⚠ | ¶ | The icon appears.｜Ten seconds, done. |
| S47 | 3 | 7033–7114 | 2.7s | 46 |  | And here is the thing:｜the app never got unzipped. |
| S48 | 3 | 7125–7259 | 4.5s | 39⚠ | ¶ | The zip is still sitting there in /data/app,｜being read in pieces. |
| S49 | 4 | 7335–7428 | 3.1s | 94 |  | In 2018, Google announced the App Bundle. |
| S50 | 4 | 7439–7579 | 4.7s | 31⚠ | ¶ | Since August 2021,｜every new app on the Play Store｜has to use one. |
| S51 | 4 | 7625–7811 | 6.2s | 73 |  | You no longer download one universal package｜with every language｜and every CPU architecture inside. |
| S52 | 4 | 7822–7936 | 3.8s | 44 |  | Play assembles the splits for your exact device｜and signs them on the way out. |
| S53 | 4 | 7947–8018 | 2.4s | 72 | ¶ | Your phone downloads only its own pieces. |
| S54 | 4 | 8064–8243 | 6.0s | 83 | ¶ | base.apk plus config APKs.｜Still APKs. Still signed zips. |
| S55 | 4 | 8274–8407 | 4.5s | 81 |  | Outside Google's headquarters,｜the lawn is full of giant green robots. |
| S56 | 4 | 8418–8539 | 4.1s | 57 | ¶ | Under every app they represent:｜a format from 1989. |
| S57 | 4 | 8585–8711 | 4.2s | 53 |  | Open any app under /data/app｜on a rooted phone and check. |
| S58 | 4 | 8722–8797 | 2.5s | 19⚠ | ¶ | Two bytes, right at the front.｜P, K. |
| S59 | 4 | 8848–8899 | 1.7s | 52 | ¶ | Every app is a zip you can read. |

## 章节起始帧
- 第1章 The Trick：f86
- 第2章 The Box：f1585
- 第3章 The Seal：f3722
- 第4章 Still a Zip：f7315

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
