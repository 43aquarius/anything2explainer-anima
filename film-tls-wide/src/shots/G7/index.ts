import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC20} from './SC20';
import {SC21} from './SC21';
import {SC22} from './SC22';
import {SC23} from './SC23';

// 组 G7（第 4 章上半：S28–S32，谁来担保 → 证书邮戳墙 → MITM 失败 → Let's Encrypt）。帧区间见 分镜表.md「G7」表。
export const SHOTS_G7: ShotDef[] = [
  {id: 'SC20', from: 4139, to: 4292, Comp: SC20},
  {id: 'SC21', from: 4293, to: 4562, Comp: SC21},
  {id: 'SC22', from: 4563, to: 4750, Comp: SC22},
  {id: 'SC23', from: 4751, to: 5012, Comp: SC23},
];
// 幕底不覆写（点阵波常驻）
export const BG_G7: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G7: FootageSpec[] = [];
