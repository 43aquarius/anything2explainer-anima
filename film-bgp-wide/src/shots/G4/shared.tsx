import React from 'react';
import {clamp01, easeOutCubic, FONT_ORB} from '../../common';
import {AsChip, CText, EXAMPLE, GREY, GREY_LINE, GREY_MID, WHITE, abs, mixHex, softOp} from '../../ui';

/**
 * G4 共用（第 3 章上：S14–S19，1997 说谎 → 2008 更具体者胜）。
 * 原 shared.tsx 是 CDN 片模板残留（BEATS/G4Shelf/CacheShelf），已整体替换为 BGP 版。
 * - BEATS：S14–S19 字幕块起始帧（以 common/subs.ts 实测块界为准；分镜表 SC10 节拍列少列了 2442「went with it」块，此处补齐）
 * - YearRoll：年份滚落（CDN 片同款：全程 blur 9px、14 帧落定、自上 18px 坠感）——SC09 `1997` / SC10 `2008`
 * - RingMini：SC08 芯片环缩微（章首承接；几何常量与 SC08.tsx 逐参数一致 → 组界帧同形）
 * - MiniNote：贴到芯片上的缩微纸条（SC09「互联网信了」）。无字符号件——RouteNote 内置 26px 前缀文本缩到 <200px 宽时
 *   会低于 22px 最小字号（VLM 会判 too small），故用折角卡 + 内容线纹理代替文字；全片"纸条=宣告"母题不受影响
 *   （SC06 已用全尺寸可读纸条建立过该母题）。
 * - QuadArrow / quadPt：二次贝塞尔弧箭头（draw-on + 箭头随切线转角）——SC10 流量群折向与汇流箭头共用。
 */

/** 字幕块起始帧（= 各镜头节拍的权威帧号；元素入场 −6…+3 对齐这里） */
export const BEATS = {
  S14: [1960],
  S15: [2015, 2057, 2106],
  S16: [2150, 2197],
  S17: [2263, 2295],
  S18: [2363, 2397, 2442],
  S19: [2473, 2557],
};

/** SC08 芯片环几何（缩微承接用；与 SC08.tsx 同参数） */
export const RING = {cx: 640, cy: 314, rx: 305, ry: 146};
export const RING_ASNS = [EXAMPLE.asnMid1, EXAMPLE.asnMid2, EXAMPLE.asnMid3, EXAMPLE.asnSide, EXAMPLE.asnFb];
export const ringXY = (i: number): [number, number] => {
  const a = ((15 + 30 * i) * Math.PI) / 180;
  return [RING.cx + RING.rx * Math.cos(a), RING.cy + RING.ry * Math.sin(a)];
};

/** 二次贝塞尔取点 */
export const quadPt = (t: number, p0: [number, number], c: [number, number], p1: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};

/** 年份滚动落定：Orbitron 灰、滚落期 blur 9px、len 帧落定（CDN g5ui 同款模板） */
export const YearRoll: React.FC<{
  N: number; f0: number; cx: number; cy: number; size?: number; from: number; to: number; len?: number; shadow?: string; opacity?: number;
}> = ({N, f0, cx, cy, size = 96, from, to, len = 14, shadow, opacity = 1}) => {
  const n = N - f0;
  if (n < 0) return null;
  const roll = clamp01(n / len);
  const year = Math.round(from + (to - from) * roll);
  const text = roll < 1 ? String(year) : String(to);
  const dy = -18 * Math.pow(1 - roll, 2);
  return (
    <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 4) * opacity}}>
      <CText cx={cx} cy={cy + dy} size={size} weight={700} family={FONT_ORB} color="#D4D4D4" letterSpacing={2} shadow={shadow}
        style={{filter: roll < 1 ? 'blur(9px)' : undefined, fontVariantNumeric: 'tabular-nums'}}>
        {text}
      </CText>
    </div>
  );
};

