import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC23} from './SC23';
import {SC24} from './SC24';
import {SC25} from './SC25';
import {SC26} from './SC26';
import {SC27} from './SC27';
import {SC28} from './SC28';
// 组 G5：第 3 章上半（S30–S37，Wireshark 三个面板）。帧区间 = 分镜表 G5 表；相邻镜头首尾相接。
// SC23 章首承接：SC22 的 pcap 文件图标飞入整窗标题栏 → 三区占位 + ①②③ Pill + 紫光轮换；
// SC24 面板①列表（窗口缩角 0.33 + 6 行 WSRow + 当前行放大紫光 + 高亮条扫）；
// SC25 面板②详情树 + 嵌套信封 0.45×（四层依次点亮 + 33 帧推近）；SC26 面板③ hexdump 级联（段末 ¶）；
// SC27 捕获过滤器（拥挤 12 行 → tcp port 443 → 压缩 4 行）；SC28 显示过滤器 + Follow TCP Stream（段末 ¶，本组唯一 glitch）。
// 幕底：点阵波常驻，无需覆写（BG_G5 留空）。
export const SHOTS_G5: ShotDef[] = [
  {id: 'SC23', from: 5210, to: 5352, Comp: SC23},
  {id: 'SC24', from: 5353, to: 5537, Comp: SC24},
  {id: 'SC25', from: 5538, to: 5774, Comp: SC25},
  {id: 'SC26', from: 5775, to: 5935, Comp: SC26},
  {id: 'SC27', from: 5936, to: 6173, Comp: SC27},
  {id: 'SC28', from: 6174, to: 6573, Comp: SC28},
];
export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
