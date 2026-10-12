import React from 'react';
import {clamp01, easeOutCubic, FONT_TECH, rnd} from '../../common';
import {BLOOM_SOFT, GREY, GREY_MID, GREY_LIGHT, PURPLE_LIGHT, WHITE, abs} from '../../ui';

/**
 * G3 共用（第 3 章：S13–S20，公寓拥挤 → 信道 1/6/11 → 隐藏节点 → 先报名）。
 * ⚠ ui.tsx 仍是 CDN 模板残留（无 WiFi 图元）——本文件就是本片专用图元的 G3 实现版，
 *   API 已按"可整体提升进 ui.tsx"的粒度写好（纯展示组件 + 调用方算状态），建议主会话验收后提升。
 * - BEATS：S13–S20 字幕块起始帧（common/subs.ts 实测块界 = 权威节拍；分镜表 SC09 节拍列是旧集，已按 timeline 对齐，见 BUILD_NOTES）
 * - WEXAMPLE：本片示例语境（分镜表「全局约束 §2」；ui.tsx EXAMPLE 是 CDN 残留，勿用）
 * - AirPulse：信号弧（wifi 发声母题）——从源点向 rot 方向反复外扩的同心弧
 * - RouterGlyph：路由器（机盒 + 双天线 + LED；ledColor/ledK 由调用方按节拍驱动）
 * - DeviceGlyph：设备（laptop/phone/tv；speaking=紫光+顶弧 / ear=听态 / dim=灰化）
 * - ChannelBand：2.4 GHz 频谱带（11 峰 + 重叠虚线弧帽 + 1/6/11 绿框；SC07/SC08 主角）
 * - NoiseFlower：噪声花（撞车毛刺爆开，SC09 高光动作）
 * - MicGlyph：话筒（"发言权"信物，SC10）
 * - WallGlyph：墙体剖面（隐藏节点的遮挡物；draw-on + 斜线填充）
 * - STAGE + stageMini：SC09 舞台几何 + SC10 缩微变换（承接镜头末帧/首帧逐元素对齐用）
 * - MannersMini：SC06 礼貌卡缩微（章首承接；G2 未建，此为简化符号版，几何待 G2 落成后对齐）
 * - ShrugMini：耸肩小人（SC08 "like it or not"）
 * - quadPt：二次贝塞尔取点
 */

/** 字幕块起始帧（= 各镜头节拍的权威帧号；元素入场 −6…+3 对齐这里） */
export const BEATS = {
  S13: [1372, 1415],
  S14: [1466, 1531, 1601],
  S15: [1671, 1719],
  S16: [1753],
  S17: [1802, 1863],
  S18: [1921, 1960],
  S19: [2002, 2030],
  S20: [2086, 2156],
};

/** 本片示例语境（分镜表「全局约束 §2」；全片唯一一套） */
export const WEXAMPLE = {
  laptop: 'your laptop',
  phone: 'your phone',
  tv: 'your TV',
  router: 'the router',
  netA: 'net A',
  netB: 'net B',
  you: 'you',
  neighbors: 'neighbors',
  band: '2.4 GHz',
  ch1: '1', ch6: '6', ch11: '11',
  crowded: 'crowded',
  onlyThree: `only three don't overlap`,
  shared: 'shared, like it or not',
  trap: 'a trickier trap',
  neitherHeard: 'neither is heard',
  announce: 'announce first',
  request: 'request',
  reply: 'reply',
  floor: 'the floor is theirs',
};

/** 二次贝塞尔取点 */
export const quadPt = (t: number, p0: [number, number], c: [number, number], p1: [number, number]): [number, number] => {
  const u = 1 - clamp01(t);
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};

