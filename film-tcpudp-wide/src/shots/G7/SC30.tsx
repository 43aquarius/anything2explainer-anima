import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, powOutRemain, FONT_HEAVY, FONT_MONO, FONT_WIDE} from '../../common';
import {
  CText, Pill, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, fadeIn, SoftIn, PacketIcon, PostcardIcon,
  WHITE, GREY, GREY_MID, PURPLE_LIGHT, ORANGE,
} from '../../ui';
import {HeroGlow} from '../../fx';
import {WebGlyph, BankGlyph, PhoneGlyph, MagnifierGlyph, GamepadLive, DocGlyphLive} from './g7ui';

/**
 * SC30 经验法则 · N 7487–7839（S54 7495 + S55 7537 + S56 7700–7817 ¶，扩展到 SC31.from−1=7839）
 * 节拍：7495 经验法则（两列头 Pill）｜7537 要每个字节→TCP（左列 4 行卡 + `need every byte`）
 *       ｜7571 每行图标 draw-on｜7700 要实时→UDP（右列 3 行卡 + `need it live`）｜7730 中央虚线 + 双列微脉冲对撞。
 * 版式：左右两列清单（各 340px 行卡，列心 x330/x950）：左 TCP（紫边头 Pill + envelope 吉祥物 + 4 行
 *       web pages/files/email/banking），右 UDP（橙边头 Pill + postcard 吉祥物 + 3 行 calls/games/lookups），
 *       中央竖直虚线分隔（7730 draw-on）。
 * 章界承接：C4 章节卡（覆盖层，末帧 7512 上出）→ 7487 明信片 + 编号信封出现在章节卡标题位 (640,372)
 *       （firstDash 首帧可见），kf 16 帧分别缩移到右列头（postcard→(1095,238)）/ 左列头（envelope→(185,238)），
 *       常驻为两列吉祥物（同元素两列对峙；覆盖层无此二元素可共坐标，近似承接，见 BUILD_NOTES）。
 * 持续（成片 v1 修复 tcpudp-wide-fix-C：微动作加大幅度并持续到离场帧）：
 *       ①网页行骨架线 22 帧交替闪（亮度 0.4↔0.9）②电话行振动环 ±6° 往复（24 帧周期）+ 弧线 24 帧亮灭
 *       ③手柄按键两圆点 30 帧轮流亮（+半径脉动）④银行四柱 8 帧一柱轮亮（亮柱加粗提亮）
 *       ⑤文档行折页角 40 帧翻动一次（DocGlyphLive，绕折线 scaleX）；
 *       另加行卡 1.0→1.015 错峰呼吸（30 帧周期，行错峰 7 帧，落位后起、持续到离场）补足组级阈值（低幅度脉冲，不新增元素）。
 *       列头紫/橙柔光 30 帧呼吸。
 * 停留：末元素（中央虚线 + 对撞脉冲）落位 7748 → 离场 7831（末 8 帧归零），≥30 ✓（S56 末块 88）。
 * 零 glitch（白名单外）；零扫光；无运镜（Ch4 运镜预算在 SC34/SC36，见分镜表运镜清单）。
 * 主角：双列清单组 y210–574（364px）；光 = 列头 TCP 紫 / UDP 橙（HeroGlow 呼吸）。
 */
const F0 = 7487;
const TO = 7839;
const T_MORPH = 7487;   // 章界承接 kf 起点（= 镜头首帧，章节卡尚在出画途中）
const T_HEAD = 7495;    // S54：两列头 Pill
const T_LROWS = 7537;   // S55 块1：左列 4 行卡 + need every byte
const T_LICON = 7571;   // S55 块2：左列图标 draw-on
const T_RROWS = 7700;   // S56 块1：右列 3 行卡 + need it live
const T_DIV = 7730;     // S56 块2：中央虚线 + 双列 1.02 微脉冲对撞
const EXIT = TO - 8;    // 7831

const L = {cx: 330, rowX: 160};   // 左列（行卡 x160–500）
const R = {cx: 950, rowX: 780};   // 右列（行卡 x780–1120）
const ROW_W = 340, ROW_H = 60;
const ROW_Y = [310, 378, 446, 514];
const HEAD = {y: 210, h: 56};    // 列头 Pill y210–266
const SUB_Y = 292;               // need every byte / need it live

const LROWS = [
  {kind: 'web', label: 'web pages'},
  {kind: 'doc', label: 'files'},
  {kind: 'mail', label: 'email'},
  {kind: 'bank', label: 'banking'},
] as const;
const RROWS = [
  {kind: 'phone', label: 'calls'},
  {kind: 'pad', label: 'games'},
  {kind: 'lens', label: 'lookups'},
] as const;

