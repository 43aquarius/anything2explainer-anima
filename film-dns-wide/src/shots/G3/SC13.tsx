import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PacketIcon, RackIcon, Pill, EXAMPLE, GREY, GREY_LINE, WHITE, PURPLE, PURPLE_LIGHT, exitOp, GLOW_PURPLE_S} from '../../ui';
import {HeroGlow} from '../../fx';

const F0 = 3120, T = 3340; // SC13: 3120–3340（S22–S23：TLD 柜台与权威）

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // TLD 柜台自左滑入（3183 = S22.c2，Δ280 18 帧）
  const tldX = kf(N, [[3183, -280], [3201, 0]], (u) => Math.pow(1 - u, 0.4));
  const tldOp = kf(N, [[3183, 0.6], [3189, 1]]);
  // RackIcon（右端）先入场（3128 淡入配角）
  const rackOp = kf(N, [[3128, 0.25], [3136, 1]]);
  // 问号信封弧线（3229 = S23.c1，kf 20 帧）
  const fly = N >= 3229 ? clamp01((N - 3229) / 20) : 0;
  // the same move again（3229）
  const againOp = kf(N, [[3229, 0.25], [3237, 1]]);
  // Rack 指示灯常闪（持续）
  const litCount = 2 + (Math.floor(N / 30) % 2);
  // 运镜：33 帧 1→1.15 推向右端（3291 = S23.c2 前）
  const zoom = 1 + 0.15 * kf(N, [[3255, 0], [3288, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 400, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：TLD 柜台 */}
        <div style={{position: 'absolute', left: -430 + tldX, top: -90, opacity: tldOp}}>
          <HeroGlow x={-130} y={-80} w={260} h={180} N={N} k={0.5} />
          <div style={{width: 260, height: 160, background: '#000', border: `3px solid ${WHITE}`, borderRadius: 10}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 18, display: 'flex', justifyContent: 'center'}}>
            <div style={{border: `2px solid ${PURPLE_LIGHT}`, borderRadius: 18, padding: '4px 18px', background: '#000', fontFamily: "'Sarasa Mono SC', monospace", fontSize: 30, color: PURPLE_LIGHT, boxShadow: GLOW_PURPLE_S}}>{EXAMPLE.tld}</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 74, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY}}>the TLD counter</div>
          {/* 柜台窗口 */}
          <div style={{position: 'absolute', left: 40, top: 108, width: 180, height: 38, border: `2px solid ${GREY_LINE}`, borderRadius: 6}} />
        </div>
        {/* 中连线 */}
        <div style={{position: 'absolute', left: -150, top: -8, width: 300, height: 3, background: GREY_LINE}} />
        {/* 右：权威服务器（RackIcon） */}
        <div style={{position: 'absolute', left: 240, top: -130, opacity: rackOp}}>
          <RackIcon cx={100} cy={110} w={190} h={250} units={5} lit={litCount} label="authoritative" labelSize={23} />
        </div>
        {/* 问号信封（弧线飞） */}
        {fly > 0 && fly < 1 && (
          <div style={{position: 'absolute', left: -170 + fly * 400, top: -170 - Math.sin(fly * Math.PI) * 110, transform: `rotate(${fly * 10}deg)`}}>
            <PacketIcon cx={0} cy={0} w={68} h={47} stamp="?" />
          </div>
        )}
        {/* the same move again */}
        {againOp > 0 && <div style={{position: 'absolute', left: -640, top: -220, width: 1280, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY, opacity: againOp}}>the same move again — who runs {EXAMPLE.domain}?</div>}
      </div>
    </div>
  );
};
export const SC13_RANGE = {from: F0, to: T};
