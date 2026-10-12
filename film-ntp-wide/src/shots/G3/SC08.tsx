import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, easeOutCubic, easeInOutPow, clamp01, FONT_ORB} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  AtomClock, StratumTier, PacketIcon, TechText, TechSub, CText, EXAMPLE,
  PURPLE_LIGHT, GREY, GREY_MID, GREY_LINE, GREY_LIGHT, WHITE,
  softOp, firstOp, exitOp, glowOffK, mix, abs,
} from '../../ui';

/**
 * SC08 金字塔 · N 1504–1842（高光时刻·论点型；S14–S16：节拍 1512/1539/1576/1656/1711/1779；TO=1842 停在 C3 章节卡 1843 前一帧）
 * 画面：全幅 stratum 阶梯金字塔（居中）——顶层 AtomClock 小图（`stratum 1` 标签、最亮紫）
 *       → 4 条 StratumTier 层条（n 芯片 2→4、向下渐宽渐灰）+ 底部 2 层渐隐 ghost（表示"到十五"）+ 层间短连线；
 *       右缘独立刻度尺 `1…15`（Orbitron 小字、末三个渐隐）；底部 `stratum 1–15` 大字（Noto 900 52 白+紫描边，本镜唯一 glitch）。
 * 节拍：1512 轮廓自顶向下逐层 draw-on（8f/层）；1539 AtomClock 源头显现（S14.c2 from the source）；
 *       1576 `stratum` 术语标签（顶左 Exo 2 紫斜体）+ 刻度尺灰态浮现（S15）；
 *       1656 顶层点亮（白闪一拍 + GlowBlob 紫光）+ `stratum 1`/`talks to the atom` + 刻度①亮（S16.c1）；
 *       1711 第二、三层错峰点亮 + 两枚上行信封沿右坡飞向塔尖（S16.c2 stratum two asks stratum one）；
 *       1779 波次点亮到底（2f/层）+ 刻度 2…15 逐个亮 + 大字 GlitchIn（rgbSplit 6）+ 塔低幅呼吸（S16.c3 down to fifteen）。
 * 运镜：1504–1711 慢推 1.0→1.15 → 1744–1777 段末拉远 33f 1.15→1.0（终镜收束；末 key 1777 ≤ TO−50 ✓）。
 * 停留：¶+gap20 章末——末拍 1779 落位 ~1796 → 灭光 1834 / 离场 1837–1842（exitOp 5），hold ≥30f ✓。
 */
const F0 = 1504;
const TO = 1842;

// ---- 节拍（timeline S14–S16 字幕块起始；元素入场 −6…+3）----
const B_DRAW = 1507; // 轮廓 draw-on 级联起点（1512 的 −5）
const B_SRC = 1539;  // AtomClock 源头显现
const B_TERM = 1576; // `stratum` 术语标签 + 刻度尺灰态
const B_ATOM = 1656; // 顶层点亮（白闪）
const B_ASK = 1711;  // 第二、三层点亮 + 上行信封
const B_DOWN = 1779; // 波次到底 + 刻度逐亮 + 大字

const CX = 640;
const EASE = easeOutCubic;

// ---- 塔尖 AtomClock（w132×h146，读数 16px×0.69≈11px，图标级）----
const APEX = {cx: 640, cy: 205, w: 132, h: 146}; // y 132–278
// 占位柜体轮廓（与 AtomClock 自带柜体同几何，draw-on 后 1539 交叉淡出）
const APS = APEX.w / 190;
const CAB = {x: APEX.cx - APEX.w / 2 + 18 * APS, y: 132 + 30 * APS, w: 154 * APS, h: 164 * APS, r: 10 * APS};
const BTN = {x: APEX.cx - APEX.w / 2 + 78 * APS, y: 132 + 8 * APS, w: 34 * APS, h: 22 * APS, r: 4 * APS};

