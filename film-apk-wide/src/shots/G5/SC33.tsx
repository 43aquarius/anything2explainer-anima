import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, kf, powIn, BEZ_SCALE_IN, FONT_MONO, FONT_ORB} from '../../common';
import {CText, Cross, PhoneMock, GREY, ORANGE, LineArrow, exitOp, firstOp, glowOffK, softOp} from '../../ui';
import {DGM, ByteGlyph, ShockRing, CrackPath} from './g5ui';
import {ZipDiagram} from './g5bui';

/**
 * SC33 改一个字节 · N 4820–4911（S33 4828–4909：4828 改一个字节 / 4873 安装就死）
 * 承接 SC32 末态结构图（ZipDiagram 同参数：让位后布局 + 完整弧 + 标题，4819|4820 组界一致）→ 16 帧缩到
 * 0.5× 移到左侧（中心 650,355→342,315，小字随缩微省略）；4828 红色字节方块自右上 kf 14 帧飞入文件块 →
 * 命中白闪 2 帧 + 红色冲击波两圈；4873 中缝红线 12 帧 draw-on（整图裂开）+ 大 `✕` Cross（红 64px）scaleIn +
 * `install denied`（橙 30px）打字机 + 结构图各块变暗 50% + 封印光熄灭；右下手机缩微（0.33×）屏上红 `✕`。
 * 末 8 帧归零。主角：红字节+裂图 ~220px；光：冲击波红 + Cross 红光呼吸。
 */
export const F0 = 4820;
const TO = 4911;
const B_BYTE = 4828, B_HIT = B_BYTE + 14, B_PHONE = 4846, B_DENY = 4873;

const SHRINK = {tx: -308, ty: -40, s: 0.5};
const HIT = {x: 111.5, y: 299}; // 缩微后文件块 1 中心（= 裂缝起点旁）
const BYTE_FROM = {x: 1040, y: 130};
const DENY_TXT = 'install denied';
const PHONE = {x: 880, y: 236, w: 78, h: 156};

