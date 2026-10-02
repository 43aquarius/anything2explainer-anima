import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, kf, rnd, FONT_MONO, FONT_ORB} from '../../common';
import {CText, PacketIcon, PersonIcon, RackIcon, GREY, GREY_LINE, ORANGE, WHITE, abs, fadeIn, firstOp, exitOp, SoftIn} from '../../ui';
import {CameraRig} from '../../fx';
import {OrangeGlow} from './g6ui';

/**
 * SC32 消失的信与信箱 · N 7097–7300（S41 7105–7298：7105 重传 / 7156 信在途中消失 / 7209 寄信人守着信箱 / 7263 翻倍计时器）
 * 版式：左侧服务器小机架寄信 → 三枚橙描边信封沿路（y 340）陆续出发，走到中点 (640,340) 粒子散开消失（节奏对齐三个节拍）；
 *   右侧信箱 + 寄信人 PersonIcon + 翻倍计时器表盘（指针 1s→2s→4s 三段跳变白闪，表盘刻度，持续小幅抖动）。
 * 运镜：1.0→1.05 慢推贯穿（例外允许）。零 glitch（白名单）。停留：段内不判（S41 非 ¶）。末 8 帧归零。
 * 主角：信箱 + 寄信人组（y 230–432 ≈ 200px+ 表盘）≈ 260px 高；光 = 计时器表盘橙光。
 */
const F0 = 7097, TO = 7300;
const T_SCENE = 7105;
const T_ENV = [7156, 7209, 7263]; // 出发时刻（各 16 帧路程 → 中点消失）
const T_PERSON = 7209;
const T_DIAL = 7257; // 7263 − 6（容差内提前）
const ROAD = {x0: 210, x1: 1010, y: 340};
const VANISH = {x: 640, y: 340};
const RACK = {cx: 155, cy: 352, w: 100, h: 170};
const PERSON = {cx: 872, cy: 402, size: 102};
const DIAL = {cx: 1090, cy: 228, r: 62};
const CAM_KEYS = [
  {f: 7097, x: 640, y: 360, s: 1},
  {f: 7300, x: 640, y: 360, s: 1.05},
];
/** 粒子（每枚信封消失时 10 颗散开，8 帧） */
const BURST = Array.from({length: 10}, (_, k) => {
  const a = rnd(k, 32.1) * Math.PI * 2;
  const d = 12 + rnd(k, 32.2) * 36;
  return {dx: Math.cos(a) * d, dy: Math.sin(a) * d - 4, r: 2.5 + rnd(k, 32.3) * 2, w: rnd(k, 32.4) > 0.45};
});

