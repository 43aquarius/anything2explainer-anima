import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC17} from './SC17';
import {SC18} from './SC18';
import {SC19} from './SC19';

// 组 G6（第 3 章下半：S24–S27，前向保密 → 昨天仍密封 → 五套件）。帧区间见 分镜表.md「G6」表。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC17', from: 3460, to: 3594, Comp: SC17},
  {id: 'SC18', from: 3595, to: 3829, Comp: SC18},
  {id: 'SC19', from: 3830, to: 4093, Comp: SC19},
];
// 幕底不覆写（点阵波常驻）
export const BG_G6: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G6: FootageSpec[] = [];
