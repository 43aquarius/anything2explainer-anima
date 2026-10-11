import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';
import {SC16} from './SC16';

// 组 G5（第 3 章上半：S19–S23，陌生人之谜 → DH 1976 → 颜料混合 → 单向门）。帧区间见 分镜表.md「G5」表。
export const SHOTS_G5: ShotDef[] = [
  {id: 'SC13', from: 2719, to: 2868, Comp: SC13},
  {id: 'SC14', from: 2869, to: 3035, Comp: SC14},
  {id: 'SC15', from: 3036, to: 3250, Comp: SC15},
  {id: 'SC16', from: 3251, to: 3459, Comp: SC16},
];
// 幕底不覆写（点阵波常驻）
export const BG_G5: BgSpec[] = [];
// 无实拍素材
export const FOOTAGE_G5: FootageSpec[] = [];
