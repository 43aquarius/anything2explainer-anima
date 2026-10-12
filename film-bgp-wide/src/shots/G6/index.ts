import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';

// G6（第 4 章上：S24–S30）。SC13 起帧 3198 = 章节卡 3153–3197 后一帧（派单口径；分镜表 G6 行内写作 3213，见 BUILD_NOTES）。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC13', from: 3198, to: 3480, Comp: SC13},
  {id: 'SC14', from: 3481, to: 3640, Comp: SC14},
  {id: 'SC15', from: 3641, to: 3926, Comp: SC15},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
