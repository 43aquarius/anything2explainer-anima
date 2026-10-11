import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01, SC01_RANGE} from './SC01';
import {SC02, SC02_RANGE} from './SC02';
import {SC03, SC03_RANGE} from './SC03';
import {SC04, SC04_RANGE} from './SC04';
import {SC05, SC05_RANGE} from './SC05';

export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 33, to: 175, Comp: SC01},
  {id: 'SC02', from: 176, to: 359, Comp: SC02},
  {id: 'SC03', from: 360, to: 448, Comp: SC03},
  {id: 'SC04', from: 449, to: 752, Comp: SC04},
  {id: 'SC05', from: 753, to: 924, Comp: SC05},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
