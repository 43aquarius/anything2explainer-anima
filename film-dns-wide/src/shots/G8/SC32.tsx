import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {BrowserWin, PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 8204, T = 8454; // SC32: 8204–8454（S54–S55：回扣：半秒全景）

const STOPS = [
  {x: 200, at: 8304, label: 'ask', icon: 'browser'},
  {x: 480, at: 8330, label: 'resolver', icon: 'person'},
  {x: 760, at: 8356, label: 'counters', icon: 'book'},
  {x: 1040, at: 8382, label: 'A record', icon: 'record'},
];

export const SC32: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 浏览器缩略 + 计时（8212 = S54.c1）
  const brOp = kf(N, [[8212, 0.25], [8220, 1]]);
  const ms = N >= 8212 ? Math.round(kf(N, [[8212, 0], [8232, 5]])) / 10 : 0;
  // 旅程带 draw-on（8304 = S55.c1 起 24 帧）
  const bandK = clamp01((N - 8304) / 24);
  // 四节点依次亮（8304+10i）
  const nodeK = (i: number) => clamp01((N - STOPS[i].at) / 10);
  // 便签剪影（8370 = S55.c2）
  const notesOp = kf(N, [[8370, 0], [8382, 1]]);
  // 末端信封放大（8427 = S55.c3）
  const envK = N >= 8427 ? clamp01((N - 8427) / 16) : 0;
  const envS = 1 + envK * 0.3;
  const envFloat = N >= 8443 && N < 8454 ? -3 * clamp01((N - 8443) / 11) : (N >= 8454 ? -3 : 0);
  // 节点呼吸轮亮（8400 起 40 帧周期，8440 冻结）
  const hotIdx = N >= 8400 && N < 8440 ? Math.floor((N - 8400) / 40) % 4 : -1;
  // 慢推
  const zoom = 1 + 0.05 * clamp01((N - 8340) / 60);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 上：浏览器 + 计时 */}
        <div style={{position: 'absolute', left: -350, top: -300, opacity: brOp}}>
          <BrowserWin x={0} y={0} w={300} h={230} skeleton={3} barP={1} skelOpacity={N < 8440 ? 0.55 + 0.12 * Math.sin(N / 24 * Math.PI) : 0.58} />
          <div style={{position: 'absolute', left: 340, top: 30}}>
            <span style={{fontFamily: "'Orbitron', sans-serif", fontSize: 64, fontWeight: 700, color: WHITE, textShadow: '4px 4px 0 #6630F8, 0 0 22px rgba(102,48,248,.4)'}}>&#8776;{ms.toFixed(1)} s</span>
            <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, marginTop: 6}}>you, half a second ago</div>
          </div>
        </div>
        {/* 旅程带 */}
        <svg width="1000" height="6" style={{position: 'absolute', left: -500, top: 40}}>
          <line x1="0" y1="3" x2={1000 * bandK} y2="3" stroke={WHITE} strokeWidth="3" />
        </svg>
        {/* 四节点 */}
        {STOPS.map((s, i) => {
          const k = nodeK(i);
          if (k <= 0) return null;
          const hot = i === hotIdx;
          return (
            <div key={i} style={{position: 'absolute', left: s.x - 60, top: 70, opacity: k, transform: `scale(${hot ? 1.14 : 1})`, filter: hot ? 'brightness(1.5)' : undefined}}>
              <div style={{width: 64, height: 64, borderRadius: 12, border: `2.5px solid ${hot ? PURPLE_LIGHT : WHITE}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: hot ? '0 0 16px rgba(161,117,241,.5)' : undefined}}>
                {s.icon === 'browser' && <svg width="36" height="28"><rect x="2" y="2" width="32" height="24" rx="3" fill="none" stroke={GREY} strokeWidth="2" /><line x1="6" y1="8" x2="30" y2="8" stroke={GREY} strokeWidth="2" /></svg>}
                {s.icon === 'person' && <svg width="26" height="32"><circle cx="13" cy="8" r="6" fill="none" stroke={GREY} strokeWidth="2" /><path d="M2,30 C2,20 24,20 24,30" fill="none" stroke={GREY} strokeWidth="2" /></svg>}
                {s.icon === 'book' && <svg width="32" height="28"><path d="M16,4 C11,1 5,1 2,3 V25 C5,23 11,23 16,26 C21,23 27,23 30,25 V3 C27,1 21,1 16,4 Z" fill="none" stroke={GREY} strokeWidth="2" /></svg>}
                {s.icon === 'record' && <svg width="30" height="30"><circle cx="15" cy="15" r="12" fill="none" stroke={GREY} strokeWidth="2" /><circle cx="15" cy="15" r="4" fill="none" stroke={GREY} strokeWidth="2" /></svg>}
              </div>
              <div style={{marginTop: 10, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 21, color: GREY}}>{s.label}</div>
            </div>
          );
        })}
        {/* 便签剪影（中段上方） */}
        {notesOp > 0 && [0, 1].map(i => (
          <div key={i} style={{position: 'absolute', left: 460 + i * 90, top: -20, opacity: notesOp * 0.8}}>
            <div style={{width: 70, height: 58, background: '#000', border: `2px solid ${GREY}`, borderRadius: 3, transform: `rotate(${i ? 3 : -4}deg)`}} />
          </div>
        ))}
        {/* 末端信封（放大 + 地址） */}
        {envK > 0 && (
          <div style={{position: 'absolute', left: 1096, top: 66 + envFloat, transform: `scale(${envS})`}}>
            <PacketIcon cx={0} cy={0} w={76} h={52} accent glow stamp="ok" />
            <div style={{position: 'absolute', left: -50, top: 54, width: 200, textAlign: 'center', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 19, color: PURPLE_LIGHT, opacity: envK}}>{EXAMPLE.ip}</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC32_RANGE = {from: F0, to: T};
