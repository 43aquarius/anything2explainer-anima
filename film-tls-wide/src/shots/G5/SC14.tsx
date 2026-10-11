import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, powOutRemain, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, Box, Pill, GREY, GREY_MID, WHITE, ORANGE, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC14 DH 1976（2869–3035）。S20。
 * 节拍：2877 `Diffie-Hellman` 大字 SoftIn（Noto 900 56px 白+紫描边）+ 论文卡 slideUp（Δ100/18 帧）
 *       ｜2936 `1976` YearRoll 滚落（模糊 ≥9px，14 帧归 0）｜3001 50 年弧 draw-on（24 帧）+ 旗标 `50 years`。
 * 持续：论文卡标题行逐字微亮（打字感）；弧末端旗标橙光呼吸。
 * 运镜：1→1.12 推向论文卡（2869–2990，运镜不进末拍）。主角：`1976` 96px + 论文卡 420px。
 */
const F0 = 2869;
const TO = 3035;

const CARD = {x: 180, y: 240, w: 340, h: 320};

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 论文卡 slideUp Δ100 / 18 帧（2877 起）
  const cn = N - 2877;
  const cardDy = 100 * powOutRemain(cn, 18, 2.5);
  const cardOp = fadeIn(cn, 6);

  // 1976 YearRoll：模糊滚落（2936 起 14 帧归 0）
  const yn = N - 2936;
  const roll = clamp01(yn / 14);
  const rollVal = Math.round(2000 - 224 * (1 - Math.pow(1 - roll, 2))); // 2000 → 1976 快滚
  const blur = 9 * (1 - roll);

  // 50 年弧（3001 起 24 帧）：从 1976 到 2026 的上拱弧
  const arcP = clamp01((N - 3001) / 24);
  const ARC = {x0: 620, x1: 1100, y: 470, h: 130};
  const arcLen = 560;

  // 论文卡标题打字感（逐字微亮循环）
  const typePh = ((N - 2905) % 60) / 60;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2990, x: 480, y: 380, s: 1.12}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 大标题 Diffie-Hellman（2877 SoftIn） */}
        <SoftIn N={N} f0={2877}>
          <CText cx={640} cy={165} size={56} weight={900} color={WHITE} letterSpacing={1}
            style={{WebkitTextStroke: `2px ${'rgba(161,117,241,0.9)'}`, paintOrder: 'stroke fill'}}>Diffie-Hellman</CText>
        </SoftIn>

        {/* 论文卡（主角之一） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={10} sw={2.5} />
          <Pill x={CARD.x + 24} y={CARD.y + 22} w={168} h={36} fontSize={20} text="IEEE Trans. IT" color={GREY} />
          <div style={{...abs(CARD.x + 24, CARD.y + 82, CARD.w - 48, 110), fontFamily: FONT_MONO, fontSize: 22, color: WHITE, lineHeight: 1.5}}>
            <div>New Directions</div>
            <div>in Cryptography</div>
          </div>
          {/* 打字光标微亮（持续动作） */}
          <div style={{...abs(CARD.x + 24, CARD.y + 82, CARD.w - 48, 110), fontFamily: FONT_MONO, fontSize: 22, color: ORANGE, opacity: 0.25 + 0.2 * Math.abs(Math.sin(typePh * Math.PI)), lineHeight: 1.5}}>
            <div>New Directions</div>
            <div>in Cryptography</div>
          </div>
          <CText cx={CARD.x + CARD.w / 2} cy={CARD.y + 248} size={22} weight={500} color={GREY}>Whitfield Diffie · Martin Hellman</CText>
          <CText cx={CARD.x + CARD.w / 2} cy={CARD.y + 286} size={20} weight={400} color={GREY_MID}>the paper that removed the courier</CText>
        </div>

        {/* 1976 大数字（YearRoll） */}
        {yn >= 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(yn, 4)}}>
            <CText cx={880} cy={300} size={96} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={4}
              style={{filter: `blur(${blur.toFixed(1)}px)`, textShadow: '0 0 24px rgba(255,255,255,.3)'}}>
              {roll >= 1 ? '1976' : rollVal}
            </CText>
          </div>
        ) : null}

        {/* 50 年弧（3001 draw-on）+ 旗标 */}
        {arcP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <Svg bloom={false}>
              <path
                d={`M${ARC.x0} ${ARC.y} Q${(ARC.x0 + ARC.x1) / 2} ${ARC.y - ARC.h} ${ARC.x0 + (ARC.x1 - ARC.x0) * arcP} ${ARC.y - ARC.h * (4 * arcP * (1 - arcP))}`}
                fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round"
              />
            </Svg>
            {arcP >= 1 ? (
              <SoftIn N={N} f0={3022}>
                <Pill x={ARC.x1 - 66} y={ARC.y - 92} w={150} h={40} fontSize={26} text="50 years" color={ORANGE} />
                <CText cx={ARC.x1 - 30} cy={ARC.y + 16} size={22} weight={500} color={GREY}>2026</CText>
              </SoftIn>
            ) : null}
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
