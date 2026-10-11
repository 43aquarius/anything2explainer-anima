# G3 BUILD_NOTES（第 2 章上半：S11–S14，SC08–SC10；代理 SC08/09 + 主会话补 SC10 与修复）

| 镜头 | 帧 | 文件 | 主角 | 主角高度 | 主角的光 | 高光 | 运镜 | motion_check |
|---|---|---|---|---|---|---|---|---|
| SC08 | 1538–1668 | SC08.tsx | RTT bracket+双端组 | 280px | `1-RTT` 橙光晕 | — | 慢推 | hold 42f ✓ |
| SC09 | 1669–1810 | SC09.tsx | hello 卡（ClientHello） | 300px | `key_share` 紫光 | — | 推近 1.15 跟卡 | hold 66f ✓ |
| SC10 | 1811–2145 | SC10.tsx | 双 KeyIcon+`=`+Cross | 300px | 双钥匙紫光 | ★论点型 | 推近 1.18/33f（1922 止） | hold 30f ✓ / 静止 1.0s ✓ |

- 修复：SC09 powOutRemain 导入错位（common 而非 ui）；SC10 由主会话补建（代理中断）。
- SC10 TO 延至 2145（段末跨 gap，分镜表 v2）；钥匙摆动 2085 起衰减（破静止段 + 留 hold）。
- parts.tsx 共用件：BrowserEnd/RackEnd/ArcPath/Envelope/tripPhase（END_FULL/END_BADGE 双端布局）。
- 白名单 glitch：SC08 `1-RTT`(4)、SC09 `ClientHello`(4)、SC10 `the same secret`(6，`=` 下方小字)。
