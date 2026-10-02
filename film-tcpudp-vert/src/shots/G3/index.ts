import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';
// 组 G3（8 字节 → 晚到即死 → QUIC 反转收尾：S10–S15）：镜头表 / 背景覆写 / 实拍层。数组顺序即层序。
// 帧区间按 分镜表.md（镜头衔接规则：段内镜头 = [首句 from−8, 下镜首句 from−9]；段末（¶）镜头 = 末句 to+2；
// 片末镜头 = 末句 to+2 后由 endingFade 压黑层接管，不归零）：
//   SC09 1102–1211（S10 1110−8 … SC10 首句 1220−9，段内）
//   SC10 1212–1345（S11 1220−8 … 末句 to+2 = 1343+2，¶ 段末）
//   SC11 1376–1644（S12 1384−8 … S13 末句 to+2 = 1642+2，¶+gap12 段末）
//   SC12 1677–1822（S14 1685−8 … TOTAL=1822 片末；1776 起 endingFade=6 压黑层接管，本镜不归零）
// 1346–1375 / 1645–1676 为段末停顿（幕底常驻，分镜表设计；SC11 自 1376、SC12 自 1677 起入场）。
// 闪烁白名单（本组）：SC09 `8 bytes`（rgbSplit 6）｜SC11 `HTTP/3`（rgbSplit 6）｜SC12 `TCP never loses.`
// （rgbSplit 8 / slices 16）；SC10 零 glitch。扫光白名单：仅 SC12（LightSweep）。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC09', from: 1102, to: 1211, Comp: SC09},
  {id: 'SC10', from: 1212, to: 1375, Comp: SC10},
  {id: 'SC11', from: 1376, to: 1676, Comp: SC11},
  {id: 'SC12', from: 1677, to: 1822, Comp: SC12},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
