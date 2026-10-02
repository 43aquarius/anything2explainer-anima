import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse, powIn} from '../../common';
import {CText, PacketIcon, TapBox, GREY, WHITE, exitOp, SoftIn, scaleIn, abs} from '../../ui';
import {StationCircle, AnalyzerScreen} from './g3ui';

/**
 * SC16 立足点③：分路器 · N 3114–3314（S19 3122–3277 ¶+gap15：3122「物理链路」/ 3162「被动分光」/ 3243「给你一份」）
 * 版式：粗线缆（双 2.5px 白线 y336/344，x160–1120）中央串接 TapBox 180×120 @ (640,340)（紫边主角）；
 *   原件信封在线缆上左→右连续通过（3px/帧，穿盒后面 = 原件不断）；盒下细线引到分析器小屏 (640,538)，
 *   副本信封每 30 帧滑落 + 计数 +1；背景两条 25% 细线 = 「光分叉」示意；`passive · no power` 灰小字 3243。
 * 左上角 ③ 站位角标。运镜：3118–3151 整组 33 帧 1→1.12 推向 TAP 盒（节拍 3162 前结束，不进末拍）。
 * 停留：段末 ¶ — 末元素 `passive · no power` 落位 3251 → 离场 3306，55 帧 ✓（副本流持续）。末 8 帧归零。
 */
const F0 = 3114;
const TO = 3314;
const T_CABLE = 3114, T_PUSH0 = 3118, T_TAP = 3128, T_SPLIT = 3162, T_AN = 3166, T_PASSIVE = 3243;
const COPY0 = 3176; // 副本信封首落（每 30 帧）
const CABLE = {y: 340, x0: 160, x1: 1120};
const TAP = {cx: 640, cy: 340, w: 180, h: 120};
const AN = {cx: 640, cy: 538, w: 230, h: 100};