// ---------------- 信号弧（wifi 发声母题） ----------------
/** 从 (cx,cy) 向 rot°（-90=上）反复外扩的同心弧波。N/f0 驱动；低幅循环即"在说话"。 */
export const AirPulse: React.FC<{
  cx: number; cy: number; N: number; f0: number; rot?: number; waves?: number; speed?: number;
  maxR?: number; minR?: number; span?: number; color?: string; sw?: number; opacity?: number; dim?: number;
}> = ({cx, cy, N, f0, rot = -90, waves = 2, speed = 24, maxR = 90, minR = 14, span = 74, color = WHITE, sw = 2.5, opacity = 1, dim = 0}) => {
  if (N < f0 || opacity <= 0.01) return null;
  const a0 = ((rot - span / 2) * Math.PI) / 180;
  const a1 = ((rot + span / 2) * Math.PI) / 180;
  const stroke = dim > 0.01 ? mixHex_(color, GREY_MID, dim) : color;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: (opacity * (1 - 0.35 * dim)).toFixed(3)}}>
      <g stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round">
        {Array.from({length: waves}, (_, i) => {
          const u = (((N - f0) / speed) + i / waves + 0.18) % 1;
          const r = minR + (maxR - minR) * (1 - Math.pow(1 - u, 2));
          const op = Math.pow(1 - u, 1.15) * 0.9;
          return (
            <path key={i} d={`M${(cx + Math.cos(a0) * r).toFixed(1)},${(cy + Math.sin(a0) * r).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 ${(span > 180 ? 1 : 0)} 1 ${(cx + Math.cos(a1) * r).toFixed(1)},${(cy + Math.sin(a1) * r).toFixed(1)}`}
              opacity={op.toFixed(3)} />
          );
        })}
      </g>
    </svg>
  );
};

const mixHex_ = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const t = clamp01(k);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

// ---------------- 路由器 ----------------
/** 机盒 + V 形双天线 + LED（ledColor/ledK 由调用方驱动；dim 灰化） */
export const RouterGlyph: React.FC<{
  cx: number; cy: number; s?: number; N?: number; dim?: number; opacity?: number;
  ledColor?: string; ledK?: number; glow?: boolean; label?: string; labelSize?: number;
}> = ({cx, cy, s = 1, dim = 0, opacity = 1, ledColor = '#8FF740', ledK = 1, glow = false, label, labelSize = 24}) => {
  const st = dim > 0.01 ? mixHex_('#FFFFFF', GREY_MID, dim) : WHITE;
  const W = 132 * s, H = 118 * s;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2 - 10 * s, W, H + 26 * s), opacity}}>
      <svg width={W} height={H} viewBox="0 0 132 118" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow ? BLOOM_SOFT : 'none'}}>
        <g stroke={st} strokeWidth={3} fill="#000" strokeLinejoin="round" strokeLinecap="round">
          <line x1={26} y1={40} x2={10} y2={4} />
          <line x1={106} y1={40} x2={122} y2={4} />
          <circle cx={10} cy={4} r={3.4} fill={st} stroke="none" />
          <circle cx={122} cy={4} r={3.4} fill={st} stroke="none" />
          <rect x={8} y={40} width={116} height={56} rx={8} />
          <line x1={22} y1={56} x2={40} y2={56} strokeWidth={2.4} opacity={0.75} />
          <line x1={22} y1={66} x2={40} y2={66} strokeWidth={2.4} opacity={0.75} />
          <line x1={22} y1={76} x2={40} y2={76} strokeWidth={2.4} opacity={0.75} />
        </g>
        <circle cx={100} cy={68} r={6.5} fill={ledColor} opacity={clamp01(ledK).toFixed(3)}
          style={{filter: `drop-shadow(0 0 ${Math.round(7 * clamp01(ledK))}px ${ledColor})`}} />
      </svg>
      {label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: H + 5 * s, textAlign: 'center', fontFamily: FONT_TECH, fontSize: labelSize, color: dim > 0.4 ? GREY_MID : GREY}}>{label}</div>
      ) : null}
    </div>
  );
};

