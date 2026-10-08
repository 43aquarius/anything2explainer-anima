import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powIn, GlitchIn, FONT_HEAVY, FONT_MONO} from '../../common';
import {CText, ParcelIcon, Pill, WaxSeal, WHITE, GREY, PURPLE_LIGHT, abs, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {CameraRig, HeroGlow, GlowBlob} from '../../fx';
import {CovArcV} from './g2ui';

/**
 * SC05 ★火漆盖下（G2 组高光·落章型） · N 788–953（S05 796–951：796 你点 Install / 830 查火漆 / 885 整个文件一个签名）
 * 上段：大包裹（cx 360 cy 480 w 340 h 240）+ 大 WaxSeal（r 120，letter v2）自上 powIn 14 帧落到包裹正中
 * （830–844）→ 包裹 1.03 微震 + 白闪 2 帧；885 包裹描边白→紫（12 帧）+ 封印紫光晕 30 帧呼吸（持续）+
 * 覆盖弧 draw-on 兜一圈（24 帧）后虚线巡行（持续）；下段 `wax seal`（GlitchIn rgbSplit 4，本镜唯一 glitch）+
 * 右上 `Android 7.0` Pill + `v2 · one signature`（等宽灰）。
 * 运镜：33 帧 1→1.12 推向封印（789–822，落章/字幕层不受影响）。
 * 主角：火漆+包裹 ~300px；光：封印紫晕（呼吸）+ 包裹 HeroGlow。
 * 停留：段内不判（弧线落位 909 → 离场 945，36 帧，实际仍 ≥30）。
 */
export const F0 = 788;
const TO = 953;
const B_PARCEL = 795, B_PILL = 830, B_SEAL = 830, B_WAXLBL = 831, B_WRAP = 885, B_V2 = 885, B_ARC = 885;
const SEAL_DONE = B_SEAL + 14; // 844 落章
const ARC_DONE = B_ARC + 24; // 909 弧线完成

const PCL = {cx: 360, cy: 480, w: 340, h: 240};
const SEAL = {cx: 360, cy: 480, r: 120, cyStart: 452};

/** 包裹左上角的 APK 角标（ParcelIcon 内置 label 固定 21px，低于竖版 24px 下限 → 组内自绘 24px 版） */
const ApkTag: React.FC<{x: number; y: number; color: string; opacity: number}> = ({x, y, color, opacity}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'rotate(-6deg)', background: '#000', border: `2.5px solid ${color}`, borderRadius: 5, padding: '3px 10px', fontFamily: FONT_HEAVY, fontSize: 24, fontWeight: 700, color, letterSpacing: 1, lineHeight: 1.1, opacity}}>APK</div>
);

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8); // 封印光先灭再整体淡出

  // 包裹：scaleIn 21 帧（795 起，入画即 HeroGlow）
  const pn = N - B_PARCEL;
  const ps = pn < 0 ? 0 : scaleIn(pn, 21);
  // 落章微震（844–857）+ 白闪 2 帧
  const sq = kf(N, [[SEAL_DONE, 1], [SEAL_DONE + 5, 1.03], [SEAL_DONE + 13, 1]]);
  const flash = N >= SEAL_DONE && N < SEAL_DONE + 2 ? 1 - (N - SEAL_DONE) * 0.45 : 0;
  // 火漆自上落下：scale 1.5→1 powIn 14 帧（起点保持在竖版顶界之下：世界 y≥268 → 屏幕 ≥240）
  const sn = N - B_SEAL;
  const fall = powIn(2.2)(clamp01(sn / 14));
  const sealY = SEAL.cyStart + (SEAL.cy - SEAL.cyStart) * fall;
  const sealS = 1.5 - 0.5 * fall;
  const sealOp = sn < 0 ? 0 : softOp(sn, 6);
  // 885：包裹描边白→紫（12 帧渐变）
  const wrapK = clamp01((N - B_WRAP) / 12);
  const pColor = mixHex(WHITE, PURPLE_LIGHT, wrapK);
  // 封印紫光晕：885 起 30 帧呼吸（持续动作）
  const breathe = 0.55 + 0.25 * Math.sin((2 * Math.PI * N) / 30);
  const blobK = clamp01((N - B_WRAP) / 8) * breathe * gk;
  // 覆盖弧：24 帧 draw-on → 虚线巡行（持续动作）
  const arcP = clamp01((N - B_ARC) / 24);
  const march = Math.max(0, N - ARC_DONE);

  return (
    <CameraRig N={N} keys={[{f: F0 + 1, x: 360, y: 480, s: 1}, {f: F0 + 34, x: 360, y: 480, s: 1.12}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 包裹 + 火漆（同一微震/白闪变换组） */}
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${PCL.cx}px ${PCL.cy}px`, transform: `scale(${sq.toFixed(4)})`, filter: flash > 0 ? `brightness(${(1 + 0.55 * flash).toFixed(3)})` : undefined}}>
          {ps > 0 ? (
            <div style={{...abs(PCL.cx - (PCL.w * ps) / 2, PCL.cy - (PCL.h * ps) / 2, PCL.w * ps, PCL.h * ps)}}>
              <HeroGlow x={0} y={0} w={PCL.w * ps} h={PCL.h * ps} r={16} N={N} k={clamp01(ps) * gk} />
              <ParcelIcon cx={(PCL.w * ps) / 2} cy={(PCL.h * ps) / 2} w={PCL.w} h={PCL.h} scale={ps} color={pColor} label={''} />
            </div>
          ) : null}
          {/* APK 角标（24px 自绘，包裹近满态时淡入） */}
          {ps > 0.8 ? <ApkTag x={PCL.cx - PCL.w / 2 + 6} y={PCL.cy - PCL.h / 2 - 12} color={pColor} opacity={clamp01((ps - 0.8) / 0.2)} /> : null}

          {/* 封印紫光晕（呼吸，持续） */}
          {blobK > 0.01 ? <GlowBlob cx={SEAL.cx} cy={SEAL.cy} r={150} N={N} k={blobK} alpha={0.4} /> : null}

          {/* 大火漆（r 120，letter v2；落章后 glow） */}
          {sealOp > 0 ? <WaxSeal cx={SEAL.cx} cy={sealY} r={SEAL.r} scale={sealS} opacity={sealOp} glow={fall >= 1} letter="v2" /> : null}
        </div>

        {/* 覆盖弧（"整个文件"兜一圈 + 虚线巡行） */}
        <CovArcV cx={360} cy={480} rx={225} ry={170} p={arcP} march={march} glowK={gk} />

        {/* wax seal 小字（GlitchIn rgbSplit 4 = 本镜唯一 glitch） */}
        <GlitchIn N={N} f0={B_WAXLBL} rgbSplit={4} seed={5} style={{opacity: op}}>
          <CText cx={360} cy={668} size={26} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1} dy={0}>wax seal</CText>
        </GlitchIn>

        {/* 右上 Android 7.0 Pill（白边黑底） */}
        {N >= B_PILL ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_PILL, 8) * op}}>
            <Pill x={400} y={272} w={180} h={46} r={23} fill="#000" stroke={WHITE} sw={2.5} text="Android 7.0" fontSize={24} weight={700} letterSpacing={1} textDy={0} />
          </div>
        ) : null}

        {/* 下段 v2 · one signature（等宽灰） */}
        {N >= B_V2 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_V2, 8) * op}}>
            <CText cx={360} cy={715} size={24} weight={600} family={FONT_MONO} color={GREY} letterSpacing={1} dy={0}>v2 · one signature</CText>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};

export default SC05;
