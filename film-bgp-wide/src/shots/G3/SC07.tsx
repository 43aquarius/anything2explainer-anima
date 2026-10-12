import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutPow, easeOutCubic, clamp01, rnd} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {AsChip, PacketIcon, MapFrame, ArrowH, CText, TechText, EXAMPLE, PURPLE_LIGHT, GREY, GREY_MID, GREY_LINE, WHITE, softOp, firstOp, exitOp, glowOffK, abs} from '../../ui';

/**
 * SC07 陌生人链条 · N 1447–1746（高光时刻·论点型；S11 1455/1536/1581 + S12 1633/1694；段内不判）
 * 画面：横向 5 枚 AsChip 一字排开（AS64512 → AS1299 → AS3356 → AS15169 → AS32934，chip 下 ①…⑤）
 *       + 四段箭头 + 一枚 PacketIcon 信封沿链逐跳飞（每跳 16 帧 + 到站灯亮/闪）；
 *       链条上方 AS_PATH 灰底条逐跳延长（AS1299 · AS3356 · AS15169）；
 *       1633 起 CameraRig 拉远 + 链条组缩到上半（sc 0.58 / ty −96），下方铺开 MapFrame，
 *       1694 起灰色链弧 3 波 draw-on 织网 + `the map draws itself`（Exo 2 紫斜体）+ 信封抵终点灯爆闪。
 * 运镜：1536 推 1→1.12（33f）→ 1633 拉远收束 1.12→1.0（33f）。
 * 停留：段内不判（S12 末块 51）；末 8 帧离场（1738–1746），1732 起先灭光。零 glitch（白名单）。
 */
const F0 = 1447;
const TO = 1746;

const CHIPS_X = [180, 410, 640, 870, 1100];
const CHIP_Y = 350;
const CHIP_S = 112; // chip 尺寸（半 56）
const ASNS = [EXAMPLE.asnYou, EXAMPLE.asnMid1, EXAMPLE.asnMid2, EXAMPLE.asnMid3, EXAMPLE.asnFb];
const IDX = ['\u2460', '\u2461', '\u2462', '\u2463', '\u2464'];

// ---- 节拍 ----
const B_CHIPS = 1449;  // c1−6：五芯片 3 帧错峰缩入
const B_LABELS = 1463; // ①…⑤ 错峰 SoftIn
const B_ARROWS = 1466; // 箭头段错峰 draw-on（16f）
const B_STRIP = 1495; // AS_PATH 灰底条滑入（此时只有前缀）
const B_ENV = 1528;   // 信封在源芯片亮出（起飞 1536）
const B_TRUST = 1581; // `each trusting the last` + 越环箭头白闪（1581 起的行为）
const B_PULL = 1633;  // 拉远 + 链条缩上半 + MapFrame draw-on（20f）
const B_MAP = 1694;   // 灰链弧 3 波织网 + `the map draws itself` + 信封抵终点爆闪

// 信封逐跳时刻（4 跳：起飞/到达）
const HOPS: Array<[number, number]> = [[1536, 1552], [1583, 1599], [1630, 1646], [1677, 1693]];
const ARRIVE = [1552, 1599, 1646, 1693]; // chips 1–4 亮灯 / 闪
const PATH_APPEND = [1552, 1599, 1646];  // AS_PATH 逐跳追加

const ENV_Y = 278;   // 信封停靠高度（落在 chip 顶 294 上）
const ARC = 46;      // 飞行弧高

// ---- AS_PATH 灰底条（mono 白 / 灰底；宽随条目增长）----
const STRIP_X = 360;
const STRIP_Y = 150;
const STRIP_H = 46;
const ENTRY_W = [89, 89, 104]; // 24px mono（0.62em 估）
const SEP_W = 45;
const ENTRY_X = [124, 258, 392];
const SEP_X = [213, 347];
const ENTRIES = [EXAMPLE.asnMid1, EXAMPLE.asnMid2, EXAMPLE.asnMid3];

// ---- 灰链弧网（MapFrame 内，frame-local 坐标）----
const NET_W = 760;
const NET_H = 288;
const NET_BOX = {x0: 45, y0: 34, x1: 715, y1: 254};
const WAVE_STARTS = [1694, 1706, 1718];
const chainWave = (i: number) => (i < 5 ? 0 : i < 9 ? 1 : 2);
const chainDelay = (i: number) => (i < 5 ? i : i < 9 ? i - 5 : i - 9) * 2;

