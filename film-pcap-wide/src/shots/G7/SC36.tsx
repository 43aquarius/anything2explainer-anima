import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeInOutPow, easeOutCubic, kf, powOutRemain} from '../../common';
import {CText, GREY, PacketIcon, PURPLE, PURPLE_LIGHT, WHITE, abs, firstOp, exitOp, SoftIn} from '../../ui';
import {CameraRig, countTo} from '../../fx';
import {ArcArrow} from './g7ui';

/**
 * SC36 TLS 1.3：信封变成保险柜 · N 7940–8231（S46 7948–8229：7948 首先加密 / 7992 TLS 1.3
 *   / 8107 一次往返握手 / 8179 内容读不到）
 * 版式：左半握手时序图（浏览器点 (320,425) ⇄ 服务器点 (560,425)，上下两条弧线箭头依次 draw-on
 *   + 中央 `1 RTT` Orbitron 44px 紫计数落位）；右半保险柜 (900,405)：信封滑入 → 柜门 scaleX
 *   翻转关闭（10 帧）→ 锁圈 draw-on + 白闪 → 柜门缝渗出 `●●●●●` 加密圆点（橙，每 30 帧重排，
 *   持续动作）。顶部 `TLS 1.3` 大字 GlitchIn（本镜唯一 glitch，白名单）。
 * 运镜：8058–8092 34 帧 1→1.15 推向保险柜（8107 前结束，不进末拍）。
 * 主角：保险柜 200px；光：锁圈紫光 / 加密点橙。停留：段内不判（S46 非 ¶）。末 8 帧归零。
 */
const F0 = 7940, TO = 8231;
const T_SCAF = 7948, T_TITLE = 7992, ARC1 = 7996, ARC2 = 8012, T_RTT = 8030;
const T_ENV = 8107, T_DOOR = 8121, T_RING = 8131, T_FLASH = 8153, T_DOTS = 8179;
const CAM_KEYS = [
  {f: 8058, x: 640, y: 360, s: 1},
  {f: 8092, x: 800, y: 390, s: 1.15},
];
const NODE = {bl: {cx: 320, cy: 425}, sv: {cx: 560, cy: 425}, r: 30};
const SAFE = {cx: 900, cy: 405, w: 240, h: 200};
const DOT_XS = [828, 861, 894, 927, 960];

