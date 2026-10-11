import React from 'react';
import {FONT_HEAVY, FONT_ORB, clamp01, kf, rnd} from '../../common';
import {useCurrentFrame} from 'remotion';
import {BrowserWin, EXAMPLE, GREY, WHITE, PURPLE, exitOp} from '../../ui';
import {BigNumber} from '../../fx';

const F0 = 78, T = 229; // SC01: 78–229 (S01)
const URL = EXAMPLE.domain;

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const n = N - F0;                       // 镜头内相对帧
  const typed = clamp01((N - 88) / 26) * URL.length;     // 地址栏打字（86 节拍起）
  const appear = N >= 163;                                // S01.c2 页面出现
  const counter = kf(N, [[163, 0], [183, 5]], (u) => 1 - Math.pow(1 - u, 2)) / 10; // 0.0→0.5 计数
  const jitter = N > 183 && N < T - 10 ? Math.round((rnd(N) - 0.5) * 2) / 100 : 0; // 落定后最后一位微抖
  const val = (N < 163 ? 0 : counter) + jitter;
  // 页面加载完成后骨架线呼吸（可见的持续动作，30 帧周期）
  const skelBreath = appear ? 0.45 + 0.18 * (0.5 + 0.5 * Math.sin((N - 163) / 30 * Math.PI * 2)) : 0.45;
  const exitK = N > T - 8 ? exitOp(N, T) : 1;
  const skelLit = appear ? 99 : 0;
  // 慢推 1.0→1.05（运镜贯穿，全片规则：推完内容留在安全区）
  const s = 1 + 0.05 * clamp01((N - 200) / 29);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK}}>
      <div style={{position: 'absolute', left: 640, top: 360, transform: `translate(-50%, -50%) scale(${s})`}}>
        {/* 左：浏览器 */}
        <div style={{transform: `translateY(${kf(N, [[78, 120], [100, 0]], (u) => 1 - Math.pow(1 - u, 2.5))}px)`, opacity: kf(N, [[78, 0.25], [92, 1]])}}>
          <BrowserWin x={-540} y={-230} w={470} h={360} typed={typed} skeleton={6} skelLit={skelLit} barP={appear ? 1 : 0.25} barColor={PURPLE} skelOpacity={skelBreath} />
        </div>
        {/* 右：计时大数字（主角） */}
        <div style={{position: 'absolute', left: 240, top: -60, width: 320, textAlign: 'center'}}>
          <BigNumber cx={400} cy={-30} value={val.toFixed(1)} unit="s" size={110} />
          <div style={{fontFamily: FONT_HEAVY, fontSize: 22, color: GREY, marginTop: 130, letterSpacing: 1}}>from Enter to first pixels</div>
          {/* 白闪（页面出现瞬间） */}
          {N >= 163 && N < 166 && <div style={{position: 'absolute', left: 60, top: -80, width: 320, height: 200, background: WHITE, opacity: 0.55}} />}
        </div>
      </div>
    </div>
  );
};

export const SC01_RANGE = {from: F0, to: T};
export const _F = FONT_ORB;
