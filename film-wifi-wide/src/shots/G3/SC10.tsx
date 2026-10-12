import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_TECH} from '../../common';
import {CameraRig} from '../../fx';
import {AirPulse, DeviceGlyph, PacketIcon, RouterGlyph, CText, Check, EXAMPLE, GREY, GREY_MID, PURPLE_LIGHT, WHITE, abs, softOp, exitOp, glowOffK} from '../../ui';

/**
 * SC10 先报名（1994–2196）。S19–S20（¶章末镜头，停 2196=C4-54）。
 * 节拍：2002 于是路由器让他们先自我介绍 ｜2030 一个小请求 一个小回应
 *       ｜2086 然后发言权归他（①请求 2030+6 ②回应 2044 ③话筒移交 2080）。
 * 承接 SC09 布局缩微左移 0.7×。尾部硬规则：末拍 ≤ 2151；exitOp(N, TO, 5) + glowOffK(N, TO, 3, 5)。
 */
const F0 = 1994;
const TO = 2196;

// 承接布局（缩微左移）：墙左设备 / 中央路由器 / 墙右设备
const L = {cx: 330, cy: 330, s: 0.7};
const R = {cx: 760, cy: 330, s: 0.7};
const AP = {cx: 560, cy: 150};

// 全尺寸舞台（三拍戏主区）
const LT = {cx: 420, cy: 380};
const RT = {cx: 880, cy: 380};
const MIC_Y = 210;

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gk = glowOffK(N, TO, 3, 5);

  // 缩微承接（12f 落位）
  const carry = clamp01((N - 1996) / 12);
  // 三拍：请求（2036）/ 回应（2050）/ 话筒移交（2080）
  const reqP = clamp01((N - 2036) / 14);       // 请求信封飞行
  const ackP = clamp01((N - 2050) / 14);       // 回应信封飞回
  const micP = clamp01((N - 2080) / 20);      // 话筒移交（20f）
  const floorP = clamp01((N - 2096) / 12);    // 左设备发言弧全功率
  const reqOp = softOp(N - 2036, 6);
  const ackOp = softOp(N - 2050, 6);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 2044, x: 640, y: 360, s: 1}, {f: 2080, x: 660, y: 350, s: 1.08}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 承接：SC09 缩微（左移让位） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: 0.55 * carry * (1 - clamp01((N - 2030) / 14))}}>
          <div style={{...abs(0, 0, 1280, 720), transform: `translate(${(-160 * carry).toFixed(1)}px, ${(-60 * carry).toFixed(1)}px) scale(${(1 - 0.3 * carry).toFixed(3)})`, transformOrigin: '560px 330px'}}>
            <DeviceGlyph cx={L.cx} cy={L.cy} kind="laptop" w={90} h={70} dim />
            <DeviceGlyph cx={R.cx} cy={R.cy} kind="phone" w={70} h={70} dim />
            <RouterGlyph cx={AP.cx} cy={AP.cy} s={0.7} lit={false} />
          </div>
        </div>

        {/* 三拍戏舞台：左设备 与 右设备 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2006, 10)}}>
          <DeviceGlyph cx={LT.cx} cy={LT.cy} kind="laptop" w={170} h={130} accent={floorP > 0.1} dim={false} label={EXAMPLE.laptop} />
          <DeviceGlyph cx={RT.cx} cy={RT.cy} kind="phone" w={130} h={130} dim={floorP > 0.1} label={EXAMPLE.phone} />
          {/* 话筒图标（从路由器位置横移到左设备上方） */}
          {N >= 2026 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2026, 6) * gk}}>
              <svg width={64} height={96} viewBox="0 0 64 96" style={{position: 'absolute', left: 620 + (LT.cx - 40 - 620) * micP, top: MIC_Y, filter: floorP > 0.1 ? 'drop-shadow(0 0 10px rgba(161,117,241,.7))' : 'drop-shadow(0 0 4px rgba(255,255,255,.4))'}}>
                <rect x={20} y={4} width={24} height={40} rx={12} fill="#000" stroke={floorP > 0.1 ? PURPLE_LIGHT : WHITE} strokeWidth={3} />
                <path d="M12 44 Q12 66 32 66 Q52 66 52 44" fill="none" stroke={floorP > 0.1 ? PURPLE_LIGHT : WHITE} strokeWidth={3} />
                <line x1={32} y1={66} x2={32} y2={80} stroke={floorP > 0.1 ? PURPLE_LIGHT : WHITE} strokeWidth={3} />
                <line x1={20} y1={80} x2={44} y2={80} stroke={floorP > 0.1 ? PURPLE_LIGHT : WHITE} strokeWidth={3} />
              </svg>
            </div>
          ) : null}
          {/* ① 请求小信封：左 → 中 */}
          {reqP > 0 && reqP < 1 ? (
            <div style={{...abs(0, 0, 1280, 720)}}>
              <PacketIcon cx={LT.cx + (620 - LT.cx) * reqP} cy={LT.cy - 110 - 36 * Math.sin(Math.PI * reqP)} accent glow stamp={EXAMPLE.request.slice(0, 3)} />
            </div>
          ) : null}
          {/* ② 回应小信封：中 → 左 */}
          {ackP > 0 && ackP < 1 ? (
            <div style={{...abs(0, 0, 1280, 720)}}>
              <PacketIcon cx={620 + (LT.cx - 620) * ackP} cy={240 + 70 - 40 * Math.sin(Math.PI * ackP)} glow stamp="ok" />
            </div>
          ) : null}
          {/* ②b 右设备也想发但被压（灰耳一闪） */}
          {N >= 2066 && N < 2090 ? (
            <CText cx={RT.cx} cy={RT.cy - 90} size={22} weight={500} color={GREY_MID} opacity={Math.max(0, 1 - Math.abs((N - 2078) / 12))}>waiting</CText>
          ) : null}
          {/* ③ 发言权：左设备全功率弧 + 右设备静默 */}
          {floorP > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: floorP * gk}}>
              <AirPulse cx={LT.cx} cy={LT.cy - 90} N={N} r={26} speed={16} arcs={3} maxR={170} color={PURPLE_LIGHT} glow />
            </div>
          ) : null}
          {/* Check（回应确认） */}
          {ackP >= 1 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: gk * clamp01((N - 2064) / 8)}}>
              <Check cx={LT.cx + 90} cy={LT.cy - 120} size={46} sw={6} />
            </div>
          ) : null}
        </div>

        {/* 文案层 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2002, 8) * gk}}>
          <CText cx={640} cy={108} size={26} weight={600} color={GREY} letterSpacing={1}>announce first</CText>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2030, 8) * gk}}>
          <CText cx={640} cy={600} size={24} weight={500} color={GREY} letterSpacing={1}>{EXAMPLE.request} &#8594; {EXAMPLE.reply}</CText>
        </div>
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - 2096, 8) * gk}}>
          <CText cx={640} cy={640 - 100} size={26} weight={600} family={FONT_TECH} italic color={PURPLE_LIGHT} letterSpacing={1}>the floor is theirs</CText>
        </div>
      </div>
    </CameraRig>
  );
};
