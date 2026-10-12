import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, easeOutCubic, clamp01, emphasisPulse, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {AsChip, VoiceDot, CText, Cross, EXAMPLE, RED_DEEP, GREY, GREY_MID, GREY_LINE, WHITE, softOp, firstOp, exitOp, glowOffK, mixHex, abs} from '../../ui';

/**
 * SC08 没有老板 · N 1747–1886（S13 段末 ¶ 章末；节拍 1755/1822；TO=1886 停在 C3 章节卡 1887 前一帧）
 * 画面：中央空王座线框 + 顶上 `?` → 红 Cross 盖下 + 王座灰化 + `no boss` 大字 GlitchIn（本镜唯一）；
 *       四周虚线椭圆阵列 12 枚小 AsChip（各带 VoiceDot 涟漪错峰扩散）+ 下方灰字 `a hundred thousand voices agreeing`。
 * 停留：voices 落位 1822+8 → 末枚芯片 1848 落定 → 离场 1878（exitOp 8 帧，1872 起先灭光）→ hold 30f ✓。
 * 运镜：1.0→1.05 慢推贯穿（中心 640,360 → 640,385；慢推不进末拍例外）。
 */
const F0 = 1747;
const TO = 1886;

const B_THRONE = 1749; // c1−6：王座 draw-on（16f）
const B_Q = 1767;     // `?` 弹入
const B_CROSS = 1790;  // 红 Cross 盖下（12f）
const B_GREY = 1792;   // 王座灰化
const B_NOBOSS = 1798; // `no boss` GlitchIn（rgbSplit 4）
const B_PULSE = 1810;  // emphasisPulse
const B_RING = 1820;  // c2−2：12 枚环形芯片 2 帧错峰缩入（涟漪随落随起）
const B_VOICES = 1822; // 灰字 SoftIn

// 王座线框（stroke 3 白；pathLength 归一化做 draw-on）
const THRONE_PATHS: Array<{d: string; t0: number}> = [
  {d: 'M 600 288 V 200 Q 600 188 612 188 H 668 Q 680 188 680 200 V 288', t0: 0},
  {d: 'M 576 288 H 704', t0: 6},
  {d: 'M 582 288 V 386 M 698 288 V 386', t0: 8},
  {d: 'M 570 386 H 594 M 686 386 H 710', t0: 10},
  {d: 'M 614 208 V 272 M 666 208 V 272', t0: 10},
];

// 环形芯片阵列（虚线椭圆 rx 305 ry 146，中心 640,314；角度偏 15° 避开正上下，给 `?` 与大字留位）
const RING_CX = 640;
const RING_CY = 314;
const RING_RX = 305;
const RING_RY = 146;
const RING_ASNS = [EXAMPLE.asnMid1, EXAMPLE.asnMid2, EXAMPLE.asnMid3, EXAMPLE.asnSide, EXAMPLE.asnFb];
const ringXY = (i: number): [number, number] => {
  const a = ((15 + 30 * i) * Math.PI) / 180;
  return [RING_CX + RING_RX * Math.cos(a), RING_CY + RING_RY * Math.sin(a)];
};

