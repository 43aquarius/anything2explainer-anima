import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, GlitchIn, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, Pill, Check, Cross, GREY, GREY_MID, WHITE, GREEN, CORAL, abs, exitOp} from '../../ui';

/**
 * SC16 单向门（3251–3424）。S23（¶段末）。
 * 节拍：3259 门框 draw-on（20 帧）+ 转闸出现 ｜3282 `one-way doors` 大字 GlitchIn(rgbSplit 4)
 *       ｜3337 绿箭头 draw-on（14 帧）+ `g^a` 小球穿门（3340–3360）+ 转闸顺转半圈
 *       ｜3351 对照 Pill 前挂 2 帧错峰 ｜3382 红箭头撞门锁死（3358–3376）+ 断裂 + Cross（3376–3384，对齐 c4"拆回去不行"）。
 * 持续：转闸每 40 帧"顺转半圈 + 回锁"循环（3384 后停用，改锁死微抖警示）。
 * 停留：段末末拍 Cross 落位 3384 → 离场 3416，≥30 ✓。
 * 运镜：1.0→1.05 慢推（3251–3386，运镜不进末拍）。主角：单向门 300px 白描边 BLOOM。
 */
const F0 = 3251;
const TO = 3459; // 段末跨 gap15 延伸到 SC17 首帧前（分镜表 v2）

