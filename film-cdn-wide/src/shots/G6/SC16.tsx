import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, GlitchIn, emphasisPulse} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, GREY, GREY_MID, WHITE, PURPLE_LIGHT, CORAL, abs, exitOp} from '../../ui';

/**
 * SC16 信任集中（3781–4039）。S22（¶段末跨 gap 到 S23 前）。
 * 节拍：3789 左盘远弧图标缩入 ｜3838 天平梁倾斜（左升右降 16 帧）+ 右盘锁/节点组压下
 *       ｜3895 `single point of failure` GlitchIn(rgbSplit 6) + 支点红光 ｜3959 `for everyone at once` + 右盘再压一格。
 * 停留：末元素 3971 → 离场 4031，≥30 ✓。运镜：1.0→1.05 慢推（3781–3980，不进末拍）。主角：天平 320px。
 */
const F0 = 3781;
const TO = 4039;

const PIVOT = {x: 640, y: 480};
const BEAM_Y = 300;

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 左盘（远弧 = 已被解决的旧问题）
  const leftIn = clamp01((N - 3789) / 12);
  // 天平梁倾斜（3838 起 16 帧；3959 再压一格 8 帧）
  const tilt1 = clamp01((N - 3838) / 16);
  const tilt2 = clamp01((N - 3959) / 8);
  const tiltDeg = -9 * tilt1 - 4 * tilt2;
  // 右盘（锁+节点组）
  const rightIn = clamp01((N - 3846) / 14);
  // 大字（3895 GlitchIn）
  const bigN = N - 3895;
  // 灰字（3959）
  const greyIn = clamp01((N - 3959) / 8);
  // 晃动收敛（3971 起 20 帧）
  const sway = Math.sin((N - 3971) * 2.0) * 2 * Math.max(0, 1 - clamp01((N - 3971) / 20)) * tilt1;
  // 盘位置（沿梁端）
  const rad = (tiltDeg + sway) * Math.PI / 180;
  const lx = PIVOT.x - 300 * Math.cos(rad), ly = BEAM_Y - 300 * Math.sin(rad) * -1;
  const rx = PIVOT.x + 300 * Math.cos(rad), ry = BEAM_Y + 300 * Math.sin(rad) * -1;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3980, x: 640, y: 380, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 天平（支点三角 + 梁 + 两盘） */}
        <Svg bloom>
          {/* 支点 */}
          <path d={`M${PIVOT.x} ${PIVOT.y} L${PIVOT.x - 46} ${PIVOT.y + 120} L${PIVOT.x + 46} ${PIVOT.y + 120} Z`} fill="#000" stroke={N >= 3895 ? CORAL : WHITE} strokeWidth={3.5} />
          <line x1={PIVOT.x - 90} y1={PIVOT.y + 120} x2={PIVOT.x + 90} y2={PIVOT.y + 120} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" />
          {/* 梁（倾斜） */}
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={WHITE} strokeWidth={4} strokeLinecap="round" />
          {/* 吊线 */}
          <line x1={lx} y1={ly} x2={lx} y2={ly + 60} stroke={GREY_MID} strokeWidth={2} />
          <line x1={rx} y1={ry} x2={rx} y2={ry + 60} stroke={GREY_MID} strokeWidth={2} />
          {/* 支点红光（警示） */}
          {N >= 3895 ? <circle cx={PIVOT.x} cy={PIVOT.y} r={10} fill={CORAL} opacity={0.7 + 0.3 * Math.sin(N / 9)} /> : null}
        </Svg>

        {/* 左盘：distance（远弧图标，翘起） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: leftIn}}>
          <div style={{position: 'absolute', left: lx - 75, top: ly + 60, width: 150, height: 40, background: '#000', border: `2.5px solid ${GREY_MID}`, borderRadius: 6}} />
          <Svg bloom={false}>
            <path d={`M${lx - 48} ${ly + 78} Q${lx} ${ly + 52} ${lx + 48} ${ly + 78}`} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray="6 5" />
          </Svg>
          <CText cx={lx} cy={ly + 112} size={22} weight={500} color={GREY}>distance</CText>
        </div>

        {/* 右盘：trust（锁 + 节点组，压下） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: rightIn}}>
          <div style={{position: 'absolute', left: rx - 75, top: ry + 60, width: 150, height: 40, background: '#000', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 6}} />
          <Svg bloom>
            <rect x={rx - 16} y={ry + 26} width={32} height={26} rx={4} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={3} />
            <path d={`M${rx - 10} ${ry + 26} v-8 a10 10 0 0 1 20 0 v8`} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3} />
          </Svg>
          <CText cx={rx} cy={ry + 112} size={22} weight={500} color={PURPLE_LIGHT}>trust</CText>
        </div>

        {/* 大字 */}
        {bigN >= 0 ? (
          <GlitchIn N={N} f0={3895} rgbSplit={6}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={640} cy={130} size={48} weight={900} color={WHITE} letterSpacing={1}
                style={{WebkitTextStroke: '2px rgba(161,117,241,0.95)', paintOrder: 'stroke fill', transform: `scale(${emphasisPulse(bigN, {peak: 1.11})})`}}>single point of failure</CText>
            </div>
          </GlitchIn>
        ) : null}

        {/* 灰字 */}
        {greyIn > 0 ? (
          <SoftIn N={N} f0={3959}>
            <CText cx={640} cy={188} size={24} weight={400} color={GREY}>for everyone at once</CText>
          </SoftIn>
        ) : null}
      </div>
    </CameraRig>
  );
};