const EASE = easeOutCubic;

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const ex = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  const greyK = clamp01((N - B_GREY) / 12); // 王座灰化
  const throneColor = mixHex(WHITE, GREY_MID, greyK);
  const qOp = softOp(N - B_Q, 6) * (1 - 0.7 * greyK); // Cross 落下后 ? 变淡
  const qScale = 0.3 + 0.7 * EASE(clamp01((N - B_Q) / 6));
  const crossP = clamp01((N - B_CROSS) / 12);
  const ringOp = softOp(N - B_RING, 12);

  const nb = softOp(N - B_NOBOSS, 8) * gk; // no boss 的紫光
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.08});

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: TO, x: 640, y: 385, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: ex}}>
        {/* 虚圈阵列（王座的"国会"） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible'}}>
          <ellipse cx={RING_CX} cy={RING_CY} rx={RING_RX} ry={RING_RY} fill="none" stroke={GREY_LINE} strokeWidth={1.5} strokeDasharray="5 9" opacity={0.45 * ringOp} />
        </svg>

        {/* 涟漪（先渲染，芯片盖住核心点） */}
        {Array.from({length: 12}, (_, i) => {
          const land = B_RING + i * 2 + 6;
          if (N < land) return null;
          const [x, y] = ringXY(i);
          return <VoiceDot key={`vd-${i}`} cx={x} cy={y} N={N - land} r={4} rings={2} speed={46} maxR={38} color={WHITE} opacity={0.75 * ex} glow={false} />;
        })}

        {/* 空王座（draw-on 16f；Cross 后灰化下沉） */}
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: `drop-shadow(0 0 3px rgba(255,255,255,${(0.35 * (1 - 0.5 * greyK) * gk).toFixed(3)}))`}}>
          <g stroke={throneColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - 0.4 * greyK}>
            {THRONE_PATHS.map((p, i) => {
              const pr = EASE(clamp01((N - (B_THRONE + p.t0)) / 10));
              if (pr <= 0) return null;
              return <path key={`th-${i}`} d={p.d} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - pr)} />;
            })}
          </g>
        </svg>

        {/* 王座顶上的 ?（Orbitron 灰；弹入，Cross 后转淡） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: qOp}}>
          <div style={{...abs(620, 136, 40, 44), transform: `scale(${qScale.toFixed(4)})`, transformOrigin: '20px 22px'}}>
            <CText cx={20} cy={22} size={44} weight={700} family={FONT_ORB} color={GREY}>?</CText>
          </div>
        </div>

        {/* 红 Cross 盖在王座上（draw-on 12f + 红柔光） */}
        {crossP > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{...abs(0, 0), overflow: 'visible', filter: `drop-shadow(0 0 ${Math.round(16 * gk)}px rgba(236,8,31,${(0.5 * gk).toFixed(3)}))`}}>
            <Cross cx={640} cy={288} size={88} sw={8} color={RED_DEEP} p={crossP} />
          </svg>
        ) : null}

        {/* 12 枚环形小 AsChip（2 帧错峰缩入；涟漪 = 声音） */}
        {Array.from({length: 12}, (_, i) => {
          const n = N - (B_RING + i * 2);
          if (n < 0) return null;
          const sc = 0.3 + 0.7 * EASE(clamp01(n / 6));
          const [x, y] = ringXY(i);
          return (
            <div key={`rc-${i}`} style={{...abs(x - 30, y - 30, 60, 60), transform: `scale(${sc.toFixed(4)})`, transformOrigin: '30px 30px'}}>
              <AsChip cx={30} cy={30} w={60} h={60} asn={RING_ASNS[i % 5]} led="off" labelSize={16} />
            </div>
          );
        })}

        {/* no boss（Noto 900 60 白 + 紫描边 + 紫光晕；本镜唯一 glitch） */}
        <GlitchIn N={N} f0={B_NOBOSS} rgbSplit={4} seed={11}>
          <div style={{...abs(0, 0, 1280, 720), transform: `scale(${pulse.toFixed(4)})`, transformOrigin: '640px 530px'}}>
            <CText
              cx={640}
              cy={530}
              size={60}
              weight={900}
              color={WHITE}
              letterSpacing={1}
              style={{
                WebkitTextStroke: '2.5px #A175F1',
                paintOrder: 'stroke fill',
                textShadow: `0 0 26px rgba(102,45,248,${(0.55 * nb).toFixed(3)}), 0 0 60px rgba(102,45,248,${(0.35 * nb).toFixed(3)})`,
              }}
            >
              no boss
            </CText>
          </div>
        </GlitchIn>

        {/* a hundred thousand voices agreeing（灰字） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: softOp(N - B_VOICES, 8)}}>
          <CText cx={640} cy={576} size={23} weight={500} color={GREY} letterSpacing={0.5}>a hundred thousand voices agreeing</CText>
        </div>
      </div>
    </CameraRig>
  );
};
