import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {StickyNote, MilkCarton, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, GREEN, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 4659, T = 4973; // SC20: 4659–4973（S33–S34 ¶：TTL 牛奶盒）

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // TTL glitch + 牛奶盒缩放入场（4667 = S33.c1）
  const ttlN = N - 4667;
  const cartonK = clamp01((N - 4667) / 21);
  // 60 s 计数落定（4726 = S33.c3）
  const sec = N >= 4726 ? Math.round(kf(N, [[4726, 0], [4746, 60]])) : 0;
  const ownerOp = kf(N, [[4757, 0.25], [4765, 1]]); // set by the record's owner（4757 = S33 尾）
  // 左便签（4807 = S34.c1 绿）
  const leftK = N >= 4807 ? clamp01((N - 4807) / 14) : 0;
  // 右便签过期（4874 = S34.c2/c3：60→0 快滚 + Cross）
  const rightK = N >= 4874 ? clamp01((N - 4874) / 14) : 0;
  const ttlRight = N >= 4874 ? Math.max(0, Math.round(kf(N, [[4874, 60], [4918, 0]]))) : 60;
  const crossK = N >= 4918 ? clamp01((N - 4918) / 12) : 0;
  // 盒盖呼吸
  const lid = 0.5 + 0.5 * Math.sin(N / 28 * Math.PI * 2);
  // 慢推
  const zoom = 1 + 0.05 * clamp01((N - 4680) / 50);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 390, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* TTL 大字（glitch，牛奶盒上方） */}
        {ttlN > 0 && (
          <div style={{position: 'absolute', left: 0, top: -210, transform: 'translateX(-50%)'}}>
            <GlitchIn N={N} f0={4667}>
              <span style={{fontFamily: "'Audiowide', sans-serif", fontSize: 84, color: WHITE, letterSpacing: 8, textShadow: '6px 6px 0 #6630F8, 0 0 30px rgba(102,48,248,.5)'}}>TTL</span>
            </GlitchIn>
            <div style={{textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, marginTop: 10}}>time to live</div>
          </div>
        )}
        {/* 主角：牛奶盒 */}
        {cartonK > 0 && (
          <div style={{transform: `scale(${cartonK})`}}>
            <MilkCarton cx={0} cy={40} w={230} h={310} label={`TTL ${sec} s`} dateText="fresh until" glow={N > 4746} />
            {/* 盖呼吸（微开合） */}
            <div style={{position: 'absolute', left: -60, top: -128, width: 120, height: 10, background: '#000', border: `2px solid ${WHITE}`, transform: `rotate(${lid * 4 - 2}deg)`, transformOrigin: 'left center', opacity: 0.85}} />
          </div>
        )}
        {/* 左便签：新鲜（绿） */}
        {leftK > 0 && (
          <div style={{position: 'absolute', left: -420, top: -10, transform: `scale(${leftK})`}}>
            <StickyNote x={0} y={0} w={190} h={160} lines={[EXAMPLE.noteRows[0].name, '= ' + EXAMPLE.ip]} ttl={`${sec} s`} ttlColor={GREEN} lit />
          </div>
        )}
        {/* 右便签：过期（橙红 + Cross） */}
        {rightK > 0 && (
          <div style={{position: 'absolute', left: 230, top: -10, transform: `scale(${rightK})`}}>
            <StickyNote x={0} y={0} w={190} h={160} lines={[EXAMPLE.noteRows[0].name, '= ?']} ttl={crossK > 0 ? '0 s' : `${ttlRight} s`} ttlColor={ORANGE} />
            {crossK > 0 && <div style={{position: 'absolute', left: 60, top: 46, transform: `scale(${crossK})`}}><Cross2 cx={0} cy={0} size={70} /></div>}
          </div>
        )}
        {/* owner 灰字 */}
        {ownerOp > 0 && <div style={{position: 'absolute', left: -240, top: 220, width: 480, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY, opacity: ownerOp}}>set by the record's owner</div>}
      </div>
    </div>
  );
};
function Cross2({cx, cy, size}: {cx: number; cy: number; size: number}) {
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2}}>
      <line x1="6" y1="6" x2={size - 6} y2={size - 6} stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <line x1={size - 6} y1="6" x2="6" y2={size - 6} stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
export const SC20_RANGE = {from: F0, to: T};