const chainPts = (i: number): Array<[number, number]> => {
  const n = 3 + (i % 3 === 0 ? 1 : 0);
  return Array.from({length: n}, (_, j) => [
    NET_BOX.x0 + rnd(i * 7 + 1, j * 3 + 2) * (NET_BOX.x1 - NET_BOX.x0),
    NET_BOX.y0 + rnd(i * 7 + 2, j * 3 + 3) * (NET_BOX.y1 - NET_BOX.y0),
  ] as [number, number]);
};
const chainPath = (pts: Array<[number, number]>): string => {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let k = 1; k < pts.length; k++) {
    const [px, py] = pts[k - 1];
    const [cx, cy] = pts[k];
    const mx = (px + cx) / 2;
    const my = (py + cy) / 2;
    const dx = cx - px;
    const dy = cy - py;
    const L = Math.hypot(dx, dy) || 1;
    const off = (rnd(Math.round(pts[0][0] * 13) + k, k) - 0.5) * 56;
    const qx = mx + (-dy / L) * off;
    const qy = my + (dx / L) * off;
    d += ` Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
  }
  return d;
};
const CHAINS = Array.from({length: 13}, (_, i) => chainPath(chainPts(i)));
const CHAIN_PTS = Array.from({length: 13}, (_, i) => chainPts(i));

// 一次性衰减闪光（到站灯 / 箭头白闪）：3 帧冲顶 + 指数回落
const flashK = (N: number, f: number, life = 18): number => {
  const n = N - f;
  if (n < 0 || n > life) return 0;
  return n < 3 ? n / 3 : Math.exp(-(n - 3) / 5);
};

// 信封位置（跳与跳之间停靠在 chip 顶）；i = 当前所在跳序（0 基，-1 = 未起飞）
const envPos = (N: number): {x: number; y: number; t: number; hop: number} => {
  if (N < HOPS[0][0]) return {x: CHIPS_X[0], y: ENV_Y, t: 0, hop: -1};
  for (let i = 0; i < HOPS.length; i++) {
    const [d, a] = HOPS[i];
    if (N < a) {
      const t = easeOutCubic(clamp01((N - d) / (a - d)));
      return {x: CHIPS_X[i] + (CHIPS_X[i + 1] - CHIPS_X[i]) * t, y: ENV_Y - ARC * Math.sin(Math.PI * t), t, hop: i};
    }
    if (i < HOPS.length - 1 && N < HOPS[i + 1][0]) return {x: CHIPS_X[i + 1], y: ENV_Y, t: 1, hop: i};
  }
  return {x: CHIPS_X[4], y: ENV_Y, t: 1, hop: 3};
};

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // 拉远收束：链条组 33 帧 缩到上半（origin 640,350）
  const kPull = easeInOutPow(2.5)(clamp01((N - B_PULL) / 33));
  const gScale = 1 - 0.42 * kPull;
  const gTy = -96 * kPull;

  const EASE = easeOutCubic;
  const env = envPos(N);
  const envFly = env.t > 0 && env.t < 1 && N >= HOPS[0][0];
  // 信封抵终点：吸收（缩小淡出）
  const absorb = clamp01((N - 1693) / 12);
  const envOp = firstOp(N - B_ENV, 6) * (absorb > 0 ? 1 - Math.pow(absorb, 1.4) : 1);
  const envScale = 1 - 0.7 * absorb;
  const burst1 = clamp01((N - 1693) / 14);
  const burst2 = clamp01((N - 1699) / 14);

  // AS_PATH 条宽（追加瞬间 6 帧长出）
  let stripW = 140;
  for (let k = 0; k < 3; k++) {
    if (N >= PATH_APPEND[k]) stripW += (ENTRY_W[k] + (k < 2 ? SEP_W : 0)) * clamp01((N - PATH_APPEND[k]) / 6);
  }

  return (
    <CameraRig
      N={N}
      keys={[
        {f: F0, x: 640, y: 350, s: 1},
        {f: 1536, x: 640, y: 350, s: 1},
        {f: 1569, x: 640, y: 350, s: 1.12},
        {f: B_PULL, x: 640, y: 350, s: 1.12},
        {f: 1666, x: 640, y: 380, s: 1},
      ]}
    >
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* ---- 下半：地图（拉远后铺开）---- */}
        <GlowBlob cx={640} cy={476} r={215} N={N} k={softOp(N - 1656, 20) * gk} alpha={0.22} />
        <div
          style={{
            ...abs(0, 0, 1280, 720),
            clipPath: `inset(-8% ${(100 * (1 - EASE(clamp01((N - B_PULL) / 20)))).toFixed(2)}% -8% 0)`,
            opacity: firstOp(N - B_PULL, 6),
          }}
        >
          <MapFrame cx={640} cy={476} w={NET_W} h={NET_H} glow>
            <svg width={NET_W} height={NET_H} viewBox={`0 0 ${NET_W} ${NET_H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              {/* 灰色链弧：3 波 draw-on 织网（此后轻微呼吸 = 持续动作） */}
              {CHAINS.map((d, i) => {
                const p = EASE(clamp01((N - (WAVE_STARTS[chainWave(i)] + chainDelay(i))) / 16));
                if (p <= 0) return null;
                const breath = 0.5 + 0.13 * Math.sin((2 * Math.PI * (N + i * 11)) / 132);
                return (
                  <path
                    key={`ch-${i}`}
                    d={d}
                    fill="none"
                    stroke={GREY_MID}
                    strokeWidth={1.6}
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - p}
                    opacity={(0.85 * breath).toFixed(3)}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* 链弧端点小节点 */}
              {CHAIN_PTS.map((pts, i) => {
                const p = clamp01((N - (WAVE_STARTS[chainWave(i)] + chainDelay(i))) / 16);
                const op = softOp(N - (WAVE_STARTS[chainWave(i)] + chainDelay(i) + 10), 8);
                if (p < 1 || op <= 0) return null;
                return pts
                  .filter((_, j) => j === 0 || j === pts.length - 1)
                  .map((q, j) => <circle key={`nd-${i}-${j}`} cx={q[0]} cy={q[1]} r={2.5} fill={GREY_MID} opacity={0.55 * op} />);
              })}
            </svg>
          </MapFrame>
        </div>

        {/* ---- 论点行：the map draws itself（Exo 2 紫斜体）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_MAP, 10)}}>
          <TechText cx={640} cy={310} text="the map draws itself" fontSize={32} letterSpacing={2} />
        </div>

        {/* ---- 上半：链条组（拉远时缩到上半区）---- */}
        <div style={{...abs(0, 0, 1280, 720), transformOrigin: '640px 350px', transform: `translateY(${gTy.toFixed(2)}px) scale(${gScale.toFixed(4)})`}}>
          {/* 到站涟漪环 + 终点爆闪环 */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {ARRIVE.slice(0, 3).map((a, i) => {
              const p = clamp01((N - a) / 14);
              if (p <= 0 || p >= 1) return null;
              return (
                <circle
                  key={`rip-${i}`}
                  cx={CHIPS_X[i + 1]}
                  cy={CHIP_Y}
                  r={16 + 52 * p}
                  fill="none"
                  stroke={PURPLE_LIGHT}
                  strokeWidth={2.5 * (1 - p) + 0.5}
                  opacity={(0.8 * (1 - p)).toFixed(3)}
                />
              );
            })}
            {burst1 > 0 && burst1 < 1 ? (
              <circle cx={CHIPS_X[4]} cy={CHIP_Y} r={18 + 58 * burst1} fill="none" stroke={PURPLE_LIGHT} strokeWidth={3.5 * (1 - burst1) + 0.5} opacity={(0.95 * (1 - burst1)).toFixed(3)} style={{filter: 'drop-shadow(0 0 8px rgba(161,117,241,.8))'}} />
            ) : null}
            {burst2 > 0 && burst2 < 1 ? (
              <circle cx={CHIPS_X[4]} cy={CHIP_Y} r={10 + 40 * burst2} fill="none" stroke={WHITE} strokeWidth={2 * (1 - burst2) + 0.5} opacity={(0.7 * (1 - burst2)).toFixed(3)} />
            ) : null}
          </svg>

          {/* 源芯片脚下柔光（主角组的光） */}
          <GlowBlob cx={CHIPS_X[0]} cy={CHIP_Y} r={86} N={N} k={firstOp(N - B_CHIPS, 8) * gk} alpha={0.3} />

          {/* 四段箭头（灰→越过后白 + 白闪一次；filter 只挂在箭头盒上） */}
          {[0, 1, 2, 3].map((i) => {
            const p = EASE(clamp01((N - (B_ARROWS + i * 8)) / 16));
            if (p <= 0) return null;
            const mid = HOPS[i][0] + 8;
            const crossed = N >= mid;
            const fl = flashK(N, mid);
            return (
              <div key={`ar-${i}`} style={{...abs(244 + i * 230, CHIP_Y - 13.5, 102, 27), filter: fl > 0 ? `brightness(${(1 + 0.9 * fl).toFixed(3)}) drop-shadow(0 0 7px rgba(255,255,255,${(0.8 * fl).toFixed(3)}))` : undefined}}>
                <ArrowH x={0} y={0} w={102} h={27} p={p} color={crossed ? WHITE : GREY} shaft={3} />
              </div>
            );
          })}

          {/* 五枚 AsChip（错峰缩入；信封到站亮紫 + 闪） */}
          {CHIPS_X.map((cx, i) => {
            const n = N - (B_CHIPS + i * 3);
            if (n < 0) return null;
            const sc = 0.4 + 0.6 * EASE(clamp01(n / 14));
            const lit = i === 0 || N >= ARRIVE[i - 1];
            const fl = i === 0 ? 0 : flashK(N, ARRIVE[i - 1]);
            return (
              <div
                key={`chip-${i}`}
                style={{
                  ...abs(cx - CHIP_S / 2, CHIP_Y - CHIP_S / 2, CHIP_S, CHIP_S),
                  transform: `scale(${sc.toFixed(4)})`,
                  transformOrigin: '56px 56px',
                  filter: fl > 0 ? `brightness(${(1 + 0.85 * fl).toFixed(3)})` : undefined,
                }}
              >
                <AsChip cx={56} cy={56} w={CHIP_S} h={CHIP_S} asn={ASNS[i]} led={lit ? 'on' : 'off'} accent={lit} />
              </div>
            );
          })}

          {/* ①…⑤ 序号（拉远时淡出：缩小后字号不保） */}
          {CHIPS_X.map((cx, i) => {
            const op = softOp(N - (B_LABELS + i * 3), 8) * (1 - clamp01((N - B_PULL) / 16));
            if (op <= 0) return null;
            return (
              <div key={`lb-${i}`} style={{...abs(0, 0, 1280, 720), opacity: op}}>
                <CText cx={cx} cy={428} size={22} weight={500} color={GREY}>{IDX[i]}</CText>
              </div>
            );
          })}

          {/* 信封（紫 = 当前重点；残影两枚，只在飞行中） */}
          {envFly
            ? [-0.32, -0.16].map((dt, k) => {
                const t = clamp01(env.t + dt);
                const x = CHIPS_X[env.hop] + (CHIPS_X[env.hop + 1] - CHIPS_X[env.hop]) * t;
                const y = ENV_Y - ARC * Math.sin(Math.PI * t);
                return <PacketIcon key={`gh-${k}`} cx={x} cy={y} w={54} h={38} accent={false} opacity={0.26 - k * 0.12} scale={0.94} />;
              })
            : null}
          <div style={{...abs(env.x - 27, env.y - 19, 54, 38), opacity: envOp, transform: `scale(${envScale.toFixed(4)})`, transformOrigin: '27px 19px'}}>
            <PacketIcon cx={27} cy={19} w={54} h={38} accent glow />
          </div>
        </div>

        {/* ---- AS_PATH 灰底条（固定在上缘，mono 白，逐跳延长）---- */}
        <div
          style={{
            ...abs(STRIP_X, STRIP_Y, Math.max(140, stripW), STRIP_H),
            background: '#1d1d24',
            border: `1.5px solid ${GREY_LINE}`,
            borderRadius: 8,
            opacity: softOp(N - B_STRIP, 8),
            transform: `translateY(${(26 * Math.pow(1 - clamp01((N - B_STRIP) / 14), 2.5)).toFixed(2)}px)`,
            boxShadow: `0 0 18px rgba(102,45,248,${(0.18 * softOp(N - PATH_APPEND[0], 8) * gk).toFixed(3)})`,
          }}
        >
          <div style={{position: 'absolute', left: 16, top: 0, height: STRIP_H, lineHeight: `${STRIP_H}px`, fontFamily: "'JetBrains Mono','Fira Mono',monospace", fontSize: 22, color: GREY, whiteSpace: 'pre', letterSpacing: 0}}>AS_PATH</div>
          {ENTRIES.map((e, k) => {
            const op = softOp(N - PATH_APPEND[k], 6);
            if (op <= 0) return null;
            return (
              <div key={`en-${k}`} style={{position: 'absolute', left: ENTRY_X[k], top: 0, height: STRIP_H, lineHeight: `${STRIP_H}px`, fontFamily: "'JetBrains Mono','Fira Mono',monospace", fontSize: 24, color: WHITE, whiteSpace: 'pre', opacity: op, transform: `translateX(${((1 - op) * -10).toFixed(1)}px)`}}>
                {e}
              </div>
            );
          })}
          {[0, 1].map((k) => {
            const op = softOp(N - PATH_APPEND[k + 1], 6);
            if (op <= 0) return null;
            return (
              <div key={`sp-${k}`} style={{position: 'absolute', left: SEP_X[k], top: 0, height: STRIP_H, lineHeight: `${STRIP_H}px`, fontFamily: "'JetBrains Mono','Fira Mono',monospace", fontSize: 24, color: GREY_MID, whiteSpace: 'pre', opacity: 0.9 * op}}>
                {' \u00b7 '}
              </div>
            );
          })}
        </div>

        {/* ---- each trusting the last（灰字，拉远前淡出）---- */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_TRUST, 8) * (1 - Math.pow(clamp01((N - 1630) / 14), 1.5))}}>
          <CText cx={640} cy={500} size={24} weight={500} color={GREY} letterSpacing={1}>each trusting the last</CText>
        </div>
      </div>
    </CameraRig>
  );
};
