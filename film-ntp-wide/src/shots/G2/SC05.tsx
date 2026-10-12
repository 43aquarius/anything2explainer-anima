import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, powOutRemain} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  AtomClock, CText, TechText, GREY, GREY_MID, PURPLE_LIGHT, WHITE,
  abs, SoftIn, softOp, firstOp, exitOp, glowOffK, scaleIn, Svg,
} from '../../ui';

/**
 * SC05 谁有准时间 · N 971–1172（第 2 章首镜）
 *   S09：999「So who has the right time?」
 *   S10：1048「Atomic clocks do —」/ 1089「the world's best,」/ 1125「run by national labs.」（块起 1048/1089/1125）
 * 版式：章首承接 = SC04 大字对比缩微左下角（nuisance 划除 vs contradiction，灰阶化）；
 *   中央 AtomClock 大立柜（217×240，N 驱动核心脉冲 + 读数末位翻动）+ 三根轨道描亮 draw-on + 紫光斑；
 *   `stratum 0` 紫标签 + `national labs` 灰字在钟下；两枚小 AtomClock（`lab A` / `lab B`）+ 各自轨道电子点。
 * 动效：971 缩微承接首帧即有（firstOp，1.25→1 收缩落定）；999 问句灰字 SoftIn 居中 + 钟面布暗起（鬼影 0→0.13）；
 *   1048 大钟缩入 18f + 问句上移让位（y355→152，16f，调暗 0.78）+ 轨道描亮三根错峰（1052/57/62，14f）；
 *   1089 `stratum 0` / `national labs` SoftIn；1121 两枚小钟轻落（10f 缩入，拍 1125 前挂 −4）+ 1133 起轨道电子点（持续，低幅）。
 * 运镜：1.0→1.06 慢推（971–1122，末 key = TO−50 ✓）。停留：段内不判（S10 末块 45）。末 5 帧归零、光先灭。
 * glitch：本镜零 glitch（白名单）。所有文本取自分镜表「事实清单」SC05 行。
 */
const F0 = 971;
const TO = 1172;
const T_Q = 999, T_CLOCK = 1048, T_LABELS = 1089, T_SMALL = 1121, T_ELEC = 1133;

