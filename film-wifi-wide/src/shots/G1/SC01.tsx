import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, kf, BEZ_SCALE_IN, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {CText, SoftIn, Svg, AirPulse, GREY, GREY_MID, GREY_LIGHT, WHITE, CORAL, abs, fadeIn, exitOp, glowOffK} from '../../ui';

/**
 * SC01 满屋对话（78–248）。S01–S02：看不见 / 听不到 → 满屋都是对话。
 * 节拍：80 屋子轮廓左→右 wipe draw-on（16f：地板线 + 沙发/茶几两件家具线框，86 拍 −6 起）
 *       ｜129 一枚 `?` 虚位标 SoftIn（46px 灰，屋中央）→ 135 被划除（coral 横线 8f，"听不到"）→ 155 随块尾淡出
 *       ｜163 六枚隐形设备虚位圆 2f 错峰缩入（dashed 圈 r20）
 *       ｜198 各设备 AirPulse 错峰起弧（1f 间隔全 ≤203，4 波/10f 白灰交替）+ `full of conversations` 灰字 SoftIn + 弧持续循环
 * 运镜：1.0→1.05 慢推（78–198，末 key ≤ TO−50=198 ✓）。停留：段内不判（末拍簇 198–208，安静窗 208→240=32f）。
 * 主角：满屋弧群 ≈340px（弧线白灰交替 + BLOOM_SOFT 柔光）。零 glitch（白名单）、无字幕。
 */
const F0 = 78;
const TO = 248;

const ROOM = {floorY: 545, x0: 250, x1: 1030}; // 地板线
const Q = {cx: 640, cy: 330, size: 46}; // `?` 虚位标（屋中央）
const CAPTION = {cx: 640, cy: 170}; // 灰字（中央上方）

/** 六台隐形设备（虚线圆占位 → AirPulse 起弧）；颜色白灰交替 */
const DEVICES: Array<{x: number; y: number}> = [
  {x: 390, y: 425}, // 茶几上方
  {x: 640, y: 345}, // 屋中央
  {x: 900, y: 415}, // 沙发上方
  {x: 520, y: 505}, // 低左
  {x: 775, y: 500}, // 低右
  {x: 300, y: 290}, // 左上角
];

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = 1; // 硬切承接（弧循环即本镜生命，不离场则 hold~ 不判——与 SC02 同判）
  const gOff = 1;

  // ---- 屋子轮廓（80 wipe 16f：地板 + 墙角短竖线 + 沙发 + 茶几）----
  const roomP = clamp01((N - 80) / 16);
  const roomOp = fadeIn(N - 80, 6);

  // ---- `?` 虚位标（129 SoftIn；135 划除 8f；155 淡出）----
  const qOp = fadeIn(N - 129, 8) * kf(N, [[155, 1], [163, 0]]);
  const strikeP = clamp01((N - 135) / 8);

  // ---- 虚位圆（163 起 2f 错峰，12f 缩放入）----
  const dotOp = (i: number) => fadeIn(N - (163 + 2 * i), 6);
  const dotS = (i: number) => 0.55 + 0.45 * BEZ_SCALE_IN(clamp01((N - (163 + 2 * i)) / 12));

  // ---- AirPulse（198 起 1f 错峰 ≤203；持续低幅循环）----
  const arcOp = (i: number) => fadeIn(N - (198 + i), 10);

  // ---- 灰字（200 SoftIn）----
  const capDy = 10 * powOutRemain(N - 200, 14, 2.5);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 198, x: 640, y: 360, s: 1.05}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 屋子轮廓（左→右 wipe）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: roomOp, clipPath: `inset(0 ${(100 - 100 * roomP).toFixed(1)}% 0 0)`}}>
            <Svg bloom={false}>
              <g stroke={WHITE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* 地板 + 两端墙角短竖线 */}
                <line x1={ROOM.x0} y1={ROOM.floorY} x2={ROOM.x1} y2={ROOM.floorY} />
                <line x1={ROOM.x0} y1={ROOM.floorY} x2={ROOM.x0} y2={ROOM.floorY - 34} />
                <line x1={ROOM.x1} y1={ROOM.floorY} x2={ROOM.x1} y2={ROOM.floorY - 34} />
                {/* 沙发（右）：圆角体 + 两道坐垫分隔 + 四短腿 */}
                <rect x={838} y={458} width={194} height={66} rx={10} />
                <line x1={903} y1={458} x2={903} y2={524} strokeWidth={2.2} opacity={0.75} />
                <line x1={967} y1={458} x2={967} y2={524} strokeWidth={2.2} opacity={0.75} />
                <line x1={860} y1={524} x2={860} y2={ROOM.floorY} strokeWidth={2.6} />
                <line x1={1010} y1={524} x2={1010} y2={ROOM.floorY} strokeWidth={2.6} />
                {/* 茶几（左中）：桌面 + 两腿 */}
                <rect x={320} y={468} width={150} height={11} rx={3} />
                <line x1={334} y1={479} x2={334} y2={ROOM.floorY} strokeWidth={2.6} />
                <line x1={456} y1={479} x2={456} y2={ROOM.floorY} strokeWidth={2.6} />
              </g>
            </Svg>
          </div>

          {/* ---- `?` 虚位标（129 入，135 划除）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: qOp}}>
            <CText cx={Q.cx} cy={Q.cy} size={Q.size} weight={700} family={FONT_ORB} color={GREY_LIGHT} shadow={`0 0 10px rgba(255,255,255,${(0.3 * gOff).toFixed(2)})`}>{'?'}</CText>
          </div>
          {qOp > 0.02 && strikeP > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: qOp, clipPath: `inset(0 ${(100 - 100 * strikeP).toFixed(1)}% 0 0)`}}>
              <Svg bloom={false}>
                <line x1={Q.cx - 46} y1={Q.cy} x2={Q.cx + 46} y2={Q.cy} stroke={CORAL} strokeWidth={5} strokeLinecap="round" />
              </Svg>
            </div>
          ) : null}

          {/* ---- 六枚虚位圆 + AirPulse（说话母题）---- */}
          {DEVICES.map((d, i) => {
            const s = dotS(i);
            return (
              <div key={`c${i}`} style={{...abs(0, 0, 1280, 720), opacity: dotOp(i), transform: `scale(${s.toFixed(3)})`, transformOrigin: `${d.x}px ${d.y}px`}}>
                <Svg bloom={false}>
                  <circle cx={d.x} cy={d.y} r={20} fill="#000" stroke={GREY_MID} strokeWidth={2} strokeDasharray="5 6" />
                  <circle cx={d.x} cy={d.y} r={2.6} fill={GREY_MID} stroke="none" />
                </Svg>
              </div>
            );
          })}
          {DEVICES.map((d, i) => (
            <AirPulse key={`p${i}`} cx={d.x} cy={d.y} N={Math.min(Math.max(0, N - (198 + i)), 204)} r={26} speed={10} arcs={4} maxR={88} color={i % 2 === 0 ? WHITE : GREY_LIGHT} opacity={arcOp(i) * exit} glow />
          ))}

          {/* ---- 灰字（中央上方）---- */}
          <div style={{...abs(0, 0, 1280, 720), transform: `translateY(${capDy.toFixed(1)}px)`}}>
            <SoftIn N={N} f0={200} len={8}>
              <CText cx={CAPTION.cx} cy={CAPTION.cy} size={26} weight={600} color={GREY}>full of conversations</CText>
            </SoftIn>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};
