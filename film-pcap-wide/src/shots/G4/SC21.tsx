import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_TECH, FONT_MONO} from '../../common';
import {Pill, Svg, WHITE, PURPLE_LIGHT, GREY, GREY_LIGHT, abs, softOp, exitOp} from '../../ui';
import {PcapFileCard, handoffKf} from './shared';

/**
 * SC21 打开才解码 · N 4659–4979（S27 4667–4787 + S28 4798–4977）
 * 承接：SC20 文件卡 16 帧 kf 缩到左侧（中心 640,380 s1 → 330,380 s0.62，easeInOutPow 2.5）——共用组件同参数，交界帧像素一致；
 *       hex 网格续亮至 4720 全亮（持续动作延续）。
 * 左卡：4667 `pcapng` 小 Pill（紫边）SoftIn + 4721 `Wireshark default` 灰小字。
 * 右侧「打开循环」：字节点阵场（12×7 方点）→ 4798 放大镜自右滑入悬停 → 4847 镜下 Ethernet/IP/TCP 三行解码标签（2 帧错峰，白）
 *       → 4903 抬镜、标签淡出、字节闪回 → 4925 第二次开镜（循环 2 次）；4909 `decoded later · every time you open` 灰小字 SoftIn。
 * 停留：灰字落位 4917 → 离场 4971（末 8 帧），54 帧 ✓（第二次开镜循环为持续动作）。零 glitch。
 */
const F0 = 4659, TO = 4979;
const T_NG = 4667; // pcapng Pill
const T_DEF = 4721; // Wireshark default
const T_LENS_IN = 4798; // 放大镜滑入（S28 "Nothing is decoded yet"）
const T_LBL = 4847; // 三行解码标签（"Interpretation happens later"）
const T_TEXT = 4909; // 灰小字（"every time you open it"）
const C1_OUT = 4903; // 第一次抬镜
const C2_IN = 4925; // 第二次开镜

// 字节点阵场（右）
const FIELD = {cx: 880, cy: 360, cols: 12, rows: 7, cell: 26};
const LENS = {cx: 880, cy: 336, r: 56};
const LABELS = ['Ethernet', 'IP', 'TCP'];

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const h = handoffKf(N);
  // 解码标签可见性：c1 4847–4903+12淡出 / c2 4935 起
  const lblVis = (i: number) => {
    const a = softOp(N - (T_LBL + i * 2), 8) * (1 - clamp01((N - C1_OUT - 2) / 10));
    const b = N >= C2_IN + 12 ? softOp(N - (C2_IN + 12 + i * 2), 8) : 0;
    return Math.max(a, b);
  };
  // 字节闪回（抬镜后 6 帧白闪一次）
  const flash = clamp01((N - (C1_OUT + 12)) / 3) * (1 - clamp01((N - (C1_OUT + 18)) / 4));
  // 放大镜：首次滑入(4798) → 悬停 → 抬镜隐藏(4903) → 二次滑入(4925)
  const hideK = clamp01((N - (C1_OUT + 6)) / 8) - clamp01((N - C2_IN) / 8);
  const slide1 = clamp01((N - T_LENS_IN) / 14);
  const slide2 = clamp01((N - C2_IN) / 10);
  const lensX = LENS.cx + 360 * (1 - slide1) + 300 * (1 - slide2);
  const lensY = LENS.cy - 130 * hideK;
  const lensOp = clamp01((N - T_LENS_IN + 6) / 8) * (1 - hideK);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 承接：文件卡缩到左侧（16 帧） */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 380px', transform: `translate(${(h.cx - 640).toFixed(2)}px, ${(h.cy - 380).toFixed(2)}px) scale(${h.s.toFixed(4)})`}}>
        <PcapFileCard N={N} />
      </div>

      {/* pcapng Pill（屏幕空间，不随卡片缩放，保证 ≥22px） */}
      <div style={{...abs(500, 236, 130, 40), opacity: softOp(N - T_NG, 8)}}>
        <Pill x={0} y={0} w={130} h={40} r={20} sw={2.5} stroke={PURPLE_LIGHT} fill="#000"
          style={{boxShadow: '0 0 14px 3px rgba(102,48,248,.4)'}}
          text={<span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 24, color: PURPLE_LIGHT}}>pcapng</span>} />
      </div>
      <div style={{...abs(496, 284, 140, 24), opacity: softOp(N - T_DEF, 8) * 0.9, display: 'flex', justifyContent: 'center'}}>
        <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 22, color: GREY_LIGHT, lineHeight: '24px', whiteSpace: 'nowrap'}}>Wireshark default</span>
      </div>

      {/* 右：字节点阵场（12×7） */}
      <Svg>
        {Array.from({length: FIELD.cols * FIELD.rows}, (_, k) => {
          const c = k % FIELD.cols, r = Math.floor(k / FIELD.cols);
          const x = FIELD.cx + (c - (FIELD.cols - 1) / 2) * FIELD.cell - 5;
          const y = FIELD.cy + (r - (FIELD.rows - 1) / 2) * FIELD.cell - 5;
          const fieldOp = softOp(N - (4721 + r * 2), 8); // 4721 起随行淡入（S27 次块）
          const bright = 0.55 + 0.45 * ((k * 7) % 5) / 4;
          return <rect key={k} x={x} y={y} width={10} height={10} fill={bright > 0.8 ? GREY_LIGHT : GREY} opacity={fieldOp * (0.7 + 0.3 * flash)} />;
        })}
      </Svg>

      {/* 镜下解码标签（白，黑底衬） */}
      {LABELS.map((t, i) => {
        const v = lblVis(i);
        if (v <= 0) return null;
        return (
          <div key={t} style={{...abs(LENS.cx - 92, LENS.cy - 34 + i * 34, 184, 28), opacity: v}}>
            <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', borderRadius: 4}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 22, color: WHITE, lineHeight: '28px'}}>{t}</div>
          </div>
        );
      })}

      {/* 放大镜（悬停 = 解码中） */}
      {lensOp > 0.02 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: lensOp}}>
          <g style={{filter: 'drop-shadow(0 0 10px rgba(102,48,248,.55))'}}>
            <circle cx={lensX} cy={lensY} r={LENS.r} fill="rgba(102,48,248,.10)" stroke={PURPLE_LIGHT} strokeWidth={4} />
            <circle cx={lensX} cy={lensY} r={LENS.r - 9} fill="none" stroke={WHITE} strokeWidth={1.5} opacity={0.5} />
            <line x1={lensX + LENS.r * 0.74} y1={lensY + LENS.r * 0.74} x2={lensX + LENS.r + 52} y2={lensY + LENS.r + 52} stroke={PURPLE_LIGHT} strokeWidth={9} strokeLinecap="round" />
          </g>
        </svg>
      ) : null}

      {/* 灰小字（4909） */}
      <div style={{...abs(740, 496, 280, 26), opacity: softOp(N - T_TEXT, 8) * 0.95, display: 'flex', justifyContent: 'center'}}>
        <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 22, color: GREY_LIGHT, lineHeight: '26px', whiteSpace: 'nowrap'}}>decoded later · every time you open</span>
      </div>
    </div>
  );
};