// ---- 层条（T1–T4 + 2 ghost；渐宽渐灰渐淡；层间短连线 3 根/缝）----
const ROWS = [
  {y: 290, h: 36, w: 270, n: 2, op: 1},               // stratum 2
  {y: 334, h: 36, w: 370, n: 3, op: 1},               // stratum 3
  {y: 378, h: 36, w: 470, n: 4, op: 0.94},            // stratum 4
  {y: 422, h: 36, w: 560, n: 4, op: 0.88},            // stratum 5
  {y: 466, h: 32, w: 680, n: 4, op: 0.4, ghost: true}, // ~6
  {y: 506, h: 30, w: 700, n: 4, op: 0.2, ghost: true}, // ~7…15（渐隐）
];
const DRAW_AT = (i: number) => B_DRAW + (i + 1) * 8; // 每层 8f，上一层画完下一层起（apex 轮廓先画）
const LIT_AT = [B_ASK, B_ASK + 10, B_DOWN, B_DOWN + 2, B_DOWN + 4, B_DOWN + 6];
const FLASH_AT = [0.7, 0.7, 0.55, 0.55, 0.3, 0.3]; // 各层点亮闪光强度
// 缝隙（上一行底 → 下一行顶）；stub x 取上一行（较窄者）宽内三点
const GAPS = [
  {y0: 278, y1: 290, xs: [600, 640, 680]}, // apex→T1（apex x 574–706）
  {y0: 326, y1: 334, xs: [580, 640, 700]},
  {y0: 370, y1: 378, xs: [580, 640, 700]},
  {y0: 414, y1: 422, xs: [580, 640, 700]},
  {y0: 458, y1: 466, xs: [580, 640, 700]},
  {y0: 498, y1: 506, xs: [580, 640, 700]},
];

// ---- 右缘刻度尺（独立数量轴 1–15；1 对齐塔尖、15 沉入渐隐区）----
const LAD_NUM_R = 1030; // 数字右缘
const LAD_TICK_X = 1032; // 刻度左端（12px 长）
const LAD_LINE_X = 1044; // 竖导轨
const ladY = (k: number) => 204 + (k - 1) * 25.5; // k=1..15：204（apex cy）→ 561
const LAD_LIT = (k: number): number =>
  k === 1 ? B_ATOM : k === 2 ? B_ASK : k === 3 ? B_ASK + 10 : Math.round(B_DOWN + (k - 4) * 1.2);
const LAD_FADE = (k: number) => (k === 13 ? 0.55 : k === 14 ? 0.38 : k === 15 ? 0.22 : 1);

// ---- 上行信封（右坡飞行：T1/T2 → 塔尖；quad 贝塞尔）----
const ENVS = [
  {t0: 1715, dur: 26, p0: [788, 300] as [number, number], cp: [800, 272] as [number, number], p1: [668, 232] as [number, number]},
  {t0: 1737, dur: 26, p0: [838, 344] as [number, number], cp: [884, 300] as [number, number], p1: [668, 232] as [number, number]},
];
const qPoint = (e: {p0: [number, number]; cp: [number, number]; p1: [number, number]}, t: number): [number, number] => [
  (1 - t) * (1 - t) * e.p0[0] + 2 * t * (1 - t) * e.cp[0] + t * t * e.p1[0],
  (1 - t) * (1 - t) * e.p0[1] + 2 * t * (1 - t) * e.cp[1] + t * t * e.p1[1],
];

