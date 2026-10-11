import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, easeInOutPow, GlitchIn} from '../../common';
import {CameraRig, HeroGlow} from '../../fx';
import {
  RackIcon, Pill, Svg, CText, abs, exitOp, glowOffK, mixHex, softOp, firstOp, scaleIn,
  GREY_MID, GREY_LINE, PURPLE_LIGHT, ORANGE, RED_DEEP, WHITE,
} from '../../ui';
import {YearRoll, SeaMapMini} from './g5ui';

/**
 * SC12 九十年代之问（2724–3025）。S16–S17：这想法早于网络热潮 → 九十年代 MIT → 一个难题流传 →
 * 全世界都砸一台服务器 → 那台服务器会熔化。
 * 节拍：2724 承接：SC11 海图缩微滑入左下角（16 帧）｜2747 `1990s` YearRoll（14 帧落定）+ 年份光呼吸
 *       ｜2814 `MIT` Pill SoftIn（对齐 "at MIT" 字幕块）｜2864 中心服务器缩入（21 帧）+ 环形全球节点
 *       2 帧错峰亮 + 放射虚线 draw-on（20 帧）｜2922 流量脉冲持续涌入（密度渐增，持续动作）
 *       ｜2986 热浪 3 圈循环上升 + 烟点循环 + 机柜描边灰→橙（11 帧）+ `melt` GlitchIn（rgbSplit 4，白名单）。
 * 运镜：33 帧 1→1.15 推向过热服务器（2949–2982，不进 2986 末拍）。
 * 停留：段内不判（S17 末块 37）。循环动作（热浪/烟点/脉冲）在离场前衰减冻结（3016 前）。
 * 主角：中心服务器+放射群 320px（热浪橙光 + melt 红光）。
 */
const F0 = 2724;
const TO = 3025;

