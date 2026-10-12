import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, GlitchIn, FONT_ORB} from '../../common';
import {CameraRig, GlowBlob} from '../../fx';
import {
  ClockFace, CText, Cross, GREY, GREY_MID, WHITE,
  abs, softOp, firstOp, scaleIn, mixHex,
} from '../../ui';

/**
 * SC15 没有完美钟 · N 3159–3360（S29–S30：3167「It isn't one perfect clock」/ 3211「ruling them all.」
 *   / 3247「It's thousands of ordinary ones,」/ 3307「checking each other — forever.」；段内不判，S30 末块 52）
 * 画面：中央王冠简笔（线框 + 顶球，draw-on）被红 Cross 盖掉并灰化下沉 → 王冠位置化为星点散开；
 *   四周环形排布 12 只小 ClockFace（N 驱动秒针，速率微差 0.92–1.07），彼此细线连成网（邻接 + 隔二弦）
 *   + 网上核对光点循环巡走（持续低幅）；环心 `checking each other` 灰字 / 下方 `no perfect clock` 灰字（本镜唯一 glitch）。
 * 节拍：3161 王冠 draw-on 14f + `no perfect clock` GlitchIn（rgbSplit 4，白名单；−6 提前保证首帧能量，
 *   拍点 ≤ TO−45=3315 ✓）/ 3211 `ruling them all` 灰字 SoftIn + Cross draw-on 10f + 王冠灰化下沉
 *   / 3247 王冠化星点散开（12 点飞向环位）+ 12 小钟 2f 错峰缩入（自然成 4 波）+ 各针开始走（速率微差，持续）
 *   / 3307 相互连线 draw-on 织网（24 条，0.4f 错峰 8f/条，~3321 完成）+ 核对光点循环巡走 + `checking each other` SoftIn。
 * 运镜：3247–3280 缓推 1.0→1.12 → 3280–3310 段末拉远 33f 1.12→1.0（终镜收束；末 key 3310 = TO−50 ✓）。
 * 尾部：钟环/网/巡走/两行灰字**保留到末帧**（承接 SC16 残环——motion hold 带 ~ 不判；末动效 ~3321）。
 * 零扫光；glitch 仅 `no perfect clock` 一处。
 */

const F0 = 3159;
const TO = 3360;

// ---- 节拍 ----
const B_NPC = 3161;   // 王冠 draw-on + no perfect clock GlitchIn（3167 −6）
const B_RULE = 3211;   // ruling them all + Cross + 王冠灰化下沉
const B_CLOCKS = 3247; // 王冠化星点 + 12 小钟错峰缩入
const B_NET = 3307;    // 织网 + 巡走光点 + checking each other

const EASE_OUT = easeOutCubic;

// ---- 钟环（12 只小钟，椭圆阵列；SC16 残环同款几何语汇） ----
const RING = {cx: 640, cy: 335, rx: 285, ry: 158, r: 46};
const clockAt = (i: number): [number, number] => {
  const a = ((-90 + i * 30) * Math.PI) / 180;
  return [RING.cx + RING.rx * Math.cos(a), RING.cy + RING.ry * Math.sin(a)];
};
const CLOCKS = Array.from({length: 12}, (_, i) => ({
  x: clockAt(i)[0], y: clockAt(i)[1], rate: 0.92 + i * 0.0135, t0: B_CLOCKS + i * 2,
}));

// ---- 网（邻接 12 + 隔二弦 12；端点从钟心向内缩 50px） ----
type Link = {a: [number, number]; b: [number, number]};
const LINKS: Link[] = [];
for (let i = 0; i < 12; i++) {
  [[1], [2]].forEach(([skip]) => {
    const p = clockAt(i);
    const q = clockAt((i + skip) % 12);
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const L = Math.hypot(dx, dy) || 1;
    LINKS.push({a: [p[0] + (dx / L) * 50, p[1] + (dy / L) * 50], b: [q[0] - (dx / L) * 50, q[1] - (dy / L) * 50]});
  });
}
const linkStart = (li: number) => B_NET + li * 0.4;

