import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_WIDE} from '../../common';
import {CameraRig} from '../../fx';
import {Pill, CText, PacketIcon, GREY, GREY_MID, PURPLE, PURPLE_LIGHT, WHITE, abs, softOp, firstOp, scaleIn, exitOp, glowOffK, glowPurpleS} from '../../ui';

/**
 * SC04 照片走 TCP：信使 · N 549–640（S05 557–638 段内；单块 557）
 * 版式：左侧 TCP 大 Pill（紫边 + Audiowide 66px + 紫光）(170,575) 222×136；
 *   右侧戴邮差帽的大信封 (494,590) 214×160 + 帽（信封+帽简笔 ≈200px 墨迹，主角组）；
 *   两者间短虚线路径线（y590，draw-on 14 帧 + 右端小箭头）；
 *   三枚小信封在路径线上列队 2.5px/帧持续右行（从 Pill 背后钻出、到信封前淡出，循环）；
 *   下方灰字 the courier 26px (360,748)。
 * 节拍：551 TCP Pill stampIn（1.4→1 + 紫光点亮；=557−6）；553 信封 21 帧缩放入；
 *   560 the courier SoftIn；563 路径线 draw-on + 队列出动；566 帽 draw-on 8 帧；583 帽檐轻点（行礼，14 帧）。
 * 运镜：1.0→1.05 慢推（549→630，中心推；末态内容仍在安全区内：Pill 左缘 45 / 信封右缘 617）。
 * 离场：末 8 帧归零（633–640）；Pill 紫光先灭。停留：段内不判（S05 后 S06 同段，分镜表）。
 */
const F0 = 549;
const TO = 640;

const T_PILL = 551, T_ENV = 553, T_LABEL = 560, T_LANE = 563, T_HAT = 566, T_SALUTE = 583;

const PILL = {cx: 170, cy: 575, w: 222, h: 136};
const ENV = {cx: 494, cy: 590, w: 214, h: 160};
const LANE = {x0: 230, x1: 380, y: 590}; // 队列车道（左端藏在大 Pill 背后）

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;

  // TCP Pill stampIn + 紫光
  const pillS = 1.4 - 0.4 * easeOutCubic(clamp01((N - T_PILL) / 12));
  const pillK = softOp(N - T_PILL, 8) * glowOffK(N, TO, 6, 8);
  // 邮差信封缩放入（0.25→1，21 帧）
  const enS = 0.25 + 0.75 * scaleIn(N - T_ENV, 21);
  // 帽 draw-on 8 帧 + 行礼（-10° 往返，14 帧）
  const hatP = clamp01((N - T_HAT) / 8);
  const saluteT = clamp01((N - T_SALUTE) / 14);
  const hatRot = -10 * Math.sin(Math.PI * saluteT);
  // 路径线 draw-on
  const laneP = clamp01((N - T_LANE) / 14);
  // 队列：三枚小信封 2.5px/帧右行（mod 循环，两端淡入淡出）
  const queue = [0, 1, 2].map((i) => {
    const x = LANE.x0 + ((i * 51 + 2.5 * Math.max(0, N - T_LANE)) % 153);
    const op = clamp01((LANE.x1 - x) / 16) * softOp(N - T_LANE, 6);
    return {x, op};
  });

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 640, s: 1}, {f: 630, x: 360, y: 640, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ---- 队列小信封（画在 Pill/信封之下，从 Pill 背后钻出）---- */}
        {queue.map((q, i) => (q.op > 0.01 ? <PacketIcon key={`q${i}`} cx={q.x} cy={LANE.y} w={44} h={30} opacity={q.op} /> : null))}

        {/* ---- 路径线（虚线 draw-on + 右端小箭头）---- */}
        {laneP > 0 ? (
          <div style={{...abs(292, LANE.y - 1.25, 92 * laneP, 2.5), background: `repeating-linear-gradient(90deg, ${WHITE} 0 9px, transparent 9px 17px)`, opacity: 0.85}} />
        ) : null}
        {laneP >= 1 ? (
          <div style={{...abs(384, LANE.y - 6, 0, 0), opacity: softOp(N - (T_LANE + 14), 6) * 0.85, borderTop: `6px solid transparent`, borderBottom: `6px solid transparent`, borderLeft: `10px solid ${WHITE}`}} />
        ) : null}

        {/* ---- TCP 大 Pill（紫边 + 紫光，stampIn）---- */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PILL, 5), transform: `scale(${pillS.toFixed(4)})`, transformOrigin: '170px 575px'}}>
          <Pill x={PILL.cx - PILL.w / 2} y={PILL.cy - PILL.h / 2} w={PILL.w} h={PILL.h} fill="#000" stroke={PURPLE} sw={3.5}
            glow={pillK > 0.01 ? glowPurpleS(pillK) : undefined} text="TCP" fontSize={66} weight={400} family={FONT_WIDE} color={WHITE} letterSpacing={4} />
        </div>

        {/* ---- 邮差信封（信封 + 邮差帽简笔，主角组 ≈200px 墨迹）---- */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_ENV, 5), transform: `scale(${enS.toFixed(4)})`, transformOrigin: '494px 590px'}}>
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0}}>
            {/* 信封体 */}
            <rect x={ENV.cx - ENV.w / 2 + 1.5} y={ENV.cy - ENV.h / 2 + 1.5} width={ENV.w - 3} height={ENV.h - 3} fill="#000" stroke={WHITE} strokeWidth={3} style={{filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.35))'}} />
            <path d={`M${ENV.cx - ENV.w / 2 + 1.5},${ENV.cy + ENV.h / 2 - 1.5} L${ENV.cx},${ENV.cy + 12} L${ENV.cx + ENV.w / 2 - 1.5},${ENV.cy + ENV.h / 2 - 1.5}`} fill="none" stroke={WHITE} strokeWidth={2.8} strokeLinejoin="round" />
            {/* 地址两行 */}
            <line x1={ENV.cx + 36} y1={ENV.cy + 42} x2={ENV.cx + 90} y2={ENV.cy + 42} stroke={GREY_MID} strokeWidth={2.2} opacity={0.8} />
            <line x1={ENV.cx + 36} y1={ENV.cy + 54} x2={ENV.cx + 76} y2={ENV.cy + 54} stroke={GREY_MID} strokeWidth={2.2} opacity={0.8} />
            {/* 封口紫火漆 */}
            <circle cx={ENV.cx} cy={ENV.cy + 12} r={9} fill={PURPLE} stroke={WHITE} strokeWidth={2} />
            {/* 邮差帽（draw-on + 行礼旋转） */}
            <g transform={`rotate(${hatRot.toFixed(2)} 458 510)`}>
              <path d={`M466,505 Q494,462 522,505`} fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={110} strokeDashoffset={110 * (1 - hatP)} />
              <line x1={458} y1={510} x2={530} y2={510} stroke={WHITE} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={72} strokeDashoffset={72 * (1 - hatP)} />
              <line x1={522} y1={505} x2={534} y2={500} stroke={PURPLE_LIGHT} strokeWidth={2.5} strokeLinecap="round"
                strokeDasharray={14} strokeDashoffset={14 * (1 - hatP)} />
            </g>
          </svg>
        </div>

        {/* ---- the courier ---- */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_LABEL, 8)}}>
          <CText cx={360} cy={748} size={26} weight={600} color={GREY} letterSpacing={1}>the courier</CText>
        </div>
      </div>
    </CameraRig>
  );
};
