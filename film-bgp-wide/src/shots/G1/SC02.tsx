import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, GlitchIn, kf, emphasisPulse, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {CText, SoftIn, Svg, Box, Pill, Cross, PersonIcon, MapFrame, GREY_MID, GREY_LIGHT, WHITE, CORAL, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, mixHex, glowPurpleS, EXAMPLE} from '../../ui';

/**
 * SC02 不是被黑（318–555）。S03 + S04。
 * 节拍：326 三张排查卡 2 帧错峰 slideUp（Δ70/16f）+ 卡内图标 draw-on
 *       ｜392 `hack` 卡红 Cross draw-on（12f）+ 灰化 → 412 `cable cut` 同款 → 455 `the address` emphasisPulse + 紫光点亮
 *       ｜458 空 MapFrame SoftIn（缩微，屏幕 (430,490) 358×256——SC03 承接位）+ `?` 弹入（462）
 *       ｜507 `no master list` 大字 GlitchIn（rgbSplit 4，白名单）+ 底部一次白闪
 * 运镜：33 帧 1→1.12 推向第三卡（420–453，不进末拍）。停留：段内不判（S04 末块 47）。
 * 主角：排查卡组 300px（第三卡紫光晕；Cross 红）。零扫光。
 */
const F0 = 318;
const TO = 555;

/** 三张排查卡（300×190，2 帧错峰 slideUp） */
const CARDS = [{x: 165}, {x: 490}, {x: 815}].map((c) => ({...c, y: 165, w: 300, h: 190}));

/** 空地图框（SC03 承接位：相机推 (965,320)×1.12 后屏幕 (430,490) 358×256） */
const MFRAME = {cx: 777, cy: 436, w: 320, h: 229};