/** 承接首帧亮度（首帧可见，非 fadeIn(0)=0；floor 0.6） */
const firstDash = (n: number) => (n < 0 ? 0 : Math.min(1, 0.6 + 0.4 * clamp01(n / 6)));

export const SC30: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.22);
  const gk = glowOffK(N, TO);

  // —— 章界承接：postcard/envelope 自章节卡标题位 (640,372) kf 16 帧缩移到两列头 ——
  const mc = kf(N, [[T_MORPH, 0], [T_MORPH + 16, 1]], easeInOutPow(2.5));
  const morphOp = firstDash(N - T_MORPH);
  const envX = 640 + (185 - 640) * mc, envY = 372 + (238 - 372) * mc;
  const envW = 128 + (76 - 128) * mc, envH = 88 + (52 - 88) * mc;
  const pcX = 640 + (1095 - 640) * mc, pcY = 372 + (238 - 372) * mc;
  const pcW = 200 + (104 - 200) * mc, pcH = 136 + (70 - 136) * mc;

  // —— 列头 ——
  const headOp = softOp(N - T_HEAD, 8);
  const subLOp = softOp(N - T_LROWS, 8);
  const subROp = softOp(N - T_RROWS, 8);

  // —— 双列 1.02 微脉冲对撞（7730）：左列右移 +6px、右列左移 −6px（powOutRemain 回弹）——
  const colN = N - T_DIV;
  const pulse = colN >= 0 ? 1 + 0.02 * Math.sin(Math.PI * clamp01(colN / 26)) : 1;
  const nudge = colN >= 0 ? powOutRemain(colN, 14, 2.5) : 0;

  // —— 行卡 ——
  const rowIn = (t: number) => {
    const n = N - t;
    if (n < 0) return null;
    return {dy: 36 * powOutRemain(n, 22, 2.5), op: fadeIn(n, 6)};
  };
  // —— 行卡错峰呼吸（成片 v1 修复：落位后起 1.0→1.015、30 帧周期、每行错峰 7 帧，持续到离场）——
  const breathe = (n: number) => (n <= 0 ? 1 : 1 + 0.015 * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / 30)));

  // —— 左列图标 draw-on（7571+3i，21 帧缩放）——
  const liconIn = (i: number) => {
    const n = N - (T_LICON + 3 * i);
    return n < 0 ? 0 : Math.min(1, 0.3 + 0.7 * clamp01(n / 21));
  };
  // —— 右列图标随行卡（+4 帧）——
  const riconIn = (i: number) => {
    const n = N - (T_RROWS + 2 * i + 4);
    return n < 0 ? 0 : Math.min(1, 0.3 + 0.7 * clamp01(n / 21));
  };

  // —— 中央虚线 draw-on（12 帧）——
  const divP = clamp01((N - T_DIV) / 12);

  // —— 持续微动作相位 ——
  const phase = N;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* ===== 左列（TCP）===== */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(6 * nudge).toFixed(2)}px) scale(${pulse.toFixed(4)})`, transformOrigin: '330px 392px'}}>
        <HeroGlow x={L.cx - 92} y={HEAD.y} w={184} h={HEAD.h} r={28} N={N} k={headOp * gk} />
        <div style={{position: 'absolute', inset: 0, opacity: headOp}}>
          <Pill x={L.cx - 92} y={HEAD.y} w={184} h={HEAD.h} stroke={PURPLE_LIGHT} sw={2.5} fill="#000" r={28}
            text="TCP" fontSize={36} weight={400} family={FONT_WIDE} letterSpacing={4} />
        </div>
        <SoftIn N={N} f0={T_LROWS + 2}>
          <CText cx={L.cx} cy={SUB_Y} size={22} weight={500} family={FONT_MONO} color={GREY}>need every byte</CText>
        </SoftIn>
        {LROWS.map((r, i) => {
          const st = rowIn(T_LROWS + 2 * i);
          if (!st) return null;
          const br = breathe(N - (T_LROWS + 2 * i) - 26 - 7 * i);
          return (
            <div key={r.label} style={{position: 'absolute', inset: 0, opacity: st.op, transform: `translateY(${st.dy.toFixed(1)}px) scale(${br.toFixed(4)})`, transformOrigin: `${L.cx}px ${ROW_Y[i] + ROW_H / 2}px`}}>
              <div style={{...abs(L.rowX, ROW_Y[i], ROW_W, ROW_H), boxSizing: 'border-box', background: 'rgba(0,0,0,0.72)', border: `2px solid ${GREY_MID}`, borderRadius: 10}} />
              <div style={{...abs(L.rowX + 78, ROW_Y[i] + ROW_H / 2 - 14, 244, 28), fontFamily: FONT_HEAVY, fontSize: 27, fontWeight: 600, color: WHITE, lineHeight: '28px'}}>{r.label}</div>
              {r.kind === 'web' ? <WebGlyph cx={L.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} w={52} opacity={liconIn(0)} phase={phase} /> : null}
              {r.kind === 'doc' ? <DocGlyphLive x={L.rowX + 20} y={ROW_Y[i] + 9} w={44} h={42} lines={3} opacity={liconIn(1)} phase={phase} /> : null}
              {r.kind === 'mail' ? <PacketIcon cx={L.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} w={62} h={42} opacity={liconIn(2)} /> : null}
              {r.kind === 'bank' ? <BankGlyph cx={L.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} w={54} opacity={liconIn(3)} phase={phase} /> : null}
            </div>
          );
        })}
      </div>

      {/* ===== 右列（UDP）===== */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(-6 * nudge).toFixed(2)}px) scale(${pulse.toFixed(4)})`, transformOrigin: '950px 392px'}}>
        <HeroGlow x={R.cx - 92} y={HEAD.y} w={184} h={HEAD.h} r={28} N={N} k={headOp * gk} color={ORANGE} />
        <div style={{position: 'absolute', inset: 0, opacity: headOp}}>
          <Pill x={R.cx - 92} y={HEAD.y} w={184} h={HEAD.h} stroke={ORANGE} sw={2.5} fill="#000" r={28}
            text="UDP" fontSize={36} weight={400} family={FONT_WIDE} letterSpacing={4} />
        </div>
        <SoftIn N={N} f0={T_RROWS + 2}>
          <CText cx={R.cx} cy={SUB_Y} size={22} weight={500} family={FONT_MONO} color={GREY}>need it live</CText>
        </SoftIn>
        {RROWS.map((r, i) => {
          const st = rowIn(T_RROWS + 2 * i);
          if (!st) return null;
          const ringT = (((N - 7726) % 24) + 24) % 24 / 24;
          const ringRot = 6 * Math.sin((2 * Math.PI * N) / 24);
          const br = breathe(N - (T_RROWS + 2 * i) - 26 - 7 * i);
          return (
            <div key={r.label} style={{position: 'absolute', inset: 0, opacity: st.op, transform: `translateY(${st.dy.toFixed(1)}px) scale(${br.toFixed(4)})`, transformOrigin: `${R.cx}px ${ROW_Y[i] + ROW_H / 2}px`}}>
              <div style={{...abs(R.rowX, ROW_Y[i], ROW_W, ROW_H), boxSizing: 'border-box', background: 'rgba(0,0,0,0.72)', border: `2px solid ${GREY_MID}`, borderRadius: 10}} />
              <div style={{...abs(R.rowX + 78, ROW_Y[i] + ROW_H / 2 - 14, 244, 28), fontFamily: FONT_HEAVY, fontSize: 27, fontWeight: 600, color: WHITE, lineHeight: '28px'}}>{r.label}</div>
              {r.kind === 'phone' ? <PhoneGlyph cx={R.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} w={54} opacity={riconIn(0)} ringP={Math.sin(Math.PI * ringT)} rot={ringRot} /> : null}
              {r.kind === 'pad' ? <GamepadLive cx={R.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} size={56} opacity={riconIn(1)} phase={phase} /> : null}
              {r.kind === 'lens' ? <MagnifierGlyph cx={R.rowX + 42} cy={ROW_Y[i] + ROW_H / 2} w={52} opacity={riconIn(2)} dotP={0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 40)} /> : null}
            </div>
          );
        })}
      </div>

      {/* ===== 中央竖直虚线（7730 draw-on）===== */}
      {divP > 0 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0}}>
          <line x1={640} y1={206} x2={640} y2={576} stroke={GREY_MID} strokeWidth={2} strokeDasharray="7 7"
            pathLength={100} strokeDashoffset={100 * (1 - divP)} opacity={0.9} />
        </svg>
      ) : null}

      {/* ===== 章界承接：编号信封（→左列头）+ 明信片（→右列头），常驻两列吉祥物 ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: morphOp * (1 - clamp01((N - EXIT - 2) / 6))}}>
        <PacketIcon cx={envX} cy={envY} w={envW} h={envH} />
        <PostcardIcon cx={pcX} cy={pcY} w={pcW} h={pcH} />
      </div>
    </div>
  );
};
