import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01} from '../../common';
import {CText, HexDump, LineArrow, WHITE, GREY, BLOOM, abs, exitOp, firstOp, SoftIn} from '../../ui';

/**
 * SC14 十六进制 · N 2024–2170（S14 2032–2168：2032「Open any zip in a hex editor:」/ 2098「the first two bytes are P, K.」）
 * HexDump 主角镜头：居中大 HexDump（240,160,800×300，8 行字节，首行 50 4B 03 04，title 'hex editor'）。
 * 节拍：2029 HexDump 首帧可见（节拍 2032 −3）；2032–2048 行自上而下 2 帧错峰逐行显出（覆盖矩形顶边连续下移，
 *   ≈2 帧/行）+ 扫描线随边界下行（hex 编辑器"载入感"，持续动作）；2098 注线 draw-on（10 帧）+ 指向端 pulse
 *   + `first two bytes`（灰 24px）+ 前两格 `50 4B` 白色选框 20 帧周期同步微亮呼吸（持续动作）。
 * 末 8 帧归零：**只归零注线/标签/选框——HexDump 本体不归零**（分镜表 SC15「承接 HexDump」：同组件同参数在 SC15
 *   首帧原样再现，交界帧像素一致）。停留：段内不判。零 glitch（本组 glitch 只给 SC12/SC15）。
 */
const F0 = 2024, TO = 2170;
const T_DUMP = 2029; // HexDump 首帧可见
const T_REVEAL = 2032; // 行自上而下显出（16 帧 ≈ 8 行 × 2 帧）
const T_NOTE = 2098; // 注线 + 标签 + 前两格呼吸
const HEX = {x: 240, y: 160, w: 800, h: 300, rows: 8};
// HexDump 内部布局（与 ui.tsx 同步推导）：内容区 left 14 / top 38 / bottom 12；行高 (h-52)/8=31；
// 偏移列宽 52、字节格 30、gap 10 → b0 abs 左 = x+76，b1 右 = x+132；行 0 文本带 y+38..y+64。
const CELL_Y0 = HEX.y + 38; // 198
const CONTENT_BOTTOM = HEX.y + HEX.h - 12; // 448
const ROW_H = (HEX.h - 52) / HEX.rows; // 31
const B0_X = HEX.x + 76; // 316
const B1_R = HEX.x + 132; // 372

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8); // 只作用于注线/标签/选框（HexDump 不归零）
  const dumpOp = N < T_DUMP ? 0 : firstOp(N - T_DUMP, 6);

  // 行显出：覆盖矩形顶边 198 → 448 连续下移（16 帧），每行平均 2 帧；扫描线随边界
  const rv = clamp01((N - T_REVEAL) / 16);
  const coverTop = CELL_Y0 + (CONTENT_BOTTOM - CELL_Y0) * rv;
  const scanOp = N >= T_REVEAL && N < T_REVEAL + 22 ? 0.35 * (1 - clamp01((N - (T_REVEAL + 16)) / 6)) : 0;

  // 注线 + 标签 + 前两格呼吸
  const np = clamp01((N - T_NOTE) / 10);
  const noteOp = (N < T_NOTE ? 0 : firstOp(N - T_NOTE, 6)) * exOp;
  const brkP = clamp01((N - T_NOTE) / 12); // 选框自左 wipe 12 帧
  const breathe = 0.18 + 0.14 * Math.sin((2 * Math.PI * N) / 20); // 前两格同步微亮（20 帧周期）
  const tipPulse = np >= 1 ? 0.5 + 0.35 * Math.sin((2 * Math.PI * N) / 20) : 0; // 端点 pulse（分镜表指定；幅度提到采样阈值上）
  const boxFlash = N >= T_NOTE + 12 && N < T_NOTE + 17 ? 1 - (N - (T_NOTE + 12)) / 5 : 0; // 选框落定白闪（4 帧）：2098 拍子在缩略采样下可读

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* HexDump（主角 300px；同参数在 SC15 原样承接） */}
      <HexDump x={HEX.x} y={HEX.y} w={HEX.w} h={HEX.h} rows={HEX.rows} opacity={dumpOp} />

      {/* 未显出行的覆盖矩形（颜色与 HexDump 黑底同族，随边界下移） */}
      {dumpOp > 0 && rv < 1 ? <div style={{...abs(HEX.x + 15, coverTop, HEX.w - 30, CONTENT_BOTTOM - coverTop), background: 'rgba(0,0,0,0.93)'}} /> : null}
      {/* 扫描线（载入感） */}
      {scanOp > 0 ? <div style={{...abs(HEX.x + 15, coverTop - 1, HEX.w - 30, 2), background: WHITE, opacity: scanOp}} /> : null}

      {/* 注线：first two bytes → 指向前两格 */}
      {noteOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: noteOp}}>
          <SoftIn N={N} f0={T_NOTE} dy={6}>
            <CText cx={232} cy={138} size={24} weight={600} color={GREY}>{'first two bytes'}</CText>
          </SoftIn>
          <LineArrow x0={298} y0={150} x1={322} y1={190} p={np} rodW={2} headL={14} headW={12} opacity={0.8} />
          {tipPulse > 0 ? <div style={{position: 'absolute', left: 315, top: 185, width: 13, height: 13, borderRadius: '50%', background: WHITE, opacity: tipPulse, filter: BLOOM}} /> : null}
        </div>
      ) : null}

      {/* 前两格 `50 4B` 选框（白色描边 + 20 帧周期同步微亮呼吸；SC15 起 highlightP 接管变紫） */}
      {brkP > 0 ? (
        <div
          style={{
            ...abs(B0_X - 6, CELL_Y0 - 4, (B1_R - B0_X + 12) * brkP, ROW_H + 8),
            border: `2px solid ${WHITE}`,
            borderRadius: 5,
            opacity: (0.8 + 0.2 * boxFlash) * exOp,
            boxShadow: `0 0 ${(12 + 6 * Math.sin((2 * Math.PI * N) / 20) + 16 * boxFlash).toFixed(1)}px ${(3 + 5 * boxFlash).toFixed(1)}px rgba(255,255,255,${(breathe + 0.4 * boxFlash).toFixed(3)})`,
          }}
        />
      ) : null}
    </div>
  );
};
