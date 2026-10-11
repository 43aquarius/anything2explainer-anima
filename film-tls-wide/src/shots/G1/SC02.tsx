import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, powOutRemain, FONT_MONO} from '../../common';
import {Box, EyeGlyph, MonoText, CText, Svg, PURPLE, ORANGE, GREY, GREY_LINE, WHITE, EXAMPLE, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC02 明文清单（292–443）。S03。
 * 节拍：300 清单卡 slideUp Δ100 + 前两行 wipe 入｜362 其余行 2 帧错峰亮起 + 密码行橙高亮脉冲
 *       （`pw=cafe2026` 白闪 4 帧）｜411 `plain text` 大字 GlitchIn（rgbSplit 4，本镜唯一 glitch）
 *       + 双眼睁大（open 0.3→1，8 帧）后轻微眨眼循环（30 帧周期）｜此后清单行保持缓慢滚动（持续）。
 * 主角：清单卡 470px（白描边 BLOOM）；密码行橙光晕、`plain text` 紫描边。无运镜。
 */
const F0 = 292;
const TO = 443;

const CARD = {x: 140, y: 150, w: 1000, h: 470}; // y 150–620
const ROW_TOP = 233; // 首行顶（全局）
const ROW_H = 50;
const N_ROWS = 7;

/** 行内容（来自 EXAMPLE.capRows 的示意抓包行；5–7 行重复 GET 节奏表现"抓个不停"，时间戳延续示意节奏） */
const ROWS: Array<{t: string; info: string; pw?: boolean}> = [
  {t: EXAMPLE.capRows[0].t, info: 'GET /login'},
  {t: EXAMPLE.capRows[1].t, info: 'POST /login user=you pw=cafe2026', pw: true},
  {t: EXAMPLE.capRows[2].t, info: 'GET /cart'},
  {t: EXAMPLE.capRows[3].t, info: 'GET /checkout'},
  {t: '0.207', info: 'GET /cart'},
  {t: '0.249', info: 'GET /checkout'},
  {t: '0.290', info: 'GET /login'},
];

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 清单卡 slideUp Δ100 / 22 帧
  const cn = N - 300;
  const cardDy = 100 * powOutRemain(cn, 22, 2.5);
  const cardOp = fadeIn(cn, 6);

  // 眼睛：300 起半睁（0.3）→ 411 起 8 帧睁大 → 之后轻微眨眼循环（错峰 15 帧）
  const eyeOpen = (phase: number) => {
    if (N < 411) return 0.3;
    if (N < 419) return 0.3 + 0.7 * clamp01((N - 411) / 8);
    const t = (N + phase) % 30;
    return t < 5 ? Math.max(0.3, 1 - Math.sin((Math.PI * t) / 5) * 0.7) : 1;
  };

  // 密码行橙脉冲（362 落定后常亮微光）+ pw 白闪 4 帧
  const pwPulse = N >= 362 ? Math.max(0, 1 - (N - 362) / 16) : 0;
  const pwFlash = N >= 362 && N < 366;
  const pwGlow = glowK * (0.5 + 0.5 * pwPulse);

  // 行滚动（411 起缓慢，1 行/30 帧，7 行周期 → 末尾补 2 行无缝）
  const scroll = N > 420 ? ROW_H * (((N - 411) / 30) % N_ROWS) : 0;

  return (
    <div style={abs(0, 0, 1280, 720)}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
        {/* ---- 清单卡（主角，白描边 BLOOM + 白柔光）---- */}
        <div style={{...abs(CARD.x - 8, CARD.y - 8, CARD.w + 16, CARD.h + 16), borderRadius: 14, boxShadow: `0 0 14px 4px rgba(255,255,255,${(0.12 * glowK).toFixed(3)}), 0 0 40px 12px rgba(255,255,255,${(0.08 * glowK).toFixed(3)})`, filter: 'drop-shadow(0 0 3px rgba(255,255,255,.5))', opacity: cardOp}} />
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={10} fill="#000" stroke={WHITE} sw={2.5} opacity={cardOp} />

        {/* 行区（含网格线；overflow 裁剪滚动） */}
        <div style={{...abs(CARD.x + 1, ROW_TOP, CARD.w - 2, N_ROWS * ROW_H + 6), opacity: cardOp, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${(-scroll).toFixed(1)}px)`}}>
            {ROWS.concat(ROWS.slice(0, 2)).map((r, i) => {
              const first = i < N_ROWS ? i : i - N_ROWS; // 重复行的入场沿用原行
              const on = first < 2 ? clamp01((N - (302 + first * 2)) / 10) : clamp01((N - (362 + (first - 2) * 2)) / 8);
              const wipe = first < 2 ? on : 1; // 前两行 wipe，其余淡入
              return (
                <div key={i} style={{...abs(0, i * ROW_H, CARD.w, ROW_H), opacity: on}}>
                  {/* 行底色：密码行橙高亮（含脉冲） */}
                  {r.pw ? (
                    <div style={{...abs(30, 2, CARD.w - 60, ROW_H - 4), background: `rgba(240,95,65,${(0.07 + 0.1 * pwPulse).toFixed(3)})`, borderLeft: `4px solid ${ORANGE}`, boxShadow: pwGlow > 0 ? `0 0 ${18 * pwGlow}px ${6 * pwGlow}px rgba(240,95,65,${(0.4 * pwGlow).toFixed(2)})` : 'none'}} />
                  ) : null}
                  <div style={{...abs(64, ROW_H / 2 - 16, CARD.w - 120, 32), clipPath: `inset(0 ${((1 - wipe) * 100).toFixed(1)}% 0 0)`}}>
                    <MonoText x={0} y={4} size={24} color={GREY}>{r.t}</MonoText>
                    {r.pw ? (
                      <MonoText x={106} y={4} size={24} color={WHITE}>
                        {'POST /login user=you '}
                        <span style={{color: pwFlash ? '#FFFFFF' : ORANGE, textShadow: pwFlash ? '0 0 14px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' : undefined, filter: pwFlash ? 'brightness(1.6)' : undefined}}>pw=cafe2026</span>
                      </MonoText>
                    ) : (
                      <MonoText x={106} y={4} size={24} color={WHITE}>{r.info}</MonoText>
                    )}
                  </div>
                </div>
              );
            })}
            {/* 网格线（随行滚动） */}
            <Svg bloom={false}>
              {Array.from({length: 10}, (_, i) => (
                <line key={i} x1={44} x2={CARD.w - 44} y1={(i + 1) * ROW_H} y2={(i + 1) * ROW_H} stroke={GREY_LINE} strokeWidth={1} opacity={i < 8 ? 0.85 : 0} />
              ))}
            </Svg>
          </div>
        </div>

        {/* ---- 标题 plain text（411 GlitchIn rgbSplit 4，白 + 紫描边）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: cardOp}}>
          <GlitchIn N={N} f0={411} rgbSplit={4}>
            <CText cx={640} cy={206} size={56} weight={900} color={WHITE} letterSpacing={1} style={{WebkitTextStroke: `2.5px ${PURPLE}`, paintOrder: 'stroke fill', textShadow: `0 0 22px rgba(102,45,248,${(0.5 * glowK).toFixed(2)})`}}>plain text</CText>
          </GlitchIn>
        </div>

        {/* ---- 左右上角眼睛（半睁 → 睁大 → 眨眼）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: cardOp}}>
          <EyeGlyph cx={205} cy={207} w={56} open={eyeOpen(0)} />
          <EyeGlyph cx={1075} cy={207} w={56} open={eyeOpen(15)} />
        </div>
      </div>
    </div>
  );
};
