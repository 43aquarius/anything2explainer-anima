import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_ORB} from '../../common';
import {CText, EXAMPLE, GREEN, GREY, GREY_MID, PacketIcon, PURPLE, RackIcon, RED_DEEP, SwitchBox, WHITE, abs, firstOp, exitOp, glowOffK, mixHex, SoftIn} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';

/**
 * SC40 九秒变成一秒 · N 9037–9220（S52 9045–9218：9045 结账页后传 / 9091 元凶是坏交换口 / 9160 九秒变一秒）
 * 版式：上半 = SC34 三方图 0.5× 缩微悬在 (640,220)（自绘 mini 浏览器 glyph + 线缆 + 红 X 断点 + RackIcon 服务器 + 交换机）；
 *   下半 (y 480) = `9.0 s` Orbitron 80 白 + 红删除线 wipe → 白箭头 → `0.9 s` Orbitron 100 绿 + 绿光晕爆发。
 * 节拍：9037 mini 缩微入场（承接上一镜）；9048 `9.0 s` 12 帧计数落位（c1 的"结账页"= 它的 9 秒，问题数字悬场）；
 *   9091 红断点亮度闪 + 抖动（零 GlitchIn——白名单 SC40 无 glitch，参照 G6/SC34 用亮度闪）→ 淡出 → 交换机 21 帧缩放入位
 *   + 绿 HeroGlow + `switch port replaced` 小字；9160 删除线红 wipe（8 帧）+ 箭头 draw-on → 9168 `0.9 s` 20 帧倒计数 9.0→0.9
 *   + 绿光晕爆发 + emphasisPulse 1.11 + 扩散环；9170 缩略图线缆 8 帧 GREY_MID→WHITE（修复感）+ 白信封恢复流动。
 * 运镜：拉远 9053–9094（1.12 @ (640,262) → 1.0 @ (640,360)，41 帧，回到全景；末拍 9188 → 离场 9212 之外 ✓）。
 * 停留：段内不判（S52 非段末）；末 8 帧归零，带光元素（绿光）先灭。持续：断点抖动 / 丢包信封 → 修复信封流 / 交换机端口灯闪。
 */
