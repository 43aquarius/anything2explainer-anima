import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic} from '../../common';
import {CameraRig} from '../../fx';
import {CText, GREY, GREY_LINE, ORANGE, WHITE, abs, exitOp, firstOp, glowOffK, softOp, Svg} from '../../ui';
import {AirPulse, ChannelBand, MannersMini, RouterGlyph, WEXAMPLE} from './shared';

/**
 * SC07 拥挤的空气 · N 1344–1662（第 3 章首镜，章节卡 C3 1299–1343 之后一帧起）。
 * S13–S14：1372「Move into an apartment,」/ 1415「and the air gets crowded.」
 *   / 1466「In the two-point-four gigahertz band,」/ 1531「only three channels don't overlap:」/ 1601「one, six, and eleven.」
 * 版式：章首承接（SC06 礼貌卡缩微左下角，1396–1412 淡出）→ 公寓三层剖面（draw-on 16f，三户 net A/net B/you 错峰亮起）
 *   → 1415 三家 AirPulse 同时连发 + 交叠处橙毛糙闪 4 次 + `crowded` 橙字
 *   → 1466 楼体上移缩小让位（12f，0.42×）+ ChannelBand 自下滑入（16f）+ `2.4 GHz` 标
 *   → 1531 频谱小峰逐个亮起（2f/峰）+ 重叠虚线弧帽 + `only three don't overlap` 灰字（块 +2）
 *   → 1601 `1` `6` `11` 三峰绿框先后框住（6f/0/+4/+8 错峰）+ 其余峰灰化。
 * 运镜：1568–1601 33f 1→1.15 推向 ChannelBand（相机末 key 1601 ≤ TO−50=1612，不进末拍：绿框在定机后落）。
 * 停留：段内不判（S14 末块 60）；末拍 1601 绿框 1615 落位 → 灭光 1654 → hold ≈33f。末 5 帧归零。
 */
const F0 = 1344;
const TO = 1662;

const T_APT = 1369;      // 公寓 draw-on 16f（S13a −3）
const T_HOME = 1376;      // 三户错峰（1376/1379/1382，各 10f）
const T_CROWD = 1415;     // 三家弧同时连发 + 交叠毛糙闪 + crowded 橙字
const T_MINIOUT = 1396;   // SC06 缩微淡出（16f）
const T_BAND = 1466;      // 楼体上移缩小 12f + 频带 slideUp 16f + 2.4 GHz 标
const T_PEAK = 1531;      // 小峰逐个亮起 + 弧帽 + only three don't overlap（块 +2）
const T_GREEN = 1601;     // 1/6/11 绿框（0/+4/+8 错峰，6f）+ 其余峰灰化

// ---- 几何 ----
const BLD = {x0: 400, x1: 880, y0: 175, y1: 545, floors: [295, 415]};
const HOMES = [
  {cx: 700, cy: 262, rot: -90, maxR: 82, f0: T_HOME, lx: 786, ly: 262, label: WEXAMPLE.netA},
  {cx: 545, cy: 360, rot: -90, maxR: 136, f0: T_HOME + 3, lx: 459, ly: 360, label: WEXAMPLE.netB},
  {cx: 700, cy: 480, rot: -90, maxR: 150, f0: T_HOME + 6, lx: 786, ly: 480, label: WEXAMPLE.you},
];
const FLASH: Array<{x: number; y: number; ph: number}> = [
  {x: 630, y: 342, ph: 0}, {x: 648, y: 246, ph: 1.7}, {x: 598, y: 296, ph: 3.1}, {x: 676, y: 372, ph: 4.6},
];
const BAND = {cx: 640, baseY: 500, s: 1};

const EIO = easeInOutPow(2.5);
const EOC = easeOutCubic;


