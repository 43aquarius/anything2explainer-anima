import React from 'react';
import {FONT_ORB, FONT_MONO} from '../../common/lib';
import {clamp01} from '../../common';
import {CText, Box, Svg, abs, WHITE, GREY, GREY_LIGHT, GREY_LINE, PURPLE_LIGHT, BLOOM_SOFT, GLOW_PURPLE_S, EXAMPLE, fadeIn} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G1 共用图元（组内特有；通用件从 ui.tsx/fx.tsx import，不重造）。
 * 全部纯函数：动画量由镜头按 N 算好传入。
 */

// ===================== 浏览器 mock（SC01 主角容器 / SC04·SC05 缩略）=====================
/** 黑底白边浏览器：chrome 条（3 圆点 + 地址栏）+ 内容骨架线 + 可选 Enter 键帽。
 *  addr 为已打出的地址文本；skel 0..1 骨架线出现进度（行错峰）；breath 骨架呼吸增亮 0..1。
 *  mini（w<260）自动简化：小圆点、地址栏用灰条（不放 <22px 的文字）、无键帽。 */
export const BrowserMock: React.FC<{
  x: number; y: number; w: number; h: number;
  addr?: string; caret?: boolean; skel?: number; breath?: number;
  enterShow?: number; enterPress?: number; opacity?: number;
}> = ({x, y, w, h, addr = '', caret = false, skel = 0, breath = 0, enterShow = 0, enterPress = 0, opacity = 1}) => {
  const mini = w < 260;
  const ch = mini ? Math.max(16, h * 0.16) : 56; // chrome 条高
  const dotR = mini ? 2.5 : 5;
  const abW = w * 0.72, abH = mini ? 10 : 30; // 地址栏
  const abX = x + w * 0.17, abY = y + (ch - abH) / 2;
  const lines = mini ? 3 : 5;
  const lw = [0.86, 0.68, 0.78, 0.58, 0.48];
  const cTop = y + ch + (mini ? 8 : 22);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <Box x={x} y={y} w={w} h={h} r={10} fill="#06070c" stroke={WHITE} sw={mini ? 2 : 2.5} />
      {/* chrome 条 */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: x + (mini ? 8 : 20) + i * (mini ? 9 : 16), top: y + ch / 2 - dotR, width: dotR * 2, height: dotR * 2, borderRadius: '50%', background: mini ? '#222' : GREY}} />
      ))}
      <div style={{position: 'absolute', left: x + 6, top: y + ch, width: w - 12, height: 1.5, background: GREY_LINE}} />
      {/* 地址栏 */}
      <Box x={abX} y={abY} w={abW} h={abH} r={abH / 2} fill="#0b0c12" stroke={GREY} sw={mini ? 1 : 1.5} />
      {mini ? (
        <div style={{position: 'absolute', left: abX + 8, top: abY + abH / 2 - 2, width: abW * 0.55, height: 4, borderRadius: 2, background: '#4a4a52'}} />
      ) : (
        <>
          <div style={{position: 'absolute', left: abX + 16, top: abY + abH / 2 - 12, fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1, color: WHITE, opacity: 0.92, whiteSpace: 'pre'}}>{addr}</div>
          {caret ? <div style={{position: 'absolute', left: abX + 16 + addr.length * 14.5 + 6, top: abY + 4, width: 2.5, height: abH - 8, background: WHITE}} /> : null}
        </>
      )}
      {/* 内容骨架线（行错峰 2 帧 × 6 帧淡入；呼吸 = 已加载感） */}
      {Array.from({length: lines}, (_, i) => {
        const n = N_skel(skel, i);
        const op = fadeIn(n, 6) * (mini ? 0.5 : 0.62 + 0.14 * breath);
        if (op <= 0.01) return null;
        const yy = i === 0 ? cTop : cTop + (mini ? 24 : 42) + (i - 1) * (mini ? 16 : 30);
        const ww = (i === 0 ? 0.52 : lw[i % lw.length]) * (w - (mini ? 24 : 48));
        return <div key={i} style={{position: 'absolute', left: x + (mini ? 12 : 24), top: yy, width: ww, height: mini ? 5 : 9, borderRadius: 3, background: i === 0 ? GREY_LIGHT : '#3c3c46', opacity: op}} />;
      })}
      {/* Enter 键帽（SC01：打完字后出现在内容区右下） */}
      {!mini && enterShow > 0.01 ? (
        <div style={{position: 'absolute', left: x + w - 110, top: y + h - 54, opacity: enterShow, transform: `translateY(${(4 * enterPress).toFixed(1)}px)`}}>
          <Box x={0} y={0} w={86} h={40} r={8} fill="#06070c" stroke={enterPress > 0.3 ? PURPLE_LIGHT : WHITE} sw={2}
            style={{boxShadow: enterPress > 0.3 ? GLOW_PURPLE_S : BLOOM_SOFT}} />
          <CText cx={43} cy={20} size={24} weight={700} family={FONT_ORB} color={WHITE} dy={0}>{'\u23CE'}</CText>
        </div>
      ) : null}
    </div>
  );
};
const N_skel = (skel: number, i: number) => clamp01(skel * 6 - i * 1.05) * 6; // 行 i 的入场进度

