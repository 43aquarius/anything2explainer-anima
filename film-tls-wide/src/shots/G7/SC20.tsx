import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {KeyIcon, RackIcon, CText, Svg, SoftIn, Box, GREY, GREY_MID, WHITE, PURPLE_LIGHT, CORAL, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC20 谁来担保（4154–4292）。S28。
 * 节拍：4162 双钥匙缩微自左下滑入左上角（16 帧承接）+ `one question left` 灰字
 *       ｜4205 门牌 slideUp（Δ80/18 帧）+ HeroGlow + 大 `?` 缩入（21 帧）+ 描边呼吸
 *       ｜4242 两台服务器 2 帧错峰缩入 + 右台红虚线描边 draw-on（12 帧）+ `vs`。
 * 持续：`?` 描边呼吸。运镜：1.0→1.05 慢推（4154–4248，运镜不进末拍）。主角：门牌+`?` 260px。
 */
const F0 = 4139; // 章首：Ch4 卡 4094–4138 之后一帧起（分镜表 v2）
const TO = 4292;

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 双钥匙缩微承接（4154 起 16 帧，从左下角滑到左上角）
  const handT = clamp01((N - 4154) / 16);
  const kx = 180 + 60 * handT, ky = 560 - 440 * handT;

  // 门牌（4205 slideUp Δ80/18 帧）
  const pn = N - 4150;
  const plateDy = 80 * Math.pow(1 - clamp01(pn / 18), 2.5);

  // 大 ?（4210 起 21 帧缩入 + 呼吸）
  const qn = N - 4162;
  const qS = 0.5 + 0.5 * slideIn(qn, 21);
  const breathe = 1 + 0.08 * Math.sin((N / 30) * Math.PI * 2);

  // 双服务器（4242 起 2 帧错峰缩入）+ 右台红虚线（4250 draw-on 12 帧）
  const srvIn = (i: number) => slideIn(N - (4242 + i * 2), 18);
  const dashP = clamp01((N - 4250) / 12);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 4248, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 双钥匙缩微（承接 SC10） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 4154) / 5)}}>
          <KeyIcon cx={kx} cy={ky} size={92} />
          <KeyIcon cx={kx + 56} cy={ky + 8} size={92} opacity={0.85} />
        </div>
        <SoftIn N={N} f0={4162}>
          <CText cx={320} cy={118} size={24} weight={400} color={GREY}>one question left</CText>
        </SoftIn>

        {/* 门牌（主角） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(pn, 6), transform: `translateY(${plateDy.toFixed(1)}px)`}}>
          <Box x={490} y={330} w={300} h={120} r={14} sw={3} glow="0 0 26px 8px rgba(102,45,248,.28)" />
          <CText cx={640} cy={392} size={54} weight={900} color={WHITE}>shop.example</CText>
        </div>

        {/* 大 ?（紫描边 + 呼吸） */}
        {qn >= 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: fadeIn(qn, 4), transform: `scale(${(qS * breathe).toFixed(3)})`}}>
            <CText cx={640} cy={208} size={150} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={5}
              style={{WebkitTextStroke: `3px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 26px rgba(161,117,241,.55), 0 0 60px rgba(102,45,248,.35)'}}>?</CText>
          </div>
        ) : null}

        {/* 双服务器（一真一假） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: srvIn(0)}}>
          <RackIcon cx={500} cy={560} w={100} h={130} units={4} lit={2} label="real" />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: srvIn(1)}}>
          <RackIcon cx={780} cy={560} w={100} h={130} units={4} lit={0} label="?" />
        </div>
        {dashP > 0 ? (
          <Svg bloom={false}>
            <rect x={780 - 56} y={560 - 70} width={112} height={140} fill="none" stroke={CORAL} strokeWidth={2} strokeDasharray="7 6" opacity={dashP} rx={8} />
          </Svg>
        ) : null}
        <SoftIn N={N} f0={4258}>
          <CText cx={640} cy={560} size={26} weight={400} color={GREY_MID}>vs</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
