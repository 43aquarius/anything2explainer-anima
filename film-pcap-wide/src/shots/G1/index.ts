import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';
// 组 G1：第 1 章上半（S01–S08，症状 → 包是什么）。帧区间 = 分镜表 G1 表；相邻镜头首尾相接。
// SC01/02/03 三拍连续（浏览器 → 日志 → 两者间的 wire 缺口，SC03 承接缩移不清场）；
// SC04/05 信封流 → 巨信封解剖（同主角承接放大）；SC06 嵌套封装；SC07 段末 ¶（1,500 bytes ≈ 一段文字）。
// 幕底：点阵波常驻，无需覆写（BG_G1 留空）。
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 209, Comp: SC01},
  {id: 'SC02', from: 210, to: 352, Comp: SC02},
  {id: 'SC03', from: 353, to: 482, Comp: SC03},
  {id: 'SC04', from: 483, to: 715, Comp: SC04},
  {id: 'SC05', from: 716, to: 874, Comp: SC05},
  {id: 'SC06', from: 875, to: 1035, Comp: SC06},
  {id: 'SC07', from: 1036, to: 1227, Comp: SC07},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
