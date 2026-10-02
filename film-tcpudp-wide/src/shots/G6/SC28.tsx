import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, FONT_MONO} from '../../common';
import {
  Pill, GamepadIcon, Svg, abs, softOp, firstOp, exitOp, glowOffK, exitAccel, glowPurpleS, SoftIn,
  WHITE, GREY, GREY_MID, GREY_LINE, PURPLE, PURPLE_LIGHT, ORANGE,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * SC28 游戏同款 · N 6957–7181（S51 6965–7147 ¶+gap12；分镜表原 to 7149 为 ¶ 末句 to+2，
 * 已延到 SC29.from−1 = 7181 覆盖段末呼吸空白，同 G5/G7 组内约定，见 BUILD_NOTES）。
 * 节拍：6965 多人游戏同款选择 / 7046 此刻的位置 / 7079 比一秒前的位置 / 7105 更重要。
 * 画面：俯视小地图（x300–980, y210–530，白边 4×3 网格）；玩家三角沿椭圆环线匀速移动（2.2px/帧，
 *   弧长参数化）；每 60 帧在玩家当前位置留一枚半透明残影三角（灰，100 帧渐隐）；玩家上方两枚小 Pill：
 *   `now`（紫填充+白字+紫光）与 `1 s ago`（灰、半透明）；7105 灰删除线 12 帧划过 `1 s ago`
 *   + `now` emphasisPulse；右下 `ping` 延迟计（等宽 22px，数值每 30 帧滚动）。
 * 6965 同时：地图框 stroke draw-on 16 帧 + 网格逐行淡入 + 手柄 GamepadIcon（「multiplayer game」锚点，
 *   地图上方 (640,158)，配角 88px）。
 * 持续：玩家沿曲线移动（全镜）/ 残影逐枚生成渐隐 / ping 数值滚动。
 * 停留：末拍（删除线 7117 落定）后玩家持续移动至离场；末 8 帧归零（EXIT 7173）。零 glitch、零扫光、无运镜。
 * 主角：游戏地图+玩家（~320px）；光 = 地图 HeroGlow（0.32 低强度）+ 玩家三角紫 drop-shadow + `now` 紫光。
 */
const F0 = 6957;
const TO = 7181;
const T_MAP = 6965;    // S51 b1：地图框 wipe + 网格逐行 + 手柄
const T_PING = 6969;   // ping 延迟计起（每 30 帧滚动）
const T_PLAYER = 7046;  // S51 b2：玩家三角出现
const T_NOW = 7048;    // `now` Pill
const T_GHOST = 7079;  // S51 b3：残影三角起（每 60 帧一枚）
const T_AGO = 7080;    // `1 s ago` Pill
const T_STRIKE = 7105; // S51 b4：删除线 12 帧 + `now` emphasisPulse
const EXIT = TO - 8;   // 7173

const MAP = {x: 300, y: 210, w: 680, h: 320};
const COLS = 4, ROWS = 3;
const GX = (k: number) => MAP.x + (MAP.w / COLS) * k;
const GY = (m: number) => MAP.y + (MAP.h / ROWS) * m;

// —— 玩家路径：椭圆环线（弧长参数化 → 匀速），起点取左端点（θ=π），逆时针（屏幕坐标向上绕顶）——
const PATH = {cx: 640, cy: 372, rx: 240, ry: 80};
const SPEED = 2.2; // px/帧
const SAMPLES = 720;
const posAt = (t: number): [number, number] => [PATH.cx + PATH.rx * Math.cos(t), PATH.cy + PATH.ry * Math.sin(t)];
const TH: number[] = [];
const SL: number[] = [];
{
  let acc = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;
    TH.push(t);
    SL.push(acc);
    if (i < SAMPLES) {
      const [x0, y0] = posAt(t);
      const [x1, y1] = posAt(t + (Math.PI * 2) / SAMPLES);
      acc += Math.hypot(x1 - x0, y1 - y0);
    }
  }
}
const PERIM = SL[SAMPLES];
const S0 = PERIM / 2; // θ=π → 左端点 (400,372)
const posAtS = (s: number): [number, number] => {
  const u = ((s % PERIM) + PERIM) % PERIM;
  let lo = 0, hi = SAMPLES;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (SL[mid] < u) lo = mid + 1; else hi = mid;
  }
  const k = Math.max(1, lo);
  const f = (u - SL[k - 1]) / Math.max(1e-6, SL[k] - SL[k - 1]);
  return posAt(TH[k - 1] + (TH[k] - TH[k - 1]) * f);
};
const headingAt = (s: number): number => {
  const [xa, ya] = posAtS(s - 0.6);
  const [xb, yb] = posAtS(s + 0.6);
  return Math.atan2(yb - ya, xb - xa);
};
const sOf = (n: number) => S0 + SPEED * (n - T_PLAYER);

