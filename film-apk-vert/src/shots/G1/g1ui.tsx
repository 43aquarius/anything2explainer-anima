import React from 'react';
import {clamp01, easeOutCubic, powOutRemain, FONT_MONO} from '../../common';
import {Box, EXAMPLE, PURPLE, PURPLE_LIGHT, RED_DEEP, GREY, GREY_LINE, WHITE, TEXT_GLOW, abs, firstOp, exitOp} from '../../ui';

/**
 * G1 组内图元（竖版 720×1280，安全区 x40–620 / y240–990，中轴 x=360；画面帧号 N 为绝对帧）。
 *   FilenameCard   改名文件名卡（SC01 入场→选中→交换→白闪的时间线封装在组件内；SC02 按同参数渲染，
 *                  交界帧与 SC01 相机末态一致 —— 承接靠外层容器复现相机变换，见 SC02）
 *   VertHex        竖版十六进制窗（5 行 × 8 字节格，首两格 50 4B 高亮）。共用 HexDump 为 12 列，
 *                  在竖版安全宽度内必然溢出/缩到 19px（见 BUILD_NOTES 偏离 2），故组内补竖版 8 列。
 *   LightningGlyph 起诉小闪电（红 3px 折线 draw-on）
 *   CatIcon        文件条目类别小图标（draw-on）
 */

// ---- SC01/SC02 文件名卡 ----
export const CARD = {x: 135, y: 360, w: 450, h: 160}; // 卡中心 (360,440)；宽 450 使 1.15 推近后仍在 x40–620 内
const ADV = 18; // 30px 等宽字符 advance
const FNAME = EXAMPLE.fileName; // 'chatapp-release.apk'
const BASE_N = FNAME.length - 4; // 'chatapp-release' 15 字符
/** 卡内时间线（绝对帧）：入场 78 / 后缀选中 86 / 字符交换 94 / 卡边框白闪 115 */
export const FC_T = {enter: 78, sel: 86, xch: 94, flash: 115};
const TEXT_X = Math.round(360 - (FNAME.length * ADV) / 2);
const SUF_X = TEXT_X + BASE_N * ADV;

