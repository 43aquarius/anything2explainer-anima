import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {Pill, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 1023, T = 1299; // SC06: {S08.from-8}–{S10.from-9}（S08–S09：HOSTS.TXT 文件卡）

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 文件卡 slideUp（1087 节拍）
  const card = kf(N, [[1023, 100], [1041, 0]], (u) => Math.pow(1 - u, 2.5));
  const cardOp = kf(N, [[1023, 0.25], [1031, 1]]);
  // 标题打字机（1087 起，每 2 帧 1 字）
  const title = 'HOSTS.TXT';
  const typedT = N >= 1087 ? Math.floor(clamp01((N - 1087) / 16) * title.length) : 0;
  // 标题 glitch（S09.c2 = 1142）
  // 行内容逐行 wipe（1241 = S09.c3 起）
  const rows = ['hosta   10.0.0.4', 'hostb   10.0.0.7', 'hostc   10.0.0.9', 'hostd   10.0.0.12', 'hoste   10.0.0.18'];
  // 行窗口连续平滑滚动（文件很长感，1320 起 0.5px/帧）
  const scrollPx = N > 1320 ? (N - 1320) * 0.5 % 176 : 0;
  const pill = kf(N, [[1241, 0.25], [1249, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 主角：大文件卡 560×360 */}
      <div style={{position: 'absolute', left: 360, top: 240 + card, width: 560, height: 360, opacity: cardOp}}>
        <HeroGlow x={360} y={240 + card} w={560} h={360} N={N} k={0.55} />
        <div style={{position: 'absolute', inset: 0, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 8}} />
        <div style={{position: 'absolute', right: -14, top: 40, width: 0, height: 280, borderRight: `2px dashed ${GREY_LINE}`}} />
        {/* 文件标题 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 40, fontWeight: 700, color: WHITE, letterSpacing: 2}}>
          {typedT >= title.length ? <GlitchIn N={N} f0={1241} seq={undefined}>{title}</GlitchIn> : <>{title.slice(0, typedT)}<span style={{opacity: (N % 14) < 7 && typedT < title.length ? 1 : 0, color: PURPLE_LIGHT}}>_</span></>}
        </div>
        {/* 行内容（wipe + 滚动窗口） */}
        <div style={{position: 'absolute', left: 56, top: 96, right: 46, height: 220, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scrollPx}px)`}}>
            {rows.concat(rows.slice(0, 3)).map((r, i) => {
              const at = 1241 + stagger(i, 4) + Math.floor(i / 3) * 12;
              const w = clamp01((N - at) / 12);
              const hotI = N > 1320 ? Math.floor((N - 1320) / 20) % (rows.concat(rows.slice(0, 3))).length : -1;
            const isHot = i === hotI;
            return <div key={i} style={{fontFamily: "'Sarasa Mono SC', monospace", fontSize: 24, color: isHot ? WHITE : GREY, opacity: 0.95, marginBottom: 18, width: `${w * 100}%`, overflow: 'hidden', whiteSpace: 'nowrap', background: isHot ? 'rgba(102,48,248,.18)' : 'none', borderRadius: 4, paddingLeft: isHot ? 8 : 0}}>{r}</div>;
            })}
          </div>
        </div>
        {/* 扫描线（持续动作，低分辨率下可见） */}
        {N > 1105 && (() => {
          const ph = ((N - 1105) % 36) / 36;
          const sy = 96 + ph * 220;
          return <div style={{position: 'absolute', left: 40, top: sy, width: 480, height: 5, background: PURPLE_LIGHT, opacity: 0.7, boxShadow: '0 0 14px rgba(161,117,241,.8)'}} />;
        })()}
        {/* the whole list Pill */}
        {pill > 0 && <Pill x={460} y={176} w={250} h={42} text="the whole list" fontSize={24} opacity={pill} color={PURPLE} />}
        {/* 文件夹小图标（配角） */}
        <div style={{position: 'absolute', left: -70, top: 40}}>
          <svg width="60" height="48"><rect x="2" y="10" width="56" height="36" rx="4" fill="#000" stroke={GREY} strokeWidth="2.5"/><path d="M2 14 V10 a4 4 0 0 1 4 -4 h16 l6 8" fill="none" stroke={GREY} strokeWidth="2.5"/></svg>
        </div>
      </div>
      {/* 引导小字（S09.c1 1087：for the internet's first decade） */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, color: GREY, opacity: kf(N, [[1031, 0.25], [1043, 1]])}}>the internet's first decade</div>
    </div>
  );
};
export const SC06_RANGE = {from: F0, to: T};
