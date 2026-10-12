import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, GlitchIn, FONT_ORB, FONT_TECH} from '../../common';
import {CameraRig} from '../../fx';
import {
  AsChip, CText, Check, Cross, MapFrame, EXAMPLE, GREY, GREY_LINE, GREY_MID, RED_DEEP, WHITE,
  abs, softOp, firstOp, exitOp, glowOffK, scaleIn, slideUp, Svg, VoiceDot,
} from '../../ui';
import {YearRoll, RingMini, MiniNote, quadPt, RING} from './shared';

/**
 * SC09 1997 说了谎 · N 1932–2254（第 3 章首镜，章节卡 1887–1931 之后一帧起；分镜表节拍 1960/2015/2057/2106/2150/2197）。
 * S14–S16：1960「But a spoken map can lie.」/ 2015「Nineteen ninety-seven:」/ 2057「one small provider announced」
 *   / 2106「more than it owned —」/ 2150「and the internet believed it.」/ 2197「Large parts of the net went dark.」
 * 版式：左列 `1997`（Orbitron 96 灰）+ `AS7007` 小字（Exo 灰斜体）+ `went dark` 红字（2197 glitch，本镜唯一）；
 *   右侧 MapFrame（620×420，x 560–1180，y 166–586）内：小 AsChip `AS7007`（灰、led='lie' 暗红说谎灯，2057 缩入）
 *   + 三条白色宣告弧越画越远（2065/2106/2112，端头 `?` 越界提示 2118/2124）+ 周围 5 枚正常芯片
 *   （N1/N2 左侧存活、N3/N4/N5 右 1/3 熄灭区）；2150 五枚芯片错峰收到缩微纸条（2f 错峰）+ 绿 Check（"信了"）；
 *   2197 熄灭区波次灰化（3f 错峰）+ 暗色罩 + 红 X 盖下（12f）+ `went dark` GlitchIn（rgbSplit 4）+ 余震（衰减 + 永续微颤）。
 * 章首承接：SC08 芯片环缩微滑到左下角（16 帧，2128–2144 淡出）+ 环心余音涟漪；1960 顶行灰字 + 幕底轻微暖色偏一拍。
 * 运镜：2164–2197 33f 1→1.15 推向熄灭区（相机末帧 = glitch 首帧，不与 GlitchIn 重叠、不进末拍）。
 * 停留：段内不判（S16 末块 56）；熄灭拍落位 2211 → 离场 2247 → hold ≈ 36f。末 8 帧归零。
 */
const F0 = 1932;
const TO = 2254;

const T_TEXT = 1960;   // 顶行灰字 + 暖色偏一拍 + 地图框起
const T_MAP = 1962;    // MapFrame slideUp 18f
const T_CHIP = 1966;   // 5 枚正常芯片 2f 错峰缩入
const T_LINK = 1970;   // 芯片间细线 draw-on（3f 错峰）
const T_YEAR = 2015;   // 1997 YearRoll
const T_ASN = 2020;    // AS7007 小字
const T_TEXTOUT = 2033; // 顶行淡出让位
const T_LIAR = 2057;   // AS7007 芯片缩入（14f）
const T_ARC1 = 2065, T_ARC2 = 2106, T_ARC3 = 2112;
const T_MINIOUT = 2128; // 芯片环缩微淡出
const T_NOTE = 2146;   // 五枚缩微纸条 2f 错峰滑入（2150 块 −4，Check +6f）
const T_DARK = 2197;   // 熄灭区波次灰化 + went dark glitch
const T_X = 2199;      // 红 X 盖下 12f
const T_QUAKE = 2211;  // 余震起始

// ---- 几何 ----
const MAP = {cx: 870, cy: 376, w: 620, h: 420};
const LIAR = {cx: 665, cy: 480, s: 76};
const NORM: Array<{cx: number; cy: number}> = [
  {cx: 700, cy: 240}, {cx: 830, cy: 215}, {cx: 985, cy: 260}, {cx: 1040, cy: 390}, {cx: 990, cy: 510},
];
const NORM_ASNS = [EXAMPLE.asnYou, EXAMPLE.asnMid1, EXAMPLE.asnMid2, EXAMPLE.asnMid3, EXAMPLE.asnSide];
const DARK_IDX = [2, 3, 4]; // 右 1/3 熄灭区（x > 965）
const LINKS: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [0, -1], [4, -1]]; // -1 = AS7007
const ARC0: [number, number] = [692, 462]; // 三弧公共根（芯片右上角）
const ARCS: Array<{p1: [number, number]; c: [number, number]; t0: number}> = [
  {p1: [815, 420], c: [740, 430], t0: T_ARC1},
  {p1: [950, 330], c: [800, 355], t0: T_ARC2},
  {p1: [1085, 255], c: [880, 295], t0: T_ARC3},
];
const QMARKS: Array<{t0: number; p: [number, number]}> = [
  {t0: 2118, p: [952, 306]},
  {t0: 2124, p: [1087, 231]},
];
const ZONE_X = 965; // 熄灭区左界（框内 x 560–1180 的右 35% ≈ 1/3 面积）