export const SC32: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const eio = easeInOutPow(2.5);
  // 路面 draw-on（20 帧 clip 自左）
  const roadP = easeOutCubic(clamp01((N - (T_SCENE + 2)) / 20));
  // 表盘指针角度（三段跳变 + 持续小幅抖动）：1s −50° / 2s 0° / 4s +50°
  const handA =
    -50 + kf(N, [[T_DIAL + 16, 0], [T_DIAL + 22, 50], [T_DIAL + 30, 100]]) + (N >= T_DIAL + 30 ? 2.6 * Math.sin(N * 1.7) : 0);
  const dialTxt = N < T_DIAL + 22 ? '1 s' : N < T_DIAL + 30 ? '2 s' : '4 s';
  const dialFlash = N - (T_DIAL + 22) >= 0 && N - (T_DIAL + 22) < 6 ? 1 : N - (T_DIAL + 30) >= 0 && N - (T_DIAL + 30) < 6 ? 1 : 0;
  const dialPulse = N >= T_DIAL + 30 ? 1 + 0.1 * Math.max(0, 1 - Math.abs((N - (T_DIAL + 36)) / 8)) : 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* 服务器小机架（寄信） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_SCENE, 8)}}>
          <RackIcon cx={RACK.cx} cy={RACK.cy} w={RACK.w} h={RACK.h} units={5} lit={3} label="server" />
        </div>
        {/* 路（虚线） */}
        {roadP > 0 ? (
          <div style={{...abs(ROAD.x0, ROAD.y - 2, ROAD.x1 - ROAD.x0, 4), clipPath: `inset(0 ${((1 - roadP) * 100).toFixed(2)}% 0 0)`}}>
            <div style={{width: '100%', height: 0, borderTop: `2.5px dashed ${GREY_LINE}`}} />
          </div>
        ) : null}
        {/* 三枚信封：出发 → 中点消失（粒子散开） */}
        {T_ENV.map((t0, i) => {
          const tn = N - t0;
          if (tn < 0) return null;
          const x = kf(N, [[t0, 250], [t0 + 16, VANISH.x]], eio);
          const gone = N >= t0 + 16;
          const envOp = gone ? Math.max(0, 1 - (N - (t0 + 16)) / 6) : 1;
          const bn = N - (t0 + 16);
          return (
            <div key={i}>
              {envOp > 0 ? (
                <div style={{position: 'absolute', inset: 0, opacity: envOp}}>
                  <PacketIcon cx={x} cy={VANISH.y} w={74} h={52} color={ORANGE} />
                </div>
              ) : null}
              {bn >= 0 && bn < 8
                ? BURST.map((p, k) => {
                    const bk = clamp01(bn / 8);
                    return (
                      <div
                        key={k}
                        style={{
                          ...abs(VANISH.x + p.dx * bk - p.r / 2, VANISH.y + p.dy * bk - p.r / 2, p.r, p.r),
                          borderRadius: '50%',
                          background: p.w ? WHITE : ORANGE,
                          opacity: (1 - bk) * 0.9,
                          boxShadow: p.w ? '0 0 6px rgba(255,255,255,.5)' : '0 0 6px rgba(240,95,65,.55)',
                        }}
                      />
                    );
                  })
                : null}
            </div>
          );
        })}
        {/* 消失点标记（微弱橙虚线圈，7156 后持续提示「这里丢的」） */}
        {N >= T_ENV[0] + 16 ? (
          <div style={{...abs(VANISH.x - 20, VANISH.y - 20, 40, 40), borderRadius: '50%', border: `2px dashed ${ORANGE}`, opacity: 0.5}} />
        ) : null}
        {/* 信箱（draw-on） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PERSON, 6)}}>
          <svg width={180} height={150} viewBox="0 0 180 150" style={{position: 'absolute', left: 912, top: 288, overflow: 'visible'}} opacity={fadeIn(N - T_PERSON, 8)}>
            <rect x={82} y={76} width={10} height={64} fill="#000" stroke={WHITE} strokeWidth={2.5} />
            <rect x={36} y={10} width={108} height={70} rx={12} fill="#000" stroke={WHITE} strokeWidth={3} />
            <rect x={54} y={34} width={72} height={8} rx={4} fill="none" stroke={GREY} strokeWidth={2.5} />
          </svg>
        </div>
        {/* 寄信人（守着信箱） */}
        <SoftIn N={N} f0={T_PERSON}>
          <PersonIcon cx={PERSON.cx} cy={PERSON.cy} size={PERSON.size} label="sender" />
        </SoftIn>
        {/* 翻倍计时器表盘 */}
        {N >= T_DIAL ? (
          <div style={{position: 'absolute', inset: 0, opacity: fadeIn(N - T_DIAL, 6)}}>
            <OrangeGlow cx={DIAL.cx} cy={DIAL.cy} r={96} k={1} N={N} alpha={0.3} />
            <div style={{position: 'absolute', inset: 0, transform: `scale(${dialPulse.toFixed(3)})`, transformOrigin: `${DIAL.cx}px ${DIAL.cy}px`, filter: dialFlash ? 'brightness(1.6)' : undefined}}>
              <svg width={DIAL.r * 2 + 8} height={DIAL.r * 2 + 8} viewBox={`${-DIAL.r - 4} ${-DIAL.r - 4} ${DIAL.r * 2 + 8} ${DIAL.r * 2 + 8}`} style={{position: 'absolute', left: DIAL.cx - DIAL.r - 4, top: DIAL.cy - DIAL.r - 4, overflow: 'visible'}}>
                <circle cx={0} cy={0} r={DIAL.r} fill="#000" stroke={WHITE} strokeWidth={3} />
                {Array.from({length: 11}, (_, i) => {
                  const aa = -Math.PI / 2 + (i / 10) * Math.PI * 1.11 - 0.055 * Math.PI;
                  const r1 = DIAL.r - 4, r2 = DIAL.r - (i % 5 === 0 ? 14 : 9);
                  return <line key={i} x1={Math.cos(aa) * r1} y1={Math.sin(aa) * r1} x2={Math.cos(aa) * r2} y2={Math.sin(aa) * r2} stroke={GREY} strokeWidth={2.5} />;
                })}
                <line x1={0} y1={0} x2={Math.cos(((handA - 90) * Math.PI) / 180) * (DIAL.r - 12)} y2={Math.sin(((handA - 90) * Math.PI) / 180) * (DIAL.r - 12)} stroke={ORANGE} strokeWidth={4.5} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px rgba(240,95,65,.7))'}} />
                <circle cx={0} cy={0} r={5} fill={ORANGE} />
                <text x={0} y={30} textAnchor="middle" fontFamily={FONT_ORB} fontSize={26} fontWeight={700} fill={ORANGE}>{dialTxt}</text>
              </svg>
              <CText cx={DIAL.cx} cy={DIAL.cy + DIAL.r + 26} size={22} weight={600} color={GREY} family={FONT_MONO}>doubling timer</CText>
            </div>
          </div>
        ) : null}
      </CameraRig>
    </div>
  );
};
