import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, emphasisPulse, clamp01, easeOutCubic, FONT_ORB} from '../../common';
import {CText, Svg, GREY, WHITE, PURPLE, GREEN, exitOp, glowOffK, softOp, fadeIn, scaleIn as scaleInFn} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {TickerRow, CompileGear, hexTok, mcTok} from './g7ui';

/**
 * SC40 ★dex2oat · N 5824–5901（S40 5832–5899 段内：「Then the real magic: dex2oat.」）
 * 章 3 最高潮·魔法型（分镜表 SC22 运镜 = 本镜）。清场 → 5832 `the real magic:`（灰 34px）SoftIn →
 * 5846 `dex2oat`（Orbitron 110px 白+紫描边）GlitchIn（rgbSplit 7，**本镜唯一 glitch**）+ 5858 emphasisPulse 1.12 +
 * 紫描边光晕爆发（30 帧呼吸，持续）→ 5862 字节→机器码转换带（x 300–980，y≈480）左右两段相向 wipe 展开：
 * 左 3 行灰字节码（18px 快速滚动）→ 中间编译齿轮（白 3px，1.5°/帧持续旋转）→ 右 3 行绿机器码（0xA9BF 样式）。
 * 运镜：33 帧 1→1.15 推向大字（5824–5857，推完 = glitch 满态帧；大字落位后无运镜）。停留：段内不判。末 8 帧归零。
 */
const F0 = 5824;
const TO = 5901;
const B_SUB = 5832, B_BIG = 5846, B_GEAR = 5858, B_BELT = 5862;
const CAM: CamKey[] = [
  {f: 5824, x: 640, y: 360, s: 1},
  {f: 5857, x: 640, y: 340, s: 1.15},
];

const BELT = {
  yTop: 468, rowY: [18, 46, 74], // 容器内局部行 y（容器 y 468 → 世界 486/514/542）
  left: {x: 300, w: 260},
  right: {x: 720, w: 260},
  gear: {cx: 640, cy: 514, r: 34},
};

export const SC40: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 大字：glitch 12f → 满态 5858 → 脉冲 + 光晕爆发（指数收敛 + 30f 呼吸，持续到离场先灭光）
  const pulse = emphasisPulse(N - (B_BIG + 12), {peak: 1.12, up: 13, hold: 4, down: 13});
  const nL = N - (B_BIG + 12);
  const burst = nL < 0 ? 0 : 34 * Math.exp(-nL / 9);
  const glowPx = 10 + burst + 5 * Math.sin((2 * Math.PI * N) / 30);
  // 转换带：相向 wipe（左段自左缘向齿轮、右段自右缘向齿轮）
  const beltK = easeOutCubic(clamp01((N - B_BELT) / 16));
  const gearS = scaleInFn(N - B_GEAR, 14);
  const gearRot = 1.5 * (N - F0); // 1.5°/帧，全镜持续
  const chevOp = 0.75 * fadeIn(N - (B_BELT + 4), 8);

  return (
    <CameraRig N={N} keys={CAM}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 灰引导行 */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_SUB, 8)}}>
          <CText cx={640} cy={235} size={34} weight={600} color={GREY}>the real magic:</CText>
        </div>

        {/* dex2oat 大字（本镜唯一 glitch；紫描边 + 紫光晕爆发） */}
        <GlitchIn N={N} f0={B_BIG} rgbSplit={7} seed={40}>
          <CText
            cx={640}
            cy={330}
            size={110}
            weight={700}
            family={FONT_ORB}
            color={WHITE}
            letterSpacing={2}
            style={{
              transform: `translate(-50%,-50%) scale(${pulse.toFixed(4)})`,
              WebkitTextStroke: `3px ${PURPLE}`,
              paintOrder: 'stroke fill',
              textShadow: `0 0 ${Math.round(glowPx)}px rgba(161,117,241,${(0.55 * gk).toFixed(3)}), 0 0 4px rgba(161,117,241,${(0.5 * gk).toFixed(3)})`,
            }}
          >
            dex2oat
          </CText>
        </GlitchIn>

        {/* 转换带：字节 → 齿轮 → 机器码 */}
        {/* 左段（字节码，灰）自左缘向右展开 */}
        <div style={{position: 'absolute', left: BELT.left.x, top: BELT.yTop, width: BELT.left.w * beltK, height: 106, overflow: 'hidden'}}>
          <TickerRow x={0} y={BELT.rowY[0]} w={BELT.left.w} N={N} speed={3.4} size={18} color={GREY} unitCh={3} dir={1} glyph={(s) => hexTok(400, s)} />
          <TickerRow x={0} y={BELT.rowY[1]} w={BELT.left.w} N={N} speed={3.4} size={18} color={GREY} unitCh={3} dir={1} phase={31} glyph={(s) => hexTok(401, s)} />
          <TickerRow x={0} y={BELT.rowY[2]} w={BELT.left.w} N={N} speed={3.4} size={18} color={GREY} unitCh={3} dir={1} phase={62} glyph={(s) => hexTok(402, s)} />
        </div>
        {/* 右段（机器码，绿）自右缘向左展开 */}
        <div style={{position: 'absolute', left: BELT.right.x + BELT.right.w * (1 - beltK), top: BELT.yTop, width: BELT.right.w * beltK, height: 106, overflow: 'hidden'}}>
          <TickerRow x={0} y={BELT.rowY[0]} w={BELT.right.w} N={N} speed={4.8} size={18} color={GREEN} unitCh={7} dir={1} glyph={(s) => mcTok(420, s)} />
          <TickerRow x={0} y={BELT.rowY[1]} w={BELT.right.w} N={N} speed={4.8} size={18} color={GREEN} unitCh={7} dir={1} phase={53} glyph={(s) => mcTok(421, s)} />
          <TickerRow x={0} y={BELT.rowY[2]} w={BELT.right.w} N={N} speed={4.8} size={18} color={GREEN} unitCh={7} dir={1} phase={97} glyph={(s) => mcTok(422, s)} />
        </div>

        {/* 编译齿轮（白 3px，持续旋转） */}
        {gearS > 0 ? <CompileGear cx={BELT.gear.cx} cy={BELT.gear.cy} r={BELT.gear.r} rot={gearRot} opacity={0.95 * gearS} /> : null}

        {/* 流向小箭头（字节 → 齿轮 → 机器码） */}
        <Svg bloom={false}>
          <g stroke={WHITE} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={chevOp}>
            <path d="M570,506 l8,8 l-8,8" />
            <path d="M694,506 l8,8 l-8,8" />
          </g>
        </Svg>
      </div>
    </CameraRig>
  );
};

export default SC40;
