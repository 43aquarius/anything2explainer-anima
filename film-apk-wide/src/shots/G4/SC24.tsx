import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic, clamp01} from '../../common';
import {CText, Box, Pill, Svg, LineArrow, PURPLE, WHITE, GREY, GREY_LINE, GREY_MID, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {CameraRig, Vignette} from '../../fx';
import {ByteGrid, BoundaryLines} from './g4ui';

/**
 * SC24 对齐与 mmap（3366–3604，S24：3374 资源表必须不压缩 / 3470 四字节对齐 / 3528 直接映射进内存）
 * 下半幅字节网格带（x 160–1120, y 360–496，24 列×4 行，右 12 列 = resources.arsc 段紫色）：
 * 3374 逐列快速点亮（每列 2f 间隔 3f 淡入，g4ui ByteGrid）+ 网格上方 `resources.arsc` 等宽 24px 打字机；
 * 3470 每 4 列加强竖线自左 draw-on（每条 6f、4f 错峰，g4ui BoundaryLines 紫光）+ `4-byte` 紫 Pill SoftIn；
 * 3528 mmap 箭头 draw-on（14f 自网格向上飞向内存条，白 LineArrow）+ 内存条（x 400–880, y 210–270，白边长条）
 * 格纹 12 格逐格点亮（每格 3f）+ 两端白色光效脉冲 ×2；紫段微呼吸（持续动作）。
 * 运镜：3430–3463 推向网格 1→1.1（33f，网格列点亮完成后、边界线前；内存条下移到 y 210 以保推近后 y≥110 安全区）。
 * 末 8 帧归零（3597–3604）。停留：段内不判。主角：网格带+mmap 组 260px；光：对齐线紫光；箭头白。
 */
export const F0 = 3366;
const B_GRID = 3374, B_LBL = 3374, B_BOUND = 3470, B_PILL = 3472, B_ARROW = 3528, B_MEM = 3542, TO = 3604, EXIT_LEN = 8;
const MONO = "'SF Mono', Menlo, Consolas, monospace";

const GRID = {x: 160, y: 360, cols: 24, rows: 4, cellW: 40, cellH: 34};
const MEM = {x: 400, y: 210, w: 480, h: 60, cells: 12};
const LBL = 'resources.arsc';

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN);

  // 网格上方标签打字机（每 2 帧 1 字）
  const typed = Math.max(0, Math.min(LBL.length, Math.floor((N - B_LBL) / 2) + 1));
  // mmap 箭头（14f，自网格向上到内存条）
  const arrowP = easeOutCubic(clamp01((N - B_ARROW) / 14));
  // 内存条格纹逐格点亮（每格 3f）
  const memLit = (i: number) => clamp01((N - (B_MEM + i * 3)) / 3);
  // 两端白色光效脉冲（箭头落定 3542 与末拍 3574 各一次）
  const pulse = (f0: number) => (N >= f0 && N < f0 + 6 ? Math.sin(Math.PI * ((N - f0) / 6)) : 0);
  const p1 = pulse(B_MEM), p2 = pulse(3574);
  // 紫段微呼吸（持续动作）
  const arscBreath = 0.14 + 0.05 * Math.sin(((N - B_GRID) / 45) * Math.PI * 2);

  return (
    <>
    <CameraRig N={N} keys={[{f: 3366, x: 640, y: 360, s: 1}, {f: 3430, x: 640, y: 360, s: 1}, {f: 3463, x: 640, y: 430, s: 1.1}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 字节网格带（右 12 列 = resources.arsc 紫段） */}
        <ByteGrid N={N} f0={B_GRID} litFrom={GRID.cols / 2} rows={GRID.rows} x={GRID.x} y={GRID.y} cellW={GRID.cellW} cellH={GRID.cellH} cols={GRID.cols} opacity={firstOp(N - 3366, 6)} />
        {/* 紫段呼吸叠层（持续动作） */}
        {N >= B_GRID + 50 ? (
          <div style={{position: 'absolute', left: GRID.x + (GRID.cols / 2) * GRID.cellW, top: GRID.y + 2, width: (GRID.cols / 2) * GRID.cellW, height: GRID.rows * GRID.cellH - 4, background: `rgba(102,48,248,${(arscBreath * gk).toFixed(3)})`, borderRadius: 3, opacity: 0.6}} />
        ) : null}

        {/* 网格上方标签（打字机，紫段正上方） */}
        {typed > 0 ? <CText cx={GRID.x + ((GRID.cols / 2 + GRID.cols) / 2) * GRID.cellW} cy={GRID.y - 24} size={24} weight={700} family={MONO} color={WHITE}>{LBL.slice(0, typed)}</CText> : null}

        {/* 4 字节边界加强竖线（紫光） */}
        <BoundaryLines N={N} f0={B_BOUND} x={GRID.x} y={GRID.y - 4} w={GRID.cols * GRID.cellW} h={GRID.rows * GRID.cellH + 8} cols={GRID.cols} opacity={gk} />

        {/* 4-byte Pill */}
        <Pill x={266} y={532} w={112} h={40} fill={PURPLE} sw={2} text="4-byte" fontSize={24} weight={700} color={WHITE} family={MONO} opacity={softOp(N - B_PILL, 8)} style={{boxShadow: `0 0 ${20 * gk}px ${6 * gk}px rgba(102,48,248,.5)`}} />

        {/* 内存条（白边长条 + 格纹） */}
        {N >= B_MEM - 4 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (B_MEM - 4), 6)}}>
            <Box x={MEM.x} y={MEM.y} w={MEM.w} h={MEM.h} r={8} stroke={WHITE} sw={2.5} />
            {Array.from({length: MEM.cells}, (_, i) => {
              const lit = memLit(i);
              const cw = (MEM.w - 28) / MEM.cells;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: MEM.x + 14 + i * cw,
                    top: MEM.y + 12,
                    width: cw - 6,
                    height: MEM.h - 24,
                    borderRadius: 3,
                    border: `1.5px solid ${lit > 0.5 ? WHITE : GREY_LINE}`,
                    background: lit > 0.5 ? `rgba(255,255,255,${(0.22 * lit).toFixed(3)})` : 'transparent',
                    opacity: 0.55 + 0.45 * lit,
                  }}
                />
              );
            })}
            {/* 两端白色光效脉冲 */}
            {p1 > 0 || p2 > 0 ? (
              <Svg bloom={false}>
                {p1 > 0 ? <circle cx={MEM.x + 6} cy={MEM.y + MEM.h / 2} r={10 + 8 * p1} fill="none" stroke={WHITE} strokeWidth={2} opacity={p1 * 0.8} /> : null}
                {p1 > 0 ? <circle cx={MEM.x + MEM.w - 6} cy={MEM.y + MEM.h / 2} r={10 + 8 * p1} fill="none" stroke={WHITE} strokeWidth={2} opacity={p1 * 0.8} /> : null}
                {p2 > 0 ? <circle cx={MEM.x + 6} cy={MEM.y + MEM.h / 2} r={10 + 8 * p2} fill="none" stroke={WHITE} strokeWidth={2} opacity={p2 * 0.8} /> : null}
                {p2 > 0 ? <circle cx={MEM.x + MEM.w - 6} cy={MEM.y + MEM.h / 2} r={10 + 8 * p2} fill="none" stroke={WHITE} strokeWidth={2} opacity={p2 * 0.8} /> : null}
              </Svg>
            ) : null}
          </div>
        ) : null}

        {/* mmap 箭头（网格 → 内存条，直达）+ 标注 */}
        <Svg>
          <LineArrow x0={640} y0={GRID.y - 6} x1={640} y1={MEM.y + MEM.h - 6} p={arrowP} rodW={4} headL={18} headW={20} color={WHITE} />
        </Svg>
        <CText cx={688} cy={(GRID.y + MEM.y + MEM.h) / 2} size={22} weight={700} family={MONO} color={WHITE} opacity={softOp(N - (B_ARROW + 6), 8)}>mmap</CText>
      </div>
    </CameraRig>
    {/* 屏幕空间暗角（推近 3430–3463 同步淡入，压向网格；随离场归零） */}
    <Vignette k={clamp01((N - 3430) / 33) * 0.35 * op} />
    </>
  );
};

export default SC24;
