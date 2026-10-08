# APK / Android 安装 — 调研文档（双版共用）

> 主题：《APK — The Zip That Becomes an App》— 横版 YouTube（4 章 ~5 min）+ 竖版 TikTok（~65 s）
> 调研方法：权威页面直接抓取全文核对（Wikipedia ZIP/APK/AAB/ART、AOSP source.android.com apksigning 全套、developer.android.com、android-developers.googleblog.com、Library of Congress 格式页、Commons API）；搜索结果仅作线索，**上画面/进解说词的事实全部来自下列直接来源**。搜索快照存于 /home/z/my-project/research_apk/，页面全文存于本目录 direct/（等宽工程内，竖版共用）。
> 本片与前两部同宇宙：沿用「白线条 + 黑底点阵波」视觉语言；本片母题 = **包裹（parcel）**：拉链 = ZIP、火漆封条 = 签名、面单 = Manifest。

## 0 执行摘要

- APK **字面上就是一个 ZIP 压缩包**：Wikipedia APK 词条原文 "An APK file is a ZIP archive"；美国国会图书馆格式页："APKs are based on Java's JAR format structure and packaged as a ZIP archive"。任何 .apk 改名 .zip 即可用任意解压器打开（多源可核）。
- 最反直觉的两点：① 世界上最大移动操作系统的应用载体，是一个 **1989 年 DOS 时代的格式**（ZIP 首发于 1989-02-14，作者 Phil Katz——每个 ZIP 前两个字节 "PK" 就是他的名字缩写）；② 安装并不是「解压复制」——**整个包从不解压**：安装时做的是「验签（整文件哈希）→ 读面单（二进制 Manifest）→ 把字节编成机器码（dex2oat）→ 落位（/data/app + /data/data 沙箱）」。
- 一句话主线：**Every app is a zip. Install is the magic trick between them.**（每个 app 都是个 zip——中间发生的事才是魔术）

## 1 处境与钩子（贯穿示例）

贯穿示例（两版共用）：**你刚下载完一个 120 MB 的 app（示意值），点下 Install**。
- 手机里已经躺着这个 120 MB 的「包裹」——它此刻**还不是一个 app**，只是一个 zip。
- File manager 里把它重命名 .zip → 打开：AndroidManifest.xml / classes.dex / resources.arsc / res/ / META-INF/ 全在里面。
- 谜题：为什么世界上装机量最大的移动 OS，把 app 装在一个 1989 年的 DOS 压缩格式里交付？安装那 10 秒钟到底发生了什么？

## 2 ZIP 格式（事实层）

| 事实 | 出处 |
|---|---|
| ZIP 首次发布 **1989 年 2 月 14 日**（初始版本，PKWARE 发布） | Wikipedia ZIP 信息框 "Initial release 14 February 1989"；格式现行版本 6.3.10（2022-11-01） |
| 设计者 **Phil Katz**（PKWARE, Inc.）与 **Gary Conway**（Infinity Design Concepts）；诞生于 SEA 诉 PKWARE（PKARC 衍生自 ARC）官司之后 | Wikipedia ZIP History 节原文 |
| 名字 "zip"（move at high speed）由 Katz 的朋友 **Robert Mahoney** 提议，暗示比 ARC 更快 | Wikipedia ZIP History |
| 规范以 **APPNOTE.TXT** 随软件分发，保证兼容性；ISO/IEC 21320-1:2015 收录其子集 | Wikipedia ZIP History/Standard |
| 文件开头字节 **"PK"**（0x50 0x4B）= **Phil Katz 姓名缩写**："when a ZIP file is viewed in a text editor the first two bytes of the file are usually 'PK'" | Wikipedia ZIP 结构节原文 |
| 局部文件头魔数 **PK\x03\x04**；空包 PK\x05\x06；分卷 PK\x07\x08 | Wikipedia ZIP 信息框 |
| 结构 = **[局部文件头+数据]×N + 中央目录（CDFH）+ EOCD（目录结束记录）**；EOCD 位于文件末尾 → 方便追加新文件 | Wikipedia ZIP Structure 节（目录列表：local file header / data descriptor / central directory file header / end of central directory record） |
| ZIP 的扩展格式家族：**JAR、.ipa、.apk**、Office Open XML（docx/xlsx）、Open Packaging | Wikipedia ZIP 信息框 "Extended to" |
| 逐条目可选压缩方法（STORED=不压缩 / DEFLATED=压缩）——同一个包里两种混存 | ZIP 规范（APPNOTE）压缩方法表 |

