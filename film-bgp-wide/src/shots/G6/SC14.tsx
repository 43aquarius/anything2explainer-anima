import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, GlitchIn} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  AsChip, Box, CText, Check, RouteNote, SigSeal, Svg, EXAMPLE, CORAL, GREY, PURPLE_LIGHT, WHITE,
  abs, softOp, firstOp, exitOp, glowOffK,
} from '../../ui';
import {qbez} from './g6ui';

/**
 * SC14 证明 · N 3481–3640（S26 3489「A false announcement can be checked —」/ 3544「and simply ignored.」
 *   + S27 3587「Trust, replaced by proof.」；段内不判，S27 末块 52）
 * 画面：中央验证闸门（左右立柱 + 顶梁 `verify` + 梁上小 SigSeal 常亮呼吸）；
 *   左侧灰暗 liar 芯片（AS65500，lie 灯 + 暗红光晕）掷出无封 RouteNote 飞向闸门 → 接触帧封蜡扫描白闪 →
 *   纸条被弹开（kf 反弹抛物线 18f + 旋转 1.2 圈淡出）+ `ignored` 灰字；
 *   右侧 AS64512 带封纸条顺利通过闸门（16f）→ 绿 Check + `proof` 大字 GlitchIn + 闸门紫光脉冲。
 * 运镜：1.0→1.05 慢推（3518–3584，全部入场完成后；proof GlitchIn 前结束）。glitch：`proof`（rgbSplit 4，白名单）。
 */
const F0 = 3481;
const TO = 3640;

// 节拍
const B_GATE = 3484;   // 闸门三件套 draw-on（20f）
const B_LIAR = 3491;   // liar 芯片缩入
const B_RCHIP = 3498;  // 右侧正常芯片
const B_SEAL = 3499;   // 梁上小封蜡亮起
const B_THROW = 3544;  // 无封纸条飞向闸门（18f）
const CONTACT = 3562;  // 接触：封蜡扫描白闪
const B_BOUNCE = 3558; // 反弹抛物线（18f；前挂，为尾部留 ≥30f 安静区）
const B_IGNORED = 3562;
const B_GOOD = 3573;   // 带封纸条从右飞来通过闸门（12f，前挂：与无封纸条反弹尾重叠，接替感）
const B_PROOF = 3575;  // proof 大字 GlitchIn
const B_PULSE = 3578;  // 闸门紫光脉冲（纸条过门 12f）
const B_CHECK = 3582;  // 绿 Check draw-on（8f）

// 版式（世界坐标）
const GATE = {beam: {x: 532, y: 272, w: 216, h: 30}, pillarL: {x: 560, y: 296, w: 28, h: 220}, pillarR: {x: 692, y: 296, w: 28, h: 220}};
const SEAL = {cx: 640, cy: 240, r: 30};
const LIAR = {cx: 185, cy: 425};
const RCHIP = {cx: 1075, cy: 425};
const BAD = {w: 190, h: 118};
const GOOD = {w: 210, h: 130};

