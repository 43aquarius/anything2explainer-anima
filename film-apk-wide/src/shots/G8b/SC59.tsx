import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse} from '../../common';
import {CText, ParcelIcon, PURPLE, WHITE, abs, fadeIn} from '../../ui';
import {LightSweep, GlowBlob} from '../../fx';
import {EnvelopeGlyph} from './g8bui';

/**
 * SC59 ★收束 · N 8840–8999（S59 8848–8899 ¶：8848「Every app is a zip you can read.」）
 * **片尾收束 · 扫光白名单②（全片两处之二）+ 高光时刻（收束型）+ 全片最后一次 glitch**。末拍不运镜、不归零（压黑层接管：
 * endingFade=6 自 8893 起压黑，config 注释 (S59.to−6)−8848 = 45 ≥ 30 ✓）。
 * 8841 发光白线自中心 draw-on（12 帧，y 360 上下柔光）；三轮紫光横扫 8844/8862/8880（f0+4/+22/+40，各 16 帧）；
 * 8844 白闪 3 帧 + 大字 `Every app is a zip` / `you can read.`（Noto 900 62px 两行白+紫描边）GlitchIn rgbSplit 8
 * （**前挂 −4 帧对齐节拍 8848**，满态 ≈8865）+ emphasisPulse @8856；8862 小包裹 ParcelIcon（label 'APK'，紫光保持）
 * 与第二行并肩；8866 起 2 枚小信封 3px/帧持续右行至压黑；紫晕呼吸（片尾唯一大面积光，持续）。
 * 满态可读窗口：8865 落定 → 压黑 8893 起（28 帧满态 + 光晕延续到压黑渐深前 ~8896；双倍预算口径 (8899−6)−8848=45 ✓）。
 */
const F0 = 8840;
const SWEEPS = [8844, 8862, 8880]; // f0+4 / +22 / +40（各 16 帧）
const T_LINE = 8841; // 白线 draw-on 12 帧
const T_TEXT = 8844; // 大字 GlitchIn（节拍 8848 −4 前挂）
const T_PULSE = 8856; // emphasisPulse
const T_PARCEL = 8862; // 小包裹（与大字并肩）
const T_ENV = 8866; // 2 枚小信封右行

const LINE = {y: 360, w: 1040, h: 3}; // 发光白线（x 120–1160）
const L1 = 'Every app is a zip';
const L2 = 'you can read.';
const L1Y = 312, L2Y = 408;
const PKG = {cx: 955, cy: 404, w: 110, h: 82}; // 包裹与第二行并肩
const ENVS = [
  {y: 500, x0: 150, w: 46, h: 32},
  {y: 545, x0: 430, w: 40, h: 28},
];

export const SC59: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 白线自中心向两端 draw-on（12 帧，幂 2.5 缓出）
  const lineK = 1 - Math.pow(1 - clamp01((N - T_LINE) / 12), 2.5);
  // 白闪 3 帧（大字入场瞬间：线体增亮 + 中央辉光）
  const flash = N >= T_TEXT ? N - T_TEXT : -1;
  const flashK = flash >= 0 && flash < 3 ? 1 - flash * 0.33 : 0;
  // 大字脉冲（两行整体）+ 紫晕呼吸
  const pulse = emphasisPulse(N - T_PULSE, {peak: 1.09});
  const glow = 18 + 8 * Math.sin((2 * Math.PI * N) / 30);
  const blobA = 0.16 + 0.05 * Math.sin((2 * Math.PI * N) / 30);
  // 信封右行 3px/帧（持续至压黑）
  const envT = N - T_ENV;
  const pkOp = fadeIn(N - T_PARCEL, 8);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 三轮紫光横扫（扫光白名单②；屏幕空间，不随运镜） */}
      <LightSweep N={N} rounds={SWEEPS} alphas={[0.6, 0.55, 0.55]} />

      {/* 紫晕（片尾唯一大面积光：呼吸，持续到压黑） */}
      {N >= T_PULSE ? <GlowBlob cx={640} cy={360} r={260} alpha={blobA * clamp01((N - T_PULSE) / 10)} /> : null}

      {/* 发光白线（自中心向两端 draw-on；白闪时增亮） */}
      {lineK > 0 ? (
        <div
          style={{
            ...abs(640 - (LINE.w / 2) * lineK, LINE.y - LINE.h / 2, LINE.w * lineK, LINE.h),
            background: flash >= 0 && flash < 3 ? WHITE : 'linear-gradient(90deg, rgba(255,255,255,.55), #FFFFFF 12%, #FFFFFF 88%, rgba(255,255,255,.55))',
            borderRadius: 2,
            boxShadow:
              flash >= 0 && flash < 3
                ? `0 0 ${Math.round(22 + 26 * flashK)}px ${Math.round(6 + 6 * flashK)}px rgba(255,255,255,.75), 0 0 70px 24px rgba(161,117,241,.5)`
                : '0 0 18px 6px rgba(255,255,255,.38), 0 0 64px 22px rgba(161,117,241,.34)',
          }}
        />
      ) : null}

      {/* 白闪（3 帧：中央辉光，在大字之下） */}
      {flash >= 0 && flash < 3 ? (
        <div
          style={{
            ...abs(640 - 320, 360 - 190, 640, 380),
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.5) 0%, rgba(255,255,255,.22) 40%, rgba(255,255,255,0) 72%)',
            opacity: [0.9, 0.55, 0.22][flash],
          }}
        />
      ) : null}

      {/* 信封（zip 母题回扣：3px/帧持续右行至压黑，画在大字之前 → 从字后穿过） */}
      {ENVS.map((e, i) =>
        envT < 0 ? null : (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: fadeIn(envT, 8)}}>
            <EnvelopeGlyph cx={e.x0 + 3 * envT} cy={e.y} w={e.w} h={e.h} accent />
          </div>
        ),
      )}

      {/* 大字两行（GlitchIn rgbSplit 8，全片最后一次 glitch；前挂 −4 帧对齐节拍 8848） */}
      {N >= T_TEXT ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 360px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T_TEXT} rgbSplit={8} seed={59}>
            <CText
              cx={640}
              cy={L1Y}
              size={62}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,.55), 0 0 8px rgba(255,255,255,.3)`}
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              {L1}
            </CText>
            <CText
              cx={640}
              cy={L2Y}
              size={62}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,.55), 0 0 8px rgba(255,255,255,.3)`}
              style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
            >
              {L2}
            </CText>
          </GlitchIn>
        </div>
      ) : null}

      {/* 小包裹（与大字并肩；紫光保持到压黑） */}
      {pkOp > 0 ? <ParcelIcon cx={PKG.cx} cy={PKG.cy} w={PKG.w} h={PKG.h} accent glow label="APK" opacity={pkOp} /> : null}
    </div>
  );
};

export default SC59;
