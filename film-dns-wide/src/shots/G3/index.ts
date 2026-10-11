import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC10, SC10_RANGE} from './SC10';
import {SC11, SC11_RANGE} from './SC11';
import {SC12, SC12_RANGE} from './SC12';
import {SC13, SC13_RANGE} from './SC13';

export const SHOTS_G3: ShotDef[] = [
  {id: 'SC10', from: 2273, to: 2630, Comp: SC10},
  {id: 'SC11', from: 2631, to: 2992, Comp: SC11},
  {id: 'SC12', from: 2993, to: 3119, Comp: SC12},
  {id: 'SC13', from: 3120, to: 3340, Comp: SC13},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