const CLOCK = {cx: 640, cy: 350, w: 217, h: 240};          // 主大钟（190×210 视口等比 ×1.143）
const SMALL = [
  {cx: 355, cy: 425, label: 'lab A', dir: 1},
  {cx: 925, cy: 425, label: 'lab B', dir: -1},
]; // 小钟 96×106（×0.505）
// 轨道描亮（与 stock 椭圆同几何：中心 (95,118)→世界 (640,364.9)，rx54 ry20 ×1.143）
const ORB = {cx: 640, cy: 364.9, rx: 61.7, ry: 22.9};
const ORB_PERIM = 281; // Ramanujan 近似周长
// SC04 缩微承接（左下角）
const MINI = {cx: 225, cy: 592};

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 问句：999 居中 → 1048 上移让位（16f）+ 调暗
  const qN = N - T_Q;
  const qMove = easeInOutPow(2)(clamp01((N - T_CLOCK) / 16));
  const qy = 355 + (152 - 355) * qMove;
  const qOp = (qN < 0 ? 0 : softOp(qN, 8)) * (1 - 0.22 * qMove);

  // 鬼影钟（999–1047 面布暗起 0→0.13，之后由正式钟接管）
  const ghostOp = N < T_CLOCK ? 0.13 * clamp01((N - T_Q) / 46) : 0;

  // 主大钟：1048 缩入 18f（0.85→1，与鬼影同位无缝）
  const ckIn = scaleIn(N - T_CLOCK, 18);
  const ckS = 0.85 + 0.15 * ckIn;
  const ckOp = N < T_CLOCK ? 0 : softOp(N - T_CLOCK, 6);

  // 轨道描亮（draw-on 三根错峰 → 1120 起淡出）
  const traceOp = N < 1120 ? 1 : 1 - clamp01((N - 1120) / 10);
  const ellipseP = (i: number) => easeOutCubic(clamp01((N - (1052 + i * 5)) / 14));

  // 小钟：1121 起 2f 错峰轻落（0.94→1 + 淡入）；读数位黑衬（6.6px 字糊化 → 遮掉）
  const smallClock = (i: number) => {
    const st = T_SMALL + i * 2;
    const s = 0.94 + 0.06 * scaleIn(N - st, 10);
    const op = N < st ? 0 : softOp(N - st, 10) * 0.92;
    return {s, op};
  };

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1122, x: 640, y: 360, s: 1.06}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 章首承接：SC04 大字对比缩微（nuisance 划除 vs contradiction），1.25→1 收缩落定 */}
        <div style={{
          ...abs(0, 0, 1280, 720), opacity: firstOp(N - F0, 6) * 0.5,
          transformOrigin: `${MINI.cx}px ${MINI.cy}px`,
          transform: `scale(${(1 + 0.25 * powOutRemain(N - F0, 10, 2.5)).toFixed(4)})`,
        }}>
          <CText cx={MINI.cx - 82} cy={MINI.cy} size={22} weight={600} color={GREY_MID}
            style={{textDecoration: 'line-through', textDecorationThickness: 2}}>nuisance</CText>
          <CText cx={MINI.cx + 78} cy={MINI.cy} size={22} weight={700} color={GREY}
            style={{WebkitTextStroke: '0.8px rgba(161,117,241,0.55)', paintOrder: 'stroke fill'}}>contradiction</CText>
        </div>

        {/* 中央问句（999 SoftIn 居中 → 1048 上移让位） */}
        {qOp > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: qOp, transform: `translateY(${(qy - 355).toFixed(1)}px)`}}>
            <CText cx={640} cy={qy} size={34} weight={600} color={GREY} letterSpacing={0.5}>who has the right time?</CText>
          </div>
        ) : null}

        {/* 钟面布暗起（鬼影）→ 1048 正式缩入 */}
        {ghostOp > 0.005 ? (
          <AtomClock cx={CLOCK.cx} cy={CLOCK.cy} w={CLOCK.w} h={CLOCK.h} N={N} opacity={ghostOp} />
        ) : null}
        {ckOp > 0.02 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: ckOp}}>
            <GlowBlob cx={CLOCK.cx} cy={CLOCK.cy + 10} r={195} N={N} k={softOp(N - T_CLOCK, 10) * gk} />
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${ckS.toFixed(4)})`, transformOrigin: `${CLOCK.cx}px ${CLOCK.cy}px`}}>
              <AtomClock cx={CLOCK.cx} cy={CLOCK.cy} w={CLOCK.w} h={CLOCK.h} N={N} glow={N < TO - 8} />
            </div>
            {/* 轨道描亮（三根错峰 draw-on，与 stock 椭圆同几何） */}
            {traceOp > 0.02 ? (
              <Svg style={{opacity: traceOp * gk}}>
                {[0, 60, -60].map((deg, i) => (
                  <ellipse key={deg} cx={ORB.cx} cy={ORB.cy} rx={ORB.rx} ry={ORB.ry}
                    transform={`rotate(${deg} ${ORB.cx} ${ORB.cy})`}
                    fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.8}
                    strokeDasharray={ORB_PERIM} strokeDashoffset={ORB_PERIM * (1 - ellipseP(i))}
                    opacity={0.95} />
                ))}
              </Svg>
            ) : null}
          </div>
        ) : null}

        {/* stratum 0 紫标签 + national labs 灰字（1089） */}
        <SoftIn N={N} f0={T_LABELS} style={{opacity: exit}}>
          <TechText cx={640} cy={505} text="stratum 0" fontSize={28} opacity={gk} />
        </SoftIn>
        <SoftIn N={N} f0={T_LABELS + 2} style={{opacity: exit}}>
          <CText cx={640} cy={548} size={28} weight={600} color={GREY}>national labs</CText>
        </SoftIn>

        {/* 两枚小钟（lab A / lab B）+ 轨道电子点（1133 起，低幅持续） */}
        {SMALL.map((sc, i) => {
          const {s, op} = smallClock(i);
          if (op <= 0.02) return null;
          const coreY = sc.cy + 6.6; // 视口 (95,118) 核心点 → 世界偏移
          const ang = (N / 80) * Math.PI * 2 * sc.dir + i * Math.PI;
          const ex = sc.cx + 17 * Math.cos(ang), ey = coreY + 17 * Math.sin(ang);
          const elecOp = N >= T_ELEC ? 0.85 * gk : 0;
          return (
            <div key={sc.label} style={{...abs(0, 0, 1280, 720), opacity: op}}>
              <div style={{...abs(0, 0, 1280, 720), transform: `scale(${s.toFixed(4)})`, transformOrigin: `${sc.cx}px ${sc.cy}px`}}>
                <AtomClock cx={sc.cx} cy={sc.cy} w={96} h={106} N={N} small label={sc.label} labelSize={22} opacity={0.9} />
                {/* 读数黑衬（96px 宽下 6.6px 读数会糊成一抹 → 遮掉） */}
                <div style={{...abs(sc.cx - 22, sc.cy - 53 + 85, 44, 10), background: '#000'}} />
              </div>
              {elecOp > 0.03 ? (
                <div style={{...abs(ex - 3, ey - 3, 6, 6), borderRadius: '50%', background: PURPLE_LIGHT, opacity: elecOp,
                  boxShadow: `0 0 6px rgba(161,117,241,${(0.7 * gk).toFixed(2)})`}} />
              ) : null}
            </div>
          );
        })}
      </div>
    </CameraRig>
  );
};
