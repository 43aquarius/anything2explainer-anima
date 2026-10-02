import React from 'react';
import {FONT_ORB} from '../../common';
import {CText, PacketIcon, RackIcon, PURPLE_LIGHT, WHITE, GREY, BLOOM_SOFT, abs} from '../../ui';

/**
 * G3 组内共用图元：
 * - 路径图 PathMap（SC13 全幅 ↔ SC14 缩略承接，同一组件保证组界帧像素一致）
 * - StationCircle 站位虚线圆圈 ①②③（全幅带数字；缩略/角标形态不带数字避免 <22px 小字）
 * - LaptopIcon 笔记本（SC13 左端节点 w120 ↔ SC14 中央主角 w320，同形承接）
 * - WiresharkBadge 章界承接：SC12 卡 B（Wireshark）的缩略回场
 * - Funnel 投递口漏斗 / AnalyzerScreen 分析器小屏（SC15/SC16 同款）
 */

// ---- 路径图几何（SC13 全幅；SC14 以 0.34 缩到左下角）----
export const PATH = {y: 400, x0: 160, x1: 1120};
export const STATIONS = [340, 640, 940]; // ①②③ 站位 x

/** 站位虚线圆圈：lit → 紫描边 + 紫柔光；digit 传入 '1'|'2'|'3' 时才渲染数字（Orbitron） */
export const StationCircle: React.FC<{cx: number; cy: number; r?: number; lit?: boolean; digit?: string; digitSize?: number; scale?: number; op?: number}> = ({cx, cy, r = 46, lit = false, digit, digitSize = 44, scale = 1, op = 1}) => (
  <div style={{...abs(cx - r, cy - r, r * 2, r * 2), opacity: op, transform: scale === 1 ? undefined : `scale(${scale.toFixed(4)})`, transformOrigin: '50% 50%'}}>
    <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} style={{overflow: 'visible', filter: lit ? 'drop-shadow(0 0 10px rgba(102,45,248,.7))' : BLOOM_SOFT}}>
      <circle cx={r} cy={r} r={r - 2.5} fill="rgba(0,0,0,.55)" stroke={lit ? PURPLE_LIGHT : '#4A4A4A'} strokeWidth={lit ? 3 : 2.5} strokeDasharray="7 6" />
      {digit ? (
        <text x={r} y={r} textAnchor="middle" dy="0.36em" fontFamily={FONT_ORB} fontWeight={700} fontSize={digitSize} fill={lit ? PURPLE_LIGHT : GREY}>
          {digit}
        </text>
      ) : null}
    </svg>
  </div>
);

/** 笔记本（白描边黑填充）：屏幕 + 平底座；os=true 屏内画 OS 小方块（SC14 主角形态） */
export const LaptopIcon: React.FC<{cx: number; cy: number; w: number; os?: boolean; osOp?: number; glow?: boolean; op?: number}> = ({cx, cy, w, os = false, osOp = 1, glow = false, op = 1}) => {
  const H = 0.7 * w;
  const sH = 0.58 * w;
  const bH = 0.12 * w;
  const sTop = cy - H / 2;
  const bw = os ? 0.34 * w : 0;
  const bh = os ? 0.36 * w : 0;
  return (
    <div style={{...abs(cx - w / 2, sTop, w, H), opacity: op}}>
      {glow ? <div style={{...abs(0, 0, w, H), borderRadius: 10, boxShadow: '0 0 12px 3px rgba(102,45,248,.35), 0 0 42px 14px rgba(102,45,248,.45)'}} /> : null}
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <rect x={1.5} y={1.5} width={w - 3} height={sH - 3} rx={8} fill="#000" stroke={WHITE} strokeWidth={3} />
        <rect x={w / 2 - bH * 1.35} y={sH + bH / 2} width={bH * 2.7} height={5} rx={2.5} fill={WHITE} opacity={0.85} />
        <rect x={2} y={sH} width={w - 4} height={bH - 2} rx={5} fill="#000" stroke={WHITE} strokeWidth={3} />
      </svg>
      {os && osOp > 0.01 ? (
        <div style={{...abs(w / 2 - bw / 2, sH / 2 - bh / 2, bw, bh), opacity: osOp, border: `3px solid ${PURPLE_LIGHT}`, borderRadius: 6, background: 'rgba(0,0,0,.6)'}} />
      ) : null}
    </div>
  );
};

