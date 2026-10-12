import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, PacketIcon, RackIcon, EXAMPLE, GREY, GREY_LIGHT, GREY_MID, GREY_LINE, ORANGE, PURPLE_LIGHT, WHITE,
  abs, firstOp, mix, softOp, exitOp, glowOffK, scaleIn, SoftIn,
} from '../../ui';
import {LaptopGlyph} from '../G2/g2ui';

/**
 * SC09 迟到 · N 1888–2004（第 3 章首镜，章节卡 The Cross-Check 1843–1887 之后一帧起；节拍 1916/1959）。
 * S17：1916「But networks lie a little.」/ 1959「Every answer arrives late.」
 * 版式：章首承接 SC08 塔尖缩微左上角（AtomClock 微缩 + 两层 StratumTier 简笔，图标级）；
 *   中央左 `time.example` 机架（92×170）→ 右 `your laptop`，信封（PacketIcon 白光主角）直线飞行（18f）；
 *   下方时延条区：共享起点竖轴 + 三条橙头时延条（240/150/330 三档，5f 错峰各 22f 生长），
 *   每条到点笔记本小跳一拍（"到得歪"）；右侧灰字 `every answer arrives late`。
 * 动效：1888 塔尖缩微 firstOp 淡入 + 10f 落位；1910 两端设备入场（拍 1916 前挂 −6）+ 航线虚线引导 draw-on；
 *   1916 信封第一飞（18f kf）→ 到站吸收；1959 时延条区 + 三条错峰生长（1979/1984/1989 到点）+ 灰字 1961 SoftIn；
 *   1962 信封第二飞（低频循环）；每条到点笔记本 dy 3.5px 小跳一拍（8f 衰减）。
 *   持续动作：信封两飞 + 笔记本屏内小钟秒针 + 塔尖原子核脉冲（低幅）。
 * 运镜：1888–1954 慢推 1.0→1.05（末 key 1954 = TO−50 ✓）。零 glitch（白名单 SC09 无）。
 * 停留：段内不判（S17 末块 43；末拍 1959 = TO−45 恰在限上，条簇 1991 落定 → 灭光 1996/离场 1999–2004）。
 */
const F0 = 1888;
const TO = 2004;

const T_DEV = 1910;   // 两端设备（拍 1916 的 −6）
const T_FLY1 = 1916;  // 信封第一飞（18f）
const T_BARS = 1959;  // 时延条区 + `delay` 标注（S17.c2）
const T_NOTE = 1961;  // `every answer arrives late` 灰字
const T_FLY2 = 1962;  // 信封第二飞（低频循环）
const T_MINIDIM = 1940; // 塔尖缩微让位压暗（第一飞落位后）

// ---- 几何 ----
const SRV = {cx: 350, cy: 320, w: 92, h: 170, units: 6};
const LAP = {cx: 955, cy: 312, w: 150};
const FLY = {x0: 402, y0: 246, x1: 888, y1: 262, dur: 18};
const MINI = {cx: 185, cy: 195};
const BARS = [
  {y: 470, len: 240, t0: 1959},
  {y: 512, len: 150, t0: 1964},
  {y: 554, len: 330, t0: 1969},
];
const BAR_X0 = 400;

const EASE = easeOutCubic;
const EIO = easeInOutPow(1.6);

