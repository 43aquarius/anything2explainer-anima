import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC18} from './SC18';
import {SC19} from './SC19';
import {SC20} from './SC20';
import {SC21} from './SC21';
import {SC22} from './SC22';
// 组 G4：第 2 章下半（S22–S29，抓包栈 → pcap 文件）。帧区间 = 分镜表 G4 表；相邻镜头首尾相接。
// SC18 四层栈（BPF GlitchIn + 4064 推近）→ SC19 段末 ¶ BPF 消防水管（灰点坠落 + 紫信封穿过）
// → SC20 pcap 文件卡（#2 行 1.35× 解剖 + hex 逐格点亮）→ SC21 承接缩左 +「打开循环」（放大镜 ×2）
// → SC22 段末 ¶ 高光时刻·论点型（EVIDENCE, / NOT TESTIMONY. + HaloRing）。SC20↔SC21 共用 shared.PcapFileCard（交界帧像素一致）。
// 幕底：点阵波常驻，无需覆写（BG_G4 留空）。
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC18', from: 3697, to: 4109, Comp: SC18},
  {id: 'SC19', from: 4110, to: 4310, Comp: SC19},
  {id: 'SC20', from: 4311, to: 4658, Comp: SC20},
  {id: 'SC21', from: 4659, to: 4979, Comp: SC21},
  {id: 'SC22', from: 4980, to: 5144, Comp: SC22},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
