import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';

// G2（第 1 章下半：S06–S10）——SC05 问题很老 / SC06 SSL 锁（登场型扫光①）/ SC07 TLS 1.3（章末）
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC05', from: 913, to: 1122, Comp: SC05},
  {id: 'SC06', from: 1123, to: 1340, Comp: SC06},
  {id: 'SC07', from: 1341, to: 1492, Comp: SC07},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
