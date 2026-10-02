import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, FONT_MONO, FONT_TECH} from '../../common';
import {CText, Box, WHITE, PURPLE, PURPLE_TECH, PURPLE_LIGHT, ORANGE, GREY, GREY_LINE, GREY_LIGHT, SoftIn, fadeIn, exitOp} from '../../ui';

/**
 * SC10 重播整场对话 · N 1642–2021（S11 1650–1822 + S12 1833–1999）
 * 版式：中央「重播条」= 播放器卡（x 230–1050，y 285–375）：内部一条白时间轴 + 轴上 8 个字节块（22px，2 帧错峰随 wipe 弹出）+
 *   左端紫色播放三角（本镜唯一 glitch）+ 播放头光标沿轴扫动；条下方左侧时间码 `t = X.XXX s`（等宽 24 灰，随播放头跳到 9.010）；
 *   上方小灰标 `bytes · timestamps`（1767）；下方三枚用途 Pill：debug / security / our mystery（y 470，各对齐节拍）。
 * 节拍：1650 播放条 wipe draw-on（20 帧）+ 字节块错峰弹出；1699 播放三角 GlitchIn → 字节块从头到尾依次点亮（当前块橙色）+
 *   时间码跳动 + 光标扫动（持续动作）；1767 `bytes · timestamps` SoftIn；
 *   1833/1888/1937 三 Pill 依次 SoftIn（our mystery 出现时紫光点亮）；
 *   重播循环：全亮后停 20 帧 → 6 帧清零 → 重播（扫程 135 帧 × 2 轮：1699 / 1860，第二轮 1995 全亮后保持到离场）。
 * 停留：段末（S12 ¶）末 Pill 落位 1937+8 → 离场 2021−8。末 8 帧归零。
 */
const F0 = 1642, TO = 2021;
const T_STRIP = 1650, T_PLAY = 1699, T_LABEL = 1767;
const PILL_AT = [1833, 1888, 1937];
const SWEEP = 135, HOLD = 20, CLEAR = 6; // 一轮 = 扫 135 + 停 20 + 清 6
const CYCLE2 = T_PLAY + SWEEP + HOLD + CLEAR + 1; // 1861
const N_BLOCKS = 8;
const CARD = {x: 230, y: 285, w: 820, h: 90};
const AXIS = {x0: 285, x1: 1035, y: 330};
const BLOCK = 22;
const TOTAL_S = 9.01; // 示例：整场对话 ≈ 9.0 s（与研究文档的示意数字一致）
const PILLS: Array<[string, number, number]> = [
  ['debug', 430, 130],
  ['security', 640, 172],
  ['our mystery', 850, 212],
];

