import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE} from '../../common';
import {CameraRig, LightSweep} from '../../fx';
import {AsChip, MapFrame, VoiceDot, CText, Svg, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs} from '../../ui';
import {EXAMPLE} from '../../ui';

/**
 * SC16 金句：出声记得（3927–4143）。S31（¶段末片末；endingFade=2 → 压黑 4044–4143）。
 * 节拍：3935 上半地图缩微承接（涟漪减速归静）
 *       ｜3984 清场（12 帧收缩）→ 扫光三轮 3986/3996/4006 + 第一行 GlitchIn(rgbSplit 8)
 *       ｜4018 第二行 SoftIn len3 紫硬投影 + 小 AsChip 18px/帧 横移 + 小灰字。
 * 终镜不用 exitOp（endingFade 压黑接管——TLS SC27 / CDN SC17 成熟模式）。扫光白名单①（全片唯一）。
 */
const F0 = 3927;
const TO = 4143;

const MAP = {cx: 640, cy: 300, s: 0.42};

// 缩微地图上的芯片阵列（SC15 收束呼应：错峰涟漪 → 归静）
const CHIPS: Array<[number, number, string]> = [
  [MAP.cx - 210, MAP.cy - 100, 'AS1299'],
  [MAP.cx - 60, MAP.cy - 140, 'AS3356'],
  [MAP.cx + 120, MAP.cy - 90, 'AS15169'],
  [MAP.cx + 220, MAP.cy + 20, 'AS65500'],
  [MAP.cx - 150, MAP.cy + 110, 'AS64512'],
  [MAP.cx + 60, MAP.cy + 130, 'AS32934'],
];

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 上半：地图缩微承接（3927 起软入 + 位移落定）
  const mapIn = clamp01((N - 3927) / 16);
  // 涟漪归静：3950 起 36 帧内把涟漪不透明度压到 0.15（"安静下来"）
  const quiet = clamp01((N - 3950) / 36);
  // 清场（3984 起 12 帧收缩加速离场）
  const collapse = clamp01((N - 3984) / 12);
  // 金句两行
  const L1 = N - 3988;
  const L2 = N - 4015; // beat−6 提前入场预算
  const fly2 = Math.max(0, N - 4015);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}]}>
      <div style={abs(0, 0, 1280, 720)}>
        {/* 上半：大地图缩微承接（清场时收缩淡出） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: mapIn * Math.max(0, 1 - collapse * 1.2), transform: `scale(${(1 - 0.35 * collapse).toFixed(3)})`}}>
          <div style={{...abs(0, 0, 1280, 720), transform: `translateY(${((1 - mapIn) * 40).toFixed(1)}px)`}}>
            <MapFrame cx={MAP.cx} cy={MAP.cy} w={560 * MAP.s * 2.2} h={400 * MAP.s * 2.2} />
            {/* 缩微连线（随涟漪归静保持微亮） */}
            <Svg bloom={false}>
              {CHIPS.slice(0, 5).map(([x, y], i) => (
                <line key={i} x1={x} y1={y} x2={CHIPS[i + 1][0]} y2={CHIPS[i + 1][1]} stroke={GREY_MID} strokeWidth={1.6} opacity={0.55 * mapIn * (1 - collapse)} />
              ))}
            </Svg>
            {/* 芯片群 + 涟漪（3935 后逐个衰减归静） */}
            {CHIPS.map(([x, y, asn], i) => (
              <React.Fragment key={asn}>
                <AsChip cx={x} cy={y} w={62} h={62} asn={asn} led="on" opacity={mapIn * (i === CHIPS.length - 1 ? 1 : 1) * (1 - collapse)} />
                <VoiceDot cx={x} cy={y} N={N - i * 5} r={5} speed={44} rings={2} maxR={44}
                  color={i === CHIPS.length - 1 ? PURPLE_LIGHT : WHITE}
                  opacity={(1 - quiet * 0.85) * mapIn * (1 - collapse)} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 金句（扫光①：三轮紧凑版） */}
        <LightSweep N={N} rounds={[3986, 3996, 4006]} alphas={[0.5, 0.45, 0.45]} dy={-40} />
        {L1 >= 0 ? (
          <GlitchIn N={N} f0={3988} rgbSplit={8} slices={16}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={300} size={62} weight={900} color={WHITE} letterSpacing={0.5}
                style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(L1, {peak: 1.11})})`}}>
                {EXAMPLE.finale1}</CText>
            </div>
          </GlitchIn>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn2 N={N} f0={4015} len={3}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={420} size={66} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: `4px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill', textShadow: '0 0 22px rgba(161,117,241,.55), 0 0 5px rgba(161,117,241,.5)'}}>
                {EXAMPLE.finale2}</CText>
            </div>
          </SoftIn2>
        ) : null}
        {/* 小 AsChip 横移（两行之间，18px/帧） */}
        {N >= 4015 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <AsChip cx={150 + 18 * fly2} cy={360} w={54} h={54} asn={EXAMPLE.asnYou} led="on" opacity={0.9} />
          </div>
        ) : null}
        {L2 >= 0 ? (
          <SoftIn2 N={N} f0={4015} len={3}>
            <CText cx={640} cy={540} size={24} weight={400} color={GREY}>{EXAMPLE.credit}</CText>
          </SoftIn2>
        ) : null}
      </div>
    </CameraRig>
  );
};

/** 与 ui.tsx 的 SoftIn 等价的本地薄封装（避免 import 循环：本文件已从 ui 拉大量符号） */
const SoftIn2: React.FC<{N: number; f0: number; len?: number; children: React.ReactNode}> = ({N, f0, len = 8, children}) => {
  const n = N - f0;
  if (n < 0) return null;
  const t = clamp01((n + 1) / (len + 1));
  const e = 1 - Math.pow(1 - t, 2.5);
  return <div style={{position: 'absolute', inset: 0, opacity: e, transform: `translateY(${((1 - e) * 8).toFixed(2)}px)`}}>{children}</div>;
};
