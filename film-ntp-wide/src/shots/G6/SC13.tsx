import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow, emphasisPulse, FONT_ORB, GlitchIn} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  ClockFace, CText, PersonIcon, PacketIcon, RackIcon, TechSub,
  PURPLE_LIGHT, GREY, WHITE,
  abs, softOp, firstOp, exitOp, glowOffK, scaleIn,
} from '../../ui';
import {RACKS, WorldDots, wpt} from './g6ui';

/**
 * SC13 志愿者池 · N 2662–2882（**高光时刻·论点型**；S25–S26：2685「Who runs all this?」/ 2722「Volunteers.」
 *   / 2758「A public pool, thousands of servers,」/ 2835「lending the internet their time.」；段内不判，S26 末块 46）
 * 画面：章首承接 SC12 大钟缩微左下角（秒针持续）；世界点阵简图（六大陆方点阵，CDN G2/SC05 模式）
 *   + 10 枚 RackIcon 微型定位点（4 波错峰亮起，各带涟漪 + 信号弧）+ 中央 PersonIcon「原来是人」一拍过渡；
 *   中央上方 `the pool`（Orbitron 52 白+紫描边，本镜唯一 glitch）+ 下方 `volunteers` 灰字。
 * 节拍：2685 问句灰字 / 2722 `volunteers` 前移强调 + 2731 一枚志愿点（人）先亮 /
 *   2758 世界图 draw-on（18f 扫描显现）+ 2761 `the pool` GlitchIn（rgbSplit 6，白名单；对齐 S26.c1 关键词，
 *   分镜表动效列的 2835 与其节拍列冲突，按节拍列对齐——详见 BUILD_NOTES）/
 *   2778–2816 十点位 4 波错峰亮起 + 各自涟漪一轮 / 2835 借出拍：`the pool` emphasisPulse + 全部信号弧同拍呼吸一轮
 *   + 3 枚小信封从点位向外飘（lending）→ 此后弧低幅同相呼吸（持续）。
 * 运镜：33f 1→1.15 推向世界图（2698–2731，问句阶段提前起——避开 GlitchIn 与错峰批次；末 key 2731 ≤ TO−50 ✓）。
 * 尾部：末动效拍 2835 落位 ~2855 ≤ TO−45=2837 的拍点 2835 ✓（pulse/arcs 均低幅）；
 *   glowOff 2871 / 离场 2877–2882（exitOp 5）。
 */

const F0 = 2662;
const TO = 2882;

// ---- 节拍（timeline S25–S26 字幕块起始；元素入场 −6…+3）----
const B_Q = 2685;      // who runs all this?
const B_VOL = 2722;    // Volunteers.
const B_PERSON = 2731; // 一枚志愿点先亮（人，相机落定帧）
const B_MAP = 2758;    // 世界图 draw-on（18f）
const B_POOL = 2761;   // the pool GlitchIn（S26.c1 关键词，+3）
const B_LEND = 2820;   // lending：pulse + 弧同拍一轮 + 小信封外飘（前挂+压短，保尾部稳定期）
const WAVES = [2778, 2784, 2790, 2796]; // 4 波（3+3+2+2）

const EASE_OUT = easeOutCubic;
const EIO = easeInOutPow(2.2);

// 点位起始帧：波内 2f 错峰
const rackStart = (i: number) => WAVES[RACKS[i].w] + (i % 3) * 2;
const rackPos = (i: number) => wpt('full', RACKS[i].c);

