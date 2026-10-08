import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {abs, Box, EXAMPLE, BLOOM_SOFT, GREEN, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, TEXT_GLOW, WHITE} from '../../ui';

/**
 * G8b 组内图元（第 4 章下半 + 片尾：SC55–SC59）。
 * - TERM / TerminalCard：终端窗口卡（SC57/SC58 共用；**绝对帧驱动**——打字机 / 光标 / 高亮 / 变暗全部由
 *   绝对帧号 N 推导 → SC57 末帧 8713 与 SC58 首帧 8714 渲染同一状态，交界帧像素一致（承接不清场））。
 * - EnvelopeGlyph：小信封（SC59 片尾右行，zip 母题回扣）。
 * - MagnifierGlyph：简笔放大镜（SC55 在照片边缘巡查）。
 */

// ---- 终端卡（SC57 / SC58 共用的绝对帧常量）----
export const TERM = {
  x: 240, y: 180, w: 800, h: 320, // 卡体（分镜表：x 240–1040, y 180–500）
  T_TYPE1: 8589, // `$ cd /data/app/com.example.chat` 每 2 帧 1 字（S57.c1 8585 卡滑入后即打）
  T_L2: 8651, // 命令 1 打完（8589 + 2×31），光标落到第二行提示符
  T_TYPE2: 8653, // `$ xxd base.apk | head -1`（S57.c2 8659 的 −6 容差内，为结果行留出帧）
  T_RESULT: 8710, // 回车后 ~300ms（9 帧）结果行出现
  T_HL: 8722, // `504b` 高亮 wipe 12 帧（S58.c1）——首 4 字符「待亮」→ 变紫
  T_DIM: 8779, // 其余行变暗 35%（P, K 落位，S58.c2）
  CMD1: `$ cd ${EXAMPLE.dataApp}/${EXAMPLE.appPkg}`,
  CMD2: `$ xxd ${EXAMPLE.splitBase} | head -1`,
  RES_OFF: '00000000: ',
  RES_TAIL: ' 0304 ...',
  L1: 84, L2: 138, RES: 226, P3: 280, // 行顶（卡内坐标，mono 24px）
};
const CHW = 14.4; // mono 24px 字宽（0.6em）
const CURSOR_W = 14, CURSOR_H = 26;

