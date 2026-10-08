import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, GlitchIn, FONT_MONO, FONT_ORB} from '../../common';
import {CText, GPUChip, LineArrow, PURPLE, WHITE, exitOp, glowOffK, softOp, firstOp, scaleIn} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';
import {CompileGearV, DexFileCardV, typedText} from './g2ui';

/**
 * SC08 编译 · N 1244–1364（S08 1252–1362：1252 编译成机器语言 / 1286 为你这颗 CPU）
 * 纵向流水：上 classes.dex 卡（x 210–510，y 330–490，字符滚动持续）→ 中编译齿轮（白，1.5°/帧持续旋转）
 * → 下 GPUChip（cx 360，cy 770，size 260，6×6=36 格自左上角逐格级联点亮，2f/格持续）+
 * 芯片下 `dex2oat`（Orbitron 44px 白+紫描边）；1286 `machine language` 打字机 → 完成时 GlitchIn
 * rgbSplit 5（本镜唯一 glitch）；级联完成（1322）紫光爆发后收敛呼吸。
 * 运镜：33 帧 1→1.12 推向芯片（1244–1277）。停留：段内不判（爆发收尾 1329 → 离场 1356）。
 * 主角：芯片 260px；光：芯片紫光（glowK + 完成时 HeroGlow 爆发）。
 */
export const F0 = 1244;
const TO = 1364;
const B_CHIP = 1250, B_CARD = 1252, B_ARROW1 = 1254, B_DEXLBL = 1257, B_GEAR = 1258, B_ARROWS2 = 1262,
  B_BEAT2 = 1286, B_MLGLITCH = 1310, B_DONE = 1322;

