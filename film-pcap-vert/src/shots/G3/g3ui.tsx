import React from 'react';
import {clamp01} from '../../common';
import {GREY, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, abs} from '../../ui';
import {camAt, CamKey} from '../../fx';

/**
 * G3 组内共用小图元（跨镜头复用；不进 ui.tsx 以免污染共用层）。
 * CamRigV 是 fx.tsx CameraRig 的竖版（该组件写死了 1280×720 的 translate(640,360)）；
 * 其余图元从横版同片 g6ui/g7ui 移植（构图语言一致、坐标竖版化）。
 */

/** 竖版运镜相机：children 用世界坐标（默认相机 x=360,y=640,s=1 时与画布重合）。插值沿用 fx 的 camAt。 */
export const CamRigV: React.FC<{N: number; keys: CamKey[]; children: React.ReactNode}> = ({N, keys, children}) => {
  const c = camAt(N, keys);
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(360px,640px) scale(${c.s.toFixed(4)}) translate(${(-c.x).toFixed(2)}px,${(-c.y).toFixed(2)}px)`}}>
      {children}
    </div>
  );
};

/** 橙色圆形柔光斑（SC09 大数字脚下的大面积橙光）：k 强度 0→1，N 传入时 30 帧呼吸（amp 控制幅度，默认 ±15%；
 *  大面积光在低分辨率采样下呼吸差会超过 motion_check 的 hold 阈值，稳定尾段可传小 amp） */
export const OrangeGlow: React.FC<{cx: number; cy: number; r: number; k?: number; N?: number; alpha?: number; amp?: number}> = ({cx, cy, r, k = 1, N, alpha = 0.5, amp = 0.15}) => {
  const breathe = N === undefined ? 1 : 1 + amp * Math.sin((2 * Math.PI * N) / 30);
  const a = Math.max(0, Math.min(1, k)) * breathe;
  if (a <= 0.01) return null;
  return (
    <div
      style={{
        ...abs(cx - r, cy - r, 2 * r, 2 * r),
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(240,95,65,${(alpha * a).toFixed(3)}) 0%, rgba(240,95,65,${(alpha * 0.55 * a).toFixed(3)}) 38%, rgba(240,95,65,0) 70%)`,
      }}
    />
  );
};

/** 挂锁（SC10 信封封口小锁）：白描边 + 黑填充，draw-on p 0→1（pathLength=100）。高约 128·s px。 */
export const LockGlyph: React.FC<{cx: number; cy: number; s?: number; p?: number; rot?: number; lit?: boolean; opacity?: number}> = ({cx, cy, s = 1, p = 1, rot = 0, lit = false, opacity = 1}) => {
  const off = 100 * (1 - clamp01(p));
  const core = lit ? PURPLE_LIGHT : WHITE;
  return (
    <svg width={140 * s} height={128 * s} viewBox="-70 -64 140 128" style={{position: 'absolute', left: cx - 70 * s, top: cy - 64 * s, overflow: 'visible', opacity}}>
      {/* 锁梁 */}
      <path d="M -24,-8 L -24,-32 A 24,24 0 0 1 24,-32 L 24,-8" fill="none" stroke={WHITE} strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
      {/* 锁体 */}
      <rect x={-38} y={-8} width={76} height={66} rx={10} fill="#000" stroke={WHITE} strokeWidth={5} pathLength={100} strokeDasharray={100} strokeDashoffset={off} />
      {/* 锁芯（钥匙孔）：圆 + 键槽 */}
      <g transform={`rotate(${rot.toFixed(1)} 0 25)`}>
        <circle cx={0} cy={25} r={9} fill="#000" stroke={core} strokeWidth={4} />
        <rect x={-3.5} y={25} width={7} height={15} rx={2} fill={lit ? PURPLE : '#000'} stroke={core} strokeWidth={3.5} />
      </g>
    </svg>
  );
};

/** 许可状文档卡（SC11 主角）：折角文档 + 文本行 + 签名线 + 圆形章印。
 *  p 外框 draw-on；stampK 章印 0→1；stampS 章印落章缩放（1.3→1）；stampLit 章印紫光。 */
export const PermitCard: React.FC<{cx: number; cy: number; w: number; h: number; p?: number; stampK?: number; stampS?: number; stampLit?: boolean; opacity?: number; glow?: boolean}> = ({cx, cy, w, h, p = 1, stampK = 1, stampS = 1, stampLit = false, opacity = 1, glow = false}) => {
  const x = cx - w / 2, y = cy - h / 2;
  const off = 100 * (1 - clamp01(p));
  const fold = Math.min(34, w * 0.2);
  const sr = Math.min(26, w * 0.15);
  return (
    <div style={{...abs(x, y, w, h), opacity, filter: glow ? 'drop-shadow(0 0 14px 4px rgba(102,48,248,.45))' : undefined}}>
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
            <circle cx={sr} cy={sr} r={sr - 2} fill="rgba(102,48,248,0.12)" stroke={PURPLE_LIGHT} strokeWidth={3} />
            <circle cx={sr} cy={sr} r={sr * 0.55} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} />
            <path d={`M ${sr * 0.5},${sr * 0.72} L ${sr * 1.5},${sr * 0.72} M ${sr * 0.5},${sr} L ${sr * 1.5},${sr} M ${sr * 0.5},${sr * 1.28} L ${sr * 1.5},${sr * 1.28}`} stroke={PURPLE_LIGHT} strokeWidth={1.6} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

/** 小三角脉冲（亮度/位移包络）：n∈[0,len) 时 0→1→0 */
export const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
