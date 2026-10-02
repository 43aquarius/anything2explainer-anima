import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_MONO, rnd} from '../../common';
import {SoftIn, abs, exitOp, firstOp, GREY, GREY_LINE, ORANGE, WHITE} from '../../ui';
import {PaneTitle} from './g5ui';

/**
 * SC26 面板③：packet bytes · N 5775–5935（S33 ¶：5783 字节面板 / 5860 原始十六进制）
 * 版式：中央 hexdump 网格 6 行 × 10 字节（mono 26，x 250–1010：左偏移列 0x0000… + hex + 右 ASCII 列）；
 *   目标字节（第 3 行第 5 个）橙点亮 + 下画线 + 强调脉冲（无 glitch，白名单 SC26 零 glitch）。
 * 节拍：5783 网格自上而下逐行 wipe（2 帧错峰，行结构 + `--` 占位）；5860 字节值快速级联点亮（3 字节/帧，
 *   20 帧完成 5880）→ 橙字节脉冲 + 下画线 draw-on；底部 `exactly as it crossed the wire` SoftIn；
 *   行偏移列光标循环下移（5783–5885 后停）。停留：段末 ¶，落位 ~5892 → 离场 5927，35 帧纯静态 ✓。
 */
const F0 = 5775, TO = 5935;
const B_GRID = 5783, B_HEX = 5860;
const GX = 250, OFF_W = 90, CELL_W = 52, ROW_Y0 = 235, PITCH = 44, N_ROWS = 6, N_COLS = 10;
const ASCII_X = GX + OFF_W + 10 + N_COLS * CELL_W + 30;
const TGT = 2 * N_COLS + 4; // 第 3 行第 5 个（0 起）
const T_HEX = B_HEX + Math.floor(TGT / 3);
/** 确定性字节序列（rnd 固定 seed） */
const BYTES = Array.from({length: N_ROWS * N_COLS}, (_, i) => Math.floor(rnd(i + 1, 7) * 256));
const hex = (v: number) => v.toString(16).toUpperCase().padStart(2, '0');
const ascii = (v: number) => (v >= 33 && v <= 126 ? String.fromCharCode(v) : '.');

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const lOp = firstOp(N - F0, 8);
  // 橙字节：脉冲 19 帧 + 下画线 draw-on
  const on = N - T_HEX;
  const pulse = on >= 0 ? emphasisPulse(on, {peak: 1.22, up: 8, hold: 3, down: 8}) : 1;
  const uOp = on >= 0 ? clamp01(on / 8) : 0;
  // 偏移列光标（循环下移；5885 停）
  const cursor = N < 5885 && N >= B_GRID ? Math.floor((N - B_GRID) / 12) % N_ROWS : -1;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <PaneTitle x={100} y={128} no="\u2462" text="packet bytes" sub="raw hexadecimal" op={lOp} />
      <div style={{position: 'absolute', inset: 0, opacity: lOp}}>
        {/* 行偏移列头 + 网格 */}
        {Array.from({length: N_ROWS}, (_, r) => {
          const rp = clamp01((N - (B_GRID + r * 2)) / 8);
          if (rp <= 0) return null;
          const y = ROW_Y0 + r * PITCH;
          const rowDone = N >= B_HEX + Math.floor((r * N_COLS + N_COLS - 1) / 3);
          return (
            <div key={r} style={{...abs(GX, y), clipPath: `inset(0 ${((1 - rp) * 100).toFixed(1)}% 0 0)`, display: 'flex', alignItems: 'baseline', gap: 10}}>
              {/* 偏移 */}
              <span style={{width: OFF_W, fontFamily: FONT_MONO, fontSize: 22, color: cursor === r ? WHITE : GREY, lineHeight: 1, textShadow: cursor === r ? '0 0 8px rgba(255,255,255,.5)' : undefined}}>
                0x{(r * 16).toString(16).padStart(4, '0')}
              </span>
              {/* hex 字节 */}
              {Array.from({length: N_COLS}, (_, c) => {
                const i = r * N_COLS + c;
                const lit = N >= B_HEX + Math.floor(i / 3);
                const isTgt = i === TGT;
                return (
                  <span
                    key={c}
                    style={{
                      width: CELL_W,
                      textAlign: 'center',
                      fontFamily: FONT_MONO,
                      fontSize: 26,
                      lineHeight: 1,
                      color: isTgt && on >= 0 ? ORANGE : lit ? WHITE : GREY_LINE,
                      opacity: lit ? clamp01((N - (B_HEX + Math.floor(i / 3))) / 2) : 0.4,
                      textShadow: isTgt && on >= 0 ? '0 0 14px rgba(240,95,65,.75)' : undefined,
                      display: isTgt ? 'inline-block' : undefined,
                      transform: isTgt && pulse !== 1 ? `scale(${pulse.toFixed(3)})` : undefined,
                    }}
                  >
                    {lit ? hex(BYTES[i]) : '--'}
                  </span>
                );
              })}
              {/* ASCII 列 */}
              <span style={{marginLeft: 30, fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1, opacity: rowDone ? 0.8 : 0}}>
                {BYTES.slice(r * N_COLS, r * N_COLS + N_COLS).map((v) => ascii(v)).join('')}
              </span>
            </div>
          );
        })}
        {/* 橙字节下画线（draw-on） */}
        {on >= 0 ? (
          <div
            style={{
              ...abs(GX + OFF_W + 10 + (TGT % N_COLS) * CELL_W + 8, ROW_Y0 + Math.floor(TGT / N_COLS) * PITCH + 30, CELL_W - 16, 3),
              background: ORANGE,
              transform: `scaleX(${uOp.toFixed(3)})`,
              boxShadow: '0 0 8px rgba(240,95,65,.8)',
            }}
          />
        ) : null}
        {/* 底部说明 */}
        <SoftIn N={N} f0={5884}>
          <div style={{...abs(GX, 545, 780), fontSize: 26, fontWeight: 600, color: GREY, textAlign: 'center'}}>exactly as it crossed the wire</div>
        </SoftIn>
      </div>
    </div>
  );
};
