import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, slideIn} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, Box, Svg, SoftIn, abs, exitOp, glowOffK, softOp, glowPurpleS,
  GREY, GREY_LINE, PURPLE_LIGHT, WHITE,
} from '../../ui';
import {YearRoll, WorldSketch, NodeDot, WORLD_NODES, WORLD_EDGES} from './g5ui';

/**
 * SC13 Akamai（3026–3292）。S18：Akamai 1998 年从 MIT 分拆 → 成了答案 → 今天它的平台承载 → 互联网相当大份额。
 * ★高光时刻·论点型（≥90 帧编排：3034 → 3252 持续搭建；禁扫光，白闪 + GlitchIn 变体）。
 * 节拍：3028 `1998` YearRoll（−6 前挂，衔接 SC12 离场）｜3034 `Akamai` GlitchIn（rgbSplit 6，白名单）+ 白闪 4 帧
 *       ｜3046 emphasisPulse｜3048 `spun out of MIT` SoftIn｜3133 右半世界轮廓 draw-on（16 帧 × 1 帧错峰）
 *       ｜3168 边缘节点群 4 波点亮（每波 2 帧错峰）+ 节点间连线渐次 draw-on 成网 + 33 帧 1→1.18 推近（3168–3201）
 *       ｜3210 占比亮条从左向右充满（24 帧）+ `a meaningful share` SoftIn + 全网呼吸轮亮（持续动作）。
 * 停留：段内不判（S18 末块 80）。网呼吸在 TO−40（3252）前衰减冻结。
 * 主角：承载网 + `Akamai` 380px（网节点紫光 + 亮条紫光）。
 */
const F0 = 3026;
const TO = 3292;

// 右半承载网
const MAP = {cx: 875, cy: 305, w: 520, h: 300};
const NODE_W = (i: number): [number, number] => [MAP.cx - MAP.w / 2 + WORLD_NODES[i][0], MAP.cy - MAP.h / 2 + WORLD_NODES[i][1]];

// 波次：按经度（x）西→东排 4 波
const RANK = WORLD_NODES.map((_, i) => i).sort((a, b) => WORLD_NODES[a][0] - WORLD_NODES[b][0]);
const RANK_OF = new Array(WORLD_NODES.length).fill(0);
RANK.forEach((nodeIdx, r) => (RANK_OF[nodeIdx] = r));
const nodeStart = (i: number) => 3168 + Math.min(3, Math.floor(RANK_OF[i] / 5)) * 10 + (RANK_OF[i] % 5) * 2;
const edgeStart = (e: [number, number]) => Math.max(nodeStart(e[0]), nodeStart(e[1])) + 3;

