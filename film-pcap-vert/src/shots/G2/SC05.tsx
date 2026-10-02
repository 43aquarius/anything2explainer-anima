import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, emphasisPulse} from '../../common';
import {CText, PacketIcon, SwitchBox, TapBox, GREY, GREY_LINE, PURPLE_LIGHT, WHITE, abs, exitOp, firstOp, glowOffK, glowPurpleS, mixHex, slideUp, scaleIn} from '../../ui';
import {LaptopIcon, MiniScreen, NumBadge, bez} from './g2ui';

/**
 * SC05 三处立足点 · N 658–856（S06 666–854：666 三处 / 713 自己的机器 / 748 镜像口 / 798 分路器）
 * 版式：竖排三卡 500×200 @ x110，y 280/520/760（竖版天然列表）——
 *   ① LaptopIcon + `your machine`（713 屏内 OS 芯片紫光 + 小信封双向穿过机身后面 = 看得见自己的流量）；
 *   ② SwitchBox 330×84 + `mirror port` + 紫虚线弧 draw-on → 右下 MiniScreen，副本信封每 30 帧沿弧飞一枚；
 *   ③ 粗线缆（原件信封持续流过 = 原件不断）+ TapBox 798 剪入（scaleIn + 白闪）+ `tap` + 副本每 26 帧落一枚 + 计数。
 * 每卡左上 ①②③ 虚线圆徽章（Orbitron）；当前讲到的卡边框紫光点亮（713/748/798 切换，配 emphasisPulse）。
 * 节拍：658/660/662 三卡 slideUp Δ70/18f（首卡对齐节拍 666 容差 −8，落位 676–680）；末 8 帧归零。停留：段内不判。
 * 主角：三卡组（当前卡 200px 高 + 紫边光呼吸）。零 glitch（G2 白名单无）。
 */
const F0 = 658;
const TO = 856;
const T_CARD = [658, 660, 662];
const T_ACT = [713, 748, 798];
const CARD_Y = [280, 520, 760];
const CARD_W = 500, CARD_H = 200;

// 卡②几何（卡内局部坐标）：弧自交换机右缘到 MiniScreen 顶
const ARC = {x0: 350, y0: 78, c1: [398, 78], c2: [395, 96], x1: 395, y1: 118};
const COPY2_DEP = [760, 790, 820]; // 副本②出发（每 30 帧，18 帧飞行 → 落 778/808/838）
// 卡③几何：副本自 TAP 盒底滑落到 MiniScreen
const DROP = {x0: 140, y0: 112, c1: [140, 150], c2: [330, 152], x1: 352, y1: 128};
const COPY3_DEP = [806, 832]; // 副本③出发（每 26 帧，14 帧滑落 → 落 820/846）

