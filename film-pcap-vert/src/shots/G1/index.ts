import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';

// 组 G1：钩子→抓包是什么（SC01–SC04，S01–S05）。帧区间严格按 分镜表.md G1 表；相邻镜头首尾相接。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 33, to: 145, Comp: SC01},
  {id: 'SC02', from: 146, to: 326, Comp: SC02},
  {id: 'SC03', from: 327, to: 479, Comp: SC03},
  {id: 'SC04', from: 480, to: 657, Comp: SC04},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
