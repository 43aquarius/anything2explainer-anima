import React from 'react';
import {PURPLE_LIGHT, GREY_MID, GREY_LINE, GREY_LIGHT, WHITE, GREEN, abs, mixHex, BLOOM_SOFT} from '../../ui';
import {clamp01} from '../../common';

/**
 * WiFi 片 G2 共用图元（组目录版）。
 * ⚠ 派单口径说 src/ui.tsx「已备」BackoffRing/DeviceGlyph/AirPulse/RouterGlyph/ChannelBand——实测 ui.tsx 仍是
 *   CDN 片图元（EXAMPLE 也是 CDN 内容）。按 agent 协议「缺什么在组目录补」，全套建在本文件；
 *   建议主会话把它们提升进 ui.tsx 供全片统一（G3 还需要 ChannelBand，本组未建）。
 * 风格：黑填充 + 白描边 2.5–3px + BLOOM_SOFT；紫 = 当前重点 / 灰 = 别人·静默 / 绿 = 正确 / 橙红 = 冲突。
 * 全部纯函数：动画量由镜头按 N 算好传入，或传 N/f0 让组件自己算相对帧；随机一律由调用方用 rnd(...) 预生成。
 */

/** 全片统一示例语境（分镜表 全局约束 §2 的 G2 子集；ui.tsx 的 EXAMPLE 是 CDN 片内容——待主会话替换） */
export const EX = {
  laptop: 'your laptop',
  phone: 'your phone',
  tv: 'your TV',
  router: 'the router',
};

/** 极坐标取点（角度制，0°=正右，顺时针为正——屏幕系 y 向下） */
export const pol = (cx: number, cy: number, r: number, aDeg: number): [number, number] => {
  const a = (aDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** 以 (cx,cy) 为心、半径 r 的开口弧 path（rotate 为开口朝向：0=上/−90=左…；spread 张角） */
export const arcPath = (cx: number, cy: number, r: number, spread: number, rotate: number) => {
  const a0 = rotate - spread / 2 - 90;
  const a1 = rotate + spread / 2 - 90;
  const [x0, y0] = pol(cx, cy, r, a0);
  const [x1, y1] = pol(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/**
 * 空气脉冲弧（说话/信号母题）：N 驱动的连续外扩弧波，波与波自然错峰 waves 分之一周期。
 * kind='arc'（扇形弧：spread 张角、rotate 开口朝向）或 'circle'（全向同心圆）。
 * 波的生命：r 从 r0→r1，透明度 sin(π·t)——生灭连续、无跳变（低幅呼吸用 amp ≤0.55）。
 * 自带 <svg> 容器但默认不带滤镜（性能：多组弧共享滤波预算）；glow 才给 BLOOM_SOFT。
 */
export const AirPulse: React.FC<{
  cx: number; cy: number; N: number; f0: number;
  waves?: number; r0?: number; r1?: number; period?: number;
  kind?: 'arc' | 'circle'; spread?: number; rotate?: number;
  color?: string; sw?: number; amp?: number; opacity?: number; glow?: boolean;
}> = ({cx, cy, N, f0, waves = 3, r0 = 30, r1 = 110, period = 40, kind = 'arc', spread = 84, rotate = 0, color = WHITE, sw = 2.6, amp = 1, opacity = 1, glow = false}) => {
  const cells: React.ReactNode[] = [];
  for (let k = 0; k < waves; k++) {
    const ph = (N - f0) / period - k / waves;
    if (ph < 0) continue; // 该波尚未出生
    const t = ph % 1;
    const r = r0 + (r1 - r0) * t;
    const a = Math.pow(Math.sin(Math.PI * t), 0.85) * clamp01(amp);
    if (a <= 0.02) continue;
    const common = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, opacity: a.toFixed(3)};
    if (kind === 'circle') {
      cells.push(<circle key={k} cx={cx} cy={cy} r={r.toFixed(1)} {...common} />);
    } else {
      cells.push(<path key={k} d={arcPath(cx, cy, r, spread, rotate)} {...common} />);
    }
  }
  if (!cells.length) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, filter: glow ? BLOOM_SOFT : undefined}}>
      {cells}
    </svg>
  );
};

