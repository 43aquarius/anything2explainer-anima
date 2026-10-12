import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';

// 组 G1（第 1 章：S01–S05，满屋对话 → 半双工 → 一次一人）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 248, Comp: SC01},
  {id: 'SC02', from: 249, to: 332, Comp: SC02},
  {id: 'SC03', from: 333, to: 557, Comp: SC03},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
