import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, FONT_MONO} from '../../common';
import {EXAMPLE, Box, FilterBar, Pill, abs, exitOp, firstOp, glowOffK, glowPurpleS, GREY_LIGHT, ORANGE, PURPLE_LIGHT, slideUp, WHITE} from '../../ui';

/**
 * SC28 显示过滤器 + Follow TCP Stream · N 6174–6573（S36+S37 ¶：6182 录完再滤 / 6255 http or dns /
 *   6319 只是藏起来 / 6373 找到一段对话 / 6430 Follow TCP Stream / 6471 可读的转录）
 * 版式：顶 FilterBar（粉紫边，x200 y158 w880）+ 6 行紧凑列表（x130, mono 24, wsRows；亮行 806/808）；
 *   下半转录卡（x220 y445 w840 h160）：客户端行 `GET /checkout HTTP/1.1`（缩进、浅灰 + → ）与
 *   服务器行 `HTTP/1.1 200 OK`（白 + ← 橙）交替 4 行；`Follow TCP Stream` 紫 Pill（本组唯一 glitch）。
 * 节拍：6174 列表先在（承接"同一份捕获"）；6182 过滤条 wipe；6255 打字机 http or dns（2 帧/字）→ 6281 确认白闪；
 *   6319 四行降暗到 0.25（不消失，仍在原位）；6373 转录卡 slideUp；6430 Pill GlitchIn + 两条引线 draw-on（14 帧）；
 *   6465 起转录行打字机（客户端 1.4 帧/字，箭头随行点亮；后两行 8 帧 wipe）。
 * 停留：段末 ¶，末行落位 ~6535 → 离场 6565，30 帧纯静态 ✓。
 */
const F0 = 6174, TO = 6573;
const B_BAR = 6182, B_TYPE = 6255, B_HIDE = 6319, B_CARD = 6373, B_FOLLOW = 6430;
const FILTER = 'http or dns';
const ROWS_Y0 = 238, ROWS_PITCH = 28;
const BRIGHT = [0, 2]; // 806 / 808 = 客户端请求 + 服务器应答（找到的那段对话）
const CARD = {x: 220, y: 445, w: 840, h: 160};
const LINES = [
  {t: 'GET /checkout HTTP/1.1', cli: true, t0: 6465, wipe: false},
  {t: 'HTTP/1.1 200 OK', cli: false, t0: 6501, wipe: false},
  {t: 'GET /checkout HTTP/1.1', cli: true, t0: 6525, wipe: true},
  {t: 'HTTP/1.1 200 OK', cli: false, t0: 6527, wipe: true},
];
const LINE_Y = [478, 508, 538, 568];