// ---- 巡走光点（6 枚，沿链循环；每 48f 换一条线，低幅持续） ----
const PATROL = Array.from({length: 6}, (_, j) => ({j, link: (j * 4) % 24}));

// ---- 王冠（中心 640,308；线框 + 顶球 + 宝石，单路径 draw-on） ----
const CROWN = {cx: 640, cy: 308, w: 156, h: 92};
const CROWN_PATH = 'M -78 22 L -78 52 L 78 52 L 78 22 L 52 22 L 44 -18 L 26 20 L 0 -34 L -26 20 L -44 -18 L -52 22 Z';

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 王冠：draw-on → 灰化下沉 → 化星点淡出
  const crownP = EASE_OUT(clamp01((N - B_NPC) / 14));
  const greyK = clamp01((N - B_RULE) / 10);                       // 3211 灰化
  const sinkY = 14 * easeOutCubic(clamp01((N - B_RULE) / 12));    // 下沉
  const crownOp = firstOp(N - B_NPC, 6) * (1 - clamp01((N - B_CLOCKS) / 16)); // 3247 化星点
  const crownCol = mixHex(WHITE, GREY_MID, greyK);

  // Cross：3211 draw-on 10f；随王冠一起退场
  const crossP = clamp01((N - B_RULE) / 10);
  const crossOp = 1 - clamp01((N - B_CLOCKS) / 16);

  // `ruling them all`：3211 入，钟群到场后让位
  const ruleFade = 1 - Math.pow(clamp01((N - 3255) / 20), 1.5);

  return (
    <>
      <CameraRig
        N={N}
        keys={[
          {f: F0, x: 640, y: 360, s: 1},
          {f: B_CLOCKS, x: 640, y: 360, s: 1},
          {f: 3280, x: 640, y: 352, s: 1.12},
          {f: 3310, x: 640, y: 360, s: 1},
        ]}
      >
        <div style={{...abs(0, 0, 1280, 720)}}>
          {/* ---- 环心微光（主角的光，低幅呼吸） ---- */}
          <GlowBlob cx={RING.cx} cy={RING.cy} r={170} N={N} k={softOp(N - B_CLOCKS, 16)} alpha={0.16} />

          {/* ---- 织网（24 条细线：邻接 + 隔二弦；0.4f 错峰 8f draw-on） ---- */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {LINKS.map((l, i) => {
              const p = EASE_OUT(clamp01((N - linkStart(i)) / 8));
              if (p <= 0) return null;
              const L = Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1]) || 1;
              return (
                <line key={i} x1={l.a[0]} y1={l.a[1]} x2={l.a[0] + ((l.b[0] - l.a[0]) / L) * L * p} y2={l.a[1] + ((l.b[1] - l.a[1]) / L) * L * p}
                  stroke={GREY_MID} strokeWidth={1.8} opacity={0.8} />
              );
            })}
          </svg>

          {/* ---- 12 只小钟（2f 错峰缩入；秒针速率微差持续走） ---- */}
          {CLOCKS.map((c, i) => {
            const n = N - c.t0;
            if (n < 0) return null;
            return (
              <div key={i} style={{...abs(c.x - RING.r, c.y - RING.r, RING.r * 2, RING.r * 2), opacity: softOp(n, 5), transform: `scale(${scaleIn(n, 14).toFixed(4)})`, transformOrigin: '50% 50%'}}>
                <ClockFace cx={RING.r} cy={RING.r} r={RING.r} N={N} rate={c.rate} />
              </div>
            );
          })}

          {/* ---- 王冠化星点（各钟位对应一颗，比钟早 6f 出发、早 6f 到达——星点落位即钟绽放） ---- */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {CLOCKS.map((c, i) => {
              const n = N - (c.t0 - 6);
              if (n < 0 || n > 26) return null;
              const t = EASE_OUT(clamp01(n / 16));
              const px = CROWN.cx + (c.x - CROWN.cx) * t;
              const py = CROWN.cy + (c.y - CROWN.cy) * t;
              return <circle key={i} cx={px.toFixed(1)} cy={py.toFixed(1)} r={3.4} fill={WHITE} opacity={(0.9 * (1 - clamp01((n - 10) / 16))).toFixed(3)} />;
            })}
          </svg>

          {/* ---- 巡走光点（网上核对，低幅循环） ---- */}
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
            {PATROL.map(({j}) => {
              if (N < B_NET) return null;
              const li = (j * 4 + Math.floor((N - B_NET) / 48)) % 24;
              const l = LINKS[li];
              const u = (((N - B_NET) / 85 + j * 0.37) % 1 + 1) % 1;
              const px = l.a[0] + (l.b[0] - l.a[0]) * u;
              const py = l.a[1] + (l.b[1] - l.a[1]) * u;
              return <circle key={j} cx={px.toFixed(1)} cy={py.toFixed(1)} r={4.2} fill={WHITE} opacity={0.85}
                style={{filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))'}} />;
            })}
          </svg>

          {/* ---- 王冠（线框 + 顶球 + 宝石；draw-on → 灰化下沉 → 化星点） ---- */}
          {crownOp > 0.01 ? (
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: crownOp, transform: `translateY(${sinkY.toFixed(1)}px)`}}>
              <g transform={`translate(${CROWN.cx} ${CROWN.cy})`} stroke={crownCol} strokeWidth={2.6} fill="#000" strokeLinejoin="round" strokeLinecap="round">
                <path d={CROWN_PATH} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - crownP)} />
                <circle cx={-44} cy={-24} r={5} fill="#000" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - (B_NPC + 10)) / 5))} />
                <circle cx={0} cy={-40} r={5} fill="#000" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - (B_NPC + 11)) / 5))} />
                <circle cx={44} cy={-24} r={5} fill="#000" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01((N - (B_NPC + 12)) / 5))} />
                <circle cx={-30} cy={37} r={3} fill={crownCol} stroke="none" opacity={crownP} />
                <circle cx={0} cy={37} r={3} fill={crownCol} stroke="none" opacity={crownP} />
                <circle cx={30} cy={37} r={3} fill={crownCol} stroke="none" opacity={crownP} />
              </g>
            </svg>
          ) : null}

          {/* ---- 红 Cross 盖冠（3211 draw-on 10f；随王冠退场） ---- */}
          {crossOp > 0.01 ? (
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', opacity: crossOp, transform: `translateY(${sinkY.toFixed(1)}px)`}}>
              <Cross cx={CROWN.cx} cy={CROWN.cy - 4} size={92} color="#F16043" sw={8} p={crossP} />
            </svg>
          ) : null}
        </div>
      </CameraRig>

      {/* ---- 屏幕空间文字层（不随运镜；保留到末帧承接 SC16） ---- */}
      <div style={{...abs(0, 0, 1280, 720)}}>
        {/* 3161：no perfect clock（灰 Orbitron 40；本镜唯一 glitch：rgbSplit 4，白名单） */}
        <GlitchIn N={N} f0={B_NPC} rgbSplit={4} seed={15}>
          <div style={{...abs(0, 0, 1280, 720)}}>
            <CText cx={640} cy={590} size={40} weight={700} family={FONT_ORB} color={GREY} letterSpacing={2}
              shadow="0 0 12px rgba(255,255,255,0.18)">no perfect clock</CText>
          </div>
        </GlitchIn>

        {/* 3211：ruling them all（3255 让位） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_RULE, 8) * ruleFade}}>
          <CText cx={640} cy={412} size={26} weight={500} color={GREY} letterSpacing={1}>ruling them all</CText>
        </div>

        {/* 3307：checking each other（环心） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_NET, 8)}}>
          <CText cx={640} cy={330} size={24} weight={500} color={GREY} letterSpacing={1}>checking each other</CText>
        </div>
      </div>
    </>
  );
};
