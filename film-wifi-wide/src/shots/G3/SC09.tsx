import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {Cross, CText, GREY, RED_DEEP, WHITE, abs, softOp, Svg} from '../../ui';
import {DeviceGlyph, NoiseFlower, quadPt, RouterGlyph, STAGE, WallGlyph, WEXAMPLE} from './shared';

/**
 * SC09 隐藏节点 · N 1794–1993 · 高光时刻·事件型（本片三大高光之一）。⚠ 本镜不离场——版面直接承接进 SC10（缩微左移），
 * motion_check hold 标 ~ 不判；末帧状态与 SC10 首帧逐元素对齐（几何取自 shared.tsx STAGE）。
 * 节拍（timeline.md 实测块界；分镜表 SC09 节拍列是旧集，已对齐，见 BUILD_NOTES）：
 *   1794 墙体 draw-on（S16「a trickier trap」收尾，陷阱舞台登场）/ 1802 `a trickier trap` 灰字 + 两设备缩入
 *   （S17a「two devices that can't hear each other,」）/ 1818 设备间直弧尝试 → 撞墙红 Cross + 弧断
 *   / 1863 左右到路由器的两条弧先后 draw-on（S17b「but both can reach the router.」）
 *   / 1921 两弧同时连发（S18a「Both talk at once —」：弧增亮 + 脉冲点连发，末对齐射 1946→1960 撞点）
 *   / 1960 路由器处噪声花爆开 + LED 红 ×3 闪 + `neither is heard` GlitchIn（rgbSplit 4，白名单，本镜唯一）
 *   + 两设备 `?` + 弧熄暗（S18b「and neither is heard.」）。
 * 运镜：1910–1943 33f 1→1.12 推向舞台中部（分镜表 1.18 因内容界压缩至 1.12，见 BUILD_NOTES；相机末 key 1943 = TO−50）。
 * 高光事件窗：1910–1993（84f）+ 红灯红字态延续进 SC10 至回应拍转绿（>200f 的因果跨度）。
 */
const F0 = 1794;
const TO = 1993;

const T_WALL = 1794;   // 墙 draw-on 12f
const T_TRAP = 1802;   // a trickier trap 灰字
const T_DEV = 1804;    // 两设备 2f 错峰缩入（12f）
const T_XARC = 1818;   // 直弧尝试 12f → 撞墙
const T_CROSS = 1830;  // 红 Cross 10f + 弧断（回缩）
const T_RARC = 1863;   // 左右→路由器弧先后 draw-on（14f / 8f 错峰）
const T_FIRE = 1921;   // 齐射：弧增亮 + 脉冲点（1921/1933/1946 三波，末波 14f 飞行 1960 到点）
const T_HIT = 1960;    // 噪声花 + LED 红 ×3 + neither is heard GlitchIn + ? 标
const T_Q = 1972;      // 两设备 ? 标

