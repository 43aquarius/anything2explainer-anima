import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC29} from './SC29';
import {SC30} from './SC30';
import {SC31} from './SC31';
import {SC32} from './SC32';
import {SC33} from './SC33';
import {SC34} from './SC34';

// 组 G6（第 3 章下半：S38–S44，破案）：帧区间严格按 分镜表.md G6 表（相邻镜头首尾相接；SC28 结束于 6573，章节卡 7773–7832）。
export const SHOTS_G6: ShotDef[] = [
  {id: 'SC29', from: 6574, to: 6771, Comp: SC29}, // 过滤到那台主机（推近 1.18/33 帧）
  {id: 'SC30', from: 6772, to: 6889, Comp: SC30}, // 请求飞出，响应没来（未解张力）
  {id: 'SC31', from: 6890, to: 7096, Comp: SC31}, // 一秒，两秒，四秒（推近 1.22/33 帧）
  {id: 'SC32', from: 7097, to: 7300, Comp: SC32}, // 消失的信与信箱（慢推 1.05 贯穿）
  {id: 'SC33', from: 7301, to: 7586, Comp: SC33}, // 七秒 —— 全片最高潮 · 大数字型高光时刻（推近 1.25/33 帧）
  {id: 'SC34', from: 7587, to: 7772, Comp: SC34}, // 只有线路看见了（章末 ¶，末 10 帧归零进章节卡）
];
export const BG_G6: BgSpec[] = [];
export const FOOTAGE_G6: FootageSpec[] = [];
