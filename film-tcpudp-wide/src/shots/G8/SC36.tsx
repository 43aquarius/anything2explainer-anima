import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, emphasisPulse, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {
  Pill, PostcardIcon, PacketIcon, SeqStamp, EXAMPLE, abs, softOp, firstOp, exitOp, glowOffK, slideUp,
  WHITE, GREY_MID, GREY_LIGHT, PURPLE_LIGHT, ORANGE, BLOOM,
} from '../../ui';
import {CallWin} from '../G1/parts';

/**
 * SC36 回到通话 · N 9759–10194（S67 9767–9790 + S68 9801–9921 + S69 9932–10051 + S70 10062–10157 ¶+gap15；
 * 章内段末延到 SC37.from−1=10194）
 * 版式：SC01 通话窗口回场 —— CallWin（G1/parts 同一组件同一参数：x300,y150,680×420 + 外层
 *       translate(0,−60) scale(0.6) → 0.6× 居中 (640,300)；头像光环恢复呼吸持续）；
 *       窗口下同一条水平线（y 500，x 120–1160）：上半行明信片队列（UDP 语音流，橙点节拍伴随），
 *       下半行编号信封队列（#1..#6 stampIn，TCP 照片流）；`UDP` 橙 / `TCP` 紫 Pill 在队列首；
 *       10062 线亮化重描 + `same wire` 灰 Pill（线中央）；10111 `two promises` 灰字（线上方居中，呼应 SC10；
 *       成片 v1 修复 tcpudp-wide-fix-C：原 10131，hold=0f → SoftIn 前挂 20 帧，脉冲对撞随之提前，末拍稳定期 ≥30 ✓）。
 * 节拍：9767 窗口 slideIn 回场（Δ46/16 帧）；9769 线 draw-on 14 帧（40% 常规亮度）；
 *       9801 明信片 7 枚 2 帧错峰 SoftIn + 2.2px/帧持续右行 + 橙点 6 枚按 6 帧节拍落线（持续动作）+ `UDP` Pill；
 *       9932 编号信封 6 枚滑入（1.6px/帧）+ 编号章依次 stampIn（1.4→1.0）+ `TCP` Pill；
 *       10062 线白亮重描 20 帧 + `same wire` Pill；10111 `two promises` SoftIn + 两队列 1.03 微脉冲对撞（错峰 12 帧）。
 * 持续动作：双队列持续右行（明信片 2.2px/帧、信封 1.6px/帧，均 ≥ 建议的 1.5/2px/帧，末 30 帧仍在动）
 *       + 橙点随行 + 头像光环呼吸（到离场）。
 * 运镜：全镜 1.0→1.05 慢推（Ch4 运镜清单；贯穿例外）。
 * 离场：末 8 帧归零（10187–10194；窗口光先灭）。停留：two promises 落位 10119 → 离场 10187，68 帧 ✓（成片 v1 修复后）。
 * 主角：通话窗口+双队列组（窗口 252px@0.6×）；光 = 窗口 BLOOM/HeroGlow + TCP 紫 / UDP 橙。
 */
const F0 = 9759;
const TO = 10194;
const T_WIN = 9767, T_LINE = 9769, T_UDP = 9801, T_TCP = 9932, T_WIRE = 10062, T_TWO = 10111; // T_TWO 原 10131，成片 v1 修复前挂 20 帧

const LINE = {x0: 120, x1: 1160, y: 500};
const POSTS = 7, POST_SPAN = 1080, POST_Y = 474;
const DOTS = 6, DOT_SPAN = 1080, DOT_Y = 500;
const ENVS = 6, ENV_SPAN = 1080, ENV_Y = 528;
const POST_V = 1.3, ENV_V = 1.0; // 成片 v2 降速：聚合运动均值压到 hold 阈值下（仍持续可感）

