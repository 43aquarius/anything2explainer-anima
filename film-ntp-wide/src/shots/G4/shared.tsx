import React from 'react';
import {clamp01, easeOutCubic, FONT_MONO} from '../../common';
import {GlowBlob} from '../../fx';
import {
  Check, CText, ClockFace, Cross, PacketIcon, RackIcon, EXAMPLE,
  GREEN, GREY, GREY_LIGHT, GREY_MID, ORANGE, PURPLE_LIGHT, RED_DEEP, WHITE,
  abs, firstOp, mix, mixHex, scaleIn, softOp,
} from '../../ui';
import {LaptopGlyph} from '../G2/g2ui';

/**
 * G4 共用（第 3 章上：S17–S21）。原 shared.tsx 是 CDN 片模板残留（G4Shelf/BEATS），已整体替换为 NTP 内容。
 * - quadPt：二次贝塞尔取点（SC09 信封直飞 / SC10-11 环形连线共用）。
 * - RING + ServerRing：SC10「四台答案」与 SC11「信群众」共用的服务器环主角组。
 *   SC10 末帧与 SC11 首帧渲染同一全量状态（环不清场直通，CDN SC13→SC14 承接先例）→
 *   SC11 只传 SC10 的节拍 B（入场在 N≥2164 时全部饱和）+ 各高光状态量。
 *   LaptopGlyph 复用 G2/g2ui（read-only import，保证 your laptop 母题与 SC06/SC07 逐像素同款）。
 */

/** 二次贝塞尔取点 */
export const quadPt = (t: number, p0: [number, number], c: [number, number], p1: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};

/** 环形主角组几何（SC10 原生坐标；SC11 外层 0.85 缩微上移复用同一坐标） */
export const RING = {
  stations: [
    {id: 'A', cx: 255, rackCy: 428, clockCy: 278, sec: 58, rate: 1.0, offTarget: 360}, // 11:59:58
    {id: 'B', cx: 445, rackCy: 368, clockCy: 218, sec: 59, rate: 1.06, offTarget: 360}, // 11:59:59
    {id: 'C', cx: 835, rackCy: 368, clockCy: 218, sec: 61, rate: 0.94, offTarget: 0}, // 12:00:01（回落 1 秒）
    {id: 'D', cx: 1025, rackCy: 428, clockCy: 278, sec: 52, rate: 1.1, offTarget: 0}, // 11:59:52（离群）
  ],
  rackW: 60,
  rackH: 96,
  units: 5,
  clockR: 48,
  laptop: {cx: 640, cy: 512, w: 150},
  lineFrom: [640, 468] as [number, number],
  /** 四条连线（笔记本 → 各机架顶，quad 下坠扇形） */
  lines: [
    {c: [415, 505] as [number, number], p1: [255, 380] as [number, number]},
    {c: [540, 445] as [number, number], p1: [445, 320] as [number, number]},
    {c: [740, 445] as [number, number], p1: [835, 320] as [number, number]},
    {c: [865, 505] as [number, number], p1: [1025, 380] as [number, number]},
  ],
  /** 三条比对弧（相邻钟之间，弧顶向上）+ 弧上记号位置 */
  arcs: [
    {p0: [306.5, 261.7] as [number, number], c: [331.9, 190.8] as [number, number], p1: [393.5, 234.3] as [number, number], mark: 'check' as const, at: [341, 219]},
    {p0: [499, 218] as [number, number], c: [640, 156] as [number, number], p1: [781, 218] as [number, number], mark: 'check' as const, at: [640, 187]},
    {p0: [886.5, 234.3] as [number, number], c: [948.1, 190.8] as [number, number], p1: [973.5, 261.7] as [number, number], mark: 'q' as const, at: [939, 219]},
  ],
  center: [640, 375] as [number, number],
};

export type RingBeats = {racks: number; lines: number; clocks: number; reads: number; arcs: number};

const EASE = easeOutCubic;

/** 读数格式：s≥60 → 12:00:0X（61=12:00:01、60=12:00:00）；<60 → 11:59:XX */
const fmtSec = (s: number) => (s >= 60 ? `12:00:${String(s - 60).padStart(2, '0')}` : `11:59:${s}`);

