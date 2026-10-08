import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {CText, KeyGlyph, ParcelIcon, Box, Svg, SoftIn, WHITE, GREY, PURPLE_LIGHT, exitOp, glowOffK, scaleIn, softOp} from '../../ui';
import {GlowBlob} from '../../fx';
import {PillarIcon} from './g6ui';

/**
 * SC35 钥匙即身份 · N 5058–5182（S35 5066–5180：5066「The key is the developer's identity.」/ 5132「There is no certificate authority.」）
 * 5066 大 KeyGlyph（主角 240px 高）scaleIn 21f + 齿端紫光呼吸（持续动作）+ 钥匙环挂小包裹（锁住感，配角不发光）+ 每 36 帧 ±2° 轻转（持续动作）；
 * 5132 右侧「无 CA」对照卡 SoftIn → 柱式图标自左 wipe 显影 14f → 灰删除线 10f → `no certificate authority`（灰 24px）；
 * 5148 底部 `you are your own authority`（灰 26px）。段内镜头（停留不判），末 8 帧归零（齿端紫光先灭 6f）。
 * 本镜零 glitch、零扫光（G6 白名单：仅 SC39 `/data/app`）。事实：research §4「self-signed / no central authority」。
 */
const F0 = 5058, TO = 5182;
const B_KEY = 5066, B_CA = 5132, B_PILLAR = 5134, B_STRIKE = 5150, B_TXT = 5156, B_LINE = 5148;

const KEY = {cx: 470, cy: 290, w: 480};
const CARD = {x: 815, y: 220, w: 360, h: 240};
const CHAIN = {px: 272, py: 444, w: 96, h: 68};
// KeyGlyph 内部几何（w×w/2，中心 (w/2, w/4)）：环心 (0.14w, 0.25w) r 0.11w → 环底相对中心偏移 (-0.36w, +0.11w)
const RING_DX = -0.3604, RING_DY = 0.11;

export const SC35: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6); // 齿端紫光先灭再整体淡出

  // 大钥匙：21 帧缩放入场 + 每 36 帧 ±2° 轻转（持续动作）
  const kn = N - B_KEY;
  const ks = kn < 0 ? 0 : scaleIn(kn, 21);
  const rot = -8 + 2 * Math.sin((2 * Math.PI * N) / 36);
  const rad = (rot * Math.PI) / 180;
  // 钥匙环底挂点（随旋转走）→ 链线到小包裹顶部
  const hx = KEY.cx + RING_DX * KEY.w * Math.cos(rad) - RING_DY * KEY.w * Math.sin(rad);
  const hy = KEY.cy + RING_DX * KEY.w * Math.sin(rad) + RING_DY * KEY.w * Math.cos(rad);
  const chainOp = softOp(N - (B_KEY + 8), 8); // 小包裹随钥匙出现（锁住感）

  // 无 CA 对照卡
  const cardOp = softOp(N - B_CA, 8);
  const pillarP = clamp01((N - B_PILLAR) / 14);
  const strikeP = easeOutCubic(clamp01((N - B_STRIKE) / 10));
  const txtOp = softOp(N - B_TXT, 8);
  const lineOp = softOp(N - B_LINE, 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 齿端紫光（主角光，呼吸；离场先灭） */}
      <GlowBlob cx={604} cy={335} r={62} N={N} k={clamp01((kn - 6) / 14) * gk} />

      {/* 大钥匙（主角） */}
      {ks > 0 ? (
        <KeyGlyph cx={KEY.cx} cy={KEY.cy} w={KEY.w} rotate={rot} scale={ks} glow opacity={clamp01(0.25 + 0.75 * ks)} />
      ) : null}

      {/* 钥匙环 → 小包裹（锁住感；配角不发光） */}
      {chainOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: chainOp}}>
          <Svg bloom={false}>
            <line x1={hx} y1={hy} x2={CHAIN.px} y2={CHAIN.py - CHAIN.h / 2 - 4} stroke={WHITE} strokeWidth={2} opacity={0.65} />
            <circle cx={CHAIN.px} cy={CHAIN.py - CHAIN.h / 2 - 4} r={4.5} fill="#000" stroke={WHITE} strokeWidth={1.8} />
          </Svg>
          <ParcelIcon cx={CHAIN.px} cy={CHAIN.py} w={CHAIN.w} h={CHAIN.h} label={'APK'} />
        </div>
      ) : null}

      {/* 右侧「无 CA」对照卡 */}
      {cardOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={12} sw={2.5} />
          <PillarIcon cx={995} cy={300} w={150} h={105} p={pillarP} />
          {/* 灰删除线（「不是重点」不是「错误」，非红） */}
          {strikeP > 0 ? (
            <Svg bloom={false}>
              <line x1={912} y1={258} x2={912 + 166 * strikeP} y2={258 + 88 * strikeP} stroke={GREY} strokeWidth={4.5} strokeLinecap="round" />
            </Svg>
          ) : null}
          {txtOp > 0 ? (
            <CText cx={995} cy={412} size={24} weight={600} color={GREY} opacity={txtOp}>
              no certificate authority
            </CText>
          ) : null}
        </div>
      ) : null}

      {/* 底部结论行 */}
      {lineOp > 0 ? (
        <SoftIn N={N} f0={B_LINE}>
          <CText cx={640} cy={556} size={26} weight={600} color={GREY}>
            you are your own authority
          </CText>
        </SoftIn>
      ) : null}
    </div>
  );
};

export default SC35;