// ===================== SC03→SC04 承接：IP 数字（两镜头共用同参数，交界帧像素一致）=====================
export const IPNUM = {cx: 940, cy: 330, size: 54, shadow: '4px 4px 0 #6630F8, 0 0 24px rgba(102,45,248,.5)'};
export const IpNumber: React.FC<{cx?: number; cy?: number; size?: number; opacity?: number; brightness?: number}> = ({cx = IPNUM.cx, cy = IPNUM.cy, size = IPNUM.size, opacity = 1, brightness}) => (
  <CText cx={cx} cy={cy} size={size} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1} opacity={opacity} shadow={IPNUM.shadow} dy={0}
    style={brightness && brightness > 1.01 ? {filter: `brightness(${brightness.toFixed(2)})`} : undefined}>
    {EXAMPLE.ip}
  </CText>
);

// ===================== SC04 巨信封（封口朝上 + 空虚线地址框 + HeroGlow）=====================
/** 信封体 y [cy−bodyH/2, cy+bodyH/2]，封口三角在其上方 flapH 高。addrP 0..1 地址框 draw-on（clip 左→右）。 */
export const BigEnvelope: React.FC<{cx: number; cy: number; w?: number; bodyH?: number; flapH?: number; addrP?: number; glowK?: number; N?: number; opacity?: number; dy?: number}> = ({cx, cy, w = 440, bodyH = 250, flapH = 110, addrP = 1, glowK = 1, N, opacity = 1, dy = 0}) => {
  const bx = cx - w / 2, by = cy - bodyH / 2 + dy;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <HeroGlow x={bx} y={by - flapH * 0.5} w={w} h={bodyH + flapH * 0.5} r={26} N={N} k={glowK} />
      <Svg bloom>
        {/* 封口三角（朝上） */}
        <path d={`M${bx},${by + 1} L${cx},${by - flapH} L${bx + w},${by + 1} Z`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        {/* 信封体 */}
        <rect x={bx} y={by} width={w} height={bodyH} rx={10} fill="#000" stroke={WHITE} strokeWidth={3} />
        {/* 空的虚线地址框（draw-on：clip 左→右） */}
        {addrP > 0.01 ? (
          <>
            <defs>
              <clipPath id="g1env-addr"><rect x={cx - 150} y={cy - 28} width={Math.max(0.1, 300 * clamp01(addrP))} height={56} /></clipPath>
            </defs>
            <rect x={cx - 150} y={cy - 28} width={300} height={56} rx={6} fill="none" stroke={GREY_LIGHT} strokeWidth={2.5} strokeDasharray="10 8" clipPath="url(#g1env-addr)" />
          </>
        ) : null}
      </Svg>
    </div>
  );
};

