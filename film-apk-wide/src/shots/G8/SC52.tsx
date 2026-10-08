import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powIn} from '../../common';
import {CText, Check, ParcelIcon, WaxSeal, GREY_LINE, GREY_MID, WHITE, abs, exitOp, firstOp, glowOffK, softOp} from '../../ui';
import {MiniPhone, StoreBadge} from './g8ui';

/**
 * SC52 Play 组装 · N 7814–7938（S52 7822–7936：7822「Play assembles the splits for your exact device」/ 7893「and signs them on the way out.」段内镜头）
 * 中央「Play 组装线」简笔：传送带 x 220–1060（y 352/376 双白线 + 6 只传送辊持续旋转）+ 左端 Store 徽标（白边方 + 播放三角）；
 * base 包裹上带右行（8px/f，见偏离记录 A1）→ 途经签名工位（悬挂缩微 WaxSeal r 30）：7881–7888 powIn 落章 + 白闪 +
 *   7889 包裹边框闪紫一次 + 封条 sealP 0→1（正对节拍 7893「signs them on the way out」）→ 继续右行；
 * 7893 包裹滑入右端 0.35× 缩微手机「张口」+ 屏闪绿光 + 小 Check draw-on（7895–7903）。
 * 停留：段内不判（Check 7903 落定 → 离场 7930，辊旋转持续至离场）。末 8 帧归零。零 glitch。光：落章紫闪 + 手机绿光。
 */
const F0 = 7814, TO = 7938;
const B1 = 7822, B2 = 7893;

const BELT = {x0: 220, x1: 1060, yTop: 350, yBot: 375};
const BELT_DRAW = 18; // draw-on 帧数（自左 scaleX）
const ROLLERS = [285, 400, 515, 630, 745, 860];

const STORE = {cx: 335, yBase: 351};

// base 包裹：7823 上带，中心 411 起 8px/f 右行；7893 抵手机口，7893–7900 缩入
const P_T0 = 7823, P_V = 8, P_X0 = 411;
const PARCEL = {w: 92, h: 64, cy: 320};
const STAMP = {cx: 915, restY: 280, pressY: 318, tDrop: 7881, tHit: 7888, tLift: 7891, tUp: 7897};
const PHONE = {x: 971, y: 276, w: 84, h: 168};
const ABSORB = {t0: B2, len: 7}; // 7893–7900 缩入手机
const GREEN_T = 7893, CHECK_T = 7895;

