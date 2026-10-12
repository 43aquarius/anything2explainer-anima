import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, emphasisPulse, GlitchIn, kf, powOutRemain, rnd, FONT_ORB, FONT_TECH} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  AsChip, CText, ClockIcon, MapFrame, EXAMPLE, GREY, GREY_LINE, GREY_MID, ORANGE, PURPLE_LIGHT, RED_DEEP, WHITE,
  abs, SoftIn, fadeIn, softOp, firstOp, exitOp, glowOffK, Svg,
} from '../../ui';
import {MapNodeChip, RefreshWall, qbez} from './g5ui';

/**
 * SC12 六小时 · N 2777–3152（S21–S23 ¶ 章末；TO = C4−54 = 3152，章节卡 3153 前一帧）
 * **高光时刻·事件型**（路由撤回 + 刷新墙 + ClockIcon 六小时）。
 * 节拍：2785「That October day, Facebook withdrew」地图框 slideUp 承接（2781 起 Δ70/18f）+ 芯片灯亮
 *        ｜2847「its own routes, by mistake, from inside」四条路由线逐条溶解（各 12f、4f 间隔，橙色碎片粒子
 *          向框边飘散）+ 芯片内部小红点闪 3 次 + `mistake` 小字
 *        ｜2950「Within minutes, the map stopped」`Facebook` 标签淡出 → `?` 弹入 + 芯片灯全灭
 *          + 框内相连小芯片集体降饱和（「地图忘了它」）
 *        ｜3005「knowing Facebook's name」刷新墙 24 枚 spinner 2 帧错峰波次转起（永续）+ `billions hit reload`
 *        ｜3054「For almost six hours」ClockIcon 缩入 + 指针加速旋转 + `≈ 6 hours` GlitchIn（rgbSplit 4，本镜唯一）
 *          + 计数落定 + 橙光晕
 *        ｜3100「billions of people hit reload」`30x` 小字（DNS queries: 30x normal）+ 上扬小柱状条（3096 起，
 *          第三根 30 倍高亮橙）+ 刷新墙继续。
 * 停留：末拍（柱状条+小字）3096–3110 落位 → 离场 3145（exitOp 8f）→ hold ≈ 35f ✓。
 * 运镜：3005–3038 推近 1→1.12（推向刷新墙所在的下半；取中下目标保 3054 后右簇入画）→ 3062–3094 章末拉回 1.0。
 * 主角：撤回地图+刷新墙组 340px（芯片紫 GlowBlob→灭；spinner 白；`≈ 6 hours` 橙光）。
 */
const F0 = 2777;
const TO = 3152;

// ---- 节拍（timeline.md S21–S23 字幕块起始）----
const T_MAP = 2777;   // 地图组 slideUp 起点（beat 2785 的 −6 前挂，2847 前完成组装）
const T_CHIP = 2785;  // 大芯片缩入（beat）
const T_LED = 2795;   // 芯片灯亮
const T_ROUTE = 2801; // 四条路由线 draw-on（4f 间隔，各 18f）
const T_WITH = 2847;  // 路由线逐条溶解（4f 间隔，各 12f）+ mistake
const T_FORG = 2950;  // Facebook→? + 灯灭 + 小芯片降饱和
const T_WALL = 3005;  // 刷新墙 + billions hit reload
const T_HOURS = 3054; // ClockIcon + ≈ 6 hours
const T_BARS = 3096;  // 柱状条（beat 3100 的 −4 前挂）+ 30x 小字 3100
// （2950 前后的静止窗口由碎片飘散 22f + 红点三闪 2860–2914 + 2950 起波次降饱和（2950–2982）接力切开）

// ---- 几何 ----
const MAP = {cx: 640, cy: 258, w: 500, h: 268}; // 地图框（承接 SC01 布局缩微）
const CHIP = {cx: 640, cy: 246, s: 116, r: 60}; // AS32934 大芯片
const WALL = {cx: 285, cy: 527};
const CLOCK = {cx: 995, cy: 458, r: 58};

/** 四条亮紫路由线：框边锚点 → 芯片边缘（控制点垂直外弓，同 SC01 式样缩微） */
const ROUTES: Array<{p0: [number, number]; p1: [number, number]; p2: [number, number]}> = ([
  {a: [394, 176], bow: 36},
  {a: [520, 126], bow: -34},
  {a: [886, 198], bow: 32},
  {a: [748, 390], bow: -34},
] as Array<{a: number[]; bow: number}>).map((l) => {
  const dx = l.a[0] - CHIP.cx, dy = l.a[1] - CHIP.cy;
  const d = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d;
  const e: [number, number] = [CHIP.cx + ux * CHIP.r, CHIP.cy + uy * CHIP.r];
  const mx = (l.a[0] + e[0]) / 2, my = (l.a[1] + e[1]) / 2;
  return {p0: [l.a[0], l.a[1]], p1: [mx - uy * l.bow, my + ux * l.bow], p2: e};
});
const SEGS = 12; // 每线路由线段数

