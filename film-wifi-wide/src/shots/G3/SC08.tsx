import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {CameraRig} from '../../fx';
import {CText, GREY, abs, exitOp, glowOffK, softOp} from '../../ui';
import {AirPulse, ChannelBand, DeviceGlyph, ShrugMini, WEXAMPLE} from './shared';

/**
 * SC08 与邻共享 · N 1663–1793。S15–S16：1671「You and your neighbors share them,」/ 1719「like it or not.」
 *   / 1753「And there's a trickier trap:」（本镜只做全带收束呼吸，trap 舞台留给 SC09 开场）。
 * 版式：ChannelBand 承接居中（0.9×，绿框常驻、其余峰保持灰化）+ 三绿信道（1/6/11）下方各一对设备小点
 *   （左=邻居 灰 / 右=你 白，仅信道 1 挂 `neighbors`/`you` 标）+ 各信道内两台的弧轮流亮（分时，低幅循环）
 *   + 底部 `shared, like it or not` 灰字 + 耸肩小人一闪（1719）+ 1753 全带微呼吸收束。
 * 运镜：1690–1743 慢推 1→1.05（相机末 key 1743 = TO−50，点阵入场落在定机后）。
 * 停留：段内不判（S16 末块 39）；末拍（1719 字）1727 落位 → 灭光 1785 → hold ≈52f。末 5 帧归零。
 */
const F0 = 1663;
const TO = 1793;

const T_DOT = 1671;    // 三对设备小点 2f 错峰缩入 + 弧轮流起
const T_LIKE = 1719;   // shared, like it or not + 耸肩小人
const T_BREATH = 1753; // 全带微呼吸收束一拍（14f）

// ---- 几何（0.9× 频带；绿信道世界 x = 280 / 640 / 1000） ----
const BAND = {cx: 640, baseY: 470, s: 0.9};
const PAIRS = [
  {x: 280, off: 0},
  {x: 640, off: 0.37},
  {x: 1000, off: 0.71},
];
const DOT_Y = 545;

const EOC = easeOutCubic;

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // ---- 分时轮流：各信道独立节拍（26f 一换相） ----
  const leftTalks = (c: number) => Math.floor((N - (T_DOT + 6)) / 26 + PAIRS[c].off * 2) % 2 === 0;

  // ---- 1753 收束呼吸（低幅 14f） ----
  const breath = Math.sin(Math.PI * clamp01((N - T_BREATH) / 14));
  const shrugOp = softOp(N - T_LIKE, 8) * (1 - clamp01((N - 1745) / 10));

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 1690, x: 640, y: 360, s: 1}, {f: 1743, x: 640, y: 430, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 频带（承接 0.9×；绿框常驻） */}
        <ChannelBand cx={BAND.cx} baseY={BAND.baseY} s={BAND.s} greenP={[1, 1, 1]} greyK={1}
          overlapK={0} breathK={breath} N={N} glowK={gk} opacity={1} />

        {/* 三对设备小点 + 轮流发声弧 */}
        {PAIRS.map((p, c) => [0, 1].map((side) => {
          const n = N - (T_DOT + c * 4 + side * 2);
          if (n < 0) return null;
          const isLeft = side === 0;
          const talks = leftTalks(c) === isLeft;
          const dx = p.x + (isLeft ? -27 : 27);
          const sc = 0.3 + 0.7 * EOC(clamp01(n / 8));
          return (
            <React.Fragment key={`d-${c}-${side}`}>
              <div style={{...abs(0, 0, 1280, 720), opacity: softOp(n, 6) * (0.45 + 0.55 * (talks ? 1 : 0)) * (talks ? 1 : 0.75), transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${dx}px ${DOT_Y}px`}}>
                <DeviceGlyph cx={dx} cy={DOT_Y} kind="laptop" s={0.36} N={N} dim={talks ? 0 : 0.5} />
              </div>
              {talks ? (
                <AirPulse cx={dx} cy={DOT_Y - 26} N={N} f0={T_DOT + 6} rot={-90} span={58} waves={2} speed={17}
                  maxR={46} color={isLeft ? '#FFFFFF' : '#A175F1'} sw={2} opacity={0.85} dim={isLeft ? 0.3 : 0} />
              ) : null}
            </React.Fragment>
          );
        }))}

        {/* 信道 1 对的标（仅此一对，模式由其余两对复述） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - (T_DOT + 6), 8)}}>
          <CText cx={253} cy={592} size={22} weight={600} color={GREY} letterSpacing={0.5}>{WEXAMPLE.neighbors}</CText>
          <CText cx={307} cy={592} size={22} weight={600} color={GREY} letterSpacing={0.5}>{WEXAMPLE.you}</CText>
        </div>

        {/* shared, like it or not（1719） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - T_LIKE, 8)}}>
          <CText cx={640} cy={618} size={28} weight={600} color={GREY} letterSpacing={0.5}>{WEXAMPLE.shared}</CText>
        </div>

        {/* 耸肩小人（1719 一闪） */}
        {shrugOp > 0.01 ? <ShrugMini cx={868} cy={582} opacity={shrugOp} /> : null}
      </div>
    </CameraRig>
  );
};
