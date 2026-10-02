import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC40} from './SC40';
import {SC41} from './SC41';
import {SC42} from './SC42';

// 组 G8：镜头表 / 背景覆写 / 实拍层。数组顺序即层序（后者在上）。帧区间见 分镜表.md 与 script/timeline.md。
// 镜头组件：const N = useCurrentFrame() + F0（F0 = 本镜头 from）；图元 import from '../../ui'，缓动/共用层 from '../../common'。
// G8（第 4 章下半：S52–S56，结案）：SC40 承接 SC34 三方图缩微 → 9.0 s 划掉变 0.9 s；SC41 believed ≠ happened；SC42 结尾回扣（扫光②）。
export const SHOTS_G8: ShotDef[] = [
  {id: 'SC40', from: 9037, to: 9220, Comp: SC40}, // 九秒变成一秒（拉远 1.12→1.0/41 帧回到全景；末 8 帧归零）
  {id: 'SC41', from: 9221, to: 9431, Comp: SC41}, // 日志相信 ≠ 线路发生（S53+S54+S55 三句一镜；末 8 帧归零）
  {id: 'SC42', from: 9432, to: 9517, Comp: SC42}, // 线路不会说谎 —— 片尾象征物 + 回扣（扫光白名单②；不归零，压黑层接管）。交付修订：9575→9517 随 TOTAL 缩短
];
export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
