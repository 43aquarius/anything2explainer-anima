import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powIn, FONT_HEAVY} from '../../common';
import {CText, ParcelIcon, Pill, WaxSeal, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {GlowBlob} from '../../fx';
import {VersionPill, stampIn} from './g5ui';

/**
 * SC31 7.0 加入 v2 · N 4431–4617（S31 4439–4615：4439 Android 7.0 加了 v2 / 4529 像一圈火漆 / 4576 包住整个包）
 * 左上 Pill `Android 7.0`（白边黑底）+ 大 Pill `v2`（紫，Orbitron ~44px）2 帧错峰 stampIn；
 * 中央大包裹（w 300）静置；大 WaxSeal（r 110，紫，letter v2）自上方 powIn 14 帧落到包裹正中
 * （起点压在 HUD 安全区下沿之下）→ 包裹 1.03 微震 + 白闪 2 帧；4576 包裹整体描边 12 帧白→紫（被包住）+
 * 封印紫光晕 30 帧呼吸（持续动作）。末 8 帧归零。
 * 主角：火漆+包裹 ~300px；光：封印紫光晕（呼吸）。
 */
export const F0 = 4431;
const TO = 4617;
const B_PILLS = 4439, B_SEAL = 4529, B_WRAP = 4576;

const PCL = {cx: 640, cy: 350, w: 300, h: 210};
const SEAL = {cx: 640, cy: 350, r: 110, cyStart: 282};

export const SC31: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  const gk = glowOffK(N, TO, 6, 8); // 封印光先灭再整体淡出

  // 包裹：scaleIn 21 帧（4437 起）+ 落章 1.03 微震（4543–4556）+ 白闪 2 帧
  const pn = N - (B_PILLS - 2);
  const ps = pn < 0 ? 0 : scaleIn(pn, 21);
  const sq = kf(N, [[B_SEAL + 14, 1], [B_SEAL + 19, 1.03], [B_SEAL + 27, 1]]);
  const flash = N >= B_SEAL + 14 && N < B_SEAL + 16 ? 1 - (N - (B_SEAL + 14)) * 0.45 : 0;

  // 封印：自上方 powIn 14 帧落下（scale 1.5→1，α 前 6 帧渐入）
  const sn = N - B_SEAL;
  const fall = powIn(2.2)(clamp01(sn / 14));
  const sealY = SEAL.cyStart + (SEAL.cy - SEAL.cyStart) * fall;
  const sealS = 1.5 - 0.5 * fall;
  const sealOp = sn < 0 ? 0 : softOp(sn, 6);

  // 4576 包裹描边白→紫（12 帧渐变）+ 封印光晕呼吸（30 帧）
  const wrapK = clamp01((N - B_WRAP) / 12);
  const pColor = mixHex(WHITE, PURPLE_LIGHT, wrapK);
  const breathe = 0.55 + 0.25 * Math.sin((2 * Math.PI * N) / 30);
  const blobK = clamp01((N - (B_SEAL + 16)) / 8) * breathe * gk;

  // 两个 Pill（2 帧错峰 stampIn）
  const pillA = stampIn(N - B_PILLS, 8);
  const pillB = stampIn(N - (B_PILLS + 2), 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左上：Android 7.0（白边黑底）+ v2（紫，大） */}
      {N >= B_PILLS ? (
        <div
          style={{
            ...abs(90, 124, 216, 52),
            transform: `scale(${pillA.s.toFixed(4)})`,
            transformOrigin: '50% 50%',
            boxShadow: '0 0 20px 6px rgba(255,255,255,.22)',
            opacity: clamp01((N - B_PILLS) / 4),
          }}
        >
          <Pill x={0} y={0} w={216} h={52} r={26} fill="#000" stroke={WHITE} sw={2.5} text="Android 7.0" fontSize={26} weight={700} family={FONT_HEAVY} letterSpacing={1} textDy={0} />
        </div>
      ) : null}
      <VersionPill x={346} y={112} w={150} h={70} text="v2" color={PURPLE} glowColor="rgba(102,48,248,.6)" n={N - (B_PILLS + 2)} />

      {/* 中央大包裹 + 大火漆（同一微震/白闪变换组） */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: `${PCL.cx}px ${PCL.cy}px`,
          transform: `scale(${sq.toFixed(4)})`,
          filter: flash > 0 ? `brightness(${(1 + 0.55 * flash).toFixed(3)})` : undefined,
        }}
      >
        {ps > 0 ? (
          <div style={{...abs(PCL.cx - (PCL.w * ps) / 2, PCL.cy - (PCL.h * ps) / 2, PCL.w * ps, PCL.h * ps)}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `0 0 12px 3px rgba(102,45,248,${(0.3 * ps).toFixed(2)}), 0 0 42px 14px rgba(102,48,248,${(0.38 * ps).toFixed(2)})`}} />
            <ParcelIcon cx={(PCL.w * ps) / 2} cy={(PCL.h * ps) / 2} w={PCL.w} h={PCL.h} scale={ps} color={pColor} label={ps > 0.55 ? 'APK' : ''} labelColor={pColor} />
          </div>
        ) : null}

        {/* 封印光晕（呼吸，持续动作） */}
        {blobK > 0 ? <GlowBlob cx={SEAL.cx} cy={SEAL.cy} r={150} N={N} k={blobK} alpha={0.4} /> : null}

        {/* 大火漆（r 110 紫；落章后 glow） */}
        {sealOp > 0 ? (
          <WaxSeal cx={SEAL.cx} cy={sealY} r={SEAL.r} scale={sealS} opacity={sealOp} glow={fall >= 1} letter="v2" />
        ) : null}
      </div>
    </div>
  );
};

export default SC31;