const flash = (n: number, len = 6) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // 每卡激活状态：边框紫光 k（激活 8 帧亮、下一卡激活 8 帧内回落 92%）、内容透明度（0.45 → 1 → 0.62）
  const borderK = T_ACT.map((t, i) => {
    const on = clamp01((N - t) / 8);
    const off = i < 2 ? clamp01((N - T_ACT[i + 1]) / 8) : 0;
    return on * (1 - 0.92 * off);
  });
  const contentOp = (i: number) => {
    if (N < T_ACT[i]) return 0.45;
    if (i >= 2 || N < T_ACT[i + 1]) return 0.45 + 0.55 * clamp01((N - T_ACT[i]) / 8);
    return 1 - 0.38 * clamp01((N - T_ACT[i + 1]) / 8);
  };
  const isActive = (i: number) => N >= T_ACT[i] && (i >= 2 || N < T_ACT[i + 1]);

  const card = (i: number, children: React.ReactNode) => {
    const cn = N - T_CARD[i];
    if (cn < 0) return null;
    const dy = slideUp(cn, 70, 18);
    const pulse = emphasisPulse(N - T_ACT[i], {peak: 1.05, up: 10, hold: 3, down: 12});
    const glow = glowPurpleS(borderK[i] * gk * (0.85 + 0.15 * Math.sin((2 * Math.PI * N) / 30)));
    return (
      <div key={i} style={{...abs(110, CARD_Y[i] + dy, CARD_W, CARD_H), opacity: firstOp(cn, 8), transform: pulse === 1 ? undefined : `scale(${pulse.toFixed(4)})`}}>
        <div style={{...abs(0, 0, CARD_W, CARD_H), background: '#000', borderRadius: 12, border: `2.5px solid ${mixHex(GREY_LINE, PURPLE_LIGHT, borderK[i])}`, boxShadow: borderK[i] > 0.02 ? glow : undefined}} />
        <div style={{position: 'absolute', inset: 0, opacity: contentOp(i)}}>{children}</div>
        <NumBadge cx={44} cy={46} r={24} digit={String(i + 1)} lit={borderK[i] > 0.4} digitSize={32} />
      </div>
    );
  };

  // 卡①：小信封穿过笔记本（先画，机身后画盖住）
  const tinyEnv = (i: number, dir: 1 | -1) => {
    const f = N - 713 - (dir === 1 ? 0 : 4) - i * 2;
    if (f < 0) return null;
    const x = dir === 1 ? 100 + ((f * 3.2 + i * 130) % 220) : 320 - ((f * 3.2 + i * 130) % 220);
    const edge = Math.min(1, (x - 95) / 28, (325 - x) / 28);
    return edge > 0.02 ? <PacketIcon key={`${i}-${dir}`} cx={x} cy={i === 0 ? 100 : 118} w={34} h={24} opacity={Math.max(0, edge)} /> : null;
  };

  // 卡②副本：沿贝塞尔弧 18 帧
  const copy2 = COPY2_DEP.map((dep, k) => {
    const t = (N - dep) / 18;
    if (t <= 0 || t >= 1) return null;
    const e = easeOutCubic(clamp01(t));
    return <PacketIcon key={k} cx={bez(e, ARC.x0, ARC.c1[0], ARC.c2[0], ARC.x1)} cy={bez(e, ARC.y0, ARC.c1[1], ARC.c2[1], ARC.y1)} w={60} h={42} accent opacity={Math.min(1, t / 0.2, (1 - t) / 0.2) * 0.9} />;
  });
  const count2 = COPY2_DEP.filter((d) => N >= d + 18).length;
  const land2 = COPY2_DEP.filter((d) => N >= d + 18).pop();

  // 卡③副本：滑落 14 帧
  const copy3 = COPY3_DEP.map((dep, k) => {
    const t = (N - dep) / 14;
    if (t <= 0 || t >= 1) return null;
    const e = easeOutCubic(clamp01(t));
    return <PacketIcon key={k} cx={bez(e, DROP.x0, DROP.c1[0], DROP.c2[0], DROP.x1)} cy={bez(e, DROP.y0, DROP.c1[1], DROP.c2[1], DROP.y1)} w={60} h={42} accent opacity={Math.min(1, t / 0.18, (1 - t) / 0.25) * 0.9} />;
  });
  const count3 = COPY3_DEP.filter((d) => N >= d + 14).length;
  const land3 = COPY3_DEP.filter((d) => N >= d + 14).pop();

  // 卡③原件：线缆上左→右持续（先画，被 TAP 盒盖住中段 = 原件不断）
  const origEnv = (i: number) => {
    const f = N - 802 - i * 2;
    if (f < 0) return null;
    const x = 15 + ((f * 2.6 + i * 160) % 470);
    const edge = Math.min(1, (x - 15) / 40, (485 - x) / 40);
    return edge > 0.02 ? <PacketIcon key={i} cx={x} cy={65} w={34} h={24} opacity={Math.max(0, edge) * 0.95} /> : null;
  };

  // 剪入白闪（798）+ TapBox 缩放入场
  const spliceFlash = flash(N - T_ACT[2], 5);
  const tapS = scaleIn(N - T_ACT[2], 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 卡 ①：your machine */}
      {card(0, (
        <>
          {tinyEnv(0, 1)}
          {tinyEnv(0, -1)}
          {tinyEnv(1, 1)}
          <LaptopIcon cx={190} cy={105} w={190} lit={isActive(0)} />
          <CText cx={190} cy={182} size={28} weight={700} color={isActive(0) ? WHITE : GREY}>your machine</CText>
        </>
      ))}

      {/* 卡 ②：mirror port */}
      {card(1, (
        <>
          <SwitchBox cx={190} cy={88} w={330} h={84} ports={6} lit={3} N={N} accent={isActive(1)} />
          {N >= T_ACT[1] + 2 ? (
            <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <path
                d={`M${ARC.x0},${ARC.y0} C${ARC.c1[0]},${ARC.c1[1]} ${ARC.c2[0]},${ARC.c2[1]} ${ARC.x1},${ARC.y1}`}
                fill="none"
                stroke={PURPLE_LIGHT}
                strokeWidth={2.5}
                strokeDasharray="8 7"
                strokeDashoffset={110 * (1 - clamp01((N - (T_ACT[1] + 2)) / 16)) - Math.max(0, N - (T_ACT[1] + 18)) * 2.2}
                opacity={0.95 * gk}
              />
            </svg>
          ) : null}
          {copy2}
          <MiniScreen cx={395} cy={144} w={96} h={60} count={count2} pulse={land2 !== undefined ? emphasisPulse(N - (land2 + 18), {peak: 1.14, up: 5, hold: 2, down: 8}) : 1} />
          <CText cx={190} cy={170} size={28} weight={700} color={isActive(1) ? WHITE : GREY}>mirror port</CText>
        </>
      ))}

      {/* 卡 ③：tap */}
      {card(2, (
        <div style={{position: 'absolute', inset: 0, filter: spliceFlash > 0 ? `brightness(${(1 + 0.6 * spliceFlash).toFixed(2)})` : undefined}}>
          {[61, 68].map((y) => <div key={y} style={{...abs(15, y, 470, 2.5), background: WHITE, opacity: 0.85}} />)}
          {[0, 1, 2].map((i) => origEnv(i))}
          {N >= T_ACT[2] ? (
            <div style={{position: 'absolute', inset: 0, transform: `translate(140px,65px) scale(${tapS.toFixed(4)}) translate(-140px,-65px)`}}>
              <TapBox cx={140} cy={65} w={140} h={95} label="TAP" accent />
            </div>
          ) : null}
          {copy3}
          <MiniScreen cx={395} cy={132} w={96} h={60} count={count3} pulse={land3 !== undefined ? emphasisPulse(N - (land3 + 14), {peak: 1.14, up: 5, hold: 2, down: 8}) : 1} />
          <CText cx={292} cy={46} size={28} weight={700} color={isActive(2) ? WHITE : GREY}>tap</CText>
        </div>
      ))}
    </div>
  );
};
