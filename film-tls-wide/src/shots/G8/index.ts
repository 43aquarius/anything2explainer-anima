import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC24} from './SC24';
import {SC25} from './SC25';
import {SC26} from './SC26';
import {SC27} from './SC27';

// 组 G8（第 4 章下半：S33–S39，五分之四 → 锁在重锻 → 回到咖啡馆 → 噪声与金句）。
export const SHOTS_G8: ShotDef[] = [
  {id: 'SC24', from: 5013, to: 5206, Comp: SC24},
  {id: 'SC25', from: 5207, to: 5513, Comp: SC25},
  {id: 'SC26', from: 5514, to: 5666, Comp: SC26},
  {id: 'SC27', from: 5667, to: 5928, Comp: SC27},
];
// 幕底不覆写（点阵波常驻）
export const BG_G8: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G8: FootageSpec[] = [];
