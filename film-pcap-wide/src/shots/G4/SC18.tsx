import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, GlitchIn, easeOutCubic, FONT_ORB, FONT_TECH, FONT_MONO} from '../../common';
import {CText, MonoText, Pill, Svg, PacketIcon, mixHex, WHITE, PURPLE_LIGHT, GREY, GREY_LIGHT, abs, softOp, fadeIn, exitOp} from '../../ui';
import {CameraRig, Vignette} from '../../fx';

/**
 * SC18 抓包栈 · N 3697–4109（S22 3705–3951 + S23 3962–4107）
 * 四层栈（层宽 620、层高 78、层距 14，x 330–950，y 195–549）：
 *   L1 `Wireshark · tcpdump`（白边）→ L2 `libpcap`/`Npcap` 两 Pill（3844/3913 打字机 2 帧/字 + 白→紫边）→
 *   L3 `BPF · kernel`（4064 GlitchIn rgbSplit 6 本镜唯一 glitch + 整层变紫发光）→ L4 `hardware`（灰边 + 小 NIC 简笔）。
 * 右侧上行箭头：小信封自底向顶 3.5px/帧连续上行（持续动作）；4064–4094 推近 1→1.15 向 BPF 层（运镜清单 Ch2 第 3 处，段内镜头）。
 * 4064 右下灰小字 `Berkeley Packet Filter · 1992` SoftIn。停留：段内不判（分镜表 SC18 行）；末 8 帧归零。
 */
const F0 = 3697, TO = 4109;
const T_IN = 3705; // 底层先行 wipe，向上逐层 draw-on
const T_PULSE = 3751; // "small, old, brilliant" 全栈微脉冲
const T_LIBPCAP = 3844;
const T_NPCAP = 3913;
const T_KERNEL = 3962; // `kernel` 小标签
const T_CAM0 = 3980, T_CAM1 = 4013; // 33 帧推近 1→1.15 向 BPF 层（S23 首块 3962 后落定； glitch 前 ≥40 帧）
const T_BPF = 4058; // BPF GlitchIn + 变紫 + 白闪（beat 4064 −6 容差：保证末拍稳定期 ≥30）

