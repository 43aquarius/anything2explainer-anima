import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, rnd, FONT_MONO, FONT_ORB} from '../../common';
import {CText, Svg, ArrowH, WHITE, PURPLE_LIGHT, GREY, GREY_MID, BLOOM_SOFT, abs, exitOp, firstOp, fadeIn, glowOffK} from '../../ui';

/**
 * SC13 名字还在文件里 · N 1964–2023（S13 1972–2021：1972「His initials are still in the file.」）
 * 一枚放大的 ZIP 文件图标（200,200,220×220：白边卡 + 折角 + 中央竖排拉链小齿 + `.zip` 小标）
 *   → 大箭头（444–594）→ 十六进制放大镜（镜心 (820,310) r 168 + 柄，镜片内放大字节 + 紫 `?` 24 帧周期旋转，持续动作）。
 * 节拍：1966 文件卡 scaleIn 21 帧（节拍 1972 −6 容差）+ 拉链齿 2 帧错峰 draw-on（1978+）+ `.zip` SoftIn（1990）；
 *   1978 箭头 draw-on 14 帧 + 箭头端 pulse（呼吸到离场）；1985 放大镜自右滑入（Δ170/18 帧）+ 镜片白光；
 *   `?` 全镜 24 帧周期绕镜心旋转。末 8 帧归零（镜片白光先灭 6 帧）。停留：段内不判。零 glitch。
 */
const F0 = 1964, TO = 2023;
const T_CARD = 1966; // 文件卡 scaleIn（21 帧）
const T_TEETH = 1978; // 拉链齿 2 帧错峰
const T_ARROW = 1978; // 箭头 draw-on 14 帧
const T_ZIP = 1990; // `.zip` 小标
const T_LENS = 1985; // 放大镜滑入 18 帧
const LENS = {cx: 820, cy: 310, r: 168};
const HANDLE = {x0: 938, y0: 428, x1: 1006, y1: 496};
/** 镜片内的放大字节（确定性 rnd，hex 噪声与 HexDump 图元同一性质：非事实数据） */
const BYTES = Array.from({length: 4}, (_, i) => Math.floor(rnd(55, i) * 256).toString(16).padStart(2, '0'));

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO, 6);

  // 文件卡
  const cn = N - T_CARD;
  const cs = cn < 0 ? 0 : 0.6 + 0.4 * clamp01(cn / 21);
  const cardOp = (cn < 0 ? 0 : firstOp(cn, 6)) * exOp;

  // 箭头
  const ap = clamp01((N - T_ARROW) / 14);
  const arrowOp = ap > 0 ? exOp : 0;
  const tipPulse = N >= T_ARROW + 14 ? 0.35 + 0.25 * Math.sin((2 * Math.PI * N) / 24) : 0; // 箭头端呼吸

  // 放大镜（自右滑入）与 ? 旋转（24 帧周期，持续动作）
  const ln = N - T_LENS;
  const lensDx = ln < 0 ? 170 : 170 * powOutRemain(ln, 18, 2.5);
  const lensOp = (ln < 0 ? 0 : firstOp(ln, 6)) * exOp;
  const qa = (Math.PI * 2 * N) / 24;
  const qx = LENS.cx + 84 * Math.cos(qa);
  const qy = LENS.cy + 84 * Math.sin(qa);
  const lensGlow = `0 0 ${(18 + 7 * Math.sin((2 * Math.PI * N) / 30)).toFixed(1)}px 6px rgba(255,255,255,${(0.3 * glowK).toFixed(3)})`;
  const hp = clamp01((N - (T_LENS + 16)) / 10); // 镜柄 draw-on

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* ZIP 文件图标（折角卡 + 竖排拉链齿） */}
      {cn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: cardOp, transform: `scale(${cs.toFixed(4)})`, transformOrigin: '310px 310px'}}>
          <svg width={220} height={220} viewBox="0 0 220 220" style={{position: 'absolute', left: 200, top: 200, overflow: 'visible', filter: BLOOM_SOFT}}>
            <path d="M2,2 H168 L218,52 V218 H2 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
            <path d="M168,2 V52 H218" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
            {/* 拉链头 */}
            <rect x={102} y={20} width={16} height={13} fill="#000" stroke={WHITE} strokeWidth={2} />
            {/* 拉链齿 7 枚，2 帧错峰 */}
            {Array.from({length: 7}, (_, i) => {
              const tn = N - (T_TEETH + i * 2);
              if (tn < 0) return null;
              return <rect key={i} x={i % 2 === 0 ? 96 : 110} y={42 + i * 24} width={12} height={10} fill={WHITE} opacity={fadeIn(tn, 4) * 0.92} />;
            })}
          </svg>
          <CText cx={310} cy={448} size={22} weight={600} family={FONT_MONO} color={GREY} opacity={N < T_ZIP ? 0 : firstOp(N - T_ZIP, 6)}>{'.zip'}</CText>
        </div>
      ) : null}

      {/* 大箭头（自左 draw-on）+ 箭头端 pulse */}
      {arrowOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: arrowOp}}>
          <ArrowH x={444} y={296} w={150} h={30} p={ap} />
          {tipPulse > 0 ? <div style={{position: 'absolute', left: 598, top: 302, width: 16, height: 16, borderRadius: '50%', background: WHITE, opacity: tipPulse}} /> : null}
        </div>
      ) : null}

      {/* 十六进制放大镜（镜片白光 + 镜柄 + 放大字节 + 紫 ? 旋转） */}
      {ln >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: lensOp, transform: `translateX(${lensDx.toFixed(2)}px)`}}>
          <div style={{...abs(LENS.cx - LENS.r, LENS.cy - LENS.r, LENS.r * 2, LENS.r * 2), borderRadius: '50%', border: `3px solid ${WHITE}`, background: 'rgba(0,0,0,0.55)', boxShadow: lensGlow}} />
          {/* 镜柄 */}
          {hp > 0 ? (
            <Svg bloom={false}>
              <line x1={HANDLE.x0} y1={HANDLE.y0} x2={HANDLE.x0 + (HANDLE.x1 - HANDLE.x0) * hp} y2={HANDLE.y0 + (HANDLE.y1 - HANDLE.y0) * hp} stroke={WHITE} strokeWidth={11} strokeLinecap="round" />
            </Svg>
          ) : null}
          {/* 镜片内放大的字节（灰，噪声音阶——揭示留给 SC15） */}
          <div style={{...abs(LENS.cx - 160, LENS.cy - 20, 320, 40), display: 'flex', justifyContent: 'center', gap: 22, fontFamily: FONT_MONO, fontSize: 30, color: GREY_MID, opacity: fadeIn(ln - 8, 10)}}>
            {BYTES.map((b, i) => <span key={i}>{b}</span>)}
          </div>
          {/* 紫 ?（24 帧周期绕镜心旋转 = 持续动作） */}
          <CText cx={qx} cy={qy} size={54} weight={700} family={FONT_ORB} color={PURPLE_LIGHT} shadow={`0 0 ${14 + 5 * Math.sin((2 * Math.PI * N) / 24)}px 4px rgba(102,45,248,.5)`}>{'?'}</CText>
        </div>
      ) : null}
    </div>
  );
};