/**
 * 服务器环主角组（SC10/SC11 共用）。
 * - N：绝对帧号；B：SC10 入场节拍（SC11 传同一组 → N≥2164 时入场全部完成）。
 * - k3：A/B/C 三钟紫光点亮总进度（0→1，组内 7f 错峰 × 10f 各自拉满）。
 * - sync3：三读数滚动同步进度（0→1 over 14f；组内 A/B/C 先后对齐）。
 * - flash3：对齐后三钟同拍白闪（0..1 衰减量，由调用方算好传入）。
 * - dimD / crossP / dissolveD：D 组灰化下沉 / 红 Cross draw-on / D 连线 dissolve。
 * - arcLit：比对弧灰→紫全亮（SC11 2172 拍）。
 * - glowK：光强乘子（调用方传 glowOffK 做"先灭光"）。
 */
export const ServerRing: React.FC<{
  N: number;
  B: RingBeats;
  k3?: number;
  sync3?: number;
  flash3?: number;
  dimD?: number;
  crossP?: number;
  arcLit?: number;
  dissolveD?: number;
  glowK?: number;
}> = ({N, B, k3 = 0, sync3 = 0, flash3 = 0, dimD = 0, crossP = 0, arcLit = 0, dissolveD = 0, glowK = 1}) => {
  // 三钟同步子进度（A 先 6f、B 迟 4f、C 再迟 4f，14f 内先后对齐）
  const pc = (i: number) => (i === 0 ? clamp01((sync3 * 14) / 6) : i === 1 ? clamp01((sync3 * 14 - 4) / 6) : clamp01((sync3 * 14 - 8) / 6));
  // 三钟紫光错峰（各 10f，7f 步进）
  const ki = (i: number) => clamp01((k3 * 26 - i * 7) / 10);

  return (
    <>
      {/* ---- 连线（quad 扇形 draw-on；D 连线随 dissolveD 撤回淡出）---- */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
        {RING.lines.map((L, i) => {
          const p = EASE(clamp01((N - (B.lines + i * 3)) / 12));
          if (p <= 0) return null;
          const dis = i === 3 ? dissolveD : 0;
          const op = softOp(N - (B.lines + i * 3), 5) * (1 - dis);
          if (op <= 0.01) return null;
          return (
            <g key={`ln-${i}`}>
              <path
                d={`M ${RING.lineFrom[0]} ${RING.lineFrom[1]} Q ${L.c[0]} ${L.c[1]} ${L.p1[0]} ${L.p1[1]}`}
                fill="none" stroke={GREY_MID} strokeWidth={2} strokeLinecap="round"
                pathLength={100} strokeDasharray={100}
                strokeDashoffset={100 * (1 - p) + 100 * dis}
                opacity={(0.72 * op).toFixed(3)}
              />
              {dis < 0.5 && p >= 1 ? <circle cx={L.p1[0]} cy={L.p1[1]} r={3.5} fill={GREY_MID} opacity={(0.8 * (1 - dis)).toFixed(3)} /> : null}
            </g>
          );
        })}
      </svg>

      {/* ---- 询问信封（SC10 专用：B.clocks−19+2i 起飞 12f，沿连线到机架顶，到站吸收）---- */}
      {RING.lines.map((L, i) => {
        const t0 = B.clocks - 19 + i * 2;
        const n = N - t0;
        if (n < 0 || n > 20) return null;
        const t = clamp01(n / 12);
        const [x, y] = quadPt(t, RING.lineFrom, L.c, L.p1);
        const absorb = clamp01((n - 12) / 8);
        const op = firstOp(n, 4) * (1 - Math.pow(absorb, 1.3));
        if (op <= 0.01) return null;
        const sc = 1 - 0.4 * absorb;
        return (
          <div key={`env-${i}`} style={{...abs(0, 0, 1280, 720), opacity: op.toFixed(3), transform: `rotate(${(5 * Math.sin(Math.PI * t)).toFixed(2)}deg)`, transformOrigin: `${x}px ${y}px`}}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${x}px ${y}px`}}>
              <PacketIcon cx={x} cy={y} w={34} h={24} accent />
            </div>
          </div>
        );
      })}

      {/* ---- 四站（机架 + 小时钟 + 读数；D 站带灰化下沉）---- */}
      {RING.stations.map((st, i) => {
        const rackN = N - (B.racks + i * 2);
        if (rackN < 0) return null;
        const rackSc = 0.55 + 0.45 * scaleIn(rackN, 12);
        const rackOp = softOp(rackN, 6);
        // 到站灯闪（信封到达机架顶 10f 内全亮）
        const arriveAt = B.clocks - 19 + i * 2 + 12;
        const lit = N >= arriveAt && N < arriveAt + 10 ? RING.units : RING.units - 1;
        const isD = i === 3;
        const dK = isD ? dimD : 0;
        const clockN = N - B.clocks;
        const clockSc = 0.5 + 0.5 * scaleIn(clockN, 10);
        const clockOp = clockN >= 0 ? firstOp(clockN, 6) : 0;
        // 针与速率：A/B/C 同步收敛（rate→1、offset→offTarget）；D 冻结（rate→0）
        const p = pc(i);
        const rate = isD ? st.rate * (1 - dK) : mix(st.rate, 1, p);
        const offsetDeg = isD ? st.sec * 6 : mix(st.sec * 6, st.offTarget, p);
        // D 读数微抖（灰化时收住）
        const jit = isD ? Math.sin(N * 2.4) * 1.2 * (1 - dK) : 0;
        // 读数值（A/B/C 滚动同步；D 常态 11:59:52）
        const readout = isD ? EXAMPLE.reads[3] : fmtSec(Math.round(mix(st.sec, 60, p)));
        const readN = N - B.reads;
        const readOp = readN >= 0 ? firstOp(readN, 5) : 0;
        const k3i = ki(i);
        return (
          <div key={`st-${st.id}`}>
            {/* A/B/C 紫光（GlowBlob 内建 30f 低幅呼吸）+ 紫环 */}
            {!isD && k3i > 0.01 ? <GlowBlob cx={st.cx} cy={st.clockCy} r={80} N={N} k={k3i * glowK} alpha={0.3} /> : null}
            {/* 站点包装（D：灰化 + 下沉） */}
            <div
              style={{
                ...abs(0, 0, 1280, 720),
                opacity: (1 - 0.4 * dK).toFixed(3),
                filter: dK > 0.005 ? `saturate(${(1 - 0.72 * dK).toFixed(3)}) brightness(${(1 - 0.26 * dK).toFixed(3)})` : undefined,
                transform: `translateY(${(38 * dK).toFixed(1)}px)`,
              }}
            >
              {/* 机架（缩入 + 灰化变色） */}
              <div style={{...abs(0, 0, 1280, 720), opacity: rackOp, transform: `scale(${rackSc.toFixed(4)})`, transformOrigin: `${st.cx}px ${st.rackCy}px`}}>
                <RackIcon
                  cx={st.cx}
                  cy={st.rackCy}
                  w={RING.rackW}
                  h={RING.rackH}
                  units={RING.units}
                  lit={lit}
                  color={mixHex(WHITE, GREY_MID, 0.8 * dK)}
                  label={`srv ${st.id}`}
                  labelSize={22}
                />
              </div>
              {/* 小时钟（同帧弹入 ×4；同步白闪；D 灰化后 ghost） */}
              {clockOp > 0 ? (
                <div
                  style={{
                    ...abs(0, 0, 1280, 720),
                    opacity: clockOp,
                    transform: `scale(${clockSc.toFixed(4)})`,
                    transformOrigin: `${st.cx}px ${st.clockCy}px`,
                    filter: flash3 > 0.02 && !isD ? `brightness(${(1 + 0.55 * flash3).toFixed(3)})` : undefined,
                  }}
                >
                  <ClockFace cx={st.cx} cy={st.clockCy} r={RING.clockR} N={N} rate={rate} offsetDeg={offsetDeg} ghost={isD && dK > 0.4} />
                </div>
              ) : null}
              {/* A/B/C 紫环（k3 拉起） */}
              {!isD && k3i > 0.01 ? (
                <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
                  <circle
                    cx={st.cx}
                    cy={st.clockCy}
                    r={RING.clockR + 8}
                    fill="none"
                    stroke={PURPLE_LIGHT}
                    strokeWidth={2.5}
                    opacity={(0.7 * k3i * glowK).toFixed(3)}
                    strokeDasharray={2 * Math.PI * (RING.clockR + 8)}
                    strokeDashoffset={2 * Math.PI * (RING.clockR + 8) * (1 - k3i)}
                    transform={`rotate(-90 ${st.cx} ${st.clockCy})`}
                  />
                </svg>
              ) : null}
              {/* 读数（mono 白；D 抖动 + 灰化变灰） */}
              {readOp > 0 ? (
                <div style={{...abs(0, 0, 1280, 720), opacity: readOp, transform: `translateX(${jit.toFixed(2)}px)`}}>
                  <CText
                    cx={st.cx}
                    cy={st.clockCy + RING.clockR + 24}
                    size={26}
                    weight={600}
                    family={FONT_MONO}
                    letterSpacing={1}
                    color={mixHex(WHITE, GREY, dK)}
                    shadow={!isD && flash3 > 0.02 ? `0 0 ${Math.round(16 * flash3)}px rgba(255,255,255,${(0.7 * flash3).toFixed(2)})` : `0 0 8px rgba(255,255,255,${(0.28 + (k3i * 0.3 + flash3 * 0.5) * glowK).toFixed(2)})`}
                  >
                    {readout}
                  </CText>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* ---- 比对弧（灰→紫全亮）+ 弧上记号（✓✓?）---- */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
        <g filter={`drop-shadow(0 0 ${(2 + 4 * arcLit * glowK).toFixed(1)}px rgba(${arcLit > 0.4 ? '161,117,241' : '255,255,255'},${(0.25 + 0.3 * arcLit * glowK).toFixed(2)})`}>
          {RING.arcs.map((A, j) => {
            const p = EASE(clamp01((N - (B.arcs + j * 4)) / 14));
            if (p <= 0) return null;
            const dis = j === 2 ? dimD : 0; // C–D 弧随 D 灰化压暗
            return (
              <path
                key={`arc-${j}`}
                d={`M ${A.p0[0]} ${A.p0[1]} Q ${A.c[0]} ${A.c[1]} ${A.p1[0]} ${A.p1[1]}`}
                fill="none"
                stroke={mixHex(GREY_MID, PURPLE_LIGHT, arcLit)}
                strokeWidth={2 + arcLit}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - p)}
                opacity={(0.85 * (1 - 0.62 * dis)).toFixed(3)}
              />
            );
          })}
        </g>
        {/* A–B / B–C 绿 Check（draw-on） */}
        {[0, 1].map((j) => {
          const A = RING.arcs[j];
          const p = clamp01((N - (B.arcs + j * 4 + 10)) / 10);
          return <Check key={`ck-${j}`} cx={A.at[0]} cy={A.at[1]} size={26} sw={6} color={GREEN} p={p} opacity={glowK} />;
        })}
        {/* C–D 弧上 ?（Orange，警示离群；随 D 灰化压暗） */}
        {(() => {
          const n = N - (B.arcs + 2 * 4 + 12);
          if (n < 0) return null;
          return (
            <text
              x={RING.arcs[2].at[0]}
              y={RING.arcs[2].at[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Orbitron',sans-serif"
              fontSize={28}
              fontWeight={700}
              fill={ORANGE}
              opacity={(firstOp(n, 6) * (1 - 0.65 * dimD) * glowK).toFixed(3)}
            >
              ?
            </text>
          );
        })()}
      </svg>

      {/* ---- 中央笔记本（your laptop；灰屏小钟持续走）---- */}
      {(() => {
        const n = N - (B.racks - 6);
        if (n < 0) return null;
        return (
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 8), transform: `scale(${(0.7 + 0.3 * scaleIn(n, 14)).toFixed(4)})`, transformOrigin: `${RING.laptop.cx}px ${RING.laptop.cy}px`}}>
            <LaptopGlyph cx={RING.laptop.cx} cy={RING.laptop.cy} w={RING.laptop.w} N={N} screenClock="grey" glow />
            <CText cx={RING.laptop.cx} cy={RING.laptop.cy + 56} size={22} weight={600} color={GREY_LIGHT}>{EXAMPLE.laptop}</CText>
          </div>
        );
      })()}

      {/* ---- D 钟 Red Cross（红光 draw-on；随 D 下沉但不受灰化滤镜影响）---- */}
      {crossP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: `drop-shadow(0 0 ${Math.round(14 * glowK)}px rgba(236,8,31,${(0.5 * glowK).toFixed(3)}))`}}>
          <Cross cx={RING.stations[3].cx} cy={RING.stations[3].clockCy + 38 * dimD} size={92} sw={9} color={RED_DEEP} p={crossP} />
        </svg>
      ) : null}
    </>
  );
};
