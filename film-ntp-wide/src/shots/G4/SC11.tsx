import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, GlitchIn} from '../../common';
import {CameraRig} from '../../fx';
import {CText, EXAMPLE, WHITE, abs, exitOp, glowOffK, mix, softOp} from '../../ui';
import {ServerRing, RING} from './shared';

/**
 * SC11 信群众 · N 2164–2355（**高光时刻·论点型**；S20–S21：节拍 2172/2218/2264/2314）。
 * S20：2172「The trick: trust the ones」/ 2218「that agree with each other.」
 * S21：2264「The odd one out gets dropped.」/ 2314「The crowd keeps the time.」
 * 黑暗舞台：BG_G4 覆写 stars:'none'（2164–2355 点阵幕底整层关闭）+ 镜头内径向深色渐晕（非全屏纯黑 div）。
 * 版式：承接 SC10 环形（16f 缩微上移 1→0.85 @center (640,375)→(640,345)，首帧与 SC10 末帧逐像素一致——
 *   环不清场直通）；三台一致的（A/B/C）钟面亮紫（GlowBlob + 紫环，7f 错峰各 10f）+ 比对弧全亮；
 *   三钟读数滚动同步为 `12:00:00`（14f 内先后对齐，对齐帧 2232 三钟同拍白闪）；
 *   D 组灰化下沉（12f saturate→0.28 + 下移 38px）+ 红 Cross draw-on（10f）盖钟面 + D 连线 dissolve（10f）+ C–D 弧随压暗；
 *   下方大字 `the crowd keeps the time`（Noto 900 46 白 + 紫描边，GlitchIn rgbSplit 6，本镜唯一，白名单）。
 * 运镜：2164–2180 相机承接回落 1.12→1.0（吸收 SC10 推近，避免承接跳切；属承接不算运镜）→
 *   2180–2296 慢推 1.0→1.06（末 key 2296 ≤ TO−50=2305 ✓）。
 * 尾部：大字 2308 起（S21.c2 块起 2314 的 −6，GlitchIn 12f + emphasisPulse 12f → 2320 落定）；
 *   灭光 2347 / 离场 2350–2355。停留：段内不判（S21 末块 39——2314 拍点与 ≤TO−45=2310 冲突，
 *   大字前挂至 2308 后稳定期 ~24f，按分镜表「段内不判」处理，BUILD_NOTES 有记录）。
 */
const F0 = 2164;
const TO = 2355;

const B = {racks: 2013, lines: 2014, clocks: 2046, reads: 2094, arcs: 2134}; // 与 SC10 同组（入场已饱和）

const T_K3 = 2172;    // 三钟紫光点亮（S20.c1）
const T_SYNC = 2218;   // 三钟读数滚动同步（S20.c2）
const T_ALIGN = 2232;   // 对齐帧：三钟同拍白闪
const T_DROP = 2264;   // D 组灰化下沉 + Cross + 连线 dissolve（S21.c1）
const T_BIG = 2296;    // 大字 GlitchIn（S21.c2 2314 前挂，尾部稳定期优先）

const EIO = easeInOutPow(2.2);

/** 对齐白闪（3 帧冲顶 + 指数回落） */
const flashK = (N: number, f: number, life = 16): number => {
  const n = N - f;
  if (n < 0 || n > life) return 0;
  return n < 3 ? n / 3 : Math.exp(-(n - 3) / 4.5);
};

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 4);
  const gk = glowOffK(N, TO, 2, 4);

  // ---- 承接：环形缩微上移（16f，1→0.85 / center (640,375) → (640,345)）----
  const kk = EIO(clamp01((N - F0) / 16));
  const ringScale = mix(1, 0.85, kk);
  const ringTy = mix(0, -30, kk);

  // ---- 高光状态量 ----
  const k3 = clamp01((N - T_K3) / 26); // 三钟紫光（组内 7f 错峰）
  const arcLit = clamp01((N - (T_K3 + 6)) / 18); // 比对弧全亮
  const sync3 = clamp01((N - T_SYNC) / 14); // 读数滚动同步
  const flash3 = flashK(N, T_ALIGN) * gk; // 对齐白闪
  const dimD = clamp01((N - T_DROP) / 8); // D 灰化下沉（压缩）
  const crossP = clamp01((N - (T_DROP + 2)) / 8); // 红 Cross draw-on（压缩）
  const dissolveD = clamp01((N - T_DROP) / 10); // D 连线 dissolve

  // ---- 大字 emphasisPulse（与拍同帧起、≤14f 收尾）----
  const pulse = emphasisPulse(N - T_BIG, {peak: 1.1, up: 5, hold: 2, down: 5});
  // 大字紫晕（低幅呼吸 <1.5 diff）
  const bigGlow = softOp(N - T_BIG, 10) * gk * (0.9 + 0.1 * Math.sin((2 * Math.PI * N) / 90));

  return (
    <>
      {/* ---- 黑暗舞台径向渐晕（屏幕空间；非全屏纯黑 div）---- */}
      <div
        style={{
          ...abs(0, 0, 1280, 720),
          opacity: (softOp(N - F0, 16) * exit).toFixed(3),
          background: 'radial-gradient(ellipse 780px 500px at 50% 42%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      <CameraRig
        N={N}
        keys={[
          {f: F0, x: 640, y: 340, s: 1.12}, // 承接 SC10 推近末态（首帧无跳切）
          {f: 2180, x: 640, y: 352, s: 1.0}, // 承接回落（随环缩微上移同步）
          {f: 2296, x: 640, y: 350, s: 1.06}, // 慢推 1.0→1.06（末 key ≤ TO−50 ✓）
        ]}
      >
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 承接缩微上移的环主角组 ---- */}
          <div style={{...abs(0, 0, 1280, 720), transform: `translateY(${ringTy.toFixed(1)}px) scale(${ringScale.toFixed(4)})`, transformOrigin: `${RING.center[0]}px ${RING.center[1]}px`}}>
            <ServerRing N={N} B={B} k3={k3} sync3={sync3} flash3={flash3} dimD={dimD} crossP={crossP} arcLit={arcLit} dissolveD={dissolveD} glowK={gk} />
          </div>

          {/* ---- 下方大字 the crowd keeps the time（Noto 900 46 白 + 紫描边；本镜唯一 glitch，白名单）---- */}
          <GlitchIn N={N} f0={T_BIG} rgbSplit={6} seed={19}>
            <div style={{...abs(0, 0, 1280, 720), transform: `scale(${pulse.toFixed(4)})`, transformOrigin: '640px 565px'}}>
              <CText
                cx={640}
                cy={565}
                size={46}
                weight={900}
                color={WHITE}
                letterSpacing={1}
                style={{
                  WebkitTextStroke: '2.5px #A175F1',
                  paintOrder: 'stroke fill',
                  textShadow: `0 0 22px rgba(102,45,248,${(0.55 * bigGlow).toFixed(3)}), 0 0 58px rgba(102,45,248,${(0.35 * bigGlow).toFixed(3)})`,
                }}
              >
                the crowd keeps the time
              </CText>
            </div>
          </GlitchIn>
        </div>
      </CameraRig>
    </>
  );
};
