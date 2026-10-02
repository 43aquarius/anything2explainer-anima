import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, emphasisPulse, FONT_WIDE, FONT_TECH} from '../../common';
import {CText, Box, PacketIcon, WHITE, PURPLE, PURPLE_TECH, SoftIn, fadeIn, stagger, exitOp} from '../../ui';
import {LightSweep, StageLine, GhostText, ghostOpacity} from '../../fx';

/**
 * SC08 概念登场 PACKET CAPTURE · N 1228–1425（S09 1236–1423：1236「就是听上去那样」/ 1320「抓一份拷贝」/ 1368「经过网络一点」）
 * **高光时刻·登场型（扫光白名单①，全片两处之一；编排 = composition-and-light.md §3 / fx SET_PIECE）**
 * 版式（清场）：中央 `PACKET` / `CAPTURE` 两行 Audiowide 120px（行距 124，中心 (640,298)/(640,422)）+ 紫硬投影；
 *   下方三小 Pill：`copy` `at a point` `on the wire`（Exo 2 紫斜体，首字母白），y 516；
 *   再下一枚信封沿一条短「线」自左向右持续滑行（packets passing a point 的母题收束）。
 * 节拍：1232/1250/1268 三轮紫光横扫（每轮 3 条、2 帧错峰、16 帧）；1246 StageLine 展宽呼吸（cy 360 = 两行字之间）；
 *   1265 GhostText 轮廓隐现（两行各一）；1320 舞台线白闪 3 帧消失 + 大字 GlitchIn（rgbSplit 8 / slices 20，本镜唯一 glitch）；
 *   1332 emphasisPulse 1.11；1368 三 Pill SoftIn 2 帧错峰；1370 起信封沿线下行（10px/帧，持续动作）。
 * 停留：末 Pill 落位 1368+18 → 离场 1425−8（≈55 帧 ✓）。英文片：Audiowide 大字不压窄（SQUEEZE=1）。
 */
const F0 = 1228, TO = 1425;
const T1 = 1320; // 大字 GlitchIn（S09 第二块）
const T_PILLS = 1368; // S09 第三块 "as they pass a point in the network"
const T_WIRE = 1370;
const SWEEPS = [1232, 1250, 1268]; // T0+4 / +22 / +40
const T_LINE = 1246, T_GHOST = 1265;
const LINES: Array<{cy: number; text: string}> = [
  {cy: 298, text: 'PACKET'},
  {cy: 422, text: 'CAPTURE'},
];
/** 扫光条 [y, h, w, 帧偏移]：覆盖两行大字块（y 238–482） */
const SWEEP_BARS: Array<[number, number, number, number]> = [
  [266, 6, 380, 0],
  [360, 12, 620, 2],
  [454, 6, 380, 4],
];
const PILLS: Array<[string, number, number]> = [
  ['copy', 452, 128],
  ['at a point', 640, 190],
  ['on the wire', 828, 204],
];
const WIRE = {x0: 320, x1: 960, y: 580};
const ENV_SPEED = 10;

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const pulse = emphasisPulse(N - (T1 + 12), {peak: 1.11});
  const ghostOp = ghostOpacity(N, T_GHOST, T1);
  const bigOn = N >= T1;
  const wireOp = N >= T_PILLS ? fadeIn(N - T_PILLS, 8) : 0;
  const wn = N - T_WIRE;
  const envX = 348 + ENV_SPEED * Math.max(0, wn);
  const envOp = wn < 0 ? 0 : fadeIn(wn, 6);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      {/* 三轮紫光横扫（登场型专用，全片白名单①） */}
      <LightSweep N={N} rounds={SWEEPS} bars={SWEEP_BARS} />
      {/* 中央舞台光线：展宽 → 呼吸 → 1320 白闪 3 帧消失 */}
      <StageLine N={N} f0={T_LINE} flashAt={T1} cx={640} cy={360} w={720} />
      {/* 主角大字轮廓预示（白描边 10%） */}
      {LINES.map((l, i) => (
        <GhostText key={i} cx={640} cy={l.cy} size={120} family={FONT_WIDE} letterSpacing={8} opacity={ghostOp}>
          {l.text}
        </GhostText>
      ))}
      {/* 两行大字：GlitchIn（rgbSplit 8 / slices 20）+ emphasisPulse */}
      {bigOn ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 360px', transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
          <GlitchIn N={N} f0={T1} rgbSplit={8} slices={20} sliceBands={4} seed={8}>
            {LINES.map((l, i) => (
              <CText
                key={i}
                cx={640}
                cy={l.cy}
                size={120}
                weight={400}
                family={FONT_WIDE}
                letterSpacing={8}
                color={WHITE}
                shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`}
              >
                {l.text}
              </CText>
            ))}
          </GlitchIn>
        </div>
      ) : null}
      {/* 三小 Pill：首字母白、其余 Exo 2 紫斜体（SoftIn，2 帧错峰） */}
      {PILLS.map(([text, cx, w], i) => (
        <SoftIn key={text} N={N} f0={T_PILLS + stagger(i, 2)}>
          <Box x={cx - w / 2} y={516} w={w} h={46} r={23} sw={2}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_TECH,
                fontStyle: 'italic',
                fontSize: 27,
                letterSpacing: 1,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transform: 'translateY(-1px)',
                textShadow: '0 0 6px rgba(80,30,200,.7)',
              }}
            >
              <span style={{color: WHITE, fontWeight: 900, fontSize: 31}}>{text[0]}</span>
              <span style={{color: PURPLE_TECH, fontWeight: 600}}>{text.slice(1)}</span>
            </div>
          </Box>
        </SoftIn>
      ))}
      {/* 大字下方一条短「线」+ 信封自左向右滑过（pass a point 的母题，持续动作） */}
      {wireOp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: (WIRE.x0 + WIRE.x1) / 2 - ((WIRE.x1 - WIRE.x0) / 2) * clamp01(wireOp),
            top: WIRE.y - 1,
            width: (WIRE.x1 - WIRE.x0) * clamp01(wireOp),
            height: 2,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,.55) 12%, rgba(255,255,255,.55) 88%, transparent)`,
          }}
        />
      ) : null}
      {envOp > 0 ? <PacketIcon cx={envX} cy={WIRE.y} w={66} h={46} opacity={envOp} /> : null}
    </div>
  );
};
