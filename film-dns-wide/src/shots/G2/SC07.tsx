import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {PhoneIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, exitOp, stagger} from '../../ui';

const F0 = 1300, T = 1644; // SC07: {S10.from-8}–{S12.from-9}（S10–S11：SRI 办公室）

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  // 办公室框 draw-on（1308 节拍，20 帧）
  const roomK = clamp01((N - 1308) / 20);
  // 电话缩放入场（1308+8）
  const phoneK = N >= 1316 ? clamp01((N - 1316) / 21) : 0;
  // 听筒循环提放（1322 起，24 帧循环）
  const lift = N >= 1322 ? Math.max(0, Math.sin((N - 1322) / 24 * Math.PI * 2)) : 0;
  // changes by phone call（1308 节拍）
  const callOp = kf(N, [[1308, 0.25], [1316, 1]]);
  // 排队节点（1444 S11.c1 起 2 帧错峰；之后队伍前移变长）
  const qNodes = 6;
  // 天花板横梁（1575 S11.c3）
  const beamK = N >= 1575 ? clamp01((N - 1575) / 16) : 0;
  const beamDown = N >= 1591 ? Math.min(6, (N - 1591) * 0.5) : 0;
  // 运镜：33 帧 1→1.15 推向办公室（1444 前）
  const zoom = 1 + 0.15 * kf(N, [[1411, 0], [1444, 1]]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 年份与出处（右上配角） */}
        <div style={{position: 'absolute', left: 330, top: -160, textAlign: 'center', opacity: kf(N, [[1308, 0], [1320, 1]])}}>
          <div style={{fontFamily: "'Orbitron', sans-serif", fontSize: 64, fontWeight: 700, color: GREY}}>1974</div>
          <div style={{fontFamily: "'Sarasa Mono SC', monospace", fontSize: 22, color: GREY_LINE, marginTop: 6}}>RFC 608</div>
        </div>
        {/* 主角：办公室（透视矩形 + 电话） */}
        <div style={{position: 'absolute', left: -170, top: -150, width: 340, height: 280}}>
          <svg width="340" height="280">
            <rect x="2" y="2" width="336" height="276" fill="none" stroke={WHITE} strokeWidth="3" strokeDasharray={1200} strokeDashoffset={(1 - roomK) * 1200} />
            <line x1="14" y1="46" x2="326" y2="46" stroke={GREY_LINE} strokeWidth="1.5" opacity={0.7}/>
          </svg>
          <div style={{position: 'absolute', left: 96, top: 80, transform: `scale(${phoneK})`, transformOrigin: 'center'}}>
            <PhoneIcon cx={0} cy={0} w={140} h={150} lift={lift} />
          </div>
          <div style={{position: 'absolute', left: 24, top: 196, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 24, color: GREY}}>SRI · one office</div>
          {callOp > 0 && <div style={{position: 'absolute', left: 176, top: 96, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: ORANGE, opacity: callOp}}>changes by phone call</div>}
        </div>
        {/* 排队节点（右侧：全网主机等接入） */}
        <div style={{position: 'absolute', left: 220, top: -60}}>
          {Array.from({length: qNodes}).map((_, i) => {
            const at = 1444 + stagger(i, 4);
            const inK = clamp01((N - at) / 12);
            // 队伍每 24 帧变长一点（前移动画：整体 x 微移）
            const crowd = Math.min(26, Math.max(0, (N - 1500) / 24));
            const qx = 30 + i * 52 + crowd;
            const blink = (N + i * 9) % 46 < 23;
            return <div key={i} style={{position: 'absolute', left: qx, top: i % 2 === 0 ? 0 : 26, opacity: inK * 0.95}}>
              <div style={{width: 16, height: 16, borderRadius: '50%', border: `2.5px solid ${i === 2 ? WHITE : GREY}`, background: '#000', boxShadow: blink ? '0 0 8px rgba(255,255,255,.6)' : undefined}} />
              <div style={{marginTop: 8, fontFamily: "'Sarasa Mono SC', monospace", fontSize: 20, color: GREY_LINE}}>host{i + 1}</div>
            </div>;
          })}
          {/* 队伍抖动一下（1511 S11.c2） */}
          <div style={{position: 'absolute', left: 20, top: -70, fontFamily: "'Noto Sans SC', sans-serif", fontSize: 22, color: GREY, opacity: kf(N, [[1511, 0.25], [1519, 1]])}}>thousands of hosts, one line</div>
        </div>
        {/* 天花板横梁（1575：到顶感） */}
        {beamK > 0 && (
          <div style={{position: 'absolute', left: -190, top: -214 + beamDown, width: 380, height: 26, opacity: beamK}}>
            <div style={{width: '100%', height: '100%', border: `3px solid ${ORANGE}`, background: 'rgba(0,0,0,.7)', boxShadow: '0 0 26px rgba(240,95,65,.35)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: -34, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 26, fontWeight: 800, color: ORANGE}}>that was the ceiling</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC07_RANGE = {from: F0, to: T};
