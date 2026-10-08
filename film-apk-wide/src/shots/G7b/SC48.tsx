import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FONT_MONO} from '../../common';
import {CText, ParcelIcon, PURPLE_LIGHT, PURPLE_TECH, GREY, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {CameraRig} from '../../fx';
import {DirectoryHouse48, ReadCone, MiniPhone, typedLen} from './g7bui';

/**
 * SC48 ★坐在那里被阅读 · N 7117–7326（S48 7125–7259：7125「The zip is still sitting there in /data/app」/ 7221「being read in pieces」；¶+gap20）
 * 反转揭示（次高光，不扫光不 glitch）：左 /data/app 目录屋（承接 SC39 同款语言）内一枚包裹静坐
 * （0.63×，拉链齿微开 openP 0.15 + 底封 sealP 呼吸）；右缘缩微手机射出读取光锥（白 10% α），
 * ±12° 摆动（75 帧周期 = 2.5s），被扫到的包裹部位（箱面 6 块 = 2 列 × 3 行）逐一亮紫后 40 帧渐隐；
 * 7221 `read in pieces` 灰 24px 打字机（每 2 帧 1 字）；手机每次块亮起时眨屏（6 帧衰减）；
 * 运镜 1.0→1.06 慢推 130 帧（对准包裹）。
 * 停留（分镜表裁定）：末元素 = 光锥扫描持续动作至离场帧（S48 末块 39 + gap20）✓ —— 扫描/块亮/眨屏持续到离场，非静止收尾。
 * 章节卡 4 于 7262 起（S48.to+3=7262 → S49.from−9=7326）→ 内容 7253–7261 归零（末 8 帧，紫光先灭 6 帧），
 * 7262 起组件挂载但零输出（登记到 7326 = SC49.from−9，G2/SC10 同款处理）。
 * 事实：/data/app（research §6 落位）/ read in pieces（S48 原文「being read in pieces」）。零 glitch；无扫光。
 */
export const F0 = 7117;
const TO = 7326; // 登记末帧（= S49.from − 9；分镜表值）
const FADE_TO = 7261; // 内容实际归零点（章节卡 7262 起接管）
const EXIT_LEN = 8;
const B_START = 7125; // S48.c1「The zip is still sitting there in /data/app」
const B_READ = 7221; // S48.c2「being read in pieces」

// ---- 几何 ----
const PHONE = {cx: 1160, cy: 258, w: 92, h: 170};
const CONE_P = {x: 1110, y: 258}; // 光锥起点（手机左缘中部）
const PARCEL = {cx: 350, cy: 420, w: 190, h: 132}; // 0.63× 静坐包裹（目录屋中格，跨中线「坐」在中排）
const AIM = {x: 350, y: 420};
const CONE_LEN = Math.round(Math.hypot(CONE_P.x - AIM.x, CONE_P.y - AIM.y)); // ≈777

// ---- 读取光锥：±12° 摆动，75 帧周期（2.5s），绝对 N 驱动 ----
const PERIOD = 75;
const AMP = 12;
const coneAng = (n: number) => AMP * Math.sin((2 * Math.PI * (n - B_START)) / PERIOD);

// 6 块读取部位：3 行 × 2 列；行 ↔ 锥角窗口（±3.3° ≈ 行距 44px 在 777px 距离上的张角）
const ROWS_THETA = [-3.3, 0, 3.3];
type Trig = {n: number; r: number; c: number};
const TRIGGERS: Trig[] = (() => {
  const out: Trig[] = [];
  let prev = coneAng(F0);
  let halfSweeps = 0;
  for (let n = F0 + 1; n <= FADE_TO; n++) {
    const a = coneAng(n);
    if (prev <= 0 && a > 0) halfSweeps++; // 上行过零 = 新半摆（列交替）
    ROWS_THETA.forEach((th, r) => {
      if ((prev < th && a >= th) || (prev > th && a <= th)) out.push({n, r, c: (halfSweeps + r) % 2});
    });
    prev = a;
  }
  return out;
})();

/** 块 (r,c) 当前亮度：最近一次触发起 40 帧指数衰减 */
const blockGlow = (n: number, r: number, c: number) => {
  let k = 0;
  for (const t of TRIGGERS) {
    if (t.r === r && t.c === c && n >= t.n) {
      const v = Math.exp(-(n - t.n) / 40);
      if (v > k) k = v;
    }
  }
  return k;
};

/** 手机眨屏：任一块被触发后 6 帧内白闪衰减（「每发射一次眨一下」） */
const phoneBlink = (n: number) => {
  let k = 0;
  for (const t of TRIGGERS) {
    if (n >= t.n && n - t.n <= 6) k = Math.max(k, 1 - (n - t.n) / 6);
  }
  return k;
};

const READ_LINE = 'read in pieces';

// 块矩形（包裹面 255–445 × 354–486，内缩 4px）
const BLOCKS: Array<{r: number; c: number; x: number; y: number; w: number; h: number}> = [];
{
  const fx = PARCEL.cx - PARCEL.w / 2;
  const fy = PARCEL.cy - PARCEL.h / 2;
  const bw = PARCEL.w / 2 - 5;
  const bh = PARCEL.h / 3 - 5;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      BLOCKS.push({r, c, x: fx + c * (PARCEL.w / 2) + 2.5, y: fy + r * (PARCEL.h / 3) + 2.5, w: bw, h: bh});
    }
  }
}