// 玩家/残影三角（局部坐标，指向 -y）
const TRI_D = 'M 0 -17 L 13 15 L 0 8 L -13 15 Z';
const triTransform = (p: [number, number], ang: number, sc: number) =>
  `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${((ang * 180) / Math.PI + 90).toFixed(1)}) scale(${sc})`;

// `now` / `1 s ago` Pills（跟随玩家上方，x 夹在地图内）
const NOW_PILL = {w: 78, h: 28};
const AGO_PILL = {w: 108, h: 28};
const pillRow = (px: number, py: number) => ({
  now: {cx: px - NOW_PILL.w / 2 - 6, cy: py},
  ago: {cx: px + 6 + AGO_PILL.w / 2, cy: py},
});

const PING_VALS = [24, 38, 29, 44, 31, 27]; // 延迟计示意值（ms，分镜表要求「数值小幅滚动」）

export const SC28: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const exDy = exitAccel(Math.max(0, N - EXIT), 0.12);
  const gk = glowOffK(N, TO);

  // —— 地图框 + 网格 ——
  const mapP = clamp01((N - T_MAP) / 16);
  const fillP = clamp01((N - (T_MAP + 4)) / 12);

  // —— 玩家 ——
  const pn = N - T_PLAYER;
  const pHere = pn >= 0 ? posAtS(sOf(N)) : null;
  const pScale = pn >= 0 ? 0.55 + 0.45 * easeInOutPow(2.2)(clamp01(pn / 10)) : 0;

  // —— Pills ——
  const pills = pHere ? pillRow(Math.min(872, Math.max(408, pHere[0])), pHere[1] - 50) : null;
  const nowPulse = emphasisPulse(N - T_STRIKE, {peak: 1.11, up: 13, hold: 4, down: 13});
  const strikeP = clamp01((N - T_STRIKE) / 12);

  // —— ping 延迟计 ——
  const pingN = N - T_PING;
  const cyc = pingN >= 0 ? Math.floor(pingN / 30) : -1;
  const ph = pingN >= 0 ? pingN % 30 : 0;
  const roll = ph < 6 ? 1 - Math.pow(1 - ph / 6, 2.5) : 1;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: exDy ? `translateY(${exDy.toFixed(1)}px)` : undefined}}>
      {/* 主角柔光（先灭光再淡出） */}
      <HeroGlow x={MAP.x} y={MAP.y} w={MAP.w} h={MAP.h} r={12} N={N} k={0.32 * gk * mapP} />

      {/* ============ 俯视小地图 ============ */}
      {mapP > 0 ? (
        <Svg>
          {/* 框（stroke draw-on 16 帧 + 黑底） */}
          <rect x={MAP.x + 1.5} y={MAP.y + 1.5} width={MAP.w - 3} height={MAP.h - 3} rx={8}
            fill="#000" fillOpacity={0.88 * fillP} stroke={WHITE} strokeWidth={3}
            pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - mapP)} />
          {/* 网格（逐行淡入：3 个横带，各含本带竖线段 + 带顶横线） */}
          {[0, 1, 2].map((m) => {
            const gOp = softOp(N - (T_MAP + 6 + m * 5), 10) * 0.85;
            if (gOp <= 0.01) return null;
            return (
              <g key={m} opacity={gOp} stroke={GREY_LINE} strokeWidth={1.5}>
                {[1, 2, 3].map((k) => (
                  <line key={k} x1={GX(k)} y1={GY(m) + 1} x2={GX(k)} y2={GY(m + 1) - 1} />
                ))}
                {m > 0 ? <line x1={MAP.x + 2} y1={GY(m)} x2={MAP.x + MAP.w - 2} y2={GY(m)} /> : null}
              </g>
            );
          })}
          {/* 残影三角（每 60 帧一枚，100 帧渐隐） */}
          {[0, 1, 2].map((k) => {
            const t0 = T_GHOST + k * 60;
            const gn = N - t0;
            if (gn < 0 || t0 < T_PLAYER) return null;
            const fade = 0.55 * (1 - clamp01(gn / 100));
            if (fade <= 0.01) return null;
            return (
              <path key={k} d={TRI_D} transform={triTransform(posAtS(sOf(t0)), headingAt(sOf(t0)), 0.92)}
                fill="none" stroke={GREY_MID} strokeWidth={2.5} strokeLinejoin="round" opacity={fade} />
            );
          })}
          {/* 玩家三角（白 + 紫光，指向运动方向） */}
          {pHere ? (
            <path d={TRI_D} transform={triTransform(pHere, headingAt(sOf(N)), pScale)}
              fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round"
              opacity={firstOp(pn, 6)}
              style={{filter: `drop-shadow(0 0 9px rgba(102,45,248,${(0.8 * gk).toFixed(2)}))`}} />
          ) : null}
        </Svg>
      ) : null}

      {/* 手柄（multiplayer game 锚点，地图上方；缩放入 14 帧） */}
      {N >= T_MAP ? (() => {
        const gn = N - T_MAP;
        const gs = 0.55 + 0.45 * easeInOutPow(2.2)(clamp01(gn / 14));
        return (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${gs.toFixed(3)})`, transformOrigin: '640px 158px', opacity: firstOp(gn, 6)}}>
            <GamepadIcon cx={640} cy={158} size={88} />
          </div>
        );
      })() : null}

      {/* `now` Pill（紫、亮；7105 emphasisPulse 同层包裹） */}
      {pills ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${nowPulse.toFixed(4)})`, transformOrigin: `${pills.now.cx}px ${pills.now.cy}px`}}>
          <SoftIn N={N} f0={T_NOW} len={6} dy={6}>
            <Pill x={pills.now.cx - NOW_PILL.w / 2} y={pills.now.cy - NOW_PILL.h / 2} w={NOW_PILL.w} h={NOW_PILL.h}
              fill={PURPLE} stroke={PURPLE_LIGHT} sw={2} glow={glowPurpleS(gk)}
              text="now" fontSize={22} weight={700} family={FONT_MONO} color={WHITE} textDy={0} />
          </SoftIn>
        </div>
      ) : null}

      {/* `1 s ago` Pill（灰、半透明）+ 7105 灰删除线划过 */}
      {pills ? (
        <SoftIn N={N} f0={T_AGO} len={6} dy={6} style={{opacity: 0.62}}>
          <Pill x={pills.ago.cx - AGO_PILL.w / 2} y={pills.ago.cy - AGO_PILL.h / 2} w={AGO_PILL.w} h={AGO_PILL.h}
            fill="#000" stroke={GREY_MID} sw={2}
            text="1 s ago" fontSize={22} weight={700} family={FONT_MONO} color={GREY} textDy={0} />
          {strikeP > 0 ? (
            <div style={{...abs(pills.ago.cx - AGO_PILL.w / 2 - 5, pills.ago.cy - 1.5, (AGO_PILL.w + 10) * strikeP, 3), background: GREY}} />
          ) : null}
        </SoftIn>
      ) : null}

      {/* 右下 ping 延迟计（等宽 22px，数值每 30 帧上滚换值） */}
      {cyc >= 0 ? (
        <div style={{...abs(MAP.x + 40, 490, MAP.w - 80, 32), fontFamily: FONT_MONO, fontSize: 22, lineHeight: 1.2, textAlign: 'right', whiteSpace: 'nowrap'}}>
          <span style={{color: GREY}}>ping&nbsp;·&nbsp;</span>
          <span style={{display: 'inline-block', color: ORANGE, transform: `translateY(${(7 * (1 - roll)).toFixed(1)}px)`, opacity: 0.35 + 0.65 * roll}}>{PING_VALS[cyc % PING_VALS.length]}</span>
          <span style={{color: GREY}}>&nbsp;ms</span>
        </div>
      ) : null}
    </div>
  );
};