/** 框内相连小芯片（2950 集体降饱和） */
const NODES: Array<[number, number]> = [[462, 168], [548, 158], [728, 158], [808, 190], [455, 318], [810, 314]];
const nodeEdge = (x: number, y: number): [number, number] => {
  const dx = x - CHIP.cx, dy = y - CHIP.cy;
  const d = Math.hypot(dx, dy) || 1;
  return [CHIP.cx + (dx / d) * (CHIP.r + 4), CHIP.cy + (dy / d) * (CHIP.r + 4)];
};

/** mistake 小红点闪 3 次（2860/2882/2904，各 10f；「从内部」） */
const BLINKS = [2860, 2882, 2904];
const blinkOp = (N: number) => {
  for (const b of BLINKS) {
    const n = N - b;
    if (n >= 0 && n < 10) return Math.min(1, n / 2, (10 - n) / 2);
  }
  return 0;
};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8); // 带光元素先灭光再淡出

  // ---- 地图组 slideUp 承接（Δ70 ≤120，不入 HUD 区）----
  const mapDy = 70 * powOutRemain(N - T_MAP, 18, 2.5);
  const mapOp = fadeIn(N - T_MAP, 6);

  // ---- 大芯片：缩入 / 灯 / 紫光（2847–2950 撤回期间“不适脉动”：mistake 心跳，帧幅 ±30%/26f）----
  const chipS = 0.55 + 0.45 * clamp01((N - T_CHIP) / 16);
  const chipOp = fadeIn(N - T_CHIP, 5);
  const ledK = N < T_FORG ? clamp01((N - T_LED) / 6) : 1 - clamp01((N - T_FORG) / 6);
  const sick = N >= T_WITH && N < T_FORG ? 0.7 + 0.3 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (N - T_WITH)) / 26)) : 1;
  const chipGlowK = kf(N, [[T_LED, 0], [T_LED + 8, 0.9], [T_FORG, 0.9], [T_FORG + 8, 0]]) * gk * sick;

  // ---- 标签：Facebook → ? ；mistake ----
  const fbOp = N < T_FORG ? clamp01((N - (T_CHIP + 4)) / 8) : 1 - clamp01((N - T_FORG) / 10);
  const qP = clamp01((N - (T_FORG + 2)) / 8);
  const qS = 0.4 + 0.6 * easeOutCubic(qP);
  const mkOp = clamp01((N - (T_WITH + 6)) / 8) * (N < T_FORG ? 1 : 1 - clamp01((N - T_FORG) / 8));

  // ---- 小芯片 + 连线：组装 / 2950 起波次降饱和（「集体」逐个 2f 错峰，波前 2950–2982）----
  const frameDim = clamp01((N - T_FORG) / 14); // 地图框微光同步熄
  const dimK = (i: number) => clamp01((N - (T_FORG + 2 * i)) / 14);
  const webOp = (i: number) => 0.55 - 0.4 * dimK(i);

  // ---- 路由线：draw-on（2801+4i，18f）→ 逐条溶解（2847+4i，12f，碎片向外飘散）----
  const routeDraw = (li: number) => clamp01((N - (T_ROUTE + 4 * li)) / 18);
  const routeSegs = (li: number): React.ReactNode[] => {
    const L = ROUTES[li];
    const dp = routeDraw(li);
    const di = T_WITH + 4 * li;
    const out: React.ReactNode[] = [];
    for (let j = 0; j < SEGS; j++) {
      if (dp * SEGS < j + 1) break;
      const a = qbez(L.p0, L.p1, L.p2, j / SEGS);
      const b = qbez(L.p0, L.p1, L.p2, (j + 1) / SEGS);
      const vAt = di + ((SEGS - 1 - j) / SEGS) * 12; // 该段溶解帧（芯片端先散）
      if (N < vAt) {
        out.push(<line key={j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={PURPLE_LIGHT} strokeWidth={5} strokeLinecap="round" />);
      }
    }
    return out;
  };
  /** 橙色碎片粒子：溶解中的段向外（远离芯片）飘散，26f 缓飘、3 粒/段 */
  const fragments = (li: number): React.ReactNode[] => {
    const L = ROUTES[li];
    const di = T_WITH + 4 * li;
    const out: React.ReactNode[] = [];
    for (let j = 0; j < SEGS; j++) {
      const vAt = di + ((SEGS - 1 - j) / SEGS) * 12;
      const t = (N - vAt) / 26;
      if (t <= 0 || t >= 1) continue;
      const m = qbez(L.p0, L.p1, L.p2, (j + 0.5) / SEGS);
      const ddx = m[0] - CHIP.cx, ddy = m[1] - CHIP.cy;
      const dd = Math.hypot(ddx, ddy) || 1;
      for (let k = 0; k < 3; k++) {
        const sp = rnd(li, j, k, 77) * 1.7 - 0.85;
        const off = 4 + 42 * t;
        out.push(
          <circle
            key={`${li}-${j}-${k}`}
            cx={m[0] + (ddx / dd) * off - (ddy / dd) * sp * off}
            cy={m[1] + (ddy / dd) * off + (ddx / dd) * sp * off}
            r={3.4 - 2 * t}
            fill={ORANGE}
            opacity={(0.9 * (1 - t)).toFixed(3)}
          />,
        );
      }
    }
    return out;
  };

  // ---- 刷新墙 / 时钟 / 小时 ----
  const wallOp = 1;
  const clkS = 0.3 + 0.7 * clamp01((N - T_HOURS) / 16);
  const clkOp = fadeIn(N - T_HOURS, 5);
  const clkN = 3054 + (N - T_HOURS) * kf(N, [[T_HOURS, 1], [T_HOURS + 72, 3.6]]); // 指针加速（快进感）
  const hrRoll = Math.round(6 * easeOutCubic(clamp01((N - T_HOURS) / 12)));
  const hrText = N >= T_HOURS + 12 ? EXAMPLE.hours6 : `\u2248 ${hrRoll} hours`;
  const hrPulse = emphasisPulse(N - (T_HOURS + 12), {peak: 1.05, up: 8, hold: 2, down: 9});

  // ---- 柱状条（3096 起上扬，各 14f）----
  const barK = (i: number) => easeOutCubic(clamp01((N - (T_BARS + i * 2)) / 14));
  const bars: Array<{x: number; h: number; color: string}> = [
    {x: 622, h: 14, color: 'rgba(164,164,165,.5)'},
    {x: 652, h: 20, color: 'rgba(164,164,165,.5)'},
    {x: 682, h: 100, color: ORANGE},
  ];

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: T_WALL, x: 640, y: 360, s: 1},
        {f: T_WALL + 33, x: 640, y: 505, s: 1.12},
        {f: 3062, x: 640, y: 505, s: 1.12},
        {f: 3094, x: 640, y: 360, s: 1},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ================= 上半：撤回地图 ================= */}
        <div style={{...abs(0, 0, 1280, 720), opacity: mapOp, transform: `translateY(${mapDy.toFixed(1)}px)`}}>
          <MapFrame cx={MAP.cx} cy={MAP.cy} w={MAP.w} h={MAP.h} glow={frameDim < 0.5} />

          {/* 框内相连小芯片的细网（draw-on → 降饱和） */}
          <Svg bloom={false}>
            {NODES.map((nd, i) => {
              const p = clamp01((N - (2805 + 2 * i)) / 10);
              if (p <= 0) return null;
              const [ex, ey] = nodeEdge(nd[0], nd[1]);
              return <line key={`w${i}`} x1={nd[0]} y1={nd[1]} x2={nd[0] + (ex - nd[0]) * p} y2={nd[1] + (ey - nd[1]) * p} stroke={GREY_LINE} strokeWidth={1.5} opacity={webOp(i)} />;
            })}
          </Svg>

          {/* 四条亮紫路由线（draw-on → 逐条溶解；紫柔光） */}
          <Svg bloom={false} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.75))'}}>
            {ROUTES.map((_, li) => routeSegs(li))}
          </Svg>
          {/* 溶解碎片粒子（橙 = 撤回警示） */}
          <Svg bloom={false} style={{filter: 'drop-shadow(0 0 4px rgba(240,95,65,.8))'}}>
            {ROUTES.map((_, li) => fragments(li))}
          </Svg>

          {/* 大芯片 AS32934（紫 GlowBlob → 2950 灭） */}
          <GlowBlob cx={CHIP.cx} cy={CHIP.cy} r={95} N={N} k={chipGlowK} />
          <div style={{...abs(0, 0, 1280, 720), opacity: chipOp, transform: `scale(${chipS.toFixed(4)})`, transformOrigin: `${CHIP.cx}px ${CHIP.cy}px`}}>
            <AsChip cx={CHIP.cx} cy={CHIP.cy} w={CHIP.s} h={CHIP.s} asn={EXAMPLE.asnFb} led="off" />
          </div>
          {/* 状态灯（紫 → 2950 灭；AsChip 内灯位 (100,100)/120 viewBox） */}
          {ledK > 0.02 ? (
            <Svg bloom={false}>
              <circle cx={678.7} cy={284.7} r={6.4} fill={PURPLE_LIGHT} opacity={ledK.toFixed(3)} style={{filter: `drop-shadow(0 0 ${4 + 5 * ledK}px rgba(161,117,241,.9))`}} />
            </Svg>
          ) : null}
          {/* 芯片内部小红点闪 3 次（mistake，从内部） */}
          {blinkOp(N) > 0.02 ? (
            <Svg bloom={false}>
              <circle cx={CHIP.cx} cy={CHIP.cy + 4} r={7.5} fill={RED_DEEP} opacity={blinkOp(N).toFixed(3)} style={{filter: 'drop-shadow(0 0 10px rgba(236,8,31,.85))'}} />
            </Svg>
          ) : null}

          {/* `Facebook` 标签（2950 淡出） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: fbOp.toFixed(3)}}>
            <CText cx={CHIP.cx} cy={332} size={24} weight={600} family={FONT_TECH} color={GREY}>Facebook</CText>
          </div>
          {/* `?` 弹入（2952，Orbitron 灰） */}
          {qP > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${qS.toFixed(4)})`, transformOrigin: `${CHIP.cx}px 336px`}}>
              <CText cx={CHIP.cx} cy={336} size={40} weight={700} family={FONT_ORB} color={GREY}>?</CText>
            </div>
          ) : null}
          {/* `mistake` 小字（2853 随首闪 SoftIn，2950 淡出） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: mkOp.toFixed(3)}}>
            <SoftIn N={N} f0={T_WITH + 6}>
              <CText cx={CHIP.cx} cy={366} size={22} weight={600} color={ORANGE}>mistake</CText>
            </SoftIn>
          </div>

          {/* 框内相连小芯片（2 帧错峰缩入 → 2950 起波次降饱和） */}
          {NODES.map((nd, i) => {
            const n = N - (2795 + 2 * i);
            if (n < 0) return null;
            const s = 0.3 + 0.7 * easeOutCubic(clamp01(n / 10));
            return (
              <div key={`n${i}`} style={{...abs(0, 0, 1280, 720), transform: `scale(${s.toFixed(4)})`, transformOrigin: `${nd[0]}px ${nd[1]}px`}}>
                <MapNodeChip cx={nd[0]} cy={nd[1]} s={56} lit={clamp01(n / 8)} dim={dimK(i)} />
              </div>
            );
          })}
        </div>

        {/* ================= 下半左：刷新墙 ================= */}
        <RefreshWall cx={WALL.cx} cy={WALL.cy} N={N} enter={N - T_WALL} opacity={wallOp} />
        <SoftIn N={N} f0={T_WALL + 4}>
          <CText cx={WALL.cx} cy={420} size={24} weight={600} color={GREY}>billions hit reload</CText>
        </SoftIn>

        {/* ================= 下半右：时钟 + ≈ 6 hours + 30x ================= */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clkOp, transform: `scale(${clkS.toFixed(4)})`, transformOrigin: `${CLOCK.cx}px ${CLOCK.cy}px`}}>
          <ClockIcon cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={clkN} accent={ORANGE} />
        </div>

        <GlitchIn N={N} f0={T_HOURS} rgbSplit={4} seed={7}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${hrPulse.toFixed(4)})`, transformOrigin: '995px 556px'}}>
            <CText
              cx={995}
              cy={556}
              size={64}
              weight={700}
              family={FONT_ORB}
              color={ORANGE}
              letterSpacing={2}
              shadow={`0 0 22px rgba(240,95,69,${(0.55 * gk).toFixed(2)}), 0 0 58px rgba(240,95,69,${(0.3 * gk).toFixed(2)})`}
              style={{fontVariantNumeric: 'tabular-nums'}}
            >
              {hrText}
            </CText>
          </div>
        </GlitchIn>

        <SoftIn N={N} f0={3100}>
          <CText cx={995} cy={608} size={22} weight={500} color={GREY}>{EXAMPLE.dns30x}</CText>
        </SoftIn>

        {/* 上扬小柱状条（3 根，第三根 30 倍高亮橙）+ 基线 */}
        {bars.map((b, i) => {
          const k = barK(i);
          if (k <= 0) return null;
          const h = b.h * k;
          return (
            <div
              key={`b${i}`}
              style={{
                ...abs(b.x, 604 - h, 20, h),
                background: b.color,
                borderRadius: 3,
                boxShadow: i === 2 ? `0 0 16px rgba(240,95,65,${(0.6 * gk).toFixed(2)}), 0 0 40px rgba(240,95,65,${(0.28 * gk).toFixed(2)})` : undefined,
                border: i === 2 ? `1.5px solid ${ORANGE}` : `1.5px solid ${GREY_LINE}`,
              }}
            />
          );
        })}
        {barK(0) > 0 ? <div style={{...abs(608, 604, 110, 2), background: GREY_LINE, opacity: 0.8}} /> : null}
      </div>
    </CameraRig>
  );
};
