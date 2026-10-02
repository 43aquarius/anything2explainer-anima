import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO} from '../../common';
import {EXAMPLE, Pill, SoftIn, abs, exitOp, firstOp, glowPurpleS, GREY, GREY_LINE, GREY_LIGHT, PURPLE_LIGHT, WHITE} from '../../ui';
import {PaneTitle} from './g5ui';

/**
 * SC25 面板②：packet details · N 5538–5774（S32 5546 详情面板 / 5587 层层剥开 / 5669 Ethernet IP TCP TLS）
 * 版式：左侧详情树（x150，4 行 mono 26 逐级缩进 + 每层 2 行小字子项）；右侧嵌套信封示意（SC06 语言 0.45×，
 *   中心 (880,380)：Ethernet 342×189 ⊃ IP 252×140 ⊃ TCP 171×95 ⊃ TLSv1.3 100×54 紫光内核）。
 * 节拍：5546 树行逐行 SoftIn（2 帧错峰）+ 右侧四框由外向内 draw-on（16/12/12/12 帧，5587 前完成）；
 *   5669 起四层依次点亮（Ethernet 5669 / IP 5681 / TCP 5693 / TLS 5705，12 帧节奏）：左树行紫显 + 三角旋转 90° +
 *   子项小字 wipe，右侧对应层白闪 + 紫边；运镜 5669–5702 33 帧 1→1.12 推向嵌套图（不进末拍）；
 *   末 8 帧归零。停留：段内不判（末层子项落位 ~5719 → 离场 5766，TLS 内核紫光呼吸）。零 glitch。
 */
