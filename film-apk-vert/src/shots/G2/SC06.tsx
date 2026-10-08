import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powIn, GlitchIn, easeInOutPow, FONT_MONO} from '../../common';
import {CText, Cross, ParcelIcon, WaxSeal, WHITE, GREY, PURPLE_LIGHT, RED_DEEP, abs, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {GlowBlob} from '../../fx';
import {ByteGlyphV, ShockRingV, CrackLineV, typedText} from './g2ui';

/**
 * SC06 改一字节就死 · N 954–1060（S06 962–1023 ¶+gap15：962 改一个字节 / 991 安装就死）
 * 承接 SC05 封印包裹（首帧复现：cx 360 cy 480 满态紫色描边 + 封印，随即 16 帧缩 0.7× 上移到 cy 380）；
 * 其下一条压缩字节链（y 560，9 格 46px）：962 一枚红字节 kf 14 帧飞入第 6 格 → 命中白闪 + 冲击波两圈；
 * 991 裂纹红线 draw-on（12 帧）+ 大 ✕（红 80px，18 帧落位 1009）+ `install dies`（橙 30px，dies 为本镜唯一
 * glitch rgbSplit 5）+ `install denied` 打字机 + 包裹与封印变暗 50%。末 8 帧归零。
 * 主角：红字节+裂链 ~260px；光：冲击波红 + 命中格红光脉冲（持续）。
 * 停留：✕ 落位 1009 / 打字机完成 ~1016 → 离场 1052，≥30 ✓。
 */
export const F0 = 954;
const TO = 1060;
const B_SHRINK = 954, B_CHAIN = 962, B_FLY = 963, B_CRACK = 991, B_CROSS = 991, B_DIES = 991, B_DENIED = 995;
const B_HIT = B_FLY + 14; // 977 命中
const HIT_I = 6; // 命中格（0..8）
const CELL = 46, GAP = 8, NCELL = 9;
const CHAIN_X0 = 360 - (NCELL * CELL + (NCELL - 1) * GAP) / 2; // 121
const HIT_X = CHAIN_X0 + HIT_I * (CELL + GAP) + CELL / 2; // 468
const FLY_FROM = {x: 610, y: 330};

const CRACK_PTS: Array<[number, number]> = [
  [CHAIN_X0 + 14, 566], [CHAIN_X0 + 74, 552], [CHAIN_X0 + 132, 570], [CHAIN_X0 + 196, 550],
  [HIT_X, 572], [HIT_X + 62, 548], [HIT_X + 124, 568], [HIT_X + 182, 552], [CHAIN_X0 + NCELL * (CELL + GAP) - 18, 562],
];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6, 8);

  // 承接：封印包裹 16 帧缩 0.7× 上移（首帧 = SC05 末态的屏幕观感 scale 1.12 → 0.7）
  const sk = easeInOutPow(2.5)(clamp01((N - B_SHRINK) / 16));
  const gScale = 1.12 + (0.7 - 1.12) * sk;
  const gCy = 480 + (380 - 480) * sk;
  const gOp = firstOp(N - B_SHRINK, 6);
  // 991 起包裹与封印变暗 50%
  const dimK = kf(N, [[B_CRACK, 1], [B_CRACK + 12, 0.5]]);
  // 封印光：呼吸 * 变暗 * 离场先灭
  const breathe = 0.55 + 0.25 * Math.sin((2 * Math.PI * N) / 30);
  const blobK = gOp * breathe * dimK * gk;
  const blobR = kf(N, [[B_SHRINK, 168], [B_SHRINK + 16, 105]]);

  // 红字节飞行（963–977，powIn 加速撞入）+ 尾迹
  const ft = clamp01((N - B_FLY) / 14);
  const fe = powIn(1.7)(ft);
  const bx = FLY_FROM.x + (HIT_X - FLY_FROM.x) * fe;
  const by = FLY_FROM.y + (560 - FLY_FROM.y) * fe;
  const trail = [0.09, 0.18, 0.27].map((d, i) => {
    const e2 = powIn(1.7)(clamp01(ft - d));
    return {x: FLY_FROM.x + (HIT_X - FLY_FROM.x) * e2, y: FLY_FROM.y + (560 - FLY_FROM.y) * e2, op: 0.85 - i * 0.22};
  });
  const flying = N >= B_FLY && N < B_HIT;

  // 命中白闪 2 帧 + 命中格红光脉冲（持续动作，错误态呼吸）
  const hitFlash = N >= B_HIT && N < B_HIT + 2 ? 1 - (N - B_HIT) * 0.45 : 0;
  const settled = N >= B_HIT;
  const pulse = 0.5 + 0.5 * Math.sin((2 * Math.PI * (N - B_HIT)) / 30);

  // ✕：18 帧缩放落位（991 → 1009）
  const cn = N - B_CROSS;
  const crossS = cn < 0 ? 0 : 0.25 + 0.75 * (1 - Math.pow(1 - clamp01(cn / 18), 2.5));
  const crossOp = cn < 0 ? 0 : softOp(cn, 6);

  // install denied 打字机
  const denied = typedText('install denied', N, B_DENIED, 1.5);
  const deniedW = denied.text.length * 26 * 0.6;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 封印包裹组（0.7× 缩上移，变暗 50%） */}
      <div style={{position: 'absolute', inset: 0, opacity: gOp * dimK}}>
        {blobK > 0.01 ? <GlowBlob cx={360} cy={gCy} r={blobR} N={N} k={blobK} alpha={0.38} /> : null}
        <ParcelIcon cx={360} cy={gCy} w={340} h={240} scale={gScale} color={PURPLE_LIGHT} label={''} />
        <WaxSeal cx={360} cy={gCy} r={120} scale={gScale} letter="v2" glow={false} />
      </div>

      {/* 字节链：9 格小方格（2 帧错峰 SoftIn） */}
      {Array.from({length: NCELL}, (_, i) => {
        const t = N - (B_CHAIN + i * 2);
        if (t < 0) return null;
        const isHit = i === HIT_I;
        const stroke = isHit && settled ? RED_DEEP : WHITE;
        return (
          <div key={i} style={{position: 'absolute', left: CHAIN_X0 + i * (CELL + GAP), top: 560 - CELL / 2, width: CELL, height: CELL, opacity: softOp(t, 6)}}>
            <svg width={CELL} height={CELL} viewBox={`0 0 ${CELL} ${CELL}`} style={{overflow: 'visible', filter: isHit && settled ? `drop-shadow(0 0 ${6 + 6 * pulse}px rgba(236,8,31,${(0.55 + 0.35 * pulse).toFixed(2)}))` : 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
              <rect x={1.5} y={1.5} width={CELL - 3} height={CELL - 3} rx={4} fill="#000" stroke={stroke} strokeWidth={2.5} opacity={isHit && settled ? 1 : 0.9} />
            </svg>
          </div>
        );
      })}

      {/* 红字节（飞行中带尾迹；命中后驻留命中格） */}
      {flying ? <ByteGlyphV x={bx} y={by} trail={trail} /> : null}
      {settled ? <ByteGlyphV x={HIT_X} y={560} opacity={1} /> : null}

      {/* 命中白闪（整链亮度） */}
      {hitFlash > 0 ? (
        <div style={{position: 'absolute', left: CHAIN_X0 - 6, top: 560 - CELL / 2 - 6, width: NCELL * (CELL + GAP) + 12, height: CELL + 12, background: WHITE, opacity: 0.35 * hitFlash, borderRadius: 6}} />
      ) : null}

      {/* 冲击波两圈 */}
      <ShockRingV N={N} t0={B_HIT + 1} rMax={80} cx={HIT_X} cy={560} />
      <ShockRingV N={N} t0={B_HIT + 5} rMax={56} cx={HIT_X} cy={560} />

      {/* 裂纹（红线 draw-on，991–1003） */}
      <CrackLineV pts={CRACK_PTS} p={clamp01((N - B_CRACK) / 12)} />

      {/* 大 ✕（红 80px，18 帧落位） */}
      {crossS > 0 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '360px 690px', transform: `scale(${crossS.toFixed(4)})`, opacity: crossOp}}>
          <svg width={720} height={1280} viewBox="0 0 720 1280" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <g filter="drop-shadow(0 0 10px rgba(236,8,31,.8))">
              <Cross cx={360} cy={690} size={80} color={RED_DEEP} sw={9} p={1} />
            </g>
          </svg>
        </div>
      ) : null}

      {/* install dies（橙 30px；dies = 本镜唯一 glitch rgbSplit 5） */}
      {N >= B_DIES ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - B_DIES, 8) * op}}>
          <CText cx={322} cy={790} size={30} weight={700} color="#F05F41" dy={0} letterSpacing={1}>install</CText>
        </div>
      ) : null}
      <GlitchIn N={N} f0={B_DIES + 1} rgbSplit={5} seed={6} style={{opacity: op}}>
        <CText cx={424} cy={790} size={30} weight={700} color="#F05F41" dy={0} letterSpacing={1}>dies</CText>
      </GlitchIn>

      {/* install denied（打字机 + 块光标；行随打字宽度居中生长） */}
      {N >= B_DENIED ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 843, height: 27, display: 'flex', justifyContent: 'center', opacity: op}}>
          <div style={{position: 'relative', width: 0, height: 0}}>
            <span style={{position: 'absolute', left: -deniedW / 2, top: 0, fontFamily: FONT_MONO, fontSize: 26, lineHeight: '27px', color: WHITE, whiteSpace: 'nowrap'}}>{denied.text}</span>
            {!denied.done ? (
              <span style={{position: 'absolute', left: deniedW / 2 + 3, top: 1, width: 12, height: 25, background: WHITE, opacity: N % 20 < 14 ? 0.9 : 0.15}} />
            ) : (
              <span style={{position: 'absolute', left: deniedW / 2 + 3, top: 1, width: 12, height: 25, background: WHITE, opacity: N % 26 < 19 ? 0.9 : 0.15}} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SC06;