// 2835 外飘小信封（lending the internet their time）
const LENDS: Array<{from: [number, number]; to: [number, number]}> = [
  {from: rackPos(0), to: [rackPos(0)[0] - 52, rackPos(0)[1] - 38]},
  {from: rackPos(7), to: [rackPos(7)[0] + 48, rackPos(7)[1] - 40]},
  {from: rackPos(9), to: [rackPos(9)[0] + 46, rackPos(9)[1] + 34]},
];

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 4);
  const gk = glowOffK(N, TO, 2, 4);

  // 世界图扫描显现（18f）
  const mapP = EASE_OUT(clamp01((N - B_MAP) / 18));
  const mapOp = firstOp(N - B_MAP, 6);

  // 章首承接：SC12 大钟缩微左下角（秒针持续走；2722「Volunteers.」回答后让位淡出）
  const miniOp = firstOp(N - F0, 6) * (1 - Math.pow(clamp01((N - 2718) / 26), 1.5));

  // PersonIcon（2731–2790：原来是人 → 被千台服务器取代）
  const personN = N - B_PERSON;
  const personOp = personN < 0 ? 0 : firstOp(personN, 6) * (1 - Math.pow(clamp01((N - 2772) / 18), 1.5));

  // 问句让位（the pool 到场前）
  const qFade = 1 - Math.pow(clamp01((N - 2748) / 12), 1.5);

  // 信号弧：入场 +6f；2835 前各自错相呼吸，2835 起同拍一轮 + 同相低幅呼吸（"agreeing"）
  const arcRound = (N - B_LEND >= 0 && N - B_LEND < 16) ? Math.sin(Math.PI * clamp01((N - B_LEND) / 16)) : 0;
  const arcOp = (i: number, start: number) => {
    const base = 0.42 + 0.13 * Math.sin(N / 9 + (N < B_LEND ? i * 1.3 : 0.4));
    return clamp01((softOp(N - (start + 6), 6)) * (base + 0.38 * arcRound) * gk + 0.001);
  };

  return (
    <>
      <CameraRig
        N={N}
        keys={[
          {f: F0, x: 640, y: 360, s: 1},
          {f: 2698, x: 640, y: 360, s: 1},
          {f: 2731, x: 640, y: 415, s: 1.15},
        ]}
      >
        <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
          {/* ---- 世界点阵简图（六大陆方点阵，左→右扫描显现） ---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: mapOp}}>
            <WorldDots mode="full" revealP={mapP} />
          </div>

          {/* ---- 主角紫光（地图中心，人 → 池） ---- */}
          <GlowBlob cx={640} cy={424} r={150} N={N} k={softOp(N - B_MAP, 14) * gk} alpha={0.2} />

          {/* ---- 涟漪（每点位亮起时一轮，白） ---- */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {RACKS.map((_, i) => {
              const t = clamp01((N - rackStart(i)) / 14);
              if (t <= 0 || t >= 1) return null;
              const [x, y] = rackPos(i);
              return (
                <circle key={i} cx={x} cy={y} r={10 + 38 * EASE_OUT(t)} fill="none" stroke={WHITE}
                  strokeWidth={2.4 * (1 - t) + 0.5} opacity={(0.65 * (1 - t)).toFixed(3)} />
              );
            })}
          </svg>

          {/* ---- 10 枚 RackIcon 微型定位点（4 波 2f 错峰缩入；点位紫） ---- */}
          {RACKS.map((_, i) => {
            const st = rackStart(i);
            const n = N - st;
            if (n < 0) return null;
            const [x, y] = rackPos(i);
            const s = scaleIn(n, 14);
            return (
              <div key={i} style={{...abs(x - 16, y - 25, 32, 50), opacity: softOp(n, 5), transform: `scale(${s.toFixed(4)})`, transformOrigin: '16px 25px'}}>
                <RackIcon cx={16} cy={25} w={30} h={46} units={3} lit={3} sw={2.2} label={undefined} />
              </div>
            );
          })}

          {/* ---- 点位紫光（低幅呼吸） + 信号弧（各点位右上） ---- */}
          {RACKS.map((_, i) => {
            const st = rackStart(i);
            if (N < st) return null;
            const [x, y] = rackPos(i);
            return <GlowBlob key={i} cx={x} cy={y} r={34} N={N} k={softOp(N - st, 10) * gk} alpha={0.22} />;
          })}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {RACKS.map((_, i) => {
              const st = rackStart(i);
              if (N < st + 6) return null;
              const [x, y] = rackPos(i);
              const op = arcOp(i, st);
              const sc = 1 + 0.12 * arcRound;
              return (
                <g key={i} transform={`translate(${x + 18} ${y - 30}) scale(${sc.toFixed(3)})`} stroke={PURPLE_LIGHT} strokeWidth={2} fill="none" strokeLinecap="round" opacity={op.toFixed(3)}>
                  <path d="M -7 5 A 8 8 0 0 1 7 5" />
                  <path d="M -12 10 A 13 13 0 0 1 12 10" />
                  <circle cx={0} cy={8} r={2} fill={PURPLE_LIGHT} stroke="none" />
                </g>
              );
            })}
          </svg>

          {/* ---- 2835 lending：3 枚小信封从点位向外飘（借出时间） ---- */}
          {LENDS.map((l, i) => {
            const n = N - (B_LEND + i * 5);
            if (n < 0) return null;
            const t = EIO(clamp01(n / 18));
            const px = l.from[0] + (l.to[0] - l.from[0]) * t;
            const py = l.from[1] + (l.to[1] - l.from[1]) * t;
            const op = clamp01(n / 3) * (1 - clamp01((n - 12) / 7)) * gk;
            if (op <= 0.02) return null;
            return (
              <div key={i} style={{...abs(px - 15, py - 11, 30, 22), opacity: op}}>
                <PacketIcon cx={15} cy={11} w={30} h={22} accent glow={false} />
              </div>
            );
          })}

          {/* ---- 一枚志愿点先亮（2731 人 → 2790 被池取代） ---- */}
          {personOp > 0.01 ? (
            <div style={{...abs(640 - 33, 428 - 33, 66, 66), opacity: personOp, transform: `scale(${scaleIn(personN, 14).toFixed(4)})`, transformOrigin: '33px 33px'}}>
              <PersonIcon cx={33} cy={33} size={66} accent={PURPLE_LIGHT} glow />
            </div>
          ) : null}
        </div>
      </CameraRig>

      {/* ---- 屏幕空间文字层（不随运镜） ---- */}
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* 2685 问句（2748 让位） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_Q, 8) * qFade}}>
          <CText cx={640} cy={172} size={30} weight={600} color={GREY} letterSpacing={1}>who runs all this?</CText>
        </div>

        {/* 2722 volunteers（前移强调：slideUp + pulse；终态在 the pool 下方） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_VOL, 8)}}>
          <div style={{transform: `translateY(${(26 * Math.pow(1 - clamp01((N - B_VOL) / 16), 2.5)).toFixed(2)}px) scale(${emphasisPulse(N - B_VOL, {peak: 1.07, up: 4, hold: 2, down: 8})})`}}>
            <TechSub cx={640} cy={224} text="volunteers" size={30} />
          </div>
        </div>

        {/* 2761 the pool（Orbitron 52 白+紫描边；本镜唯一 glitch：rgbSplit 6，白名单高光词） */}
        <GlitchIn N={N} f0={B_POOL} rgbSplit={6} seed={13}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${emphasisPulse(N - B_LEND, {peak: 1.08, up: 4, hold: 3, down: 7})})`, transformOrigin: '640px 146px'}}>
            <CText
              cx={640}
              cy={146}
              size={52}
              weight={700}
              family={FONT_ORB}
              color={WHITE}
              letterSpacing={3}
              style={{
                WebkitTextStroke: '2.5px rgba(161,117,241,0.9)',
                paintOrder: 'stroke fill',
                textShadow: `0 0 22px rgba(102,48,248,${(0.55 * gk * (0.9 + 0.1 * Math.sin((2 * Math.PI * N) / 90))).toFixed(3)}), 0 0 58px rgba(102,48,248,${(0.35 * gk).toFixed(3)})`,
              }}
            >
              the pool
            </CText>
          </div>
        </GlitchIn>
      </div>

      {/* ---- 章首承接：SC12 大钟缩微左下角（屏幕空间，秒针持续） ---- */}
      {miniOp > 0.01 ? (
        <div style={{...abs(0, 0, 1280, 720), opacity: miniOp}}>
          <ClockFace cx={165} cy={505} r={44} N={N} glow />
        </div>
      ) : null}
    </>
  );
};