export const SC36: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 窗口回场：slideUp Δ46/16 帧 + 首帧亮度
  const wn = N - T_WIN;
  const winDy = slideUp(wn, 46, 16);
  const winOp = firstOp(wn, 6);

  // 线：常规 40% 亮度 draw-on（14 帧）→ 10062 白亮重描（20 帧）
  const lineP = clamp01((N - T_LINE) / 14);
  const wireP = clamp01((N - T_WIRE) / 20);

  // 双队列微脉冲对撞（10131 起，错峰 12 帧）
  const pulseA = emphasisPulse(N - T_TWO, {peak: 1.03, up: 8, hold: 3, down: 10});
  const pulseB = emphasisPulse(N - (T_TWO + 12), {peak: 1.03, up: 8, hold: 3, down: 10});

  // 成片 v2：末 34 帧队列降速到 0.12px/帧（hold 稳定期；单调减速无跳变）
  const RAMP0 = TO - 8 - 50;
  const postBase = POST_V * Math.max(0, Math.min(N, RAMP0) - T_UDP) + (N > RAMP0 ? 0.12 * (N - RAMP0) : 0);
  const envBase = ENV_V * Math.max(0, Math.min(N, RAMP0) - T_TCP) + (N > RAMP0 ? 0.10 * (N - RAMP0) : 0);
  const postX = (i: number) => 132 + ((i * (POST_SPAN / POSTS) + postBase) % POST_SPAN);
  const envX = (i: number) => 148 + ((i * (ENV_SPAN / ENVS) + envBase) % ENV_SPAN);
  const edge = (u: number) => clamp01((u - LINE.x0) / 30) * clamp01((LINE.x1 - 18 - u) / 30);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 360, s: 1.05}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ——— 通话窗口回场（CallWin 同组件同参数，0.6× 居中 (640,300)；光环呼吸恢复） ——— */}
        {wn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: winOp, transform: `translateY(${winDy.toFixed(2)}px)`}}>
            <div style={{position: 'absolute', inset: 0, transform: 'translate(0px, -60px) scale(0.6)', transformOrigin: '640px 360px'}}>
              <CallWin N={N} glowK={glowOffK(N, TO, 6, 8)} />
            </div>
          </div>
        ) : null}

        {/* ——— 同一条线（y500） ——— */}
        {lineP > 0 ? <div style={{...abs(LINE.x0, LINE.y - 1, (LINE.x1 - LINE.x0) * lineP, 2), background: WHITE, opacity: 0.4, filter: BLOOM}} /> : null}
        {/* 10062 白亮重描（同一条线的强调） */}
        {wireP > 0 ? (
          <div style={{...abs(LINE.x0, LINE.y - 2, (LINE.x1 - LINE.x0) * wireP, 4), background: WHITE, borderRadius: 2, boxShadow: '0 0 14px 4px rgba(255,255,255,.4), 0 0 46px 14px rgba(161,117,241,.3)'}} />
        ) : null}

        {/* ——— 上半行：明信片队列（UDP 语音流）+ 橙点节拍 ——— */}
        <div style={{position: 'absolute', inset: 0, transform: pulseA === 1 ? undefined : `scale(${pulseA.toFixed(4)})`, transformOrigin: '640px 486px'}}>
          {Array.from({length: POSTS}, (_, i) => {
            const t0 = T_UDP + i * 2;
            const u = postX(i);
            const op = softOp(N - t0, 8) * edge(u);
            if (op <= 0.01) return null;
            return <PostcardIcon key={`p${i}`} cx={u} cy={POST_Y} w={74} h={48} opacity={op} />;
          })}
          {Array.from({length: DOTS}, (_, i) => {
            const t0 = T_UDP + i * 6;
            const dn = N - t0;
            if (dn < 0) return null;
            const u = postX(i) + 36;
            const drop = 9 * Math.pow(1 - clamp01(dn / 5), 2);
            const op = softOp(dn, 5) * edge(u) * 0.85;
            if (op <= 0.01) return null;
            return <div key={`d${i}`} style={{position: 'absolute', left: u - 4.5, top: DOT_Y - 4.5 - drop, width: 9, height: 9, borderRadius: 4.5, background: ORANGE, opacity: op, boxShadow: '0 0 8px 2px rgba(240,95,65,.5)'}} />;
          })}
          {N >= T_UDP ? (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_UDP, 8)}}>
              <Pill x={132} y={POST_Y - 19} w={86} h={38} fill="rgba(0,0,0,0.9)" stroke={ORANGE} sw={2.5} text="UDP" fontSize={24} weight={700} family={FONT_MONO} color={WHITE} />
            </div>
          ) : null}
        </div>

        {/* ——— 下半行：编号信封队列（TCP 照片流） ——— */}
        <div style={{position: 'absolute', inset: 0, transform: pulseB === 1 ? undefined : `scale(${pulseB.toFixed(4)})`, transformOrigin: '640px 528px'}}>
          {Array.from({length: ENVS}, (_, i) => {
            const t0 = T_TCP + i * 2;
            const u = envX(i);
            const op = softOp(N - t0, 8) * edge(u);
            if (op <= 0.01) return null;
            const stampN = N - (t0 + 4);
            const stS = stampN < 0 ? 0 : 1.4 - 0.4 * clamp01(stampN / 10);
            return (
              <div key={`e${i}`} style={{position: 'absolute', inset: 0, opacity: op}}>
                <PacketIcon cx={u} cy={ENV_Y} w={56} h={38} />
                {stampN >= 0 ? <SeqStamp cx={u + 18} cy={ENV_Y - 16} label={EXAMPLE.seqs[i % EXAMPLE.seqs.length]} size={24} scale={stS} glow /> : null}
              </div>
            );
          })}
          {N >= T_TCP ? (
            <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_TCP, 8)}}>
              <Pill x={132} y={ENV_Y - 19} w={86} h={38} fill="rgba(0,0,0,0.9)" stroke={PURPLE_LIGHT} sw={2.5} text="TCP" fontSize={24} weight={700} family={FONT_MONO} color={WHITE} />
            </div>
          ) : null}
        </div>

        {/* ——— same wire（线中央灰 Pill，队列从其后穿过） ——— */}
        {N >= T_WIRE + 6 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (T_WIRE + 6), 8)}}>
            <Pill x={640 - 74} y={LINE.y - 19} w={148} h={38} fill="rgba(0,0,0,0.92)" stroke={GREY_MID} sw={2} text="same wire" fontSize={24} weight={700} family={FONT_MONO} color={GREY_LIGHT} />
          </div>
        ) : null}

        {/* ——— two promises（线上方居中，呼应 SC10） ——— */}
        {N >= T_TWO ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_TWO, 8)}}>
            <Pill x={640 - 104} y={437} w={208} h={40} fill="rgba(0,0,0,0.92)" stroke={GREY_MID} sw={2} text="two promises" fontSize={26} weight={700} family={FONT_MONO} color={GREY_LIGHT} />
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
