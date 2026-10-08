import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, WHITE, GREY, PURPLE_LIGHT, exitOp, glowOffK, softOp, abs} from '../../ui';
import {GlowBlob} from '../../fx';
import {typedLen} from './g7bui';

/**
 * SC47 从未解压 · N 7025–7116（S47 7033–7114：7033「And here is the thing:」/ 7069「the app never got unzipped.」）
 * 清场（SC46 已归零）→ 7033 第一行 `and here is the thing:`（灰 34px，每 2 帧 1 字打字机，22 字 7075 完成）；
 * ~7036 大字落位点下方一池淡紫光晕渐入（60f 呼吸，持续动作；大字落地后收敛让位）；
 * 7069 大字 `never unzipped`（Audiowide 110px 白+紫描边）SoftIn 8f + emphasisPulse（7073 起）
 * + 紫描边光晕 30f 周期呼吸（**不 glitch**——分镜表明示留给段末；本镜零 glitch）。
 * 末 8 帧归零（7109–7116，紫光先灭 6f）。停留：段内不判。
 * 主角：`never unzipped` 110px（宽 ≈1010px）；光：大字紫描边光（本镜唯一大面积光）。
 * 事实：「never unzipped」= S47 原文（research §7：包从不解压）。
 */
export const F0 = 7025;
const TO = 7116, EXIT_LEN = 8;
const B_TYPE = 7033, B_BIG = 7069, B_PULSE = 7073;

const LINE = 'and here is the thing:';
const LINE_X = 452; // 左锚（整行最终居中）

export const SC47: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 紫光先灭

  const typed = typedLen(N - B_TYPE, LINE.length);
  // 大字落位光池（大字落地后收敛让位）
  const blobK = clamp01((N - (B_TYPE + 3)) / 10) * (1 - 0.45 * clamp01((N - B_BIG) / 8)) * gk;
  // 大字脉冲 + 紫晕呼吸
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.1, up: 11, hold: 4, down: 13});
  const glow = 18 + 9 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 第一行打字机（灰 34px，每 2 帧 1 字） */}
      {typed > 0 ? (
        <div style={{...abs(LINE_X, 234, 420, 34), fontFamily: `'Noto Sans SC', sans-serif`, fontSize: 34, fontWeight: 600, color: GREY, letterSpacing: 2, lineHeight: 1, whiteSpace: 'nowrap'}}>
          {LINE.slice(0, typed)}
        </div>
      ) : null}

      {/* 大字落位光池（淡紫，持续呼吸；空场判据的「大面积光活动」来源） */}
      <GlowBlob cx={640} cy={400} r={200} N={N} k={blobK} alpha={0.3} />

      {/* 大字 never unzipped（SoftIn + emphasisPulse + 紫描边光；零 glitch） */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 400px', transform: `scale(${pulse.toFixed(4)})`}}>
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_BIG, 8), transform: `translateY(${(10 * (1 - clamp01((N - B_BIG) / 8))).toFixed(1)}px)`}}>
          <CText
            cx={640}
            cy={400}
            size={110}
            weight={400}
            family={FONT_WIDE}
            letterSpacing={2}
            color={WHITE}
            shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,${(0.55 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: `2.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}
          >
            never unzipped
          </CText>
        </div>
      </div>
    </div>
  );
};

export default SC47;
