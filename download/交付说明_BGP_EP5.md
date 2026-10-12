# 交付说明 · EP5《BGP — The Internet's Diplomats》横版 YouTube

## 成片规格
| 项 | 值 |
|---|---|
| 文件 | `BGP_Explained_YouTube_1280x720.mp4`（28.4 MB） |
| 时长 | 2:18（138.3 s / 4143 帧 @30fps） |
| 画幅 | 1280×720（16:9，YouTube） |
| 章节 | 4 章 / 16 镜 / 7 构建组 |
| 配音 | edge-tts `en-US-AndrewNeural` +0%（317 词，2.77 词/s）；逐句缓存 `film-bgp-wide/audio/cache/` |
| 金句 | `The internet has no map. It remembers one — out loud.` |
| 系列回指 | EP2 DNS（名字→地址）、EP4 CDN（anycath 即 BGP 宣告技巧） |

## 章节结构
1. **The Vanishing**（f86）— 2021-10-04 互联网"忘了"Facebook 的那一分钟
2. **A Network of Networks**（f740）— 十万个自治系统互相"喊路"画出地图；AS=外交官；BGP 递纸条
3. **Trust Has No Locks**（f1940）— 1997 AS7007 / 2008 巴基斯坦-YouTube / 最长前缀匹配 / FB 六小时撤回
4. **Signing the Map**（f3206）— RPKI 签名；假宣告被核验弹开；"还在说"活地图；金句收束

## 事实出处（全部一手核验，见 film-bgp-wide/research/bgp-research.md）
- RFC 4271（BGP-4，rfc-editor.org 原文抓取）：AS 定义（single technical administration）、AS_PATH 选路
- Cloudflare 工程博客《Why the Facebook outage today was about BGP》（2021-10-04）：15:40 UTC 路由撤回洪峰、1.1.1.1/8.8.8.8 SERVFAIL、DNS 查询 30×、15:50–21:20 facebook.com 不可达（≈6 小时）、FB ASN=32934、"network of networks, bound together by BGP"
- Wikipedia《BGP hijacking》（2026-10 快照）：1997 AS7007 事故年表、2008-02-24 巴基斯坦封锁泄漏（"accidentally black-holed the route in the global BGP table"）
- Wikipedia《Autonomous system (Internet)》（引 potaroo）：路由系统 5k(1999)→30k(2008)→60k(2018)；2025 已分配 ASN ≈120,000
- RPKI：概念级呈现（签名可验），未上具体采纳百分比（各源分歧，调研表有注）

## 示例语境（画面示意值）
- `AS64512`（RFC 6996 私有文档段，示意用户侧）；`AS1299/AS3356/AS15169/AS65500`（链上示意网络名）
- `203.0.113.0/24`（TEST-NET-3，RFC 5737 文档段）；`208.65.152.0/22` vs `208.65.153.0/24`（长掩码对比示意，非 YouTube 实际前缀）
- `~120,000`（已分配 ASN，2025）；`≈ 6 hours`、`30x`（Cloudflare 实测）

## 质检结论
- `tsc --noEmit` 0 错误；`selfcheck.py` 0 问题（帧覆盖/白名单/字面量全对账）
- `motion_check --frames fin_frames`（成片权威复测）：**16 镜全过**（末拍稳定期 30–132f；最长静止 ≤2.8s）
- `frame_metrics`：高 1 / 中 1 / 低 17
  - **SC11 已知项（高）**：「黑暗中的声音」为分镜设计的极简暗场（VoiceDot 主角 + 涟漪），主体亮度阈值下的 62px 为设计本意；VLM 视觉抽查 PASS、motion 全过（54f hold）。与 EP4 CDN 交付的 SC11 已知项同性质
  - SC13 尾项（中）：章首承接段（3198–3254）主体 110px 以下 56 帧（已从 124 帧改善：顶部文字放大 + 封蜡虚影预告提前占位）
- VLM 视觉抽查：G1–G7 关键帧 + 分镜表边界帧全部 PASS（字幕带/扫光/红色警示为合法内容，初报为提示词过严误报）
- 分块渲染：3×~4.5 分钟（2 核机）+ ffmpeg concat demuxer；块间音轨差 ≤0.06s/块（Remotion 音频填充，与已交付 DNS/TLS/CDN 同管线水平，成片听感无差）
- 终镜金句排版：第二行 Audiowide 由 74px 降为 66px（textW 实测 1153px，恰在 60–1220 内容区），像素级边界验证 102–1178 ✓

## 已知保留项
1. SC11 主体尺度（上述设计性已知项）
2. SC13 章首段主体中位 244px 已达标，中项为 56 帧窗口的尾项记录
3. 低级标记 17 项（主角无光/紫色碎片类，与历期交付同级）

## 复现
```bash
cd film-bgp-wide
npm install                      # 或软链同模板工程的 node_modules
python3 scripts/tts_build.py      # 需 edge-tts；缓存命中时秒级
npx remotion render src/index.ts Video out.mp4 --codec=h264
# 或分块：bash scripts/render_chunk.sh 0 1379 / 1380 2759 / 2760 4142 + ffmpeg concat
```
