import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';

// G3（照片 → 2021 还是 zip → PK → ★收束）：SC13 1877–1997 / SC14 1998–2089 / SC15 2090–2249（片末，不归零）
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC13', from: 1877, to: 1997, Comp: SC13},
  {id: 'SC14', from: 1998, to: 2089, Comp: SC14},
  {id: 'SC15', from: 2090, to: 2249, Comp: SC15},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
