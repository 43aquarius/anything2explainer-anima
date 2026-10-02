import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC34} from './SC34';
import {SC35} from './SC35';
import {SC36} from './SC36';
import {SC37} from './SC37';
// 组 G8（第 4 章下半：SC34–SC37，解说 S64–S72：连接迁移 → 可靠性住哪 → 回到通话 → 收尾两种承诺）。
// 帧区间按 分镜表.md 镜头衔接规则（首尾相接：前镜 to = 后镜 from − 1；章内段末 ¶ 镜头同样延到下镜 from−1）：
//   SC34 9181–9417（S64 9189；分镜表原文 9181–9382（¶ 末句 to+2），按 G1 先例延到 SC35.from−1 覆盖 ¶+gap15 停留）
//   SC35 9418–9758（S65 9426 + S66 9525 ¶；同上，原文 9418–9723 → 延到 SC36.from−1）
//   SC36 9759–10194（S67 9767 + S68 9801 + S69 9932 + S70 10062 ¶；原文 9759–10159 → 延到 SC37.from−1）
//   SC37 10195–10340（S71 10203 + S72 10260 ¶ 片末 = {S71.from−8}–{TOTAL=10340}；不归零，压黑层接管）
export const SHOTS_G8: ShotDef[] = [
  {id: 'SC34', from: 9181, to: 9417, Comp: SC34},
  {id: 'SC35', from: 9418, to: 9758, Comp: SC35},
  {id: 'SC36', from: 9759, to: 10194, Comp: SC36},
  {id: 'SC37', from: 10195, to: 10340, Comp: SC37},
];
export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
