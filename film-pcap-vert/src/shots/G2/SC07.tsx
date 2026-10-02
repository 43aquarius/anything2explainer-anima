import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow} from '../../common';
import {Box, ClockIcon, Pill, GREY, GREY_LIGHT, ORANGE, WHITE, abs, exitOp, firstOp, glowOffK, glowPurpleS, scaleIn, SoftIn} from '../../ui';

/**
 * SC07 跟随流 + 读时间 · N 1101–1215（S08 1109–1201：1109 跟随对话 / 1159 读时间戳）
 * 版式（竖版上下两段）——
 *   上半：`Follow TCP Stream` 紫 Pill（(360,340)，缩放入 + 紫光）+ 转录卡 2 行打字机
 *     （客户端 `GET /checkout HTTP/1.1` 浅灰 + → ；服务器 `HTTP/1.1 200 OK` 白 + ← 橙；与横版同款文本）；
 *   下半：时间轴横条（x80–600，y760）+ 5 个时刻点（EXAMPLE.wsRows 时间 4.104/4.352/9.010/11.03/15.06，
 *     后三个 = 重传 → 橙）+ 时刻点亮/标签 + 「Time 列橙框」= 沿时间戳序列跳跃的橙色焦点框 + 时钟秒针持续转。
 * 节拍：1103 Pill 12 帧缩放入；1113 卡 SoftIn；1117/1152 两行打字（1.4 帧/字，持续到 1174）；
 *   1159 时间轴 draw-on + 5 点 7 帧错峰点亮 + 橙框逐个跳 + 时钟 SoftIn。
 * 运镜：1125–1157 慢推 1.0→1.05（中轴 pivot (360,640)，落位前结束，推后内容仍在安全区内）。
 * 停留：段内不判（下一镜承接）。末 8 帧归零。零 glitch。主角：转录卡 + 时间轴组（橙框为当前重点光）。
 */
const F0 = 1101;
const TO = 1215;
const T_PILL = 1103, T_CARD = 1113, T_L1 = 1117, T_L2 = 1152, T_TL = 1159;
const CAM0 = 1125, CAM1 = 1157;

const AXIS = {x0: 80, x1: 600, y: 760};
const PX = [120, 225, 330, 435, 540];
const TIMES = ['4.104', '4.352', '9.010', '11.03', '15.06'];
const LIGHT = [1159, 1166, 1173, 1180, 1187];
const LINES = [
  {t: 'GET /checkout HTTP/1.1', cli: true, t0: T_L1, x: 130, y: 468},
  {t: 'HTTP/1.1 200 OK', cli: false, t0: T_L2, x: 200, y: 532},
];
const CLOCK = {cx: 548, cy: 668, r: 48};

