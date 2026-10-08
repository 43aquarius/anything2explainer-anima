import React from 'react';
import {clamp01} from '../../common';
import {ParcelIcon, abs, GREY, GREY_MID, WHITE, PURPLE_LIGHT, BLOOM_SOFT} from '../../ui';

/**
 * G6 组内图元（第 3 章中段：SC35–SC39）。
 * DirectoryHouse 为 SC39 的 /data/app 目录屋 —— G7/SC48「承接 SC39 同款」请按此几何复制
 * （屋体 x,y,w,h + roof + 三层两列文件架 + 目标槽 = 第 2 行左；邻居 = 5 枚灰暗小包裹）。
 */

/** 建筑柱式（= 中心证书机构 CA 的隐喻）：山墙三角 + 檐线 + 四柱 + 台基；p 0–1 自左向右 wipe 显影（clipPath）。 */
export const PillarIcon: React.FC<{cx: number; cy: number; w?: number; h?: number; p?: number; color?: string; opacity?: number}> = ({cx, cy, w = 150, h = 105, p = 1, color = GREY, opacity = 1}) => {
  const cols = [0.16, 0.387, 0.613, 0.84];
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <defs>
          <clipPath id="g6-pillar-wipe">
            <rect x={0} y={0} width={w * clamp01(p)} height={h} />
          </clipPath>
        </defs>
        <g clipPath="url(#g6-pillar-wipe)" stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round">
          {/* 山墙 + 檐口 */}
          <path d={`M${w * 0.04},${h * 0.32} L${w / 2},${h * 0.05} L${w * 0.96},${h * 0.32} Z`} />
          <line x1={w * 0.02} y1={h * 0.38} x2={w * 0.98} y2={h * 0.38} />
          {/* 四柱（柱头/柱脚小横线） */}
          {cols.map((t, i) => (
            <g key={i}>
              <line x1={w * t} y1={h * 0.46} x2={w * t} y2={h * 0.84} />
              <line x1={w * t - 7} y1={h * 0.46} x2={w * t + 7} y2={h * 0.46} />
              <line x1={w * t - 7} y1={h * 0.84} x2={w * t + 7} y2={h * 0.84} />
            </g>
          ))}
          {/* 台基 */}
          <line x1={w * 0.06} y1={h * 0.95} x2={w * 0.94} y2={h * 0.95} strokeWidth={4} />
        </g>
      </svg>
    </div>
  );
};

/**
 * 目录屋（= /data/app）：三角屋顶 + 白边屋体 + 三层两列文件架（2×3 槽）。
 * 邻居 app = 5 枚灰暗小包裹（其他 app 也住这里，静态配角不发光）；目标槽 = 第 2 行左列（入位格）。
 * slotK 0–1：目标槽紫光（描边 draw-on stroke-dashoffset + 紫底 + 事件光斑）。屋顶/屋体白描边黑填充。
 */
export const DirectoryHouse: React.FC<{x: number; y: number; w?: number; h?: number; roof?: number; slotK?: number; opacity?: number}> = ({x, y, w = 340, h = 210, roof = 72, slotK = 0, opacity = 1}) => {
  const shelf1 = roof + h / 3;
  const shelf2 = roof + (2 * h) / 3;
  const leftC = (15 + w / 2 - 10) / 2; // 左列中心（槽 x 15 … w/2−10）
  const rightC = (w / 2 + 10 + w - 15) / 2; // 右列中心
  // 邻居小包裹（5 格）：上排左右 / 中排右 / 下排左右
  const neighbors: Array<[number, number]> = [
    [leftC, roof + 16 + (shelf1 - roof - 32) / 2],
    [rightC, roof + 16 + (shelf1 - roof - 32) / 2],
    [rightC, (shelf1 + shelf2) / 2],
    [leftC, (shelf2 + roof + h) / 2],
    [rightC, (shelf2 + roof + h) / 2],
  ];
  const slot = {x: 15, y: shelf1 + 6, w: w / 2 - 25, h: h / 3 - 12};
  const per = 2 * (slot.w + slot.h);
  const k = clamp01(slotK);
  return (
    <div style={{...abs(x, y - roof, w, h + roof), opacity}}>
      <svg width={w} height={h + roof} viewBox={`0 0 ${w} ${h + roof}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        {/* 屋体 + 屋顶（白描边黑填充；屋檐略外挑） */}
        <path d={`M0,${roof} H${w} V${roof + h} H0 Z`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M-22,${roof} L${w / 2},2 L${w + 22},${roof}`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        {/* 三层文件架：两条横搁板 + 中列隔板 */}
        <line x1={6} y1={shelf1} x2={w - 6} y2={shelf1} stroke={GREY_MID} strokeWidth={2} />
        <line x1={6} y1={shelf2} x2={w - 6} y2={shelf2} stroke={GREY_MID} strokeWidth={2} />
        <line x1={w / 2} y1={roof + 10} x2={w / 2} y2={roof + h - 10} stroke={GREY_MID} strokeWidth={2} />
        {/* 目标槽（第 2 行左）：紫底 + 描边 draw-on（dashoffset） */}
        {k > 0 ? (
          <>
            <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} fill="rgba(102,48,248,0.16)" stroke="none" />
            <rect
              x={slot.x}
              y={slot.y}
              width={slot.w}
              height={slot.h}
              fill="none"
              stroke={PURPLE_LIGHT}
              strokeWidth={2.5}
              strokeDasharray={per}
              strokeDashoffset={per * (1 - clamp01((k - 0.15) / 0.5))}
            />
          </>
        ) : null}
      </svg>
      {/* 邻居 app 小包裹（灰暗配角，不发光） */}
      {neighbors.map(([nx, ny], i) => (
        <ParcelIcon key={i} cx={nx} cy={ny} w={58} h={42} color={GREY} label={''} opacity={0.5} />
      ))}
    </div>
  );
};