export const FilenameCard: React.FC<{N: number; exitAt?: number}> = ({N, exitAt = Infinity}) => {
  const nIn = N - FC_T.enter;
  if (nIn < 0) return null;
  const op = firstOp(nIn, 6) * exitOp(N, exitAt, 8);
  if (op <= 0) return null;
  const dy = 46 * powOutRemain(nIn, 12, 2.5); // 自下滑入 Δ46（≤100）
  // 后缀选中（白底反字 8 帧 wipe + 微呼吸），交换起 4 帧内撤掉
  const selP = clamp01((N - FC_T.sel) / 8);
  const selFade = 1 - clamp01((N - FC_T.xch) / 4);
  const selBreath = N >= FC_T.sel + 4 && N < FC_T.sel + 12 ? 1 + 0.02 * Math.sin(((N - FC_T.sel - 4) / 8) * Math.PI) : 1;
  // 字符交换（94 起 18 帧）：.apk 末 4 字符上抛淡出（10 帧 powIn）、.zip 4 字符自下落入（12 帧 easeOut）
  const apkT = clamp01((N - FC_T.xch) / 10);
  const zipT = clamp01((N - FC_T.xch - 6) / 12);
  const apkOp = N < FC_T.xch ? 1 : 1 - apkT;
  const zipOp = N < FC_T.xch + 6 ? 0 : clamp01((N - FC_T.xch - 6) / 6);
  const flash = N >= FC_T.flash && N < FC_T.flash + 3;
  const charStyle = (left: number): React.CSSProperties => ({
    position: 'absolute', left, top: 370, width: ADV, height: 39, lineHeight: '39px',
    fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 0, textAlign: 'center',
  });
  const sufChar = (i: number, ch: string, mode: 'apk' | 'zip') => {
    const sel = mode === 'apk' && N < FC_T.xch && selP >= (i + 1) / 4;
    let ty = 0, tx = 0;
    if (mode === 'apk' && N >= FC_T.xch) {
      ty = -80 * apkT * apkT;
      tx = (i - 1.5) * 8 * apkT;
    }
    if (mode === 'zip' && N >= FC_T.xch + 6) {
      ty = 58 * (1 - easeOutCubic(zipT));
    }
    const o = mode === 'apk' ? apkOp : zipOp;
    if (o <= 0) return null;
    return (
      <span
        key={mode + i}
        style={{...charStyle(SUF_X + i * ADV), color: sel ? '#000' : WHITE, opacity: o, transform: `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`}}
      >
        {ch}
      </span>
    );
  };
  // 光标 30 帧周期闪烁；交换完成后隐去（改名已提交）
  const curOp = N >= FC_T.xch + 18 ? 0 : Math.floor(N / 15) % 2 === 0 ? 1 : 0.12;
  return (
    <div style={{...abs(CARD.x, CARD.y + dy, CARD.w, CARD.h), opacity: op}}>
      <Box
        x={0}
        y={0}
        w={CARD.w}
        h={CARD.h}
        r={10}
        sw={flash ? 3.5 : 2.5}
        stroke={WHITE}
        fill="rgba(0,0,0,0.82)"
        style={{boxShadow: flash ? '0 0 36px 10px rgba(255,255,255,.6)' : '0 0 24px 7px rgba(255,255,255,.15)'}}
      />
      <span style={{...charStyle(TEXT_X), width: BASE_N * ADV, textAlign: 'left', color: WHITE}}>{FNAME.slice(0, BASE_N)}</span>
      {'.apk'.split('').map((ch, i) => sufChar(i, ch, 'apk'))}
      {'.zip'.split('').map((ch, i) => sufChar(i, ch, 'zip'))}
      {/* 选中高亮（白底，字符变黑） */}
      {selP > 0 && selFade > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: SUF_X - 3,
            top: 366,
            width: 4 * ADV + 6,
            height: 47,
            background: WHITE,
            borderRadius: 3,
            transform: `scaleX(${(selP * selBreath).toFixed(4)})`,
            transformOrigin: 'left center',
            opacity: selFade,
          }}
        />
      ) : null}
      <div style={{position: 'absolute', left: SUF_X + 4 * ADV + 8, top: 370, width: 3, height: 38, background: WHITE, opacity: curOp}} />
    </div>
  );
};

// ---- SC04 竖版十六进制窗 ----
export const HEX = {x: 145, y: 640, w: 430, h: 320}; // 430 宽：1.18 推近后右缘 596 < 620 ✓
const HCELL = {w: 42, h: 40, gap: 9, left: 16, top: 58};
/** 行 0 首四字节 = EXAMPLE.hexFirst（50 4B 03 04，research §2 局部文件头魔数）；其余用与共用 HexDump 相同的确定性递推 */
const hexBytes = (): string[][] => {
  const rows: string[][] = [];
  let b = 0;
  for (let r = 0; r < 5; r++) {
    const row: string[] = [];
    for (let c = 0; c < 8; c++) {
      if (r === 0 && c < 4) row.push(EXAMPLE.hexFirst.split(' ')[c]);
      else {
        b = (b * 31 + 17) % 256;
        row.push(b.toString(16).padStart(2, '0').toUpperCase());
      }
    }
    rows.push(row);
  }
  return rows;
};
const HEX_ROWS = hexBytes();

