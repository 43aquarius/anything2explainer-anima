import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutCubic, kf} from '../../common';
import {CText, WaxSeal, ParcelIcon, ManifestCard, Check, Svg, WHITE, GREY, GREEN, exitOp, glowOffK, scaleIn, softOp, firstOp, abs} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC37 验签通过 · N 5329–5436（S37 5337–5434：5337「Verification passes.」/ 5385「Now Android reads the label.」）
 * 左半：WaxSeal（r 92，完好像）5337 scaleIn 16f + 绿 Check draw-on 16f + `verified`（绿 28px 打字机）+ 封印绿光晕一次（HeroGlow GREEN k 脉冲）；
 * 右半：5349 灰色缩微包裹（0.4× 语境）→ 5385 面单 ManifestCard 缩影从包裹中被抽出（kf 位移 18f，0.5×→0.72×）+ 白色轨迹线渐隐 +
 * 落位后 revealP 0→0.8（前 4 行，SC38 才是全量主角镜头）+ 卡边紫微光（HeroGlow）。
 * 段内镜头（停留不判，末拍紧凑：revealP ~5414 完 → 离场 5429）；末 8 帧归零（绿光/紫光先灭 6f）。
 * 本镜零 glitch、零扫光。
 */
const F0 = 5329, TO = 5436;
const B_SEAL = 5337, B_CHECK = 5341, B_VER = 5353, B_PARCEL = 5349, B_PULL = 5385;

const SEAL = {cx: 285, cy: 280, r: 92};
const PARCEL = {cx: 620, cy: 462, w: 118, h: 84};
// 抽出：面单中心从包裹 → (890, 285)；基础卡 330×300，外包 scale 变换（w 330 h 300 → 0.72× = 238×216）
const PULL = {from: {x: 620, y: 462}, to: {x: 890, y: 285}, len: 18};

export const SC37: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6);

  // 左半：封印 + Check + verified
  const sealS = N < B_SEAL ? 0 : scaleIn(N - B_SEAL, 16);
  const checkP = clamp01((N - B_CHECK) / 16);
  const verText = N < B_VER ? '' : 'verified'.slice(0, Math.floor((N - B_VER) / 2));
  const sealGlowK = kf(N, [[B_CHECK, 0], [B_CHECK + 8, 0.9], [B_CHECK + 32, 0.24]]) * gk; // 绿光晕一次
  const leftOp = softOp(N - B_SEAL, 8) * (1 - 0.3 * clamp01((N - (B_PULL + 5)) / 10)); // 抽面单时左侧渐暗 30%

  // 右半：缩微包裹 + 抽出的面单
  const parcelOp = softOp(N - B_PARCEL, 8) * (1 - 0.25 * clamp01((N - (B_PULL + 14)) / 10));
  const pt = easeInOutCubic(clamp01((N - B_PULL) / PULL.len));
  const cardX = PULL.from.x + (PULL.to.x - PULL.from.x) * pt;
  const cardY = PULL.from.y + (PULL.to.y - PULL.from.y) * pt;
  const cardS = 0.25 + 0.47 * pt; // 起始 82×75 藏在包裹后 → 落位 238×216
  const revealP = kf(N, [[B_PULL + PULL.len, 0], [B_PULL + PULL.len + 15, 0.8]]);
  // 抽出轨迹（白线，渐隐）
  const trailOp = kf(N, [[B_PULL, 0], [B_PULL + 4, 0.8], [B_PULL + 18, 0.8], [B_PULL + 28, 0]]);
  const cardGlowK = clamp01((N - (B_PULL + 10)) / 8) * gk;

  // 面单外包缩放（内坐标 330×300，中心对位 cardX/cardY）
  const ix = cardX / cardS - 165;
  const iy = cardY / cardS - 150;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左半：验签（主角组 1） */}
      <div style={{position: 'absolute', inset: 0, opacity: leftOp}}>
        <HeroGlow x={SEAL.cx - 105} y={SEAL.cy - 105} w={210} h={210} r={105} N={N} k={sealGlowK} color="#8FF740" />
        {sealS > 0 ? <WaxSeal cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r} scale={sealS} glow /> : null}
        {checkP > 0 ? <Check cx={SEAL.cx} cy={SEAL.cy - 2} size={68} sw={8} p={checkP} /> : null}
        {verText ? (
          <CText cx={SEAL.cx} cy={428} size={28} weight={700} color={GREEN} shadow={`0 0 12px rgba(143,247,64,${(0.5 * gk).toFixed(2)})`}>
            {verText}
          </CText>
        ) : null}
      </div>

      {/* 抽出轨迹 */}
      {trailOp > 0 ? (
        <Svg bloom={false}>
          <line x1={648} y1={442} x2={830} y2={340} stroke={WHITE} strokeWidth={3} strokeLinecap="round" opacity={trailOp * 0.7} />
        </Svg>
      ) : null}

      {/* 抽出的面单（主角组 2：先渲染，从缩微包裹后抽出；落位后 238×216） */}
      {N >= B_PULL ? (
        <>
          <HeroGlow x={PULL.to.x - 119} y={PULL.to.y - 108} w={238} h={216} r={14} N={N} k={cardGlowK} />
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${cardS.toFixed(4)})`, transformOrigin: '0 0', opacity: firstOp(N - B_PULL, 6)}}>
            <ManifestCard x={ix} y={iy} w={330} h={300} revealP={revealP} active />
          </div>
        </>
      ) : null}

      {/* 缩微包裹（0.4× 语境，配角；盖在面单起始位上） */}
      {parcelOp > 0 ? <ParcelIcon cx={PARCEL.cx} cy={PARCEL.cy} w={PARCEL.w} h={PARCEL.h} color={GREY} label={''} opacity={parcelOp} /> : null}
    </div>
  );
};

export default SC37;
