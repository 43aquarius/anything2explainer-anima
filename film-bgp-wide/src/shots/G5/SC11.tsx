import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Cross, SigSeal, VoiceDot, GREY, RED_DEEP, WHITE, abs, SoftIn, softOp, firstOp, exitOp, glowOffK} from '../../ui';
import {KeyGhost} from './g5ui';

/**
 * SC11 黑暗中的声音 · N 2625–2776（S20 ¶ 段末；TO = S21.from−9 = 2776，段末镜头跨 gap15）
 * 节拍：2633「No signature. No password.」左右两个虚影 2 帧错峰 SoftIn（各 0.55α）
 *        → 2648 / 2672 先后红 Cross draw-on（12f）+ 虚影降饱和沉降（「都没有」）
 *       ｜2700「Just a voice in the dark.」中央 VoiceDot 亮起（6f）+ 涟漪一圈/36 帧永续
 *        + `just a voice in the dark` 灰字 SoftIn。
 * 停留：voice 灰字 2700+8 落位 → 离场 2769（exitOp 8f），hold ≈ 61f ✓（涟漪为持续小面积动作，
 *        幅度压到 HOLD 阈下：rings 2 / opacity .72 / speed 42 —— 大涟漪 + 高对比会让 motion_check 把段末当动作误判）。
 * 运镜：1.0→1.06 慢推贯穿（推向声音；慢推不进末拍例外）。零 glitch（涟漪是动作戏）、零扫光。
 * 幕底：BG_G5 覆写 {stars:'none', fog:false}（2625–2776 纯黑舞台）；镜头内只画局部深色渐晕 + 微光池。
 * 主角：VoiceDot 涟漪 260px（白心 + 白柔光池）。
 */
const F0 = 2625;
const TO = 2776;

const VOICE = {cx: 640, cy: 400};
const SIG = {cx: 330, cy: 305};
const KEY = {cx: 950, cy: 305};

const T_IN1 = 2633; // signature? + SigSeal 虚影
const T_IN2 = 2635; // password? + 钥匙虚影（2 帧错峰）
const T_X1 = 2648; // Cross 盖 signature（12f draw-on）
const T_X2 = 2672; // Cross 盖 password（12f draw-on）
const T_VOICE = 2700; // VoiceDot 亮起 + 涟漪 + 灰字

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8); // 声音白光先灭再淡出
  const stageOp = firstOp(N - F0, 8); // 舞台渐晕 8 帧淡入

  // ---- 虚影组（Cross 落下后 2 帧起沉降：+10px / 降饱和到 0.25α）----
  const sink = (fx: number) => clamp01((N - (fx + 14)) / 12);
  const g1Op = softOp(N - T_IN1, 8) * 0.55 * (1 - 0.55 * sink(T_X1));
  const g2Op = softOp(N - T_IN2, 8) * 0.55 * (1 - 0.55 * sink(T_X2));
  const sinkDy = (fx: number) => 10 * sink(fx);

  // ---- Cross draw-on（12f，红柔光）----
  const x1 = clamp01((N - T_X1) / 12);
  const x2 = clamp01((N - T_X2) / 12);

  // ---- 中央声音（2700 亮起 6f；涟漪 42f/圈永续、低对比缓速呼吸；白光池静态）----
  const vn = N - T_VOICE;
  const vOp = softOp(vn, 6);
  const vScale = 0.25 + 0.75 * easeOutCubic(clamp01(vn / 6));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 408, s: 1.06}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* ---- 黑暗舞台（局部深色渐晕 + 中央极暗的紫灰微光池；非全屏纯黑 div）---- */}
        <div style={{...abs(140, 70, 1000, 660), opacity: stageOp, background: 'radial-gradient(closest-side, rgba(34,28,62,.5), rgba(10,9,20,.28) 56%, rgba(0,0,0,0) 100%)'}} />
        <div style={{...abs(0, 0, 1280, 720), opacity: stageOp, background: 'radial-gradient(ellipse 62% 56% at 50% 54%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />

        {/* ---- 声音的白光池（主角的光；2700 随声音亮起，静态微光）---- */}
        <div
          style={{
            ...abs(VOICE.cx - 170, VOICE.cy - 170, 340, 340),
            opacity: (vOp * gk).toFixed(3),
            background: 'radial-gradient(circle, rgba(255,255,255,.14) 0%, rgba(255,255,255,.05) 42%, rgba(255,255,255,0) 70%)',
          }}
        />

        {/* ---- 左上：signature? + SigSeal 虚影 → 红 Cross ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: g1Op.toFixed(3), transform: `translateY(${sinkDy(T_X1).toFixed(1)}px)`}}>
          <SigSeal cx={SIG.cx} cy={SIG.cy} r={56} ghost lit={false} glow={false} />
        </div>
        <SoftIn N={N} f0={T_IN1}>
          <CText cx={SIG.cx} cy={212} size={26} weight={600} color={GREY}>signature?</CText>
        </SoftIn>

        {/* ---- 右上：password? + 钥匙虚影 → 红 Cross ---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: g2Op.toFixed(3), transform: `translateY(${sinkDy(T_X2).toFixed(1)}px)`}}>
          <KeyGhost cx={KEY.cx} cy={KEY.cy} w={124} />
        </div>
        <SoftIn N={N} f0={T_IN2}>
          <CText cx={KEY.cx} cy={212} size={26} weight={600} color={GREY}>password?</CText>
        </SoftIn>

        {/* ---- 两枚红 Cross（draw-on 12f + 红柔光）---- */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: `drop-shadow(0 0 ${(10 * gk).toFixed(0)}px rgba(236,8,31,.5))`}}>
          <Cross cx={SIG.cx} cy={SIG.cy} size={104} sw={8} color={RED_DEEP} p={x1} />
          <Cross cx={KEY.cx} cy={KEY.cy} size={104} sw={8} color={RED_DEEP} p={x2} />
        </svg>

        {/* ---- 中央声音点（白心 + 同心涟漪 42f/圈永续，低对比）---- */}
        <div style={{...abs(0, 0, 1280, 720), transform: `scale(${vScale.toFixed(4)})`, transformOrigin: `${VOICE.cx}px ${VOICE.cy}px`, opacity: 1}}>
          <div style={{...abs(VOICE.cx - 72, VOICE.cy - 72, 144, 144), opacity: 0.72 * vOp, background: 'radial-gradient(circle, rgba(199,168,255,.52) 0%, rgba(161,117,241,.22) 46%, rgba(0,0,0,0) 72%)'}} />
          <VoiceDot cx={VOICE.cx} cy={VOICE.cy} N={Math.max(0, vn)} r={17} speed={42} rings={2} maxR={130} color={WHITE} opacity={0.8 * vOp} />
        </div>

        {/* ---- just a voice in the dark（灰字）---- */}
        <SoftIn N={N} f0={T_VOICE}>
          <CText cx={VOICE.cx} cy={572} size={27} weight={500} color={GREY} letterSpacing={0.5}>just a voice in the dark</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
