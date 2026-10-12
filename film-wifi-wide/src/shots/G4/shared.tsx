import React from 'react';
import {clamp01, FONT_MONO} from '../../common';
import {CText, EXAMPLE, GREY, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, abs} from '../../ui';

/**
 * G4 共用（第 4 章上：SC11–SC13，S21–S25）。原模板残留（pcap 片 G4Shelf）已整体替换。
 * 共享库状态（2024-10 构建时）：ui.tsx 已升级 WiFi 版（EXAMPLE / RouterGlyph / AirPulse / DeviceGlyph）——
 * G4 的设备与弧一律用 ui.tsx 版本（全片母题一致）；本文件只放 G4 特有件：
 * - BEATS     S21–S25 字幕块起始帧（timeline.md 权威块界；元素入场 −6…+3 对齐这里）
 * - EX        台词白名单文本（year/rate 取自 ui.EXAMPLE；其余为分镜表全局约束 §3 白名单词，EXAMPLE 未含，见 BUILD_NOTES）
 * - OldLaptop 1997 厚机型（thick：粗边框厚底座 + 内屏慢波形 + draw-on；形制与 ui.DeviceGlyph laptop 同族）
 * - GhostLaptop 隐形设备虚线轮廓（ui.DeviceGlyph laptop 的虚线灰版——SC13 两侧"看不见但在说"的设备）
 * - FilmCell  电影胶片格（SC11 "载着电影"）
 * - Spinner   缓冲圈（缺口弧旋转）
 * - PlayerWin 播放器（BrowserWin 播放器改造：窗框+三点顶栏 / 胶片格视频区 / ▶+进度条+时间码控制条）
 */

/** 字幕块起始帧（= 各镜头部拍的权威帧号） */
export const BEATS = {
  S21: 2265, S21b: 2338, S22: 2418, // SC11：始于 1997 / 2 Mbit/s / 今天载电影
  S23: 2494, S23b: 2565,           // SC12：更快更宽 / 永不停歇
  S24: 2624, S24b: 2682,           // SC12：卡一口气 / 又播了
  S25: 2718, S25b: 2766,           // SC13：不是网络坏了 / 空气在轮流
};

/** G4 台词常量（year/rate 从 ui.EXAMPLE 取；其余为分镜表全局约束 §3 白名单词） */
export const EX = {
  year: EXAMPLE.year, // '1997'
  rate: EXAMPLE.rate, // '2 Mbit/s'
  aMovie: 'a movie',
  faster: 'faster radios',
  wider: 'wider bands',
  smarter: 'smarter antennas',
  neverStops: 'never stops',
  thenPlays: 'then plays',
  notFailing: 'not failing',
  airTurns: 'the air, taking turns',
};

let olSeq = 0;
/** 1997 厚机型（形制与 ui.DeviceGlyph laptop 同族 150×104，加厚：粗边框 + 厚底座 + 电源灯）；
 *  drawK=0→1 clip 从左往右展开（draw-on）；waveN 驱动内屏慢波形（1997 的 2 Mbit/s——慢是戏） */
export const OldLaptop: React.FC<{cx: number; cy: number; w?: number; drawK?: number; opacity?: number; waveN?: number; waveOp?: number}> = ({cx, cy, w = 250, drawK = 1, opacity = 1, waveN = 0, waveOp = 1}) => {
  const idRef = React.useRef<string | undefined>(undefined);
  if (!idRef.current) idRef.current = `olclip-${olSeq++}`;
  const VW = 150, VH = 104;
  const W = w, H = (w / VW) * VH;
  const pts: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const x = 39 + (i / 20) * 72;
    const y = 34 + 10 * Math.sin((i / 20) * Math.PI * 2.5 + waveN * 0.12);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id={idRef.current}>
            <rect x={-20} y={-20} width={(VW + 40) * clamp01(drawK)} height={VH + 40} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${idRef.current})`} stroke={WHITE} strokeWidth={3} fill="#000" strokeLinejoin="round" strokeLinecap="round">
          <rect x={26} y={2} width={98} height={64} rx={6} />
          <rect x={36} y={11} width={78} height={46} stroke={GREY_LINE} strokeWidth={2} fill="#050507" />
          <path d="M12,72 L138,72 L148,101 L2,101 Z" />
          <line x1={24} y1={81} x2={126} y2={81} stroke={GREY_LINE} strokeWidth={2} />
          <line x1={20} y1={91} x2={130} y2={91} stroke={GREY_LINE} strokeWidth={2} />
          <circle cx={140} cy={69} r={2.5} fill={WHITE} stroke="none" />
        </g>
        <g clipPath={`url(#${idRef.current})`} style={{opacity: clamp01(waveOp)}}>
          <polyline points={pts.join(' ')} fill="none" stroke="#F05F41" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

/** 隐形设备虚线轮廓（ui.DeviceGlyph laptop 形制的虚线灰版——"看不见但在说话"） */
export const GhostLaptop: React.FC<{cx: number; cy: number; w?: number; opacity?: number}> = ({cx, cy, w = 200, opacity = 1}) => {
  const VW = 150, VH = 104;
  const W = w, H = (w / VW) * VH;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${VW} ${VH}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g stroke={GREY_MID} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 5">
          <rect x={35} y={5} width={80} height={56} rx={4} />
          <rect x={17} y={67} width={116} height={13} rx={5} />
          <line x1={70} y1={61} x2={80} y2={61} />
        </g>
        <circle cx={123} cy={60} r={3} fill={GREY_MID} />
      </svg>
    </div>
  );
};

