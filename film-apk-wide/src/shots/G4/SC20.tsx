import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic, clamp01} from '../../common';
import {CText, Svg, WHITE, GREY, GREY_LINE, exitOp, softOp} from '../../ui';
import {ToolIcon} from './g4ui';

/**
 * SC20 工具遍地（2859–2994，S20：2867 工具遍地 / 2930 到 2008 有二十年）
 * 一条"时间带"（x 180–1100，y 300，白 3px）：左端 `1989`、右端 `2008`（Orbitron 28px）；
 * 带上等距 7 枚工具简笔（zip/软盘/光盘/终端/压缩器/罐头/扳手，g4ui ToolIcon ≤52px，cx 250–1030）：
 * 2867 带自左 draw-on（18f）+ 图标灰态 4f 错峰 SoftIn + 刻度线；
 * 2930 七枚按 6 帧间隔依次点亮（3f 白闪→85% 保持）+ 两端年份 SoftIn + `twenty years of tooling` 灰 26px；
 * 带右端一枚小箭头 1px/帧持续推进（2930 起，时间之流，持续动作）；末 8 帧归零。
 * 停留：段内不判。主角：时间带+图标组（x 180–1170 横贯，组高 >150）；光：点亮工具白闪（g4ui lit 自带 drop-shadow）。
 */
export const F0 = 2859;
const B_BAND = 2867, B_ICONS = 2871, B_Y1 = 2875, B_Y2 = 2885, B_LIT = 2930, B_CAP = 2934, TO = 2994, EXIT_LEN = 8;
const FONT_ORB = "'Orbitron', Audiowide, sans-serif";

const BAND = {x0: 180, x1: 1100, y: 300};
const ICON_X = [250, 380, 510, 640, 770, 900, 1030];

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  const bandP = easeOutCubic(clamp01((N - B_BAND) / 18));
  const tipX = BAND.x0 + (BAND.x1 - BAND.x0) * bandP;
  // 箭头（带右端持续推进 1px/帧，2930 起；时间之流）
  const arrowN = N - B_LIT;
  const arrowX = Math.min(1170, BAND.x1 + 8 + Math.max(0, arrowN));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 时间带 + 刻度 */}
      <Svg>
        <line x1={BAND.x0} y1={BAND.y} x2={tipX} y2={BAND.y} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
        {ICON_X.map((x, i) => {
          const p = clamp01((N - (B_ICONS + i * 4)) / 8);
          if (p <= 0) return null;
          return <line key={i} x1={x} y1={BAND.y - 7} x2={x} y2={BAND.y + 7} stroke={i < Math.ceil((N - B_LIT) / 6) && N >= B_LIT ? WHITE : GREY_LINE} strokeWidth={2} opacity={p} />;
        })}
        {/* 推进箭头（2930 起） */}
        {arrowN >= 0 ? (
          <g opacity={softOp(N - B_LIT, 6)}>
            <line x1={arrowX - 26} y1={BAND.y} x2={arrowX - 8} y2={BAND.y} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
            <polygon points={`${arrowX},${BAND.y} ${arrowX - 12},${BAND.y - 6} ${arrowX - 12},${BAND.y + 6}`} fill={WHITE} />
          </g>
        ) : null}
      </Svg>

      {/* 七枚工具图标（灰态错峰入 → 2930 依次点亮） */}
      {ICON_X.map((x, i) => {
        const inOp = softOp(N - (B_ICONS + i * 4), 8);
        if (inOp <= 0) return null;
        const lit = clamp01((N - (B_LIT + i * 6)) / 3);
        return <ToolIcon key={i} i={i} cx={x} cy={BAND.y} lit={lit} opacity={inOp} />;
      })}

      {/* 两端年份（带到达时出现） */}
      <CText cx={BAND.x0} cy={BAND.y - 56} size={28} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2} opacity={softOp(N - B_Y1, 8)}>1989</CText>
      <CText cx={BAND.x1} cy={BAND.y - 56} size={28} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={2} opacity={softOp(N - B_Y2, 8)}>2008</CText>

      {/* 下方说明 */}
      <CText cx={640} cy={BAND.y + 72} size={26} weight={600} color={GREY} opacity={softOp(N - B_CAP, 8)}>twenty years of tooling</CText>
    </div>
  );
};

export default SC20;
