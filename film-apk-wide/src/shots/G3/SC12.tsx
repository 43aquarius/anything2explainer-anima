import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, kf, powIn, rnd, GlitchIn, emphasisPulse, FONT_MONO, FONT_WIDE} from '../../common';
import {CText, Box, Svg, WHITE, PURPLE, PURPLE_LIGHT, CORAL, GREY, BLOOM, fadeIn, exitOp, glowOffK} from '../../ui';
import {CameraRig} from '../../fx';

/**
 * SC12 官司 · N 1714–1963（S12 1722–1941 ¶：1722 被告了 / 1807 PKARC vs ARC / 1848 回答是 / 1883 新格式 ZIP）
 * 对峙构图：左右两张"法庭卡"（各 320×260，y 230–490）：左 `PKARC`（等宽 34px 白）+ `his archiver`（灰 22px）、
 *   右 `ARC` + `the rival`；两卡之间红色闪电状"起诉线"（右卡劈向左卡，3px CORAL）；下方中央 `ZIP`
 *   （Audiowide 96px 白+紫描边）自两卡下方的碰撞尘埃中升起（powIn 21 帧 + GlitchIn rgbSplit 6，本镜唯一 glitch）。
 * 节拍：1716 右卡 scaleIn（节拍 −6 容差内，避免镜首空场）→ 1734 左卡 scaleIn → 1745 起诉线 draw-on 12 帧
 *   → 1757 左卡被击中（1.05 震颤 + 边框红闪一次）；1807/1811 两卡下缀打字机；1848 碰撞点白点小爆发（8 帧 8 枚）；
 *   1883 `ZIP` 上升入场 + GlitchIn + 紫描边光晕呼吸（持续）；红线 1883–1899 渐暗消失、双卡变暗 55%（衬托）；
 *   运镜 1895–1926 推 1→1.08 对准 ZIP（31 帧：受「glitch 结束 1894 + 运镜结束 ≤ 离场 1956−30」双约束，比分镜表 33 帧短 2，已记录）。
 * 停留：段末（¶），ZIP 落位 1883+21=1904 → 离场 1963−8=1956−8，hold 52 帧 ✓。末 8 帧归零（紫晕先灭 6 帧）。
 */
const F0 = 1714, TO = 1963;
const T_RCARD = 1716; // 右卡（ARC，原告方）scaleIn 21 帧（节拍 1722 的 −6）
const T_LCARD = 1734; // 左卡（PKARC）scaleIn 21 帧
const T_BOLT = 1745; // 起诉线 draw-on 12 帧
const T_HIT = 1757; // 左卡被击中：震颤 12 帧 + 边框红闪
const T_LABEL = [1807, 1811]; // 两卡下缀打字机
const T_DUST = 1848; // 碰撞尘埃（8 帧）
const T_ZIP = 1883; // ZIP 上升入场 + GlitchIn；落位 T_ZIP+21 = 1904
const T_PULSE = 1907; // emphasisPulse 1.11
const CAM_KEYS = [
  {f: 1895, x: 640, y: 440, s: 1},
  {f: 1926, x: 640, y: 440, s: 1.08},
];

const LCARD = {x: 150, y: 230, w: 320, h: 260};
const RCARD = {x: 810, y: 230, w: 320, h: 260};
const CARDS = [
  {box: LCARD, title: 'PKARC', sub: 'his archiver', tIn: T_LCARD, tLabel: T_LABEL[0]},
  {box: RCARD, title: 'ARC', sub: 'the rival', tIn: T_RCARD, tLabel: T_LABEL[1]},
];

/** 起诉线折线（右卡左缘 → 左卡右缘，锯齿） */
const BOLT: Array<[number, number]> = [[810, 336], [768, 300], [722, 372], [664, 318], [606, 380], [548, 326], [500, 362], [472, 348]];
const boltLen = BOLT.reduce((a, [x, y], i) => (i ? a + Math.hypot(x - BOLT[i - 1][0], y - BOLT[i - 1][1]) : 0), 0);

