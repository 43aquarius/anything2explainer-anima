import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {CText, Pill, EXAMPLE, GREY, WHITE, exitOp, stagger, GLOW_PURPLE_S, BLOOM_SOFT} from '../../ui';

const F0 = 876, T = 1022; // SC05: 876–1022 (S07 ¶)

const CARDS = [
  {x: 250, enter: 884, pressAt: 6},
  {x: 640, enter: 886, pressAt: 22},
  {x: 1030, enter: 888, pressAt: 38},
];

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 循环箭头（949 节拍，draw-on 14 帧 + 慢旋转持续）
  const arrowK = N >= 949 ? clamp01((N - 949) / 14) : 0;
  const arrowRot = N >= 963 ? (N - 963) * 0.02 : 0; // 慢旋转（8°/秒）
  // 灰字（949 起 SoftIn）
  const sub = N >= 949 ? kf(N, [[949, 0.25], [957, 1]]) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 三连卡：浏览器 + 回车键循环 + 问号 */}
      {CARDS.map((c, i) => {
        const inK = kf(N, [[c.enter, 0], [c.enter + 18, 1]], (u) => Math.pow(1 - u, 0.4));
        if (inK <= 0) return null;
        const dy = (1 - inK) * 110;
        // 回车键循环按下（每 44 帧一按，8 帧动画，各卡错相）
        const ph = (N + c.pressAt) % 44;
        const press = ph < 8 ? Math.sin((ph / 8) * Math.PI) * 10 : 0;
        // 问号呼吸（30 帧周期，错峰）
        const qScale = 1 + 0.06 * Math.sin((N + i * 10) / 30 * Math.PI * 2);
        return (
          <div key={i} style={{position: 'absolute', left: c.x - 130, top: 250 + dy, width: 260, height: 300, opacity: inK}}>
            {/* 浏览器缩略 */}
            <div style={{position: 'absolute', left: 15, top: 0, width: 230, height: 180, border: `2px solid ${GREY}`, borderRadius: 8, background: '#000'}}>
              <div style={{position: 'absolute', left: 10, top: 8, width: 210, height: 22, border: `1.5px solid ${GREY}`, borderRadius: 11, opacity: 0.7 }} />
              <div style={{position: 'absolute', left: 12, top: 44, width: 130, height: 14, background: '#18181c', border: `1px solid ${GREY}`}} />
              <div style={{position: 'absolute', left: 12, top: 68, width: 100, height: 14, background: '#18181c', border: `1px solid ${GREY}`}} />
            </div>
            {/* 回车键 */}
            <div style={{position: 'absolute', left: 96, top: 196, transform: `translateY(${press}px)`}}>
              <div style={{width: 68, height: 44, border: `2.5px solid ${WHITE}`, borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 20, color: WHITE, filter: press > 4 ? 'brightness(1.5)' : undefined, boxShadow: press > 2 ? GLOW_PURPLE_S : undefined}}>↵</div>
            </div>
            {/* 问号（呼吸） */}
            <div style={{position: 'absolute', left: 178, top: 186, transform: `scale(${qScale})`, fontFamily: "'Orbitron', sans-serif", fontSize: 52, fontWeight: 700, color: GREY, opacity: 0.9}}>?</div>
          </div>
        );
      })}
      {/* 循环箭头（主角，中央下方） */}
      {arrowK > 0 && (
        <div style={{position: 'absolute', left: 640, top: 620, transform: `translate(-50%, -50%) rotate(${arrowRot}deg) scale(${arrowK})`, filter: BLOOM_SOFT}}>
          <svg width="120" height="120">
            <path d="M 60 18 A 42 42 0 1 1 18 60" fill="none" stroke={WHITE} strokeWidth={5} strokeLinecap="round" strokeDasharray={264} strokeDashoffset={(1 - arrowK) * 264} />
            <polygon points="18,44 18,76 46,60" fill="#000" stroke={WHITE} strokeWidth={3.5} strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {/* 灰字 */}
      {sub > 0 && <CText cx={640} cy={706 - 96 + 96} size={26} color={GREY} opacity={sub}>every single time</CText>}
      {/* Pill：every Enter */}
      {sub > 0 && <Pill x={520} y={640} w={240} h={44} text="every single Enter" fontSize={24} opacity={sub * 0.9} />}
    </div>
  );
};
export const SC05_RANGE = {from: F0, to: T};