export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- 楼体缩微（1466–1478，上移 126 + 0.42×）----
  const kMini = EIO(clamp01((N - T_BAND) / 12));

  // ---- 交叠毛糙闪（4 处，9f 周期闪 4 拍后转低幅余辉）----
  const flashOp = (j: number) => {
    const n = N - (T_CROWD + 8);
    if (n < 0) return 0;
    if (n < 36) return 0.25 + 0.75 * Math.max(0, Math.sin((2 * Math.PI * n) / 9 + FLASH[j].ph));
    return 0.14 + 0.1 * Math.max(0, Math.sin((2 * Math.PI * N) / 26 + FLASH[j].ph));
  };

  // ---- 频带状态 ----
  const peakP = Array.from({length: 11}, (_, i) => clamp01((N - (T_PEAK + i * 2)) / 10));
  const greenP: [number, number, number] = [
    clamp01((N - T_GREEN) / 6),
    clamp01((N - (T_GREEN + 4)) / 6),
    clamp01((N - (T_GREEN + 8)) / 6),
  ];
  const greyK = clamp01((N - (T_GREEN + 2)) / 8);
  const overlapK = softOp(N - (T_PEAK + 14), 10);

  // ---- 楼体 draw-on ----
  const aptP = EOC(clamp01((N - T_APT) / 16));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1568, x: 640, y: 360, s: 1}, {f: 1601, x: 640, y: 455, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ===== 公寓剖面（缩微前居中，1466 起上移缩小） ===== */}
        <div style={{...abs(0, 0, 1280, 720), transform: `translate(0px, ${(-126 * kMini).toFixed(1)}px) scale(${(1 - 0.58 * kMini).toFixed(4)})`, transformOrigin: '640px 360px'}}>
          {/* 线框 draw-on：外框 + 两道楼板 + 地面短线 */}
          <Svg>
            <rect x={BLD.x0} y={BLD.y0} width={BLD.x1 - BLD.x0} height={BLD.y1 - BLD.y0} fill="none" stroke={WHITE} strokeWidth={3}
              pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - aptP)} />
            {BLD.floors.map((fy, i) => {
              const p = clamp01((N - (T_APT + 5 + i * 3)) / 10);
              if (p <= 0) return null;
              return <line key={i} x1={BLD.x0 + 2} y1={fy} x2={BLD.x1 - 2} y2={fy} stroke={GREY_LINE} strokeWidth={2.2}
                pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)} />;
            })}
            {aptP > 0.5 ? <line x1={BLD.x0 - 46} y1={BLD.y1 + 4} x2={BLD.x1 + 46} y2={BLD.y1 + 4} stroke={GREY_LINE} strokeWidth={2} opacity={(0.7 * clamp01((N - (T_APT + 8)) / 8)).toFixed(3)} /> : null}
          </Svg>

          {/* 三户：路由器 + 侧标 + 发声弧 */}
          {HOMES.map((h, i) => {
            const n = N - h.f0;
            const sc = 0.3 + 0.7 * EOC(clamp01(n / 10));
            return (
              <React.Fragment key={`home-${i}`}>
                {n >= 0 ? (
                  <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6) * (1 - clamp01((N - T_BAND) / 8)), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${h.cx}px ${h.cy}px`}}>
                    <RouterGlyph cx={h.cx} cy={h.cy} s={0.58} N={N} ledColor={i === 2 ? '#A175F1' : '#8FF740'} ledK={0.35 + 0.65 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 21 + i))} />
                  </div>
                ) : null}
                <AirPulse cx={h.cx} cy={h.cy - 44} N={N} f0={T_CROWD} rot={h.rot} span={118} waves={3} speed={26}
                  maxR={h.maxR} color={i === 2 ? '#A175F1' : WHITE} sw={2.2} opacity={softOp(N - T_CROWD, 6)} dim={0.15} />
                <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (h.f0 + 2), 8) * (1 - clamp01((N - T_BAND) / 8))}}>
                  <CText cx={h.lx} cy={h.ly} size={22} weight={600} color={GREY} letterSpacing={0.5}>{h.label}</CText>
                </div>
              </React.Fragment>
            );
          })}

          {/* 弧交叠处毛糙闪（橙） */}
          <Svg bloom={false}>
            {FLASH.map((f, j) => {
              const op = flashOp(j);
              if (op <= 0.01) return null;
              return (
                <g key={`fl-${j}`} stroke={ORANGE} strokeWidth={2} strokeLinecap="round" opacity={op.toFixed(3)}>
                  {[0, 1, 2, 3, 4].map((k) => {
                    const a = (k / 5) * Math.PI * 2 + 0.6 * j;
                    return <line key={k} x1={f.x + Math.cos(a) * 4} y1={f.y + Math.sin(a) * 4} x2={f.x + Math.cos(a) * (11 + 3 * ((j + k) % 3))} y2={f.y + Math.sin(a) * (11 + 3 * ((j + k) % 3))} />;
                  })}
                </g>
              );
            })}
          </Svg>
        </div>

        {/* ===== ChannelBand（1468 起 slideUp） ===== */}
        <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - (T_BAND + 2), 8), transform: `translateY(${(150 * Math.pow(1 - clamp01((N - (T_BAND + 2)) / 16), 2.2)).toFixed(1)}px)`}}>
          <ChannelBand cx={BAND.cx} baseY={BAND.baseY} s={BAND.s} peakP={peakP} greenP={greenP}
            greyK={greyK} overlapK={overlapK} labelOp={softOp(N - (T_BAND + 8), 8)}
            breathK={0} N={N} glowK={gk} />
        </div>

        {/* crowded（1415–1566，推近前淡出） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_CROWD, 8) * (1 - clamp01((N - 1552) / 14))}}>
          <CText cx={640} cy={150} size={34} weight={800} color={ORANGE} letterSpacing={1.5}
            shadow={`0 0 18px rgba(240,95,65,${(0.4 * gk).toFixed(2)}), 0 0 4px rgba(255,255,255,.3)`}>{WEXAMPLE.crowded}</CText>
        </div>

        {/* only three don't overlap（1531+2） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (T_PEAK + 2), 8)}}>
          <CText cx={640} cy={585} size={28} weight={600} color={GREY} letterSpacing={0.5}>{WEXAMPLE.onlyThree}</CText>
        </div>

        {/* 章首承接：SC06 礼貌卡缩微（左下角，1396–1412 淡出） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: firstOp(N - F0, 6) * (1 - clamp01((N - T_MINIOUT) / 16))}}>
          <MannersMini cx={185} cy={555} N={N} />
        </div>
      </div>
    </CameraRig>
  );
};
