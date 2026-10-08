import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic, clamp01} from '../../common';
import {CText, Svg, WHITE, GREY, exitOp, softOp} from '../../ui';
import {BulbGlyph} from './g4ui';

/**
 * SC22 再一个转折（3244–3279，S22：3252 还有一个转折——全镜 36 帧超短过渡）
 * 清场 → 中央大号 L 形转角箭头（(390,250)→(640,250)→(640,470)，白 6px，draw-on 12f + 箭头端 4f 弹出）
 * + 转角处一枚灯泡（3258 SoftIn，~3266 白闪一次：BulbGlyph flash）+ 下方 `one more twist` 灰 26px。
 * 末 8 帧归零（3271–3279）。停留：段内不判（段内小句镜头）。
 * 主角：转角箭头组 ≈250×230（分镜表写 120px，为免 36 帧内画面过空放大到组 >170）；光：灯泡白闪。
 */
export const F0 = 3244;
const B_TURN = 3252, B_BULB = 3258, B_CAP = 3256, B_FLASH = 3266, TO = 3279, EXIT_LEN = 8;

const PATH = [
  {x: 390, y: 250},
  {x: 640, y: 250},
  {x: 640, y: 470},
];
const L1 = PATH[1].x - PATH[0].x; // 250
const L2 = PATH[2].y - PATH[1].y; // 220
const TOTAL = L1 + L2;

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  // L 形箭头 draw-on（12f）+ 箭头端 4f 弹出
  const drawP = easeOutCubic(clamp01((N - B_TURN) / 12));
  const drawn = TOTAL * drawP;
  const seg1 = Math.min(drawn, L1);
  const seg2 = Math.max(0, drawn - L1);
  const headP = clamp01((N - (B_TURN + 9)) / 4);
  // 灯泡白闪（~3266 起 5f 脉冲；离场先灭光）
  const flash = N >= B_FLASH ? Math.sin(Math.PI * clamp01((N - B_FLASH) / 5)) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Svg>
        {/* L 形转角箭头 */}
        <path
          d={`M ${PATH[0].x} ${PATH[0].y} H ${PATH[0].x + seg1} ${seg2 > 0 ? `V ${PATH[1].y + seg2}` : ''}`}
          fill="none"
          stroke={WHITE}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {headP > 0 ? (
          <polygon
            points={`${PATH[2].x},${PATH[2].y + 9} ${PATH[2].x - 14},${PATH[2].y - 14} ${PATH[2].x + 14},${PATH[2].y - 14}`}
            fill={WHITE}
            style={{transformOrigin: `${PATH[2].x}px ${PATH[2].y}px`, transform: `scale(${(0.3 + 0.7 * headP).toFixed(3)})`}}
          />
        ) : null}
        {/* 转角处小圆点（转点标记） */}
        {drawP > 0.4 ? <circle cx={PATH[1].x} cy={PATH[1].y} r={5} fill={WHITE} opacity={0.9} /> : null}
      </Svg>

      {/* 灯泡（转角处，白闪一次） */}
      <BulbGlyph cx={PATH[1].x} cy={PATH[1].y - 44} flash={flash} opacity={softOp(N - B_BULB, 6)} />

      {/* 小字 */}
      <CText cx={640} cy={530} size={26} weight={600} color={GREY} opacity={softOp(N - B_CAP, 8)}>one more twist</CText>
    </div>
  );
};

export default SC22;
