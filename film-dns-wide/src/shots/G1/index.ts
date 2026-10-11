import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01, SC01_RANGE} from './SC01';
import {SC02, SC02_RANGE} from './SC02';
import {SC03, SC03_RANGE} from './SC03';
import {SC04, SC04_RANGE} from './SC04';
import {SC05, SC05_RANGE} from './SC05';

export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 229, Comp: SC01},
  {id: 'SC02', from: 230, to: 376, Comp: SC02},
  {id: 'SC03', from: 377, to: 604, Comp: SC03},
  {id: 'SC04', from: 605, to: 875, Comp: SC04},
  {id: 'SC05', from: 876, to: 1022, Comp: SC05},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
