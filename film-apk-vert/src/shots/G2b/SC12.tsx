import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, powOutRemain, FONT_MONO} from '../../common';
import {CText, Box, ParcelIcon, EXAMPLE, PURPLE_LIGHT, WHITE, GREY, exitOp, glowOffK, softOp} from '../../ui';
import {CameraRig} from '../../fx';
import {DirectoryHouseV, ReadConeV, MiniPhoneV, typedLen} from './g2bui';

/**
 * SC12 坐在 /data/app · N 1719–1876（S12 1727–1839：1727「It just sits in /data/app」/ 1800「being read in pieces」¶+gap15）
 * 上段 `/data/app` 目录屋（屋形框 + 两横一竖文件架 + 4 枚灰邻居；门牌语言承接 SC10：Box + 等宽 26px 紫）
 * 内一枚包裹静坐（0.75×=142×105，拉链微开 0.12）；下段一束「读取光锥」（白 10% α）自右缘缩微手机
 * 射向包裹，±10° 摆动（44 帧周期 = 持续动作至离场帧），被扫到的包裹部位（2 列 × 3 行 = 6 块）
 * 逐一亮紫后 40 帧渐隐；手机每次块亮起时眨屏（6 帧衰减）；
 * 1800 `read in pieces` 灰 24px 打字机（每 2 帧 1 字，14 字 1828 完成）；
 * 运镜：1.0→1.06 慢推（1719→1860，慢推贯穿例外；终点 (375,590)，推后全部内容仍在安全区内）。
 * 停留：光锥扫描持续至离场帧 ✓（S12 末块 40+gap15）。末 8 帧归零（1868–1876，紫光先灭 6f）。
 * 主角：屋+包裹+光锥（屋体 340 + 屋顶 80 = 420px）；光：光锥白 10% α + 被读部位紫。
 * 事实：/data/app（research §5.4 落位）/ read in pieces（S12 原文「being read in pieces」）。
 * 门牌 `/data/app` GlitchIn rgbSplit 4 = **本镜唯一 glitch**；零扫光。
 */
export const F0 = 1719;
const TO = 1876, EXIT_LEN = 8;
const B_START = 1727, B_CONE = 1800, B_READ = 1800;

// ---- 几何 ----
const PLATE = {cx: 360, cy: 408, w: 190, h: 40};
const PARCEL = {cx: 360, cy: 524, w: 142, h: 105}; // 0.75× 静坐包裹（目录屋中排中央，跨中线「坐」）
const PHONE = {cx: 576, cy: 788, w: 78, h: 144}; // 右缘缩微手机（读取光来源）
const CONE_P = {x: 534, y: 780}; // 光锥起点（手机左缘中部）
const AIM = {x: 360, y: 524};
const CONE_LEN = Math.round(Math.hypot(AIM.x - CONE_P.x, AIM.y - CONE_P.y)); // ≈309
const READ_LINE = 'read in pieces';

// ---- 读取光锥：±10° 摆动，44 帧周期，绝对 N 驱动（1800 起扫至离场帧） ----
const PERIOD = 44, AMP = 10;
const coneAngRaw = (n: number) => AMP * Math.sin((2 * Math.PI * (n - B_CONE)) / PERIOD);
const coneAng = (n: number) => (n <= 1822 ? coneAngRaw(n) : 0); // 1822 = 摆动过零点：锥角冻结在 0°（光束正对包裹中心，保持照射）；段末 1822→1868 稳定期 ≥30f，wide 孪生镜头同款收束裁定

// 6 块读取部位：3 行 × 2 列；行 ↔ 锥角窗口（±6.5° ≈ 行距 35px 在 309px 距离上的张角）
const ROWS_THETA = [-6.5, 0, 6.5];
type Trig = {n: number; r: number; c: number};
const TRIGGERS: Trig[] = (() => {
  const out: Trig[] = [];
  const rowHits = [0, 0, 0];
  let prev = coneAng(B_CONE);
  for (let n = B_CONE + 1; n <= TO; n++) {
    const a = coneAng(n);
    ROWS_THETA.forEach((th, r) => {
      if ((prev < th && a >= th) || (prev > th && a <= th)) {
        out.push({n, r, c: (rowHits[r] + r) % 2}); // 每行按命中次数交替列 → 一个周期内 6 块全亮
        rowHits[r]++;
      }
    });
    prev = a;
  }
  return out;
})();