const F0 = 5538, TO = 5774;
const B_TREE = 5546, B_LAYERS = 5669;
const TREE_X = 150;
const ROW_Y = [230, 306, 382, 458];
const INDENT = [0, 44, 88, 132];
/** 右侧嵌套框（绝对坐标，中心 880,380） */
const FR = [
  {label: 'Ethernet', x: 709, y: 285.5, w: 342, h: 189, t0: 5546, dur: 16, pill: {x: 719, y: 295, w: 96}},
  {label: 'IP', x: 754, y: 310, w: 252, h: 140, t0: 5560, dur: 12, pill: {x: 764, y: 318, w: 52}},
  {label: 'TCP', x: 794.5, y: 332.75, w: 171, h: 94.5, t0: 5572, dur: 12, pill: {x: 804, y: 340, w: 64}},
  {label: 'TLSv1.3', x: 830, y: 353, w: 100, h: 54, t0: 5582, dur: 12, pill: {x: 838, y: 360, w: 96}},
];
const SUBS = [
  ['src', 'dst'],
  [EXAMPLE.clientIp, EXAMPLE.serverIp],
  ['port 443', 'len 57'],
  ['Application Data'],
];
const ACT_T = [5669, 5681, 5693, 5705];
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const lOp = firstOp(N - F0, 8);
  // 运镜：5669–5702 33 帧 1→1.12 推向嵌套图 (880,380)
  const camS = 1 + 0.12 * easeInOutPow(2.5)(clamp01((N - B_LAYERS) / 33));
  const cur = ACT_T.reduce((a, t, i) => (N >= t ? i : a), -1);
  const glowK = cur >= 3 ? 0.85 + 0.15 * Math.sin((N / 30) * Math.PI * 2) : 0; // TLS 内核呼吸（当前层后）

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <PaneTitle x={TREE_X - 50} y={128} no="\u2461" text="packet details" sub="the envelope peeled open" op={lOp} />
      <div style={{position: 'absolute', inset: 0, opacity: lOp, transformOrigin: '880px 380px', transform: `scale(${camS.toFixed(4)})`}}>
        {/* 左侧详情树 */}
        {FR.map((f, i) => {
          const rn = N - (B_TREE + i * 2);
          if (rn < 0) return null;
          const actN = cur === i ? N - ACT_T[i] : -1;
          const rot = actN >= 0 ? clamp01(actN / 8) * 90 : 0;
          const isCur = cur === i;
          return (
            <div key={f.label} style={{...abs(TREE_X + INDENT[i], ROW_Y[i])}}>
              {/* 旋转小三角 */}
              <div style={{position: 'absolute', left: 0, top: 6, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `12px solid ${isCur ? PURPLE_LIGHT : GREY_LIGHT}`, transformOrigin: '4px 8px', transform: rot ? `rotate(${rot}deg)` : undefined}} />
              <div style={{marginLeft: 24, fontFamily: FONT_MONO, fontSize: 26, color: isCur ? PURPLE_LIGHT : GREY_LIGHT, lineHeight: 1.1, textShadow: isCur ? '0 0 12px rgba(161,117,241,.55)' : undefined}}>
                {f.label === 'TLSv1.3' ? 'TLSv1.3' : f.label === 'IP' ? 'Internet Protocol' : f.label === 'TCP' ? 'TCP' : 'Ethernet II'}
              </div>
              {/* 子项小字（当前层时 wipe 展开） */}
              {SUBS[i].map((s, j) => {
                const sp = actN >= 0 ? clamp01((actN - 4 - j * 2) / 8) : 0;
                if (sp <= 0) return null;
                return (
                  <div key={j} style={{...abs(46, 34 + j * 24, 260, 22), clipPath: `inset(0 ${((1 - sp) * 100).toFixed(1)}% 0 0)`, fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1}}>
                    {s}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* TLS 内核紫光（呼吸，讲到最后一层时亮） */}
        {cur >= 3 ? <div style={{...abs(FR[3].x - 4, FR[3].y - 4, FR[3].w + 8, FR[3].h + 8), boxShadow: glowPurpleS(glowK * (1 - clamp01((N - (TO - 14)) / 6)))}} /> : null}
        {/* 右侧嵌套框（draw-on） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
          {FR.map((f, i) => {
            const p = clamp01((N - f.t0) / f.dur);
            if (p <= 0) return null;
            const per = 2 * (f.w + f.h);
            const isCur = cur === i;
            const flash = isCur ? tri(N - ACT_T[i], 8) : 0;
            const stroke = i === 3 ? PURPLE_LIGHT : WHITE;
            return (
              <g key={f.label}>
                <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="none" stroke={stroke} strokeWidth={i === 0 ? 3 : 2.5} strokeDasharray={per} strokeDashoffset={per * (1 - p)} style={isCur ? {filter: 'drop-shadow(0 0 10px rgba(102,45,248,.7))'} : undefined} />
                {flash > 0 ? <rect x={f.x - 2} y={f.y - 2} width={f.w + 4} height={f.h + 4} fill="none" stroke={WHITE} strokeWidth={5} opacity={flash} /> : null}
              </g>
            );
          })}
        </svg>
        {/* 层标签 Pill */}
        {FR.map((f, i) => (
          <SoftIn key={f.label} N={N} f0={f.t0 + f.dur - 2}>
            <Pill x={f.pill.x} y={f.pill.y} w={f.pill.w} h={28} fill={i === 3 || cur === i ? '#6630F8' : '#000'} stroke={i === 3 || cur === i ? WHITE : GREY_LINE} sw={2} text={f.label} fontSize={22} weight={700} textDy={0} />
          </SoftIn>
        ))}
        {/* 树与图的对应引线（当前层时亮） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {FR.map((f, i) => {
            const actN = cur === i ? N - ACT_T[i] : -1;
            const p = actN >= 0 ? clamp01(actN / 12) : 0;
            if (p <= 0) return null;
            const y0 = ROW_Y[i] + 13, x0 = TREE_X + INDENT[i] + 260, x1 = f.x + f.w * 0.5, y1 = f.y + f.h * 0.5;
            const L = Math.hypot(x1 - x0, y1 - y0);
            return <line key={f.label} x1={x0} y1={y0} x2={x1} y2={y1} stroke={PURPLE_LIGHT} strokeWidth={2} opacity={0.7} strokeDasharray={`${L}`} strokeDashoffset={L * (1 - p)} />;
          })}
        </svg>
      </div>
    </div>
  );
};