**为什么用 ZIP（论证层，画面用）**：
1. **随机访问**：中央目录让 OS 可以只读某一条目（manifest），不用解开整个包；
2. **工具遍地**：1989→2008（Android 1.0），二十年生态，任何平台都有实现；
3. **Java 血统**：APK 基于 JAR 结构（JAR = zip + META-INF/MANIFEST.MF + 签名文件），Android 继承了 Java 生态的打包/签名惯例（LoC 格式页 + Oracle JAR 签名文档）。
4. **逐条目压缩可选**：该压缩的（dex、图片资源）压缩，不该压缩的（resources.arsc、native lib）保持 STORED 直接 mmap。

## 3 APK 结构（事实层）

| 事实 | 出处 |
|---|---|
| APK = ZIP 压缩包，内容：**AndroidManifest.xml**（二进制 XML，描述名称/版本/权限/组件）、**classes.dex**（编译后的代码，由 ART 执行；Dalvik 时代由 Dalvik VM 执行）、**resources.arsc**（预编译资源，二进制 XML）、**res/**、**assets/**（AssetManager 读取）、**lib/**（平台相关 native 库 .so，如 arm64-v8a）、**META-INF/**（MANIFEST.MF + CERT.SF + CERT.RSA） | Wikipedia APK "Package contents" 节原文（逐条对应） |
| AndroidManifest.xml 是 **Android binary XML**，工具（Apktool 等）才能转回可读文本——"改后缀打开看到的 manifest 是二进制" | Wikipedia APK："...may be in Android binary XML that can be converted into human-readable plaintext XML with tools such as..." |
| **classes.dex** = Dalvik Executable；单个 dex 方法数上限 **65536**（64K），超限就 classes2.dex/classes3.dex（multidex） | dx 工具 "--multi-dex ... when method index limit is about to be reached"（dx 源码提交）；社区多源（"method ID not in [0, 0xffff]: 65536"） |
| **resources.arsc 必须 STORED（不压缩）且 4 字节对齐**（targetSdk 30+ / Android 11 起强制）："ensure that all uncompressed files in the archive are aligned relative to the start of the file"——资源处理代码靠 **4 字节边界内存映射（mmap）** 高效访问 | developer.android.com zipalign 页 + aapt2 issue："Targeting R+ (version 30 and above) requires the resources.arsc of installed APKs to be stored uncompressed and aligned on a 4-byte boundary"；Vanderbilt 课件："can efficiently access resources when they're aligned on 4-byte boundaries by memory-mapping them" |
| zipalign = Android SDK 的 zip 对齐工具，安装前跑一遍 | developer.android.com zipalign 页 |
| 侧载（sideload）需开「Unknown sources」 | Wikipedia APK Overview |

## 4 签名（事实层，v2 是主角）

| 事实 | 出处 |
|---|---|
| Android 支持 v1/v2/v3 三套签名方案：**v1 = JAR signing**；**v2 = APK Signature Scheme v2，introduced in Android 7.0 (Nougat)**；**v3 = APK Signature Scheme v3，introduced in Android 9** | AOSP source.android.com/docs/security/features/apksigning 原文："v1 scheme: based on JAR signing / v2 scheme: APK Signature Scheme v2, which was introduced in Android 7.0 / v3 scheme: APK Signature Scheme v3, which was introduced in Android 9" |
| v2 是**整文件签名**："APK signature scheme v2 is a whole-file signature scheme that **increases verification speed and strengthens integrity guarantees** by detecting any changes to the protected parts of the APK" | 同上 v2 页原文 |
| **APK Signing Block 插在 ZIP 条目与中央目录之间**："Signing using APK signature scheme v2 **inserts an APK signing block into the APK file immediately before the ZIP Central Directory section**"；签名以 ID-value 对存储，v2 的 ID = 0x7109871a | 同上 v2 页原文 |
| v1（JAR 签名）机制：MANIFEST.MF 每条目摘要 → CERT.SF（manifest 整体+逐节摘要）→ CERT.RSA（PKCS#7 签名）——要**解压逐条哈希**，慢 | 同上 v1 节 + Oracle jarsigner 文档 |
| **装 v2 签的 app 更快**："Android 7.0+ and newer devices install apps signed with v2+ schemes **more quickly** than those signed only with v1 scheme" | AOSP apksigning Overview 原文 |
| v3 支持密钥轮换（key rotation / proof-of-rotation lineage） | AOSP apksigning + Guardsquare 博客（"Android 9.0 introduces the new APK signature scheme v3, including the new signature lineage to support certificate rotation"） |
| **自签名、无中心 CA**："Android provides code signing using **self-signed certificates** that developers can generate without external assistance or permission. Apps don't have to be signed by a central authority." | AOSP apksigning 原文 |
| 更新必须同密钥：换签名 = 无法覆盖安装（平台行为） | AOSP apksigning（app update 需同证书） |

**画面比喻（承重且注明失真处）**：v1 = 每件行李里塞一张签名收条（要开箱逐件查）；v2 = 整个包裹外圈一圈火漆封条（看一眼就知道动没动过）。失真处：火漆是纸蜡，v2 是对全文件字节的哈希+公钥签名，改一个 bit 都验不过。

## 5 安装时到底发生了什么（事实层）

安装步骤（画面主线，顺序按 PackageManagerService 实际流程）：

1. **下载完成，包还在**：APK 完整落在本地——此刻它是字节。
2. **整文件验签（v2）**：读文件尾找 EOCD → 定位中央目录前的 Signing Block → 哈希整文件所有受保护区间 → 公钥验签。一个字节被动过 → 拒装。（AOSP v2 页）
3. **读面单（Manifest）**：解析二进制 AndroidManifest.xml → 包名、版本、权限申请、组件清单。（Wikipedia APK）
4. **复制落位 /data/app/**：PackageManagerService（运行在 system_server）通过 **installd 守护进程**（/dev/socket/installd）把包复制到 /data/app/<随机目录>/；scan 创建 package entry 并**分配 Linux UID**（0xn3va cheat-sheet；dzone；jkjensen）。
5. **编译字节码（dex2oat）**：ART 用 **on-device dex2oat** 把 classes.dex 编译（AOT，部分后台 JIT+profile）；产物 oat/vdex 放 /data/app 同目录。（source.android.com/docs/core/art："ART compiles apps using the on-device dex2oat tool. This utility accepts DEX files as input"；ART 历史：4.4 KitKat 技术预览 → 5.0 Lollipop 全面替代 Dalvik → 7.0 Nougat 混合 JIT/AOT，Wikipedia Android runtime）
6. **建沙箱 /data/data/<pkg>/**：app 专属目录（files/databases/shared_prefs/cache），UID 隔离——每个 app 一个 Linux 用户。（AOSP Application Sandbox 节）
7. **注册 + 图标出现**：PackageManager 记录包信息；install-time 权限直接给，runtime 权限首次使用再问。

- 经历事实（体验引用）：系统大版本升级后开机 "Optimizing app 1 of N" = 全机 dex2oat 重跑（ART 换版本 → 全部重编译）。**示意标注**。
- 120 MB app / 2,000+ 类 / 「10 秒装完」——**示意值**，交付说明注明。

## 6 现代：AAB / split APKs（第 4 章）

| 事实 | 出处 |
|---|---|
| **Android App Bundle 于 2018 年 5 月 Google I/O 发布** | android-developers.googleblog.com 2018/05 io-2018 帖 + Credera "Google I/O 2021" 会评 |
| **新 app 自 2021 年 8 月起必须用 AAB 发布**；**存量 app 的更新自 2021 年 11 月起** | Wikipedia AAB："Google Play requires Android App Bundles for all new apps since August 2021 and for all updates to preexisting apps since November 2021"（developer.android.com 同） |
| AAB 不是安装格式：**Play 按每台设备生成定制 APK（split APKs）**——"enables the Play Store to generate APK files specifically tailored to each user's device"；用户只下载需要的部分，"reducing app size and improving installation speed" | Wikipedia AAB 原文 |
| 旧方式痛点：一个 APK 同时塞多语言 + 最多 4 种 CPU 架构 + 多分辨率资源 → "potentially large amounts of bloat irrelevant for a device's specific combination of CPU, locale, and screen size" | Wikipedia AAB Split APKs 节 |
| 语言切换/功能变化 → Play **按需下发补充 split APK**；"play as you download"（游戏边下边玩）依赖 AAB | Wikipedia AAB |
| 落点：**base.apk + 若干 config split 仍是 APK——仍是签名 zip**。AAB 改变的是「谁打包」，不是「包是什么」 | 推论（AAB 生成物就是 APK） |

## 7 边界与常见误解（QC 判据）

- ❌「APK 是压缩包所以安装就是解压」——错。**包从不解压**：资源 mmap、代码编译进 /data/app 的 oat/vdex，原 zip 原样保留在 /data/app。APK 里的文件只在运行时被按需读取。
- ❌「安装慢是因为在解压 120 MB」——主要耗时在**验签+编译（dex2oat）**，不在 IO。
- ❌「APK 是 Google 发明的格式」——APK 的容器是 ZIP（1989, Phil Katz），APK 只是「zip + 规则（面单/签名/对齐）」。
- ❌「安卓 app 和 iOS 一样是单一二进制」——APK 是**容器**：里面是字节码（dex）+ 资源 + 库 + 签名。
- ❌「签名 = 加密」——签名是哈希+私钥签名（任何人可验，只有持有者能签），app 内容**不加密**、完全可读。
- ❌「资源都压缩了」——resources.arsc 必须 STORED 不压缩（targetSdk 30+），为对齐与 mmap。

## 8 数字与比喻清单（每条标用途）

| 数字/比喻 | 用途 | 可信度 |
|---|---|---|
| 1989-02-14 ZIP 首发 | 章节锚点 | 直接来源（Wikipedia） |
| "PK" = Phil Katz 缩写，每个 ZIP 前两字节 | 全片钩子 #1 | 直接来源（Wikipedia） |
| PK\x03\x04 局部文件头魔数 | 画面细节 | 直接来源 |
| 65,536 = 单 dex 方法上限 | 第 3 章细节 | 直接来源（dx 工具链） |
| 4 字节对齐 / mmap（resources.arsc） | 第 2 章细节 | 直接来源（zipalign 文档） |
| v2: Android 7.0 (2016)；v3: Android 9 (2018)；v1: Android 1.0/JAR | 签名线 | 直接来源（AOSP） |
| ART：4.4 (2013) 预览 → 5.0 (2014) 默认 → 7.0 (2016) JIT/AOT 混合 | 编译线 | 直接来源（Wikipedia ART） |
| AAB：I/O 2018 发布；新 app 2021-08 强制 | 第 4 章 | 直接来源（googleblog/Wikipedia） |
| 120 MB 示例 app / 「10 秒」安装 | 贯穿示例 | **示意值**（交付说明注明） |
| 「超过两千个类」 | 第 3 章示意 | **示意值** |
| 火漆封条 = v2 整文件签名；面单 = Manifest；包裹 = APK | 视觉母题 | 比喻（失真处已注） |

## 9 真实素材（Commons，已核许可）

| 照片 | 作者 / 许可 | 用途镜头 |
|---|---|---|
| Android Lawn Statues (12758285644).jpg | Atomic Taco（Seattle, WA, USA）/ **CC BY-SA 2.0** | 横版第 4 章开头「Google 园区草坪上的绿色机器人」；竖版结尾前同用途 |
| （备选）Android sculptures.jpg | Baltakatei / CC BY-SA 4.0 | 仅存档不使用 |

- 已下载 1280px 宽缩略图至 `public/assets/apkwide/android_statues.jpg` 与 `public/assets/apkvert/android_statues.jpg`；`MANIFEST.md` 登记（URL / 作者 / 许可 / sha256 / 用途镜头）。
- 出处小字按规范：白框 + 暗调 grade + 灰色出处行，停留 ≥2.5 s。
- 照片 sha256：`f65433a160aca2482a014555de2eba4a45ec1924b59b2fe7ad971fb2d9f7613c`

## 10 待核清单（不进解说词）

- Google Play 当前在架 app 数（各源 1.58M–2.87M 冲突）→ 不上画面。
- 安装耗时精确统计（因设备而异）→ 全部用「示意」。
- v4 签名（Android 11，增量安装）→ 本片不讲，避免线头。

## 11 来源全文索引（direct/，位于 /home/z/my-project/research_apk/direct/）

zip_wiki.txt · apk_wiki.txt · appbundle_wiki.txt · apksigning_aosp.txt · v2scheme.txt · art_wiki.txt · guardsquare_v3.txt · aab_wiki2.txt · manifest_dev.txt · zipalign_dev.txt
