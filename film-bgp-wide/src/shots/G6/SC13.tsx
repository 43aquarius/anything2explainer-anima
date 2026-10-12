import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, powIn, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  AsChip, CText, RouteNote, SigSeal, Svg, TechText, EXAMPLE, GREY, PURPLE_LIGHT, WHITE,
  abs, softOp, firstOp, exitOp, glowOffK,
} from '../../ui';
import {SpinnerWall} from './g6ui';

/**
 * SC13 RPKI 签名 · N 3198–3480（**高光时刻·论点型**；S24 3221「The fix is arriving」/ 3265「cryptography for the map」
 *   + S25 3332「With RPKI, the real owner…」/ 3410「signs: "these routes are mine."」；段内不判，S25 末块 69）
 * 画面：章首承接 SC12 刷新墙（16 帧缩微左下角）；中央 RouteNote 大纸条 330×200（203.0.113.0/24 + owned by AS64512）
 *   + 左上源芯片 AS64512 连线；顶部标题 RPKI（Orbitron 88px 白+紫描边）；
 *   3410 SigSeal 封蜡从上方压落到纸条右下角（kf 下坠 14f + 着地白闪 + 冲击波 12f + 纸条震颤 4f）+ 紫光晕永续呼吸。
 * 运镜：33f 1→1.12 推向封蜡落点（3374–3407，提早起——避开 3410 GlitchIn 且不进末拍，封蜡落下时相机已就位）。
 * glitch：`RPKI`（rgbSplit 6，本镜唯一，白名单高光词）。零扫光。末 8 帧归零（3466 起先灭光）。
 */
const F0 = 3198;
const TO = 3480;

// 节拍
const B_FIX = 3221;    // the fix is arriving（灰）
const B_CRYPTO = 3265; // cryptography for the map（Exo 2 紫斜体）
const B_NOTE = 3332;   // 大纸条 slideUp（Δ100/18f）+ 源芯片 + 连线
const B_CHIP = 3336;
const B_LINE = 3342;
const B_SIGN = 3410;   // RPKI GlitchIn + 封蜡压落（14f）
const B_QUOTE = 3418;  // "these routes are mine"
const LAND = 3424;     // 着地：白闪 + 冲击波 + 震颤