export const SC28: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);
  const shown = Math.min(FILTER.length, Math.floor(clamp01((N - B_TYPE) / 2) * FILTER.length));
  const confirm = N >= 6281 && N < 6284 ? (N - 6281) / 3 : -1;
  // 行透明度：亮行保持 1，其余 6319 起 8 帧降到 0.25
  const dimK = clamp01((N - B_HIDE) / 8);
  // 转录卡 slideUp
  const cn = N - B_CARD;
  const cardDy = cn < 0 ? 0 : slideUp(cn, 70);
  const cardOp = cn < 0 ? 0 : firstOp(cn, 8);
  // 引线 draw-on（6434 起 14 帧）
  const leadP = clamp01((N - (B_FOLLOW + 4)) / 14);
  const LEADS = [
    {x0: 800, y0: ROWS_Y0 + 0 * ROWS_PITCH + 12, x1: 330, y1: LINE_Y[0] - 4},
    {x0: 800, y0: ROWS_Y0 + 2 * ROWS_PITCH + 12, x1: 470, y1: LINE_Y[1] - 4},
  ];

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 6 行紧凑列表 */}
      {EXAMPLE.wsRows.map((row, i) => {
        const bright = BRIGHT.includes(i);
        const o = bright ? 1 : 1 - dimK * 0.75;
        const rn = N - (F0 + i);
        if (rn < 0) return null;
        return (
          <div
            key={row.no}
            style={{
              ...abs(130, ROWS_Y0 + i * ROWS_PITCH),
              fontFamily: FONT_MONO,
              fontSize: 24,
              lineHeight: 1,
              color: bright && dimK > 0 ? WHITE : GREY_LIGHT,
              opacity: clamp01(rn / 6) * o,
              textShadow: bright && dimK > 0 ? '0 0 10px rgba(255,255,255,.35)' : undefined,
            }}
          >
            {row.no} <span style={{opacity: 0.85}}>{row.t}</span> {row.src} <span style={{color: PURPLE_LIGHT}}>{row.proto}</span>
          </div>
        );
      })}
      {/* 过滤条（粉紫边） */}
      {N >= B_BAR ? (
        <div style={{...abs(200, 158, 880, 64), clipPath: `inset(0 ${(100 - clamp01((N - B_BAR) / 10) * 100).toFixed(1)}% 0 0)`}}>
          {N >= B_TYPE ? <div style={{...abs(0, 0, 880, 64), borderRadius: 32, boxShadow: '0 0 18px rgba(161,117,241,.45)'}} /> : null}
          <FilterBar x={0} y={0} w={880} h={64} text={FILTER} shown={shown} dotColor={PURPLE_LIGHT} glowColor={PURPLE_LIGHT} />
          {confirm >= 0 ? <div style={{position: 'absolute', inset: 0, background: WHITE, opacity: 0.4 * (1 - Math.abs(confirm - 0.5) * 2 + 0.2), borderRadius: 32}} /> : null}
        </div>
      ) : null}
      {/* 转录卡 */}
      {cn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${cardDy.toFixed(1)}px)`, opacity: cardOp}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={10} sw={2.5} />
          {/* Follow TCP Stream 按钮 Pill（本组唯一 glitch） */}
          {N >= B_FOLLOW ? (
            <GlitchIn N={N} f0={B_FOLLOW} seed={28}>
              <Pill x={250} y={421} w={310} h={46} fill="#6630F8" stroke={WHITE} sw={2} text="Follow TCP Stream" fontSize={24} weight={700} textDy={0} glow={glowPurpleS(gk)} />
            </GlitchIn>
          ) : null}
          {/* 两条引线（列表亮行 → 卡内对应方向行） */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {LEADS.map((l, i) => {
              if (leadP <= 0) return null;
              const L = Math.hypot(l.x1 - l.x0, l.y1 - l.y0);
              return <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1} stroke={WHITE} strokeWidth={2} opacity={0.75} strokeDasharray={`${L}`} strokeDashoffset={L * (1 - leadP)} />;
            })}
          </svg>
          {/* 转录行（客户端缩进浅灰 + → ；服务器白 + ← 橙；方向箭头随行点亮） */}
          {LINES.map((ln, li) => {
            const n = N - ln.t0;
            if (n < 0) return null;
            const typedChars = ln.wipe ? LINES[li - 2].t.length : Math.floor(n / 1.4);
            const text = ln.wipe ? ln.t : ln.t.slice(0, Math.min(ln.t.length, typedChars));
            const wp = ln.wipe ? clamp01(n / 8) : 1;
            const arrowOp = ln.wipe ? clamp01((n - 2) / 5) : clamp01((n - 1) / 5);
            return (
              <div key={li} style={{...abs(ln.cli ? 330 : 470, LINE_Y[li]), display: 'flex', alignItems: 'center', gap: 12, opacity: 1, clipPath: ln.wipe ? `inset(0 ${((1 - wp) * 100).toFixed(1)}% 0 0)` : undefined}}>
                <span style={{fontFamily: FONT_MONO, fontSize: 26, lineHeight: 1, color: ln.cli ? GREY_LIGHT : ORANGE, opacity: arrowOp}}>{ln.cli ? '\u2192' : '\u2190'}</span>
                <span style={{fontFamily: FONT_MONO, fontSize: 26, lineHeight: 1, color: ln.cli ? GREY_LIGHT : WHITE, whiteSpace: 'pre'}}>{text}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
