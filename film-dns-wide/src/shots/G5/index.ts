import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC18, SC18_RANGE} from './SC18';
import {SC19, SC19_RANGE} from './SC19';
import {SC20, SC20_RANGE} from './SC20';
import {SC21, SC21_RANGE} from './SC21';

export const SHOTS_G5: ShotDef[] = [
  {id: 'SC18', from: 4205, to: 4305, Comp: SC18},
  {id: 'SC19', from: 4306, to: 4658, Comp: SC19},
  {id: 'SC20', from: 4659, to: 4973, Comp: SC20},
  {id: 'SC21', from: 4974, to: 5258, Comp: SC21},
];
export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