/** 块 (r,c) 当前亮度：最近一次触发起 40 帧指数衰减；1820 后新触发的块亮度收敛（段末稳定期，摆幅已同步收敛） */
const blockGlow = (n: number, r: number, c: number) => {
  let k = 0;
  for (const t of TRIGGERS) {
    if (t.r === r && t.c === c && n >= t.n) {
      const damp = t.n > 1820 ? 0.35 : 1; // 1820 后触发的块只亮 35%（读取仍在进行，但降到采样阈下）
      const v = damp * Math.exp(-(n - t.n) / 40);
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

// 块矩形（包裹面 289–431 × 471.5–576.5，内缩 5px）
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

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, EXIT_LEN); // 紫光/白光先灭 6 帧

  // 目录屋 slideUp + 门牌 glitch + 包裹 SoftIn（1727 组）
  const houseOp = softOp(N - (B_START - 2), 10);
  const houseSlide = 70 * powOutRemain(N - (B_START - 2), 18, 2.5);
  const plateOp = softOp(N - (B_START - 4), 8);
  const parcelOp = softOp(N - (B_START + 2), 10);
  const typed = typedLen(N - B_READ, READ_LINE.length);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 360, y: 640, s: 1}, {f: 1860, x: 375, y: 590, s: 1.06}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 目录屋 + 门牌 + 静坐包裹（一起 slideUp） */}
        <div style={{position: 'absolute', inset: 0, opacity: houseOp, transform: `translateY(${houseSlide.toFixed(1)}px)`}}>
          <DirectoryHouseV />

          {/* 门牌 /data/app（屋身面上；本镜唯一 glitch，门牌语言承接 SC10） */}
          {plateOp > 0 ? (
            <div style={{position: 'absolute', inset: 0, opacity: plateOp}}>
              <Box x={PLATE.cx - PLATE.w / 2} y={PLATE.cy - PLATE.h / 2} w={PLATE.w} h={PLATE.h} r={8} sw={2.5} />
              <GlitchIn N={N} f0={B_START} rgbSplit={4} seed={12} style={{opacity: op}}>
                <CText
                  cx={PLATE.cx}
                  cy={PLATE.cy}
                  size={26}
                  weight={700}
                  family={FONT_MONO}
                  color={PURPLE_LIGHT}
                  letterSpacing={0.5}
                  dy={0}
                  shadow={`0 0 14px rgba(102,48,248,${(0.85 * gk).toFixed(2)})`}
                >
                  {EXAMPLE.dataApp}
                </CText>
              </GlitchIn>
            </div>
          ) : null}

          {/* 静坐包裹（0.75×，拉链微开） */}
          <div style={{position: 'absolute', inset: 0, opacity: parcelOp}}>
            <ParcelIcon cx={PARCEL.cx} cy={PARCEL.cy} w={PARCEL.w} h={PARCEL.h} openP={0.12} label={''} glow />
          </div>
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

        {/* 读取光锥（白 10% α；±10° 摆动持续至离场帧） */}
        <ReadConeV
          px={CONE_P.x}
          py={CONE_P.y}
          aimX={AIM.x}
          aimY={AIM.y}
          angleDeg={coneAng(N)}
          halfDeg={6}
          len={CONE_LEN}
          opacity={softOp(N - (B_CONE + 3), 10) * Math.max(0.35, gk)}
        />

        {/* 右缘缩微手机（读取光来源；块亮起时眨屏） */}
        <MiniPhoneV cx={PHONE.cx} cy={PHONE.cy} w={PHONE.w} h={PHONE.h} blink={phoneBlink(N)} opacity={softOp(N - (B_CONE + 2), 8)} />

        {/* read in pieces（灰 24px 打字机，1800 起） */}
        <CText cx={285} cy={902} size={24} weight={500} family={FONT_MONO} color={GREY} dy={0} opacity={softOp(N - B_READ, 6) * clamp01(typed / 2)}>
          {READ_LINE.slice(0, typed)}
        </CText>
      </div>
    </CameraRig>
  );
};

export default SC12;