// 一次性衰减闪光（3 帧冲顶 + 指数回落）
const flashK = (N: number, f: number, life = 16): number => {
  const n = N - f;
  if (n < 0 || n > life) return 0;
  return n < 3 ? n / 3 : Math.exp(-(n - 3) / 4.5);
};

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);
  const EIO = easeInOutPow(2.2);

  // 塔尖占位轮廓 → AtomClock 交叉淡出
  const phOp = 1 - clamp01((N - B_SRC) / 6);
  // AtomClock：1539 显现（0.94→1 缩入）→ 1656 提亮 + BLOOM
  const atomOp = firstOp(N - B_SRC, 8) * mix(0.8, 1, clamp01((N - B_ATOM) / 8));
  const atomSc = 0.94 + 0.06 * EASE(clamp01((N - B_SRC) / 10));
  const atomFl = flashK(N, B_ATOM);
  // 顶层紫光（低幅呼吸由 GlowBlob 内建 N 驱动）
  const apexGlow = softOp(N - B_ATOM, 12) * gk;
  const bt = softOp(N - B_DOWN, 10) * gk; // 大字紫光
  const ladBase = softOp(N - B_TERM, 10); // 刻度尺灰态

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 345, s: 1},
        {f: B_ASK, x: 640, y: 345, s: 1.15},
        {f: B_ASK + 33, x: 640, y: 345, s: 1.15},
        {f: 1777, x: 640, y: 348, s: 1},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* ---- 塔尖主角紫光 ---- */}
        <GlowBlob cx={APEX.cx} cy={APEX.cy} r={92} N={N} k={apexGlow} alpha={0.3} />

        {/* ---- 层间短连线（随下层 draw-on 淡入；GREY_MID 细线）---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {GAPS.map((g, i) => {
            const op = softOp(N - (DRAW_AT(i) + 4), 6) * (i >= 4 ? 0.55 : 0.8);
            if (op <= 0) return null;
            return (
              <g key={`stub-${i}`} stroke={GREY_MID} strokeWidth={2} opacity={op.toFixed(3)}>
                {g.xs.map((x, j) => <line key={j} x1={x} y1={g.y0} x2={x} y2={g.y1} />)}
              </g>
            );
          })}
        </svg>

        {/* ---- StratumTier 层条（左→右 wipe draw-on 8f；点亮 = lit 切换 + 亮度闪光）---- */}
        {ROWS.map((r, i) => {
          const p = EASE(clamp01((N - DRAW_AT(i)) / 8));
          if (p <= 0) return null;
          const fl = flashK(N, LIT_AT[i], i >= 4 ? 12 : 16) * FLASH_AT[i];
          return (
            <div
              key={`row-${i}`}
              style={{
                ...abs(CX - r.w / 2, r.y, r.w, r.h),
                opacity: firstOp(N - DRAW_AT(i), 6) * r.op,
                clipPath: `inset(0 ${(100 * (1 - p)).toFixed(2)}% 0 0)`,
                filter: fl > 0 ? `brightness(${(1 + fl).toFixed(3)})` : undefined,
              }}
            >
              <StratumTier cx={r.w / 2} y={0} w={r.w} h={r.h} n={r.n} lit={N >= LIT_AT[i]} dim={!!r.ghost} />
            </div>
          );
        })}

        {/* ---- 塔尖占位轮廓（draw-on 8f + 按钮 +4f；1539 让位）---- */}
        {phOp > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: phOp}}>
            <g stroke={WHITE} strokeWidth={2.4} fill="#000" strokeLinejoin="round">
              <rect x={CAB.x} y={CAB.y} width={CAB.w} height={CAB.h} rx={CAB.r}
                pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - EASE(clamp01((N - B_DRAW) / 8)))} />
              <rect x={BTN.x} y={BTN.y} width={BTN.w} height={BTN.h} rx={BTN.r}
                pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - EASE(clamp01((N - B_DRAW - 4) / 6)))} />
            </g>
          </svg>
        ) : null}

        {/* ---- 塔尖 AtomClock（1539 源头显现；1656 白闪一拍 + BLOOM）---- */}
        {atomOp > 0 ? (
          <div
            style={{
              ...abs(APEX.cx - APEX.w / 2, APEX.cy - APEX.h / 2, APEX.w, APEX.h + 26),
              opacity: atomOp,
              transform: `scale(${atomSc.toFixed(4)})`,
              transformOrigin: `${APEX.w / 2}px ${APEX.h / 2}px`,
              filter: atomFl > 0 ? `brightness(${(1 + 0.85 * atomFl).toFixed(3)})` : undefined,
            }}
          >
            <AtomClock cx={APEX.w / 2} cy={APEX.h / 2} w={APEX.w} h={APEX.h} N={N} glow={N >= B_ATOM} />
          </div>
        ) : null}

        {/* ---- 顶层点亮白闪扩散环 + 信封到站小环 ---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {(() => {
            const p = clamp01((N - B_ATOM) / 16);
            if (p <= 0 || p >= 1) return null;
            return (
              <circle cx={APEX.cx} cy={APEX.cy} r={26 + 62 * p} fill="none" stroke={WHITE}
                strokeWidth={3 * (1 - p) + 0.5} opacity={(0.85 * (1 - p) * gk).toFixed(3)}
                style={{filter: 'drop-shadow(0 0 8px rgba(255,255,255,.8))'}} />
            );
          })()}
          {ENVS.map((e, i) => {
            const p = clamp01((N - (e.t0 + e.dur)) / 12);
            if (p <= 0 || p >= 1) return null;
            return (
              <circle key={`env-ring-${i}`} cx={e.p1[0]} cy={e.p1[1]} r={10 + 22 * p} fill="none" stroke={PURPLE_LIGHT}
                strokeWidth={2.2 * (1 - p) + 0.4} opacity={(0.7 * (1 - p) * gk).toFixed(3)} />
            );
          })}
        </svg>

        {/* ---- 上行信封（右坡虚线引导 + 飞行 + 到站吸收）---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {ENVS.map((e, i) => {
            const op = softOp(N - (e.t0 - 2), 10) * 0.38;
            if (op <= 0) return null;
            const d = `M ${e.p0[0]} ${e.p0[1]} Q ${e.cp[0]} ${e.cp[1]} ${e.p1[0]} ${e.p1[1]}`;
            return <path key={`gd-${i}`} d={d} fill="none" stroke={GREY_MID} strokeWidth={1.5} strokeDasharray="3 8" strokeLinecap="round" opacity={op.toFixed(3)} />;
          })}
        </svg>
        {ENVS.map((e, i) => {
          const n = N - e.t0;
          if (n < 0) return null;
          const t = EIO(clamp01(n / e.dur));
          const [x, y] = qPoint(e, t);
          const absorb = clamp01((n - e.dur) / 10);
          const op = firstOp(n, 5) * (1 - Math.pow(absorb, 1.4));
          if (op <= 0) return null;
          const sc = 1 - 0.45 * absorb;
          return (
            <div key={`env-${i}`} style={{...abs(x - 20, y - 14, 40, 28), opacity: op, transform: `scale(${sc.toFixed(4)})`, transformOrigin: '20px 14px'}}>
              <PacketIcon cx={20} cy={14} w={40} h={28} accent glow />
            </div>
          );
        })}

        {/* ---- 右缘刻度尺（导轨 + 刻度灰态浮现 → 数字逐个亮）---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <line x1={LAD_LINE_X} y1={196} x2={LAD_LINE_X} y2={572} stroke={GREY_LINE} strokeWidth={1.5} opacity={(0.55 * ladBase).toFixed(3)} />
          {Array.from({length: 15}, (_, k) => {
            const kk = k + 1;
            if (ladBase <= 0) return null;
            const lit = softOp(N - LAD_LIT(kk), 5);
            return (
              <line key={`tick-${kk}`} x1={LAD_TICK_X} y1={ladY(kk)} x2={LAD_TICK_X + 12} y2={ladY(kk)}
                stroke={lit > 0 ? GREY_LIGHT : GREY_MID} strokeWidth={lit > 0 ? 2.2 : 1.6}
                opacity={(lit > 0 ? 0.5 + 0.5 * lit : 0.5) * gk} />
            );
          })}
        </svg>
        {Array.from({length: 15}, (_, k) => {
          const kk = k + 1;
          const lit = softOp(N - LAD_LIT(kk), 5);
          if (lit <= 0) return null;
          return (
            <div
              key={`lad-${kk}`}
              style={{
                position: 'absolute',
                right: 1280 - LAD_NUM_R,
                top: ladY(kk) - 11,
                width: 64,
                textAlign: 'right',
                fontFamily: FONT_ORB,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: '22px',
                color: kk <= 3 ? PURPLE_LIGHT : GREY_LIGHT,
                opacity: (lit * LAD_FADE(kk) * gk).toFixed(3),
                textShadow: kk <= 3 ? `0 0 9px rgba(161,117,241,${(0.6 * gk).toFixed(3)})` : undefined,
              }}
            >
              {kk}
            </div>
          );
        })}

        {/* ---- `stratum` 术语标签（顶左 Exo 2 紫斜体）+ 引线 ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_TERM, 8)}}>
          <TechText cx={165} cy={152} text="stratum" fontSize={34} letterSpacing={2} />
        </div>
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          {(() => {
            const p = EASE(clamp01((N - B_TERM) / 10));
            if (p <= 0) return null;
            return (
              <g stroke={PURPLE_LIGHT} strokeWidth={2} fill="none" opacity={0.85}>
                <path d="M 240 152 H 396 L 556 197" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} strokeLinecap="round" />
                {p >= 1 ? <circle cx={556} cy={197} r={3} fill={PURPLE_LIGHT} stroke="none" /> : null}
              </g>
            );
          })()}
        </svg>

        {/* ---- 塔尖标注：`stratum 1`（Orbitron 亮紫）+ `talks to the atom`（灰 Exo 2）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_ATOM, 8) * gk}}>
          <CText cx={776} cy={190} size={22} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} letterSpacing={1}
            style={{textShadow: `0 0 10px rgba(161,117,241,${(0.55 * gk).toFixed(3)})`}}>
            stratum 1
          </CText>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (B_ATOM + 6), 8)}}>
          <TechSub cx={816} cy={222} text="talks to the atom" size={22} />
        </div>

        {/* ---- 底部大字 `stratum 1–15`（Noto 900 52 白+紫描边；本镜唯一 glitch）---- */}
        <GlitchIn N={N} f0={B_DOWN} rgbSplit={6} seed={8}>
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText
              cx={CX}
              cy={566}
              size={52}
              weight={900}
              color={WHITE}
              letterSpacing={1.5}
              style={{
                WebkitTextStroke: '2.5px #A175F1',
                paintOrder: 'stroke fill',
                textShadow: `0 0 22px rgba(102,45,248,${(0.55 * bt * (0.9 + 0.1 * Math.sin((2 * Math.PI * N) / 90))).toFixed(3)}), 0 0 58px rgba(102,45,248,${(0.35 * bt).toFixed(3)})`,
              }}
            >
              {EXAMPLE.strata}
            </CText>
          </div>
        </GlitchIn>
      </div>
    </CameraRig>
  );
};
