import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO, FONT_ORB, kf, powIn, rnd} from '../../common';
import {EXAMPLE, FilterBar, Pill, SoftIn, WSWindow, abs, exitOp, firstOp, GREY, GREY_LIGHT, GREEN, ORANGE, PURPLE, WHITE} from '../../ui';

/**
 * SC27 捕获过滤器 · N 5936–6173（S34+S35：5944 包太多 / 5983 两种过滤器 / 6027 边录边滤 / 6094 内核级严格便宜）
 * 版式：右上 0.55 缩略窗（x648–1220, y112–365，pane① 紫边）；左侧拥挤列表 12 小行（x130, mono 22，wsRows 循环）；
 *   右中 `1,000s of rows` 橙计数（跳动）；底部 FilterBar（x200 y540 w880，打字机 tcp port 443 + 绿点）。
 * 节拍：5936 缩略窗入场；5944 拥挤列表快速淡入 + 计数橙显跳动；5983 过滤条 wipe；6027 打字机（每 2 帧 1 字）+
 *   绿点呼吸；6094 回车白闪 3 帧 → 12 行压缩为 4 行（多余行 powIn² 下坠 8 帧、幸存行 kf 12 帧散开变白）+
 *   条边绿光 + `kernel-level` Pill SoftIn + `strict · cheap` 灰字；末 8 帧归零。
 * 停留：段内不判（S35 非 ¶）。零 glitch（白名单：本镜无）。
 */