export const SC36: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 信封滑入（14 帧）→ 进柜口缩小
  const envN = N - T_ENV;
  const envSlide = powOutRemain(envN, 14, 2.5);
  const envX = 742 + (SAFE.cx - 742) * (1 - envSlide);
  const envShrink = clamp01((N - T_DOOR) / 10);
  const envScale = 1 - 0.55 * envShrink;
  // 柜门：0.1（开）→ 1（关），10 帧
  const doorS = kf(N, [[T_DOOR, 0.1], [T_DOOR + 10, 1]], easeInOutPow(2.5));
  // 锁圈 draw-on 20 帧
  const ringP = clamp01((N - T_RING) / 20);
  // 白闪（6 帧）
  const flash = N >= T_FLASH ? Math.max(0, 1 - Math.abs((N - T_FLASH - 3) / 3)) : 0;
  // 加密圆点：每 30 帧一批从门缝渗出（旋转重排）
  const dotCyc = N >= T_DOTS ? Math.floor((N - T_DOTS) / 30) : -1;
  const dotT = N >= T_DOTS ? (N - T_DOTS) % 30 : -1;
  // 标题 / RTT
  const rttN = N - T_RTT;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={CAM_KEYS}>
        {/* ===== 左半：握手时序图 ===== */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_SCAF, 8)}}>
          {[NODE.bl, NODE.sv].map((nd, i) => (
            <svg key={i} width={NODE.r * 2 + 8} height={NODE.r * 2 + 8} viewBox={`${-NODE.r - 4} ${-NODE.r - 4} ${NODE.r * 2 + 8} ${NODE.r * 2 + 8}`} style={{position: 'absolute', left: nd.cx - NODE.r - 4, top: nd.cy - NODE.r - 4, overflow: 'visible'}}>
              <circle cx={0} cy={0} r={NODE.r} fill="#000" stroke={WHITE} strokeWidth={3} />
              <circle cx={0} cy={0} r={7} fill={i === 0 ? PURPLE_LIGHT : WHITE} />
            </svg>
          ))}
          <SoftIn N={N} f0={T_SCAF + 4}>
            <CText cx={NODE.bl.cx} cy={NODE.bl.cy + 66} size={22} weight={600} color={GREY}>browser</CText>
            <CText cx={NODE.sv.cx} cy={NODE.sv.cy + 66} size={22} weight={600} color={GREY}>server</CText>
          </SoftIn>
        </div>
        {/* 上下两条弧线箭头（依次 draw-on 14 帧） */}
        <ArcArrow d={`M ${NODE.bl.cx},${NODE.bl.cy - 34} Q 440,300 ${NODE.sv.cx},${NODE.sv.cy - 34}`} hx={NODE.sv.cx} hy={NODE.sv.cy - 34} ang={37} p={clamp01((N - ARC1) / 14)} color={WHITE} />
        <ArcArrow d={`M ${NODE.sv.cx},${NODE.sv.cy + 34} Q 440,550 ${NODE.bl.cx},${NODE.bl.cy + 34}`} hx={NODE.bl.cx} hy={NODE.bl.cy + 34} ang={-143} p={clamp01((N - ARC2) / 14)} color={WHITE} />
        {/* 1 RTT 计数落位 */}
        {rttN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, 0.3 + 0.7 * clamp01(rttN / 8))}}>
            <CText
              cx={440}
              cy={NODE.bl.cy + 1}
              size={44}
              weight={800}
              color={PURPLE_LIGHT}
              shadow="0 0 26px rgba(161,117,241,.55), 0 0 8px rgba(102,45,248,.5)"
              style={{fontFamily: "'Orbitron','Audiowide',sans-serif", fontVariantNumeric: 'tabular-nums'}}
            >
              {`${countTo(rttN, 0, 1, 10)} RTT`}
            </CText>
          </div>
        ) : null}
        {/* ===== 右半：保险柜 ===== */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_SCAF, 8), filter: flash > 0 ? `brightness(${(1 + 0.7 * flash).toFixed(2)})` : undefined}}>
          {/* 柜体（厚白边） */}
          <div style={{...abs(SAFE.cx - SAFE.w / 2, SAFE.cy - SAFE.h / 2, SAFE.w, SAFE.h), background: '#000', border: `4px solid ${WHITE}`, borderRadius: 12, boxShadow: '0 0 18px 4px rgba(255,255,255,.14)'}} />
          {/* 柜门开口（深色圆） */}
          <div style={{...abs(SAFE.cx - 68, SAFE.cy - 68, 136, 136), borderRadius: '50%', background: '#060609', border: `2.5px solid ${GREY}`}} />
          {/* 信封（滑入 → 缩小进柜，关门后被柜门遮住） */}
          {envN >= 0 ? (
            <div style={{position: 'absolute', inset: 0}}>
              <PacketIcon cx={envX} cy={SAFE.cy} w={90} h={62} scale={envScale} />
            </div>
          ) : null}
          {/* 柜门（scaleX 翻转关闭：transformOrigin 左铰链） */}
          <div style={{...abs(SAFE.cx - 64, SAFE.cy - 64, 128, 128), transform: `scaleX(${doorS.toFixed(3)})`, transformOrigin: '0% 50%'}}>
            <svg width={128} height={128} viewBox="-64 -64 128 128" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <circle cx={0} cy={0} r={62} fill="#0a0a12" stroke={WHITE} strokeWidth={3.5} />
              {[0, 90, 180, 270].map((a) => (
                <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 54} cy={Math.sin((a * Math.PI) / 180) * 54} r={3} fill={GREY} />
              ))}
            </svg>
          </div>
          {/* 锁圈（draw-on + 紫光） */}
          {ringP > 0 ? (
            <svg width={128} height={128} viewBox="-64 -64 128 128" style={{position: 'absolute', left: SAFE.cx - 64, top: SAFE.cy - 64, overflow: 'visible', filter: 'drop-shadow(0 0 10px rgba(102,45,248,.55))'}}>
              <circle cx={0} cy={0} r={46} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - ringP)} />
              <circle cx={0} cy={0} r={26} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - T_RING - 6) / 14))} />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line key={a} x1={Math.cos((a * Math.PI) / 180) * 30} y1={Math.sin((a * Math.PI) / 180) * 30} x2={Math.cos((a * Math.PI) / 180) * 42} y2={Math.sin((a * Math.PI) / 180) * 42} stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={clamp01((N - T_RING - 8) / 12)} />
              ))}
            </svg>
          ) : null}
        </div>
        {/* 加密圆点（橙，每 30 帧从门缝渗出 + 旋转重排） */}
        {dotCyc >= 0
          ? DOT_XS.map((_, i) => {
              const target = DOT_XS[(i + dotCyc + 1) % 5];
              const q = clamp01((dotT - i * 2) / 8);
              if (q <= 0) return null;
              const e = easeOutCubic(q);
              const dx = SAFE.cx + (target - SAFE.cx) * e;
              const dy = 496 + (548 - 496) * e;
              return (
                <div key={i} style={{...abs(dx - 11, dy - 11, 22, 22), borderRadius: '50%', background: PURPLE, border: `3px solid #F05F41`, opacity: 0.25 + 0.75 * e, boxShadow: '0 0 14px 4px rgba(240,95,65,.55)'}} />
              );
            })
          : null}
        {/* ===== 顶部大字（本镜唯一 glitch） ===== */}
        <GlitchIn N={N} f0={T_TITLE}>
          <CText cx={640} cy={195} size={56} weight={900} shadow={`6px 6px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.45)`} letterSpacing={2}>TLS 1.3</CText>
        </GlitchIn>
      </CameraRig>
    </div>
  );
};
