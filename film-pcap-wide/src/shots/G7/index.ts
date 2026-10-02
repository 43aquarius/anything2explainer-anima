import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC35} from './SC35';
import {SC36} from './SC36';
import {SC37} from './SC37';
import {SC38} from './SC38';
import {SC39} from './SC39';

// 组 G7（第 4 章上半：S45–S51，两个限制）：帧区间严格按 分镜表.md G7 表（相邻镜头首尾相接；章节卡 7773–7832，SC34 止于 7772，G8 SC40 起于 9037）。
export const SHOTS_G7: ShotDef[] = [
  {id: 'SC35', from: 7833, to: 7939, Comp: SC35}, // 两个诚实的限制（两卡侧滑入 + 微推；零 glitch）
  {id: 'SC36', from: 7940, to: 8231, Comp: SC36}, // TLS 1.3：信封变成保险柜（唯一 glitch `TLS 1.3`；推近 1.15/34 帧）
  {id: 'SC37', from: 8232, to: 8559, Comp: SC37}, // 信封外面仍然可见（段末 ¶+gap20；慢推 1.05；零 glitch）
  {id: 'SC38', from: 8560, to: 8871, Comp: SC38}, // 许可（闸机对比 + 许可状；零 glitch）
  {id: 'SC39', from: 8872, to: 9036, Comp: SC39}, // 在自己的网络上练（段末 ¶；波纹持续；零 glitch）
];
export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
