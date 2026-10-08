import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO} from '../../common';
import {CText, GREY, GREY_LINE, ORANGE, exitOp, firstOp, softOp} from '../../ui';
import {V1Group} from './g5bui';

/**
 * SC30 慢在逐条 · N 4264–4430（S30 4272–4408 ¶：4272 逐条走 / 4332 逐条哈希）
 * 承接 SC29 末态收条包裹组（V1Group = GRP 同坐标 1:1 复刻）：16 帧缩到 0.8× 移到左侧（中心 644,385→375,345），
 * 收条小字随缩微省略；右侧灰色「处理时间条」(x 700–1140, y 300)：橙光标 4272 起以每 20 帧 15% 缓慢爬行，
 * 每过一站（15%×i，间隔 20 帧）→ 左侧对应收条白闪 + 边框转橙 + 该段变橙；4332 条尾注 `hash, file by file`
 * 打字机（持续动作）；光标爬到条尾（~4406）才停。末 8 帧归零（S30 段末但按分镜表作段内镜头处理，停 ≤3s）。
 * 主角：处理条 + 收条组；光：光标橙（+收条绿勾 / 到站白闪）。
 */
export const F0 = 4264;
const TO = 4430;
const B_CRAWL = 4272, B_HASH = 4332;

const BAR = {x0: 700, x1: 1140, y: 300, h: 36};
const BAR_W = BAR.x1 - BAR.x0;
const SPEED = 0.15 / 20; // 每 20 帧前进 15%
const NOTE_TXT = 'hash, file by file';
const NOTE_W = 224; // 17ch × 22px mono ≈ 224

export const SC30: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  // 承接缩位移：GRP 组 16 帧 1×→0.8×，中心 (644,385)→(375,345)
  const e = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const s = 1 - 0.2 * e;
  const tx = -269 * e;
  const ty = -40 * e;
  const grpOp = firstOp(N - F0, 6);

  // 光标爬行（4272 起，每 20 帧 15%，到条尾停）
  const prog = N < B_CRAWL ? 0 : Math.min(1, (N - B_CRAWL) * SPEED);
  const curX = BAR.x0 + BAR_W * prog;

  // 各站到点：第 i 张收条（读序）在 4272+20(i+1) 白闪 + 转橙
  const lit: number[] = [];
  const flash: number[] = [];
  for (let i = 0; i < 6; i++) {
    const at = B_CRAWL + 20 * (i + 1);
    lit.push(N < at ? 0 : clamp01((N - at) / 4));
    flash.push(N < at ? 0 : Math.max(0, 1 - (N - at) / 6));
  }

  // 条尾注打字机（4332 起，每 2 帧 1 字，左对齐于条尾区）
  const chars = N < B_HASH ? 0 : Math.min(NOTE_TXT.length, Math.floor((N - B_HASH) / 2) + 1);
  const noteOp = softOp(N - B_HASH, 8);

  const barOp = softOp(N - (F0 + 2), 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左：承接的 v1 收条包裹组（0.8× 缩微在左） */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`, transformOrigin: '644px 385px', opacity: grpOp}}>
        <V1Group N={N} lit={lit} flash={flash} text={s > 0.9} gapK={1} glowK={0.7 * (1 - e)} />
      </div>

      {/* 右：处理时间条（灰底 + 6 站刻度 + 橙光标爬行） */}
      {barOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: barOp}}>
          <div
            style={{
              position: 'absolute',
              left: BAR.x0,
              top: BAR.y - BAR.h / 2,
              width: BAR_W,
              height: BAR.h,
              boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.55)',
              border: `2px solid ${GREY_LINE}`,
              borderRadius: 6,
            }}
          />
          {/* 橙色已处理段（0 → 光标） */}
          {prog > 0.002 ? (
            <div
              style={{
                position: 'absolute',
                left: BAR.x0,
                top: BAR.y - BAR.h / 2 + 3,
                width: BAR_W * prog,
                height: BAR.h - 6,
                background: 'rgba(240,95,65,0.42)',
                borderRadius: 4,
              }}
            />
          ) : null}
          {/* 6 个站位刻度（光标过后点亮橙） */}
          {[1, 2, 3, 4, 5, 6].map((i) => {
            const x = BAR.x0 + BAR_W * 0.15 * i;
            const passed = prog >= 0.15 * i - 0.001;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - 1.5,
                  top: BAR.y - BAR.h / 2 - 4,
                  width: 3,
                  height: BAR.h + 8,
                  background: passed ? ORANGE : GREY_LINE,
                  opacity: passed ? 0.95 : 0.8,
                  boxShadow: passed ? '0 0 7px 2px rgba(240,95,65,.55)' : undefined,
                }}
              />
            );
          })}
          {/* 橙光标（竖条 + 顶钮，带橙光；爬到条尾停住） */}
          {N >= B_CRAWL ? (
            <div style={{position: 'absolute', inset: 0}}>
              <div
                style={{
                  position: 'absolute',
                  left: curX - 2.5,
                  top: BAR.y - BAR.h / 2 - 6,
                  width: 5,
                  height: BAR.h + 12,
                  background: ORANGE,
                  borderRadius: 2,
                  boxShadow: '0 0 12px 3px rgba(240,95,65,.75)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: curX - 6,
                  top: BAR.y - BAR.h / 2 - 20,
                  width: 12,
                  height: 12,
                  boxSizing: 'border-box',
                  borderRadius: '50%',
                  background: '#000',
                  border: `3px solid ${ORANGE}`,
                  boxShadow: '0 0 10px 2px rgba(240,95,65,.7)',
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 条尾注：hash, file by file（等宽 22px 灰，打字机，持续动作） */}
      {chars > 0 ? (
        <CText
          cx={BAR.x1 - NOTE_W + (chars * NOTE_W) / NOTE_TXT.length / 2}
          cy={352}
          size={22}
          weight={600}
          family={FONT_MONO}
          color={GREY}
          opacity={noteOp}
        >
          {NOTE_TXT.slice(0, chars)}
        </CText>
      ) : null}
    </div>
  );
};

export default SC30;
