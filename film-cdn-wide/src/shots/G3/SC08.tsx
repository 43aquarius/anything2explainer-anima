import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, Pill, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK} from '../../ui';
import {CacheShelf, RackIcon} from '../../ui';

/**
 * SC08 DNS 指到边缘（1684–1904）。S12（¶段末章末：TO=1904，停在 Ch3 卡 1905–1949 前一帧）。
 * 节拍：1692 名字条打字机 ｜1752 DNS Pill 缩入+放大镜光扫（持续）｜1805/1828 两段连线 draw-on+光点跑+货架灯亮
 *       ｜1871 origin 直线红 Cross + origin 虚化 + `not the origin` 灰字。
 * 停留：Cross 落位 1871+16=1887 → 离场 1894，≥30 ✓（TO−10）。运镜：1→1.15 推近（1796–1828，不进末拍）。
 * 主角：链路图（名字→DNS→货架）340px。零 glitch（Cross 是动作戏）。
 */
const F0 = 1684;
const TO = 1904;

const NAME = {x: 120, y: 300};
const DNS = {cx: 520, cy: 360};
const SHELF = {cx: 900, cy: 380};
const ORIGIN = {cx: 900, cy: 150};

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);
  const glowK = glowOffK(N, TO);

  // 名字条打字机（1692 起，每 2 帧 1 字）
  const typed = clamp01((N - 1692) / 20) * 12;
  const nameStr = 'shop.example'.slice(0, Math.round(typed));

  // DNS Pill（1752 缩入）+ 放大镜光扫（持续，1770 起 36 帧周期）
  const dnsIn = clamp01((N - 1752) / 12);
  const scanPh = N >= 1770 ? ((N - 1770) % 18) / 18 : -1;

  // 两段连线（1805 / 1828 各 12 帧 draw-on）+ 光点跑（持续）
  const l1 = clamp01((N - 1805) / 12);
  const l2 = clamp01((N - 1828) / 12);
  const dotPh = N >= 1840 ? ((N - 1840) % 22) / 22 : -1;

  // 货架灯亮（1840）+ Cross（1871–1887）+ origin 虚化（1875）
  const shelfLit = clamp01((N - 1840) / 8);
  const crossP = clamp01((N - 1871) / 16);
  const ghost = clamp01((N - 1875) / 10);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1796, x: 640, y: 360, s: 1}, {f: 1828, x: 700, y: 390, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 名字条（打字机） */}
        <div style={{...abs(NAME.x, NAME.y - 30, 420, 92), background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 10, display: 'flex', alignItems: 'center', paddingLeft: 22, opacity: clamp01((N - 1690) / 5)}}>
          <span style={{fontFamily: FONT_MONO, fontSize: 46, color: WHITE}}>{nameStr}</span>
          <span style={{width: 14, height: 44, background: PURPLE_LIGHT, opacity: typed < 12 ? 1 : (Math.floor((N - 1712) / 8) % 2 === 0 ? 0.95 : 0.1), marginLeft: 3}} />
        </div>
        <CText cx={280} cy={392} size={22} weight={400} color={GREY}>the name you type</CText>

        {/* DNS Pill + 放大镜 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: dnsIn}}>
          <Pill x={DNS.cx - 60} y={DNS.cy - 26} w={120} h={52} fontSize={28} text="DNS" color={PURPLE_LIGHT} stroke={PURPLE_LIGHT} />
          {scanPh >= 0 ? (
            <div style={{position: 'absolute', left: DNS.cx - 46 + 92 * scanPh, top: DNS.cy - 34, width: 5, height: 68, background: 'rgba(255,255,255,.35)', filter: 'blur(1px)'}} />
          ) : null}
        </div>

        {/* 货架（近，主角） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 1800) / 8), filter: `drop-shadow(0 0 ${Math.round(20 * shelfLit * glowK)}px rgba(102,45,248,.4))`}}>
          <CacheShelf cx={SHELF.cx} cy={SHELF.cy} w={300} h={280} litRow={1} glow />
        </div>

        {/* 远处 origin（虚化） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: 0.55 - 0.3 * ghost, filter: `saturate(${(1 - ghost * 0.8).toFixed(2)}) blur(${(ghost * 1.2).toFixed(1)}px)`}}>
          <RackIcon cx={ORIGIN.cx} cy={ORIGIN.cy} w={96} h={130} units={4} lit={0} label="origin" />
        </div>

        {/* 两段连线 + 光点 */}
        <Svg bloom={false}>
          {l1 > 0 ? <line x1={NAME.x + 320} y1={NAME.y + 30} x2={NAME.x + 320 + (DNS.cx - 60 - NAME.x - 320) * l1} y2={NAME.y + 30 + (DNS.cy - NAME.y - 30) * l1} stroke={PURPLE_LIGHT} strokeWidth={3} strokeLinecap="round" /> : null}
          {l2 > 0 ? <line x1={DNS.cx + 60} y1={DNS.cy} x2={DNS.cx + 60 + (SHELF.cx - 150 - DNS.cx - 60) * l2} y2={DNS.cy + (SHELF.cy - DNS.cy) * l2} stroke={PURPLE_LIGHT} strokeWidth={3} strokeLinecap="round" /> : null}
          {/* 名字→origin 直线（打叉） */}
          {crossP > 0 ? <line x1={NAME.x + 320} y1={NAME.y + 30} x2={ORIGIN.cx - 50} y2={ORIGIN.cy + 60} stroke={GREY_MID} strokeWidth={2} strokeDasharray="8 7" opacity={0.5} /> : null}
        </Svg>
        {dotPh >= 0 ? (
          <Svg bloom>
            <circle cx={NAME.x + 320 + (SHELF.cx - 170 - NAME.x - 320) * dotPh} cy={NAME.y + 30 + (SHELF.cy - NAME.y - 30) * dotPh - 30 * Math.sin(Math.PI * dotPh)} r={5} fill={PURPLE_LIGHT} stroke="#fff" strokeWidth={1} />
          </Svg>
        ) : null}

        {/* Cross（打在名字→origin 直线中点） */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `rotate(${(1 - crossP) * 18}deg) scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={640} cy={247} size={76} sw={5} />
          </div>
        ) : null}
        <SoftIn N={N} f0={1878}>
          <CText cx={640} cy={316} size={22} weight={400} color={GREY}>not the origin</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