const LAYERS = [195, 287, 379, 471];
const LX = 330, LW = 620, LH = 78, R = 10;
const ARROW = {x: 1035, y0: 530, y1: 250};
const ENV_TRIP = 80, ENV_CYCLE = 120, ENV_SPEED = 3.5; // 每层 20 帧 × 4 层

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 6);
  const layerP = (i: number) => easeOutCubic(clamp01((N - (T_IN + (3 - i) * 10)) / 14));
  const stackPulse = 1 + 0.02 * Math.sin(Math.PI * clamp01((N - T_PULSE) / 24));
  const bpfK = clamp01((N - T_BPF) / 11);
  const bpfStroke = mixHex(WHITE, PURPLE_LIGHT, bpfK);
  // BPF 层白闪（事件 6 帧）+ 紫柔光呼吸 ±15%（光要动）
  const flashK = N >= T_BPF && N < T_BPF + 6 ? [0.35, 0.28, 0.2, 0.14, 0.08, 0.04][N - T_BPF] : 0;
  const breathe = 1 + 0.15 * Math.sin((2 * Math.PI * N) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <CameraRig N={N} keys={[{f: T_CAM0, x: 620, y: 412, s: 1}, {f: T_CAM1, x: 620, y: 412, s: 1.15}]}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '620px 372px', transform: stackPulse === 1 ? undefined : `scale(${stackPulse.toFixed(4)})`}}>
          {/* 四层栈外框 draw-on（stroke-dashoffset，底层先行） */}
          <Svg>
            {LAYERS.map((y, i) => {
              const p = layerP(i);
              if (p <= 0) return null;
              const per = 2 * (LW + LH - 2 * R) + 2 * Math.PI * R;
              const stroke = i === 2 ? bpfStroke : i === 3 ? GREY : WHITE;
              return (
                <rect key={i} x={LX} y={y} width={LW} height={LH} rx={R} fill="#000" fillOpacity={0.9 * p}
                  stroke={stroke} strokeWidth={i === 2 && bpfK > 0 ? 3.5 : 2.5}
                  strokeDasharray={per} strokeDashoffset={per * (1 - p)}
                  style={i === 2 && bpfK > 0 ? {filter: `drop-shadow(0 0 12px rgba(102,48,248,${(0.75 * bpfK).toFixed(2)}))`} : undefined}
                />
              );
            })}
            {/* 右侧上行箭头 draw-on */}
            {(() => {
              const p = easeOutCubic(clamp01((N - (T_IN + 25)) / 20));
              if (p <= 0) return null;
              const yTip = ARROW.y0 + (ARROW.y1 - ARROW.y0) * p;
              return (
                <g opacity={0.9}>
                  <line x1={ARROW.x} y1={ARROW.y0} x2={ARROW.x} y2={Math.max(ARROW.y1 + 16, yTip)} stroke={GREY_LIGHT} strokeWidth={2.5} />
                  {p >= 1 ? <polygon points={`${ARROW.x},${ARROW.y1 - 10} ${ARROW.x - 9},${ARROW.y1 + 8} ${ARROW.x + 9},${ARROW.y1 + 8}`} fill={GREY_LIGHT} /> : null}
                </g>
              );
            })()}
          </Svg>

          {/* L1 工具层 */}
          {layerP(0) > 0 ? (
            <div style={{...abs(LX, LAYERS[0], LW, LH), opacity: softOp(N - (T_IN + 30), 8)}}>
              <CText cx={LX + LW / 2} cy={LAYERS[0] + LH / 2} size={34} weight={700} color={WHITE} letterSpacing={1}>Wireshark · tcpdump</CText>
            </div>
          ) : null}

          {/* L2 libpcap / Npcap（打字机 + 白→紫边 + 平台小字） */}
          {layerP(1) > 0 ? (
            <div style={{...abs(LX, LAYERS[1], LW, LH), opacity: softOp(N - (T_IN + 20), 8)}}>
              {([
                {x: 352, w: 180, t: T_LIBPCAP, text: 'libpcap', sub: 'Linux/macOS', subX: 546},
                {x: 690, w: 150, t: T_NPCAP, text: 'Npcap', sub: 'Windows', subX: 856},
              ] as const).map((p, i) => {
                const n = N - p.t;
                if (n < 0) return null;
                const shown = Math.floor(n / 2); // 2 帧/字
                const litK = clamp01((n - p.text.length * 2 - 2) / 8);
                return (
                  <div key={i}>
                    <Pill x={p.x} y={LAYERS[1] + 17} w={p.w} h={44} r={22} sw={2.5} stroke={mixHex(WHITE, PURPLE_LIGHT, litK)} fill="#000"
                      style={litK > 0 ? {boxShadow: `0 0 14px 4px rgba(102,48,248,${(0.5 * litK).toFixed(2)})`} : undefined}
                      text={<span style={{fontFamily: FONT_MONO, fontSize: 25, color: WHITE, whiteSpace: 'nowrap'}}>{p.text.slice(0, shown)}{shown < p.text.length ? '_' : ''}</span>} />
                    <MonoText x={p.subX} y={LAYERS[1] + 26} size={22} color={GREY_LIGHT} style={{opacity: 0.9 * clamp01((n - p.text.length * 2) / 8)}}>{p.sub}</MonoText>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* L3 BPF · kernel */}
          {layerP(2) > 0 ? (
            <div style={{...abs(LX, LAYERS[2], LW, LH), opacity: softOp(N - (T_IN + 10), 8)}}>
              {/* 变紫发光：整层紫叠加 + 白闪（叠在 svg 之后，盖不到先画的边框） */}
              {bpfK > 0 ? (
                <div style={{position: 'absolute', inset: 0, borderRadius: R, background: `rgba(102,48,248,${(0.16 * bpfK).toFixed(3)})`, boxShadow: `0 0 ${(14 * bpfK * breathe).toFixed(1)}px ${(5 * bpfK * breathe).toFixed(1)}px rgba(102,48,248,.6)`}} />
              ) : null}
              {flashK > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: R, background: `rgba(255,255,255,${flashK})`}} /> : null}
              {N < T_BPF ? (
                <CText cx={560} cy={LAYERS[2] + LH / 2} size={46} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={3}>BPF</CText>
              ) : (
                <GlitchIn N={N} f0={T_BPF} rgbSplit={6}>
                  <CText cx={560} cy={LAYERS[2] + LH / 2} size={46} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={3} shadow="0 0 18px rgba(102,48,248,.75)">BPF</CText>
                </GlitchIn>
              )}
              <div style={{...abs(624, LAYERS[2] + 24, 120, 32), opacity: softOp(N - T_KERNEL, 8) * 0.95, display: 'flex', justifyContent: 'center'}}>
                <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 22, color: GREY_LIGHT, lineHeight: '32px'}}>kernel</span>
              </div>
            </div>
          ) : null}

          {/* L4 hardware（灰边 + 小 NIC 简笔） */}
          {layerP(3) > 0 ? (
            <div style={{...abs(LX, LAYERS[3], LW, LH), opacity: softOp(N - T_IN, 8)}}>
              <CText cx={560} cy={LAYERS[3] + LH / 2} size={28} weight={600} color={GREY_LIGHT}>hardware</CText>
              <svg width={130} height={54} viewBox="0 0 130 54" style={{position: 'absolute', left: 700, top: 12}}>
                <rect x="1.5" y="1.5" width="127" height="51" fill="#000" stroke={GREY} strokeWidth={2} rx={4} />
                <rect x="44" y="14" width="40" height="26" fill="#000" stroke={GREY_LIGHT} strokeWidth={2} />
                {Array.from({length: 6}, (_, k) => <rect key={k} x={10 + k * 18} y={20} width={10} height={4} fill={GREY} />)}
                <path d="M84,27 H118" stroke={GREY} strokeWidth={2} />
              </svg>
            </div>
          ) : null}

          {/* 右下出处小字（4064） */}
          <div style={{...abs(875, 572, 320, 28), opacity: softOp(N - T_BPF, 10) * 0.95, display: 'flex', justifyContent: 'center'}}>
            <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontSize: 22, color: GREY_LIGHT, lineHeight: '28px', whiteSpace: 'nowrap'}}>Berkeley Packet Filter · 1992</span>
          </div>

          {/* 上行信封流（持续动作：3.5px/帧） */}
          {[0, 1, 2].map((i) => {
            if (N < T_IN + 55 + i * 40) return null;
            const t = (N - (T_IN + 55) - i * 40) % ENV_CYCLE;
            if (t >= ENV_TRIP) return null;
            const y = ARROW.y0 - ENV_SPEED * t;
            const k = Math.min(clamp01(t / 4), clamp01((ENV_TRIP - t) / 6));
            return <PacketIcon key={i} cx={ARROW.x} cy={y} w={40} h={28} opacity={0.95 * k} />;
          })}
        </div>
      </CameraRig>
      <Vignette k={fadeIn(N - T_CAM0, 18) * op} />
    </div>
  );
};