/** 终端窗口卡：黑底白边圆角 + 顶栏 `shell` + 两行命令打字机 + 结果行（504b 高亮）+ 闪烁光标 + 边框白光呼吸。 */
export const TerminalCard: React.FC<{N: number; y?: number; opacity?: number}> = ({N, y = TERM.y, opacity = 1}) => {
  // 打字机（每 2 帧 1 字；未打时显示 `$ ` 提示符）
  const c1 = Math.max(0, Math.floor((N - TERM.T_TYPE1) / 2));
  const t1 = N < TERM.T_TYPE1 ? '$ ' : TERM.CMD1.slice(0, Math.min(Math.max(c1, 2), TERM.CMD1.length));
  const c2 = Math.max(0, Math.floor((N - TERM.T_TYPE2) / 2));
  const t2 = N < TERM.T_TYPE2 ? '$ ' : TERM.CMD2.slice(0, Math.min(Math.max(c2, 2), TERM.CMD2.length));
  const resOp = clamp01((N - TERM.T_RESULT) / 6);
  // 504b 高亮 wipe（12 帧）+ 其余行变暗 35%（12 帧）
  const hlP = clamp01((N - TERM.T_HL) / 12);
  const dim = 1 - 0.35 * clamp01((N - TERM.T_DIM) / 12);
  // 光标：打字中常亮，闲置 16 帧周期闪烁（10 亮 6 灭）
  const typing = (N >= TERM.T_TYPE1 && c1 < TERM.CMD1.length) || (N >= TERM.T_TYPE2 && c2 < TERM.CMD2.length);
  const blinkOn = typing || N % 16 < 10;
  const cursor = blinkOn ? (
    <span style={{display: 'inline-block', width: CURSOR_W, height: CURSOR_H, background: GREEN, marginLeft: 3, verticalAlign: '-2px', boxShadow: '0 0 8px rgba(143,247,64,.55)'}} />
  ) : null;
  const curLine = N >= TERM.T_RESULT ? 3 : N >= TERM.T_L2 ? 2 : 1;
  // 边框白光呼吸（30 帧周期）
  const glowA = 0.10 + 0.05 * (1 - 0.8 * clamp01((N - 8800) / 10)) * Math.sin((2 * Math.PI * N) / 30); // 8800 后幅度收敛到 20%（SC58 停留稳定期）
  return (
    <div style={{...abs(TERM.x, y, TERM.w, TERM.h), opacity}}>
      <Box x={0} y={0} w={TERM.w} h={TERM.h} r={12} stroke={WHITE} sw={2.5} fill="rgba(0,0,0,0.92)" glow={`0 0 16px 5px rgba(255,255,255,${glowA.toFixed(3)})`} />
      {/* 顶栏 shell */}
      <div style={{...abs(0, 0, TERM.w, 44), borderBottom: `2px solid ${GREY_MID}`, opacity: dim}} />
      <span style={{position: 'absolute', left: 28, top: 11, fontFamily: FONT_MONO, fontSize: 20, color: GREY}}>shell</span>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: TERM.w - 32 - i * 24, top: 17, width: 10, height: 10, borderRadius: '50%', border: `2px solid ${i === 2 ? GREY : GREY_MID}`}} />
      ))}
      {/* 命令行 1（8589 起打字机） */}
      <div style={{...abs(40, TERM.L1, TERM.w - 80), fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: WHITE, whiteSpace: 'pre', opacity: dim}}>
        {t1}
        {curLine === 1 ? cursor : null}
      </div>
      {/* 命令行 2（8651 提示符 / 8653 起打字机） */}
      {N >= TERM.T_L2 ? (
        <div style={{...abs(40, TERM.L2, TERM.w - 80), fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: WHITE, whiteSpace: 'pre', opacity: dim}}>
          {t2}
          {curLine === 2 ? cursor : null}
        </div>
      ) : null}
      {/* 结果行（回车后出现；504b 高亮变紫 wipe，其余 dim） */}
      {resOp > 0 ? (
        <div style={{...abs(40, TERM.RES, TERM.w - 80), display: 'flex', alignItems: 'flex-start', opacity: resOp}}>
          <span style={{fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: GREY_MID, width: TERM.RES_OFF.length * CHW, flexShrink: 0, opacity: dim}}>{TERM.RES_OFF}</span>
          <span style={{position: 'relative', display: 'inline-block', width: 4 * CHW, flexShrink: 0}}>
            {hlP > 0 ? <span style={{position: 'absolute', left: -2, top: 0, width: 4 * CHW * hlP, height: 30, background: PURPLE, borderRadius: 4, boxShadow: `0 0 12px rgba(102,48,248,${(0.55 * hlP).toFixed(2)})`}} /> : null}
            <span style={{position: 'relative', fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: WHITE, textShadow: hlP > 0.2 ? TEXT_GLOW : 'none', fontWeight: hlP > 0.2 ? 700 : 400}}>504b</span>
          </span>
          <span style={{fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: GREY, whiteSpace: 'pre', opacity: dim}}>{TERM.RES_TAIL}</span>
        </div>
      ) : null}
      {/* 结果后的新提示行（$ + 闪烁光标，持续动作到下一拍） */}
      {resOp > 0 ? (
        <div style={{...abs(40, TERM.P3, TERM.w - 80), fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.25, color: WHITE, whiteSpace: 'pre', opacity: dim}}>
          {'$ '}
          {curLine === 3 ? cursor : null}
        </div>
      ) : null}
    </div>
  );
};

/** 小信封（片尾右行）：白描边 + 紫色封盖折线；accent 时带紫柔光。 */
export const EnvelopeGlyph: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number; accent?: boolean}> = ({cx, cy, w = 46, h = 32, opacity = 1, accent = false}) => (
  <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: accent ? 'drop-shadow(0 0 6px rgba(102,48,248,.55))' : BLOOM_SOFT}}>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={3} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M3.5,4.5 L${w / 2},${h * 0.62} L${w - 3.5},4.5`} fill="none" stroke={accent ? PURPLE_LIGHT : WHITE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </div>
);

/** 简笔放大镜：镜头圆 + 45° 手柄 + 镜片内高光弧（白线条）。 */
export const MagnifierGlyph: React.FC<{cx: number; cy: number; r?: number; opacity?: number}> = ({cx, cy, r = 30, opacity = 1}) => {
  const s = r / 30;
  return (
    <div style={{...abs(cx - 50 * s, cy - 50 * s, 100 * s, 100 * s), opacity}}>
      <svg width={100 * s} height={100 * s} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g transform={`scale(${s.toFixed(3)})`}>
          <circle cx={34} cy={34} r={27} fill="rgba(255,255,255,0.05)" stroke={WHITE} strokeWidth={3.5} />
          <line x1={54} y1={54} x2={80} y2={80} stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
          <path d="M20,36 A17,17 0 0 1 34,20" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        </g>
      </svg>
    </div>
  );
};
