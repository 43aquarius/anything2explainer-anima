import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powIn, powOutRemain, emphasisPulse} from '../../common';
import {CText, Svg, WHITE, GREY, GREY_MID, PURPLE_LIGHT, exitOp, glowOffK, softOp, scaleIn, fadeIn} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';
import {DIAG, FileEntryBlock, DirectoryCard, EocdStrip, LineDot} from './g4ui';

/**
 * SC17 ZIP 解剖图（2440–2657，S17 ¶ 段末）
 * 节拍：2448 三枚文件块错峰缩放入 → 2486 目录卡 slideIn + HeroGlow → 2490 引线 draw-on（索引关系）
 *      → 2526 EOCD SoftIn + 边框白闪 + 尾端小旗 stampIn → 2568 "says where everything is"：
 *      一枚亮点自 EOCD 沿点线冲进目录，再沿三条引线扇出到全部文件块（每块到达小脉冲）。
 * 运镜：2492–2525 拉远 1.12→1.0 看全景（分镜表 33 帧）。停留：落位 2550 → 离场 2629，≥30 ✓。
 * 主角：结构图组（全幅）；光：目录卡 HeroGlow（当前重点）+ EOCD 白闪 + 巡行点紫。
 */
export const F0 = 2440;
const B_BLOCKS = 2448, B_LABEL = 2458, B_CARD = 2486, B_LINES = 2490, B_EOCD = 2526, B_FLAG = 2538, B_WAVE = 2568, TO = 2657, EXIT_LEN = 8; // TO 按分镜表镜头末（2637 是旧值：提前离场会留 20f 死尾巴，吃掉 motion_check 回退预算）
const MONO = "'SF Mono', Menlo, Consolas, monospace";

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  // 文件块：错峰缩放入 + 2568 波到达后的到达脉冲
  const blockS = (i: number) => {
    const s = scaleIn(N - (B_BLOCKS + i * 2), 14);
    if (s <= 0) return 0;
    const arrive = B_WAVE + 12 + 12 + i * 3; // 波自 EOCD 进目录(12f) 再沿线到块(12f)
    return s * emphasisPulse(N - arrive, {peak: 1.1, up: 7, hold: 2, down: 9});
  };
  // 目录卡：自下滑入 Δ80/16f；HeroGlow 2494 起亮（离场先灭光）
  const cardDy = 80 * powOutRemain(N - B_CARD, 16, 2.5);
  const gk = clamp01((N - 2494) / 8) * glowOffK(N, TO, 6, EXIT_LEN);
  // 引线 draw-on（每条 8f，4f 错峰）+ 巡行点（自 2510 起）
  const lineP = (i: number) => easeOutCubic(clamp01((N - (B_LINES + i * 4)) / 8));
  const dotT = (i: number) => clamp01((((Math.min(N, 2604) - 2510) * 0.014 + i * 0.37) % 1 + 1) % 1); // 2604 后巡行点相位冻结：段末稳定期（动词动作到段落边界为止）
  // 目录—EOCD 点线 + EOCD 白闪 + 小旗 stampIn
  const connP = easeOutCubic(clamp01((N - B_EOCD) / 12));
  const flash = Math.sin(Math.PI * clamp01((N - (B_EOCD + 8)) / 5));
  const flagP = clamp01((N - B_FLAG) / 8);
  const flagS = flagP > 0 ? 1.4 - 0.4 * powIn(2.2)(flagP) : 0;
  // 2568 波：亮点 EOCD→目录→各块
  const wave1 = clamp01((N - B_WAVE) / 12);
  const wave2 = (i: number) => clamp01((N - (B_WAVE + 12 + i * 3)) / 12);
  const capOp = softOp(N - (B_WAVE + 4), 8);

  return (
    <CameraRig N={N} keys={[{f: 2440, x: 640, y: 340, s: 1.12}, {f: 2492, x: 640, y: 340, s: 1.12}, {f: 2525, x: 640, y: 340, s: 1}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 三枚文件块（竖排 = 索引树叶子） */}
        {DIAG.blocks.map((b, i) => {
          const s = blockS(i);
          if (s <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${s.toFixed(4)})`, transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px`}}>
              <FileEntryBlock x={b.x} y={b.y} w={b.w} h={b.h} />
            </div>
          );
        })}
        <CText cx={DIAG.label.cx} cy={DIAG.label.cy} size={22} weight={600} family={MONO} color={GREY} opacity={fadeIn(N - B_LABEL, 10)}>local file headers</CText>

        {/* 目录卡 + 主角光 */}
        {N >= B_CARD ? (
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${cardDy.toFixed(2)}px)`}}>
            <HeroGlow x={DIAG.card.x - 6} y={DIAG.card.y - 6} w={DIAG.card.w + 12} h={DIAG.card.h + 12} r={12} N={Math.min(N, 2596)} k={gk} /> {/* 2596 后呼吸相位冻结：段末 ≥30f 稳定期（动词动作到段落边界为止） */}
            <DirectoryCard x={DIAG.card.x} y={DIAG.card.y} w={DIAG.card.w} h={DIAG.card.h} showLabel tabP={clamp01((N - (B_CARD + 10)) / 14)} />
          </div>
        ) : null}

        {/* EOCD 条（末尾锚点）：SoftIn + 边框白闪 + 尾端小旗 */}
        {N >= B_EOCD ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_EOCD, 8)}}>
            <EocdStrip x={DIAG.eocd.x} y={DIAG.eocd.y} w={DIAG.eocd.w} h={DIAG.eocd.h} showLabel flash={flash} />
          </div>
        ) : null}
        <Svg bloom={false}>
          {/* 目录—EOCD 点线 */}
          {connP > 0 ? (
            <line x1={DIAG.conn.x0} y1={DIAG.conn.y} x2={DIAG.conn.x0 + (DIAG.conn.x1 - DIAG.conn.x0) * connP} y2={DIAG.conn.y} stroke={GREY_MID} strokeWidth={1.6} strokeDasharray="6 6" />
          ) : null}
          {/* 引线（目录 → 文件块，索引关系） */}
          {DIAG.lines.map((l, i) =>
            lineP(i) > 0 ? <line key={i} x1={l.x0} y1={l.y0} x2={l.x0 + (l.x1 - l.x0) * lineP(i)} y2={l.y0 + (l.y1 - l.y0) * lineP(i)} stroke={GREY_MID} strokeWidth={1.6} /> : null,
          )}
          {/* 巡行紫点（索引被读取的暗示，持续动作） */}
          {N >= 2510
            ? DIAG.lines.map((l, i) => (
                <React.Fragment key={`d${i}`}>
                  <LineDot x0={l.x0} y0={l.y0} x1={l.x1} y1={l.y1} t={dotT(i)} r={2.8} />
                  <LineDot x0={l.x0} y0={l.y0} x1={l.x1} y1={l.y1} t={(dotT(i) + 0.5) % 1} r={2.2} opacity={0.7} />
                </React.Fragment>
              ))
            : null}
          {/* 小旗（尾端锚点落定） */}
          {flagP > 0 ? (
            <g transform={`translate(${DIAG.flag.x} ${DIAG.flag.y}) scale(${flagS.toFixed(3)})`} opacity={softOp(N - B_FLAG, 5)}>
              <line x1={0} y1={0} x2={0} y2={-26} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
              <polygon points={`0,-26 20,-20 0,-14`} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={1.8} />
            </g>
          ) : null}
          {/* 2568 波：亮点 EOCD→目录→各块（"says where everything is"） */}
          {wave1 > 0 && wave1 < 1 ? (
            <circle cx={DIAG.conn.x1 + (DIAG.conn.x0 - DIAG.conn.x1) * wave1} cy={DIAG.conn.y} r={4.5} fill={PURPLE_LIGHT} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.95))'}} />
          ) : null}
          {DIAG.lines.map((l, i) =>
            wave2(i) > 0 && wave2(i) < 1 ? (
              <circle key={`w${i}`} cx={l.x0 + (l.x1 - l.x0) * wave2(i)} cy={l.y0 + (l.y1 - l.y0) * wave2(i)} r={4.5} fill={PURPLE_LIGHT} style={{filter: 'drop-shadow(0 0 5px rgba(161,117,241,.95))'}} />
            ) : null,
          )}
        </Svg>
        {/* 注："a record that says where everything is" 的语境小字 */}
        <CText cx={DIAG.caption.cx} cy={DIAG.caption.cy} size={22} weight={600} family={MONO} color={GREY} opacity={capOp}>where everything is</CText>
      </div>
    </CameraRig>
  );
};

export default SC17;