/**
 * 设备简笔（laptop / phone / tv）：黑填充白描边；dim 时描边压灰（被盖过/静默态）；
 * glow 给白柔光（主角态）。label 为下方灰白小字（EX.laptop 等）。
 */
export const DeviceGlyph: React.FC<{
  cx: number; cy: number; w: number; kind: 'laptop' | 'phone' | 'tv';
  opacity?: number; dim?: number; glow?: boolean; rot?: number; label?: string; labelSize?: number;
}> = ({cx, cy, w, kind, opacity = 1, dim = 0, glow = false, rot = 0, label, labelSize = 22}) => {
  const stroke = mixHex(WHITE, GREY_MID, clamp01(dim));
  const VW = kind === 'laptop' ? 120 : kind === 'phone' ? 60 : 150; // 视口宽
  const VH = kind === 'laptop' ? 68 : kind === 'phone' ? 110 : 95; // 视口高
  const s = w / VW;
  const h = VH * s;
  return (
    <div style={{
      ...abs(cx - w / 2, cy - h / 2, w, h), opacity,
      transformOrigin: `${cx}px ${cy}px`, transform: rot ? `rotate(${rot.toFixed(2)}deg)` : undefined,
      filter: glow ? 'drop-shadow(0 0 8px rgba(255,255,255,.4))' : undefined,
    }}>
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g stroke={stroke} strokeWidth={2.6} fill="#000" strokeLinejoin="round">
          {kind === 'laptop' ? (
            <>
              <rect x={30} y={4} width={60} height={42} rx={4} />
              <path d="M14 52 H106 L112 64 H8 Z" />
            </>
          ) : kind === 'phone' ? (
            <>
              <rect x={8} y={6} width={44} height={98} rx={10} />
              <rect x={14} y={16} width={32} height={70} rx={3} fill="#000" stroke={stroke} strokeWidth={1.6} opacity={0.55} />
            </>
          ) : (
            <>
              <rect x={6} y={6} width={138} height={74} rx={6} />
              <path d="M62 80 H88 L92 92 H58 Z" />
            </>
          )}
        </g>
        {kind === 'laptop' ? (
          <>
            <line x1={30} y1={49} x2={90} y2={49} stroke={GREY_MID} strokeWidth={1.6} />
            {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={18 + i * 17} y1={56.5} x2={18 + i * 17} y2={62} stroke={GREY_MID} strokeWidth={1.2} opacity={0.7} />)}
          </>
        ) : kind === 'phone' ? (
          <circle cx={30} cy={97} r={3} fill={dim ? GREY_MID : GREY_LIGHT} />
        ) : (
          <>
            <path d="M40 80 L30 92 M110 80 L120 92" stroke={stroke} strokeWidth={2.4} fill="none" />
            <circle cx={130} cy={13} r={2.4} fill={GREEN} opacity={0.85} />
          </>
        )}
      </svg>
      {label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: h + 6, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 600, fontSize: labelSize, color: mixHex(GREY_LIGHT, GREY_MID, clamp01(dim)), lineHeight: 1}}>{label}</div>
      ) : null}
    </div>
  );
};

/**
 * 路由器简笔：机盒 + 双天线 + 三枚 LED。led='active'（绿轮闪，N 驱动）/ 'idle'（灰常暗）/ 'alert'（红齐闪）。
 */
