import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC11} from './SC11';
import {SC12} from './SC12';

export const SHOTS_G5: ShotDef[] = [
  {id: 'SC11', from: 2625, to: 2776, Comp: SC11},
  {id: 'SC12', from: 2777, to: 3152, Comp: SC12},
];
/** SC11 黑暗舞台：整段关掉点阵幕底（回到纯黑），镜头内只画局部深色渐晕；SC12 恢复默认点阵波。 */
export const BG_G5: BgSpec[] = [{from: 2625, to: 2776, stars: 'none', fog: false}];
export const FOOTAGE_G5: FootageSpec[] = [];
