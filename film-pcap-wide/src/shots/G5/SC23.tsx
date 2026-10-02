import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO} from '../../common';
import {WSWindow, Pill, SoftIn, WHITE, PURPLE, GREY_LIGHT, GREY_LINE, abs, exitOp, firstOp, glowOffK, glowPurple} from '../../ui';
import {PcapIcon} from './g5ui';

/**
 * SC23 Wireshark 窗口全景 · N 5210–5352（S30 5218 打开文件 / 5273 三个缩放层级 / 5316 同一份证据）
 * 版式：整窗 WSWindow x120 y150 w1040 h460（主角 460px，HeroGlow 呼吸）；三区占位 + 区内缘 ①②③ Pill。
 * 节拍：5212 窗口 21 帧缩放入场；5213 SC22 的 pcap 文件图标 14 帧飞入标题栏（缩到 0.42，标签飞行中隐去）→
 *   5232 吸收 + 整窗白闪 + 标题栏右侧 `capture.pcap` SoftIn；5273 三区占位块依次 wipe（2 帧错峰）+
 *   ①②③ Pill SoftIn（8 帧间隔）；5316 三区边框紫光轮换（每区 14 帧当前 + 切换头 6 帧白边闪，持续到离场）；
 *   末 8 帧先灭光再归零。停留：段内不判。零 glitch（白名单：本镜无）。
 */
const F0 = 5210, TO = 5352;
const B_ZOOM = 5273, B_SAME = 5316;
const WIN = {x: 120, y: 150, w: 1040, h: 460};
/** 三区几何（窗口相对坐标：top 为窗口内 y，h 占 (h-49) 的 46/28/24%，与 WSWindow 内部 panes 一致） */
const PANES = [
  {top: 49, h: 189},
  {top: 238, h: 115},
  {top: 353, h: 99},
];
const PILLS = [
  {t: '\u2460 list', y: 122, w: 116},
  {t: '\u2461 details', y: 276, w: 156},
  {t: '\u2462 bytes', y: 380, w: 124},
];
const tri = (n: number, len = 6) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
const PH_N = [3, 3, 2];
const PH_W = [
  [680, 600, 640],
  [460, 340, 260],
];

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const gk = glowOffK(N, TO, 6, 8);
  const op = exitOp(N, TO, 8);
  // 窗口 21 帧缩放入场（0.62→1）
  const wn = N - 5212;
  const wS = wn < 0 ? 0 : 0.62 + 0.38 * (1 - Math.pow(1 - clamp01(wn / 21), 3));
  const wOp = firstOp(wn, 8);
  // pcap 图标：5213 起 14 帧飞入标题栏 (243,174)，缩 1→0.42；落地后 6 帧吸收淡出
  const fin = N - 5213;
  const fu = easeInOutPow(2.5)(clamp01(fin / 14));
  const iconCx = 520 + (243 - 520) * fu, iconCy = 300 + (174 - 300) * fu, iconS = 1 + (0.42 - 1) * fu;
  const iconLabel = 1 - clamp01(fin / 8);
  const absorb = fin > 14 ? Math.max(0, 1 - (fin - 14) / 6) : 1;
  const flash = tri(N - 5232, 7);
  // 紫光轮换（5316 起，每区 14 帧；切换头 6 帧白边闪）
  const cyc = N >= B_SAME ? Math.floor((N - B_SAME) / 14) % 3 : -1;
  const paneBorders: [boolean, boolean, boolean] = [cyc === 0, cyc === 1, cyc === 2];
  const paneFlash = cyc >= 0 ? tri((N - B_SAME) % 14, 6) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 主角光（窗后） */}
      {wOp > 0 ? (
        <div style={{...abs(WIN.x - 6, WIN.y - 6, WIN.w + 12, WIN.h + 12), borderRadius: 14, boxShadow: glowPurple(gk * (0.85 + 0.15 * Math.sin((N / 30) * Math.PI * 2)))}} />
      ) : null}
      {/* 飞入的 pcap 文件（在窗前） */}
      {fin >= 0 && absorb > 0 ? <PcapIcon cx={iconCx} cy={iconCy} scale={iconS} opacity={absorb} labelOp={iconLabel} /> : null}
      <div style={{position: 'absolute', inset: 0, opacity: wOp, transformOrigin: '640px 360px', transform: wS < 1 ? `scale(${wS.toFixed(4)})` : undefined}}>
        <WSWindow x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} paneBorders={paneBorders}>
          {/* 三区占位块（区依次 wipe + 元素 2 帧错峰；窗口相对坐标） */}
          {PANES.map((p, pi) =>
            Array.from({length: PH_N[pi]}, (_, j) => {
              const n = N - (B_ZOOM + pi * 2 + j * 2);
              if (n < 0) return null;
              const wp = clamp01(n / 10);
              if (pi < 2) {
                const y = p.top + 18 + j * ((p.h - 34) / Math.max(1, PH_N[pi] - 0.5));
                return <div key={`${pi}-${j}`} style={{...abs(60 + pi * 24 + j * 28, y, PH_W[pi][j] * wp, pi === 0 ? 12 : 8), background: GREY_LINE, opacity: 0.55}} />;
              }
              return (
                <div key={`2-${j}`} style={{...abs(64, p.top + 16 + j * 32)}}>
                  {Array.from({length: 8}, (_, q) => (
                    <div key={q} style={{position: 'absolute', left: q * 30, top: 0, width: 13, height: 13, background: GREY_LINE, opacity: 0.6 * clamp01((wp * 8 - q) * 2)}} />
                  ))}
                </div>
              );
            }),
          )}
          {/* ①②③ 编号 Pill（挂各区右内缘） */}
          {PILLS.map((pl, i) => (
            <SoftIn key={pl.t} N={N} f0={B_ZOOM + i * 8}>
              <Pill x={WIN.w - pl.w - 26} y={pl.y} w={pl.w} h={40} fill={PURPLE} stroke={WHITE} sw={2} text={pl.t} fontSize={22} weight={700} textDy={0} />
            </SoftIn>
          ))}
          {/* 标题栏右侧：已打开的文件名 */}
          <SoftIn N={N} f0={5236}>
            <div style={{...abs(760, 10, 220, 44), textAlign: 'right', fontFamily: FONT_MONO, fontSize: 22, color: GREY_LIGHT, lineHeight: '44px'}}>capture.pcap</div>
          </SoftIn>
          {/* 当前区白边闪（轮换切换瞬间） */}
          {cyc >= 0 && paneFlash > 0
            ? PANES.map((p, i) => (i === cyc ? <div key={i} style={{...abs(3, p.top, WIN.w - 6, p.h), border: `3px solid ${WHITE}`, opacity: paneFlash * 0.9}} /> : null))
            : null}
          {/* 打开瞬间的整窗白闪 */}
          {flash > 0 ? <div style={{position: 'absolute', inset: 0, background: WHITE, opacity: flash * 0.32, borderRadius: 8}} /> : null}
        </WSWindow>
      </div>
    </div>
  );
};
