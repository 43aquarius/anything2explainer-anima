import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, emphasisPulse, FONT_WIDE} from '../../common';
import {CText, ClockIcon, Check, GREY, GREY_LINE, ORANGE, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {VersionPill} from './g5ui';

/**
 * SC34 还更快 · N 4912–5057（S34 4920–5020 ¶：4920 安装还变快了 / 4970 不用再逐个文件走）
 * 左右速度对比：左 `v1` 橙 Pill + 慢条（60 帧才 40%，此后仍缓慢爬行）+ 6 站刻度逐个点亮（呼应 SC30）+ 小时钟慢转；
 * 右 `v2` 紫 Pill + 快条（30 帧到 100%，4950 到头白闪）+ 小时钟快转 + 绿 Check（4970 draw-on）；中间 `vs`。
 * 4970 `faster`（Audiowide 72px 白+紫描边）GlitchIn（rgbSplit 5，本镜唯一 glitch）+ emphasisPulse + 紫光晕。
 * 末 8 帧归零（¶：faster 落位 4970+21=4991 → 离场 5049，稳定 58 帧 ≥30 ✓；分镜表「5022−8」按 S34.to 旧口径，
 * 实际镜头末 5057（G6 SC35 起 5058），按镜头区间执行，见 BUILD_NOTES 偏离记录）。
 * 主角：双进度条 + faster；光：右条紫光 + faster 紫晕。两钟转速差 / 左条爬行 = 持续动作。
 */
export const F0 = 4912;
const TO = 5057;
const B_START = 4920, B_DONE2 = 4950, B_FASTER = 4970, B_PULSE = 4982;

const L = {x: 150, w: 400, y: 330, h: 30}; // 左条（v1 慢）
const R = {x: 730, w: 400, y: 330, h: 30}; // 右条（v2 快）

export const SC34: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  const t = N - B_START;
  // 左条：60 帧到 40% → 之后仍缓慢爬行（v1 还在逐条走）
  const p1 = t < 0 ? 0 : 0.4 * Math.min(t, 60) / 60 + Math.max(0, t - 60) * 0.001;
  // 右条：30 帧到 100%
  const p2 = t < 0 ? 0 : Math.min(1, t / 30);
  const done2Flash = N >= B_DONE2 && N < B_DONE2 + 3 ? 1 - (N - B_DONE2) * 0.3 : 0;

  const trackOp = softOp(N - (F0 + 6), 8);
  const vsOp = softOp(N - B_START, 8);
  const checkP = clamp01((N - B_FASTER) / 12);
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.11, up: 13, hold: 4, down: 13});
  const fg = 14 + 8 * Math.sin((2 * Math.PI * N) / 30); // faster 紫晕呼吸

  const bar = (b: {x: number; w: number; y: number; h: number}, p: number, color: string, glow: string) => (
    <div
      style={{
        position: 'absolute',
        left: b.x,
        top: b.y - b.h / 2,
        width: b.w,
        height: b.h,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.55)',
        border: `2px solid ${GREY_LINE}`,
        borderRadius: 6,
      }}
    >
      {p > 0.003 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 3,
            width: b.w * p,
            height: b.h - 6,
            background: color,
            opacity: 0.85,
            borderRadius: 4,
            boxShadow: glow,
          }}
        />
      ) : null}
    </div>
  );

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 两个版本 Pill（v1 橙 = SC29 同款；v2 紫 = SC31 同款） */}
      <VersionPill x={150} y={132} w={104} h={48} text="v1" color={ORANGE} glowColor="rgba(240,95,65,.55)" n={N - B_START} />
      <VersionPill x={940} y={121} w={150} h={70} text="v2" color={PURPLE} glowColor="rgba(102,48,248,.6)" n={N - (B_START + 2)} />

      {/* vs */}
      {vsOp > 0 ? (
        <CText cx={640} cy={345} size={48} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={2} opacity={vsOp}>
          vs
        </CText>
      ) : null}

      {/* 左条：v1 慢（6 站刻度 = SC30 的逐条回声；爬行到 40% 后仍缓慢前进） */}
      {trackOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: trackOp}}>
          {bar(L, p1, ORANGE, '0 0 10px 2px rgba(240,95,65,.4)')}
          {[1, 2, 3, 4, 5, 6].map((i) => {
            const passed = p1 >= 0.15 * i - 0.001;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: L.x + L.w * 0.15 * i - 1.5,
                  top: L.y - L.h / 2 - 4,
                  width: 3,
                  height: L.h + 8,
                  background: passed ? ORANGE : GREY_LINE,
                  opacity: passed ? 0.95 : 0.8,
                  boxShadow: passed ? '0 0 7px 2px rgba(240,95,65,.5)' : undefined,
                }}
              />
            );
          })}
          {/* v1 爬行光标（小橙方块随条尾前进） */}
          {p1 > 0.003 ? (
            <div
              style={{
                position: 'absolute',
                left: L.x + L.w * p1 - 4,
                top: L.y - L.h / 2 - 7,
                width: 8,
                height: L.h + 14,
                background: ORANGE,
                borderRadius: 2,
                boxShadow: '0 0 10px 2px rgba(240,95,65,.7)',
              }}
            />
          ) : null}

          {/* 右条：v2 快（30 帧到 100%；到头白闪 + 紫光保持） */}
          {bar(R, p2, PURPLE_LIGHT, `0 0 ${p2 >= 1 ? 14 : 8}px 3px rgba(161,117,241,${(0.35 + 0.35 * p2).toFixed(2)})`)}
          {p2 >= 1 ? (
            <div
              style={{
                position: 'absolute',
                left: R.x + R.w - 3,
                top: R.y - R.h / 2 - 7,
                width: 6,
                height: R.h + 14,
                background: WHITE,
                borderRadius: 2,
                boxShadow: `0 0 14px 4px rgba(255,255,255,${(0.55 + 0.3 * done2Flash).toFixed(2)})`,
                filter: done2Flash > 0 ? `brightness(${1 + done2Flash})` : undefined,
              }}
            />
          ) : null}

          {/* 小时钟（左慢右快，转速差持续） */}
          <ClockIcon cx={350} cy={455} r={44} N={Math.max(0, (N - (B_START + 2)) * 0.18)} accent={ORANGE} opacity={softOp(N - (B_START + 2), 8)} />
          <ClockIcon cx={930} cy={455} r={44} N={Math.max(0, (N - (B_START + 4)) * 1.2)} accent={PURPLE_LIGHT} opacity={softOp(N - (B_START + 4), 8)} />
        </div>
      ) : null}

      {/* 绿 Check（右条到头 + 第二拍落定） */}
      {checkP > 0 ? (
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 8px rgba(143,247,64,.7))'}}>
          <Check cx={1160} cy={330} size={40} sw={7} p={checkP} />
        </div>
      ) : null}

      {/* faster（Audiowide 72px 白+紫描边；GlitchIn rgbSplit 5 = 本镜唯一 glitch + emphasisPulse + 紫晕呼吸） */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 553px', transform: `scale(${pulse.toFixed(4)})`}}>
        <GlitchIn N={N} f0={B_FASTER} rgbSplit={5} seed={34}>
          <CText
            cx={640}
            cy={553}
            size={72}
            weight={400}
            family={FONT_WIDE}
            letterSpacing={3}
            color={WHITE}
            shadow={`0 0 ${fg.toFixed(1)}px rgba(102,48,248,${(0.55 * gk).toFixed(2)}), 0 0 30px rgba(102,48,248,${(0.35 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill'}}
          >
            faster
          </CText>
        </GlitchIn>
      </div>
    </div>
  );
};

export default SC34;
