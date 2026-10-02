import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, rnd, powIn, FONT_TECH} from '../../common';
import {Pill, PacketIcon, Counter, Svg, WHITE, PURPLE_LIGHT, GREY, GREY_LIGHT, GREY_LINE, abs, softOp, exitOp} from '../../ui';

/**
 * SC19 BPF 消防水管 · N 4110–4310（S24 4118–4288 ¶ 段末）
 * 左：30+ 灰白方点洪流（8px，rnd 固定 seed，3px/帧持续右飞）撞中央格栅坠落（powIn 2，14 帧，变暗淡出后左端重生）；
 * 中：格栅 240×360 白边黑底 6 根（4110–4132 draw-on），紫边 + 紫柔光（主角 360px）；4167 灰点开始坠落 + 格栅条纹逐根闪烁；
 * 右：4 枚紫信封 4224 起错峰 4 帧穿过格栅 10px/帧；`cheap` 灰 Pill（4224）+ 格栅下方 `dropped` 橙计数持续累加。
 * 停留：末拍（cheap/计数）落位 4232 → 离场 4302，70 帧 ✓（洪流继续跑）；末 8 帧整组归零。零 glitch（白名单 SC19 无）。
 */
const F0 = 4110, TO = 4310;
const T_FLOOD = 4110; // 洪流首帧起淡入（首帧可量）
const T_GATE = 4110; // 格栅 draw-on 20 帧
const T_DROP = 4167; // 撞击坠落开始（beat）
const T_PASS = 4224; // 紫信封穿过 + cheap Pill

const GATE = {x: 520, y: 180, w: 240, h: 360};
const BARS = 6;
const IMPACT_X = 512; // 灰点右缘撞格栅左面
const DOTS = 34;
const FALL = 14, GAP = 12; // 坠落 14 帧 + 重生间隔 12 帧

// 灰点参数（rnd 固定 seed → 确定性）
// v2（QC 碎屑修复）：随机散点 → 8 车道并行流（y 量化到车道、同速同相位差）——读作有意的多路数据流，不是碎屑
const LANES = 8;
const DOT = Array.from({length: DOTS}, (_, i) => {
  const lane = i % LANES;
  const y0 = 208 + lane * 44; // 8 车道 y 208–516，行距 44
  const sp = 3.1; // 车道同速（整齐的流）
  const dist = IMPACT_X - 70; // 行程
  const cyc = Math.ceil(dist / sp) + FALL + GAP;
  const perLane = Math.ceil(DOTS / LANES);
  const ph = ((Math.floor(i / LANES) / perLane) * 1.35 + rnd(43, lane) * 0.12) * cyc; // 车道内等距相位
  const jx = (rnd(44, lane) - 0.5) * 10; // 坠落抖动按车道（确定性）
  return {y0, sp, dist, cyc, ph, jx};
});

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const floodIn = softOp(N - T_FLOOD, 10);
  const gateP = easeOutCubic(clamp01((N - T_GATE) / 20));
  // dropped 计数（坠落累计：每点每循环 1 次，平均速率 ≈0.21/帧）
  const dropped = Math.max(0, Math.floor((N - 4118) * 0.21));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 灰点洪流 + 撞击火花（一个 Svg，BLOOM） */}
      <Svg>
        {DOT.map((d, i) => {
          const t = (N + d.ph) % d.cyc;
          const travel = Math.ceil(d.dist / d.sp);
          if (t < travel) {
            // 飞行段
            const x = 70 + d.sp * t;
            return <rect key={i} x={x} y={d.y0} width={10} height={10} fill={GREY_LIGHT} opacity={floodIn * (0.75 + 0.25 * rnd(45, i))} />;
          }
          const u = t - travel;
          if (u < FALL) {
            // 坠落段：powIn 2 下坠 150px + 变暗淡出 + 撞击火花（4118 “drops the packets” 起）
            const fy = d.y0 + 150 * Math.pow(u / FALL, 2);
            const k = 1 - u / FALL;
            return (
              <g key={i} opacity={floodIn * k}>
                <rect x={IMPACT_X + d.jx} y={fy} width={10} height={10} fill={GREY} />
                {u < 3 ? <circle cx={IMPACT_X - 2} cy={d.y0 + 4} r={3} fill={WHITE} opacity={0.9} /> : null}
              </g>
            );
          }
          return null;
        })}
      </Svg>

      {/* 格栅（主角：紫边 + 紫柔光） */}
      <div style={{...abs(GATE.x, GATE.y, GATE.w, GATE.h), opacity: floodIn}}>
        <div style={{position: 'absolute', inset: 0, background: '#000', border: `3px solid ${PURPLE_LIGHT}`, filter: 'drop-shadow(0 0 18px 6px rgba(102,48,248,.5))'}} />
        {/* 6 根格栅条（draw-on 自上而下；4167 逐根闪烁一次） */}
        {Array.from({length: BARS}, (_, b) => {
          const w = (GATE.w - 60) / BARS - 10;
          const x = 30 + b * ((GATE.w - 60) / BARS) + 5;
          const h = (GATE.h - 96) * clamp01((gateP * BARS - b) / 1);
          const blinkN = N - (T_DROP + b * 2);
          const blink = blinkN >= 0 && blinkN < 10 ? 1 - 0.6 * Math.abs(Math.sin((Math.PI * blinkN) / 10)) : 1;
          return (
            <div key={b} style={{position: 'absolute', left: x, top: 76, width: w, height: Math.max(0, h), background: '#0c0c0e', border: `2px solid ${GREY_LINE}`, opacity: 0.95 * blink, overflow: 'hidden'}} />
          );
        })}
        {/* BPF 标签 */}
        <div style={{position: 'absolute', left: 0, top: 26, width: GATE.w, textAlign: 'center', fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 30, fontWeight: 600, color: PURPLE_LIGHT, textShadow: '0 0 8px rgba(102,48,248,.7)'}}>BPF</div>
      </div>

      {/* 穿过的紫信封（4218 起错峰 2 帧，15px/帧，穿过格栅后右缘淡出 ~4268 → 末拍稳定期 ≥30） */}
      {[0, 1, 2, 3].map((i) => {
        const n = N - (T_PASS - 6 + i * 2);
        if (n < 0) return null;
        const x = 470 + 15 * n;
        if (x > 1080) return null;
        const k = Math.min(clamp01(n / 4), clamp01((1080 - x) / 80));
        return <PacketIcon key={i} cx={x} cy={[296, 344, 392, 440][i]} w={44} h={30} accent glow opacity={0.95 * k} />;
      })}

      {/* dropped 计数（格栅下方，橙数字持续累加） */}
      <div style={{...abs(GATE.x, 556, GATE.w, 44), opacity: softOp(N - T_DROP, 10), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>
        <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 24, color: GREY_LIGHT}}>dropped</span>
        <Counter cx={GATE.x + GATE.w / 2 + 70} cy={578} value={dropped} size={34} color="#F05F41" />
      </div>

      {/* cheap Pill（4224，灰） */}
      <div style={{...abs(880, 556, 140, 42), opacity: softOp(N - T_PASS, 8) * 0.95}}>
        <Pill x={0} y={0} w={140} h={42} r={21} sw={2} stroke={GREY} fill="#000" text={<span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 25, color: GREY_LIGHT}}>cheap</span>} />
      </div>
    </div>
  );
};
