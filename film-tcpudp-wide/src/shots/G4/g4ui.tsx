import React from 'react';
import {clamp01} from '../../common';
import {abs, BLOOM_SOFT, GREY_LINE, GREY_LIGHT, WHITE} from '../../ui';

/**
 * G4 组内共用小图元（组目录 g4ui.tsx，规则：组内特有的放这里，不改 ui.tsx）。
 * SC20「代价」与 SC21「不能拨号」共用同一枚电话，保证两镜语境一致。
 */

/** 老式拨号电话（"先拨号 / 不能拨号"母题）：听筒弧 + 双耳胶囊 + 梯形机身 + 拨号盘（6 指孔）。viewBox 100×96。 */
export const PhoneGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; color?: string}> = ({cx, cy, w = 130, opacity = 1, color = WHITE}) => {
  const h = w * 0.96;
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 100 96" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT}}>
        {/* 听筒：双耳胶囊 + 弧带 */}
        <rect x="4" y="17" width="18" height="31" rx="9" fill="#000" stroke={color} strokeWidth="3" />
        <rect x="78" y="17" width="18" height="31" rx="9" fill="#000" stroke={color} strokeWidth="3" />
        <path d="M12 31 Q50 3 88 31" fill="none" stroke={color} strokeWidth="4" />
        {/* 机身（梯形） */}
        <path d="M21 54 L79 54 L88 90 L12 90 Z" fill="#000" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        {/* 拨号盘 + 6 指孔 */}
        <circle cx="50" cy="72" r="14.5" fill="#000" stroke={color} strokeWidth="2.5" />
        {Array.from({length: 6}, (_, i) => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={50 + Math.cos(a) * 8.5} cy={72 + Math.sin(a) * 8.5} r="1.9" fill={color} />;
        })}
      </svg>
    </div>
  );
};

/** 账本（"记住一切"代价）：封皮 + 书脊缝线 + 8 条记录线（lit 为已点亮条数，可为小数 = 该条 draw-on 进度）。viewBox 110×130。 */
export const LedgerGlyph: React.FC<{cx: number; cy: number; w?: number; lit?: number; opacity?: number; color?: string}> = ({cx, cy, w = 110, lit = 0, opacity = 1, color = WHITE}) => {
  const h = w * (130 / 110);
  const lens = [0.86, 0.95, 0.9, 1, 0.88, 0.97, 0.92, 1]; // 记录行长度（固定，非随机）
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 110 130" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT}}>
        <rect x="5" y="5" width="100" height="120" rx="5" fill="#000" stroke={color} strokeWidth="3" />
        <line x1="26" y1="6" x2="26" y2="124" stroke={color} strokeWidth="2" />
        {[30, 65, 100].map((y) => (
          <line key={y} x1="18" y1={y} x2="34" y2={y} stroke={color} strokeWidth="2" />
        ))}
        {lens.map((len, i) => {
          const y = 17 + i * 14;
          const p = clamp01(lit - i);
          if (p <= 0) return <line key={i} x1="36" y1={y} x2="98" y2={y} stroke={GREY_LINE} strokeWidth="2" opacity="0.55" />;
          return <line key={i} x1="36" y1={y} x2={36 + 62 * len * p} y2={y} stroke={GREY_LIGHT} strokeWidth="2.6" opacity="0.95" strokeLinecap="round" />;
        })}
      </svg>
    </div>
  );
};
