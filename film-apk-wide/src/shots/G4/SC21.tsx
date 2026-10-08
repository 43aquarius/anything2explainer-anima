import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, powOutRemain, easeOutCubic, clamp01, emphasisPulse} from '../../common';
import {CText, Box, Svg, PURPLE_LIGHT, WHITE, GREY, exitOp, glowOffK, softOp, scaleIn} from '../../ui';
import {CoffeeCup, JarGlyph} from './g4ui';
import {ParcelIcon} from '../../ui';

/**
 * SC21 Java 血统（2995–3243，S21 ¶：3003 安卓建在 Java 上 / 3065 Java app 是 JAR / 3144 JAR 是带面单的 zip）
 * 传承三连：左中右三卡 300×240（y 240–480，cx 250/640/1030）+ 卡间两枚大等号（白，双横线 draw-on）。
 * 3003 左卡 scaleIn + 咖啡杯热气持续上升（g4ui CoffeeCup N 驱动）；3065 等号① + 中卡 slideUp（Δ90/16f）+
 * 罐盖旋开（lidA 8f）+ 罐身面单（Manifest 呼应，白边小贴纸）；3144 等号② + 右卡包裹 scaleIn +
 * `JAR` 字 GlitchIn（本镜唯一 glitch，rgbSplit 4）+ emphasisPulse + 面单紫光点亮（"with a manifest inside"）；
 * 底部 `a jar is a zip with a manifest` 灰 24px 打字机（每 2 帧 1 字，3146 起）。
 * 末 8 帧归零：离场 3216–3224（停留 3168→3216 = 48 ≥30 ✓；比 G4 表"3208−8"晚 8 帧，为让打字机 33 字全部
 * 落定——3212 完成 + 4 帧稳定；段末停顿 3206→3252 仍在镜头内完成离场）。
 * 主角：三卡组 240px；光：等号白 bloom；面单紫光（唯一紫重点）。
 */
export const F0 = 2995;
const B_JAVA = 3003, B_EQ1 = 3065, B_JAR = 3065, B_LID = 3073, B_STICK = 3077, B_EQ2 = 3144, B_APK = 3144, B_JARLBL = 3144, B_CAP = 3146;
const EXIT_TO = 3236, EXIT_LEN = 8; // 镜头末 3243：fade 3228–3236，死尾巴仅 7 帧（提前离场会留长黑尾巴，吃掉 motion_check 回退预算）
const CAPTION = 'a jar is a zip with a manifest';