const CHIP = {cx: 360, cy: 770, size: 260};
const GEAR = {cx: 360, cy: 566, r: 40};
const CARD = {x: 210, y: 330, w: 300, h: 160};
const ML_TEXT = 'machine language';

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // dex 卡 slideUp（Δ70，16 帧）+ 齿轮 draw-on（16 帧）后持续旋转 1.5°/帧
  const cardDy = 70 * powOutRemain16(N - B_CARD);
  const cardOp = N >= B_CARD ? firstOp(N - B_CARD, 6) : 0;
  const gearP = clamp01((N - B_GEAR) / 16);
  const gearRot = Math.max(0, N - B_GEAR) * 1.5;

  // 芯片：12 帧缩放入场；格阵自左上角逐格点亮（36 格，2f/格 = 70 帧，1252–1322 持续）
  const chipS = N < B_CHIP ? 0 : 0.55 + 0.45 * scaleIn(N - B_CHIP, 12);
  const litFrac = clamp01((N - B_CARD) / 70);
  // 芯片光：入场微光 → 级联完成（1322）紫光爆发 → 收敛呼吸
  const breathe = 0.72 + 0.2 * Math.sin((2 * Math.PI * (N - B_DONE)) / 30);
  const chipGlowK = kf(N, [[B_CHIP + 14, 0], [B_CHIP + 24, 0.38], [B_DONE, 0.38], [B_DONE + 6, 1], [B_DONE + 26, breathe]]) * gk;
  const burstK = kf(N, [[B_DONE, 0], [B_DONE + 6, 0.95], [B_DONE + 28, 0.3]]) * gk;

  // machine language：打字机（1286 起 1.5f/字 → 1310 完成）→ GlitchIn rgbSplit 5
  const ml = typedText(ML_TEXT, N, B_BEAT2, 1.5);
  const mlW = ml.text.length * 26 * 0.6;
  const lblBreathe = 0.6 + 0.4 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 640, s: 1}, {f: F0 + 33, x: 360, y: 770, s: 1.12}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* classes.dex 卡（字符滚动持续） */}
        {cardOp > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
            <DexFileCardV x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} N={N} seed={77} title="classes.dex" />
          </div>
        ) : null}

        {/* 流水线箭头 1（卡 → 齿轮） */}
        <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op}}>
          <LineArrow x0={360} y0={494} x1={360} y1={524} p={clamp01((N - B_ARROW1) / 12)} rodW={4} headL={16} headW={18} color={WHITE} />
          {/* 齿轮 → 芯片的双侧短箭头（machine language 文字两侧） */}
          <LineArrow x0={225} y0={612} x1={225} y1={636} p={clamp01((N - B_ARROWS2) / 12)} rodW={2.5} headL={12} headW={12} color={WHITE} opacity={0.85} />
          <LineArrow x0={495} y0={612} x1={495} y1={636} p={clamp01((N - (B_ARROWS2 + 2)) / 12)} rodW={2.5} headL={12} headW={12} color={WHITE} opacity={0.85} />
        </svg>

        {/* 编译齿轮（draw-on + 持续旋转） */}
        {gearP > 0 ? <CompileGearV cx={GEAR.cx} cy={GEAR.cy} r={GEAR.r} rot={gearRot} drawP={gearP} /> : null}

        {/* GPUChip 主角（级联点亮 + 紫光爆发） */}
        {chipS > 0 ? (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${chipS.toFixed(4)})`, transformOrigin: `${CHIP.cx}px ${CHIP.cy}px`}}>
            <HeroGlow x={CHIP.cx - 122} y={CHIP.cy - 122} w={244} h={244} r={36} N={N} k={burstK} />
            <GPUChip cx={CHIP.cx} cy={CHIP.cy} size={CHIP.size} grid={6} lit={litFrac} glowK={chipGlowK} sw={3} />
          </div>
        ) : null}

        {/* dex2oat（芯片下，Orbitron 44px 白+紫描边） */}
        {N >= B_DEXLBL ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_DEXLBL, 8) * op}}>
            <CText
              cx={360}
              cy={938}
              size={44}
              weight={700}
              family={FONT_ORB}
              color={WHITE}
              letterSpacing={3}
              dy={0}
              style={{
                WebkitTextStroke: `2.5px ${PURPLE}`,
                paintOrder: 'stroke fill',
                textShadow: `0 0 ${Math.round(10 + 8 * lblBreathe)}px rgba(161,117,241,${(0.5 * gk).toFixed(3)}), 0 0 4px rgba(161,117,241,${(0.4 * gk).toFixed(3)})`,
              }}
            >
              dex2oat
            </CText>
          </div>
        ) : null}

        {/* machine language（打字机 + 完成时 GlitchIn rgbSplit 5 = 本镜唯一 glitch） */}
        {N >= B_BEAT2 && N < B_MLGLITCH ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 609, height: 27, display: 'flex', justifyContent: 'center', opacity: op}}>
            <div style={{position: 'relative', width: 0, height: 0}}>
              <span style={{position: 'absolute', left: -mlW / 2, top: 0, fontFamily: FONT_MONO, fontSize: 26, lineHeight: '27px', color: WHITE, whiteSpace: 'nowrap'}}>{ml.text}</span>
              {!ml.done ? <span style={{position: 'absolute', left: mlW / 2 + 3, top: 1, width: 12, height: 25, background: WHITE, opacity: N % 20 < 14 ? 0.9 : 0.15}} /> : null}
            </div>
          </div>
        ) : null}
        {N >= B_MLGLITCH ? (
          <GlitchIn N={N} f0={B_MLGLITCH} rgbSplit={5} seed={8} style={{opacity: op}}>
            <CText cx={360} cy={622} size={26} weight={600} family={FONT_MONO} color={WHITE} letterSpacing={1} dy={0}>machine language</CText>
          </GlitchIn>
        ) : null}
      </div>
    </CameraRig>
  );
};

/** powOutRemain(…, 16, 2.5)（本镜局部便捷） */
const powOutRemain16 = (n: number) => (n <= 0 ? 1 : Math.pow(1 - clamp01(n / 16), 2.5));

export default SC08;
