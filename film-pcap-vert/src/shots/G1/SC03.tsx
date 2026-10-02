import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_TECH} from '../../common';
import {PacketIcon, Pill, WHITE, abs, fadeIn, scaleIn, exitOp, SoftIn, Svg} from '../../ui';
import {DissectEnvelope} from './g1ui';

/**
 * SC03 信封流 · N 327–479（S04 335–477：335「travels as packets」/ 414「header and a payload」）
 * 竖版空间语言——**纵向流动**：竖放通道（界线 x300/x420，y460–940）内 5 枚信封自上而下 3.2px/帧持续流动（模长 480 循环，
 *   底部 895–935 淡出、顶部 460–485 淡入，视觉上信封不断从通道顶端进入 = 自上滑入）；上端 (360,370) 放大解剖信封 180×140
 *   （虚线分隔 header/payload 带 + 两枚小 Pill 左右引线标注）。
 * 节拍：335 通道界线自顶向下 wipe（16 帧）+ 信封 2 帧错峰淡入并持续下移（持续动作）；
 *   337 解剖信封 21 帧缩放入场（主角，beat1 +2）；414 虚线分隔 wipe（12 帧）+ header/payload 两 Pill SoftIn（2 帧错峰）
 *   + 左右引线 draw-on（12 帧）+ 紫光从 0.35 补满（8 帧）；471–479 归零。
 * 停留：末拍（引线）432 落位 → 离场 471，39 帧（S04 非 ¶，段内不判，达标留量）。
 * 主角：解剖信封 180×140（配两 Pill 成组），光 = GLOW_PURPLE_S（淡入 0.35 → 414 补满）。
 * 零 glitch（白名单）。持续动作全镜在线：5 信封 3.2px/帧下移。
 */
const F0 = 327;
const T_IN = 335;
const T_ENV = 337;
const T_ANAT = 414;
const TO = 479;
/** 通道（竖放）：界线 x300/x420，y460–940 */
const CH = {x0: 300, x1: 420, y0: 460, y1: 940, span: 480};
/** 流动信封：5 枚，64×44，3.2px/帧，模 480 循环，间隔 96 */
const FLOW = {n: 5, speed: 3.2, gap: 96};
const ANAT = {cx: 360, cy: 370, w: 180, h: 140};
const PILLS: Array<{text: string; cx: number; cy: number; w: number; ex: number}> = [
  {text: 'header', cx: 172, cy: 326, w: 120, ex: 268}, // 引线终点 = 信封左缘 270
  {text: 'payload', cx: 548, cy: 396, w: 132, ex: 452}, // 引线终点 = 信封右缘 450
];

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const bn = N - T_IN;
  // 通道界线自顶向下 wipe（16 帧）
  const chP = easeOutCubic(clamp01(bn / 16));
  // 流动信封：位置 = 模长循环（正 mod），淡入错峰 2 帧；顶/底 25px 渐隐形成"进/出"通道
  const t = Math.max(0, N - T_IN);
  const envs = Array.from({length: FLOW.n}, (_, i) => {
    const raw = (i * FLOW.gap + FLOW.speed * t) % CH.span;
    const cy = CH.y0 + raw;
    const fadeTop = clamp01((cy - CH.y0) / 25);
    const fadeBot = 1 - clamp01((cy - 895) / 40);
    const opE = fadeIn(bn - i * 2, 6) * fadeTop * fadeBot;
    return {cy, opE, key: i};
  });
  // 解剖信封：缩放入场 + 光（0.35 → 414 补满）
  const en = N - T_ENV;
  const es = scaleIn(en, 21);
  const glowK = clamp01(en / 8) * (0.35 + 0.65 * clamp01((N - T_ANAT) / 8));
  // 虚线分隔 wipe + 引线 draw-on
  const sepP = clamp01((N - T_ANAT) / 12);
  const leadP = easeOutCubic(clamp01((N - (T_ANAT + 6)) / 12));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 通道界线 ×2（纵向，顶部渐显底部渐隐） */}
      {[CH.x0, CH.x1].map((x, k) => (
        <div
          key={k}
          style={{
            ...abs(x - 1.25, CH.y0, 2.5, (CH.y1 - CH.y0) * chP),
            background: 'linear-gradient(180deg, rgba(255,255,255,.15), rgba(255,255,255,.6) 10%, rgba(255,255,255,.6) 80%, transparent)',
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,.4))',
            opacity: bn < 0 ? 0 : 1,
          }}
        />
      ))}
      {/* 流动信封（纵向 3.2px/帧，持续） */}
      {envs.map((e) => (e.opE > 0 ? <PacketIcon key={e.key} cx={360} cy={e.cy} w={64} h={44} opacity={e.opE} /> : null))}
      {/* 解剖信封（主角） */}
      {en >= 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(360px,370px) scale(${es.toFixed(4)}) translate(-360px,-370px)`,
            filter: `drop-shadow(0 0 12px rgba(102,45,248,${(0.25 * glowK).toFixed(3)}), drop-shadow(0 0 30px rgba(102,45,248,${(0.3 * glowK).toFixed(3)})`,
          }}
        >
          <DissectEnvelope cx={ANAT.cx} cy={ANAT.cy} w={ANAT.w} h={ANAT.h} sepP={sepP} />
        </div>
      ) : null}
      {/* header / payload 引线（draw-on 12 帧） */}
      {leadP > 0 ? (
        <Svg bloom={false}>
          {PILLS.map((p, i) => {
            const x0 = i === 0 ? p.cx + p.w / 2 : p.cx - p.w / 2;
            const x1 = p.ex;
            const w = (x1 - x0) * leadP;
            return <rect key={i} x={i === 0 ? x0 : x1 - w} y={p.cy - 1} width={Math.abs(w)} height={2} fill={WHITE} opacity={0.85} />;
          })}
        </Svg>
      ) : null}
      {/* header / payload 小 Pill（SoftIn 2 帧错峰；Exo2 斜体白字） */}
      {PILLS.map((p, i) => (
        <SoftIn key={p.text} N={N} f0={T_ANAT + i * 2}>
          <Pill x={p.cx - p.w / 2} y={p.cy - 19} w={p.w} h={38} r={19} sw={2} text={p.text} fontSize={24} family={FONT_TECH} color={WHITE} weight={600} letterSpacing={1} scaleX={1} />
        </SoftIn>
      ))}
    </div>
  );
};