const F0 = 5936, TO = 6173;
const B_MANY = 5944, B_BAR = 5983, B_TYPE = 6027, B_KERNEL = 6094;
const FILTER = 'tcp port 443';
const LIST = {x: 130, y0: 142, pitch: 30, n: 12};
const SURV = [0, 1, 2, 3]; // 压缩后幸存行（806/807/808/812）
const NEWY = [200, 246, 292, 338];
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 缩略窗入场（0.85→1）
  const wn = N - F0;
  const wS = wn < 0 ? 0 : 0.85 + 0.15 * (1 - Math.pow(1 - clamp01(wn / 12), 3));
  // 打字机与绿点
  const typed = clamp01((N - B_TYPE) / 2) * FILTER.length;
  const shown = Math.min(FILTER.length, Math.floor(typed));
  const dotColor = N >= B_TYPE + 2 * FILTER.length ? GREEN : GREY;
  // 压缩（6094）：多余行下坠，幸存行散开
  const cn = N - B_KERNEL;
  const dropped = cn > 0;
  const moveK = easeInOutPow(2.5)(clamp01(cn / 12));
  const flash = tri(N - B_KERNEL, 5);
  // 计数跳动（5944 起；6098 换 4 rows）
  const cntPulse = 1 + 0.06 * tri((N - B_MANY) % 26, 26);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 右上缩略整窗（配角） */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(wn, 8), transformOrigin: '934px 238px', transform: wS < 1 ? `scale(${wS.toFixed(4)})` : undefined}}>
        <WSWindow x={648} y={112} w={572} h={253} paneBorders={[true, false, false]} />
      </div>
      {/* 拥挤列表（12 小行） */}
      {Array.from({length: LIST.n}, (_, i) => {
        const rn = N - (B_MANY + i);
        if (rn < 0) return null;
        const row = EXAMPLE.wsRows[i % 6];
        const isSurv = SURV.includes(i);
        const si = SURV.indexOf(i);
        // 幸存行：散开到 NEWY；多余行：powIn² 下坠淡出
        const y = isSurv && dropped ? LIST.y0 + i * LIST.pitch + (NEWY[si] - (LIST.y0 + i * LIST.pitch)) * moveK : LIST.y0 + i * LIST.pitch;
        const dropN = !isSurv && dropped ? cn : 0;
        const dDy = dropN > 0 ? 34 * powIn(2)(clamp01(dropN / 8)) : 0;
        const dOp = dropN > 0 ? Math.max(0, 1 - dropN / 8) : 1;
        const bright = isSurv && dropped ? clamp01((cn - 2) / 8) : 0;
        const relight = isSurv && dropped ? tri(cn - 6 - si * 2, 6) : 0;
        return (
          <div
            key={i}
            style={{
              ...abs(LIST.x, y + dDy),
              fontFamily: FONT_MONO,
              fontSize: 22,
              lineHeight: 1,
              opacity: clamp01(rn / 4) * dOp,
              color: bright > 0 ? (bright >= 1 ? WHITE : `rgb(${Math.round(160 + 95 * bright)},${Math.round(160 + 95 * bright)},${Math.round(161 + 94 * bright)})`) : GREY,
              textShadow: relight > 0 ? `0 0 10px rgba(161,117,241,${(relight * 0.8).toFixed(2)})` : undefined,
            }}
          >
            {row.no} <span style={{opacity: 0.55}}>{row.proto}</span>{' '}
            <span style={{color: row.info.startsWith('[TCP') ? ORANGE : undefined, opacity: row.info.startsWith('[TCP') ? 1 : 0.55}}>{row.info}</span>
          </div>
        );
      })}
      {/* 行数计数（橙显跳动 → 过滤后 4 rows） */}
      {N >= B_MANY ? (
        <div style={{...abs(760, 400), transform: `scale(${(N >= 6098 ? 1 : cntPulse).toFixed(3)})`, transformOrigin: '0 0'}}>
          {N >= 6098 ? (
            <SoftIn N={N} f0={6098}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <span style={{fontFamily: FONT_ORB, fontSize: 46, fontWeight: 700, color: ORANGE, lineHeight: 1, textShadow: '0 0 16px rgba(240,95,65,.55)'}}>4</span>
                <span style={{fontSize: 24, fontWeight: 600, color: GREY}}>rows</span>
              </div>
            </SoftIn>
          ) : (
            <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
              <span style={{fontFamily: FONT_ORB, fontSize: 46, fontWeight: 700, color: ORANGE, lineHeight: 1, textShadow: '0 0 16px rgba(240,95,65,.55)'}}>1,000s</span>
              <span style={{fontSize: 24, fontWeight: 600, color: GREY}}>of rows</span>
            </div>
          )}
        </div>
      ) : null}
      {/* 过滤条（wipe + 打字机 + 绿点） */}
      {N >= B_BAR ? (
        <div style={{...abs(200, 540, 880, 64), clipPath: `inset(0 ${(100 - clamp01((N - B_BAR) / 12) * 100).toFixed(1)}% 0 0)`}}>
          {/* 绿光（打字开始呼吸，回车后常亮） */}
          {N >= B_TYPE ? (
            <div
              style={{...abs(0, 0, 880, 64), borderRadius: 32, boxShadow: `0 0 ${N >= B_KERNEL ? 26 : 14 + 8 * Math.sin((N / 9) * Math.PI)}px rgba(143,247,64,${N >= B_KERNEL ? 0.5 : 0.38})`}}
            />
          ) : null}
          <FilterBar x={0} y={0} w={880} h={64} text={FILTER} shown={shown} dotColor={dotColor} />
        </div>
      ) : null}
      {/* kernel-level Pill + 灰字 */}
      <SoftIn N={N} f0={B_KERNEL + 4}>
        <Pill x={908} y={470} w={172} h={42} fill={PURPLE} stroke={WHITE} sw={2} text="kernel-level" fontSize={22} weight={700} textDy={0} />
      </SoftIn>
      <SoftIn N={N} f0={B_KERNEL + 12}>
        <div style={{...abs(908, 516), fontFamily: FONT_MONO, fontSize: 22, color: GREY}}>strict syntax &middot; cheap</div>
      </SoftIn>
      {/* 回车白闪（列表区） */}
      {flash > 0 ? <div style={{...abs(LIST.x - 10, LIST.y0 - 10, 540, 360), background: WHITE, opacity: flash * 0.28, borderRadius: 8}} /> : null}
    </div>
  );
};
