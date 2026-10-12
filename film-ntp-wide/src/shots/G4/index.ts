import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC09} from './SC09';
import {SC10} from './SC10';
import {SC11} from './SC11';

export const SHOTS_G4: ShotDef[] = [
  {id: 'SC09', from: 1888, to: 2004, Comp: SC09},
  {id: 'SC10', from: 2005, to: 2163, Comp: SC10},
  {id: 'SC11', from: 2164, to: 2355, Comp: SC11},
];

/** SC11 黑暗舞台（BUILD_RULES_NTP §3：规则文写作 BG_G5，按帧区间 2164–2355 落在本组导出；stars:'none' = 点阵幕底整层关闭） */
export const BG_G4: BgSpec[] = [{from: 2164, to: 2355, stars: 'none', fog: false}];

export const FOOTAGE_G4: FootageSpec[] = [];
