import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC45} from './SC45';
import {SC46} from './SC46';
import {SC47} from './SC47';
import {SC48} from './SC48';

// G7b（第 3 章下半下半段：S45–S48，沙箱 → 图标出现·十秒完成 → 从未解压 → ★坐在那里被阅读）。
// 帧区间照分镜表，首尾相接 6749–7326（G7/SC44 末 6748；SC48 登记到 7326 = S49.from−9，内容 7253–7261 归零，章节卡 4 自 7262 接管）：
// SC45 沙箱清场新场景；SC46 图标出现+Ten seconds（¶+gap15）；SC47 从未解压大字（零 glitch，SoftIn）；SC48 反转揭示·次高光（光锥扫描持续至离场）。
export const SHOTS_G7b: ShotDef[] = [
  {id: 'SC45', from: 6749, to: 6896, Comp: SC45}, // 沙箱 /data/data（¶；末 8 帧归零）
  {id: 'SC46', from: 6897, to: 7024, Comp: SC46}, // 图标出现 · Ten seconds.（¶+gap15；末 8 帧归零）
  {id: 'SC47', from: 7025, to: 7116, Comp: SC47}, // 从未解压大字（段内；末 8 帧归零）
  {id: 'SC48', from: 7117, to: 7326, Comp: SC48}, // ★坐在那里被阅读（¶+gap20；末 8 帧归零后章节卡接管）
];
export const BG_G7b: BgSpec[] = [];
export const FOOTAGE_G7b: FootageSpec[] = [];
