import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf} from '../../common';
import {RootTower, PacketIcon, EXAMPLE, GREY, GREY_LINE, WHITE, ORANGE, PURPLE, PURPLE_LIGHT, exitOp} from '../../ui';

const F0 = 3919, T = 4139; // SC17: 3919–4139（S28–S29 ¶ 章末：熔化的根）

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitK = N > T - 10 ? exitOp(N, T) : 1;
  // 热浪（3963 = S28.c2 "根会熔化"）：塔描边渐橙 + 3 圈热浪上升
  const heat = N >= 3963 ? Math.min(1, (N - 3963) / 30) : 0;
  const meltWord = kf(N, [[3971, 0.25], [3979, 1]]);
  // 右半走廊（4036 = S29.c1）：三个静止信封 + 走廊灯
  const corrOp = kf(N, [[4036, 0], [4048, 1]]);
  // 灯二次调暗（4096 = S29.c2 之后：4098 起 50→50%）
  const dim2 = N > 4098 ? Math.max(0.5, 1 - (N - 4098) * 0.017) : 1;
  // 灰尘小点（4050 起 8px/s 缓飘）
  const dustX = N > 4050 ? ((N - 4050) * 0.27) % 300 : -10;
  // 慢推
  const zoom = 1 + 0.05 * clamp01((N - 3960) / 50);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 380, transform: `translate(-50%, -50%) scale(${zoom})`}}>
        {/* 左：熔化的根塔（主角） */}
        <div style={{position: 'absolute', left: -400, top: -130}}>
          <RootTower cx={0} cy={0} w={200} h={260} units={4} heat={heat} />
          {/* 热浪圈（heat 时上升循环） */}
          {heat > 0.2 && [0, 1, 2].map(i => {
            const ph = ((N - 3963 + i * 16) % 48) / 48;
            return <div key={i} style={{position: 'absolute', left: -110 + (1 - ph) * 30, top: 110 - ph * 220, width: 220 - (1 - ph) * 60, height: 0, borderTop: `3px solid rgba(240,95,65,${(0.75 - ph * 0.65) * heat})`, borderRadius: '50%'}} />;
          })}
          {/* 塔顶烟点 */}
          {heat > 0.5 && [0, 1, 2].map(i => {
            const ph = ((N + i * 20) % 60) / 60;
            return <div key={'s' + i} style={{position: 'absolute', left: -8 + i * 14 + Math.sin(ph * 6) * 8, top: -140 - ph * 70, width: 8, height: 8, borderRadius: '50%', background: GREY, opacity: (1 - ph) * 0.7}} />;
          })}
          {meltWord > 0 && <div style={{position: 'absolute', left: -140, top: 160, width: 280, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 30, fontWeight: 800, color: ORANGE, opacity: meltWord}}>would melt</div>}
        </div>
        {/* 中 vs */}
        <div style={{position: 'absolute', left: -40, top: -20, fontFamily: "'Orbitron', sans-serif", fontSize: 44, color: GREY, opacity: 0.8}}>vs</div>
        {/* 右：安静走廊（没人走） */}
        {corrOp > 0 && (
          <div style={{position: 'absolute', left: 80, top: -170, width: 480, height: 340, opacity: corrOp * dim2}}>
            <svg width="480" height="340">
              {/* 透视线 */}
              <line x1="30" y1="80" x2="450" y2="80" stroke={GREY_LINE} strokeWidth={2} />
              <line x1="30" y1="80" x2="120" y2="300" stroke={GREY_LINE} strokeWidth={2} />
              <line x1="450" y1="80" x2="360" y2="300" stroke={GREY_LINE} strokeWidth={2} />
              <line x1="120" y1="300" x2="360" y2="300" stroke={GREY_LINE} strokeWidth={2} />
              {/* 走廊顶灯 */}
              {[0, 1, 2].map(i => <circle key={i} cx={150 + i * 90} cy={100 + i * 4} r={5} fill={GREY} opacity={0.6} />)}
            </svg>
            {/* 三个静止信封（没在走！） */}
            {[0, 1, 2].map(i => (
              <div key={i} style={{position: 'absolute', left: 150 + i * 110, top: 170 + i * 12, opacity: corrOp * 0.95}}>
                <PacketIcon cx={0} cy={0} w={66} h={46} />
              </div>
            ))}
            {/* 灰尘（飘过） */}
            <div style={{position: 'absolute', left: dustX, top: 240, width: 7, height: 7, borderRadius: '50%', background: GREY, opacity: 0.5}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: -44, textAlign: 'center', fontFamily: "'Noto Sans SC', sans-serif", fontSize: 25, color: GREY}}>nobody is walking</div>
          </div>
        )}
      </div>
    </div>
  );
};
export const SC17_RANGE = {from: F0, to: T};