const EOC = easeOutCubic;

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---- 墙 / 直弧 ----
  const wallP = EOC(clamp01((N - T_WALL) / 12));
  const xarcP0 = EOC(clamp01((N - T_XARC) / 12));                 // 生长
  const xarcBreak = clamp01((N - (T_CROSS + 4)) / 10);            // 断弧回缩
  const xarcP = xarcP0 * (1 - 0.62 * xarcBreak);
  const xarcOp = 0.9 * (1 - 0.6 * xarcBreak);
  const crossP = clamp01((N - T_CROSS) / 10);

  // ---- 通往路由器的两条弧 ----
  const rarcP = (side: 0 | 1) => EOC(clamp01((N - (T_RARC + side * 8)) / 14));
  const hitK = clamp01((N - T_HIT) / 8);                           // 撞后：弧熄暗
  const fireUp = clamp01((N - T_FIRE) / 8) * (1 - hitK);           // 齐射：弧增亮
  const arcW = 3 + 1.6 * fireUp;
  const arcOp = (0.8 + 0.2 * fireUp) * (1 - 0.72 * hitK);
  const arcGlow = (0.3 + 0.55 * fireUp) * (1 - hitK);

  // ---- 脉冲点（齐射三波；末波 1946 起 14f 飞行，1960 同时到点） ----
  const dotPos = (side: 0 | 1, k: number): [number, number] | null => {
    const t0 = [1921, 1933, 1946][k];
    if (N < t0) return null;
    const u = clamp01((N - t0) / 14);
    if (u >= 1) return null;
    const A = side === 0 ? STAGE.arcL : STAGE.arcR;
    const u2 = u * u * (3 - 2 * u) * 0.94 + 0.03;
    return quadPt(u2, A.p0, A.c, A.p1);
  };

  // ---- LED：绿呼吸 → 红三闪 → 红稳态低幅 ----
  const ledRed = N >= T_HIT;
  const blink = (t: number) => (N >= t && N < t + 5 ? 1 : 0);
  const ledK = ledRed
    ? Math.max(blink(T_HIT), blink(T_HIT + 8), blink(T_HIT + 16), N >= T_HIT + 24 ? 0.62 + 0.22 * Math.sin((2 * Math.PI * N) / 13) : 0)
    : 0.55 + 0.3 * Math.sin((2 * Math.PI * N) / 23);

  // ---- 路由器撞后微震（10f 衰减） ----
  const jq = N >= T_HIT ? Math.sin((N - T_HIT) * 1.35) * (2.6 * Math.exp(-(N - T_HIT) / 6)) : 0;

  // ---- 设备状态 ----
  const devIn = (side: 0 | 1) => {
    const n = N - (T_DEV + side * 2);
    return {n, sc: 0.3 + 0.7 * EOC(clamp01(n / 12))};
  };
  const speaking = (N >= T_FIRE && N < T_HIT + 6) ? 1 : 0;
  const devDim = N >= T_HIT + 6 ? 0.35 : 0;
  const qOp = softOp(N - T_Q, 8);

  // ---- 噪声花 / 红晕 ----
  const emberK = clamp01((N - (T_HIT + 26)) / 12);
  const tintOp = N >= T_HIT ? 0.16 * Math.pow(1 - clamp01((N - T_HIT) / 22), 1.5) : 0;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1910, x: 640, y: 360, s: 1}, {f: 1943, x: 640, y: 320, s: 1.12}]}>
      <div style={{...abs(0, 0, 1280, 720)}}>
        {/* 撞点红晕一拍 */}
        {tintOp > 0.005 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: tintOp.toFixed(3), background: 'radial-gradient(ellipse 760px 480px at 50% 34%, rgba(236,8,31,0) 45%, rgba(236,8,31,0.55) 100%)'}} />
        ) : null}

        {/* ===== 舞台 ===== */}
        {/* 墙体（12f draw-on） */}
        <WallGlyph x0={STAGE.wall.x0} x1={STAGE.wall.x1} y0={STAGE.wall.y0} y1={STAGE.wall.y1} p={wallP} hatchOp={clamp01((N - (T_WALL + 6)) / 8)} />

        {/* 路由器（撞后微震；LED 绿→红） */}
        <div style={{...abs(0, 0, 1280, 720), transform: `translateY(${jq.toFixed(2)}px)`}}>
          <RouterGlyph cx={STAGE.router.cx} cy={STAGE.router.cy} s={1.15} N={N}
            ledColor={ledRed ? RED_DEEP : '#8FF740'} ledK={ledK} glow label={WEXAMPLE.router} labelSize={24} />
        </div>

        {/* 两设备（2f 错峰缩入；撞后 dim + ?） */}
        {([0, 1] as const).map((side) => {
          const {n, sc} = devIn(side);
          if (n < 0) return null;
          const D = side === 0 ? STAGE.devL : STAGE.devR;
          return (
            <div key={`dev-${side}`} style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${D.cx}px ${D.cy}px`}}>
              <DeviceGlyph cx={D.cx} cy={D.cy} kind={D.kind} s={1} N={N} speaking={speaking} dim={devDim} label={D.label} labelSize={24} />
            </div>
          );
        })}

        {/* 弧（直连尝试 / 通往路由器 ×2） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <defs>
            <filter id="g3s9-arc" colorInterpolationFilters="sRGB">
              <feDropShadow dx={0} dy={0} stdDeviation={0.9} floodColor="#ffffff" floodOpacity={arcGlow.toFixed(3)} />
            </filter>
          </defs>
          {/* 直连尝试（被墙截断；Cross 后回缩成残段） */}
          {xarcP > 0.001 ? (
            <path d={`M${STAGE.xarc.p0[0]},${STAGE.xarc.p0[1]} Q${STAGE.xarc.c[0]},${STAGE.xarc.c[1]} ${STAGE.xarc.p1[0]},${STAGE.xarc.p1[1]}`}
              fill="none" stroke={GREY} strokeWidth={2.6} strokeLinecap="round" opacity={xarcOp.toFixed(3)}
              pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - xarcP)} />
          ) : null}
          {/* 通往路由器（先后 draw-on → 齐射增亮 → 撞后熄暗） */}
          {([0, 1] as const).map((side) => {
            const p = rarcP(side);
            if (p <= 0.001) return null;
            const A = side === 0 ? STAGE.arcL : STAGE.arcR;
            return (
              <path key={`rarc-${side}`} d={`M${A.p0[0]},${A.p0[1]} Q${A.c[0]},${A.c[1]} ${A.p1[0]},${A.p1[1]}`}
                fill="none" stroke={WHITE} strokeWidth={arcW.toFixed(2)} strokeLinecap="round" opacity={arcOp.toFixed(3)}
                pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - p)}
                filter={arcGlow > 0.05 ? 'url(#g3s9-arc)' : undefined} />
            );
          })}
          {/* 齐射脉冲点（白，末波同时到点） */}
          {([0, 1] as const).map((side) => [0, 1, 2].map((k) => {
            const d = dotPos(side, k);
            if (!d) return null;
            return <circle key={`dot-${side}-${k}`} cx={d[0].toFixed(1)} cy={d[1].toFixed(1)} r={4.5} fill={WHITE}
              opacity={0.95} filter="drop-shadow(0 0 3px rgba(255,255,255,.7))" />;
          }))}
        </svg>

        {/* 撞墙红 Cross（10f draw-on + 红柔光） */}
        {crossP > 0 ? (
          <Svg>
            <Cross cx={STAGE.cross.cx} cy={STAGE.cross.cy} size={46} sw={8} color={RED_DEEP} p={crossP} opacity={N >= T_HIT ? 0.85 : 1} />
          </Svg>
        ) : null}

        {/* 噪声花（撞点，12f 爆开 + 余烬） */}
        <NoiseFlower cx={STAGE.hit.cx} cy={STAGE.hit.cy} N={N} f0={T_HIT} r0={16} len={54} spikes={16} ember={emberK} />

        {/* 两设备 ?（1972 起，微颤） */}
        {qOp > 0.01 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: qOp}}>
            <CText cx={STAGE.qL.cx} cy={STAGE.qL.cy + 1.5 * Math.sin(N / 2.4)} size={30} weight={700} family={FONT_ORB} color={GREY}>?</CText>
            <CText cx={STAGE.qR.cx} cy={STAGE.qR.cy + 1.5 * Math.sin(N / 2.4 + 2)} size={30} weight={700} family={FONT_ORB} color={GREY}>?</CText>
          </div>
        ) : null}

        {/* a trickier trap（1802，灰） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_TRAP, 8)}}>
          <CText cx={640} cy={STAGE.trapTextY} size={28} weight={600} color={GREY} letterSpacing={0.5}>{WEXAMPLE.trap}</CText>
        </div>

        {/* neither is heard（1960 GlitchIn rgbSplit 4，白名单·本镜唯一） */}
        <GlitchIn N={N} f0={T_HIT} rgbSplit={4} seed={31}>
          <CText cx={640} cy={STAGE.textY} size={46} weight={900} color={RED_DEEP} letterSpacing={1}
            shadow={`0 0 ${Math.round(16 + 5 * Math.sin((2 * Math.PI * N) / 40))}px rgba(236,8,31,.6), 0 0 56px rgba(236,8,31,.35)`}>
            {WEXAMPLE.neitherHeard}
          </CText>
        </GlitchIn>
      </div>
    </CameraRig>
  );
};
