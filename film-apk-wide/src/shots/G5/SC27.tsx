import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, rnd, FONT_ORB} from '../../common';
import {CText, PhoneMock, EXAMPLE, GREY, RED_DEEP, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {ParcelGlow} from './g5ui';
import {countTo} from '../../fx';

/**
 * SC27 陌生人的包裹 · N 3775–3921（S27 3783–3919：3783 互联网来的 zip / 3851 120 兆的陌生人）
 * 左半：网络线（画外 → 手机）draw-on 12 帧 + 包裹（w 200）自左滑入 20 帧停在中景 (400,320) + HeroGlow；
 * 3851 三枚灰问号循环上浮渐隐（2px/帧，持续）+ `120 MB`（Orbitron 44px 白）14 帧计数落位 +
 * 包裹封条区红点闪烁（待验证，30 帧周期，持续）。
 * 右半：手机缩微 0.45×（108×216）在线的右端等待接收（screenLabel = EXAMPLE.appName）。
 * 末 8 帧归零。主角：包裹+问号组（220px）；光：包裹 HeroGlow + 红点警示闪。
 */
export const F0 = 3775;
const TO = 3921;
const B_LINE = 3783, B_STRANGER = 3851;
const LINE = {x0: 70, x1: 952, y: 330};
const PHONE = {x: 984, y: 222, w: 108, h: 216};
const PRCL = {cx: 400, cy: 320, w: 200, h: 140};

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;

  // 网线 draw-on（12 帧）
  const lineP = easeOutCubic(clamp01((N - B_LINE) / 12));
  // 包裹自左滑入（20 帧 powOut 感 = easeOutCubic），停在中景
  const slT = easeOutCubic(clamp01((N - B_LINE) / 20));
  const pcx = -110 + (PRCL.cx + 110) * slT;
  const glowK = clamp01((N - (B_LINE + 16)) / 8) * glowOffK(N, TO, 6, 8);
  const prOp = softOp(N - B_LINE, 6);

  // 三枚问号：rnd 相位循环上浮 2px/帧，整程渐显渐隐
  const qmark = (i: number) => {
    const cycle = 50 + Math.round(rnd(i * 7 + 2) * 14);
    const ph = rnd(i * 3 + 11) * cycle;
    const t = (N + ph) % cycle;
    const y = 246 - 2 * t;
    const o = Math.sin(Math.PI * (t / cycle)) * 0.72;
    const x = 340 + i * 30 + (rnd(i * 5 + 3) - 0.5) * 36;
    return {x, y, o};
  };

  // 120 MB 计数（14 帧）
  const mbN = N - B_STRANGER;
  const mbVal = mbN >= 0 ? countTo(mbN, 0, 120, 14) : '0';
  // 红点（30 帧周期闪烁）
  const dotOp = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30));

  const phOp = softOp(N - (B_LINE + 6), 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 网络线（画外 → 手机） */}
      {lineP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <line x1={LINE.x0} y1={LINE.y} x2={LINE.x0 + (LINE.x1 - LINE.x0) * lineP} y2={LINE.y} stroke={WHITE} strokeWidth={2.5} opacity={0.85} />
          {lineP >= 1 ? <polygon points={`${LINE.x1 + 2},${LINE.y - 7} ${LINE.x1 + 16},${LINE.y} ${LINE.x1 + 2},${LINE.y + 7}`} fill={WHITE} opacity={0.85} /> : null}
        </svg>
      ) : null}

      {/* 右半手机缩微（等待接收） */}
      {phOp > 0 ? <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} iconN={0} dim opacity={phOp * 0.95} screenLabel={EXAMPLE.appName} /> : null}

      {/* 包裹（滑入停定 + HeroGlow） */}
      {prOp > 0 ? <ParcelGlow cx={pcx} cy={PRCL.cy} w={PRCL.w} h={PRCL.h} N={N} sealP={1} glowK={glowK} opacity={prOp} /> : null}

      {/* 三枚灰问号（循环上浮，持续动作） */}
      {N >= B_STRANGER
        ? [0, 1, 2].map((i) => {
            const q = qmark(i);
            return (
              <CText key={i} cx={q.x} cy={q.y} size={34} weight={900} color={GREY} opacity={q.o} letterSpacing={2}>
                ?
              </CText>
            );
          })
        : null}

      {/* 120 MB（计数落位） */}
      {mbN >= 0 ? (
        <CText cx={PRCL.cx} cy={432} size={44} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1} shadow="0 0 10px rgba(255,255,255,.35)" style={{fontVariantNumeric: 'tabular-nums'}}>
          {mbVal} MB
        </CText>
      ) : null}

      {/* 封条区红点（待验证，30 帧周期闪烁） */}
      {N >= B_STRANGER ? (
        <svg width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', left: PRCL.cx - 20, top: 376 - 20, overflow: 'visible', opacity: dotOp}}>
          <circle cx={20} cy={20} r={5.5} fill={RED_DEEP} style={{filter: 'drop-shadow(0 0 6px rgba(236,8,31,.85))'}} />
          <circle cx={20} cy={20} r={9} fill="none" stroke={RED_DEEP} strokeWidth={1.4} opacity={0.5} />
        </svg>
      ) : null}
    </div>
  );
};

export default SC27;