/** `no master list`（推后屏幕 (880,480)；46px 行宽 ≈344） */
const NML = {cx: 1179, cy: 427, size: 46};

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5); // 变陡，保尾部稳定期；空地图框不退场（SC03 承接）
  const actGlowOff = glowOffK(N, TO, 3, 5); // 第三卡紫光先灭再淡出（收紧）

  // ---- 排除节拍：Cross + 灰化 → 第三卡紫光 ----
  const cross1P = clamp01((N - 392) / 12);
  const cross2P = clamp01((N - 412) / 12);
  const grey1 = kf(N, [[404, 0], [414, 1]]);
  const grey2 = kf(N, [[424, 0], [434, 1]]);
  const actK = kf(N, [[453, 0], [464, 1]]); // 第三卡紫点亮（边框 + 光晕）
  const breathe = 1 + 0.011 * Math.sin((2 * Math.PI * N) / 60) * clamp01((N - 512) / 24); // 第三卡轻微呼吸

  // ---- 空地图框 + `?`（458 SoftIn；462 弹入）----
  const qS = kf(N, [[462, 0.5], [470, 1.08], [477, 1]]);
  const qOp = fadeIn(N - 462, 5);

  // ---- 大字白闪（507，6 帧）----
  const flashOp = kf(N, [[496, 0], [497, 0.5], [502, 0]]); // 随 glitch 前挂

  /** 卡 i（slideUp Δ70/16f，2 帧错峰） */
  const cardDy = (i: number) => 70 * powOutRemain(N - (326 + 2 * i), 16, 2.5);
  const cardOp = (i: number) => fadeIn(N - (326 + 2 * i), 6);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 420, x: 640, y: 360, s: 1}, {f: 453, x: 965, y: 320, s: 1.12}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 卡 1 `hack`：PersonIcon + 蒙面弧线；392 Cross + 灰化 ---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: cardOp(0), transform: `translateY(${cardDy(0).toFixed(1)}px)`}}>
            <div style={{...abs(0, 0, 1280, 720), filter: `saturate(${(1 - 0.75 * grey1).toFixed(3)})`, opacity: (1 - 0.28 * grey1).toFixed(3)}}>
              <Box x={CARDS[0].x} y={CARDS[0].y} w={CARDS[0].w} h={CARDS[0].h} r={14} sw={2.5} />
              <CText cx={315} cy={209} size={28} weight={800} letterSpacing={1}>hack</CText>
              <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(N - 348, 8)}}>
                <PersonIcon cx={315} cy={302} size={96} />
                <Svg bloom={false}>
                  <path d="M295,277 Q315,267 335,279" fill="none" stroke={WHITE} strokeWidth={6} strokeLinecap="round" />
                </Svg>
              </div>
            </div>
            {cross1P > 0 ? (
              <Svg bloom={false}>
                <Cross cx={315} cy={262} size={112} color={CORAL} sw={10} p={cross1P} opacity={0.95} />
              </Svg>
            ) : null}
          </div>

          {/* ---- 卡 2 `cable cut`：虚缆线 + 剪刀两刃 X；412 Cross + 灰化 ---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: cardOp(1), transform: `translateY(${cardDy(1).toFixed(1)}px)`}}>
            <div style={{...abs(0, 0, 1280, 720), filter: `saturate(${(1 - 0.75 * grey2).toFixed(3)})`, opacity: (1 - 0.28 * grey2).toFixed(3)}}>
              <Box x={CARDS[1].x} y={CARDS[1].y} w={CARDS[1].w} h={CARDS[1].h} r={14} sw={2.5} />
              <CText cx={640} cy={209} size={28} weight={800} letterSpacing={1}>cable cut</CText>
              <Svg bloom={false}>
                <line x1={530} y1={300} x2={608} y2={300} stroke={GREY_LIGHT} strokeWidth={3.5} strokeDasharray="10 7" opacity={0.9} />
                <line x1={672} y1={300} x2={750} y2={300} stroke={GREY_LIGHT} strokeWidth={3.5} strokeDasharray="10 7" opacity={0.9} />
                {/* 剪刀两刃 X（draw-on 348） */}
                <g stroke={WHITE} strokeWidth={3.5} strokeLinecap="round">
                  <line x1={624} y1={280} x2={656} y2={318} strokeDasharray={54} strokeDashoffset={54 * (1 - clamp01((N - 348) / 14))} />
                  <line x1={656} y1={280} x2={624} y2={318} strokeDasharray={54} strokeDashoffset={54 * (1 - clamp01((N - 350) / 14))} />
                </g>
                <circle cx={640} cy={299} r={4} fill="#000" stroke={WHITE} strokeWidth={2.5} />
              </Svg>
            </div>
            {cross2P > 0 ? (
              <Svg bloom={false}>
                <Cross cx={640} cy={262} size={112} color={CORAL} sw={10} p={cross2P} opacity={0.95} />
              </Svg>
            ) : null}
          </div>

          {/* ---- 卡 3 `the address`：定位针 + 前缀 Pill；紫光点亮（主角）+ 脉冲 + 呼吸 ---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: cardOp(2), transform: `translateY(${cardDy(2).toFixed(1)}px) scale(${(breathe * emphasisPulse(N - 455, {peak: 1.09})).toFixed(4)})`, transformOrigin: '965px 260px'}}>
            <Box x={CARDS[2].x} y={CARDS[2].y} w={CARDS[2].w} h={CARDS[2].h} r={14} sw={2.5} stroke={mixHex(WHITE, PURPLE_LIGHT, actK)} glow={actK > 0.02 ? glowPurpleS(actK * actGlowOff) : undefined} />
            <CText cx={965} cy={209} size={28} weight={800} letterSpacing={1}>the address</CText>
            {/* 定位针（draw-on 350） */}
            <Svg bloom={false}>
              <path
                d="M965,268 C957,254 952,249 952,240 A13,13 0 1 1 978,240 C978,249 973,254 965,268 Z"
                fill="#000"
                stroke={mixHex(WHITE, PURPLE_LIGHT, actK)}
                strokeWidth={2.5}
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - clamp01((N - 350) / 16))}
              />
              <circle cx={965} cy={240} r={4.5} fill={actK > 0.5 ? PURPLE_LIGHT : WHITE} opacity={clamp01((N - 358) / 8)} />
            </Svg>
            <SoftIn N={N} f0={346}>
              <Pill x={840} y={284} w={250} h={44} r={22} sw={2} stroke={mixHex(WHITE, PURPLE_LIGHT, actK)} text={EXAMPLE.prefix} fontSize={22} weight={700} family={FONT_MONO} />
            </SoftIn>
          </div>

          {/* ---- `no master list` 大字（507 GlitchIn + 白闪）---- */}
          <GlitchIn N={N} f0={496} rgbSplit={4} seed={7}>
            <CText
              cx={NML.cx}
              cy={NML.cy}
              size={NML.size}
              weight={900}
              letterSpacing={1}
              style={{WebkitTextStroke: '2px #6630F8', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(102,45,248,.4)'}}
            >
              no master list
            </CText>
          </GlitchIn>
          {flashOp > 0.01 ? <div style={{...abs(NML.cx - 190, NML.cy + 36, 380, 5), borderRadius: 3, background: WHITE, opacity: flashOp.toFixed(3), boxShadow: '0 0 14px rgba(255,255,255,.8)'}} /> : null}
        </div>

        {/* ---- 空 MapFrame + `?`（不随卡组退场——SC03 承接）---- */}
        <SoftIn N={N} f0={458}>
          <MapFrame cx={MFRAME.cx} cy={MFRAME.cy} w={MFRAME.w} h={MFRAME.h} />
          <div style={{...abs(0, 0, 1280, 720), opacity: qOp, transform: `scale(${qS.toFixed(4)})`, transformOrigin: `${MFRAME.cx}px ${MFRAME.cy}px`}}>
            <CText cx={MFRAME.cx} cy={MFRAME.cy} size={98} weight={700} family={FONT_ORB} color={GREY_MID}>?</CText>
          </div>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
