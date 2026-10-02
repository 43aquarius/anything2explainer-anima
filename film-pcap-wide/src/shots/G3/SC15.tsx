import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, emphasisPulse} from '../../common';
import {CText, Pill, PacketIcon, SwitchBox, TechText, PURPLE_LIGHT, GREY, WHITE, exitOp, softOp, SoftIn, glowOffK, scaleIn, abs} from '../../ui';
import {HeroGlow} from '../../fx';
import {StationCircle, AnalyzerScreen} from './g3ui';

/**
 * SC15 立足点②：镜像口 · N 2957–3113（S18 2965–3111：2965「共享交换机」/ 3002「端口镜像」/ 3075「监控口」）
 * 版式：中央 SwitchBox 560×140 @ (640,330)（6 端口、2 口灯闪 = N 驱动；HeroGlow 主角光）；
 *   电脑↔服务器流量走两条水平道（上道 y300 右行 / 下道 y360 左行，穿机身后面，2.8px/帧持续）；
 *   3002 紫色虚线弧自交换机右侧业务口弯到右下 `monitor port` Pill（弧 = 本镜重点光 GLOW_PURPLE_S）；
 *   副本信封（半透明紫）每 36 帧沿弧飞到分析器小屏；3075 分析器 + 计数 +1 + `port mirroring · SPAN` 灰小字。
 * 左上角 ② 站位角标。停留：段内不判（S18 非 ¶）。末 8 帧整组归零。
 */
const F0 = 2957;
const TO = 3113;
const T_BADGE = 2957, T_SW = 2957, T_ARC = 3002, T_PORT = 3002, T_AN = 3070, T_TXT = 3075;
const SW = {cx: 640, cy: 330, w: 560, h: 140};
const ARCP = {x0: 848, y0: 325, c1: [960, 325], c2: [1005, 370], x1: 1005, y1: 492}; // 贝塞尔弧（终点 = 分析器屏顶）
const PORT_PILL = {cx: 1005, cy: 448};
const AN = {cx: 1005, cy: 545};
const COPY_DEP = [3022, 3058, 3094]; // 副本信封出发帧（36 帧一枚）

/** 三次贝塞尔求点 */
const bez = (t: number, p0: number, p1: number, p2: number, p3: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6, 8);

  // 交换机 slideUp Δ90 / 22 帧
  const sn = N - T_SW;
  const swOp = sn < 0 ? 0 : softOp(sn, 10);
  const swY = SW.cy + (sn < 0 ? 90 : 90 * Math.pow(1 - clamp01(sn / 22), 2.5));

  // 业务流量双向道（2.8px/帧）
  const laneEnv = (i: number, dir: 1 | -1) => {
    const f = N - T_SW - (dir === 1 ? 1 : 3);
    if (f < i * 7) return null;
    const x = dir === 1 ? 100 + ((f * 2.8 + i * 180) % 1080) : 1180 - ((f * 2.8 + i * 180) % 1080);
    const edge = Math.min(1, (x - 100) / 40, (1180 - x) / 40);
    return {x, op: Math.max(0, edge)};
  };

  // 弧 draw-on（20 帧）+ 副本信封（kf 18 帧/枚）
  const arcP = clamp01((N - T_ARC) / 20);
  const easeArc = easeInOutPow(2.2);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 主角光（HeroGlow，呼吸） */}
      <HeroGlow x={SW.cx - SW.w / 2 + 8} y={SW.cy - SW.h / 2 + 8} w={SW.w - 16} h={SW.h - 16} r={14} N={N} k={glowK} />

      {/* 业务流量（先画，被交换机盖住中段 = 流过端口） */}
      {[0, 1, 2].map((i) => {
        const e = laneEnv(i, 1);
        return e && e.op > 0.02 ? <PacketIcon key={`r${i}`} cx={e.x} cy={300} w={56} h={38} opacity={e.op * 0.95} /> : null;
      })}
      {[0, 1, 2].map((i) => {
        const e = laneEnv(i, -1);
        return e && e.op > 0.02 ? <PacketIcon key={`l${i}`} cx={e.x} cy={360} w={56} h={38} opacity={e.op * 0.95} /> : null;
      })}

      {/* 交换机（主角） */}
      {swOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: swOp}}>
          <SwitchBox cx={SW.cx} cy={swY} w={SW.w} h={SW.h} ports={6} lit={2} N={N} label="shared switch" labelSize={24} />
        </div>
      ) : null}

      {/* 紫色虚线弧（draw-on：自左向右 clip 展开，重点光） */}
      {arcP > 0 ? (
        <div style={{...abs(0, 0), clipPath: `inset(-12% ${(100 - (64 + 15 * easeOutCubic(arcP))).toFixed(2)}% -12% 0)`}}>
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
            <path
              d={`M${ARCP.x0},${ARCP.y0} C${ARCP.c1[0]},${ARCP.c1[1]} ${ARCP.c2[0]},${ARCP.c2[1]} ${ARCP.x1},${ARCP.y1}`}
              fill="none"
              stroke={PURPLE_LIGHT}
              strokeWidth={3}
              strokeDasharray="9 7"
              opacity={0.95 * glowK}
              style={glowK > 0.05 ? {filter: 'drop-shadow(0 0 8px rgba(102,45,248,.75))'} : undefined}
            />
          </svg>
        </div>
      ) : null}

      {/* 副本信封（沿弧 kf 18 帧 → 落分析器） */}
      {COPY_DEP.map((dep, k) => {
        const t = (N - dep) / 18;
        if (t <= 0 || t >= 1) return null;
        const e = easeArc(clamp01(t));
        const x = bez(e, ARCP.x0, ARCP.c1[0], ARCP.c2[0], ARCP.x1);
        const y = bez(e, ARCP.y0, ARCP.c1[1], ARCP.c2[1], ARCP.y1);
        const op = Math.min(1, t / 0.2, (1 - t) / 0.2) * 0.85;
        return <PacketIcon key={k} cx={x} cy={y} w={52} h={36} accent opacity={op} />;
      })}

      {/* monitor port Pill */}
      <SoftIn N={N} f0={T_PORT}>
        <Pill x={PORT_PILL.cx - 110} y={PORT_PILL.cy - 21} w={220} h={42} sw={2.5} stroke={PURPLE_LIGHT} text="monitor port" fontSize={24} weight={700} color={WHITE} />
      </SoftIn>

      {/* 分析器小屏（缩放入场 21 帧）+ 计数 */}
      {N >= T_AN ? (
        <AnalyzerScreen
          cx={AN.cx}
          cy={AN.cy}
          w={240}
          h={105}
          count={COPY_DEP.filter((d) => N >= d + 18).length}
          op={softOp(N - T_AN, 10)}
          scale={scaleIn(N - T_AN, 21)}
          pulse={emphasisPulse(N - Math.max(0, ...COPY_DEP.filter((d) => N >= d + 18).map((d) => d + 18)), {peak: 1.12, up: 6, hold: 3, down: 10})}
          label="copies"
        />
      ) : null}

      {/* port mirroring · SPAN */}
      <SoftIn N={N} f0={T_TXT}>
        <TechText cx={560} cy={545} text={'port mirroring \u00b7 SPAN'} fontSize={26} color={GREY} glow={false} letterSpacing={1} />
      </SoftIn>

      {/* 左上角 ② 站位角标 */}
      <SoftIn N={N} f0={T_BADGE}>
        <StationCircle cx={108} cy={158} r={30} lit digit="2" digitSize={40} />
      </SoftIn>
    </div>
  );
};