// 占比亮条
const BAR = {x: 665, y: 528, w: 420, h: 20};

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 呼吸轮亮：节点各自微呼吸 + 3226 起全网自西向东轮亮；TO−40（3252）前衰减冻结
  const decayK = 1 - clamp01((N - 3242) / 10);
  const rollK = clamp01((N - 3226) / 6);
  const osc = (i: number) => {
    const t0 = nodeStart(i);
    const breath = 0.12 * Math.sin(((N - t0) / 36) * Math.PI * 2 + i * 0.9);
    const roll = 0.2 * Math.sin(((N - 3226) / 40) * Math.PI * 2 - (WORLD_NODES[i][0] / 520) * Math.PI * 2 * 1.1);
    return 0.72 + (breath + roll * rollK) * decayK;
  };

  // 亮条
  const barP = slideIn(N - 3210, 24);
  // 白闪（论点型开场：3034–3038）
  const flash = N >= 3034 && N < 3039 ? 0.5 * (1 - (N - 3034) / 4) : 0;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3168, x: 640, y: 360, s: 1}, {f: 3201, x: 875, y: 355, s: 1.18}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左列：1998 + Akamai + spun out of MIT */}
        <YearRoll N={N} f0={3028} cx={320} cy={218} from={1990} to={1998} size={96} color={WHITE}
          shadow={`6px 6px 0 #6630F8, 0 0 28px rgba(102,48,248,${(0.45 * glowK).toFixed(2)})`} />
        {N >= 3034 && (
          <GlitchIn N={N} f0={3034} rgbSplit={6} seed={13}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${emphasisPulse(N - 3046, {peak: 1.11}).toFixed(4)})`, transformOrigin: '320px 314px'}}>
              <CText cx={320} cy={314} size={64} weight={900} letterSpacing={1} color={WHITE}
                shadow={`0 0 26px rgba(102,48,248,${(0.5 * glowK).toFixed(2)})`}
                style={{WebkitTextStroke: '2.5px #6630F8', paintOrder: 'stroke fill'}}>
                Akamai
              </CText>
            </div>
          </GlitchIn>
        )}
        {/* 白闪 */}
        {flash > 0 && (
          <div style={{...abs(320 - 175, 314 - 80, 350, 160), borderRadius: '50%', opacity: flash,
            background: 'radial-gradient(circle, rgba(255,255,255,.85) 0%, rgba(255,255,255,0) 70%)'}} />
        )}
        <SoftIn N={N} f0={3048}>
          <CText cx={320} cy={372} size={24} weight={500} letterSpacing={1} color={GREY}>spun out of MIT</CText>
        </SoftIn>

        {/* 右半：世界轮廓 + 边缘节点网（主角 380px） */}
        <WorldSketch cx={MAP.cx} cy={MAP.cy} N={N} f0={3133} w={MAP.w} h={MAP.h} />
        {/* 连线（渐次 draw-on 成网） */}
        <Svg bloom={false}>
          {WORLD_EDGES.map(([a, b], i) => {
            const k = clamp01((N - edgeStart([a, b])) / 10);
            if (k <= 0) return null;
            const [ax, ay] = NODE_W(a), [bx, by] = NODE_W(b);
            const shimmer = 0.5 + 0.16 * Math.sin(((N - edgeStart([a, b])) / 36) * Math.PI * 2 + i * 1.3) * decayK;
            return <line key={i} x1={ax} y1={ay} x2={ax + (bx - ax) * k} y2={ay + (by - ay) * k}
              stroke={PURPLE_LIGHT} strokeWidth={1.5} opacity={shimmer} />;
          })}
        </Svg>
        {/* 节点（4 波 × 2 帧错峰点亮 + 呼吸轮亮） */}
        {WORLD_NODES.map((_, i) => {
          const k = clamp01((N - nodeStart(i)) / 7);
          if (k <= 0.01) return null;
          const [wx, wy] = NODE_W(i);
          return <NodeDot key={i} cx={wx} cy={wy} k={k} size={9} glowK={k * Math.min(1.1, osc(i))} />;
        })}

        {/* 底部占比亮条（从左向右充满） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 3210, 6)}}>
          <Box x={BAR.x} y={BAR.y} w={BAR.w} h={BAR.h} r={10} fill="#0a0a0a" stroke={GREY_LINE} sw={2} />
          {barP > 0.01 && (
            <>
              <div style={{...abs(BAR.x + 4, BAR.y + 4, (BAR.w - 8) * barP, BAR.h - 8), borderRadius: 8,
                background: 'linear-gradient(90deg, #6630F8, #A175F1)', boxShadow: glowPurpleS(0.75 * glowK)}} />
              <div style={{...abs(BAR.x + BAR.w * barP - 5, BAR.y + BAR.h / 2 - 5, 10, 10), borderRadius: '50%',
                background: WHITE, opacity: Math.min(1, barP * 2), boxShadow: '0 0 10px rgba(255,255,255,.8)'}} />
            </>
          )}
          <SoftIn N={N} f0={3212}>
            <CText cx={BAR.x + BAR.w / 2} cy={BAR.y + 38} size={26} weight={500} letterSpacing={1} color={GREY}>a meaningful share</CText>
          </SoftIn>
        </div>
      </div>
    </CameraRig>
  );
};

export const SC13_RANGE = {from: F0, to: TO};