/** SC13/SC14 共用的路径图（line → 信封层 → 两端节点 → 三个站位圈）。envX 由镜头按同一公式传入，保证组界帧一致。 */
export const PathMap: React.FC<{
  lineP: number;
  lS?: number; lOp?: number;
  rS?: number; rOp?: number;
  circ?: Array<{s: number; op: number; lit: boolean; digit?: string; pulse?: number}>;
  envX?: (i: number) => number | null;
  envOp?: number;
  envF?: (i: number) => number;
}> = ({lineP, lS = 1, lOp = 1, rS = 1, rOp = 1, circ, envX, envOp = 1, envF}) => (
  <div style={{position: 'absolute', inset: 0}}>
    {lineP > 0 ? <div style={{...abs(PATH.x0, PATH.y - 1, (PATH.x1 - PATH.x0) * Math.min(1, lineP), 2), background: WHITE, opacity: 0.9}} /> : null}
    {envX
      ? [0, 1, 2, 3].map((i) => {
          const x = envX(i);
          if (x == null) return null;
          const edge = Math.min(1, (x - PATH.x0) / 50, (PATH.x1 - x) / 50);
          const op = Math.max(0, edge) * envOp * (envF ? envF(i) : 1);
          return op <= 0.02 ? null : <PacketIcon key={i} cx={x} cy={PATH.y} w={56} h={38} opacity={op} />;
        })
      : null}
    {lOp > 0.01 ? (
      <div style={{position: 'absolute', inset: 0, opacity: lOp, transform: lS === 1 ? undefined : `translate(${PATH.x0}px,${PATH.y}px) scale(${lS.toFixed(4)}) translate(${-PATH.x0}px,${-PATH.y}px)`}}>
        <LaptopIcon cx={PATH.x0} cy={PATH.y} w={120} />
      </div>
    ) : null}
    {rOp > 0.01 ? (
      <div style={{position: 'absolute', inset: 0, opacity: rOp, transform: rS === 1 ? undefined : `translate(1080px,${PATH.y}px) scale(${rS.toFixed(4)}) translate(-1080px,${-PATH.y}px)`}}>
        <RackIcon cx={1080} cy={PATH.y} w={96} h={120} units={4} lit={3} sw={2.5} />
      </div>
    ) : null}
    {circ
      ? circ.map((c, i) => (c.op <= 0.01 ? null : <StationCircle key={i} cx={STATIONS[i]} cy={PATH.y} lit={c.lit || (c.pulse ?? 0) > 0} digit={c.digit} scale={c.s} op={c.op} />))
      : null}
  </div>
);

/** 路径上的信封位置（SC13 2691 起 / SC14 承接期共用，4.2px/帧） */
export const pathEnvX = (N: number, i: number, f0 = 2691): number | null => (N < f0 + i * 2 ? null : PATH.x0 + (((N - f0) * 4.2 + i * 240) % (PATH.x1 - PATH.x0)));

/** 章界承接：SC12 卡 B（Wireshark）的缩略回场（紫边 + 鲨鱼鳍 + 名字） */
export const WiresharkBadge: React.FC<{cx: number; cy: number; op?: number; glowK?: number}> = ({cx, cy, op = 1, glowK = 1}) => (
  <div style={{...abs(cx - 150, cy - 42, 300, 84), opacity: op}}>
    <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 10, boxShadow: glowK > 0.02 ? `0 0 24px 8px rgba(102,45,248,${(0.6 * glowK).toFixed(3)})` : undefined}} />
    <svg width={56} height={38} viewBox="0 0 160 104" style={{position: 'absolute', left: 20, top: 23, overflow: 'visible'}}>
      <path d="M25,94 C36,56 58,24 100,14 C82,46 86,72 106,94 Z" fill="#000" stroke={WHITE} strokeWidth={8} strokeLinejoin="round" />
    </svg>
    <CText cx={188} cy={42} size={30} weight={900} color={WHITE} shadow="0 0 10px rgba(255,255,255,.3)">
      Wireshark
    </CText>
  </div>
);

/** 投递口漏斗（上宽下窄 + 落信缝） */
export const Funnel: React.FC<{cx: number; cy: number; op?: number; drawP?: number}> = ({cx, cy, op = 1, drawP = 1}) => (
  <div style={{...abs(cx - 46, cy - 20, 92, 40), opacity: op}}>
    <svg width={92} height={40} viewBox="0 0 92 40" style={{overflow: 'visible', filter: BLOOM_SOFT}}>
      <path d="M2,2 H90 L64,30 H28 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray={130} strokeDashoffset={130 * (1 - Math.min(1, drawP))} />
      <line x1={28} y1={30} x2={64} y2={30} stroke={WHITE} strokeWidth={2.5} strokeDasharray={36} strokeDashoffset={36 * (1 - Math.min(1, Math.max(0, drawP * 1.6 - 0.6)))} />
    </svg>
  </div>
);

/** 分析器小屏（SC15 监控口 / SC16 TAP 共款）：黑底白边 + analyzer 标签 + Orbitron 计数 */
export const AnalyzerScreen: React.FC<{cx: number; cy: number; w?: number; h?: number; count: number; op?: number; scale?: number; pulse?: number; label?: string}> = ({cx, cy, w = 240, h = 105, count, op = 1, scale = 1, pulse = 1, label = 'analyzer'}) => (
  <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity: op, transform: scale === 1 ? undefined : `scale(${scale.toFixed(4)})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 8, filter: BLOOM_SOFT}} />
    <div style={{position: 'absolute', left: 14, top: 10, fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: 22, fontWeight: 700, color: GREY, lineHeight: 1}}>{label}</div>
    <div style={{position: 'absolute', right: 16, top: h / 2 - 30, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: '100% 50%'}}>
      <Counterish value={count} />
    </div>
  </div>
);

const Counterish: React.FC<{value: number}> = ({value}) => (
  <div style={{fontFamily: FONT_ORB, fontSize: 46, fontWeight: 700, color: PURPLE_LIGHT, lineHeight: 1, letterSpacing: 1, textShadow: '0 0 12px rgba(161,117,241,.7)', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
);