// ---------------- 设备（笔记本 / 手机 / 电视） ----------------
/** speaking 0..1：紫光 + 顶部发声弧（N 驱动）；ear 0..1：听态耳标；dim：灰化 */
export const DeviceGlyph: React.FC<{
  cx: number; cy: number; kind?: 'laptop' | 'phone' | 'tv'; s?: number; N?: number;
  speaking?: number; ear?: number; dim?: number; opacity?: number; label?: string; labelSize?: number;
}> = ({cx, cy, kind = 'laptop', s = 1, N = 0, speaking = 0, ear = 0, dim = 0, opacity = 1, label, labelSize = 24}) => {
  const st = dim > 0.01 ? mixHex_('#FFFFFF', GREY_MID, dim * 0.85) : WHITE;
  const spK = clamp01(speaking);
  const body = {laptop: {w: 108, h: 74}, phone: {w: 46, h: 78}, tv: {w: 122, h: 88}}[kind];
  const W = body.w * s, H = body.h * s;
  const glowSh = spK > 0.02 ? `drop-shadow(0 0 ${Math.round(10 * spK)}px rgba(102,48,248,${(0.55 * spK).toFixed(2)}))` : undefined;
  return (
    <div style={{...abs(cx - W / 2 - 16 * s, cy - H / 2 - 30 * s, W + 32 * s, H + 30 * s + (label ? 30 * s : 0)), opacity}}>
      <svg width={W + 32 * s} height={H + 30 * s} viewBox={`0 0 ${body.w + 32} ${body.h + 30}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glowSh ?? 'none'}}>
        {/* 顶部发声弧（speaking 时；设备顶边上方） */}
        {spK > 0.02 ? (
          <g stroke={PURPLE_LIGHT} strokeWidth={3} fill="none" strokeLinecap="round">
            {[0, 1].map((i) => {
              const u = (N / 16 + i * 0.5) % 1;
              const r = 9 + 17 * (1 - Math.pow(1 - u, 2));
              const dx = 0.4794 * r, dy = 0.8776 * r;
              const bx0 = body.w / 2 + 16;
              return <path key={i} d={`M${(bx0 - dx).toFixed(1)},${(26 - dy).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(bx0 + dx).toFixed(1)},${(26 - dy).toFixed(1)}`} opacity={(Math.pow(1 - u, 1.1) * spK).toFixed(2)} />;
            })}
          </g>
        ) : null}
        <g stroke={st} strokeWidth={2.6} fill="#000" strokeLinejoin="round" strokeLinecap="round" transform={`translate(16,30)`}>
          {kind === 'laptop' ? (
            <>
              <rect x={(body.w - 88) / 2} y={0} width={88} height={54} rx={4} />
              <path d={`M${(body.w - 104) / 2},74 L${(body.w - 42) / 2},60 L${(body.w + 42) / 2},60 L${(body.w + 104) / 2},74 Z`} />
              <line x1={body.w / 2 - 20} y1={67} x2={body.w / 2 + 20} y2={67} strokeWidth={2} opacity={0.7} />
            </>
          ) : null}
          {kind === 'phone' ? (
            <>
              <rect x={(body.w - 42) / 2} y={0} width={42} height={78} rx={8} />
              <line x1={body.w / 2 - 9} y1={68} x2={body.w / 2 + 9} y2={68} strokeWidth={2.4} />
            </>
          ) : null}
          {kind === 'tv' ? (
            <>
              <rect x={0} y={0} width={body.w} height={64} rx={5} />
              <line x1={body.w / 2 - 26} y1={64} x2={body.w / 2 - 34} y2={86} />
              <line x1={body.w / 2 + 26} y1={64} x2={body.w / 2 + 34} y2={86} />
              <line x1={body.w / 2 - 14} y1={74} x2={body.w / 2 + 14} y2={74} strokeWidth={2.2} opacity={0.75} />
            </>
          ) : null}
        </g>
        {/* 听态耳标（右上角小耳朵） */}
        {ear > 0.02 ? (
          <g transform={`translate(${body.w + 22},26)`} opacity={(0.95 * ear).toFixed(2)}>
            <path d="M-9,2 A9 9 0 0 1 9,2" fill="none" stroke={GREY_LIGHT} strokeWidth={2.4} strokeLinecap="round" />
            <path d="M-4.5,1 A4.5 4.5 0 0 1 4.5,1" fill="none" stroke={GREY_LIGHT} strokeWidth={2.2} strokeLinecap="round" />
            <path d="M0,-6 L0,-12" stroke={GREY_LIGHT} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
      {label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: H + 30 * s + 4 * s, textAlign: 'center', fontFamily: FONT_TECH, fontSize: labelSize, color: dim > 0.4 ? GREY_MID : GREY}}>{label}</div>
      ) : null}
    </div>
  );
};

// ---------------- 2.4 GHz 频谱带（SC07/SC08 主角） ----------------
type BandProps = {
  cx: number; baseY: number; s?: number;
  /** 11 个峰的 draw-on 进度（0..1；默认全 1） */
  peakP?: number[];
  /** 信道 1 / 6 / 11 绿框 draw-on 进度 */
  greenP?: [number, number, number];
  /** 非绿峰灰化 0..1 */
  greyK?: number;
  /** 重叠虚线弧帽 0..1 */
  overlapK?: number;
  /** '2.4 GHz' 标签透明度 */
  labelOp?: number;
  /** 呼吸幅度 0..1（低幅：峰高 ±2.5%） */
  breathK?: number;
  N?: number;
  /** 绿框柔光强度（配 glowOffK） */
  glowK?: number;
  opacity?: number;
};
const BW = 880;          // 带宽（局部单位）
const BH = 118;          // 峰高
const PADX = 80;
const TOPY = 78;         // 峰顶上方留白（绿框头空间）
const CH = [1, 6, 11];   // 不重叠三信道
const chX = (i: number) => PADX + (i - 0.5) * (BW / 11); // i = 1..11

export const ChannelBand: React.FC<BandProps> = ({cx, baseY, s = 1, peakP, greenP = [0, 0, 0], greyK = 0, overlapK = 0, labelOp = 0, breathK = 0, N = 0, glowK = 1, opacity = 1}) => {
  const pp = peakP ?? Array.from({length: 11}, () => 1);
  const W = BW + PADX * 2, H = TOPY + BH + 118;
  const by = TOPY + BH; // 局部基线
  const breathe = 1 + 0.025 * clamp01(breathK) * Math.sin((2 * Math.PI * N) / 42);
  const x0 = cx - (W / 2) * s, y0 = baseY - by * s;
  return (
    <div style={{...abs(x0, y0, W * s, H * s), opacity}}>
      <svg width={W * s} height={H * s} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* 重叠虚线弧帽（侧瓣展开 → 与邻峰交叠） */}
        {overlapK > 0.01 ? (
          <g fill="none" stroke={GREY_MID} strokeWidth={1.8} strokeDasharray="6 7" opacity={(0.75 * overlapK).toFixed(3)}>
            {Array.from({length: 11}, (_, i) => (
              <path key={`cap-${i}`} d={`M${chX(i + 1) - 68},${by} Q${chX(i + 1) - 42},${by - 58} ${chX(i + 1)},${by - 62} Q${chX(i + 1) + 42},${by - 58} ${chX(i + 1) + 68},${by}`} />
            ))}
          </g>
        ) : null}
        {/* 基线 */}
        <line x1={PADX - 26} y1={by} x2={W - PADX + 26} y2={by} stroke={GREY_LIGHT} strokeWidth={2.4} opacity={0.95} />
        <line x1={PADX - 26} y1={by} x2={PADX - 26} y2={by + 8} stroke={GREY_LIGHT} strokeWidth={2.4} />
        <line x1={W - PADX + 26} y1={by} x2={W - PADX + 26} y2={by + 8} stroke={GREY_LIGHT} strokeWidth={2.4} />
        {/* 11 峰 */}
        {Array.from({length: 11}, (_, i) => {
          const p = clamp01(pp[i]);
          if (p <= 0.001) return null;
          const green = CH.includes(i + 1);
          const gk = green ? 0 : clamp01(greyK);
          const x = chX(i + 1);
          const h = BH * breathe;
          const d = `M${x - 54},${by} Q${x - 33.5},${by - h * 0.78} ${x},${by - h} Q${x + 33.5},${by - h * 0.78} ${x + 54},${by}`;
          const stroke = gk > 0.5 ? GREY_MID : WHITE;
          const fillOp = green ? 0.10 : gk > 0.5 ? 0.02 : 0.05;
          return (
            <path key={`pk-${i}`} d={d} fill={`rgba(255,255,255,${fillOp})`} stroke={stroke} strokeWidth={green ? 3.2 : 2.8}
              pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} strokeLinecap="round" />
          );
        })}
        {/* 1 / 6 / 11 绿框（先后 draw-on） */}
        {CH.map((c, k) => {
          const p = clamp01(greenP[k]);
          if (p <= 0.001) return null;
          const x = chX(c);
          const g = clamp01(glowK);
          return (
            <rect key={`gf-${c}`} x={x - 64} y={TOPY + 4} width={128} height={by - TOPY + 8} rx={12} fill="none"
              stroke="#8FF740" strokeWidth={3.6} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)}
              style={{filter: g > 0.03 ? `drop-shadow(0 0 ${Math.round(8 * g)}px rgba(143,247,64,${(0.5 * g).toFixed(2)}))` : undefined}} />
          );
        })}
        {/* 信道号 */}
        {Array.from({length: 11}, (_, i) => {
          const green = CH.includes(i + 1) && clamp01(greenP[CH.indexOf(i + 1)]) > 0.5;
          const gk = !CH.includes(i + 1) ? clamp01(greyK) : 0;
          return (
            <text key={`no-${i}`} x={chX(i + 1)} y={by + 34} textAnchor="middle" fontFamily="'Orbitron','Audiowide',sans-serif"
              fontSize={26} fontWeight={600} fill={green ? '#8FF740' : gk > 0.5 ? GREY_MID : GREY_LIGHT} opacity={green ? 1 : 0.95}>{i + 1}</text>
          );
        })}
        {/* 2.4 GHz 标签 */}
        {labelOp > 0.01 ? (
          <text x={PADX + 2} y={by + 72} fontFamily="'Exo 2','Helvetica Neue',sans-serif" fontStyle="italic" fontWeight={600}
            fontSize={28} fill={GREY} opacity={clamp01(labelOp).toFixed(3)}>2.4 GHz</text>
        ) : null}
      </svg>
    </div>
  );
};

// ---------------- 噪声花（撞车毛刺） ----------------
/** 0–8f 毛刺放射爆开 → 12–26f 衰减归零；ember>0 时留 5 点余烬（低幅闪） */
export const NoiseFlower: React.FC<{
  cx: number; cy: number; N: number; f0: number; r0?: number; len?: number; spikes?: number;
  ember?: number; opacity?: number;
}> = ({cx, cy, N, f0, r0 = 14, len = 46, spikes = 14, ember = 0, opacity = 1}) => {
  const n = N - f0;
  if (n < 0 || opacity <= 0.01) return null;
  const grow = easeOutCubic(clamp01(n / 8));
  const decay = n < 12 ? 1 : clamp01(1 - (n - 12) / 14);
  if (decay <= 0 && ember <= 0.01) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: opacity.toFixed(3)}}>
      <g strokeLinecap="round">
        {Array.from({length: spikes}, (_, j) => {
          const a = (j / spikes) * Math.PI * 2 + rnd(j, 7) * 0.5;
          const jl = 0.55 + rnd(j, 3) * 0.75;
          const rs = r0 + 5 * rnd(j, 11);
          const re = rs + len * jl * grow;
          const flick = 0.55 + rnd(j, N & 1023) * 0.45; // 逐帧毛糙
          const col = j % 3 === 0 ? '#F16043' : '#F05F41';
          return <line key={j} x1={(cx + Math.cos(a) * rs).toFixed(1)} y1={(cy + Math.sin(a) * rs).toFixed(1)} x2={(cx + Math.cos(a) * re).toFixed(1)} y2={(cy + Math.sin(a) * re).toFixed(1)}
            stroke={col} strokeWidth={2.6} opacity={(decay * flick).toFixed(3)} />;
        })}
        {decay > 0 ? <circle cx={cx} cy={cy} r={r0 * grow} fill="none" stroke="#F05F41" strokeWidth={2.4} opacity={(0.8 * decay).toFixed(3)} /> : null}
        {ember > 0.01 ? (
          Array.from({length: 5}, (_, j) => {
            const a = (j / 5) * Math.PI * 2 + rnd(j, 21) * 2;
            const r = r0 + 10 + 26 * rnd(j, 5);
            return <circle key={`e-${j}`} cx={(cx + Math.cos(a) * r).toFixed(1)} cy={(cy + Math.sin(a) * r).toFixed(1)} r={2.2} fill="#F05F41"
              opacity={(ember * (0.35 + 0.3 * Math.sin(N / 2.6 + j))).toFixed(3)} />;
          })
        ) : null}
      </g>
    </svg>
  );
};

// ---------------- 话筒（"发言权"信物） ----------------
export const MicGlyph: React.FC<{cx: number; cy: number; s?: number; N?: number; glowK?: number; opacity?: number; tilt?: number}> = ({cx, cy, s = 1, N = 0, glowK = 1, opacity = 1, tilt = 0}) => {
  const g = clamp01(glowK);
  const W = 56 * s, H = 96 * s;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity, transform: tilt ? `rotate(${tilt.toFixed(1)}deg)` : undefined}}>
      <svg width={W} height={H} viewBox="0 0 56 96" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: g > 0.03 ? `drop-shadow(0 0 ${Math.round(9 * g)}px rgba(102,48,248,${(0.6 * g).toFixed(2)}))` : 'none'}}>
        <g stroke={WHITE} strokeWidth={2.6} fill="#000" strokeLinejoin="round" strokeLinecap="round">
          <rect x={15} y={2} width={26} height={44} rx={13} />
          <path d="M9,26 A19 22 0 0 0 47,26" fill="none" />
          <line x1={28} y1={48} x2={28} y2={76} />
          <line x1={12} y1={78} x2={44} y2={78} strokeWidth={3.4} />
          <line x1={22} y1={16} x2={34} y2={16} strokeWidth={2} opacity={0.6} />
          <line x1={22} y1={26} x2={34} y2={26} strokeWidth={2} opacity={0.6} />
        </g>
      </svg>
    </div>
  );
};

// ---------------- 墙体剖面（隐藏节点遮挡物） ----------------
export const WallGlyph: React.FC<{x0: number; x1: number; y0: number; y1: number; p?: number; hatchOp?: number; opacity?: number}> = ({x0, x1, y0, y1, p = 1, hatchOp = 1, opacity = 1}) => {
  const k = clamp01(p);
  if (k <= 0.001) return null;
  const h = (y1 - y0) * k;
  const rows = Math.floor((y1 - y0) / 26);
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: opacity.toFixed(3)}}>
      <g stroke={GREY} strokeWidth={3} strokeLinecap="round">
        <line x1={x0} y1={y0} x2={x0} y2={y0 + h} />
        <line x1={x1} y1={y0} x2={x1} y2={y0 + h} />
        <line x1={x0 - 6} y1={y0} x2={x1 + 6} y2={y0} strokeWidth={3.4} />
      </g>
      <g stroke={GREY_MID} strokeWidth={1.6} opacity={(0.6 * clamp01(hatchOp)).toFixed(3)} clipPath="none">
        {Array.from({length: rows}, (_, i) => {
          const yy = y0 + 10 + i * 26;
          if (yy > y0 + h - 6) return null;
          return <line key={i} x1={x0 + 3} y1={yy} x2={x1 - 3} y2={yy - 14} />;
        })}
      </g>
    </svg>
  );
};

// ---------------- SC09 舞台几何（SC10 缩微承接共用） ----------------
export const STAGE = {
  router: {cx: 640, cy: 206},
  wall: {x0: 618, x1: 662, y0: 302, y1: 568},
  devL: {cx: 350, cy: 512, kind: 'laptop' as const, label: WEXAMPLE.laptop},
  devR: {cx: 930, cy: 512, kind: 'phone' as const, label: WEXAMPLE.phone},
  /** 左/右设备 → 路由器弧（够得到；端点落在路由器机身两侧） */
  arcL: {p0: [350, 470] as [number, number], c: [452, 292] as [number, number], p1: [572, 228] as [number, number]},
  arcR: {p0: [930, 470] as [number, number], c: [828, 292] as [number, number], p1: [708, 228] as [number, number]},
  /** 设备间直连尝试（被墙截断在墙面 x=618）：左半段二次曲线 */
  xarc: {p0: [404, 498] as [number, number], c: [517, 534] as [number, number], p1: [618, 536] as [number, number]},
  cross: {cx: 640, cy: 536},
  hit: {cx: 640, cy: 214},        // 撞点（路由器处）
  textY: 596,                     // 'neither is heard' 行
  qL: {cx: 270, cy: 455},         // 左设备 ? 标
  qR: {cx: 1010, cy: 455},        // 右设备 ? 标
  trapTextY: 132,                 // 'a trickier trap' 行
  miniK: 0.7, miniFrom: [640, 377] as [number, number], miniTo: [424, 372] as [number, number],
};
/** SC09 世界坐标 → SC10 缩微坐标（2002 起 12f 内插值用 stageMiniK(k)） */
export const stageMini = (p: [number, number]): [number, number] => [
  (p[0] - STAGE.miniFrom[0]) * STAGE.miniK + STAGE.miniTo[0],
  (p[1] - STAGE.miniFrom[1]) * STAGE.miniK + STAGE.miniTo[1],
];
export const stageMiniK = (p: [number, number], k: number): [number, number] => {
  const t = [stageMini(p)[0], stageMini(p)[1]];
  return [p[0] + (t[0] - p[0]) * clamp01(k), p[1] + (t[1] - p[1]) * clamp01(k)];
};

// ---------------- SC06 礼貌卡缩微（章首承接；G2 落成后建议对齐几何） ----------------
/** 三张缩微卡（前两张红叉、第三张紫亮）+ 芯片；无微文本（<22px 不上字），旁挂 22px 'good manners' 标 */
export const MannersMini: React.FC<{cx: number; cy: number; N: number; opacity?: number}> = ({cx, cy, N, opacity = 1}) => {
  const breathe = 0.75 + 0.25 * Math.sin((2 * Math.PI * N) / 34);
  return (
    <div style={{...abs(cx - 118, cy - 62, 236, 130), opacity}}>
      <svg width={236} height={96} viewBox="0 0 236 96" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* 卡1 / 卡2（被否） */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${12 + i * 58},8)`} opacity={0.5}>
            <rect x={0} y={0} width={46} height={58} rx={5} fill="#000" stroke={GREY_MID} strokeWidth={2} />
            <line x1={12} y1={16} x2={34} y2={16} stroke={GREY_MID} strokeWidth={2} />
            <line x1={12} y1={26} x2={34} y2={26} stroke={GREY_MID} strokeWidth={2} />
            <line x1={11} y1={36} x2={35} y2={52} stroke="#F16043" strokeWidth={3.4} strokeLinecap="round" />
            <line x1={35} y1={36} x2={11} y2={52} stroke="#F16043" strokeWidth={3.4} strokeLinecap="round" />
          </g>
        ))}
        {/* 卡3（good manners，紫亮） */}
        <g transform="translate(128,4)">
          <rect x={0} y={0} width={50} height={64} rx={5} fill="rgba(102,48,248,0.16)" stroke={PURPLE_LIGHT} strokeWidth={2.4}
            style={{filter: `drop-shadow(0 0 ${(5 * breathe).toFixed(1)}px rgba(102,48,248,${(0.55 * breathe).toFixed(2)})`}} />
          <path d="M25,26 C21,20 12,23 14,31 C16,38 25,44 25,44 C25,44 34,38 36,31 C38,23 29,20 25,26 Z" fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} />
          <line x1={12} y1={52} x2={38} y2={52} stroke={GREY_LIGHT} strokeWidth={2} />
        </g>
        {/* 芯片（礼貌长在芯片里） */}
        <g transform="translate(190,14)">
          <rect x={0} y={0} width={40} height={36} rx={4} fill="#000" stroke={GREY_LIGHT} strokeWidth={2} />
          <rect x={9} y={9} width={22} height={18} rx={2} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.8} />
          {[-2, 8, 18, 28].map((dx, i) => <line key={i} x1={10 + i * 5} y1={36} x2={10 + i * 5} y2={42} stroke={GREY_MID} strokeWidth={1.6} />)}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center', fontFamily: FONT_TECH, fontSize: 22, color: GREY}}>good manners</div>
    </div>
  );
};

// ---------------- 耸肩小人（SC08 "like it or not"） ----------------
export const ShrugMini: React.FC<{cx: number; cy: number; opacity?: number}> = ({cx, cy, opacity = 1}) => (
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: opacity.toFixed(3)}}>
    <g stroke={GREY} strokeWidth={2.6} fill="none" strokeLinecap="round">
      <circle cx={cx} cy={cy - 30} r={9} />
      <line x1={cx} y1={cy - 21} x2={cx} y2={cy + 4} />
      <path d={`M${cx - 13},${cy - 6} L${cx - 22},${cy - 18}`} />
      <path d={`M${cx + 13},${cy - 6} L${cx + 22},${cy - 18}`} />
      <path d={`M${cx - 9},${cy + 4} L${cx - 5},${cy + 18}`} />
      <path d={`M${cx + 9},${cy + 4} L${cx + 5},${cy + 18}`} />
    </g>
    <text x={cx - 28} y={cy - 34} fontFamily="'Orbitron','Audiowide',sans-serif" fontSize={18} fill={GREY}>?</text>
    <text x={cx + 20} y={cy - 34} fontFamily="'Orbitron','Audiowide',sans-serif" fontSize={18} fill={GREY}>?</text>
  </svg>
);