const flash = (n: number, len = 6) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 线缆 draw-on（24 帧）+ 原件信封流（3px/帧，持续）
  const cableP = 1 - Math.pow(1 - clamp01((N - T_CABLE) / 24), 2.5);
  // 推近 1→1.12 / 33 帧（pivot = TAP 盒中心），推完保持
  const camS = 1 + 0.12 * easeInOutPow(2.5)(clamp01((N - T_PUSH0) / 33));

  // TAP 盒缩放入场（21 帧）
  const tapS = scaleIn(N - T_TAP, 21);
  const tapOp = N < T_TAP ? 0 : Math.min(1, (N - T_TAP) / 8);
  const tapFlash = flash(N - T_SPLIT);

  // 分叉细线（25% 白）+ 盒下引线 + 分光镜三角高亮（3162 wipe）
  const splitP = easeOutCubic(clamp01((N - T_SPLIT) / 16));

  // 副本信封：每 30 帧一枚沿引线滑落 18 帧（powIn 2 加速）→ 计数 +1
  const copies = [] as Array<{y: number; op: number; key: number}>;
  for (let dep = COPY0; dep <= N && dep < TO - 10; dep += 30) {
    const t = (N - dep) / 18;
    if (t >= 1) continue;
    copies.push({y: TAP.cy + TAP.h / 2 + 12 + (AN.cy - 34 - (TAP.cy + TAP.h / 2 + 12)) * powIn(2)(clamp01(t)), op: Math.min(1, t / 0.18, (1 - t) / 0.25) * 0.85, key: dep});
  }
  const landed = Math.max(0, Math.floor((N - (COPY0 + 18)) / 30) + 1);
  const lastLand = COPY0 + 18 + (landed - 1) * 30;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ③ 站位角标（屏幕空间固定，不随推近移动） */}
      <SoftIn N={N} f0={T_CABLE}>
        <StationCircle cx={110} cy={160} r={30} lit digit="3" digitSize={40} />
      </SoftIn>
      <div style={{position: 'absolute', inset: 0, transform: `translate(640px,340px) scale(${camS.toFixed(4)}) translate(-640px,-340px)`}}>

        {/* 双线线缆（draw-on 自左） */}
        {[CABLE.y - 4, CABLE.y + 4].map((y) => (
          <div key={y} style={{...abs(CABLE.x0, y - 1.25, (CABLE.x1 - CABLE.x0) * cableP, 2.5), background: WHITE, opacity: 0.85}} />
        ))}

        {/* 原件信封流（穿盒而过 = 原件不断；先画被盒盖住） */}
        {[0, 1, 2, 3].map((i) => {
          const x = CABLE.x0 + (((N - T_CABLE) * 3 + i * 130) % (CABLE.x1 - CABLE.x0));
          const edge = Math.min(1, (x - CABLE.x0) / 50, (CABLE.x1 - x) / 50);
          const op = Math.max(0, edge) * Math.min(1, (N - T_CABLE - i * 2) / 6);
          return op > 0.02 ? <PacketIcon key={i} cx={x} cy={CABLE.y} w={56} h={38} opacity={op} /> : null;
        })}

        {/* TAP 盒（主角）+ 3162 白闪 */}
        {tapOp > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: tapOp, filter: tapFlash > 0 ? `brightness(${(1 + 0.7 * tapFlash).toFixed(2)})` : undefined}}>
            <div style={{position: 'absolute', inset: 0, transform: `translate(${TAP.cx}px,${TAP.cy}px) scale(${tapS.toFixed(4)}) translate(${-TAP.cx}px,${-TAP.cy}px)`}}>
              <TapBox cx={TAP.cx} cy={TAP.cy} w={TAP.w} h={TAP.h} label="TAP" accent />
            </div>
          </div>
        ) : null}

        {/* 分光镜三角高亮（draw-on 12 帧 + 淡出） */}
        {splitP > 0 && splitP < 1.5 ? (
          <svg width={TAP.w} height={TAP.h} viewBox={`0 0 ${TAP.w} ${TAP.h}`} style={{position: 'absolute', left: TAP.cx - TAP.w / 2, top: TAP.cy - TAP.h / 2, overflow: 'visible', opacity: 1 - clamp01((N - (T_SPLIT + 12)) / 14)}}>
            <path d={`M${TAP.w * 0.2},${TAP.h * 0.72} L${TAP.w * 0.5},${TAP.h * 0.24} L${TAP.w * 0.8},${TAP.h * 0.72} Z`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeDasharray={300} strokeDashoffset={300 * (1 - splitP)} />
          </svg>
        ) : null}

        {/* 光分叉示意（两条 25% 细线，自盒角向外 wipe） */}
        {splitP > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
            <line x1={734} y1={292} x2={734 + 216 * splitP} y2={292 - 46 * splitP} stroke={WHITE} strokeWidth={2} opacity={0.25} />
            <line x1={734} y1={388} x2={734 + 216 * splitP} y2={388 + 46 * splitP} stroke={WHITE} strokeWidth={2} opacity={0.25} />
          </svg>
        ) : null}

        {/* 盒下引线 → 分析器 */}
        {N >= T_SPLIT + 4 ? (
          <div style={{...abs(TAP.cx - 1.25, TAP.cy + TAP.h / 2, 2.5, (AN.cy - AN.h / 2 - (TAP.cy + TAP.h / 2)) * easeOutCubic(clamp01((N - (T_SPLIT + 4)) / 14))), background: WHITE, opacity: 0.7}} />
        ) : null}

        {/* 副本信封滑落（持续动作） */}
        {copies.map((c) => (c.op > 0.02 ? <PacketIcon key={c.key} cx={TAP.cx} cy={c.y} w={52} h={36} accent opacity={c.op} /> : null))}

        {/* 分析器小屏 + 计数 */}
        {N >= T_AN ? (
          <AnalyzerScreen cx={AN.cx} cy={AN.cy} w={AN.w} h={AN.h} count={landed} op={Math.min(1, (N - T_AN) / 8)} scale={scaleIn(N - T_AN, 21)} pulse={emphasisPulse(N - lastLand, {peak: 1.12, up: 6, hold: 3, down: 10})} label="copies" />
        ) : null}

        {/* passive · no power */}
        <SoftIn N={N} f0={T_PASSIVE}>
          <CText cx={820} cy={442} size={24} weight={600} color={GREY} letterSpacing={1}>
            passive · no power
          </CText>
        </SoftIn>
      </div>
    </div>
  );
};
