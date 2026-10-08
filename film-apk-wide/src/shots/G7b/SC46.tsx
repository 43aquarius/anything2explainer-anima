import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeOutCubic, emphasisPulse, kf, FONT_WIDE} from '../../common';
import {CText, PhoneMock, Check, Svg, EXAMPLE, WHITE, GREY, PURPLE_LIGHT, exitOp, glowOffK, softOp, firstOp, scaleIn, abs} from '../../ui';
import {MiniClock10} from './g7bui';

/**
 * SC46 图标出现 · N 6897–7024（S46 6905–6987 ¶+gap15：6905「The icon appears.」/ 6949「Ten seconds, done.」）
 * 左侧 PhoneMock（0.8× = 192×384，@150,180）：图标网格 3×4 全灰 → 6905 ChatApp 图标格子最后亮起
 * （缩放入场 14f + 紫光 + 一次白闪 6911–6917）+ 格下 `ChatApp` 名（22px）+ 手机上方绿色 Check 大勾 draw-on 14f；
 * 6949 右侧大字 `Ten seconds.`（Audiowide 84px 白+紫描边）GlitchIn（rgbSplit 6，**本镜唯一 glitch**）+
 * emphasisPulse + 紫晕呼吸；6952 `done.`（灰 36px）SoftIn；6949 小钟（r 50）指针带 4° 过冲 snap 到 10s 位（8f）
 * + 表盘橙光呼吸（6957 起，持续动作）；手机屏 1.02 庆祝脉冲一轮（6949–6979）。
 * 末 8 帧归零（7017–7024）。停留（¶）：末拍脉冲落定 6983 → 离场 7017，34f ≥30 ✓。
 * 主角：手机 + `Ten seconds.` 大字组；光：图标紫光 / 大字紫晕 / 表盘橙光。
 * 事实：EXAMPLE.appName = 'ChatApp'；「Ten seconds.」= S46 原文。
 */
export const F0 = 6897;
const TO = 7024, EXIT_LEN = 8;
const B_ICON = 6905, B_CHECK = 6905, B_TEXT = 6949, B_DONE = 6952, B_CLOCK = 6949, B_PULSE = 6955, B_DIAL = 6957;

const PH = {x: 150, y: 180, w: 240, h: 480, s: 0.8};
const CELL = {x: 19.33, y: 58.4, w: 46, h: 46}; // PhoneMock 第 0 格（左上，ChatApp）手机坐标系
const TXT = {cx: 810, cy: 262};

export const SC46: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 图标/大字/表盘光先灭

  // ChatApp 图标格：缩放入场 14f + 白闪一次 + 紫光常亮
  const cellN = N - B_ICON;
  const cellOp = firstOp(cellN, 6);
  const cellScale = 0.5 + 0.5 * scaleIn(cellN, 14);
  const flash = cellN >= 6 && cellN < 12 ? Math.sin((Math.PI * (cellN - 6)) / 6) : 0;
  // Check draw-on 14f
  const checkP = easeOutCubic(clamp01((N - B_CHECK) / 14));
  // 手机庆祝脉冲（1.02 一轮）
  const phPulse = emphasisPulse(N - B_PULSE, {peak: 1.02, up: 12, hold: 4, down: 14});
  // 大字脉冲 + 紫晕呼吸
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.09, up: 11, hold: 4, down: 13});
  const glow = 16 + 8 * Math.sin((2 * Math.PI * N) / 30);
  // 小钟指针：带 4° 过冲 snap 到 10s 位（60°）
  const snap = kf(N, [[B_CLOCK, -20], [B_CLOCK + 6, 64], [B_CLOCK + 8, 60]], easeOutCubic);
  // 表盘橙光呼吸
  const dialIn = clamp01((N - B_DIAL) / 8);
  const dialA = (0.24 + 0.1 * Math.sin((2 * Math.PI * N) / 30)) * dialIn * gk;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 左：手机（0.8×，图标网格；6905 ChatApp 格最后亮起） */}
      <div style={{...abs(PH.x, PH.y, PH.w * PH.s, PH.h * PH.s)}}>
        <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${(PH.s * phPulse).toFixed(4)})`, transformOrigin: '120px 240px'}}>
          <PhoneMock x={0} y={0} w={PH.w} h={PH.h} litN={0} iconN={12} />
          {cellOp > 0 ? (
            <div style={{...abs(CELL.x, CELL.y, CELL.w, CELL.h), transform: `scale(${cellScale.toFixed(4)})`, transformOrigin: '50% 50%', opacity: cellOp, filter: flash > 0.01 ? `brightness(${1 + 0.7 * flash})` : undefined}}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  boxSizing: 'border-box',
                  borderRadius: 12,
                  border: `2.5px solid ${PURPLE_LIGHT}`,
                  background: 'rgba(102,48,248,0.30)',
                  boxShadow: `0 0 14px 5px rgba(102,48,248,${(0.65 * gk).toFixed(2)})`,
                }}
              />
              <div style={{position: 'absolute', left: 13, top: 13, width: 20, height: 20, borderRadius: 5, background: PURPLE_LIGHT, opacity: 0.95}} />
            </div>
          ) : null}
        </div>
      </div>
      {/* 手机下 app 名 */}
      <CText cx={PH.x + (PH.w * PH.s) / 2} cy={590} size={22} weight={600} color={WHITE} letterSpacing={1} opacity={softOp(N - (B_ICON + 4), 8)}>
        {EXAMPLE.appName}
      </CText>

      {/* 手机上方绿色 Check 大勾（draw-on） */}
      <Svg>
        <Check cx={PH.x + (PH.w * PH.s) / 2} cy={142} size={54} p={checkP} sw={7} />
      </Svg>

      {/* 右：大字 Ten seconds.（本镜唯一 glitch）+ done. + 小钟 */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${TXT.cx}px ${TXT.cy}px`, transform: `scale(${pulse.toFixed(4)})`}}>
        <GlitchIn N={N} f0={B_TEXT} rgbSplit={6} seed={46}>
          <CText
            cx={TXT.cx}
            cy={TXT.cy}
            size={84}
            weight={400}
            family={FONT_WIDE}
            letterSpacing={2}
            color={WHITE}
            shadow={`0 0 ${glow.toFixed(1)}px rgba(102,48,248,${(0.5 * gk).toFixed(2)})`}
            style={{WebkitTextStroke: `2.5px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}
          >
            Ten seconds.
          </CText>
        </GlitchIn>
      </div>
      <CText cx={TXT.cx} cy={340} size={36} weight={600} color={GREY} letterSpacing={1} opacity={softOp(N - B_DONE, 8)}>
        done.
      </CText>

      {/* 小钟（r 50，指针 snap 到 10s 位 = 60°）+ 表盘橙光呼吸 */}
      {softOp(N - B_CLOCK, 6) > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - B_CLOCK, 5)}}>
          <div style={{...abs(TXT.cx - 72, 444 - 72, 144, 144), borderRadius: '50%', background: `radial-gradient(circle, rgba(240,95,65,${dialA.toFixed(3)}) 0%, rgba(240,95,65,${(dialA * 0.5).toFixed(3)}) 40%, rgba(240,95,65,0) 72%)`}} />
          <MiniClock10 cx={TXT.cx} cy={444} r={50} needleDeg={snap} />
        </div>
      ) : null}
    </div>
  );
};

export default SC46;