export const RouterGlyph: React.FC<{
  cx: number; cy: number; w?: number; h?: number; N?: number;
  opacity?: number; dim?: number; glow?: boolean; led?: 'idle' | 'active' | 'alert'; label?: string; labelSize?: number;
}> = ({cx, cy, w = 150, h = 62, N = 0, opacity = 1, dim = 0, glow = false, led = 'idle', label, labelSize = 22}) => {
  const stroke = mixHex(WHITE, GREY_MID, clamp01(dim));
  const x0 = cx - w / 2, y0 = cy - h / 2;
  const blink = (i: number) => (led === 'active' ? (Math.floor(N / 9) % 3 === i ? 1 : 0.25) : led === 'alert' ? (Math.floor(N / 4) % 2 ? 0.35 : 1) : 0.3);
  const ledCol = led === 'alert' ? '#EC081F' : led === 'active' ? GREEN : GREY_LIGHT;
  return (
    <div style={{
      ...abs(x0, y0, w, h + (label ? labelSize + 10 : 0)), opacity,
      filter: glow ? 'drop-shadow(0 0 9px rgba(255,255,255,.38))' : undefined,
    }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* 双天线 */}
        <g stroke={stroke} strokeWidth={2.6} fill="#000" strokeLinecap="round">
          <path d={`M${w * 0.24} ${h * 0.34} L${w * 0.14} ${-h * 0.52}`} fill="none" />
          <path d={`M${w * 0.76} ${h * 0.34} L${w * 0.86} ${-h * 0.52}`} fill="none" />
          <circle cx={w * 0.14} cy={-h * 0.52} r={3.4} />
          <circle cx={w * 0.86} cy={-h * 0.52} r={3.4} />
        </g>
        {/* 机盒 */}
        <rect x={2} y={h * 0.34} width={w - 4} height={h * 0.66 - 2} rx={7} fill="#000" stroke={stroke} strokeWidth={2.6} />
        {/* 散热缝 */}
        <line x1={w * 0.12} y1={h * 0.62} x2={w * 0.34} y2={h * 0.62} stroke={GREY_MID} strokeWidth={1.6} />
        <line x1={w * 0.12} y1={h * 0.72} x2={w * 0.28} y2={h * 0.72} stroke={GREY_MID} strokeWidth={1.6} />
        {/* LED ×3 */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={w * 0.68 + i * (w * 0.1)} cy={h * 0.67} r={3.2} fill={ledCol} opacity={blink(i)} />
        ))}
      </svg>
      {label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: h + 4, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 600, fontSize: labelSize, color: mixHex(GREY_LIGHT, GREY_MID, clamp01(dim)), lineHeight: 1}}>{label}</div>
      ) : null}
    </div>
  );
};

/**
 * 耳朵图标（侦听态母题）：半圆外耳 + 内弧 + 耳垂点。p 为 draw-on 进度（0–1，pathLength 归一）；
 * lit 0–1 从灰到白（lit>0.6 带白光=正在听）。尺寸 s = 外弧直径。
 */
export const EarGlyph: React.FC<{cx: number; cy: number; s?: number; p?: number; lit?: number; opacity?: number; glow?: boolean}> = ({cx, cy, s = 46, p = 1, lit = 0, opacity = 1, glow = false}) => {
  const stroke = mixHex(GREY_MID, WHITE, clamp01(lit));
  const draw = (prog: number) => ({strokeDasharray: 100, strokeDashoffset: (100 * (1 - clamp01(prog))).toFixed(1)});
  return (
    <div style={{...abs(cx - s / 2, cy - s / 2, s, s), opacity, filter: glow && lit > 0.55 ? 'drop-shadow(0 0 8px rgba(255,255,255,.5))' : undefined}}>
      <svg width={s} height={s} viewBox="0 0 48 48" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M8 31 A16 16 0 1 1 40 31" pathLength={100} fill="none" stroke={stroke} strokeWidth={3.2} strokeLinecap="round" {...draw(p)} />
        <path d="M16 31 A8 8 0 1 1 32 31" pathLength={100} fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" opacity={0.8} {...draw(clamp01(p * 1.25 - 0.25))} />
        <circle cx={24} cy={36} r={2.4} fill={stroke} opacity={clamp01(p * 1.6 - 0.6)} />
      </svg>
    </div>
  );
};

