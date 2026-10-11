import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, kf} from '../../common';
import {Check, Cross, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 2993, T = 3119; // SC12: 2993–3119（S21：referral 定义卡）

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 定义卡 slideUp（3001）
  const card = kf(N, [[3001, 100], [3019, 0]], (u) => Math.pow(1 - u, 2.5));
  const cardOp = kf(N, [[3001, 0.25], [3009, 1]]);
  // 左半（3035：the answer + Cross）
  const lOp = N >= 3035 ? kf(N, [[3035, 0.25], [3043, 1]]) : 0;
  const crossP = clamp01((N - 3037) / 12);
  // 右半（3063：the next counter + Check + 箭头）
  const rOp = N >= 3063 ? kf(N, [[3063, 0.25], [3071, 1]]) : 0;
  const checkP = clamp01((N - 3065) / 12);
  const arrowP = clamp01((N - 3075) / 14);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      {/* 主角：定义卡 480×320 */}
      <div style={{position: 'absolute', left: 640, top: 430 + card, transform: 'translateX(-50%)', width: 500, height: 330, opacity: cardOp}}>
        <HeroGlow x={-250} y={-165} w={500} h={330} N={N} k={0.5} />
        <div style={{position: 'absolute', inset: 0, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 12}} />
        {/* 卡题（glitch 本镜唯一） */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center'}}>
          <GlitchIn N={N} f0={3001}>
            <span style={{fontFamily: "'Exo 2', sans-serif", fontStyle: 'italic', fontSize: 54, fontWeight: 700, color: PURPLE_LIGHT, letterSpacing: 1}}>referral</span>
          </GlitchIn>
        </div>
        {/* 左右对照 */}
        <div style={{position: 'absolute', left: 26, top: 108, width: 200, textAlign: 'center', opacity: lOp, filter: 'saturate(0.35)'}}>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, color: GREY}}>the answer</div>
          <div style={{marginTop: 26}}>{crossP > 0 && <Cross cx={100} cy={90} size={62} p={crossP} sw={7} />}</div>
        </div>
        <div style={{position: 'absolute', left: 274, top: 108, width: 200, textAlign: 'center', opacity: rOp}}>
          <div style={{fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, color: WHITE}}>the next counter</div>
          <div style={{marginTop: 26}}>{checkP > 0 && <Check cx={100} cy={90} size={62} p={checkP} sw={7} />}</div>
        </div>
        {/* 中缝点 */}
        <div style={{position: 'absolute', left: 249, top: 150, fontFamily: "'Orbitron', sans-serif", fontSize: 30, color: GREY_LINE}}>·</div>
        {/* 出画外箭头（右半） */}
        {arrowP > 0 && (
          <svg width="180" height="46" style={{position: 'absolute', left: 300, top: 60}}>
            <line x1="6" y1="22" x2={150 * arrowP} y2="22" stroke={PURPLE_LIGHT} strokeWidth={4} strokeDasharray="2 0" />
            {arrowP > 0.92 && <polygon points="146,6 178,22 146,38" fill={PURPLE_LIGHT} />}
          </svg>
        )}
      </div>
      {/* 下方小结语 */}
      {rOp > 0.9 && <div style={{position: 'absolute', left: 0, right: 0, top: 634, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 23, color: GREY, opacity: kf(N, [[3078, 0], [3086, 0.9]])}}>not the answer — just who to ask next</div>}
    </div>
  );
};
export const SC12_RANGE = {from: F0, to: T};