/** hlP：首两格高亮 wipe 0→1；dimK：其余字节变暗 0–0.35；heroPulse：首两格缩放脉冲（c5「仍是头两个字节」）；opacity 整体 */
export const VertHex: React.FC<{hlP?: number; dimK?: number; heroPulse?: number; opacity?: number}> = ({hlP = 0, dimK = 0, heroPulse = 1, opacity = 1}) => (
  <div style={{...abs(HEX.x, HEX.y, HEX.w, HEX.h), opacity}}>
    <Box x={0} y={0} w={HEX.w} h={HEX.h} r={10} sw={2} stroke={WHITE} fill="rgba(0,0,0,0.92)" />
    <div style={{position: 'absolute', left: HCELL.left + 2, top: 14, fontFamily: FONT_MONO, fontSize: 24, color: GREY}}>first bytes</div>
    {HEX_ROWS.map((row, r) =>
      row.map((byte, c) => {
        const hero = r === 0 && c < 2;
        const lit = hero && (c + 1) / 2 <= hlP + 0.001;
        return (
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: HCELL.left + c * (HCELL.w + HCELL.gap),
              top: HCELL.top + r * 50,
              width: HCELL.w,
              height: HCELL.h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_MONO,
              fontSize: 24,
              lineHeight: 1,
              color: WHITE,
              opacity: hero ? 1 : 1 - dimK,
              borderRadius: 4,
              border: `${lit ? 2 : 1.5}px solid ${lit ? PURPLE_LIGHT : GREY_LINE}`,
              background: lit ? PURPLE : 'transparent',
              textShadow: lit ? TEXT_GLOW : 'none',
              fontWeight: lit ? 700 : 400,
              transform: hero && heroPulse !== 1 ? `scale(${heroPulse.toFixed(4)})` : undefined,
            }}
          >
            {byte}
          </div>
        );
      }),
    )}
  </div>
);

// ---- SC04 起诉小闪电（红 3px 折线 + 分叉，draw-on）----
export const LightningGlyph: React.FC<{x: number; y: number; w?: number; p?: number; opacity?: number}> = ({x, y, w = 300, p = 1, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const branchP = clamp01((p - 0.5) * 2);
  return (
    <svg width={w} height={36} viewBox={`0 0 ${w} 36`} style={{...abs(x, y), overflow: 'visible', opacity}}>
      <g fill="none" stroke={RED_DEEP} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 4px rgba(236,8,31,.55))'}}>
        <path d="M2,22 L40,8 L76,26 L114,6 L152,24 L190,10 L228,28 L266,12 L298,18" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01(p))} />
        <path d="M76,26 L98,34 M190,10 L212,2" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - branchP)} />
      </g>
    </svg>
  );
};

// ---- SC02 条目类别小图标（draw-on）----
const CAT_PATHS: Array<Array<React.ReactElement<any>>> = [
  // manifest：折角文档 + 两行文字
  [<path key="a" d="M6,2 H26 L34,10 V30 H6 Z" />, <path key="b" d="M26,2 V10 H34" />, <line key="c" x1={12} y1={17} x2={28} y2={17} />, <line key="d" x1={12} y1={23} x2={24} y2={23} />],
  // dex：尖括号 + 斜杠
  [<path key="a" d="M14,6 L4,16 L14,26" />, <path key="b" d="M26,6 L36,16 L26,26" />, <path key="c" d="M24,4 L16,28" />],
  // arsc：表格
  [<rect key="a" x={4} y={6} width={32} height={22} rx={2} />, <line key="b" x1={4} y1={13} x2={36} y2={13} />, <line key="c" x1={4} y1={21} x2={36} y2={21} />, <line key="d" x1={15} y1={6} x2={15} y2={28} />],
  // META-INF：印章
  [<circle key="a" cx={20} cy={13} r={9} />, <path key="b" d="M10,30 H30" />, <path key="c" d="M14,22 V30 M26,22 V30" />],
];

export const CatIcon: React.FC<{x: number; y: number; cat: number; p?: number; opacity?: number}> = ({x, y, cat, p = 1, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  return (
    <svg width={40} height={32} viewBox="0 0 40 32" style={{...abs(x, y), overflow: 'visible', opacity}}>
      <g fill="none" stroke={WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {CAT_PATHS[cat].map((el, j) =>
          React.cloneElement(el, {key: j, pathLength: 100, strokeDasharray: 100, strokeDashoffset: 100 * (1 - clamp01(p))}),
        )}
      </g>
    </svg>
  );
};
