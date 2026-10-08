import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC16} from './SC16';
import {SC17} from './SC17';
import {SC18} from './SC18';
import {SC19} from './SC19';
import {SC20} from './SC20';
import {SC21} from './SC21';
import {SC22} from './SC22';
import {SC23} from './SC23';
import {SC24} from './SC24';
import {SC25} from './SC25';
// G4（第 2 章下半：SC16–SC25，S16–S25）。帧区间照分镜表 G4 表；SC25 表内写 3605–3766，但章节卡（Overlay
// CHAPTER_CARDS 实算 3669–3733）在内容层之下，内容必须 3668 前归零——按派单指示 ShotDef 收到 3721，
// 组件 3669–3721 返回 null（末 10 帧 3658–3668 整组归零后让章节卡露出）。详见 BUILD_NOTES 偏离记录。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC16', from: 2326, to: 2439, Comp: SC16},
  {id: 'SC17', from: 2440, to: 2657, Comp: SC17},
  {id: 'SC18', from: 2658, to: 2720, Comp: SC18},
  {id: 'SC19', from: 2721, to: 2858, Comp: SC19},
  {id: 'SC20', from: 2859, to: 2994, Comp: SC20},
  {id: 'SC21', from: 2995, to: 3243, Comp: SC21},
  {id: 'SC22', from: 3244, to: 3279, Comp: SC22},
  {id: 'SC23', from: 3280, to: 3365, Comp: SC23},
  {id: 'SC24', from: 3366, to: 3604, Comp: SC24},
  {id: 'SC25', from: 3605, to: 3721, Comp: SC25},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