export const SC48: React.FC = () => {
  const N = useCurrentFrame() + F0;
  if (N > FADE_TO) return null; // 章节卡 4（7262 起）接管；登记区间到 7326
  const op = exitOp(N, FADE_TO, EXIT_LEN);
  const gk = glowOffK(N, FADE_TO, 6, EXIT_LEN); // 紫光/白光先灭 6 帧
  const typed = typedLen(N - B_READ, READ_LINE.length);

  return (
    <CameraRig N={N} keys={[{f: B_START, x: 640, y: 360, s: 1}, {f: B_START + 130, x: 520, y: 400, s: 1.06}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 目录屋（承接 SC39 同款）+ 门牌 /data/app */}
        <div style={{opacity: firstOp(N - (B_START - 3), 12)}}>
          <DirectoryHouse48 />
        </div>
        <CText cx={350} cy={556} size={22} weight={500} family={FONT_MONO} color={PURPLE_TECH} dy={0} opacity={softOp(N - (B_START + 2), 8)}>/data/app</CText>

        {/* 静坐包裹（0.63×，拉链微开；微呼吸 ±1.5px 制造「坐」的活感） */}
        <div style={{opacity: softOp(N - (B_START + 1), 10)}}>
          <ParcelIcon
            cx={PARCEL.cx}
            cy={PARCEL.cy + 1.5 * Math.sin((2 * Math.PI * N) / 48)}
            w={PARCEL.w}
            h={PARCEL.h}
            openP={0.15}
            label={''}
            glow
          />
        </div>

        {/* 6 块读取部位：被锥扫到亮紫后渐隐（触发脉冲 = 边框闪 + 填充衰减） */}
        {BLOCKS.map((b, i) => {
          const k = blockGlow(N, b.r, b.c);
          if (k <= 0.01) return null;
          const flash = k > 0.86 ? (k - 0.86) / 0.14 : 0; // 触发瞬间边框微闪
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                background: `rgba(161,117,241,${(0.26 * k * gk).toFixed(3)})`,
                border: `1.5px solid rgba(161,117,241,${Math.min(1, (0.55 + 0.45 * flash) * k * gk).toFixed(3)})`,
                borderRadius: 3,
                boxShadow: flash > 0.05 ? `0 0 ${Math.round(8 * flash)}px rgba(161,117,241,${(0.5 * flash * gk).toFixed(2)})` : undefined,
              }}
            />
          );
        })}

        {/* 读取光锥（白 10% α；±12° 摆动持续至离场帧） */}
        <ReadCone
          px={CONE_P.x}
          py={CONE_P.y}
          aimX={AIM.x}
          aimY={AIM.y}
          angleDeg={coneAng(N)}
          halfDeg={6}
          len={CONE_LEN}
          opacity={softOp(N - (B_START + 3), 10) * Math.max(0.35, gk)}
        />

        {/* 右缘缩微手机（读取光来源；块亮起时眨屏） */}
        <MiniPhone cx={PHONE.cx} cy={PHONE.cy} w={PHONE.w} h={PHONE.h} blink={phoneBlink(N)} opacity={softOp(N - (B_START + 2), 8)} />

        {/* read in pieces（灰 24px 打字机，7221 起） */}
        <CText cx={640} cy={588} size={24} weight={500} family={FONT_MONO} color={GREY} opacity={softOp(N - B_READ, 6) * clamp01(typed / 2)}>
          {READ_LINE.slice(0, typed)}
        </CText>
      </div>
    </CameraRig>
  );
};
