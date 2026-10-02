import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO, FONT_ORB, stepKf} from '../../common';
import {EXAMPLE, WSWindow, WSRow, abs, exitOp, firstOp, glowOffK, glowPurpleS, GREY, GREY_LINE, ORANGE, PURPLE_LIGHT, WHITE} from '../../ui';
import {PaneTitle} from './g5ui';

/**
 * SC24 面板①：packet list · N 5353–5537（S31 5361 每包一行 / 5441 时间源目协议）
 * 版式：窗口缩到 0.33 于右上角（x877–1220, y112–264，不与列表重叠；分镜表参考 0.55，为容纳 6 行×52px 列表微调）；
 *   主区放大列表：表头 y264 + 6 行 WSRow（x100 w1040，行 y308–620，EXAMPLE.wsRows 全套）；顶栏 `① packet list` + 行号计数器。
 * 节拍：5353–5369 承接位移 16 帧（窗口缩角 + 列表组 0.75→1 展开）；5359 表头逐列 wipe；5361 起数据行逐行
 *   wipe（2 帧错峰）+ 计数器 806→814 跳动（812 落位时橙闪）；5441 当前行（第 3 行 808）放大 1.15 + 紫光 +
 *   高亮条 24 帧/扫 ×2 循环 + 表头 Time/Source/Destination/Protocol 依次白闪；
 *   末 8 帧先灭光再归零。停留：段内不判（扫描收尾 5489 → 离场 5529）。零 glitch。
 */
