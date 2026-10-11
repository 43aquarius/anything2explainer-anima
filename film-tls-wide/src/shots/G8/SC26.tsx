import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {PersonIcon, PacketIcon, CText, Svg, SoftIn, GREY, GREY_MID, WHITE, PURPLE_LIGHT, CORAL, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC26 回到咖啡馆（5514–5666）。S35–S36。
 * 节拍：5522 场景回卷（SC25 锻造锁缩右上淡出）+ 邻桌组 slideIn（呼应 SC01）+ `So — the coffee shop` 灰字
 *       ｜5566 信封墙分 5 波砌墙（每波 6 枚 × 2 帧错峰，从下往上）+ `captured` 标签
 *       ｜5604 砌墙完成 + `thousands of envelopes` 量感字。（S37 的 who/when/how much 标签在 SC27 開头。）
 * 持续：高亮信封微呼吸。运镜：33 帧 1→1.12 推向信封墙（5566–5599，运镜不进末拍）。
 * 主角：信封墙 430px（几枚高亮紫描边，整体灰）。
 */
const F0 = 5514;
const TO = 5666;

const WALL = {x: 100, y: 170, w: 660, h: 430};
const COLS = 6, ROWS = 5;

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 锻造锁缩右上淡出（5514–5530）
  const lockOp = N < 5514 ? 0 : Math.max(0, 1 - clamp01((N - 5516) / 14));

  // 邻桌组（5522 slideIn，同 SC01 参数呼应）
  const nbIn = clamp01((N - 5522) / 12);

  // 信封墙（5566 起 5 波：从下往上，每波 6 枚，每枚 2 帧错峰）
  const wallOn = (i: number) => {
    const row = Math.floor(i / COLS);
    const wave = 4 - row;
    return clamp01((N - (5566 + wave * 10 + (i % COLS) * 2)) / 8);
  };

  // 标签呼吸（持续）
  const br = 0.85 + 0.15 * Math.sin((N / 40) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 5566, x: 640, y: 360, s: 1}, {f: 5599, x: 430, y: 390, s: 1.12}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 锻造锁缩右上淡出（承接） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: lockOp, transform: `scale(0.4) translate(920px, -240px)`}} />

        {/* 右：邻桌（呼应 SC01） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: nbIn, transform: `translateX(${(240 * (1 - nbIn)).toFixed(0)}px)`}}>
          <PersonIcon cx={1020} cy={380} size={150} label="the person at the next table" labelSize={20} />
          <div style={{position: 'absolute', left: 920, top: 470, width: 200, height: 120, background: '#000', border: `2px solid ${GREY_MID}`, borderRadius: 6}}>
            {[0, 1, 2].map((r) => (
              <div key={r} style={{position: 'absolute', left: 10, top: 12 + r * 22, width: 180, height: 12, background: '#18181c', borderRadius: 2}} />
            ))}
            <div style={{position: 'absolute', right: 8, top: 8, width: 8, height: 8, borderRadius: '50%', background: CORAL, boxShadow: '0 0 6px rgba(241,96,67,.8)'}} />
          </div>
        </div>

        {/* 左：信封墙（主角，加连体边框让墙成为单一主体） */}
        <div style={{...abs(WALL.x + 6, WALL.y + 150, WALL.w - 12, 376), border: `2px solid ${GREY_MID}`, borderRadius: 10, opacity: clamp01((N - 5570) / 10)}} />
        {Array.from({length: COLS * ROWS}).map((_, i) => {
          const on = wallOn(i);
          if (on <= 0.02) return null;
          const col = i % COLS, row = Math.floor(i / COLS);
          const ex = WALL.x + 30 + col * 104, ey = WALL.y + 190 + row * 52;
          const hot = i === 7 || i === 16 || i === 22;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), opacity: on, transform: `translateY(${(18 * (1 - on)).toFixed(0)}px)`}}>
              <PacketIcon cx={ex} cy={ey} w={92} h={62} color={hot ? PURPLE_LIGHT : GREY_MID} accent={hot} opacity={hot ? br : 0.85} />
            </div>
          );
        })}
        <SoftIn N={N} f0={5566}>
          <CText cx={430} cy={206} size={40} weight={700} family={FONT_ORB} color={GREY} letterSpacing={3}>captured</CText>
        </SoftIn>
        <SoftIn N={N} f0={5522}>
          <CText cx={640} cy={612} size={24} weight={400} color={GREY}>So — the coffee shop</CText>
        </SoftIn>
        {/* S36.c2：砌墙完成的量感字（5604） */}
        <SoftIn N={N} f0={5604}>
          <CText cx={430} cy={644} size={22} weight={400} color={GREY_MID}>thousands of envelopes</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
