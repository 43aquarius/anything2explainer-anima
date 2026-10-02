import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {Box, MonoText, Pill, GREY, GREY_MID, GREY_LINE, PURPLE, WHITE, abs, fadeIn, exitOp, glowOffK, SoftIn, EXAMPLE} from '../../ui';
import {HeroGlow} from '../../fx';
import {HERO_END} from './SC04';

/**
 * SC05 信封的解剖 · N 716–874（S06 724–872：724「header」/ 762「address on the envelope」/ 812「payload」）
 * 承接：SC04 的放大信封（同尺寸 110×76、同中心 (640,360)、HeroGlow 相连）716–734 kf 18 帧 easeOut 放大到 520×320（不清场）；
 *       原信封的"^"封口折线随放大 12 帧淡出（大信封的封口改为右下角折角，848 draw-on）。
 * 节拍：724 虚线分隔 wipe 12 帧（y312）+ header Pill SoftIn（骑顶边随放大落位）；
 *       762/767 from/to 字段打字机（灰 label + 白 IP，2 帧/字，~793 满）；
 *       812 payload Pill SoftIn + 3 条灰文本线逐行 wipe（6 帧错峰）；820 起数据点阵 24 格逐格点亮（3 帧/格，持续到离场）；
 *       848 右下角封口折线 draw-on 12 帧；全镜 1→1.05 慢推（运镜）。
 * 停留：段内不判（S06 非 ¶）；866–874 归零。主角：巨信封 320px，HeroGlow 常亮（glowOffK 先灭）。零 glitch。
 */
const F0 = 716;
const T_GROW = 716;
const T_DIV = 724;
const T_FROM = 762;
const T_TO = 767;
const T_PAYLOAD = 812;
const T_DOTS = 820;
const T_FOLD = 848;
const TO = 874;
/** 巨信封终态（中心 640,360） */
const ENV = {cx: 640, cy: 360, w: 520, h: 320};

const Field: React.FC<{y: number; label: string; ip: string; t0: number; N: number}> = ({y, label, ip, t0, N}) => {
  const op = fadeIn(N - t0, 6);
  if (op <= 0) return null;
  const chars = Math.max(0, Math.min(ip.length, Math.floor((N - (t0 + 2)) / 2)));
  return (
    <div style={{...abs(415, y), opacity: op}}>
      <MonoText x={0} y={0} size={22} color={GREY}>
        {label + ' '}
        <span style={{color: WHITE}}>{ip.slice(0, chars)}</span>
      </MonoText>
    </div>
  );
};

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6, 8);
  // 承接放大：110×76 → 520×320（easeOut 2.2，18 帧）
  const g = 1 - Math.pow(1 - clamp01((N - T_GROW) / 18), 2.2);
  const W = HERO_END.w + (ENV.w - HERO_END.w) * g;
  const H = HERO_END.h + (ENV.h - HERO_END.h) * g;
  const EX = ENV.cx - W / 2, EY = ENV.cy - H / 2;
  const sw = 2.5 + 0.5 * g;
  const flapOp = 1 - clamp01((N - T_GROW) / 12);
  const divP = clamp01((N - T_DIV) / 12);
  const dotRanks = Array.from({length: 24}, (_, i) => i);
  // 慢推
  const camS = 1 + 0.05 * clamp01((N - F0) / (TO - F0));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(640px,360px) scale(${camS.toFixed(4)}) translate(-640px,-360px)`}}>
        <HeroGlow x={EX} y={EY} w={W} h={H} r={16} N={N} k={glowK} />
        {/* 信封体（黑底白边） */}
        <div style={{...abs(EX, EY, W, H), filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
          <Box x={0} y={0} w={W} h={H} sw={sw} />
          {/* 原"^"折线（随放大淡出） */}
          {flapOp > 0 ? (
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: flapOp}}>
              <path d={`M${sw},${H - sw} L${W / 2},${H * 0.42} L${W - sw},${H - sw}`} fill="none" stroke={WHITE} strokeWidth={sw * 0.9} strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
        {/* 虚线分隔（header / payload 分界） */}
        {divP > 0 ? <div style={{...abs(383, 311, (897 - 383) * divP, 0), borderTop: '2px dashed rgba(160,160,161,.9)', opacity: 0.95}} /> : null}
        {/* header Pill（骑顶边，随放大落位到 (402,183)） */}
        <SoftIn N={N} f0={T_DIV} len={6} dy={4}>
          <Pill x={EX + 22} y={EY - 17} w={130} h={36} fill={PURPLE} sw={2} text="header" fontSize={24} weight={700} letterSpacing={0} />
        </SoftIn>
        {/* from / to 字段（打字机） */}
        <Field y={248} label="from" ip={EXAMPLE.clientIp} t0={T_FROM} N={N} />
        <Field y={280} label="to" ip={EXAMPLE.serverIp} t0={T_TO} N={N} />
        {/* payload Pill + 3 条文本线（逐行 wipe） */}
        <SoftIn N={N} f0={T_PAYLOAD}>
          <Pill x={412} y={330} w={150} h={36} fill="#000" stroke={WHITE} sw={2} text="payload" fontSize={24} weight={700} letterSpacing={0} />
        </SoftIn>
        {[0, 1, 2].map((i) => {
          const p = easeOutCubic(clamp01((N - (T_PAYLOAD + 4 + 6 * i)) / 12));
          if (p <= 0) return null;
          const w = [240, 210, 150][i];
          return <div key={i} style={{...abs(435, 392 + 32 * i, w * p, 6), background: GREY_MID, opacity: 0.9}} />;
        })}
        {/* 数据点阵（逐格点亮，持续动作） */}
        {dotRanks.map((i) => {
          const c = i % 6, r = Math.floor(i / 6);
          const lit = clamp01((N - (T_DOTS + 3 * i)) / 4);
          if (lit <= 0) return null;
          return (
            <div
              key={i}
              style={{
                ...abs(700 + c * 32, 385 + r * 30, 10, 10),
                borderRadius: 2,
                background: lit >= 1 ? WHITE : 'rgba(255,255,255,.25)',
                border: `1.5px solid ${lit >= 1 ? WHITE : GREY_LINE}`,
                opacity: 0.35 + 0.65 * lit,
              }}
            />
          );
        })}
        {/* 右下角封口折线（draw-on 12 帧，(860,520)→(900,480)→(900,520)） */}
        {(() => {
          const p = clamp01((N - T_FOLD) / 12);
          if (p <= 0) return null;
          const L1 = Math.hypot(40, 40) + 40;
          return (
            <svg width={140} height={60} viewBox="0 0 140 60" style={{...abs(860, 462), overflow: 'visible'}}>
              <path d="M0,58 L40,18 L40,58" fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray={L1} strokeDashoffset={L1 * (1 - p)} opacity={0.9} />
              <path d="M0,58 L8,50" fill="none" stroke={WHITE} strokeWidth={2} opacity={0.35} />
            </svg>
          );
        })()}
      </div>
    </div>
  );
};
