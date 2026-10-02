import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeInOutPow, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, PURPLE, WHITE, firstOp, scaleIn, fadeIn, glowOffK} from '../../ui';
import {PathMap, pathEnvX, WiresharkBadge} from './g3ui';

/**
 * SC13 三处立足点 · N 2577–2775（S16 2585–2773：2585「工具是简单部分」/ 2639「站在哪里」/ 2691「拿到拷贝」/ 2749「三个答案」）
 * 版式：水平路径图（y400，x160–1120，白 2px）+ 两端节点（左 LaptopIcon 120 / 右 RackIcon 96×120）+
 *   三个站位虚线圈 ①②③（x 340/640/940）；上方 (640,210) `WHERE?` Audiowide 96px 白 + 紫硬投影（主角）。
 * 章界承接（Ch1→Ch2）：SC12 卡 B（Wireshark）缩略自画幅中央滑到左上角（2577–2593，16 帧），「工具已就位」。
 * 节拍：2585 路径 draw-on 24 帧 + 两端节点 12 帧缩放入场；2639 WHERE? GlitchIn（本镜唯一 glitch）+ 脉冲；
 *   2691 信封流沿路径右行（4.2px/帧，持续动作）；2749 三圈 2 帧错峰缩放入 + 依次紫光点亮（2753/2757/2761），
 *   2771 起只留 ① 亮（承接 SC14 立足点①）；2763–2775 WHERE?/徽章归零淡出（路径组不清场，直通 SC14 承接位移）。
 * 停留：段内不判（S16 非 ¶）。主角：WHERE? 96px，光 = 紫硬投影。
 */
const F0 = 2577;
const TO = 2775;
const T_BADGE = 2577, T_PATH = 2585, T_WHERE = 2639, T_ENV = 2691, T_CIRC = 2749, T_FADE = 2763;
const PULSE = [2753, 2757, 2761]; // ①②③ 依次点亮
const SETTLE = 2771; // 只留 ①

const flash = (n: number, len = 10) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 徽章 + WHERE? 尾部归零（12 帧，末帧 0；路径组保留给 SC14）
  const tailOp = N < T_FADE ? 1 : Math.max(0, 1 - Math.pow((N - T_FADE) / (TO - T_FADE), 1.5));
  const badgeGlow = glowOffK(N, TO, 6, 12);

  // 章界承接：Wireshark 徽章 640→230（16 帧 easeInOutPow 2.5）
  const bt = easeInOutPow(2.5)(clamp01((N - T_BADGE) / 16));
  const badgeX = 640 + (230 - 640) * bt;

  // 路径 draw-on（24 帧幂 2.5 缓出）+ 节点缩放入场
  const pathP = N < T_PATH ? 0 : 1 - Math.pow(1 - clamp01((N - T_PATH) / 24), 2.5);
  const lS = scaleIn(N - (T_PATH + 4), 12);
  const rS = scaleIn(N - (T_PATH + 9), 12);
  const lOp = firstOp(N - (T_PATH + 4), 8);
  const rOp = firstOp(N - (T_PATH + 9), 8);

  // 站位圈：错峰缩放入 + 依次紫脉冲 + 只留 ①
  const circ = [0, 1, 2].map((i) => {
    const e = scaleIn(N - (T_CIRC + i * 2), 10);
    const pulse = flash(N - PULSE[i]);
    const lit = N >= SETTLE ? i === 0 : pulse > 0;
    return {s: e, op: e > 0 ? Math.max(0.25, e) : 0, lit, digit: String(i + 1), pulse};
  });

  // WHERE?（主角）
  const wn = N - T_WHERE;
  const wPulse = emphasisPulse(wn - 12, {peak: 1.11});

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 路径图（不清场，直通 SC14 承接位移） */}
      <PathMap lineP={pathP} lS={lS} lOp={lOp} rS={rS} rOp={rOp} circ={circ} envX={(i) => pathEnvX(N, i, T_ENV)} envF={(i) => fadeIn(N - (T_ENV + i * 2), 6)} />

      {/* Wireshark 徽章（章界承接，尾部归零） */}
      <div style={{position: 'absolute', inset: 0, opacity: tailOp}}>
        <WiresharkBadge cx={badgeX} cy={158} op={firstOp(N - T_BADGE, 8) || 0.0001} glowK={badgeGlow} />
      </div>

      {/* WHERE?（本镜唯一 glitch，白名单） */}
      {wn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: tailOp}}>
          <GlitchIn N={N} f0={T_WHERE}>
            <CText
              cx={640}
              cy={210}
              size={96}
              weight={400}
              family={FONT_WIDE}
              color={WHITE}
              letterSpacing={2}
              style={{
                transform: `scale(${wPulse.toFixed(4)})`,
                textShadow: `6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45), 0 0 12px rgba(255,255,255,.5)`,
              }}
            >
              WHERE?
            </CText>
          </GlitchIn>
        </div>
      ) : null}
    </div>
  );
};
