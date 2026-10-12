import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';

// 组 G6（第 4 章上：S25–S30，志愿者 → 1985 与闰秒 → 没有完美钟；SC13 高光时刻·论点型）。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC13', from: 2662, to: 2882, Comp: SC13},
  {id: 'SC14', from: 2883, to: 3158, Comp: SC14},
  {id: 'SC15', from: 3159, to: 3360, Comp: SC15},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