/** 电影胶片格（"载着电影"）：外框 + 上下齿孔 + 中部画面亮块 */
export const FilmCell: React.FC<{cx: number; cy: number; w?: number; h?: number; opacity?: number; color?: string}> = ({cx, cy, w = 34, h = 26, opacity = 1, color = WHITE}) => (
  <svg width={w} height={h} viewBox="0 0 34 26" style={{...abs(cx - w / 2, cy - h / 2), opacity, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.45))'}}>
    <rect x={1.5} y={1.5} width={31} height={23} rx={2} fill="#000" stroke={color} strokeWidth={2} />
    {[5, 14, 23].map((x) => (
      <React.Fragment key={x}>
        <rect x={x} y={4} width={6} height={3} fill={color} opacity={0.85} />
        <rect x={x} y={19} width={6} height={3} fill={color} opacity={0.85} />
      </React.Fragment>
    ))}
    <rect x={6} y={9} width={22} height={8} fill="rgba(255,255,255,.16)" />
  </svg>
);

/** 缓冲圈：270° 缺口弧，deg 驱动旋转（转半圈=deg 走 180°），scale 供同拍呼吸微缩放 */
export const Spinner: React.FC<{cx: number; cy: number; r?: number; deg: number; opacity?: number; color?: string; sw?: number; scale?: number}> = ({cx, cy, r = 22, deg, opacity = 1, color = WHITE, sw = 4, scale = 1}) => {
  const rr = r * clamp01(scale);
  const a0 = (deg * Math.PI) / 180;
  const a1 = a0 + Math.PI * 1.5;
  const x0 = Math.cos(a0) * rr, y0 = Math.sin(a0) * rr;
  const x1 = Math.cos(a1) * rr, y1 = Math.sin(a1) * rr;
  if (opacity <= 0.01) return null;
  return (
    <svg width={rr * 2 + 10} height={rr * 2 + 10} viewBox={`${-rr - 5} ${-rr - 5} ${rr * 2 + 10} ${rr * 2 + 10}`} style={{...abs(cx - rr - 5, cy - rr - 5), overflow: 'visible', opacity, filter: 'drop-shadow(0 0 7px rgba(255,255,255,.55))'}}>
      <path d={`M${x0.toFixed(1)},${y0.toFixed(1)} A${rr.toFixed(1)},${rr.toFixed(1)} 0 1 1 ${x1.toFixed(1)},${y1.toFixed(1)}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
};

/** 电影时长显示（进度 → m:ss，10 分钟片） */
export const fmtTime = (k: number) => {
  const s = Math.round(clamp01(k) * 600);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** 播放器（BrowserWin 播放器改造）：窗框+三点顶栏 / 胶片格视频区 / ▶+进度条+时间码控制条。
 *  barK=播放进度 0–1；bufOp=缓冲圈透明度（spinDeg 驱动旋转，cirScale=同拍呼吸微缩放）；glowK=框体紫光；
 *  headFlash=进度头亮闪（"then plays"拍）；尺寸直接给像素（SC12 紧凑版 / SC13 特写版同字号，避免 transform 缩字）。 */
export const PlayerWin: React.FC<{
  cx: number; cy: number; w: number; h: number;
  barK: number; bufOp?: number; spinDeg?: number; glowK?: number;
  headFlash?: number; opacity?: number; dim?: number; cirScale?: number;
}> = ({cx, cy, w, h, barK, bufOp = 0, spinDeg = 0, glowK = 0, headFlash = 0, opacity = 1, dim = 0, cirScale = 1}) => {
  const x0 = cx - w / 2, y0 = cy - h / 2;
  const top = Math.max(24, Math.round(h * 0.15));
  const ctrl = 42;
  const vidY = y0 + top + 6;
  const vidH = h - top - ctrl - 12;
  const barX = x0 + 42;
  const barW = w - 42 - 68;
  const barY = y0 + h - ctrl / 2 - 25;
  const headX = barX + barW * clamp01(barK);
  const k = clamp01(glowK);
  return (
    <div style={{...abs(x0, y0, w, h), opacity}}>
      {/* 窗框 */}
      <div style={{position: 'absolute', inset: 0, background: '#000', border: '2.5px solid #FFF', borderRadius: 12, overflow: 'hidden', boxShadow: k > 0.02 ? `0 0 14px 4px rgba(102,45,248,${(0.35 * k).toFixed(3)}), 0 0 46px 15px rgba(102,45,248,${(0.4 * k).toFixed(3)})` : undefined, opacity: 1 - 0.4 * clamp01(dim)}} />
      {/* 顶栏（三点，无地址栏文本） */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: top, borderBottom: `1.5px solid ${GREY_LINE}`}} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 14 + i * 15, top: top / 2 - 4, width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${GREY_MID}`}} />
      ))}
      {/* 视频区（胶片格 + 灰带） */}
      <div style={{position: 'absolute', left: x0, top: vidY, width: w, height: vidH}}>
        <div style={{position: 'absolute', left: 26, top: vidH * 0.24, width: w * 0.52, height: Math.max(8, vidH * 0.14), background: '#18181c', border: `1px solid ${GREY_LINE}`, borderRadius: 3}} />
        <div style={{position: 'absolute', left: 40, top: vidH * 0.66, width: w * 0.38, height: Math.max(8, vidH * 0.13), background: '#18181c', border: `1px solid ${GREY_LINE}`, borderRadius: 3}} />
        {[0, 1, 2].map((i) => (
          <FilmCell key={i} cx={x0 + w * (0.3 + 0.2 * i)} cy={vidY + vidH * 0.5} w={Math.min(40, w * 0.085)} h={Math.min(31, w * 0.066)} opacity={0.9 - 0.25 * clamp01(dim)} />
        ))}
        {/* 缓冲圈 */}
        <Spinner cx={cx} cy={vidY + vidH / 2} r={Math.max(14, h * 0.105)} deg={spinDeg} opacity={bufOp} sw={Math.max(3, h * 0.016)} scale={cirScale} />
      </div>
      {/* 控制条 */}
      <svg width={20} height={20} viewBox="0 0 20 20" style={{...abs(barX - 26, y0 + h - ctrl / 2 - 35, 20, 20), overflow: 'visible'}}>
        <path d="M4,2 L17,10 L4,18 Z" fill="none" stroke={GREY} strokeWidth={2} strokeLinejoin="round" opacity={0.9} />
      </svg>
      <div style={{position: 'absolute', left: barX, top: barY, width: barW, height: 8, background: '#1a1a1e', border: `1px solid ${GREY_LINE}`, borderRadius: 4}} />
      {bufOp > 0.02 ? <div style={{position: 'absolute', left: barX, top: barY, width: barW * 0.55, height: 8, background: 'rgba(161,117,241,.25)', borderRadius: 4}} /> : null}
      {clamp01(barK) > 0.005 ? <div style={{position: 'absolute', left: barX, top: barY, width: headX - barX, height: 8, background: PURPLE_LIGHT, borderRadius: 4, boxShadow: '0 0 8px rgba(161,117,241,.8)'}} /> : null}
      {clamp01(barK) > 0.005 ? (
        <div style={{position: 'absolute', left: headX - 5, top: barY - 1, width: 10, height: 10, borderRadius: '50%', background: '#FFF', boxShadow: `0 0 ${6 + 10 * clamp01(headFlash)}px rgba(255,255,255,${(0.7 + 0.3 * clamp01(headFlash)).toFixed(2)}), 0 0 ${10 + 14 * clamp01(headFlash)}px rgba(161,117,241,.9)`}} />
      ) : null}
      <CText cx={x0 + w - 38} cy={y0 + h - ctrl / 2 - 17} size={22} weight={600} family={FONT_MONO} color={GREY} opacity={0.95}>{fmtTime(barK)}</CText>
    </div>
  );
};