// 服务器组几何
const SX = 835, SY = 335, RX = 235, RY = 158;
const NODES: Array<[number, number]> = Array.from({length: 9}, (_, i) => {
  const a = ((-90 + i * 40) * Math.PI) / 180;
  return [SX + RX * Math.cos(a), SY + RY * Math.sin(a)] as [number, number];
});
/** 放射线终点：撞到机柜描边（半宽 59 / 半高 94）即停 */
const lineEnd = (nx: number, ny: number): [number, number] => {
  const dx = Math.abs(nx - SX) < 0.01 ? 1e9 : nx - SX;
  const dy = Math.abs(ny - SY) < 0.01 ? 1e9 : ny - SY;
  const u = 1 - Math.min(59 / Math.abs(dx), 94 / Math.abs(dy));
  return [nx + (SX - nx) * u, ny + (SY - ny) * u];
};

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // ---- 承接：SC11 海图缩微左下角（16 帧）----
  const eIO = easeInOutPow(2.5);
  const mx = kf(N, [[2724, 640], [2740, 172]], eIO);
  const my = kf(N, [[2724, 378], [2740, 556]], eIO);
  const ms = kf(N, [[2724, 0.72], [2740, 0.42]], eIO);
  const miniOp = firstOp(N - 2724, 6) * kf(N, [[2852, 1], [2868, 0]]);

  // ---- 服务器组入场 ----
  const rackN = N - 2768; // v3：再提前到 2768（年份数字落下时机架就开始成形）
  const rackK = clamp01(rackN / 21);
  const nodeOn = (i: number) => clamp01((N - (2772 + i * 3)) / 12);
  const lineP = (i: number) => clamp01((N - (2778 + i * 4)) / 20);

  // ---- 过热（2986）----
  const heatN = N - 2986;
  const heatK = clamp01(heatN / 11); // 描边灰→橙 11 帧
  const heatRamp = clamp01(heatN / 8); // 热浪/烟点强度入场
  const freezeK = 1 - clamp01((N - 3006) / 10); // 循环动作离场前衰减冻结（3016 归 0）

  // ---- 预脉冲光点（2830 起沿线流动，密度渐增到正式脉冲）----
  const prePh = (i: number) => N < 2830 ? -1 : (((N - 2830 + i * 13) % 26) / 26);
  // ---- 节点灯循环（2772 起常闪）----
  const nodeLed = (i: number) => (Math.floor((N - 2772) / 14 + i * 0.33) % 2 === 0 ? 1 : 0.35);
  // ---- 流量脉冲（2922 起，密度渐增；2950 起双发）----
  const pulseT = N - 2922;

  // ---- melt（本镜唯一 glitch，rgbSplit 4）----
  const meltGlow = glowK;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2949, x: 640, y: 360, s: 1}, {f: 2982, x: 805, y: 335, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 承接海图缩微 */}
        <SeaMapMini N={N} x={mx} y={my} s={ms} opacity={miniOp} />

        {/* 年份下时代弧（2766–2786 draw-on，破前段静止） */}
        <Svg bloom={false}>
          {N >= 2766 ? <path d={`M180 268 Q300 232 420 ${268 - 36 * clamp01((N - 2766) / 20)}`} fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeDasharray={`${(180 * clamp01((N - 2766) / 20)).toFixed(0)} 400`} strokeLinecap="round" /> : null}
        </Svg>
        {/* 左列：1990s + MIT */}
        <YearRoll N={N} f0={2747} cx={330} cy={232} from={1999} to={1990} suffix="s"
          shadow={`0 0 20px rgba(255,255,255,${(0.28 + 0.12 * Math.sin((N / 30) * Math.PI * 2)).toFixed(2)})`} />
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2814, 8)}}>
          <Pill x={255} y={304} w={150} h={48} r={24} fill="#000" stroke={PURPLE_LIGHT} sw={2}
            text="MIT" fontSize={30} weight={800} letterSpacing={2}
            glow={glowK > 0.02 ? `0 0 16px rgba(161,117,241,${(0.4 * glowK).toFixed(2)})` : undefined} />
        </div>

        {/* 环形轨道 + 放射虚线（draw-on 20 帧） */}
        <Svg>
          <ellipse cx={SX} cy={SY} rx={RX} ry={RY} fill="none" stroke={GREY_LINE} strokeWidth={1.6}
            strokeDasharray="14 16" opacity={0.5 * clamp01((N - 2866) / 20)} />
          {NODES.map(([nx, ny], i) => {
            const p = lineP(i);
            if (p <= 0) return null;
            const [ex, ey] = lineEnd(nx, ny);
            return <line key={i} x1={nx} y1={ny} x2={nx + (ex - nx) * p} y2={ny + (ey - ny) * p}
              stroke={GREY_MID} strokeWidth={2} strokeDasharray="7 7" opacity={0.85} />;
          })}
        </Svg>

        {/* 全球节点（2 帧错峰亮；过热后随描边转暖） */}
        {NODES.map(([nx, ny], i) => {
          const on = nodeOn(i);
          if (on <= 0.01) return null;
          const led = on >= 1 ? nodeLed(i) : 1;
          return <div key={i} style={{...abs(nx - 5, ny - 5, 10, 10), borderRadius: '50%', opacity: on,
            background: mixHex('#0a0a0a', '#2e1206', heatK),
            border: `2px solid ${mixHex('#C9C9C9', ORANGE, heatK * 0.9)}`,
            boxShadow: led > 0.5 ? '0 0 8px rgba(255,255,255,.55)' : 'none',
            transform: `scale(${(0.6 + 0.4 * on + (led > 0.5 ? 0.15 : 0)).toFixed(2)})`}} />;
        })}

        {/* 机柜（21 帧缩入；描边灰→橙；主角光） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(rackN, 6), transform: `scale(${scaleIn(rackN, 21).toFixed(4)})`, transformOrigin: `${SX}px ${SY}px`}}>
          <HeroGlow x={SX - 70} y={SY - 106} w={140} h={212} N={N} k={Math.min(1, 0.3 * (1 - heatK) + 0.95 * heatK) * glowK}
            color={heatK > 0.02 ? ORANGE : '#BDBDBD'} />
          <RackIcon cx={SX} cy={SY} w={130} h={200} units={6} lit={6}
            color={mixHex('#C9C9C9', ORANGE, heatK * 0.9)} accent={mixHex(PURPLE_LIGHT, ORANGE, heatK)} sw={2.6} />
        </div>

        {/* 预脉冲光点（2830 起沿线流动——正式脉冲前的涓流，填静止段） */}
        {NODES.map(([nx, ny], i) => {
          const ph = prePh(i);
          if (ph < 0 || pulseT >= 0) return null;
          const [ex, ey] = lineEnd(nx, ny);
          const u = ph;
          const px = nx + (ex - nx) * u, py = ny + (ey - ny) * u;
          return <div key={`pre-${i}`} style={{...abs(px - 3, py - 3, 6, 6), borderRadius: '50%', background: WHITE, opacity: 0.8, boxShadow: '0 0 6px rgba(255,255,255,.5)'}} />;
        })}

        {/* 流量脉冲（全世界砸向一台服务器，持续涌入） */}
        {NODES.map(([nx, ny], i) => {
          if (pulseT < 0) return null;
          const [ex, ey] = lineEnd(nx, ny);
          return [0, 1].map((j) => {
            if (j === 1 && pulseT <= 28) return null;
            const u = (((pulseT / 26 + i * 0.37 + j * 0.5) % 1) + 1) % 1;
            if (u > 0.94) return null;
            const op = clamp01(u * 6) * (0.9 - 0.5 * clamp01((u - 0.82) / 0.18)) * (1 - clamp01((N - 3008) / 8));
            if (op <= 0.02) return null;
            const px = nx + (ex - nx) * u, py = ny + (ey - ny) * u;
            return <div key={`${i}-${j}`} style={{...abs(px - 3, py - 3, 6, 6), borderRadius: '50%',
              background: mixHex('#FFFFFF', ORANGE, heatK * 0.85), opacity: op, boxShadow: '0 0 6px rgba(255,255,255,.6)'}} />;
          });
        })}

        {/* 热浪（3 圈循环上升） */}
        {heatN >= 0 && (
          <Svg>
            {[0, 1, 2].map((k) => {
              const ct = heatN - k * 12;
              if (ct < 0) return null;
              const cyc = (ct % 36) / 36;
              const amp = heatRamp * freezeK * Math.sin(Math.PI * cyc);
              if (amp <= 0.02) return null;
              const y = 408 - 152 * cyc;
              const w = 150 + 96 * cyc;
              const d = `M${SX - w / 2},${y} q${w / 8},-11 ${w / 4},0 q${w / 8},11 ${w / 4},0 q${w / 8},-11 ${w / 4},0 q${w / 8},11 ${w / 4},0`;
              return (
                <g key={k}>
                  <path d={d} fill="none" stroke={ORANGE} strokeWidth={9} opacity={amp * 0.22} strokeLinecap="round" />
                  <path d={d} fill="none" stroke={ORANGE} strokeWidth={3.4} opacity={amp * 0.9} strokeLinecap="round" />
                </g>
              );
            })}
          </Svg>
        )}

        {/* 烟点（2–3 枚上升循环） */}
        {heatN >= 0 &&
          [0, 1, 2].map((k) => {
            const ct = heatN - k * 15;
            if (ct < 0) return null;
            const cyc = (ct % 45) / 45;
            const amp = heatRamp * freezeK * Math.sin(Math.PI * cyc);
            if (amp <= 0.02) return null;
            const y = 236 - 62 * cyc;
            const x = SX + (k - 1) * 17 + 7 * Math.sin(Math.PI * 2 * cyc + k);
            const r = 5.5 - 2.2 * cyc;
            return <div key={k} style={{...abs(x - r, y - r, r * 2, r * 2), borderRadius: '50%',
              background: '#C9C9C9', opacity: amp * 0.7, filter: 'drop-shadow(0 0 3px rgba(255,255,255,.4))'}} />;
          })}

        {/* melt 红字 */}
        {heatN >= 0 && (
          <GlitchIn N={N} f0={2986} rgbSplit={4} seed={12}>
            <CText cx={SX} cy={530} size={56} weight={900} letterSpacing={2} color={RED_DEEP}
              shadow={`0 0 26px rgba(236,8,31,${(0.62 * meltGlow).toFixed(2)}), 0 0 9px rgba(236,8,31,${(0.55 * meltGlow).toFixed(2)})`}>
              melt
            </CText>
          </GlitchIn>
        )}
      </div>
    </CameraRig>
  );
};

export const SC12_RANGE = {from: F0, to: TO};
