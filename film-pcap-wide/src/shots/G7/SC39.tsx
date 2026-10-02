import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01} from '../../common';
import {CText, GREY, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, scaleIn, SoftIn, Pill} from '../../ui';
import {CloudGlyph, LaptopGlyph, PhoneGlyph, RouterGlyph, tri} from './g7ui';

/**
 * SC39 在自己的网络上练 · N 8872–9036（S51 8880–9014 ¶：8880 自己的网络随便抓 / 8959 学这门手艺的最佳方式）
 * 版式：家庭网络小图：中央路由器（160px 圆角方块 + 两根天线）→ 三条线连笔记本 / 手机 / 云朵（internet）；
 *   路由器上方紫色抓包波纹三圈扩散（每圈 30 帧，持续全镜）；Pill `capture · learn`（紫）；
 *   端点节点轮流亮紫（捕获光点，循环）。末 8 帧归零。零 glitch。
 * 停留：段末 ¶ — 末拍 Pill 落位 8967 → 离场 9028，稳定 61 帧 ✓（波纹 / 节点循环为已在跑的动词动作）。
 * 主角：路由器 160px + 波纹；光：波纹紫光 / 节点捕获点紫。
 */
const F0 = 8872, TO = 9036;
const T_ROUTER = 8874, T_LINES = 8880, T_RIPPLE = 8880, T_PILL = 8959;
const ROUTER = {cx: 640, cy: 380};
const ENDS = [
  {id: 'cloud', cx: 640, cy: 168, line: {x0: 640, y0: 314, x1: 640, y1: 208}, t: 8880, label: 'internet', lx: 745, ly: 168, dot: {cx: 668, cy: 190}},
  {id: 'laptop', cx: 330, cy: 425, line: {x0: 566, y0: 348, x1: 378, y1: 408}, t: 8884, label: 'laptop', lx: 330, ly: 487, dot: {cx: 358, cy: 400}},
  {id: 'phone', cx: 950, cy: 425, line: {x0: 714, y0: 348, x1: 902, y1: 408}, t: 8888, label: 'phone', lx: 950, ly: 487, dot: {cx: 922, cy: 398}},
];
const RIP_MAX = 200, RIP_T = 30;

export const SC39: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const routerS = scaleIn(N - T_ROUTER, 21);
  // 波纹三圈（相位错开 10 帧，30 帧一圈）
  const ripples = [0, 1, 2].map((i) => {
    const t = N - T_RIPPLE - i * 10;
    if (t < 0) return null;
    const ph = t % RIP_T;
    return {r: 46 + (RIP_MAX - 46) * (ph / RIP_T), k: (1 - ph / RIP_T) * 0.75};
  });
  // 端点节点轮流亮紫（45 帧/节点，循环）
  const cyc = N >= T_PILL ? Math.floor((N - T_PILL) / 45) % 3 : -1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 波纹（底层） ===== */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {ripples.map((rp, i) =>
          rp && rp.k > 0.02 ? (
            <ellipse key={i} cx={ROUTER.cx} cy={ROUTER.cy} rx={rp.r} ry={rp.r * 0.92} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={rp.k} style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.6))'}} />
          ) : null,
        )}
      </svg>
      {/* ===== 连线（依次 draw-on 12 帧） ===== */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {ENDS.map((e, i) => {
          const p = clamp01((N - e.t) / 12);
          if (p <= 0) return null;
          const active = cyc === i;
          return <line key={e.id} x1={e.line.x0} y1={e.line.y0} x2={e.line.x1} y2={e.line.y1} stroke={active ? PURPLE_LIGHT : WHITE} strokeWidth={2.5} opacity={active ? 1 : 0.75} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />;
        })}
      </svg>
      {/* ===== 路由器（主角） ===== */}
      {routerS > 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${routerS.toFixed(3)})`, transformOrigin: `${ROUTER.cx}px ${ROUTER.cy}px`, filter: 'drop-shadow(0 0 14px 4px rgba(102,45,248,.35))'}}>
          <RouterGlyph cx={ROUTER.cx} cy={ROUTER.cy} litN={Math.floor((N - T_ROUTER) / 16)} />
        </div>
      ) : null}
      {/* ===== 三个端点（2 帧错峰缩放入） ===== */}
      {ENDS.map((e, i) => {
        const s = scaleIn(N - (e.t + 12), 16);
        if (s <= 0) return null;
        const active = cyc === i;
        return (
          <div key={e.id}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${s.toFixed(3)})`, transformOrigin: `${e.cx}px ${e.cy}px`, filter: active ? 'drop-shadow(0 0 12px 3px rgba(161,117,241,.6))' : undefined}}>
              {e.id === 'cloud' ? <CloudGlyph cx={e.cx} cy={e.cy} w={124} accent={active} /> : null}
              {e.id === 'laptop' ? <LaptopGlyph cx={e.cx} cy={e.cy} w={108} accent={active} /> : null}
              {e.id === 'phone' ? <PhoneGlyph cx={e.cx} cy={e.cy} h={92} accent={active} /> : null}
            </div>
            <SoftIn N={N} f0={e.t + 14}>
              <CText cx={e.lx} cy={e.ly} size={22} weight={600} color={active ? PURPLE_LIGHT : GREY}>{e.label}</CText>
            </SoftIn>
            {/* 捕获光点（节点轮流亮紫，脉冲） */}
            {active ? (
              <div style={{...abs(e.dot.cx - 8, e.dot.cy - 8, 16, 16), borderRadius: '50%', background: PURPLE, border: `2.5px solid ${PURPLE_LIGHT}`, transform: `scale(${(1 + 0.35 * tri((N - T_PILL) % 45, 30)).toFixed(3)})`, boxShadow: '0 0 14px 4px rgba(102,45,248,.6)'}} />
            ) : null}
          </div>
        );
      })}
      {/* ===== capture · learn ===== */}
      <SoftIn N={N} f0={T_PILL}>
        <Pill x={640 - 135} y={566} w={270} h={46} fill={PURPLE} sw={2.5} text="capture · learn" fontSize={26} weight={700} textDy={0} glow="0 0 22px 6px rgba(102,45,248,.5)" />
      </SoftIn>
    </div>
  );
};
