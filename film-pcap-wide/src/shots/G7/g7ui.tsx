import React from 'react';
import {clamp01, easeOutCubic} from '../../common';
import {GREY, GREY_LINE, GREY_LIGHT, PURPLE, PURPLE_LIGHT, RED_DEEP, WHITE, abs, mixHex} from '../../ui';

/**
 * G7 组内共用图元（第 4 章上半：两个限制 — 加密 / 许可）。
 * 锁 / 许可状 / 闸机 / 路由器 / 云朵等；跨镜头复用，不进 ui.tsx。
 */

/** 挂锁（SC35 主角图形 / SC37 信封封口小锁）：白描边 + 黑填充，draw-on p 0→1（pathLength=100），
 *  rot 为锁芯（钥匙孔）连续微转角度，lit 时锁芯变紫（SC36 保险柜锁圈的呼应）。高约 128·s px。 */
export const LockGlyph: React.FC<{cx: number; cy: number; s?: number; p?: number; rot?: number; lit?: boolean; opacity?: number}> = ({cx, cy, s = 1, p = 1, rot = 0, lit = false, opacity = 1}) => {
  const off = 100 * (1 - clamp01(p));
  const core = lit ? PURPLE_LIGHT : WHITE;
  return (
    <svg width={140 * s} height={128 * s} viewBox="-70 -64 140 128" style={{position: 'absolute', left: cx - 70 * s, top: cy - 64 * s, overflow: 'visible', opacity}}>
      {/* 锁梁 */}
      <path d="M -24,-8 L -24,-32 A 24,24 0 0 1 24,-32 L 24,-8" fill="none" stroke={WHITE} strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
      {/* 锁体 */}
      <rect x={-38} y={-8} width={76} height={66} rx={10} fill="#000" stroke={WHITE} strokeWidth={5} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
      {/* 锁芯（钥匙孔）：圆 + 键槽，绕圆心微转 */}
      <g transform={`rotate(${rot.toFixed(1)} 0 25)`}>
        <circle cx={0} cy={25} r={9} fill="#000" stroke={core} strokeWidth={4} />
        <rect x={-3.5} y={25} width={7} height={15} rx={2} fill={lit ? PURPLE : '#000'} stroke={core} strokeWidth={3.5} />
      </g>
    </svg>
  );
};

/** 许可状文档卡（SC35 右卡图标 / SC38 授权许可状）：折角文档 + 文本行 + 圆形章印。
 *  p 外框 draw-on；stampK 章印 0→1；stampS 章印呼吸缩放；stampLit 章印紫光。 */