/** 骰点布局（2–5；单位坐标 [-1,1]²，乘 s·0.30 得像素） */
const PIPS: Record<number, Array<[number, number]>> = {
  2: [[-0.5, -0.5], [0.5, 0.5]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  4: [[-0.5, -0.5], [-0.5, 0.5], [0.5, -0.5], [0.5, 0.5]],
  5: [[-0.5, -0.5], [-0.5, 0.5], [0, 0], [0.5, -0.5], [0.5, 0.5]],
};

/**
 * 随机暂停环（BackoffRing，SC05 主角 / SC06 缩微承接）：倒计环 + 环心骰子。
 * p = 环走量 0–1（f0/dur 由镜头算好传入更直观：p = (N-f0)/dur）；pips = 骰点数（0/缺省=只画环）；
 * pipGlow 0–1 骰点点亮度；flash 0–1 完成白闪；dim 缩微承接态（整体压灰）。
 * 走完（p≥1）后进度弧常驻整环，呼吸由外层 GlowBlob 提供（本件不带光，滤波预算留给镜头）。
 */
export const BackoffRing: React.FC<{
  cx: number; cy: number; r?: number; p?: number; pips?: number;
  pipGlow?: number; flash?: number; opacity?: number; dim?: number; tick?: boolean;
}> = ({cx, cy, r = 118, p = 1, pips = 0, pipGlow = 1, flash = 0, opacity = 1, dim = 0, tick = true}) => {
  const prog = clamp01(p);
  const die = r * 0.62;
  const stroke = mixHex(WHITE, GREY_MID, clamp01(dim));
  const pipPos = PIPS[Math.max(2, Math.min(5, pips))] ?? [];
  const pipR = die * 0.115;
  return (
    <div style={{...abs(cx - r - 4, cy - r - 4, 2 * r + 8, 2 * r + 8), opacity}}>
      <svg width={2 * r + 8} height={2 * r + 8} viewBox={`${-r - 4} ${-r - 4} ${2 * r + 8} ${2 * r + 8}`} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        {/* 轨道环 + 刻度 */}
        <circle cx={0} cy={0} r={r} fill="none" stroke={mixHex('#3A3A3A', GREY_LINE, clamp01(dim))} strokeWidth={2.4} />
        {tick ? [0, 90, 180, 270].map((a) => {
          const [x0, y0] = pol(0, 0, r - 6, a);
          const [x1, y1] = pol(0, 0, r + 4, a);
          return <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} stroke={GREY_MID} strokeWidth={2} opacity={0.75} />;
        }) : null}
        {/* 倒计进度弧：自 12 点顺时针 */}
        <circle cx={0} cy={0} r={r} fill="none" stroke={mixHex(PURPLE_LIGHT, GREY_MID, clamp01(dim) * 0.45)} strokeWidth={5}
          strokeLinecap="round" pathLength={100} strokeDasharray={`${(prog * 100).toFixed(2)} 100`} transform="rotate(-90)" opacity={0.95} />
        {/* 完成白闪 */}
        {flash > 0.02 ? (
          <circle cx={0} cy={0} r={r} fill="none" stroke={WHITE} strokeWidth={5 + 3 * flash} opacity={(flash * 0.95).toFixed(2)} />
        ) : null}
        {/* 环心骰子 */}
        {die > 26 ? (
          <>
            <rect x={-die / 2} y={-die / 2} width={die} height={die} rx={die * 0.16} fill="#000" stroke={stroke} strokeWidth={2.6} />
            {pipPos.map(([ux, uy], i) => (
              <circle key={i} cx={ux * die * 0.3} cy={uy * die * 0.3} r={pipR}
                fill={mixHex(GREY_MID, WHITE, clamp01(pipGlow))}
                opacity={(0.55 + 0.45 * clamp01(pipGlow)).toFixed(2)} />
            ))}
          </>
        ) : (
          pipPos.map(([ux, uy], i) => (
            <circle key={i} cx={ux * die * 0.3} cy={uy * die * 0.3} r={Math.max(2, pipR)} fill={mixHex(GREY_MID, WHITE, clamp01(pipGlow))} opacity={0.55 + 0.45 * clamp01(pipGlow)} />
          ))
        )}
      </svg>
    </div>
  );
};