// 无封纸条：liar → 闸门（18f）；反弹：闸门 → 出画（18f）
const FLY_P0 = [250, 400], FLY_C = [400, 318], FLY_P1 = [592, 416];
const BNC_P0 = [592, 412], BNC_C = [400, 188], BNC_P1 = [28, 296];
// 带封纸条：右芯片 → 穿过闸门 → 停靠左侧（16f）
const GOOD_P0 = [1012, 412], GOOD_C = [760, 366], GOOD_P1 = [462, 428];

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 6); // 变陡，保尾部稳定期
  const gk = glowOffK(N, TO, 4, 6);

  // 闸门 draw-on：立柱自下而上（左 3484 / 右 3487）、顶梁自左向右（3490）
  const pL = clamp01((N - B_GATE) / 20);
  const pR = clamp01((N - (B_GATE + 3)) / 20);
  const pB = clamp01((N - (B_GATE + 6)) / 16);
  const gateOp = firstOp(N - B_GATE, 5);

  // 闸门紫光脉冲（纸条过门 12f）
  const pulseN = N - B_PULSE;
  const pulseK = pulseN >= 0 && pulseN < 12 ? Math.sin((Math.PI * pulseN) / 12) : 0;

  // 接触帧：封蜡扫描白闪（8f）+ 接触点白环（6f）
  const scanN = N - CONTACT;
  const scanK = scanN >= 0 && scanN < 8 ? 1 - scanN / 8 : 0;

  // 无封纸条：飞行 → 反弹
  const badN = N - B_THROW;
  let bad: {x: number; y: number; rot: number; op: number; s: number} | null = null;
  if (badN >= 0 && N < CONTACT) {
    const t = easeInOutPow(2)(clamp01(badN / 18));
    const [px, py] = qbez(FLY_P0, FLY_C, FLY_P1, t);
    bad = {x: px, y: py, rot: -4 + 8 * t, op: softOp(badN, 4), s: 1};
  } else if (N >= B_BOUNCE && N < B_BOUNCE + 18) {
    const t = easeOutCubic(clamp01((N - B_BOUNCE) / 18));
    const [px, py] = qbez(BNC_P0, BNC_C, BNC_P1, t);
    bad = {x: px, y: py, rot: 4 + 432 * t, op: 1 - Math.pow(clamp01((N - (B_BOUNCE + 6)) / 12), 1.5), s: 1 - 0.25 * t};
  }

  // 带封纸条：右 → 过闸门 → 停靠
  const goodN = N - B_GOOD;
  let good: {x: number; y: number; rot: number} | null = null;
  if (goodN >= 0) {
    const t = easeInOutPow(2)(clamp01(goodN / 12));
    const [px, py] = qbez(GOOD_P0, GOOD_C, GOOD_P1, t);
    good = {x: px, y: py, rot: -3 + 3 * t};
  }
  const goodOp = softOp(goodN, 5);

  // 芯片缩入
  const chipIn = (f0: number) => {
    const n = N - f0;
    if (n < 0) return null;
    return 0.4 + 0.6 * easeOutCubic(clamp01(n / 14));
  };
  const liarS = chipIn(B_LIAR);
  const rS = chipIn(B_RCHIP);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3518, x: 640, y: 362, s: 1}, {f: 3584, x: 648, y: 372, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* ---- 闸门三件套 ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: gateOp, clipPath: `inset(0 0 ${(100 * (1 - pL)).toFixed(2)}% 0)`}}>
          <Box x={GATE.pillarL.x} y={GATE.pillarL.y} w={GATE.pillarL.w} h={GATE.pillarL.h} fill="#000" stroke={WHITE} sw={2.5}
            glow={pulseK > 0 ? `0 0 ${Math.round(26 * pulseK)}px 10px rgba(102,45,248,${(0.55 * pulseK).toFixed(3)})` : undefined} />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: gateOp, clipPath: `inset(0 0 ${(100 * (1 - pR)).toFixed(2)}% 0)`}}>
          <Box x={GATE.pillarR.x} y={GATE.pillarR.y} w={GATE.pillarR.w} h={GATE.pillarR.h} fill="#000" stroke={WHITE} sw={2.5}
            glow={pulseK > 0 ? `0 0 ${Math.round(26 * pulseK)}px 10px rgba(102,45,248,${(0.55 * pulseK).toFixed(3)})` : undefined} />
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: gateOp, clipPath: `inset(0 ${(100 * (1 - pB)).toFixed(2)}% 0 0)`}}>
          <Box x={GATE.beam.x} y={GATE.beam.y} w={GATE.beam.w} h={GATE.beam.h} fill="#000" stroke={WHITE} sw={2.5}
            glow={pulseK > 0 ? `0 0 ${Math.round(30 * pulseK)}px 12px rgba(102,45,248,${(0.55 * pulseK).toFixed(3)})` : undefined} />
        </div>

        {/* 梁上 verify */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (B_GATE + 14), 8)}}>
          <CText cx={640} cy={287} size={26} weight={700} color={GREY} letterSpacing={2}>verify</CText>
        </div>

        {/* 梁上小封蜡（常亮 + 呼吸；主角的光） */}
        <GlowBlob cx={SEAL.cx} cy={SEAL.cy} r={54} N={N} k={clamp01((N - B_SEAL) / 8) * gk} alpha={0.32} />
        {(() => {
          const n = N - B_SEAL;
          if (n < 0) return null;
          const s = 0.4 + 0.6 * easeOutCubic(clamp01(n / 12));
          return (
            <div style={{
              ...abs(SEAL.cx - SEAL.r, SEAL.cy - SEAL.r, SEAL.r * 2, SEAL.r * 2),
              transform: `scale(${s.toFixed(4)})`,
              transformOrigin: '50% 100%',
              filter: `brightness(${(1 + 0.7 * scanK).toFixed(3)})`,
            }}>
              <SigSeal cx={SEAL.r} cy={SEAL.r} r={SEAL.r} lit />
            </div>
          );
        })()}

        {/* 接触点白环（封蜡扫描） */}
        <Svg bloom={false}>
          {scanK > 0 ? (
            <>
              <circle cx={594} cy={416} r={12 + 34 * (1 - scanK)} fill="none" stroke={WHITE} strokeWidth={3} opacity={(0.85 * scanK).toFixed(3)} />
              <circle cx={SEAL.cx} cy={SEAL.cy} r={34 + 16 * (1 - scanK)} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={(0.6 * scanK).toFixed(3)} />
            </>
          ) : null}
        </Svg>

        {/* ---- 左侧 liar 芯片（灰暗 + lie 灯 + 暗红光晕） ---- */}
        {liarS !== null ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${liarS.toFixed(4)})`, transformOrigin: `${LIAR.cx}px ${LIAR.cy}px`, filter: 'drop-shadow(0 0 10px rgba(241,96,67,0.35))'}}>
            <AsChip cx={LIAR.cx} cy={LIAR.cy} w={104} h={104} asn={EXAMPLE.asnSide} label="liar" led="lie" dim />
          </div>
        ) : null}

        {/* ---- 右侧正常芯片 ---- */}
        {rS !== null ? (
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${rS.toFixed(4)})`, transformOrigin: `${RCHIP.cx}px ${RCHIP.cy}px`}}>
            <AsChip cx={RCHIP.cx} cy={RCHIP.cy} w={104} h={104} asn={EXAMPLE.asnYou} accent led="on" glow />
          </div>
        ) : null}

        {/* ---- 无封纸条：飞向闸门 → 反弹出画（旋转 1.2 圈淡出） ---- */}
        {bad ? (
          <div style={{
            ...abs(bad.x - BAD.w / 2, bad.y - BAD.h / 2, BAD.w, BAD.h),
            opacity: bad.op,
            transform: `rotate(${bad.rot.toFixed(1)}deg) scale(${bad.s.toFixed(3)})`,
            transformOrigin: '50% 50%',
          }}>
            <RouteNote x={0} y={0} w={BAD.w} h={BAD.h} prefix={EXAMPLE.prefix} ghost />
          </div>
        ) : null}

        {/* ignored */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_IGNORED, 8)}}>
          <CText cx={640} cy={556} size={28} weight={600} color={GREY} letterSpacing={1}>ignored</CText>
        </div>

        {/* ---- 带封纸条：从右侧飞来通过闸门 → 停靠 ---- */}
        {good ? (
          <div style={{
            ...abs(good.x - GOOD.w / 2, good.y - GOOD.h / 2, GOOD.w, GOOD.h),
            opacity: goodOp,
            transform: `rotate(${good.rot.toFixed(1)}deg)`,
            transformOrigin: '50% 50%',
            filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))',
          }}>
            <RouteNote x={0} y={0} w={GOOD.w} h={GOOD.h} prefix={EXAMPLE.prefix} via={`owned by ${EXAMPLE.asnYou}`} signed />
          </div>
        ) : null}

        {/* 绿 Check（通过后盖在纸条上方） */}
        <Svg bloom={false}>
          <Check cx={462} cy={330} size={62} p={clamp01((N - B_CHECK) / 8)} sw={7} />
        </Svg>

        {/* ---- proof 大字（本镜唯一 glitch：rgbSplit 4） ---- */}
        <GlitchIn N={N} f0={B_PROOF} rgbSplit={4} seed={7}>
          <CText cx={640} cy={160} size={60} weight={900} color={WHITE} letterSpacing={1}
            shadow={`0 0 22px rgba(102,48,248,${(0.45 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.95)', paintOrder: 'stroke fill'}}>proof</CText>
        </GlitchIn>

        {/* liar 描边暗红提示点（接触帧轻闪，与封蜡扫描呼应） */}
        <Svg bloom={false}>
          {scanK > 0.2 ? <circle cx={LIAR.cx} cy={LIAR.cy} r={60} fill="none" stroke={CORAL} strokeWidth={2} opacity={(0.35 * scanK).toFixed(3)} /> : null}
        </Svg>
      </div>
    </CameraRig>
  );
};