const F0 = 5353, TO = 5537;
const B_ROWS = 5361, B_COLS = 5441;
const LIST = {x: 100, w: 1040, headY: 264, rowY0: 308, pitch: 52, n: 6};
const ACTIVE = 2; // 第 3 行 = 808（服务器 → 客户端的应答行）
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
const HEADS = [
  {t: 'No.', x: 18, w: 64},
  {t: 'Time', x: 92, w: 96},
  {t: 'Source', x: 198, w: 220},
  {t: 'Destination', x: 428, w: 220},
  {t: 'Protocol', x: 658, w: 130},
  {t: 'Info', x: 798, w: 160},
];
const FLASH_COLS = [1, 2, 3, 4]; // Time / Source / Destination / Protocol（对齐 5441 节拍词）

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const gk = glowOffK(N, TO, 6, 8);
  const op = exitOp(N, TO, 8);
  // 承接位移：窗口 1→0.33 缩到右上角 (877,112)
  const e = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const ws = 1 + (0.33 - 1) * e;
  const wtx = (877 - 120) * (1 - e), wty = (112 - 150) * (1 - e);
  const wOp = firstOp(N - F0, 6);
  // 列表组 0.75→1 展开（向右上小窗方向生长）
  const ls = 0.75 + 0.25 * e;
  const lOp = firstOp(N - F0, 8);
  // 行号计数器：随行落位 806→814
  const cnt = stepKf(N, [[B_ROWS, 806], [B_ROWS + 2, 807], [B_ROWS + 4, 808], [B_ROWS + 6, 812], [B_ROWS + 8, 813], [B_ROWS + 10, 814]]);
  const cntOrange = N >= B_ROWS + 6 && N < B_ROWS + 6 + 12;
  // 当前行：5441 起放大 + 紫光
  const an = N - B_COLS;
  const actS = an < 0 ? 1 : 1 + 0.15 * (1 - Math.pow(1 - clamp01(an / 14), 3));
  // 高亮条横向扫（24 帧/扫，循环 2 次）
  const swN = an >= 0 ? an : -1;
  const sweepOn = swN >= 0 && swN < 48;
  const sweepX = sweepOn ? -180 + ((swN % 24) / 24) * (LIST.w + 180) : -999;

  const rowWrapper = (i: number, children: React.ReactNode, extra?: React.CSSProperties) => {
    const rp = clamp01((N - (B_ROWS + i * 2)) / 10);
    if (rp <= 0) return null;
    return (
      <div key={i} style={{...abs(LIST.x, LIST.rowY0 + i * LIST.pitch, LIST.w, LIST.pitch), clipPath: `inset(0 ${((1 - rp) * 100).toFixed(1)}% 0 0)`, ...extra}}>
        {children}
      </div>
    );
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 缩角的整窗（配角，右上） */}
      <div style={{position: 'absolute', inset: 0, opacity: wOp, transformOrigin: '120px 150px', transform: `translate(${wtx.toFixed(1)}px,${wty.toFixed(1)}px) scale(${ws.toFixed(4)})`}}>
        <WSWindow x={120} y={150} w={1040} h={460} paneBorders={[true, false, false]} />
      </div>
      {/* 放大的列表组（主角） */}
      <div style={{position: 'absolute', inset: 0, opacity: lOp, transformOrigin: '1000px 240px', transform: ls < 1 ? `scale(${ls.toFixed(4)})` : undefined}}>
        <PaneTitle x={LIST.x} y={128} no="\u2460" text="packet list" sub="one row per packet" />
        {/* 行号计数器 */}
        <div style={{...abs(600, 128)}}>
          <div style={{fontFamily: FONT_ORB, fontSize: 44, fontWeight: 700, color: cntOrange ? ORANGE : WHITE, letterSpacing: 2, lineHeight: 1, textShadow: cntOrange ? '0 0 18px rgba(240,95,65,.6)' : undefined, fontVariantNumeric: 'tabular-nums'}}>{cnt}</div>
          <div style={{marginTop: 8, fontSize: 22, fontWeight: 600, color: GREY, lineHeight: 1}}>packets</div>
        </div>
        {/* 表头（逐列 wipe + 节拍白闪） */}
        <div style={{...abs(LIST.x, LIST.headY, LIST.w, 44), borderBottom: `2px solid ${GREY_LINE}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10}}>
          {HEADS.map((h, i) => {
            const hp = clamp01((N - (B_ROWS - 2 + i)) / 8);
            if (hp <= 0) return null;
            const fl = FLASH_COLS.includes(i) ? tri(N - (B_COLS + 4 + FLASH_COLS.indexOf(i) * 6), 10) : 0;
            return (
              <span key={h.t} style={{width: h.w, fontFamily: FONT_MONO, fontSize: 22, color: fl > 0 ? PURPLE_LIGHT : GREY, lineHeight: 1, opacity: hp, textShadow: fl > 0 ? '0 0 10px rgba(161,117,241,.8)' : undefined}}>
                {h.t}
              </span>
            );
          })}
        </div>
        {/* 普通数据行（非当前行，逐行 wipe） */}
        {Array.from({length: LIST.n}, (_, i) => (i === ACTIVE ? null : rowWrapper(i, <WSRow x={0} y={0} w={LIST.w} row={EXAMPLE.wsRows[i]} />)))}
        {/* 当前行（最后画 = 置顶；放大 1.15 + 紫光 + 高亮条扫） */}
        {an >= 0
          ? rowWrapper(
              ACTIVE,
              <>
                <div style={{...abs(-4, 2, LIST.w + 8, LIST.pitch - 4), boxShadow: glowPurpleS(gk * (0.85 + 0.15 * Math.sin((N / 30) * Math.PI * 2)))}} />
                {sweepOn ? <div style={{...abs(sweepX, 0, 180, LIST.pitch), background: 'rgba(102,48,248,.32)'}} /> : null}
                <div style={{position: 'absolute', inset: 0, transformOrigin: '520px 50%', transform: `scale(${actS.toFixed(4)})`}}>
                  <WSRow x={0} y={0} w={LIST.w} row={EXAMPLE.wsRows[ACTIVE]} active />
                </div>
              </>,
            )
          : rowWrapper(ACTIVE, <WSRow x={0} y={0} w={LIST.w} row={EXAMPLE.wsRows[ACTIVE]} />)}
      </div>
    </div>
  );
};