export const SC33: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 承接缩位移：16 帧 1×→0.5× 左移（小字/标题/注解随缩微淡出）
  const e = easeInOutPow(2.5)(clamp01((N - F0) / 16));
  const s = 1 + (SHRINK.s - 1) * e;
  const tx = SHRINK.tx * e;
  const ty = SHRINK.ty * e;
  const smallFade = clamp01(1 - e * 2.6);

  // 拒装：整图变暗 + 封印光熄灭（12 帧）
  const denyK = clamp01((N - B_DENY) / 12);

  // 字节飞行（kf 14 帧 powIn 加速 + 尾迹）
  const bt = powIn(2)(clamp01((N - B_BYTE) / 14));
  const bx = BYTE_FROM.x + (HIT.x - BYTE_FROM.x) * bt;
  const by = BYTE_FROM.y + (HIT.y - BYTE_FROM.y) * bt;
  const trail = [1, 2, 3, 4, 5].map((k) => {
    const tk = powIn(2)(clamp01((N - B_BYTE - 2 * k) / 14));
    return {x: BYTE_FROM.x + (HIT.x - BYTE_FROM.x) * tk, y: BYTE_FROM.y + (HIT.y - BYTE_FROM.y) * tk, op: 0.55 - k * 0.09};
  });

  // 裂缝 / Cross / 拒装文字 / 手机红 ✕
  const crackP = clamp01((N - B_DENY) / 12);
  const crossS = kf(N, [[B_DENY, 0], [B_DENY + 12, 1]], BEZ_SCALE_IN);
  const crossOp = softOp(N - B_DENY, 6);
  const redPulse = 0.8 + 0.2 * Math.sin((2 * Math.PI * N) / 30);
  const chars = N < B_DENY ? 0 : Math.min(DENY_TXT.length, Math.floor((N - B_DENY) / 2) + 1);
  const phOp = softOp(N - B_PHONE, 8);
  const phX = clamp01((N - (B_DENY + 2)) / 8); // 手机屏红 ✕ draw-on
  const tintK = N < B_DENY ? 0 : Math.max(0.12, 0.3 - (N - B_DENY) * 0.018);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 承接的结构图（0.5× 缩微在左；弧线继续巡行；拒装后变暗 + 封印光熄灭） */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`, transformOrigin: '650px 355px', opacity: firstOp(N - F0, 6)}}>
        <ZipDiagram
          dxFiles={-5}
          dxCard={7}
          dxEocd={9}
          files={DGM.files.map(() => ({op: 1, s: 1, flash: 0}))}
          cardOp={1}
          eocdOp={1}
          connP={1}
          curveP={[1, 1, 1, 1]}
          labels={smallFade > 0.35}
          fileLabelOp={smallFade}
          arcLabelOp={smallFade}
          arcLabelScale={1}
          signDy={0}
          signOp={1}
          signGlow={Math.max(0, 0.9 + 0.25 * Math.sin((2 * Math.PI * (N - 4758)) / 30)) * (1 - denyK) * gk}
          dim={0.65 * denyK}
          arcP={1}
          arcMarch={Math.max(0, N - 4760)}
          arcOp={1 - 0.55 * denyK}
          arcGlow={(1 - denyK) * gk}
        />
        {/* SIGNING / BLOCK 标题（缩微淡出，无 glitch——本镜零 glitch） */}
        {smallFade > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: smallFade}}>
            <CText cx={DGM.signTitle.l1} cy={DGM.signTitle.y1} size={26} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2} dy={0}>
              SIGNING
            </CText>
            <CText cx={DGM.signTitle.l2} cy={DGM.signTitle.y2} size={26} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={4} dy={0}>
              BLOCK
            </CText>
          </div>
        ) : null}
        {/* 位置注解（SC32 常驻，随缩微淡出，保证 4819|4820 组界一致） */}
        {smallFade > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: smallFade}}>
            <LineArrow x0={612} y0={446} x1={545} y1={394} p={1} rodW={2.4} headL={16} headW={14} color={GREY} opacity={0.9} />
            <CText cx={615} cy={460} size={22} weight={600} family={FONT_MONO} color={GREY}>
              immediately before
            </CText>
            <CText cx={615} cy={492} size={22} weight={600} family={FONT_MONO} color={GREY}>
              the central directory
            </CText>
          </div>
        ) : null}
      </div>

      {/* 红字节（14 帧飞入 + 尾迹；命中后停在触点） */}
      {N >= B_BYTE ? <ByteGlyph x={bx} y={by} trail={trail} opacity={N >= B_HIT ? 1 : softOp(N - B_BYTE, 4)} /> : null}

      {/* 命中白闪 + 红色冲击波两圈 */}
      {N >= B_HIT && N < B_HIT + 3 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <circle cx={HIT.x} cy={HIT.y} r={14 + (N - B_HIT) * 14} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={1 - (N - B_HIT) * 0.33} />
        </svg>
      ) : null}
      <ShockRing N={N} t0={B_HIT} rMax={70} cx={HIT.x} cy={HIT.y} />
      <ShockRing N={N} t0={B_HIT + 3} rMax={115} cx={HIT.x} cy={HIT.y} />

      {/* 中缝红线（整图裂开，12 帧 draw-on） */}
      <CrackPath p={crackP} />

      {/* 大 ✕（红 64px，缩放入场 + 红光呼吸） */}
      {crossS > 0 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '342px 315px', transform: `scale(${crossS.toFixed(4)})`, opacity: crossOp, filter: `drop-shadow(0 0 ${(12 * redPulse).toFixed(1)}px rgba(236,8,31,.85))`}}>
          <Cross cx={342} cy={315} size={64} color={'#F16043'} sw={9} p={1} />
        </div>
      ) : null}

      {/* install denied（橙 30px，打字机） */}
      {chars > 0 ? (
        <CText cx={342} cy={448} size={30} weight={700} color={ORANGE} letterSpacing={1}>
          {DENY_TXT.slice(0, chars)}
        </CText>
      ) : null}

      {/* 右下：手机缩微（0.33×）屏上红 ✕ + 红屏 */}
      {phOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: phOp}}>
          <PhoneMock x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} iconN={0} />
          {tintK > 0 ? (
            <div style={{position: 'absolute', left: PHONE.x + 6, top: PHONE.y + 16, width: PHONE.w - 12, height: PHONE.h - 32, borderRadius: 10, background: `rgba(236,8,31,${(tintK * 0.55).toFixed(3)})`, pointerEvents: 'none'}} />
          ) : null}
          {phX > 0 ? (
            <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 8px rgba(236,8,31,.8))'}}>
              <Cross cx={PHONE.x + PHONE.w / 2} cy={PHONE.y + PHONE.h * 0.52} size={34} color={'#F16043'} sw={7} p={phX} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SC33;
