import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf, rnd} from '../../common';
import {CText, Pill, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, exitOp, stagger, SoftIn} from '../../ui';

const F0 = 377, T = 604; // SC03: 377–604 (S03–S04¶)

const NAME_TAGS = ['news.example', 'mail.example'];
const IPS = ['198.51.100.7', '203.0.113.42', '192.0.2.19', '198.51.100.88', '203.0.113.5', '192.0.2.200', '198.51.100.31'];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 中线 draw-on（385 节拍，16 帧）
  const lineK = clamp01((N - 385) / 16);
  // 右半数字 GlitchIn（447）
  const numN = N - 447;
  // 右侧点阵（447 起 2 帧错峰亮起；之后 40 帧周期轮换呼吸）
  const dotOn = (i: number) => {
    const litAt = 449 + i * 2;
    if (N < litAt) return 0;
    const phase = Math.floor((N - litAt) / 24);
    return phase % IPS.length === i % IPS.length ? 1 : 0.5;
  };
  // 左半（489）
  const lName = N >= 489 ? 1 : 0;
  const lineFlash = N >= 531 && N < 534;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 中线（分屏，主角组合的一部分） */}
      <div style={{position: 'absolute', left: 640, top: 140, height: 400 * lineK, width: 0, borderLeft: `3px solid ${lineFlash ? WHITE : GREY}`, filter: lineFlash ? 'brightness(1.8)' : undefined}} />
      {/* 左半：names — for humans */}
      <div style={{position: 'absolute', left: 90, top: 190, width: 480}}>
        <div style={{textAlign: 'center'}}>
          <Pill x={0} y={0} w={300} h={46} text="names — for humans" fontSize={25} opacity={lName ? kf(N, [[489, 0.25], [497, 1]]) : 0} />
        </div>
        {lName > 0 && (
          <div style={{marginTop: 44, textAlign: 'center'}}>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 58, color: WHITE, opacity: kf(N, [[489, 0], [501, 1]])}}>{EXAMPLE.domain}</div>
          </div>
        )}
        {NAME_TAGS.map((t, i) => {
          const at = 497 + stagger(i, 4);
          const k = kf(N, [[at, 0], [at + 12, 1]]);
          if (k <= 0) return null;
          return <div key={i} style={{position: 'absolute', left: 60 + i * 210, top: 380, opacity: k * 0.9, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>{t}</div>;
        })}
      </div>
      {/* 右半：numbers — for machines（数字侧为主角） */}
      <div style={{position: 'absolute', left: 700, top: 190, width: 480}}>
        <div style={{textAlign: 'center'}}>
          <Pill x={0} y={0} w={330} h={46} text="numbers — for machines" fontSize={25} opacity={N >= 447 ? kf(N, [[447, 0.25], [455, 1]]) : 0} />
        </div>
        <div style={{marginTop: 40, textAlign: 'center', height: 110}}>
          <GlitchIn N={N} f0={447}>
            <span style={{fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 62, color: WHITE, textShadow: '6px 6px 0 #6630F8, 0 0 28px rgba(102,48,248,.45)'}}>{EXAMPLE.ip}</span>
          </GlitchIn>
        </div>
        {/* 小 IP 点阵 */}
        <div style={{marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', maxWidth: 480}}>
          {IPS.map((ip, i) => {
            const on = dotOn(i);
            const hot = i === (Math.floor(N / 24) % IPS.length);
            return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, opacity: on}}>
              <div style={{width: hot ? 10 : 7, height: hot ? 10 : 7, background: hot ? PURPLE : GREY_LINE, borderRadius: 1, boxShadow: hot ? '0 0 12px rgba(102,48,248,1)' : undefined}} />
              <span style={{fontFamily: "'Sarasa Mono SC', monospace", fontSize: 22, color: hot ? WHITE : (on > 0.7 ? GREY : GREY_LINE), fontWeight: hot ? 800 : 400}}>{ip}</span>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
};
export const SC03_RANGE = {from: F0, to: T};
export const _R = {ORANGE, rnd, SoftIn};
