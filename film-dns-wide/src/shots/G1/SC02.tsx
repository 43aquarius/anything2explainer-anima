import React from 'react';
import {clamp01, kf} from '../../common';
import {useCurrentFrame} from 'remotion';
import {CText, EXAMPLE, GREY, WHITE, PURPLE_LIGHT, exitOp, scaleIn, BLOOM_SOFT, GLOW_PURPLE_S} from '../../ui';

const F0 = 230, T = 376; // SC02: 230–376 (S02)

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 大字 SoftIn（238 节拍）
  const word = {opacity: N >= 238 ? kf(N, [[238, 0.25], [246, 1]]) : 0, dy: kf(N, [[238, 10], [246, 0]])};
  // ? 印章缩放入（284 节拍，21 帧）
  const qN = N - 284;
  const q = qN >= 0 ? scaleIn(qN, 21) : 0;
  const qFlash = qN >= 21 && qN < 25;
  // ? 落位后一次 2° 摆动（304–324）
  const sway = qN > 20 && qN < 41 ? Math.sin((qN - 20) / 20 * Math.PI) * 2 : 0;
  // 落位后 ? 持续呼吸（±4%，可见持续动作）
  const breathe = qN > 21 ? 1 + 0.04 * Math.sin((qN - 21) / 30 * Math.PI * 2) : 1;
  // 灰字打字机（322 节拍）
  const sub = 'no machine on the internet is named that';
  const typed = N >= 322 ? Math.floor(clamp01((N - 322) / (sub.length * 1.6)) * sub.length) : -1;
  const s = 1 + 0.05 * clamp01((N - 340) / 36); // 慢推
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 360, transform: `translate(-50%, -50%) scale(${s})`}}>
        <CText cx={0} cy={-62} size={72} weight={900} opacity={word.opacity} dy={word.dy}>{EXAMPLE.domain}</CText>
        {/* ? 印章（主角，150px，紫描边） */}
        {q > 0 && (
          <div style={{position: 'absolute', left: 128, top: -190, transform: `scale(${q * (qN > 21 ? breathe : 1)}) rotate(${sway}deg)`, transformOrigin: 'center', filter: qFlash ? 'brightness(1.6)' : undefined}}>
            <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 150, fontWeight: 700, color: '#000', WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', lineHeight: 1, filter: `drop-shadow(0 0 18px rgba(161,117,241,.75)) ${BLOOM_SOFT}`}}>&nbsp;?</div>
          </div>
        )}
        {typed >= 0 && (
          <div style={{position: 'absolute', left: -320, top: 96, width: 640, textAlign: 'center', fontFamily: FONT_H(), fontSize: 24, color: GREY, opacity: 0.95}}>
            {sub.slice(0, typed + 1)}<span style={{opacity: (N % 16) < 8 ? 1 : 0.2, color: WHITE}}>|</span>
          </div>
        )}
      </div>
    </div>
  );
};
function FONT_H() { return "'Noto Sans SC', sans-serif"; }
export const SC02_RANGE = {from: F0, to: T};
export const _U = {WHITE, GLOW_PURPLE_S};
