import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC14, SC14_RANGE} from './SC14';
import {SC15, SC15_RANGE} from './SC15';
import {SC16, SC16_RANGE} from './SC16';
import {SC17, SC17_RANGE} from './SC17';

export const SHOTS_G4: ShotDef[] = [
  {id: 'SC14', from: 3341, to: 3556, Comp: SC14},
  {id: 'SC15', from: 3557, to: 3683, Comp: SC15},
  {id: 'SC16', from: 3684, to: 3918, Comp: SC16},
  {id: 'SC17', from: 3919, to: 4139, Comp: SC17},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