const EASE = easeOutCubic;
const EIO = easeInOutPow(2.5);

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO);

  // ---- 章首承接：SC08 芯片环缩微（16 帧滑到左下角，压暗常驻到 2128 淡出）----
  const kMini = EIO(clamp01((N - F0) / 16));
  const miniTx = -440 * kMini;
  const miniTy = 239 * kMini;
  const miniScale = 1 - 0.7 * kMini;
  const miniOp = firstOp(N - F0, 6) * (1 - 0.25 * clamp01((N - F0 - 16) / 10)) * (1 - clamp01((N - T_MINIOUT) / 16)) * exit;
  const vdCx = RING.cx + miniTx;
  const vdCy = RING.cy + miniTy;

  // ---- 幕底轻微暖色偏一拍（1960，警示基调；约 26 帧脉冲）----
  const tintOp = softOp(N - T_TEXT, 6) * (1 - clamp01((N - (T_TEXT + 12)) / 14));

  // ---- 顶行灰字（1960–2043）----
  const textOp = softOp(N - T_TEXT, 8) * (1 - clamp01((N - T_TEXTOUT) / 10));

  // ---- 熄灭 ----
  const darkK = (i: number) => (DARK_IDX.includes(i) ? clamp01((N - (T_DARK + (i - 2) * 3)) / 12) : 0);
  const zoneOp = softOp(N - T_DARK, 8);
  const xP = clamp01((N - T_X) / 12);
  const xScale = 1.3 - 0.3 * xP;
  // 余震：2211 起衰减震 + 永续微颤（持续动作）
  const qN = N - T_QUAKE;
  const quake = qN >= 0 ? Math.sin(qN * 1.35) * (2.4 * Math.exp(-qN / 26) + 0.55) : 0;

  // ---- 宣告弧（draw-on + 弧光呼吸 + 流光点持续外送）----
  const arcP = (t0: number) => EASE(clamp01((N - t0) / 16));
  const arcGlow = 0.35 + 0.2 * Math.sin((2 * Math.PI * N) / 60);
  const arcDot = (i: number): [number, number] | null => {
    const t0 = ARCS[i].t0 + 16;
    if (N < t0) return null;
    const u = (((N - t0) / 48) + i * 0.33) % 1;
    return quadPt(u, ARC0, ARCS[i].c, ARCS[i].p1);
  };

  // ---- 存活链路光点（2213 起，"别处还在跑"持续动作）----
  const aliveDot = (j: number): [number, number] | null => {
    if (N < 2213) return null;
    const A = NORM[0];
    const B = j === 0 ? NORM[1] : {cx: LIAR.cx, cy: LIAR.cy};
    const u = (((N - 2213) / 40) + j * 0.5) % 1;
    return [A.cx + (B.cx - A.cx) * u, A.cy + (B.cy - A.cy) * u];
  };

  return (
    <>
      {/* 幕底暖色偏一拍（画布级、内容之下） */}
      <div style={{...abs(0, 0, 1280, 720), opacity: tintOp.toFixed(3), background: 'radial-gradient(ellipse 900px 560px at 50% 42%, rgba(240,95,65,0) 55%, rgba(240,95,65,0.12) 100%)'}} />

      <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2164, x: 640, y: 360, s: 1}, {f: 2197, x: 737, y: 390, s: 1.15}]}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* 顶行灰字 */}
          {textOp > 0.01 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: textOp}}>
              <CText cx={640} cy={146} size={30} weight={600} color={GREY} letterSpacing={0.5}>But a spoken map can lie</CText>
            </div>
          ) : null}

          {/* MapFrame（slideUp 18f） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - T_MAP, 8), transform: `translateY(${slideUp(N - T_MAP, 34, 18).toFixed(1)}px)`}}>
            <MapFrame cx={MAP.cx} cy={MAP.cy} w={MAP.w} h={MAP.h} />
          </div>

          {/* 熄灭区暗色罩 + 左界虚线 */}
          {zoneOp > 0.01 ? (
            <div style={{...abs(ZONE_X, MAP.cy - MAP.h / 2 + 8, MAP.cx + MAP.w / 2 - 8 - ZONE_X, MAP.h - 16), opacity: (zoneOp * 0.5).toFixed(3), background: 'rgba(0,0,0,0.55)', borderLeft: `1.5px dashed ${GREY_MID}`}} />
          ) : null}

          {/* 芯片间细线（draw-on 3f 错峰；熄灭区内随波次变暗） */}
          <Svg bloom={false}>
            {LINKS.map(([a, b], i) => {
              const p = EASE(clamp01((N - (T_LINK + i * 3)) / 12));
              if (p <= 0) return null;
              const A = a === -1 ? {cx: LIAR.cx, cy: LIAR.cy} : NORM[a];
              const B = b === -1 ? {cx: LIAR.cx, cy: LIAR.cy} : NORM[b];
              const inZone = a >= 2 || b >= 2;
              const fade = inZone ? 1 - 0.75 * clamp01((N - (T_DARK + 2)) / 10) : 1;
              return (
                <path key={`lk-${i}`} d={`M${A.cx},${A.cy} L${B.cx},${B.cy}`} fill="none" stroke={GREY_LINE} strokeWidth={1.5}
                  opacity={(0.55 * fade).toFixed(3)} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />
              );
            })}
            {/* 存活链路光点（持续） */}
            {[0, 1].map((j) => {
              const d = aliveDot(j);
              if (!d) return null;
              return <circle key={`ad-${j}`} cx={d[0].toFixed(1)} cy={d[1].toFixed(1)} r={4} fill={WHITE} opacity={0.75} filter="drop-shadow(0 0 3px rgba(255,255,255,.6))" />;
            })}
          </Svg>

          {/* 正常芯片（2f 错峰缩入；熄灭区 3 枚随波次灰化） */}
          {NORM.map((ch, i) => {
            const n = N - (T_CHIP + i * 2);
            if (n < 0) return null;
            const dk = darkK(i);
            const sc = scaleIn(n, 12);
            const qx = DARK_IDX.includes(i) ? quake : 0;
            return (
              <div key={`nc-${i}`} style={{...abs(0, 0, 1280, 720), transform: `translate(${qx.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`, transformOrigin: `${ch.cx}px ${ch.cy}px`, opacity: softOp(n, 6)}}>
                <AsChip cx={ch.cx} cy={ch.cy} w={62} h={62} asn={NORM_ASNS[i]} led={dk > 0.5 ? 'off' : 'on'} dim={dk > 0.5} opacity={1 - 0.15 * dk} />
              </div>
            );
          })}

          {/* AS7007 小芯片（灰 + led='lie' 暗红说谎灯） */}
          {N >= T_LIAR ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_LIAR, 6), transform: `scale(${(0.3 + 0.7 * scaleIn(N - T_LIAR, 14)).toFixed(4)})`, transformOrigin: `${LIAR.cx}px ${LIAR.cy}px`}}>
              <AsChip cx={LIAR.cx} cy={LIAR.cy} w={LIAR.s} h={LIAR.s} asn="AS7007" led="lie" dim labelSize={16} glow />
            </div>
          ) : null}

          {/* 三条宣告弧（白，draw-on + 弧光呼吸 + 流光点） */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: (1 - 0.25 * clamp01((N - T_DARK) / 12)).toFixed(3)}}>
            <g filter={`drop-shadow(0 0 4px rgba(255,255,255,${(arcGlow * gk).toFixed(3)}))`}>
              {ARCS.map((A, i) => {
                const p = arcP(A.t0);
                if (p <= 0) return null;
                return (
                  <path key={`arc-${i}`} d={`M${ARC0[0]},${ARC0[1]} Q${A.c[0]},${A.c[1]} ${A.p1[0]},${A.p1[1]}`}
                    fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round"
                    pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />
                );
              })}
              {ARCS.map((A, i) => (arcP(A.t0) >= 1 ? <circle key={`arcd-${i}`} cx={A.p1[0]} cy={A.p1[1]} r={4.5} fill={WHITE} /> : null))}
              {ARCS.map((A, i) => {
                const d = arcDot(i);
                if (!d) return null;
                return <circle key={`adot-${i}`} cx={d[0].toFixed(1)} cy={d[1].toFixed(1)} r={4} fill={WHITE} opacity={0.85} />;
              })}
            </g>
          </svg>

          {/* 越界端头 ? */}
          {QMARKS.map((q, i) => {
            const n = N - q.t0;
            if (n < 0) return null;
            return (
              <div key={`q-${i}`} style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6), transform: `scale(${(0.3 + 0.7 * EASE(clamp01(n / 8))).toFixed(4)})`, transformOrigin: `${q.p[0]}px ${q.p[1]}px`}}>
                <CText cx={q.p[0]} cy={q.p[1]} size={26} weight={700} family={FONT_ORB} color={GREY}>?</CText>
              </div>
            );
          })}

          {/* 缩微纸条（2f 错峰滑入，贴到芯片右上角） */}
          {NORM.map((ch, i) => {
            const n = N - (T_NOTE + i * 2);
            if (n < 0) return null;
            const dk = darkK(i);
            const sIn = EASE(clamp01(n / 8));
            const qx = DARK_IDX.includes(i) ? quake : 0;
            return (
              <div key={`note-${i}`} style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6) * (1 - 0.62 * dk), transform: `translate(${(14 * (1 - sIn) + qx).toFixed(1)}px, ${(-18 * (1 - sIn)).toFixed(1)}px)`}}>
                <MiniNote cx={ch.cx + 30} cy={ch.cy - 28} rot={-6 - i * 1.5} dim={dk} />
              </div>
            );
          })}

          {/* 绿 Check（"信了"；+6f draw-on，熄灭区 3 枚随波次褪去） */}
          <Svg bloom={false}>
            {NORM.map((ch, i) => {
              const p = clamp01((N - (T_NOTE + i * 2 + 6)) / 12);
              if (p <= 0) return null;
              return <Check key={`ck-${i}`} cx={ch.cx - 34} cy={ch.cy + 30} size={30} sw={6} p={p} opacity={(1 - 0.75 * darkK(i)) * gk} />;
            })}
          </Svg>

          {/* 红 X 盖在熄灭区（draw-on 12f + 红柔光 + 余震） */}
          {xP > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), transform: `translate(${quake.toFixed(2)}px, ${(-quake * 0.6).toFixed(2)}px) scale(${xScale.toFixed(4)})`, transformOrigin: '1070px 372px'}}>
              <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: `drop-shadow(0 0 ${Math.round(15 * gk)}px rgba(236,8,31,${(0.5 * gk).toFixed(3)}))`}}>
                <Cross cx={1070} cy={372} size={104} sw={9} color={RED_DEEP} p={xP} />
              </svg>
            </div>
          ) : null}

          {/* 左列：1997 + AS7007 */}
          <YearRoll N={N} f0={T_YEAR} cx={320} cy={250} size={96} from={2004} to={1997}
            shadow={`0 0 20px rgba(255,255,255,${(0.26 + 0.1 * Math.sin((2 * Math.PI * N) / 30)).toFixed(2)})`} />
          <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_ASN, 8)}}>
            <CText cx={320} cy={325} size={27} weight={600} family={FONT_TECH} italic color={GREY} letterSpacing={2}>AS7007</CText>
          </div>

          {/* went dark（本镜唯一 glitch：rgbSplit 4） */}
          <GlitchIn N={N} f0={T_DARK} rgbSplit={4} seed={21}>
            <CText cx={320} cy={428} size={48} weight={900} color={RED_DEEP} letterSpacing={1}
              shadow={`0 0 26px rgba(236,8,31,${(0.6 * gk).toFixed(3)}), 0 0 64px rgba(236,8,31,${(0.35 * gk).toFixed(3)})`}>
              went dark
            </CText>
          </GlitchIn>
        </div>
      </CameraRig>

      {/* SC08 芯片环缩微（屏幕空间承接，不随运镜） + 环心余音涟漪 */}
      <RingMini k={kMini} tx={miniTx} ty={miniTy} scale={miniScale} opacity={miniOp} />
      {miniOp > 0.02 ? (
        <VoiceDot cx={vdCx} cy={vdCy} N={N - F0} r={9 - 4 * kMini} rings={2} speed={44} maxR={Math.round(52 - 26 * kMini)} color={WHITE} opacity={0.55 * miniOp} glow={false} />
      ) : null}
    </>
  );
};
