import React from 'react';
import {useCurrentFrame} from 'remotion';
import {kf, easeInOutPow, clamp01} from '../../common';
import {CText, Svg, PURPLE_LIGHT, WHITE, GREY, GLOW_PURPLE_S, exitOp, glowOffK, softOp} from '../../ui';
import {DIAG, ZipDiagramFinal, Magnifier, FileEntryBlock} from './g4ui';

/**
 * SC18 随机访问（2658–2720，S18）
 * 承接 SC17 结构图：kf 16 帧缩到 0.55× 移到上方（同 DIAG 几何；SC17 已归零 → firstOp 6f 淡入，¶ 停顿后"召回"）。
 * 节拍：2666 结论字 random access（Noto 900 56px 白+紫描边）→ 2680 放大镜入位 block1 →
 * 2688 捞出 AndroidManifest.xml 块（1.35×、紫边高亮、原位虚线槽；其余不动）→ 2700 放回。
 * 停留：段内不判。主角：结论字+取块演示；光：取出块紫光 + 大字紫晕。
 */
export const F0 = 2658;
const B_TEXT = 2666, B_MAG = 2680, B_LIFT = 2688, B_BACK = 2700, TO = 2720, EXIT_LEN = 8;
const MONO = "'SF Mono', Menlo, Consolas, monospace";
const DM = {cx: 640, cy: 250, scale: 0.55};
const BLK = DIAG.blocks[0]; // 捞出的 block1（= AndroidManifest.xml）
// 0.55× 后 block1 的屏幕中心（DIAG.center 基准）
const B1X = DM.cx + (BLK.x + BLK.w / 2 - DIAG.center.x) * DM.scale;
const B1Y = DM.cy + (BLK.y + BLK.h / 2 - DIAG.center.y) * DM.scale;
// 展示位
const SHOW = {x: 560, y: 308, s: 1.35};

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  // 承接缩位移（16 帧 easeInOutPow 2.5）
  const e = easeInOutPow(2.5);
  const cx = kf(N, [[2658, 640], [2674, DM.cx]], e);
  const cy = kf(N, [[2658, DIAG.center.y], [2674, DM.cy]], e);
  const sc = kf(N, [[2658, 1], [2674, DM.scale]], e);
  const dmOp = softOp(N - 2658, 6);

  // 结论字紫晕呼吸（先灭光）
  const gk = glowOffK(N, TO, 6, EXIT_LEN);
  const glow = 8 + 5 * Math.sin((N / 30) * Math.PI * 2);

  // 捞出/放回：t 0→1→0；块从图内位（0.55×）到展示位（1.35×）
  const liftT = easeInOutPow(2.5)(clamp01((N - B_LIFT) / 10));
  const backT = easeInOutPow(2.5)(clamp01((N - B_BACK) / 10));
  const t = liftT * (1 - backT);
  const lbx = B1X + (SHOW.x - B1X) * t;
  const lby = B1Y + (SHOW.y - B1Y) * t;
  const lbs = DM.scale + (SHOW.s - DM.scale) * t;
  const slotOp = clamp01((t - 0.15) / 0.25); // 原位虚线槽（块离开后才见）

  // 放大镜：右上入位 → 跟随块
  const magX = N >= B_LIFT ? lbx : kf(N, [[B_MAG, 880], [B_LIFT, B1X]], e);
  const magY = N >= B_LIFT ? lby - 6 : kf(N, [[B_MAG, 140], [B_LIFT, B1Y - 6]], e);
  // 标签（捞出落定后出现，放回时淡出）
  const labOp = softOp(N - (B_LIFT + 7), 6) * (1 - clamp01((N - (B_BACK + 2)) / 8));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 上方：承接缩微结构图（终态 + 巡行点持续动作；捞出期间隐藏 block1，由紫边高亮副本代替） */}
      <ZipDiagramFinal N={N} cx={cx} cy={cy} scale={sc} opacity={dmOp} dotFrom={2674} hideFirst={N >= B_LIFT} />

      {/* 捞出的 block1：紫边高亮 + 紫光（覆盖在缩微图之上） */}
      {N >= B_LIFT ? (
        <div
          style={{
            position: 'absolute',
            left: lbx - (BLK.w * lbs) / 2,
            top: lby - (BLK.h * lbs) / 2,
            width: BLK.w,
            height: BLK.h,
            transform: `scale(${lbs.toFixed(4)})`,
            transformOrigin: '50% 50%',
          }}
        >
          <div style={{position: 'absolute', inset: -4, borderRadius: 10, boxShadow: GLOW_PURPLE_S}} />
          <FileEntryBlock x={0} y={0} w={BLK.w} h={BLK.h} stroke={PURPLE_LIGHT} />
        </div>
      ) : null}
      {/* 原位虚线槽 */}
      {slotOp > 0 ? (
        <Svg bloom={false}>
          <rect x={B1X - (BLK.w * DM.scale) / 2} y={B1Y - (BLK.h * DM.scale) / 2} width={BLK.w * DM.scale} height={BLK.h * DM.scale} rx={4} fill="none" stroke={GREY} strokeWidth={1.2} strokeDasharray="5 5" opacity={slotOp * 0.85} />
        </Svg>
      ) : null}

      {/* 放大镜 */}
      {N >= B_MAG ? <Magnifier cx={magX} cy={magY} r={42} opacity={softOp(N - B_MAG, 6)} /> : null}

      {/* 结论字 */}
      {N >= B_TEXT ? (
        <CText
          cx={640}
          cy={412}
          size={56}
          weight={900}
          color={WHITE}
          letterSpacing={1}
          opacity={softOp(N - B_TEXT, 8)}
          style={{
            WebkitTextStroke: `2.5px rgba(161,117,241,${(0.95 * gk).toFixed(3)})`,
            paintOrder: 'stroke fill',
            textShadow: `0 0 ${(glow * gk).toFixed(1)}px rgba(102,48,248,.5)`,
          }}
        >
          random access
        </CText>
      ) : null}

      {/* 被捞出块的标签 */}
      {labOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: labOp}}>
          <CText cx={810} cy={308} size={22} weight={600} family={MONO} color={WHITE}>AndroidManifest.xml</CText>
          <Svg bloom={false}>
            <line x1={SHOW.x + (BLK.w * SHOW.s) / 2 + 4} y1={308} x2={682} y2={308} stroke={GREY} strokeWidth={1.4} />
          </Svg>
        </div>
      ) : null}
    </div>
  );
};

export default SC18;
