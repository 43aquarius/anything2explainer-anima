import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';
import {SC16} from './SC16';
import {SC17} from './SC17';

// 组 G3（第 2 章上半：S16–S21，立足点）。帧区间严格按 分镜表.md G3 表（相邻镜头首尾相接）。
// SC13→SC14 承接位移不清场（同一张路径图的四个站位：SC14 左端电脑节点放大 / SC15 交换机 / SC16 线缆 TAP，
// ①②③ 站位角标贯穿）；SC17 段末 ¶（Promiscuous mode，本组第二个 glitch 白名单词）。
// 幕底：点阵波常驻，无需覆写。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC13', from: 2577, to: 2775, Comp: SC13}, // 章首：WHERE?（本镜唯一 glitch）+ 三处立足点路径图
  {id: 'SC14', from: 2776, to: 2956, Comp: SC14}, // 立足点①本机（承接位移 16 帧 + 慢推 1.05）
  {id: 'SC15', from: 2957, to: 3113, Comp: SC15}, // 立足点②镜像口（交换机 + monitor port）
  {id: 'SC16', from: 3114, to: 3314, Comp: SC16}, // 立足点③分路器（段末 ¶+gap15；推近 1.12/33 帧）
  {id: 'SC17', from: 3315, to: 3696, Comp: SC17}, // 混杂模式（段末 ¶；Promiscuous mode glitch rgbSplit 4）
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
