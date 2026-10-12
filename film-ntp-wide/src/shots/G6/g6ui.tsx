import React from 'react';
import {clamp01} from '../../common';
import {GREY_MID, abs} from '../../ui';

/**
 * G6 组内共用小图元（不改 ui.tsx；风格：白描边 2–3px + 黑填充）。
 * WorldDots = 世界点阵简图（CDN G2/SC05 的大陆轮廓模式，改为方点阵成大陆形）：
 *   六块大陆轮廓多边形 → 模块加载时一次性格点（28px 栅格、确定性），SC13 满幅 / SC14 缩微复用同一份点集
 *   （跨镜视觉连续：分镜表「2953 右半世界点阵缩微复现（SC13 承接）」）。
 */

/** 大陆轮廓（canonical 900×390 地图坐标系，手绘低多边形，风格对齐 CDN WorldMap 的两块大陆） */
export const WORLD_POLYS: Array<Array<[number, number]>> = [
  // 北美
  [[62, 42], [150, 26], [240, 30], [300, 52], [318, 96], [286, 128], [228, 140], [168, 132], [108, 112], [70, 84]],
  // 南美
  [[208, 168], [268, 158], [300, 190], [296, 244], [262, 300], [228, 290], [204, 232]],
  // 欧洲
  [[398, 58], [478, 44], [502, 88], [462, 116], [408, 108]],
  // 非洲
  [[408, 142], [492, 136], [514, 208], [478, 282], [426, 272], [398, 204]],
  // 亚洲
  [[516, 44], [640, 26], [756, 34], [796, 92], [742, 148], [652, 166], [566, 128], [520, 88]],
  // 东南亚群岛 + 大洋洲
  [[694, 232], [764, 226], [788, 268], [752, 308], [700, 286]],
];

const inPoly = (x: number, y: number, poly: Array<[number, number]>): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** 28px 栅格方点阵（模块级一次算好，纯确定性） */
export const WORLD_DOTS: Array<[number, number]> = (() => {
  const dots: Array<[number, number]> = [];
  const P = 28;
  for (const poly of WORLD_POLYS) {
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    const x0 = Math.ceil(Math.min(...xs) / P) * P;
    const x1 = Math.max(...xs);
    const y0 = Math.ceil(Math.min(...ys) / P) * P;
    const y1 = Math.max(...ys);
    for (let y = y0; y <= y1; y += P) {
      for (let x = x0; x <= x1; x += P) {
        if (inPoly(x, y, poly)) dots.push([x, y]);
      }
    }
  }
  return dots;
})();

/** 地图坐标 → 画布坐标：full = SC13 满幅（820×332，中心 ~(640,428)）；mini = SC14 右半缩微 */
export type MapMode = 'full' | 'mini';
const XFORM: Record<MapMode, {x0: number; y0: number; s: number}> = {
  full: {x0: 257, y0: 262, s: 0.85},
  mini: {x0: 690, y0: 148, s: 0.38},
};
export const wpt = (mode: MapMode, c: [number, number]): [number, number] => {
  const t = XFORM[mode];
  return [t.x0 + c[0] * t.s, t.y0 + c[1] * t.s];
};

/** 服务器定位点（canonical；SC13 世界图的 10 枚 RackIcon 微型，分 4 波按地域点亮） */
export const RACKS: Array<{c: [number, number]; w: number}> = [
  {c: [126, 78], w: 0},  // 北美西
  {c: [250, 62], w: 0},  // 北美东
  {c: [448, 78], w: 0},  // 欧洲
  {c: [252, 224], w: 1}, // 南美
  {c: [444, 194], w: 1}, // 非洲西
  {c: [470, 242], w: 1}, // 非洲南
  {c: [586, 84], w: 2},  // 亚洲中
  {c: [664, 98], w: 2},  // 亚洲东
  {c: [744, 70], w: 3},  // 亚洲东北
  {c: [744, 268], w: 3}, // 大洋洲
];

/**
 * 世界点阵图（方点 ≥6px；revealP 0→1 为左→右扫描显现，每点带确定性微抖动）。
 * dotPx 为**屏幕**像素（内部换算 canonical 尺寸，缩微图点仍 ≥6px）。
 */
export const WorldDots: React.FC<{mode: MapMode; revealP: number; opacity?: number; color?: string; dotPx?: number; dimK?: number}> = ({mode, revealP, opacity = 1, color = GREY_MID, dotPx = 6}) => {
  const t = XFORM[mode];
  const d = dotPx / t.s;
  const span = 1.04 * clamp01(revealP);
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity}}>
      {WORLD_DOTS.map(([cx, cy], i) => {
        // 左→右扫描显现 + 每点 ±2.5% 抖动（rnd 确定性）
        const u = cx / 900 + (((i * 137) % 50) / 1000 - 0.025);
        const k = clamp01((span - u) * 18);
        if (k <= 0.02) return null;
        const x = t.x0 + cx * t.s;
        const y = t.y0 + cy * t.s;
        return <rect key={i} x={(x - d / 2).toFixed(1)} y={(y - d / 2).toFixed(1)} width={d.toFixed(1)} height={d.toFixed(1)} fill={color} opacity={(0.78 * k).toFixed(3)} />;
      })}
    </svg>
  );
};