const F0 = 9037, TO = 9220;
const T_IN = 9037, T_9 = 9048, T_SWAP = 9091, T_SW = 9105, T_LABEL = 9112;
const T_STRIKE = 9160, T_ARROW = 9162, T_09 = 9168, T_BURST = 9188, T_FIX = 9170, T_EXIT = 9212;
const CAM_KEYS = [
  {f: 9037, x: 640, y: 262, s: 1.12},
  {f: 9053, x: 640, y: 262, s: 1.12},
  {f: 9094, x: 640, y: 360, s: 1.0},
];
// mini 三方图几何（0.5× 悬于 (640,220)）
const BR = {x: 385, y: 168, w: 150, h: 104}; // mini 浏览器 glyph
const CABLE = {x0: 535, x1: 835, y: 220, h: 4};
const BREAK = {cx: 685, cy: 220};
const RACK = {cx: 880, cy: 220, w: 92, h: 148};
const SW = {cx: 685, cy: 220, w: 190, h: 64};
// 下半数字
const N9 = {cx: 400, cy: 480, size: 80};
const N09 = {cx: 850, cy: 480, size: 100};
const tri = (n: number, len = 8) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC40: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gOff = glowOffK(N, TO, 6, 8);
  // mini 入场：fade + 上滑 26px
  const ein = clamp01((N - T_IN) / 14);
  const eDy = -26 * Math.pow(1 - ein, 2.2);
  const eOp = firstOp(N - T_IN, 10);
  // 红断点：9091 亮度闪一次（非 GlitchIn），之后淡出；此前持续 3px 抖动
  const xflash = tri(N - T_SWAP, 6);
  const xJit = N >= T_SWAP ? 0 : 2.8 * Math.sin(N * 1.9);
  const xOp = N >= T_SWAP ? Math.max(0, 1 - (N - (T_SWAP + 4)) / 10) : 1;
  // 线缆：修复感 GREY_MID → WHITE（8 帧）+ 白光
  const fixK = clamp01((N - T_FIX) / 8);
  const cableCol = mixHex(GREY_MID, WHITE, fixK);
  // 交换机缩放入位 + 绿光
  const swN = N - T_SW;
  const swScale = swN < 0 ? 0 : 0.3 + 0.7 * (1 - Math.pow(1 - clamp01(swN / 21), 3));
  const swGlow = clamp01((N - (T_SW + 6)) / 8) * gOff;
  // `9.0 s` 计数（12 帧）
  const n9 = N - T_9;
  const v9 = 9 * (1 - Math.pow(1 - clamp01(n9 / 12), 2));
  // 删除线 wipe（8 帧，红，微倾）
  const strikeK = clamp01((N - T_STRIKE) / 8);
  // `0.9 s` 20 帧倒计数 9.0→0.9
  const n09 = N - T_09;
  const v09 = 9 - 8.1 * (1 - Math.pow(1 - clamp01(n09 / 20), 2));
  const gk = clamp01((N - T_BURST) / 6) * gOff; // 绿光晕爆发（6 帧亮满，保持）
  const pulse = emphasisPulse(N - T_BURST, {peak: 1.11});
  const ringT = clamp01((N - T_BURST) / 16); // 扩散环
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* ===== 上半：SC34 三方图 0.5× 缩微 ===== */}
        <div style={{position: 'absolute', inset: 0, opacity: eOp, transform: `translateY(${eDy.toFixed(2)}px)`}}>
          {/* mini 浏览器 glyph（BrowserMock 的 22px url 在 0.5× 下放不下 → 自绘无文字缩略） */}
          <div style={{...abs(BR.x, BR.y, BR.w, BR.h)}}>
            <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 8}} />
            <div style={{position: 'absolute', left: 2.5, top: 2.5, width: BR.w - 5, height: 22, background: '#101013', borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottom: `1.5px solid ${GREY_MID}` }}>
              {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 10 + i * 13, top: 8, width: 7, height: 7, borderRadius: 4, background: GREY_MID, opacity: 0.8}} />)}
            </div>
            <div style={{position: 'absolute', left: 16, top: 38, width: BR.w - 40, height: 6, background: GREY_MID, opacity: 0.7}} />
            <div style={{position: 'absolute', left: 16, top: 56, width: (BR.w - 40) * 0.66, height: 5, background: GREY_MID, opacity: 0.45}} />
            <div style={{position: 'absolute', left: 16, top: 74, width: (BR.w - 40) * 0.82, height: 5, background: GREY_MID, opacity: 0.45}} />
          </div>
          {/* 线缆（受损灰 → 修复白） */}
          <div style={{...abs(CABLE.x0, CABLE.y - CABLE.h / 2, CABLE.x1 - CABLE.x0, CABLE.h), background: cableCol, boxShadow: fixK > 0 ? `0 0 ${Math.round(10 * fixK)}px 2px rgba(255,255,255,${(0.4 * fixK).toFixed(2)})` : undefined}} />
          {/* 断点附近的红色损伤区（随 X 一起淡出） */}
          <div style={{...abs(BREAK.cx - 34, CABLE.y - 5, 68, 10), borderRadius: 5, background: `rgba(236,8,31,${(0.3 * xOp).toFixed(2)})`, opacity: xOp > 0 ? 1 : 0}} />
          {/* 红断点 X（抖动 → 9091 亮度闪 → 淡出） */}
          {xOp > 0 ? (
            <div style={{position: 'absolute', inset: 0, transform: `translateY(${xJit.toFixed(2)}px)`, opacity: xOp, filter: xflash > 0 ? `brightness(${(1 + 0.9 * xflash).toFixed(2)})` : undefined}}>
              <div style={{...abs(BREAK.cx - 34, BREAK.cy - 34, 68, 68), borderRadius: 14, boxShadow: `0 0 ${Math.round(16 + 22 * xflash)}px ${Math.round(4 + 8 * xflash)}px rgba(236,8,31,${(0.32 + 0.3 * xflash).toFixed(2)})`}} />
              <svg width={48} height={48} viewBox="-24 -24 48 48" style={{position: 'absolute', left: BREAK.cx - 24, top: BREAK.cy - 24, overflow: 'visible'}}>
                <path d="M-15,-15 L15,15 M15,-15 L-15,15" stroke={RED_DEEP} strokeWidth={8} strokeLinecap="round" />
              </svg>
            </div>
          ) : null}
          {/* 丢包流（修复前）：小灰信封走向断点、到 X 处消失 */}
          {Array.from({length: 3}, (_, i) => {
            const t0 = 9056 + i * 30;
            const tn = N - t0;
            if (tn < 0 || tn > 26) return null;
            const x = 548 + ((BREAK.cx - 12 - 548) * tn) / 22;
            const fade = tn > 22 ? Math.max(0, 1 - (tn - 22) / 4) : Math.min(1, tn / 4);
            return (
              <div key={`l${i}`} style={{position: 'absolute', inset: 0, opacity: fade * 0.9}}>
                <PacketIcon cx={x} cy={CABLE.y} w={24} h={17} color={GREY} />
              </div>
            );
          })}
          {/* 交换机（缩放入位 + 绿光 + 端口灯闪） */}
          {swN >= 0 ? (
            <div style={{position: 'absolute', inset: 0, transform: `scale(${swScale.toFixed(4)})`, transformOrigin: `${SW.cx}px ${SW.cy}px`}}>
              <HeroGlow x={SW.cx - SW.w / 2} y={SW.cy - SW.h / 2} w={SW.w} h={SW.h} r={12} N={N} color={GREEN} k={swGlow} />
              <SwitchBox cx={SW.cx} cy={SW.cy} w={SW.w} h={SW.h} ports={4} lit={2} N={N} />
            </div>
          ) : null}
          {/* 修复流（修复后）：白信封重新通过线缆 */}
          {Array.from({length: 2}, (_, i) => {
            const t0 = T_FIX + 4 + i * 40;
            const tn = N - t0;
            if (tn < 0) return null;
            const x = 548 + 3 * tn;
            if (x > CABLE.x1 - 8) return null;
            return (
              <div key={`f${i}`} style={{position: 'absolute', inset: 0, opacity: Math.min(1, tn / 5)}}>
                <PacketIcon cx={x} cy={CABLE.y} w={26} h={18} />
              </div>
            );
          })}
          {/* 服务器 */}
          <RackIcon cx={RACK.cx} cy={RACK.cy} w={RACK.w} h={RACK.h} units={5} lit={3} label="server" labelSize={22} />
        </div>
        {/* switch port replaced */}
        <SoftIn N={N} f0={T_LABEL}>
          <CText cx={640} cy={344} size={22} weight={600} color={GREY} letterSpacing={1}>switch port replaced</CText>
        </SoftIn>
        {/* ===== 下半：9.0 s → 0.9 s ===== */}
        {n9 >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(n9, 6)}}>
            <CText cx={N9.cx} cy={N9.cy} size={N9.size} weight={800} family={FONT_ORB} color={WHITE} letterSpacing={2} shadow={`5px 5px 0 ${PURPLE}, 0 0 26px rgba(102,45,248,.4)`} style={{fontVariantNumeric: 'tabular-nums'}}>
              {`${v9.toFixed(1)} s`}
            </CText>
          </div>
        ) : null}
        {/* 红删除线（wipe 划过） */}
        {strikeK > 0 ? (
          <div style={{...abs(288, 474, 214, 7), background: RED_DEEP, borderRadius: 4, transform: `rotate(-2.5deg) scaleX(${strikeK.toFixed(3)})`, transformOrigin: '0% 50%', boxShadow: '0 0 14px 3px rgba(236,8,31,.55)'}} />
        ) : null}
        {/* 白箭头（自根部长出，指向 0.9 s） */}
        {N >= T_ARROW ? (
          <div style={{position: 'absolute', inset: 0, opacity: clamp01((N - T_ARROW) / 6)}}>
            <div style={{position: 'absolute', left: 602 - 72 * clamp01((N - T_ARROW) / 12), top: 478, width: 72 * clamp01((N - T_ARROW) / 12), height: 4, background: WHITE}} />
            <div style={{position: 'absolute', left: 602, top: 469, width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: `18px solid ${WHITE}`}} />
          </div>
        ) : null}
        {/* 0.9 s（绿，倒计数 + 光晕爆发 + 脉冲 + 扩散环） */}
        {n09 >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: firstOp(n09, 5)}}>
            <HeroGlow x={N09.cx - 160} y={N09.cy - 58} w={320} h={116} r={20} N={N} color={GREEN} k={gk} />
            {ringT > 0 && ringT < 1 ? (
              <div style={{position: 'absolute', left: N09.cx - 90 * ringT, top: N09.cy - 90 * ringT, width: 180 * ringT, height: 180 * ringT, borderRadius: '50%', border: `3px solid ${GREEN}`, opacity: (0.8 * (1 - ringT)).toFixed(2)}} />
            ) : null}
            <div style={{position: 'absolute', inset: 0, transformOrigin: `${N09.cx}px ${N09.cy}px`, transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
              <CText cx={N09.cx} cy={N09.cy} size={N09.size} weight={800} family={FONT_ORB} color={GREEN} letterSpacing={2} shadow={`5px 5px 0 rgba(30,72,12,.95), 0 0 ${Math.round(20 + 34 * gk)}px rgba(143,247,64,.7), 0 0 ${Math.round(50 + 70 * gk)}px rgba(143,247,64,.3)`} style={{fontVariantNumeric: 'tabular-nums'}}>
                {`${v09.toFixed(1)} s`}
              </CText>
            </div>
          </div>
        ) : null}
      </CameraRig>
    </div>
  );
};
