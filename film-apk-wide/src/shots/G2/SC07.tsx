import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, FONT_ORB} from '../../common';
import {CText, PhoneMock, EXAMPLE, WHITE, PURPLE, firstOp, scaleIn, exitOp, abs} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {SlotCard, RobotGlyph} from './layout';

/**
 * SC07 2008 需要 · N 994–1154（S07 1002–1152：1002 In 2008, Google needed a package format /
 * 1084 for a brand-new phone operating system）
 * 左：`2008`（Orbitron 110px 白 + 紫硬投影）12 帧计数落位 + 投影脉冲一次；下方 PhoneMock 0.5×（y 300–540）
 *   屏上白线机器人简笔（圆头+两天线+两眼，绿色不出现）1084 draw-on 18 帧 + 眼睛眨一次（1106，8 帧）。
 * 右：虚线空槽卡（SlotCard，x 760–1140 y 260–460）`package format?`（等宽灰 30px）+ `?` 30 帧轮换大小（悬念，持续动作）。
 * 运镜：1035–1068 推 1→1.06 向虚线卡（入场均已停 ≥10 帧；机器人 1084 在运镜结束后入场）。
 * 停留：机器人 draw-on + 眨眼落位 1114 → 离场 1147，33 帧 ✓。
 * 离场：末 8 帧 2008/手机/机器人归零；**虚线卡不清场**（SlotCard 承接进 SC08，交界帧像素一致；相机停在 (950,360,1.06) 同步交给 SC08）。
 */
const F0 = 994;
const TO = 1154;
const T_YEAR = 1002; // 2008 计数（S07.c1）
const T_PHONE = 1004; // 手机缩放入场
const T_ROBOT = 1084; // 机器人 draw-on（S07.c2）
const T_BLINK = 1106; // 眨眼
const CAM: CamKey[] = [
  {f: 994, x: 640, y: 360, s: 1},
  {f: 1035, x: 640, y: 360, s: 1},
  {f: 1068, x: 950, y: 360, s: 1.06},
];

// 左组几何：年份 (330,240)；手机视觉 120×240 于 (270,300)
const YEAR = {cx: 330, cy: 240};
const PHONE_BOX = {x: 270, y: 300, w: 240, h: 480};

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  // 年份计数（12 帧 1900→2008）+ 落位后紫投影脉冲一次（1016–1036）
  const yn = N - T_YEAR;
  const year = yn < 0 ? 0 : Math.round(kf(N, [[T_YEAR, 1900], [T_YEAR + 12, EXAMPLE.androidYear]], (u) => 1 - Math.pow(1 - u, 2)));
  const pulseK = kf(N, [[1016, 0], [1020, 1], [1036, 0]]);
  // 手机入场（21 帧缩放，从 0.55 起）
  const pn = N - T_PHONE;
  const phOp = pn < 0 ? 0 : firstOp(pn, 6);
  const phS = pn < 0 ? 0 : 0.55 + 0.45 * scaleIn(pn, 21);

  return (
    <CameraRig N={N} keys={CAM}>
      {/* 2008 年份大字（主角之一） */}
      {yn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
          <CText
            cx={YEAR.cx}
            cy={YEAR.cy}
            size={110}
            weight={700}
            family={FONT_ORB}
            letterSpacing={4}
            color={WHITE}
            opacity={firstOp(yn, 6)}
            shadow={`6px 6px 0 ${PURPLE}, 0 0 ${Math.round(28 + 18 * pulseK)}px rgba(102,48,248,${(0.45 + 0.3 * pulseK).toFixed(2)})`}
            style={{fontVariantNumeric: 'tabular-nums'}}
          >
            {year}
          </CText>
        </div>
      ) : null}

      {/* 手机 0.5×（屏上机器人 = brand-new phone OS） */}
      {phOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
          <div
            style={{
              ...abs(PHONE_BOX.x + (1 - phS) * 60, PHONE_BOX.y, PHONE_BOX.w * 0.5 * phS, PHONE_BOX.h * 0.5 * phS),
            }}
          >
            <div style={{position: 'absolute', left: 0, top: 0, width: PHONE_BOX.w, height: PHONE_BOX.h, transform: `scale(${(0.5 * phS).toFixed(4)})`, transformOrigin: '0 0', opacity: phOp}}>
              <PhoneMock x={0} y={0} w={PHONE_BOX.w} h={PHONE_BOX.h} iconN={0} />
            </div>
          </div>
          {/* 机器人简笔（draw-on + 眨一次眼；画在手机屏中心视觉位 (330,415)） */}
          <RobotGlyph cx={330} cy={418} N={N} f0={T_ROBOT} blinkAt={T_BLINK} op={clamp01((N - T_ROBOT) / 6)} />
        </div>
      ) : null}

      {/* 虚线空槽卡（承接进 SC08，不清场、不随本镜离场） */}
      <SlotCard N={N} exitAt={Infinity} />
    </CameraRig>
  );
};