/** SC08 芯片环缩微（屏幕空间承接件，不随运镜）：外层 transform 由镜头按 kf 计算（k=0 全尺寸原位 → k=1 缩到角落） */
export const RingMini: React.FC<{k: number; tx: number; ty: number; scale: number; opacity?: number}> = ({k, tx, ty, scale, opacity = 1}) => {
  if (k <= 0) return null;
  return (
    <div style={{...abs(0, 0, 1280, 720), opacity, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${scale.toFixed(4)})`, transformOrigin: '640px 314px'}}>
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <ellipse cx={RING.cx} cy={RING.cy} rx={RING.rx} ry={RING.ry} fill="none" stroke={GREY_LINE} strokeWidth={1.5} strokeDasharray="5 9" opacity={0.45} />
        </svg>
        {Array.from({length: 12}, (_, i) => {
          const [x, y] = ringXY(i);
          return (
            <div key={i} style={{...abs(x - 30, y - 30, 60, 60)}}>
              <AsChip cx={30} cy={30} w={60} h={60} asn={RING_ASNS[i % 5]} led="off" labelSize={16} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 贴芯片缩微纸条（无字符号件）：折角卡 + 两道内容线；dim 0→1 渐进灰化（熄灭区） */
export const MiniNote: React.FC<{cx: number; cy: number; opacity?: number; dim?: number; rot?: number}> = ({cx, cy, opacity = 1, dim = 0, rot = 0}) => {
  const stroke = dim > 0.01 ? mixHex(WHITE, GREY_MID, dim) : WHITE;
  return (
    <div style={{...abs(cx - 39, cy - 25, 78, 50), opacity, transform: `rotate(${rot.toFixed(1)}deg)`, filter: dim > 0.01 ? 'none' : 'drop-shadow(0 0 2px rgba(255,255,255,.3))'}}>
      <svg width={78} height={50} viewBox="0 0 78 50" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M6 2 L58 2 L76 20 L76 44 Q76 48 72 48 L6 48 Q2 48 2 44 L2 6 Q2 2 6 2 Z" fill="#000" stroke={stroke} strokeWidth={2} />
        <path d="M58 2 L58 20 L76 20" fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <line x1={10} y1={20} x2={52} y2={20} stroke={dim > 0.01 ? mixHex(GREY, GREY_LINE, dim) : GREY} strokeWidth={2.4} opacity={0.75} />
        <line x1={10} y1={30} x2={44} y2={30} stroke={dim > 0.01 ? mixHex(GREY, GREY_LINE, dim) : GREY} strokeWidth={2.4} opacity={0.55} />
      </svg>
    </div>
  );
};

/** 弧线箭头：p 为生长进度（draw-on 自根部长出，头随切线；p≥1 完整）。头在 draw-on 期间骑在生长尖端。 */
export const QuadArrow: React.FC<{
  p0: [number, number]; c: [number, number]; p1: [number, number]; p: number; color?: string; rodW?: number;
  headL?: number; headW?: number; opacity?: number; glow?: string; head?: boolean;
}> = ({p0, c, p1, p, color = WHITE, rodW = 2.5, headL = 14, headW = 13, opacity = 1, glow, head = true}) => {
  const k = clamp01(p);
  if (k <= 0.001) return null;
  const d = `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
  const tipT = Math.max(0.03, k);
  const [hx, hy] = quadPt(tipT, p0, c, p1);
  const [bx, by] = quadPt(Math.max(0, tipT - 0.04), p0, c, p1);
  const ang = (Math.atan2(hy - by, hx - bx) * 180) / Math.PI;
  const headK = clamp01((k - 0.55) / 0.25); // 头在杆长到 55% 后长出
  return (
    <g opacity={opacity.toFixed(3)} filter={glow}>
      <path d={d} fill="none" stroke={color} strokeWidth={rodW} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - k)} />
      {head ? (
        <polygon
          points={`${hx.toFixed(1)},${hy.toFixed(1)} ${(hx - headL * Math.cos((ang * Math.PI) / 180) + (headW / 2) * Math.sin((ang * Math.PI) / 180)).toFixed(1)},${(hy - headL * Math.sin((ang * Math.PI) / 180) - (headW / 2) * Math.cos((ang * Math.PI) / 180)).toFixed(1)} ${(hx - headL * Math.cos((ang * Math.PI) / 180) - (headW / 2) * Math.sin((ang * Math.PI) / 180)).toFixed(1)},${(hy - headL * Math.sin((ang * Math.PI) / 180) + (headW / 2) * Math.cos((ang * Math.PI) / 180)).toFixed(1)}`}
          fill={color} opacity={headK.toFixed(3)}
        />
      ) : null}
    </g>
  );
};

/** 缩放入场进度（SC09 芯片 / ? 弹出共用） */
export const popIn = (n: number, len = 8) => 0.3 + 0.7 * easeOutCubic(clamp01(n / len));