// ===================== SC04 铅笔（找不到地址写不了：悬停打转）=====================
export const PencilIcon: React.FC<{cx: number; cy: number; len?: number; rot?: number; scale?: number; opacity?: number}> = ({cx, cy, len = 58, rot = 0, scale = 1, opacity = 1}) => (
  <div style={{position: 'absolute', left: cx, top: cy, opacity, transform: `translate(-50%,-50%) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`}}>
    <svg width={len + 30} height={36} viewBox={`0 0 ${len + 30} 36`} style={{overflow: 'visible', filter: BLOOM_SOFT, display: 'block'}}>
      <rect x={12} y={9} width={len - 16} height={18} rx={2} fill="#000" stroke={WHITE} strokeWidth={2.5} />
      <path d={`M${len - 4},9 L${len + 16},18 L${len - 4},27 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={18} y={13} width={12} height={10} fill="none" stroke={GREY} strokeWidth={1.5} />
      <rect x={0} y={9} width={12} height={18} rx={2} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={2} />
    </svg>
  </div>
);

// ===================== SC05 循环箭头（every single time ↻）=====================
/** 300° 圆弧 + 箭头，p 0..1 draw-on；rot 持续旋转（度）。白描边 BLOOM + 紫柔光（本镜头焦点）。 */
export const LoopArrow: React.FC<{cx: number; cy: number; r?: number; p?: number; rot?: number; opacity?: number}> = ({cx, cy, r = 34, p = 1, rot = 0, opacity = 1}) => {
  if (p <= 0.01) return null;
  const a0 = -Math.PI / 2;
  const sweep = Math.PI * 2 * 0.83;
  const a1 = a0 + sweep;
  const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
  const tang = a1 + Math.PI / 2; // 切线方向
  const L = Math.PI * r * sweep;
  const hx = x1 + Math.cos(tang) * 15, hy = y1 + Math.sin(tang) * 15;
  const px = -Math.sin(tang), py = Math.cos(tang);
  const headP = clamp01((p - 0.75) / 0.25); // 箭头在弧将满时才长出
  return (
    <Svg bloom>
      <g transform={`rotate(${rot.toFixed(2)} ${cx} ${cy})`} opacity={opacity} style={{filter: `drop-shadow(0 0 14px 5px rgba(102,48,248,.45))`}}>
        <path d={`M${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 1 1 ${x1},${y1}`} fill="none" stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${L}`} strokeDashoffset={L * (1 - clamp01(p))} />
        {headP > 0.01 ? (
          <polygon points={`${hx},${hy} ${x1 + px * 9 * headP},${y1 + py * 9 * headP} ${x1 - px * 9 * headP},${y1 - py * 9 * headP}`} fill={WHITE} opacity={headP} />
        ) : null}
      </g>
    </Svg>
  );
};

// ===================== SC05 三连卡（浏览器缩略 + 回车键帽 + 问号）=====================
/** 卡片本体由 SC05 里画；这里是卡内的回车键帽（press 0..1 按下深度）。 */
export const EnterKey: React.FC<{cx: number; cy: number; press?: number; opacity?: number}> = ({cx, cy, press = 0, opacity = 1}) => (
  <div style={{position: 'absolute', left: cx - 44, top: cy - 20, opacity, transform: `translateY(${(5 * press).toFixed(1)}px)`}}>
    <Box x={0} y={0} w={88} h={40} r={9} fill="#06070c" stroke={press > 0.3 ? PURPLE_LIGHT : WHITE} sw={2.5} style={{boxShadow: press > 0.3 ? GLOW_PURPLE_S : BLOOM_SOFT}} />
    <CText cx={44} cy={20} size={26} weight={700} family={FONT_ORB} color={WHITE} dy={0}>{'\u23CE'}</CText>
  </div>
);