export const PermitCard: React.FC<{cx: number; cy: number; w: number; h: number; p?: number; stampK?: number; stampS?: number; stampLit?: boolean; opacity?: number; glow?: boolean}> = ({cx, cy, w, h, p = 1, stampK = 1, stampS = 1, stampLit = false, opacity = 1, glow = false}) => {
  const x = cx - w / 2, y = cy - h / 2;
  const off = 100 * (1 - clamp01(p));
  const fold = Math.min(34, w * 0.2);
  const sr = Math.min(26, w * 0.15);
  return (
    <div style={{...abs(x, y, w, h), opacity, filter: glow ? 'drop-shadow(0 0 14px 4px rgba(102,45,248,.45))' : undefined}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={`M2,2 L${w - fold - 2},2 L${w - 2},${fold + 2} L${w - 2},${h - 2} L2,${h - 2} Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
        <path d={`M${w - fold - 2},2 L${w - fold - 2},${fold + 2} L${w - 2},${fold + 2}`} fill="none" stroke={GREY_LINE} strokeWidth={2} />
        {/* 签名线（下部） */}
        <line x1={w * 0.14} y1={h - 26} x2={w * 0.52} y2={h - 26} stroke={GREY} strokeWidth={2} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
        {/* 文本行 */}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={w * 0.14} y1={h * 0.24 + i * 22} x2={w * 0.14 + (i === 1 ? w * 0.42 : w * 0.6)} y2={h * 0.24 + i * 22} stroke={GREY_LINE} strokeWidth={2.5} opacity={0.9} />
        ))}
      </svg>
      {/* 章印（右下） */}
      {stampK > 0 ? (
        <div style={{position: 'absolute', left: w * 0.66, top: h * 0.5, width: sr * 2, height: sr * 2, transform: `scale(${(stampK * stampS).toFixed(3)})`, transformOrigin: '50% 50%', opacity: clamp01(stampK * 1.2)}}>
          <svg width={sr * 2} height={sr * 2} viewBox={`0 0 ${sr * 2} ${sr * 2}`} style={{overflow: 'visible', filter: stampLit ? 'drop-shadow(0 0 10px 3px rgba(102,45,248,.6))' : undefined}}>
            <circle cx={sr} cy={sr} r={sr - 2} fill="rgba(102,45,248,0.12)" stroke={PURPLE_LIGHT} strokeWidth={3} />
            <circle cx={sr} cy={sr} r={sr * 0.55} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} />
            <path d={`M ${sr * 0.5},${sr * 0.72} L ${sr * 1.5},${sr * 0.72} M ${sr * 0.5},${sr} L ${sr * 1.5},${sr} M ${sr * 0.5},${sr * 1.28} L ${sr * 1.5},${sr * 1.28}`} stroke={PURPLE_LIGHT} strokeWidth={1.6} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

/** 闸机 / 门（SC38 左右两扇）：双立柱 + 顶栏 + 顶部门禁灯 + 三根可旋转闸臂。
 *  open 0→1 闸臂向上旋开；redK 0→1 边框白→红（未授权警示）；lampColor/lampGlow 门禁灯。 */
export const GateTurnstile: React.FC<{
  cx: number; y: number; w?: number; h?: number; open?: number; redK?: number;
  lampColor?: string; lampGlow?: number; drawP?: number; opacity?: number;
}> = ({cx, y, w = 150, h = 240, open = 0, redK = 0, lampColor = GREY, lampGlow = 0, drawP = 1, opacity = 1}) => {
  const stroke = mixHex(WHITE, RED_DEEP, clamp01(redK));
  const off = 100 * (1 - clamp01(drawP));
  const postW = 16;
  const arms = [0.3, 0.55, 0.8];
  return (
    <div style={{...abs(cx - w / 2, y, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* 立柱 ×2 */}
        <rect x={0} y={14} width={postW} height={h - 14} rx={4} fill="#000" stroke={stroke} strokeWidth={3} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
        <rect x={w - postW} y={14} width={postW} height={h - 14} rx={4} fill="#000" stroke={stroke} strokeWidth={3} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
        {/* 顶栏 */}
        <rect x={0} y={0} width={w} height={14} rx={4} fill="#000" stroke={stroke} strokeWidth={3} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
        {/* 闸臂 ×3（绕左端上旋 open×78°） */}
        {arms.map((fy, i) => (
          <g key={i} transform={`rotate(${(-78 * clamp01(open)).toFixed(1)} ${postW + 2} ${h * fy})`}>
            <rect x={postW + 2} y={h * fy - 5} width={w - postW * 2 - 4} height={10} rx={5} fill="#000" stroke={stroke} strokeWidth={2.5} opacity={0.95} />
          </g>
        ))}
      </svg>
      {/* 门禁灯（顶栏中央上方） */}
      <div style={{...abs(cx - 11, y - 24, 22, 22), borderRadius: 11, background: '#000', border: `2.5px solid ${lampColor}`, boxShadow: `0 0 ${Math.round(6 + 14 * clamp01(lampGlow))}px ${Math.round(2 + 5 * clamp01(lampGlow))}px ${lampColor}`, opacity: 0.55 + 0.45 * clamp01(lampGlow)}} />
    </div>
  );
};

/** 家用路由器（SC39 主角）：圆角方块 + 两根天线 + 面板 LED。 */
export const RouterGlyph: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number; litN?: number}> = ({cx, cy, w = 156, h = 100, opacity = 1, litN = 0}) => (
  <svg width={w + 70} height={h + 66} viewBox={`${-35} ${-66} ${w + 70} ${h + 66}`} style={{position: 'absolute', left: cx - w / 2 - 35, top: cy - h / 2 - 66, overflow: 'visible', opacity}}>
    {/* 天线 ×2 */}
    <path d={`M ${w * 0.18},0 L ${w * 0.02},-46`} stroke={WHITE} strokeWidth={4} strokeLinecap="round" />
    <path d={`M ${w * 0.82},0 L ${w * 0.98},-46`} stroke={WHITE} strokeWidth={4} strokeLinecap="round" />
    <circle cx={w * 0.02} cy={-46} r={5} fill="#000" stroke={WHITE} strokeWidth={3} />
    <circle cx={w * 0.98} cy={-46} r={5} fill="#000" stroke={WHITE} strokeWidth={3} />
    {/* 机身 */}
    <rect x={0} y={0} width={w} height={h} rx={14} fill="#000" stroke={WHITE} strokeWidth={3.5} />
    {/* LED */}
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={w * (0.2 + i * 0.2)} cy={h * 0.62} r={4.5} fill={i <= (litN % 4) ? PURPLE_LIGHT : '#1c1c22'} stroke={i <= (litN % 4) ? PURPLE_LIGHT : GREY_LINE} strokeWidth={2} />
    ))}
  </svg>
);

/** 云朵（SC39 internet 端点）：三弧白云，宽约 w。 */
export const CloudGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; accent?: boolean}> = ({cx, cy, w = 120, opacity = 1, accent = false}) => {
  const h = w * 0.6;
  const st = accent ? PURPLE_LIGHT : WHITE;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, overflow: 'visible', opacity, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
      <path d={`M ${w * 0.18},${h * 0.82} A ${w * 0.16},${w * 0.16} 0 0 1 ${w * 0.2},${h * 0.42} A ${w * 0.19},${w * 0.19} 0 0 1 ${w * 0.56},${h * 0.3} A ${w * 0.16},${w * 0.16} 0 0 1 ${w * 0.84},${h * 0.6} A ${w * 0.12},${w * 0.12} 0 0 1 ${w * 0.78},${h * 0.82} Z`} fill="#000" stroke={st} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
};

/** 笔记本（SC39 端点）：屏幕 + 底座，宽约 w。 */
export const LaptopGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; accent?: boolean}> = ({cx, cy, w = 110, opacity = 1, accent = false}) => {
  const st = accent ? PURPLE_LIGHT : WHITE;
  return (
    <svg width={w + 20} height={w * 0.72} viewBox={`0 0 ${w + 20} ${w * 0.72}`} style={{position: 'absolute', left: cx - (w + 20) / 2, top: cy - w * 0.36, overflow: 'visible', opacity, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
      <rect x={10} y={0} width={w} height={w * 0.6} rx={6} fill="#000" stroke={st} strokeWidth={3} />
      <rect x={10 + w * 0.3} y={0 + w * 0.24} width={w * 0.4} height={3} fill={GREY_LINE} />
      <path d={`M 0,${w * 0.72} L ${w * 0.1},${w * 0.64} L ${10 + w * 0.9},${w * 0.64} L ${w + 20},${w * 0.72} Z`} fill="#000" stroke={st} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
};

/** 手机（SC39 端点）：圆角竖矩形 + 听筒点，高约 h。 */
export const PhoneGlyph: React.FC<{cx: number; cy: number; h?: number; opacity?: number; accent?: boolean}> = ({cx, cy, h = 96, opacity = 1, accent = false}) => {
  const st = accent ? PURPLE_LIGHT : WHITE;
  const w = h * 0.52;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, overflow: 'visible', opacity, filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
      <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={10} fill="#000" stroke={st} strokeWidth={3} />
      <circle cx={w / 2} cy={h * 0.12} r={2.6} fill={st} />
      <rect x={w * 0.24} y={h * 0.2} width={w * 0.52} height={2.6} fill={GREY_LINE} />
      <rect x={w * 0.24} y={h * 0.28} width={w * 0.52} height={2.6} fill={GREY_LINE} />
    </svg>
  );
};

/** 弧线箭头（SC36 握手图）：SVG path + 箭头自目标端长出；p 0→1 draw-on。 */
export const ArcArrow: React.FC<{d: string; hx: number; hy: number; ang: number; p?: number; color?: string; sw?: number; opacity?: number}> = ({d, hx, hy, ang, p = 1, color = WHITE, sw = 3, opacity = 1}) => {
  const q = clamp01(p);
  const head = clamp01((q - 0.8) / 0.2);
  if (q <= 0) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <path d={d} fill="none" stroke={color} strokeWidth={sw} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - q)} strokeLinecap="round" />
      {head > 0 ? (
        <polygon points={`0,0 -14,-8.5 -14,8.5`} fill={color} transform={`translate(${hx} ${hy}) rotate(${ang}) scale(${head.toFixed(3)})`} />
      ) : null}
    </svg>
  );
};

/** 小三角脉冲（亮度包络）：n∈[0,len) 时 0→1→0 */
export const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
export const easeOutQ = easeOutCubic;