const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // 慢推 1.0→1.05（1125–1157，pivot 中轴 (360,640)）
  const camS = 1 + 0.05 * easeInOutPow(2)(clamp01((N - CAM0) / (CAM1 - CAM0)));

  // Pill 缩放入
  const pillS = scaleIn(N - T_PILL, 12);

  // 时间轴 draw-on（14 帧）
  const axisP = clamp01((N - T_TL) / 14);

  // 当前点亮到第几个点 + 橙框位置（随点亮逐个跳，10 帧滑移）
  let k = -1;
  LIGHT.forEach((f, i) => { if (N >= f) k = i; });
  let frameX = PX[0];
  if (k > 0) {
    const e = easeInOutPow(3)(clamp01((N - LIGHT[k]) / 10));
    frameX = PX[k - 1] + (PX[k] - PX[k - 1]) * e;
  }

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, transform: camS === 1 ? undefined : `translate(360px,640px) scale(${camS.toFixed(4)}) translate(-360px,-640px)`}}>
        {/* Follow TCP Stream Pill（主角之一，紫光） */}
        {N >= T_PILL ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PILL, 8), transform: `translate(360px,340px) scale(${pillS.toFixed(4)}) translate(-360px,-340px)`}}>
            <Pill x={200} y={311} w={320} h={58} fill="#6630F8" stroke={WHITE} sw={2.5} r={29} text="Follow TCP Stream" fontSize={26} weight={700} letterSpacing={1} textDy={0} glow={glowPurpleS(gk)} />
          </div>
        ) : null}

        {/* 转录卡（2 行打字机） */}
        <SoftIn N={N} f0={T_CARD}>
          <Box x={90} y={410} w={510} h={162} r={10} sw={2.5} />
        </SoftIn>
        {LINES.map((ln, li) => {
          const n = N - ln.t0;
          if (n < 0) return null;
          const typed = Math.min(ln.t.length, Math.floor(n / 1.4));
          return (
            <div key={li} style={{...abs(ln.x, ln.y), display: 'flex', alignItems: 'center', gap: 12, opacity: clamp01((n + 2) / 6)}}>
              <span style={{fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: 26, lineHeight: 1, color: ln.cli ? GREY_LIGHT : ORANGE, opacity: clamp01(n / 5)}}>{ln.cli ? '\u2192' : '\u2190'}</span>
              <span style={{fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: 26, lineHeight: 1, color: ln.cli ? GREY_LIGHT : WHITE, whiteSpace: 'pre'}}>{ln.t.slice(0, typed)}</span>
            </div>
          );
        })}

        {/* v2: 时间轴游标（播放头持续扫过 x80→600，周期 72 帧——"read the timestamps"的可感知动词） */}
        {N >= T_TL + 16 ? (() => {
          const cyc = 72;
          const t = ((N - T_TL - 16) % cyc) / cyc;
          const cx = AXIS.x0 + (AXIS.x1 - AXIS.x0) * t;
          return (
            <div style={{position: 'absolute', inset: 0, opacity: 0.9}}>
              <div style={{...abs(cx - 2, AXIS.y - 52, 4, 76), background: ORANGE, boxShadow: '0 0 10px 3px rgba(243,95,69,.8)'}} />
              <div style={{position: 'absolute', left: cx - 8, top: AXIS.y - 66, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `12px solid ${ORANGE}`}} />
            </div>
          );
        })() : null}
{/* 时钟（秒针持续转 = 持续动作） */}
        <SoftIn N={N} f0={T_TL}>
          <ClockIcon cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={N} accent={ORANGE} />
        </SoftIn>

        {/* 时间轴 + 5 时刻点 + 标签 */}
        {N >= T_TL ? (
          <>
            <div style={{...abs(AXIS.x0, AXIS.y - 1.25, (AXIS.x1 - AXIS.x0) * axisP, 2.5), background: WHITE, opacity: 0.9, boxShadow: '0 0 8px rgba(255,255,255,.45)'}} />
            {PX.map((x, i) => {
              const lit = N >= LIGHT[i];
              const retrans = i >= 2;
              const pop = 1 + 0.5 * tri(N - LIGHT[i], 8);
              return (
                <div key={i} style={{...abs(x - 8, AXIS.y - 8, 16, 16), transform: `scale(${pop.toFixed(3)})`}}>
                  <div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 8,
                      background: lit ? (retrans ? ORANGE : WHITE) : '#000',
                      border: `2px solid ${lit ? (retrans ? ORANGE : WHITE) : GREY}`,
                      opacity: lit ? 1 : 0.6,
                      boxShadow: lit && retrans ? `0 0 12px 2px rgba(240,95,65,${(0.55 * gk).toFixed(2)})` : lit ? '0 0 8px rgba(255,255,255,.4)' : undefined,
                    }}
                  />
                </div>
              );
            })}
            {PX.map((x, i) => {
              const lit = N >= LIGHT[i];
              const retrans = i >= 2;
              return (
                <div
                  key={i}
                  style={{
                    ...abs(x - 60, 796, 120, 32), textAlign: 'center',
                    fontFamily: "'SF Mono', Menlo, Consolas, monospace", fontSize: 22, lineHeight: '32px',
                    color: lit ? (retrans ? ORANGE : WHITE) : GREY,
                    opacity: lit ? clamp01((N - LIGHT[i]) / 5) : 0.45,
                  }}
                >
                  {TIMES[i]}
                </div>
              );
            })}
            {/* Time 橙框（沿时间戳序列跳跃的焦点框 = 横版 Time 列橙框的竖版化） */}
            {N >= T_TL + 4 ? (
              <div
                style={{
                  ...abs(frameX - 54, 789, 108, 46),
                  border: `3px solid ${ORANGE}`,
                  borderRadius: 9,
                  background: 'rgba(240,95,65,.06)',
                  boxShadow: `0 0 16px 3px rgba(240,95,65,${(0.4 * gk).toFixed(2)})`,
                  opacity: clamp01((N - (T_TL + 4)) / 6),
                }}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};
