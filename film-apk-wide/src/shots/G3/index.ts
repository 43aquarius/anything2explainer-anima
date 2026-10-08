import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';

// 组 G3（第 2 章上半：S11–S15，Phil Katz → 被告 → 名字留在文件里 → ★PK 揭示）。
// 帧区间 = 分镜表帧列（与 script/timeline.md 的 S11–S15 区间一致，首尾相接）：
// SC11 承接章节卡「The Box」（1532–1596 实际区间）出画后的标题槽位；SC15 高光 = 扫光白名单①（全片两处之一）。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC11', from: 1597, to: 1713, Comp: SC11}, // 1989 密尔沃基（承接章节卡；末 8 帧归零）
  {id: 'SC12', from: 1714, to: 1963, Comp: SC12}, // 官司 → ZIP（¶；末 8 帧归零）
  {id: 'SC13', from: 1964, to: 2023, Comp: SC13}, // 名字还在文件里（段内；末 8 帧归零）
  {id: 'SC14', from: 2024, to: 2170, Comp: SC14}, // 十六进制（段内；HexDump 不归零，承接进 SC15）
  {id: 'SC15', from: 2171, to: 2325, Comp: SC15}, // ★PK 揭示（¶+gap15；扫光白名单①；末 8 帧归零）
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