const CARD = {y: 240, w: 300, h: 240};
const C1 = {cx: 250}, C2 = {cx: 640}, C3 = {cx: 1030};
const EQ = [
  {cx: 445, f0: B_EQ1},
  {cx: 835, f0: B_EQ2},
];

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, EXIT_TO, EXIT_LEN);
  if (op <= 0) return null;

  // 左卡：缩放入场
  const s1 = scaleIn(N - B_JAVA, 21);
  // 中卡：自下滑入 Δ90/16f
  const jarDy = 90 * powOutRemain(N - B_JAR, 16, 2.5);
  // 罐盖旋开
  const lidA = easeOutCubic(clamp01((N - B_LID) / 8));
  // 右卡：缩放入场
  const s3 = scaleIn(N - B_APK, 21);
  // 面单紫光（3144 点亮，先灭光再离场）
  const gk = clamp01((N - B_STICK) / 8) * glowOffK(N, EXIT_TO, 6, EXIT_LEN);
  const sconv = 1 - clamp01((N - 3176) / 6); // 3176 后面单光呼吸幅度归零（段末稳定期）
  const stickGlow = gk * (0.8 + 0.2 * sconv * Math.sin(((N - B_STICK) / 30) * Math.PI * 2));
  // JAR 大字脉冲
  const pulse = emphasisPulse(N - (B_JARLBL + 10), {peak: 1.14, up: 9, hold: 3, down: 10});
  // 打字机（每 1 帧 1 字——2 帧/字会打到 3212，压掉段末稳定期；1.1 s 打完 33 字可读性不受影响）
  const typed = Math.max(0, Math.min(CAPTION.length, Math.floor(N - B_CAP) + 1));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左卡：Java 咖啡杯 */}
      {s1 > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${s1.toFixed(4)})`, transformOrigin: `${C1.cx}px ${CARD.y + CARD.h / 2}px`}}>
          <Box x={C1.cx - CARD.w / 2} y={CARD.y} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} />
          <CoffeeCup cx={C1.cx} cy={CARD.y + 100} N={Math.min(N, 3162)} /> {/* 3162 后热气相位冻结：段末 3168→3200 稳定期（动词动作到段落边界为止） */}
        </div>
      ) : null}

      {/* 中卡：JAR 罐 */}
      {N >= B_JAR ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translateY(${jarDy.toFixed(2)}px)`, opacity: softOp(N - B_JAR, 6)}}>
          <Box x={C2.cx - CARD.w / 2} y={CARD.y} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} />
          <JarGlyph cx={C2.cx} cy={CARD.y + 88} lidA={lidA}>
            {/* 罐身面单（Manifest 呼应）：白边小贴纸 + 三行灰线，3144 起紫光 */}
            <div
              style={{
                position: 'absolute',
                left: 34,
                top: 92,
                width: 52,
                height: 38,
                background: '#000',
                border: `2px solid ${N >= B_STICK ? PURPLE_LIGHT : WHITE}`,
                borderRadius: 3,
                transform: 'rotate(-4deg)',
                boxShadow: N >= B_STICK ? `0 0 ${18 * stickGlow}px ${6 * stickGlow}px rgba(102,48,248,.65)` : undefined,
              }}
            >
              {[0, 1].map((i) => (
                <div key={i} style={{position: 'absolute', left: 7, top: 8 + i * 10, width: 34, height: 2.5, background: GREY, opacity: 0.85, borderRadius: 1}} />
              ))}
              <div style={{position: 'absolute', left: 7, top: 28, width: 22, height: 2.5, background: GREY, opacity: 0.85, borderRadius: 1}} />
            </div>
          </JarGlyph>
        </div>
      ) : null}

      {/* 右卡：APK 包裹 */}
      {s3 > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${s3.toFixed(4)})`, transformOrigin: `${C3.cx}px ${CARD.y + CARD.h / 2}px`}}>
          <Box x={C3.cx - CARD.w / 2} y={CARD.y} w={CARD.w} h={CARD.h} r={14} stroke={WHITE} sw={2.5} />
          <ParcelIcon cx={C3.cx} cy={CARD.y + 92} w={168} h={122} openP={0.12} label="" />
        </div>
      ) : null}

      {/* 卡名标签（Java / JAR / APK）—— JAR 为 GlitchIn 本镜唯一 glitch（rgbSplit 4 @3144） */}
      <CText cx={C1.cx} cy={CARD.y + 196} size={30} weight={800} color={WHITE} letterSpacing={1} opacity={softOp(N - (B_JAVA + 14), 8)}>Java</CText>
      <GlitchIn N={N} f0={B_JARLBL} rgbSplit={4} seed={21}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: `${C2.cx}px ${CARD.y + 196}px`}}>
          <CText cx={C2.cx} cy={CARD.y + 196} size={34} weight={900} color={WHITE} letterSpacing={2}>
            JAR
          </CText>
        </div>
      </GlitchIn>
      <CText cx={C3.cx} cy={CARD.y + 196} size={30} weight={800} color={WHITE} letterSpacing={1} opacity={softOp(N - (B_APK + 14), 8)}>APK</CText>

      {/* 两枚大等号（双横线 draw-on，白） */}
      <Svg bloom={false}>
        {EQ.map((eq, k) => {
          const p1 = easeOutCubic(clamp01((N - eq.f0) / 10));
          const p2 = easeOutCubic(clamp01((N - (eq.f0 + 4)) / 10));
          if (p1 <= 0) return null;
          return (
            <g key={k} stroke={WHITE} strokeWidth={5} strokeLinecap="round">
              <line x1={eq.cx - 22} y1={CARD.y + 112} x2={eq.cx - 22 + 44 * p1} y2={CARD.y + 112} />
              {p2 > 0 ? <line x1={eq.cx - 22} y1={CARD.y + 128} x2={eq.cx - 22 + 44 * p2} y2={CARD.y + 128} /> : null}
            </g>
          );
        })}
      </Svg>

      {/* 底部灰字打字机（卡片下方） */}
      {typed > 0 ? (
        <CText cx={640} cy={530} size={24} weight={600} color={GREY} letterSpacing={0.5}>{CAPTION.slice(0, typed)}</CText>
      ) : null}
    </div>
  );
};

export default SC21;
