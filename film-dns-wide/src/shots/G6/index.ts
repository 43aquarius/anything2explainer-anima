import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC22, SC22_RANGE} from './SC22';
import {SC23, SC23_RANGE} from './SC23';
import {SC24, SC24_RANGE} from './SC24';

export const SHOTS_G6: ShotDef[] = [
  {id: 'SC22', from: 5259, to: 5544, Comp: SC22},
  {id: 'SC23', from: 5545, to: 5980, Comp: SC23},
  {id: 'SC24', from: 5981, to: 6150, Comp: SC24},
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