/** 一次性到点闪光（3 帧冲顶 + 指数回落） */
const flashK = (N: number, f: number, life = 14): number => {
  const n = N - f;
  if (n < 0 || n > life) return 0;
  return n < 3 ? n / 3 : Math.exp(-(n - 3) / 4.5);
};

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- 塔尖缩微（章首承接：firstOp 淡入 + 10f 落位；第一飞落位后压暗让位）----
  const miniOp = firstOp(N - F0, 6) * (1 - 0.45 * clamp01((N - T_MINIDIM) / 14)) * exit;
  const miniSc = 0.94 + 0.06 * EASE(clamp01((N - F0) / 10));
  // 原子核低幅脉冲（持续）
  const coreR = 3.4 + 0.9 * (0.5 + 0.5 * Math.sin(N / 7));

  // ---- 两端设备（1910：机架 slideUp / 笔记本缩入）----
  const devOp = N < T_DEV ? 0 : softOp(N - T_DEV, 8);
  const srvDy = 60 * (1 - EASE(clamp01((N - T_DEV) / 16)));
  const lapSc = 0.7 + 0.3 * scaleIn(N - T_DEV, 14);

  // ---- 航线虚线引导（1916 draw-on 14f）----
  const guideP = EASE(clamp01((N - T_FLY1) / 14));

  // ---- 信封飞行（两趟；18f kf 直线 + 到站吸收）----
  const flight = (t0: number): {x: number; y: number; op: number; rot: number} | null => {
    const n = N - t0;
    if (n < 0) return null;
    const t = EIO(clamp01(n / FLY.dur));
    const absorb = clamp01((n - FLY.dur) / 6);
    const op = firstOp(n, 4) * (1 - Math.pow(absorb, 1.3));
    if (op <= 0.01) return null;
    return {x: mix(FLY.x0, FLY.x1, t), y: mix(FLY.y0, FLY.y1, t), op, rot: 5 * Math.sin(Math.PI * t)};
  };
  const env = flight(T_FLY1) ?? flight(T_FLY2);

  // ---- 笔记本到点小跳（每条时延条到点触发，8f 衰减正弦）----
  const jumpK = (f: number) => {
    const n = N - f;
    return n < 0 || n > 8 ? 0 : Math.sin((Math.PI * n) / 8);
  };
  const jump = Math.max(jumpK(BARS[0].t0 + 22), jumpK(BARS[1].t0 + 22), jumpK(BARS[2].t0 + 22));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1954, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ---- 航线虚线引导（信封下方，弱灰）---- */}
        {guideP > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            <line
              x1={FLY.x0}
              y1={FLY.y0}
              x2={FLY.x0 + (FLY.x1 - FLY.x0) * guideP}
              y2={FLY.y0 + (FLY.y1 - FLY.y0) * guideP}
              stroke={GREY_LINE}
              strokeWidth={1.6}
              strokeDasharray="4 9"
              strokeLinecap="round"
              opacity={0.4}
            />
          </svg>
        ) : null}

        {/* ---- 左：time.example 机架（slideUp）---- */}
        {devOp > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: devOp, transform: `translateY(${srvDy.toFixed(1)}px)`}}>
            <RackIcon cx={SRV.cx} cy={SRV.cy} w={SRV.w} h={SRV.h} units={SRV.units} lit={4} label={EXAMPLE.server} labelSize={22} glow={N < TO - 8} />
          </div>
        ) : null}

        {/* ---- 右：your laptop（缩入 + 屏内小钟 + 到点小跳一拍）---- */}
        {devOp > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: devOp, transform: `translateY(${(3.5 * jump).toFixed(2)}px) rotate(${(1.1 * jump).toFixed(2)}deg)`, transformOrigin: `${LAP.cx}px ${LAP.cy}px`}}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${lapSc.toFixed(4)})`, transformOrigin: `${LAP.cx}px ${LAP.cy}px`}}>
              <LaptopGlyph cx={LAP.cx} cy={LAP.cy} w={LAP.w} N={N} screenClock="grey" glow />
              <CText cx={LAP.cx} cy={LAP.cy + 64} size={22} weight={600} color={GREY_LIGHT}>{EXAMPLE.laptop}</CText>
            </div>
          </div>
        ) : null}

        {/* ---- 信封（主角：白柔光；直线飞 + 到站吸收）---- */}
        {env ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: env.op.toFixed(3), transform: `rotate(${env.rot.toFixed(2)}deg)`, transformOrigin: `${env.x}px ${env.y}px`}}>
            <div style={{...abs(0, 0, 1280, 720), filter: `drop-shadow(0 0 ${(9 * gk).toFixed(1)}px rgba(255,255,255,${(0.55 * gk).toFixed(2)}))`}}>
              <PacketIcon cx={env.x} cy={env.y} w={58} h={40} />
            </div>
          </div>
        ) : null}

        {/* ---- 时延条区（1959：共享起点竖轴 + 三条橙头时延条）---- */}
        {N >= T_BARS ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_BARS, 6)}}>
            {/* 共享起点竖轴 */}
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
              <line x1={BAR_X0 - 5} y1={456} x2={BAR_X0 - 5} y2={580} stroke={GREY_LINE} strokeWidth={1.6} opacity={0.7} />
            </svg>
            {BARS.map((b, i) => {
              const n = N - b.t0;
              const p = EASE(clamp01(n / 22));
              const wNow = b.len * p;
              const done = p >= 1;
              const fl = done ? flashK(N, b.t0 + 22) : 0;
              return (
                <div key={`bar-${i}`}>
                  {/* 条体（橙调弱填充 + 灰描边，宽度随 p 生长） */}
                  <div
                    style={{
                      ...abs(BAR_X0, b.y, Math.max(2, wNow), 24),
                      background: 'rgba(240,95,65,0.12)',
                      border: `1.5px solid ${GREY_LINE}`,
                      borderRadius: 4,
                      boxSizing: 'border-box',
                      opacity: softOp(n, 5),
                    }}
                  />
                  {/* 实心橙亮条头（薄宽物折叠规则：亮头锚定大体） */}
                  <div
                    style={{
                      ...abs(BAR_X0 + Math.max(0, wNow - 15), b.y, Math.min(15, Math.max(2, wNow)), 24),
                      background: ORANGE,
                      borderRadius: 3,
                      boxShadow: `0 0 ${(7 + 9 * fl).toFixed(1)}px rgba(240,95,65,${(0.45 + 0.3 * fl).toFixed(2)})`,
                      opacity: softOp(n, 5),
                    }}
                  />
                  {/* 到点端刻（竖亮线一拍） */}
                  {done ? (
                    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
                      <line x1={BAR_X0 + b.len + 3} y1={b.y - 5} x2={BAR_X0 + b.len + 3} y2={b.y + 29} stroke={ORANGE} strokeWidth={2.5} opacity={(0.4 + 0.55 * fl).toFixed(3)} />
                    </svg>
                  ) : null}
                </div>
              );
            })}
            {/* delay 标注 */}
            <SoftIn N={N} f0={T_BARS} len={6}>
              <CText cx={BAR_X0 + 30} cy={446} size={24} weight={600} color={GREY} letterSpacing={1}>delay</CText>
            </SoftIn>
          </div>
        ) : null}

        {/* ---- 旁注：every answer arrives late（灰）---- */}
        <SoftIn N={N} f0={T_NOTE} len={8}>
          <CText cx={925} cy={522} size={26} weight={600} color={GREY}>every answer arrives late</CText>
        </SoftIn>

        {/* ---- 塔尖缩微（章首承接，屏幕空间不随运镜）---- */}
        {miniOp > 0.01 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: miniOp.toFixed(3), transform: `scale(${miniSc.toFixed(4)})`, transformOrigin: `${MINI.cx}px ${MINI.cy}px`}}>
            <svg width={200} height={140} viewBox="0 0 200 140" style={{...abs(MINI.cx - 100, MINI.cy - 70)}}>
              <g stroke={WHITE} strokeWidth={2} fill="#000" strokeLinejoin="round">
                <rect x={72} y={8} width={56} height={62} rx={6} />
                <rect x={90} y={1} width={20} height={10} rx={2.5} strokeWidth={1.6} />
                <line x1={72} y1={24} x2={128} y2={24} strokeWidth={1.2} opacity={0.6} />
              </g>
              {/* 原子轨道（SC08 塔尖同款三椭圆 + 核心脉冲） */}
              <g stroke={PURPLE_LIGHT} strokeWidth={1.6} fill="none" opacity={0.9}>
                <ellipse cx={100} cy={39} rx={19} ry={7} />
                <ellipse cx={100} cy={39} rx={19} ry={7} transform="rotate(60 100 39)" />
                <ellipse cx={100} cy={39} rx={19} ry={7} transform="rotate(-60 100 39)" />
              </g>
              <circle cx={100} cy={39} r={coreR.toFixed(2)} fill={WHITE} />
              {/* 两层 StratumTier 简笔（缩微：条 + 小芯片） */}
              <g stroke={WHITE} strokeWidth={1.8} fill="#000">
                <rect x={52} y={76} width={96} height={14} rx={4} />
                <rect x={40} y={96} width={120} height={13} rx={4} opacity={0.85} />
              </g>
              <g stroke={GREY_MID} strokeWidth={1.2} fill="none">
                {[82, 100, 118].map((x) => <line key={`s1-${x}`} x1={x} y1={74} x2={x} y2={76} />)}
                {[82, 100, 118].map((x) => <line key={`s2-${x}`} x1={x} y1={90} x2={x} y2={96} />)}
              </g>
              <g fill={GREY_MID}>
                {[62, 92, 122].map((x) => <rect key={`c1-${x}`} x={x} y={80} width={12} height={6} rx={1.5} />)}
                {[54, 82, 110, 138].map((x) => <rect key={`c2-${x}`} x={x} y={99.5} width={12} height={6} rx={1.5} opacity={0.85} />)}
              </g>
              {/* 层间短竖线（金字塔母题） */}
              <g stroke={GREY_MID} strokeWidth={1.2}>
                <line x1={100} y1={70} x2={100} y2={76} />
              </g>
            </svg>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
