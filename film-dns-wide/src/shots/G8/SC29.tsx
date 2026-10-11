import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {StampSeal, StickyNote, Pill, EXAMPLE, GREY, GREY_LINE, WHITE, GREEN, ORANGE, PURPLE, PURPLE_LIGHT, exitOp, stagger} from '../../ui';

const F0 = 7317, T = 7628; // SC29: 7317–7628（S49–S50：DNSSEC 签名链）

const CHAIN = [
  {y: -120, r: 34, label: 'root', seal: '2010'},
  {y: 0, r: 26, label: '.example', seal: ''},
  {y: 110, r: 0, label: EXAMPLE.domain, seal: ''},
];

export const SC29: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // DNSSEC 大字 glitch（7325 = S49.c1）
  const dnssecN = N - 7325;
  // 链节点依次亮（7374 = S49.c3 起，每级 10 帧）
  const nodeK = (i: number) => clamp01((N - 7374 - i * 12) / 10);
  // 章印逐级盖下（级间 12 帧）
  const sealK = (i: number) => clamp01((N - 7386 - i * 12) / 8);
  // 2010 计数（7474 = S50.c1）+ 锁扣 draw-on
  const y2010 = N >= 7474 ? Math.round(kf(N, [[7474, 1980], [7494, 2010]])) : 0;
  const lockK = clamp01((N - 7494) / 12);
  // 27 years + 沙漏（7560 = S50.c2）
  const yr27 = kf(N, [[7560, 0.25], [7568, 1]]);
  const flip = N >= 7580 && N < 7600 ? (N - 7580) / 20 : 1;
  // 链微呼吸（错峰 ±2%）—— 7600 冻结（末拍停留）
  const breath = (i: number) => (N < 7600 ? 1 + 0.02 * Math.sin((N + i * 12) / 30 * Math.PI * 2) : 1);
  // 运镜：33 帧 1→1.12 推向根节点（7474 前）
  const zoom = 1 + 0.12 * kf(N, [[7441, 0], [7474, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* DNSSEC 大字（左） */}
        {dnssecN > 0 && (
          <div style={{position: 'absolute', left: -560, top: -80}}>
            <GlitchIn N={N} f0={7325}>
              <span style={{fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 900, fontSize: 56, color: WHITE, WebkitTextStroke: '2px #6630F8', paintOrder: 'stroke fill', letterSpacing: 1, filter: 'drop-shadow(0 0 14px rgba(102,48,248,.5))'}}>DNSSEC</span>
            </GlitchIn>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 12, opacity: kf(N, [[7374, 0], [7386, 1]])}}>a chain of trust,<br />from the root down</div>
          </div>
        )}
        {/* 垂直信任链（居中） */}
        <div style={{position: 'absolute', left: -40, top: -180, width: 300, height: 400}}>
          {CHAIN.map((c, i) => {
            const k = nodeK(i);
            if (k <= 0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 60, top: c.y, opacity: k, transform: `scale(${breath(i)})`}}>
                {i < 2 ? (
                  <div style={{width: c.r * 2, height: c.r * 2, borderRadius: '50%', border: `3px solid ${i === 0 ? PURPLE_LIGHT : WHITE}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: i === 0 ? 22 : 17, color: GREY, boxShadow: i === 0 ? '0 0 16px rgba(161,117,241,.55)' : undefined}}>
                    {c.label}
                    {/* 根锁扣（2010 后闭合） */}
                    {i === 0 && lockK > 0 && (
                      <svg width="26" height="26" style={{position: 'absolute', top: -22, left: '50%', marginLeft: -13}}><rect x="4" y="12" width="18" height="12" fill="#000" stroke={WHITE} strokeWidth="2.5" /><path d={`M7,12 v-4 a6,6 0 0 1 12,0 v4`} fill="none" stroke={WHITE} strokeWidth="2.5" strokeDasharray={26} strokeDashoffset={26 - 26 * lockK} /></svg>
                    )}
                  </div>
                ) : (
                  <Pill x={0} y={0} w={240} h={48} text={c.label} fontSize={24} opacity={k} />
                )}
                {/* 级间连线 */}
                {i < 2 && k >= 1 && <div style={{position: 'absolute', left: c.r, top: c.r * 2 + 6, width: 2, height: 88, background: GREY_LINE}} />}
                {/* 章印 */}
                {sealK(i) > 0 && <div style={{position: 'absolute', left: c.r + 16, top: -6}}><StampSeal cx={0} cy={0} r={30} text={i === 0 ? '2010' : '✓'} p={sealK(i)} /></div>}
              </div>
            );
          })}
          {/* A 记录便签（链底） */}
          {nodeK(2) >= 1 && (() => {
            const sk = clamp01((N - 7410) / 12);
            return sk > 0 && (
              <div style={{position: 'absolute', left: 30, top: 170, transform: `scale(${sk})`}}>
                <StickyNote x={0} y={0} w={190} h={110} lines={[EXAMPLE.domain, '= ' + EXAMPLE.ip]} ttl={EXAMPLE.ttl} ttlColor={GREEN} lit />
              </div>
            );
          })()}
        </div>
        {/* 右：2010 + 27 years */}
        <div style={{position: 'absolute', left: 240, top: -110, textAlign: 'center'}}>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 88, fontWeight: 700, color: WHITE, textShadow: '5px 5px 0 #6630F8, 0 0 24px rgba(102,48,248,.45)', opacity: y2010 > 0 ? 1 : 0}}>{y2010 > 0 ? y2010 : ''}</div>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, marginTop: 6, opacity: yr27}}>27 years later</div>
          {/* 迟到的沙漏（翻转一次） */}
          {yr27 > 0 && (
            <svg width="80" height="130" style={{marginTop: 20, transform: `rotate(${180 * flip}deg)`, opacity: 0.85}}>
              <path d="M6,4 h40 v12 l-15,26 v30 l-10,8 l-10,-8 v-30 l-15,-26 z" fill="none" stroke={GREY} strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
export const SC29_RANGE = {from: F0, to: T};