const DOOR = {cx: 640, cy: 400, w: 260, h: 300};

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 门框 draw-on（3259 起 20 帧，分段描边）
  const doorP = clamp01((N - 3259) / 20);
  const x0 = DOOR.cx - DOOR.w / 2, x1 = DOOR.cx + DOOR.w / 2, y0 = DOOR.cy - DOOR.h / 2, y1 = DOOR.cy + DOOR.h / 2;

  // 转闸（十字）：c3 顺转半圈（3340–3348）；之后每 40 帧一次"半圈 + 回锁"；3376 起锁死
  const baseSpin = (t: number) => {
    if (t < 3340) return 0;
    if (t < 3348) return -90 * clamp01((t - 3340) / 8); // 顺转半圈（左转向）
    const cyc = (t - 3348) % 40;
    const back = cyc < 10 ? 90 * clamp01(cyc / 10) : 90; // 回锁
    return -90 + back;
  };
  const locked = N >= 3376;
  const shake = locked ? Math.sin(N * 3.1) * 2 * Math.max(0, 1 - (N - 3376) / 20) : 0;
  const spin = locked ? -90 : baseSpin(N);

  // 绿箭头 draw-on（3337 起 14 帧）+ g^a 小球穿门（3340–3360）
  const gArrow = clamp01((N - 3337) / 14);
  const ballT = clamp01((N - 3340) / 20);
  const ballX = 300 + 680 * ballT;

  // 红箭头反向试探（3358 起）：撞门 3370，断裂 3374，Cross 3376–3384
  const rArrow = clamp01((N - 3358) / 12);
  const rHit = N >= 3370;
  const rBroken = N >= 3374;
  const crossP = clamp01((N - 3376) / 8);

  // 对照 Pill（3351 前挂，2 帧错峰）
  const pillA = clamp01((N - 3351) / 8);
  const pillB = clamp01((N - 3353) / 8);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3386, x: 640, y: 390, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 门框（draw-on：左右柱 + 顶梁，perimeter 分三段） */}
        <Svg bloom>
          {doorP > 0 ? <line x1={x0} y1={y1} x2={x0} y2={y1 - (y1 - y0) * doorP} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" /> : null}
          {doorP > 0 ? <line x1={x1} y1={y1} x2={x1} y2={y1 - (y1 - y0) * doorP} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" /> : null}
          {doorP > 0.5 ? <line x1={x0} y1={y0} x2={x0 + DOOR.w * clamp01((doorP - 0.5) * 2)} y2={y0} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" /> : null}
        </Svg>

        {/* 转闸（十字，锁死时高频微抖） */}
        {doorP > 0.6 ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `rotate(${spin + shake}deg)`, transformOrigin: `${DOOR.cx}px ${DOOR.cy}px`, opacity: clamp01((N - 3271) / 8)}}>
            <Svg bloom>
              <line x1={DOOR.cx - 80} y1={DOOR.cy} x2={DOOR.cx + 80} y2={DOOR.cy} stroke={locked ? CORAL : WHITE} strokeWidth={5} strokeLinecap="round" />
              <line x1={DOOR.cx} y1={DOOR.cy - 80} x2={DOOR.cx} y2={DOOR.cy + 80} stroke={locked ? CORAL : WHITE} strokeWidth={5} strokeLinecap="round" />
              <circle cx={DOOR.cx} cy={DOOR.cy} r={7} fill="#000" stroke={locked ? CORAL : WHITE} strokeWidth={3} />
            </Svg>
          </div>
        ) : null}

        {/* 绿箭头（顺行，左→右）+ g^a 小球 */}
        {gArrow > 0 ? (
          <Svg bloom>
            <line x1={300} y1={266} x2={300 + 300 * gArrow} y2={266} stroke={GREEN} strokeWidth={4} strokeLinecap="round" />
            {gArrow >= 1 ? <path d={`M${600} 266 l-16 -9 v18 Z`} fill={GREEN} /> : null}
            <text x={420} y={248} fill={GREEN} fontSize={26} fontFamily={FONT_MONO} textAnchor="middle">g^a</text>
          </Svg>
        ) : null}
        {ballT > 0 && ballT < 1 ? (
          <div style={{...abs(0, 0, 1280, 720)}}>
            <div style={{position: 'absolute', left: ballX - 6, top: 260, width: 12, height: 12, borderRadius: '50%', background: GREEN, boxShadow: `0 0 10px ${GREEN}`}} />
          </div>
        ) : null}

        {/* 红箭头（反向试探，右→左，撞门断裂） */}
        {rArrow > 0 && !rBroken ? (
          <Svg bloom={false}>
            <line x1={980} y1={530} x2={980 - 260 * rArrow} y2={530} stroke={CORAL} strokeWidth={4} strokeLinecap="round" />
            <path d={`M${720 + 10} 530 l16 -9 v18 Z`} fill={CORAL} />
          </Svg>
        ) : null}
        {rBroken ? (
          <Svg bloom={false}>
            <line x1={980} y1={530} x2={850} y2={522} stroke={CORAL} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
            <line x1={810} y1={545} x2={724} y2={536} stroke={CORAL} strokeWidth={4} strokeLinecap="round" opacity={0.85} transform={`rotate(${(N - 3374) * 2}, 770, 540)`} />
          </Svg>
        ) : null}

        {/* Cross（3376 draw-on，对齐 c4） */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={770} cy={530} size={70} sw={5} />
          </div>
        ) : null}

        {/* 对照 Pill（3351 前挂入场） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: pillA}}>
          <Pill x={160} y={574} w={280} h={48} fontSize={24} text="forward: easy" color={WHITE} stroke={GREEN} />
          <div style={{position: 'absolute', left: 300, top: 588}}><Check cx={0} cy={0} size={30} p={pillA} /></div>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: pillB}}>
          <Pill x={880} y={574} w={340} h={48} fontSize={24} text="backward: infeasible" color={WHITE} stroke={CORAL} />
          <div style={{position: 'absolute', left: 1190, top: 588}}><Cross cx={0} cy={0} size={30} p={pillB} /></div>
        </div>
        <SoftIn N={N} f0={3282}>
          <CText cx={640} cy={132} size={20} weight={400} color={GREY_MID} family={FONT_MONO}>discrete logarithm</CText>
        </SoftIn>

        {/* 大标题 one-way doors（GlitchIn，本镜唯一 glitch） */}
        <GlitchIn N={N} f0={3282} rgbSplit={4}>
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText cx={640} cy={90} size={52} weight={900} color={WHITE} letterSpacing={1}
              style={{WebkitTextStroke: '2px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>one-way doors</CText>
          </div>
        </GlitchIn>
      </div>
    </CameraRig>
  );
};