/** 播放头进度 0→1（两轮重播；第二轮全亮后保持 1） */
const playP = (N: number): number => {
  if (N < T_PLAY) return 0;
  const c1 = N - T_PLAY; // 第一轮
  if (c1 < SWEEP + HOLD) return clamp01(c1 / SWEEP);
  if (c1 < SWEEP + HOLD + CLEAR) return 1 - clamp01((c1 - SWEEP - HOLD) / CLEAR) * 0.999; // 清零段
  const c2 = N - CYCLE2; // 第二轮
  if (c2 < SWEEP) return clamp01(c2 / SWEEP);
  return 1;
};

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const sn = N - T_STRIP;
  // 播放条 wipe：自左展宽 20 帧
  const stripP = sn < 0 ? 0 : 1 - Math.pow(1 - clamp01(sn / 20), 2.5);
  const p = playP(N);
  // 时间码：随播放头 0 → 9.010 s（清零段回落）
  const t = p * TOTAL_S;
  // 播放头 x
  const phX = AXIS.x0 + (AXIS.x1 - AXIS.x0) * p;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 播放器卡（重播条主体） */}
      {sn >= 0 ? (
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={14} sw={2.5} opacity={fadeIn(sn, 10)} />
      ) : null}
      {/* 时间轴（wipe 自左） */}
      {stripP > 0 ? (
        <div style={{position: 'absolute', left: AXIS.x0, top: AXIS.y - 1.25, width: (AXIS.x1 - AXIS.x0) * stripP, height: 2.5, background: WHITE, opacity: 0.85}} />
      ) : null}
      {/* 播放三角（本镜唯一 glitch，紫色） */}
      {N >= T_PLAY ? (
        <GlitchIn N={N} f0={T_PLAY} seed={10}>
          <svg width={64} height={64} viewBox="0 0 64 64" style={{position: 'absolute', left: 246, top: AXIS.y - 32, overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(102,45,248,.65))'}}>
            <polygon points="6,6 6,58 56,32" fill={PURPLE} stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
          </svg>
        </GlitchIn>
      ) : null}
      {/* 字节块：随 wipe 弹出（2 帧错峰）；播放头经过时点亮（当前块橙色） */}
      {Array.from({length: N_BLOCKS}, (_, i) => {
        const bx = AXIS.x0 + 47 + i * 94;
        const popN = sn - Math.round(((bx - BLOCK / 2 - AXIS.x0) / (AXIS.x1 - AXIS.x0)) * 20);
        if (popN < 0) return null;
        const s = 0.6 + 0.4 * clamp01(popN / 6);
        const lit = p > (i + 0.12) / N_BLOCKS;
        const cur = !lit ? p > i / N_BLOCKS : p < (i + 1) / N_BLOCKS;
        const nowLit = lit || cur;
        return (
          <div key={i} style={{position: 'absolute', left: bx - (BLOCK * s) / 2, top: AXIS.y - (BLOCK * s) / 2, width: BLOCK * s, height: BLOCK * s, opacity: fadeIn(popN, 4)}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxSizing: 'border-box',
                borderRadius: 4,
                background: nowLit ? (cur ? ORANGE : WHITE) : '#000',
                border: `2px solid ${nowLit ? (cur ? ORANGE : WHITE) : GREY_LINE}`,
                boxShadow: cur ? '0 0 16px 4px rgba(240,95,65,.5)' : undefined,
              }}
            />
          </div>
        );
      })}
      {/* 播放头光标（紫线 + 上端小三角，持续扫动） */}
      {N >= T_PLAY ? (
        <div style={{position: 'absolute', left: phX - 1.25, top: AXIS.y - 24, width: 2.5, height: 48, background: PURPLE_LIGHT, boxShadow: '0 0 10px 2px rgba(161,117,241,.6)'}}>
          <div style={{position: 'absolute', left: -5.5, top: -9, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `9px solid ${PURPLE_LIGHT}`}} />
        </div>
      ) : null}
      {/* 上方小灰标 bytes · timestamps（1767） */}
      {N >= T_LABEL ? (
        <CText cx={640} cy={264} size={22} weight={600} color={GREY} opacity={fadeIn(N - T_LABEL, 8)}>
          bytes · timestamps
        </CText>
      ) : null}
      {/* 时间码（随播放头跳动） */}
      {sn >= 0 ? (
        <div style={{position: 'absolute', left: CARD.x + 4, top: 392, fontFamily: FONT_MONO, fontSize: 24, color: GREY_LIGHT, lineHeight: 1.2, whiteSpace: 'pre', opacity: fadeIn(sn, 10)}}>
          {`t = ${t.toFixed(3)} s`}
        </div>
      ) : null}
      {/* 三枚用途 Pill（各对齐节拍；our mystery 紫光） */}
      {PILLS.map(([text, cx, w], i) => (
        <SoftIn key={text} N={N} f0={PILL_AT[i]}>
          <Box x={cx - w / 2} y={470} w={w} h={46} r={23} sw={2} glow={i === 2 ? '0 0 24px 8px rgba(102,45,248,.55)' : undefined}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_TECH,
                fontStyle: 'italic',
                fontSize: 27,
                letterSpacing: 1,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transform: 'translateY(-1px)',
                textShadow: '0 0 6px rgba(80,30,200,.7)',
              }}
            >
              <span style={{color: WHITE, fontWeight: 900, fontSize: 31}}>{text[0]}</span>
              <span style={{color: PURPLE_TECH, fontWeight: 600}}>{text.slice(1)}</span>
            </div>
          </Box>
        </SoftIn>
      ))}
    </div>
  );
};