export const SC52: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  const glowK = glowOffK(N, TO, 6, 8);

  const bn = N - B1;
  const beltP = clamp01(bn / BELT_DRAW);

  // ---- base 包裹运动 ----
  const rideN = N - P_T0;
  const px = P_X0 + P_V * Math.min(rideN, ABSORB.t0 + ABSORB.len - P_T0); // 缩入期间继续右行
  const absorbT = clamp01((N - ABSORB.t0) / ABSORB.len);
  const pScale = 1 - 0.7 * powIn(1.8)(absorbT);
  const pOp = (rideN < 0 ? 0 : firstOp(rideN, 4)) * (1 - powIn(1.5)(absorbT)) * exOp;
  const sealed = N >= STAMP.tHit + 1; // 落章闪后：紫边 + 封条
  const pFlash = N >= STAMP.tHit + 1 && N < STAMP.tHit + 4 ? 1 - (N - (STAMP.tHit + 1)) * 0.33 : 0;
  const sealP = clamp01((N - (STAMP.tHit + 1)) / 4);

  // ---- 签名工位：悬挂 WaxSeal 落章一次 ----
  const sealY =
    N < STAMP.tDrop
      ? STAMP.restY
      : N < STAMP.tHit
        ? STAMP.restY + (STAMP.pressY - STAMP.restY) * powIn(2.2)(clamp01((N - STAMP.tDrop) / (STAMP.tHit - STAMP.tDrop)))
        : N < STAMP.tLift
          ? STAMP.pressY
          : N < STAMP.tUp
            ? STAMP.pressY - (STAMP.pressY - STAMP.restY) * easeOutCubic(clamp01((N - STAMP.tLift) / (STAMP.tUp - STAMP.tLift)))
            : STAMP.restY;
  const sealFlash = N >= STAMP.tHit && N < STAMP.tHit + 3 ? 1 - (N - STAMP.tHit) * 0.34 : 0;

  // ---- 手机接收：屏闪绿 + 小 Check ----
  const flashK = clamp01((N - GREEN_T) / 3) * (1 - clamp01((N - (GREEN_T + 3)) / 3));
  const checkP = clamp01((N - CHECK_T) / 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 传送带双线（自左 draw-on） */}
      {[BELT.yTop, BELT.yBot].map((y) => (
        <div
          key={y}
          style={{
            ...abs(BELT.x0, y, BELT.x1 - BELT.x0, 3),
            background: WHITE,
            transformOrigin: '0% 50%',
            transform: `scaleX(${beltP.toFixed(3)})`,
            opacity: bn < 0 ? 0 : firstOp(bn, 4),
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.35))',
          }}
        />
      ))}

      {/* 传送辊（持续旋转） */}
      {ROLLERS.map((rx, i) => {
        const rn = N - (B1 + 3 + i);
        if (rn < 0) return null;
        const rot = N * 6 + i * 30;
        return (
          <div key={rx} style={{...abs(rx - 11, 380, 22, 22), opacity: softOp(rn, 5)}}>
            <svg width={22} height={22} viewBox="0 0 22 22" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <circle cx={11} cy={11} r={9.5} fill="#000" stroke={GREY_MID} strokeWidth={2} />
              <g transform={`rotate(${rot.toFixed(1)} 11 11)`} stroke={GREY_LINE} strokeWidth={2} strokeLinecap="round">
                <line x1={11} y1={3.5} x2={11} y2={18.5} />
                <line x1={3.5} y1={11} x2={18.5} y2={11} />
              </g>
            </svg>
          </div>
        );
      })}

      {/* 左端 Store 徽标 */}
      <StoreBadge cx={STORE.cx} yBase={STORE.yBase} s={58} opacity={bn < 2 ? 0 : softOp(bn - 2, 6)} />

      {/* 签名工位（龙门臂 + 悬挂缩微火漆） */}
      <div style={{position: 'absolute', inset: 0, opacity: bn < 4 ? 0 : softOp(bn - 4, 6)}}>
        <div style={{...abs(STAMP.cx - 18, 222, 36, 3), background: GREY_MID}} />
        <div style={{...abs(STAMP.cx - 1.5, 222, 3, 40), background: GREY_MID}} />
        <WaxSeal cx={STAMP.cx} cy={sealY} r={30} stampP={1} opacity={1} glow={sealed && glowK > 0.02} />
        {sealFlash > 0.02 ? (
          <svg width={120} height={120} viewBox="0 0 120 120" style={{...abs(STAMP.cx - 60, STAMP.pressY - 60, 120, 120), overflow: 'visible'}}>
            <circle cx={60} cy={60} r={34 + 16 * (1 - sealFlash)} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={Number((0.85 * sealFlash).toFixed(2))} />
          </svg>
        ) : null}
      </div>

      {/* base 包裹（落章后紫边 + 封条 + 白闪） */}
      {rideN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: pOp, filter: pFlash > 0.02 ? `brightness(${(1 + 0.6 * pFlash).toFixed(2)})` : undefined}}>
          <ParcelIcon cx={px} cy={PARCEL.cy} w={PARCEL.w} h={PARCEL.h} scale={pScale} accent={sealed} glow={sealed} sealP={sealP} label={absorbT > 0.02 ? '' : 'base'} />
        </div>
      ) : null}

      {/* 右端缩微手机（张口接收） */}
      <div style={{position: 'absolute', inset: 0, opacity: bn < 6 ? 0 : softOp(bn - 6, 6)}}>
        <MiniPhone x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} flashK={flashK * glowK} />
        {checkP > 0 ? <Check cx={PHONE.x + PHONE.w / 2} cy={PHONE.y + PHONE.h / 2 - 8} size={30} sw={6} p={checkP} opacity={exOp} /> : null}
      </div>

      {/* 右端小字（收货方） */}
      <CText cx={PHONE.x + PHONE.w / 2} cy={PHONE.y + PHONE.h + 34} size={22} weight={600} color={GREY_MID} opacity={bn < 8 ? 0 : softOp(bn - 8, 6)}>
        your device
      </CText>
      <CText cx={STORE.cx} cy={STORE.yBase + 40} size={22} weight={600} color={GREY_MID} opacity={bn < 8 ? 0 : softOp(bn - 8, 6)}>
        Play
      </CText>
    </div>
  );
};

export default SC52;