// 版式（世界坐标）
const NOTE = {x: 475, y: 310, w: 330, h: 200};
const SEAL = {cx: 738, cy: 462, r: 64, y0: 252};
const CHIP = {cx: 280, cy: 335, s: 110};

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // ---- 章首承接：刷新墙 16 帧缩微到左下角，3226–3248 归零淡出（spinner 永续旋转）----
  const wk = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const wall = {
    cx: 270 - 95 * wk,
    cy: 480 + 55 * wk,
    scale: 0.55 - 0.25 * wk,
    op: firstOp(N - F0, 6) * (1 - Math.pow(clamp01((N - 3226) / 22), 1.5)),
  };

  // ---- 大纸条：slideUp Δ100/18f；着地震颤 ----
  const noteN = N - B_NOTE;
  const noteDy = 100 * Math.pow(1 - clamp01(noteN / 18), 2.5);
  const noteOp = softOp(noteN, 6);
  const tn = N - LAND;
  const trembleX = tn >= 0 && tn < 5 ? 3.2 * Math.sin(tn * 2.6) * (1 - tn / 5) : 0;
  const trembleY = tn >= 0 && tn < 5 ? 2 * (1 - tn / 5) : 0;

  // ---- 封蜡：14f 加速下坠 + 着地压扁回弹 ----
  const dropN = N - B_SIGN;
  const fallK = powIn(2)(clamp01(dropN / 14));
  const sealCy = dropN < 0 ? SEAL.y0 : SEAL.y0 + (SEAL.cy - SEAL.y0) * fallK;
  const sealOp = dropN < 0 ? 0 : firstOp(dropN, 5);
  const squash = tn >= 0 && tn < 5 ? 1 - tn / 5 : 0;
  const flashK = tn >= 0 && tn < 7 ? 1 - tn / 7 : 0; // 白闪衰减
  const wave1 = clamp01(tn / 12);                    // 冲击波主环
  const wave2 = clamp01((tn - 4) / 12);              // 冲击波副环

  // ---- 顶部两行让位 RPKI ----
  const topFade = 1 - Math.pow(clamp01((N - 3396) / 12), 1.5);

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 360, s: 1},
        {f: 3374, x: 640, y: 360, s: 1},
        {f: 3407, x: 650, y: 385, s: 1.12},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* 承接：刷新墙（左下角缩微） */}
        {wall.op > 0.01 ? <SpinnerWall cx={wall.cx} cy={wall.cy} scale={wall.scale} N={N} opacity={wall.op} /> : null}

        {/* 顶部两行（3221 / 3265；3396–3408 让位） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_FIX, 8) * topFade}}>
          <CText cx={640} cy={150} size={38} weight={600} color={GREY} letterSpacing={1}>the fix is arriving</CText>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_CRYPTO, 8) * topFade}}>
          <TechText cx={640} cy={206} text="cryptography for the map" fontSize={46} letterSpacing={1.5} />
          {/* 封蜡预告虚影（3240 淡入，大而虚，笔记到场前占住画面主体；3396 让位淡出） */}
          <div style={{...abs(0, 0, 1280, 720), opacity: 0.62 * softOp(N - 3240, 10) * (1 - clamp01((N - 3396) / 12))}}>
            <SigSeal cx={640} cy={408} r={104} lit={false} glow />
          </div>
        </div>

        {/* 源芯片（左上，连线接纸条） */}
        {(() => {
          const n = N - B_CHIP;
          if (n < 0) return null;
          const s = 0.4 + 0.6 * easeOutCubic(clamp01(n / 14));
          return (
            <div style={{...abs(CHIP.cx - CHIP.s / 2, CHIP.cy - CHIP.s / 2, CHIP.s, CHIP.s), transform: `scale(${s.toFixed(4)})`, transformOrigin: '55px 55px'}}>
              <AsChip cx={55} cy={55} w={CHIP.s} h={CHIP.s} asn={EXAMPLE.asnYou} accent led="on" glow />
            </div>
          );
        })()}

        {/* 芯片→纸条 虚线连线（自左向右 wipe） */}
        {(() => {
          const p = clamp01((N - B_LINE) / 10);
          if (p <= 0) return null;
          return (
            <div style={{...abs(0, 0, 1280, 720), clipPath: `inset(0 ${(100 * (1 - p)).toFixed(2)}% 0 0)`}}>
              <Svg bloom={false}>
                <line x1={338} y1={339} x2={491} y2={348} stroke={GREY} strokeWidth={2} strokeDasharray="8 7" opacity={0.85} />
              </Svg>
            </div>
          );
        })()}

        {/* 封蜡落点紫晕（主角的光，着地后呼吸） */}
        <GlowBlob cx={SEAL.cx} cy={SEAL.cy} r={108} N={N} k={clamp01((N - (LAND + 2)) / 8) * gk} alpha={0.3} />

        {/* 大纸条（主角组） */}
        <div style={{
          ...abs(NOTE.x, NOTE.y + noteDy + trembleY, NOTE.w, NOTE.h),
          opacity: noteOp,
          transform: `translateX(${trembleX.toFixed(2)}px)`,
          filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.28))',
        }}>
          <RouteNote x={0} y={0} w={NOTE.w} h={NOTE.h} prefix={EXAMPLE.prefix} via={`owned by ${EXAMPLE.asnYou}`} />
        </div>

        {/* 着地特效：白闪 + 冲击波双环 */}
        <Svg bloom={false}>
          {flashK > 0 ? (
            <circle cx={SEAL.cx} cy={SEAL.cy} r={64 + 40 * (1 - flashK)} fill="none" stroke={WHITE} strokeWidth={4} opacity={(0.9 * flashK).toFixed(3)} />
          ) : null}
          {wave1 > 0 && wave1 < 1 ? (
            <circle cx={SEAL.cx} cy={SEAL.cy} r={70 + 80 * wave1} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3.5 * (1 - wave1) + 0.8} opacity={(0.8 * (1 - wave1)).toFixed(3)} />
          ) : null}
          {wave2 > 0 && wave2 < 1 ? (
            <circle cx={SEAL.cx} cy={SEAL.cy} r={54 + 62 * wave2} fill="none" stroke={WHITE} strokeWidth={2.2 * (1 - wave2) + 0.6} opacity={(0.6 * (1 - wave2)).toFixed(3)} />
          ) : null}
        </Svg>

        {/* 封蜡章（压落：下坠 14f → 压扁回弹；着地亮光） */}
        {dropN >= 0 ? (
          <div style={{
            ...abs(SEAL.cx - SEAL.r, sealCy - SEAL.r, SEAL.r * 2, SEAL.r * 2),
            opacity: sealOp,
            transformOrigin: '50% 100%',
            transform: `scale(${(1 + 0.15 * squash).toFixed(3)}, ${(1 - 0.22 * squash).toFixed(3)})`,
            filter: `brightness(${(1 + 0.6 * flashK).toFixed(3)})`,
          }}>
            <SigSeal cx={SEAL.r} cy={SEAL.r} r={SEAL.r} lit={N >= LAND} glow={N >= LAND - 1} />
          </div>
        ) : null}

        {/* 顶部标题 RPKI（Orbitron 88 白+紫描边；本镜唯一 glitch：rgbSplit 6，高光时刻词） */}
        <GlitchIn N={N} f0={B_SIGN} rgbSplit={6} seed={13}>
          <CText cx={640} cy={170} size={88} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={6}
            shadow={`0 0 26px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: '2.5px rgba(161,117,241,0.9)', paintOrder: 'stroke fill'}}>RPKI</CText>
        </GlitchIn>

        {/* 签名引语（3418，S25「signs: …」） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_QUOTE, 8)}}>
          <CText cx={640} cy={566} size={26} weight={500} color={GREY} italic letterSpacing={0.5}>{'"these routes are mine"'}</CText>
        </div>
      </div>
    </CameraRig>
  );
};