const DUST_C = {x: 640, y: 548};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6); // ZIP 紫晕先灭

  // ---- 双卡（scaleIn 21 帧 + 击中震颤 + 红闪 + 1883 后变暗 55%） ----
  const dimK = clamp01((N - T_ZIP) / 12) * 0.45; // → 卡组透明度 1-0.45
  const hitN = N - T_HIT;
  const tremor = hitN >= 0 && hitN < 12 ? 3.2 * (1 - hitN / 12) * Math.sin(hitN * 1.25) : 0; // 左卡震颤
  const redK = kf(N, [[T_HIT, 0], [T_HIT + 2, 1], [T_HIT + 8, 1], [T_HIT + 14, 0]]); // 红闪一次

  // ---- ZIP（大字主角，96px） ----
  const zn = N - T_ZIP;
  const zy = kf(N, [[T_ZIP, 572], [T_ZIP + 21, 543]], powIn(2.2));
  const zs = kf(N, [[T_ZIP, 0.66], [T_ZIP + 16, 1]], easeOutCubic);
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.11});
  const zipGlow = `0 0 ${(26 + 8 * Math.sin((2 * Math.PI * N) / 30)).toFixed(1)}px 10px rgba(102,45,248,${(0.45 * glowK).toFixed(3)})`;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* 两张法庭卡 */}
        {CARDS.map((c, ci) => {
          const tn = N - c.tIn;
          if (tn < 0) return null;
          const s = 0.55 + 0.45 * clamp01(tn / 21);
          const op = fadeIn(tn, 6) * (1 - dimK);
          const border = ci === 0 && redK > 0 ? `rgb(${Math.round(255 + (241 - 255) * redK)},${Math.round(255 + (96 - 255) * redK)},${Math.round(255 + (67 - 255) * redK)})` : WHITE;
          const dx = ci === 0 ? tremor : 0;
          return (
            <div key={c.title} style={{position: 'absolute', inset: 0, opacity: op}}>
              <div style={{position: 'absolute', inset: 0, transform: `translateX(${dx.toFixed(2)}px)`}}>
                <div style={{position: 'absolute', inset: 0, transform: `scale(${s.toFixed(4)})`, transformOrigin: `${c.box.x + c.box.w / 2}px ${c.box.y + c.box.h / 2}px`}}>
                  <Box x={c.box.x} y={c.box.y} w={c.box.w} h={c.box.h} r={10} sw={2.5} stroke={border} glow={ci === 0 && redK > 0.02 ? `0 0 18px 6px rgba(241,96,67,${(0.55 * redK).toFixed(3)})` : undefined} />
                  <CText cx={c.box.x + c.box.w / 2} cy={c.box.y + 118} size={34} weight={700} family={FONT_MONO} letterSpacing={2} color={WHITE}>{c.title}</CText>
                  <CText cx={c.box.x + c.box.w / 2} cy={c.box.y + 172} size={22} weight={600} color={GREY}>
                    {N < c.tLabel ? '' : c.sub.slice(0, Math.floor((N - c.tLabel) / 2))}
                  </CText>
                </div>
              </div>
            </div>
          );
        })}

        {/* 起诉线（红色闪电，draw-on → 渐暗消失） */}
        {(() => {
          const bp = clamp01((N - T_BOLT) / 12);
          const fade = 1 - clamp01((N - T_ZIP) / 16);
          if (bp <= 0 || fade <= 0) return null;
          return (
            <Svg bloom={false} opacity={fade}>
              <polyline
                points={BOLT.map((q) => q.join(',')).join(' ')}
                fill="none"
                stroke={CORAL}
                strokeWidth={3}
                strokeDasharray={boltLen}
                strokeDashoffset={boltLen * (1 - bp)}
                style={{filter: 'drop-shadow(0 0 5px rgba(241,96,67,.55))'}}
              />
              {/* 击中星芒（4 短线，8 帧） */}
              {hitN >= 0 && hitN < 8
                ? [0, 1, 2, 3].map((i) => {
                    const a = (i / 4) * Math.PI * 2 + 0.5;
                    const r0 = 8 + hitN * 2.2, r1 = r0 + 12 * (1 - hitN / 8);
                    return <line key={i} x1={472 + Math.cos(a) * r0} y1={348 + Math.sin(a) * r0} x2={472 + Math.cos(a) * r1} y2={348 + Math.sin(a) * r1} stroke={WHITE} strokeWidth={2.5} opacity={1 - hitN / 8} />;
                  })
                : null}
            </Svg>
          );
        })()}

        {/* 碰撞尘埃（白点 8 枚，14 帧 + BLOOM；放大到采样阈值上：回答是） */}
        {Array.from({length: 8}, (_, i) => {
          const born = T_DUST + Math.floor(rnd(41, i) * 3);
          const t = N - born;
          if (t < 0 || t > 14) return null;
          const ang = rnd(42, i) * Math.PI * 2;
          const dist = (26 + rnd(43, i) * 52) * easeOutCubic(t / 14);
          const r = 4 + rnd(44, i) * 3.5;
          return <div key={i} style={{position: 'absolute', left: DUST_C.x + Math.cos(ang) * dist - r, top: DUST_C.y + Math.sin(ang) * dist * 0.72 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: WHITE, opacity: (1 - t / 14) * 0.95, filter: BLOOM}} />;
        })}

        {/* 碰撞白闪圈（4 帧，r 72）：让 1848 的拍子在缩略采样下可读 */}
        {(() => {
          const ft = N - T_DUST;
          if (ft < 0 || ft > 4) return null;
          return <div style={{position: 'absolute', left: DUST_C.x - 36, top: DUST_C.y - 36, width: 72, height: 72, borderRadius: '50%', border: `3px solid rgba(255,255,255,${(0.9 * (1 - ft / 4)).toFixed(2)})`, opacity: 1 - ft / 4, filter: BLOOM}} />;
        })()}

        {/* ZIP 大字：powIn 上升 + GlitchIn（rgbSplit 6，本镜唯一 glitch）+ 紫描边光晕呼吸 */}
        {zn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 558px', transform: `scale(${(zs * pulse).toFixed(4)})`}}>
            <GlitchIn N={N} f0={T_ZIP} rgbSplit={6} seed={12}>
              <CText cx={640} cy={zy} size={96} weight={400} family={FONT_WIDE} letterSpacing={10} color={WHITE} shadow={zipGlow} style={{WebkitTextStroke: `3px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}>
                ZIP
              </CText>
            </GlitchIn>
          </div>
        ) : null}
      </CameraRig>
    </div>
  );
};
