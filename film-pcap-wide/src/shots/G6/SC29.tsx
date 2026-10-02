import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, powIn} from '../../common';
import {BrowserMock, ClockIcon, FilterBar, CText, EXAMPLE, GREEN, GREY_LINE, ORANGE, PURPLE, WHITE, abs, fadeIn, fadeOut, firstOp, exitOp, mixHex, SoftIn} from '../../ui';
import {CameraRig} from '../../fx';
import {MiniRow} from './g6ui';

/**
 * SC29 过滤到那台主机 · N 6574–6771（S38 6582–6769：6582 回到结账页 / 6632 过滤 API 主机 / 6692 跟随流 / 6726 读时间戳）
 * 版式：左上 SC01 浏览器缩略 0.4×（transform scale，回场提示）＋ FilterBar 打字 `api.shop.example`（y≈196）＋
 *   精简列表（x 160–1040）：12 行拥挤 → 白闪确认后滤到 5 行（多余行左滑淡出）→ 3 行 checkout 重传紫边点亮、9.010 当前行紫底 →
 *   Time 列橙框 wipe 圈出 + 时间值逐个橙闪 + 右侧时钟秒针持续转。
 * 运镜：6690–6723 33 帧 1→1.18 推向 Time 列（6726 前结束）。零 glitch（白名单）。
 * 停留：段内不判（S38 非 ¶）。末 8 帧归零。
 * 主角：Time 列组（橙框 + 5 行等宽行，组高 ~280px）；光 = 橙框橙光 + 当前行紫光。
 */
const F0 = 6574, TO = 6771;
const T_BR = 6582, T_LIST = 6632, T_CONFIRM = 6664, T_ROWS = 6692, T_TIME = 6726;
const CAM_KEYS = [
  {f: 6690, x: 640, y: 360, s: 1},
  {f: 6723, x: 515, y: 435, s: 1.18},
];
const TYPED = EXAMPLE.apiHost; // 'api.shop.example'（16 字 → 2 帧/字打字 32 帧，6664 打完即白闪确认）
const LIST = {x: 160, y: 322, w: 880, h: 286};
const ROW_H = 50;
const ROWS = [EXAMPLE.wsRows[0], EXAMPLE.wsRows[1], EXAMPLE.wsRows[3], EXAMPLE.wsRows[4], EXAMPLE.wsRows[5]];
const MARKED = [false, false, true, true, true]; // 812/813/814 = checkout 重传行
const N_CROWD = 12;
const CROWD_DIE = [2, 5, 6, 7, 8, 9, 11]; // 被滤掉的行（左滑淡出）
const CLOCK = {cx: 1000, cy: 190, r: 52};
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC29: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const shown = Math.max(0, Math.min(TYPED.length, Math.floor((N - T_LIST) / 2)));
  const confirmed = N >= T_CONFIRM;
  const flash = tri(N - T_CONFIRM, 7);
  // 拥挤 12 行 → 5 行
  const collapse = N - T_CONFIRM;
  // Time 橙框（14 帧 wipe 自左）+ 逐个橙闪
  const frameP = easeOutCubic(clamp01((N - T_TIME) / 14));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* 浏览器缩略（SC01 同款 0.4×，settled：载入条满） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_BR, 8), transform: `scale(0.4)`, transformOrigin: '64px 112px'}}>
          <BrowserMock x={64} y={112} w={470} h={380} skeleton={6} progress={1} />
        </div>
        {/* 过滤条：打字 api.shop.example → 白闪确认（绿点常亮） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_LIST, 8), filter: flash > 0 ? `brightness(${(1 + 0.55 * flash).toFixed(2)})` : undefined}}>
          <FilterBar x={270} y={196} w={660} h={60} text={TYPED} shown={shown} dotColor={GREEN} glowColor={confirmed ? PURPLE : undefined} />
        </div>
        {/* 时钟（秒针持续旋转 = 持续动作） */}
        <SoftIn N={N} f0={T_TIME}>
          <ClockIcon cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} N={N} accent={ORANGE} />
        </SoftIn>
        {/* 列表容器 */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_LIST, 8)}}>
          <div style={{...abs(LIST.x, LIST.y, LIST.w, LIST.h), background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 10}} />
          {/* 拥挤 12 行（灰） */}
          {Array.from({length: N_CROWD}, (_, i) => {
            const ln = N - T_LIST;
            if (ln < 0) return null;
            const dieIdx = CROWD_DIE.indexOf(i);
            const dn = dieIdx >= 0 ? collapse - dieIdx : -1;
            const die = dn > 0;
            const dx = die ? -powIn(1.7)(clamp01(dn / 8)) * 110 : 0;
            const o = die ? fadeOut(dn, 8) : dieIdx < 0 && collapse > 0 ? fadeOut(collapse, 8) : fadeIn(ln, 8);
            if (o <= 0.01) return null;
            return (
              <div key={i} style={{...abs(LIST.x + 18, 340 + i * 21, LIST.w - 36, 18), opacity: o, transform: `translateX(${dx.toFixed(1)}px)`, borderBottom: `2px solid ${GREY_LINE}`, display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{width: 34, height: 6, background: GREY_LINE}} />
                <div style={{width: 52, height: 6, background: GREY_LINE}} />
                <div style={{width: 78, height: 6, background: GREY_LINE}} />
                <div style={{width: 300, height: 6, background: GREY_LINE, opacity: 0.6}} />
              </div>
            );
          })}
          {/* 滤后 5 行（MiniRow） */}
          {ROWS.map((r, i) => {
            const rn = collapse - 1 - i * 2;
            if (rn < 0) return null;
            const rowOp = fadeIn(rn, 8);
            const markK = clamp01((N - (T_ROWS + (i - 2) * 2)) / 8) * (MARKED[i] ? 1 : 0);
            const flick = tri(N - (T_TIME + 6 + i * 5), 10);
            const timeCol = flick > 0 ? mixHex(WHITE, ORANGE, Math.max(flick, N > T_TIME + 14 + i * 5 ? 1 : 0)) : N > T_TIME + 14 + i * 5 ? ORANGE : undefined;
            return (
              <div key={r.no} style={{opacity: rowOp}}>
                <MiniRow x={LIST.x + 12} y={336 + i * 52} w={LIST.w - 24} h={ROW_H} no={r.no} t={r.t} proto={r.proto} info={r.info} active={i === 2 && N >= T_ROWS} markK={markK} timeColor={timeCol} />
              </div>
            );
          })}
          {/* Time 列橙框（圈出 time 字段段：行内 x 84–192 → 画布 244–352） */}
          {frameP > 0 ? (
            <div style={{...abs(LIST.x + 76, LIST.y + 10, 120, 272), transform: `scaleX(${frameP.toFixed(3)})`, transformOrigin: 'left center', border: `3px solid ${ORANGE}`, borderRadius: 6, boxShadow: '0 0 18px 4px rgba(240,95,65,.35)', background: 'rgba(240,95,65,.05)'}} />
          ) : null}
          {/* Time 标签（橙小字；帧柜下方，不出字幕带） */}
          {N >= T_TIME + 4 ? <CText cx={LIST.x + 136} cy={LIST.y + LIST.h + 16} size={24} weight={700} color={ORANGE}>Time</CText> : null}
        </div>
      </CameraRig>
    </div>
  );
};
