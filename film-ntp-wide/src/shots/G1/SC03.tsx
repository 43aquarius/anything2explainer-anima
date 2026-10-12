import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powOutRemain, BEZ_SCALE_IN, kf, FONT_MONO} from '../../common';
import {CameraRig, GlowBlob, HeroGlow} from '../../fx';
import {CText, SoftIn, Svg, Box, DocIcon, DBIcon, Check, Cross, GREY, GREY_MID, WHITE, GREEN, CORAL, PURPLE_LIGHT, abs, fadeIn, exitOp, glowOffK, glowPurpleS} from '../../ui';

/**
 * SC03 时刻窗口（555–789）。S06–S07：证书只在两个时刻之间有效 / 数据库记下不同顺序。
 * 节拍：563 证书卡 slideUp Δ80/16f + 时间轴 draw-on（16f，565 起）
 *       ｜575/581 两个刻度先后弹入（scaleIn 8f，标记先行；文字随 602 块出）
 *       ｜602 有效窗段亮起（12f wipe + 紫光）+ `not before`/`not after` SoftIn + 窗内时刻绿 Check（606 draw-on 10f）+ 窗外两 Cross（610/614 draw-on 8f）
 *       ｜676 DBIcon 缩入（14f）+ 三条记录条 2f 错峰 slideIn（678/680/682，Δ40/14f）
 *       ｜725（=731−6 容差）记录条 A↔B 交叉换位（9f 位移 + 9f 回弹落位，"两次交叉"压缩版）+ 733 互换白闪 + 灰注 SoftIn
 * 运镜：1.0→1.05 慢推（555–720，末 key ≤ TO−50 ✓，不进末拍）。停留：段内不判（末拍簇 725–743，安静窗 743→781=38f）。
 * 主角：双联图组 320px（窗段紫光；Cross 红；互换白闪）。零 glitch（白名单：SC03 无）、零扫光。
 */
const F0 = 555;
const TO = 789;

const CERT = {x: 160, y: 150, w: 200, h: 250}; // 左上：证书卡（DocIcon 放大 + 灰章）
const SEAL = {cx: 328, cy: 356, r: 26}; // 卡右下灰章
const TL = {x0: 120, x1: 580, y: 505, ta: 210, tb: 490}; // 卡下时间轴 + 两刻度
const DB = {cx: 940, cy: 212, w: 150, h: 160}; // 右上：数据库
const BARS = {x: 700, w: 480, h: 46, ys: [330, 396, 462]}; // 右下三条记录条
const NOTE = {cx: 940, cy: 540}; // 灰注

/** 记录条（swap 期间 y/x 由调用方算好传入） */
const RecBar: React.FC<{x: number; y: number; label: string; flash: number; opacity?: number}> = ({x, y, label, flash, opacity = 1}) => (
  <div style={{...abs(0, 0, 1280, 720), opacity}}>
    <Box x={x} y={y} w={BARS.w} h={BARS.h} r={8} sw={2.2} glow={flash > 0.01 ? `0 0 18px 6px rgba(255,255,255,${(0.55 * flash).toFixed(2)})` : undefined}>
      <div style={{position: 'absolute', left: 18, top: 9, fontFamily: FONT_MONO, fontSize: 24, color: WHITE, whiteSpace: 'nowrap'}}>{label}</div>
    </Box>
  </div>
);

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 5);
  const gOff = glowOffK(N, TO, 3, 5);

  // ---- 证书卡（563 slideUp Δ80/16f）----
  const cardOp = fadeIn(N - 563, 8);
  const cardDy = 80 * powOutRemain(N - 563, 16, 2.5);

  // ---- 时间轴（565 draw-on 16f；575/581 刻度弹入）----
  const tlP = clamp01((N - 565) / 16);
  const tlOp = fadeIn(N - 565, 6);
  const tickS = (f: number) => BEZ_SCALE_IN(clamp01((N - f) / 8));
  const tickOp = (f: number) => fadeIn(N - f, 5);

  // ---- 有效窗段（602 亮起 12f wipe + 紫光；此后低幅呼吸）----
  const winP = clamp01((N - 602) / 12);
  const winGlow = kf(N, [[602, 0], [612, 1]]) * gOff;
  const breathe = 0.93 + 0.07 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 60));

  // ---- DB + 记录条（676 / 678+2i 错峰）----
  const dbS = 0.6 + 0.4 * BEZ_SCALE_IN(clamp01((N - 676) / 14));
  const dbOp = fadeIn(N - 676, 6);
  const barDy = (i: number) => 40 * powOutRemain(N - (678 + 2 * i), 14, 2.5);
  const barOp = (i: number) => fadeIn(N - (678 + 2 * i), 6);

  // ---- A↔B 交叉换位（725 位移 9f → 735 回弹落位 9f；733 白闪）----
  const t1 = clamp01((N - 725) / 9);
  const yA = kf(N, [[725, BARS.ys[0]], [733, BARS.ys[1]], [735, BARS.ys[1]], [739, BARS.ys[1] + 6], [743, BARS.ys[1]]]);
  const yB = kf(N, [[725, BARS.ys[1]], [733, BARS.ys[0]], [735, BARS.ys[0]], [739, BARS.ys[0] - 6], [743, BARS.ys[0]]]);
  const bow = 38 * Math.sin(Math.PI * t1); // 换位途中横向错开（交叉感）
  const flash = kf(N, [[733, 0], [734, 0.9], [737, 0]]);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 720, x: 640, y: 360, s: 1.05}]}>
      <div style={abs(0, 0, 1280, 720)}>
        <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
          {/* ---- 左：证书卡 + 灰章（主角左翼：白描边 + 微白晕）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: cardOp, transform: `translateY(${cardDy.toFixed(1)}px)`}}>
            <HeroGlow x={CERT.x - 12} y={CERT.y - 10} w={CERT.w + 24} h={CERT.h + 20} r={16} N={N} k={0.4 * gOff} color="#FFFFFF" />
            <DocIcon x={CERT.x} y={CERT.y} w={CERT.w} h={CERT.h} lines={6} />
            <Svg bloom={false}>
              <g stroke={GREY_MID} fill="none">
                <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r} strokeWidth={2.5} />
                <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r - 8} strokeWidth={1.5} />
                {Array.from({length: 6}, (_, i) => {
                  const a = (i / 6) * Math.PI * 2;
                  return <line key={i} x1={SEAL.cx + Math.cos(a) * 4} y1={SEAL.cy + Math.sin(a) * 4} x2={SEAL.cx + Math.cos(a) * 11} y2={SEAL.cy + Math.sin(a) * 11} strokeWidth={1.6} />;
                })}
              </g>
            </Svg>
          </div>

          {/* ---- 左：时间轴（draw-on + 刻度 + 窗段 + 时刻标记）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: tlOp, clipPath: `inset(0 ${(100 - 100 * tlP).toFixed(1)}% 0 0)`}}>
            <Svg bloom={false}>
              <line x1={TL.x0} y1={TL.y} x2={TL.x1} y2={TL.y} stroke={GREY_MID} strokeWidth={2.5} />
            </Svg>
          </div>
          {tickOp(575) > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: tickOp(575), transform: `scale(${tickS(575).toFixed(3)})`, transformOrigin: `${TL.ta}px ${TL.y}px`}}>
              <Svg bloom={false}>
                <line x1={TL.ta} y1={TL.y - 10} x2={TL.ta} y2={TL.y + 10} stroke={WHITE} strokeWidth={3.5} />
              </Svg>
            </div>
          ) : null}
          {tickOp(581) > 0 ? (
            <div style={{...abs(0, 0, 1280, 720), opacity: tickOp(581), transform: `scale(${tickS(581).toFixed(3)})`, transformOrigin: `${TL.tb}px ${TL.y}px`}}>
              <Svg bloom={false}>
                <line x1={TL.tb} y1={TL.y - 10} x2={TL.tb} y2={TL.y + 10} stroke={WHITE} strokeWidth={3.5} />
              </Svg>
            </div>
          ) : null}
          {/* 有效窗段（602 亮起 + 紫光 + 低幅呼吸） */}
          {winP > 0.01 ? (
            <div style={{...abs(TL.ta, TL.y - 7, TL.tb - TL.ta, 14), borderRadius: 7, background: 'rgba(102,48,248,.55)', opacity: (breathe * fadeIn(N - 602, 4)).toFixed(3), boxShadow: glowPurpleS(winGlow), clipPath: `inset(0 ${(100 - 100 * winP).toFixed(1)}% 0 0)`}} />
          ) : null}
          <SoftIn N={N} f0={602}><CText cx={TL.ta} cy={543} size={22} weight={600} color={WHITE}>not before</CText></SoftIn>
          <SoftIn N={N} f0={604}><CText cx={TL.tb} cy={543} size={22} weight={600} color={WHITE}>not after</CText></SoftIn>
          {/* 窗内时刻（绿 Check） / 窗外两 Cross */}
          {clamp01((N - 606) / 10) > 0 ? (
            <Svg bloom={false}>
              <circle cx={350} cy={TL.y} r={5} fill="#000" stroke={WHITE} strokeWidth={2} />
              <Check cx={350} cy={464} size={34} p={clamp01((N - 606) / 10)} sw={6} />
            </Svg>
          ) : null}
          {clamp01((N - 610) / 8) > 0 ? (
            <Svg bloom={false}>
              <circle cx={160} cy={TL.y} r={5} fill="#000" stroke={GREY_MID} strokeWidth={2} />
              <Cross cx={160} cy={462} size={30} color={CORAL} sw={6} p={clamp01((N - 610) / 8)} />
            </Svg>
          ) : null}
          {clamp01((N - 614) / 8) > 0 ? (
            <Svg bloom={false}>
              <circle cx={545} cy={TL.y} r={5} fill="#000" stroke={GREY_MID} strokeWidth={2} />
              <Cross cx={545} cy={462} size={30} color={CORAL} sw={6} p={clamp01((N - 614) / 8)} />
            </Svg>
          ) : null}

          {/* ---- 右：数据库（676 缩入）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: dbOp, transform: `scale(${dbS.toFixed(3)})`, transformOrigin: `${DB.cx}px ${DB.cy}px`}}>
            <GlowBlob cx={DB.cx} cy={DB.cy} r={120} N={N} k={0.5 * gOff} />
            <DBIcon cx={DB.cx} cy={DB.cy} w={DB.w} h={DB.h} />
          </div>

          {/* ---- 右：三条记录条（错峰入场 → A↔B 交叉换位）---- */}
          <div style={{...abs(0, 0, 1280, 720), opacity: barOp(0), transform: `translateY(${(N < 725 ? barDy(0) : 0).toFixed(1)}px)`}}>
            <RecBar x={BARS.x + (N >= 725 ? bow : 0)} y={yA} label="write A" flash={flash} />
          </div>
          <div style={{...abs(0, 0, 1280, 720), opacity: barOp(1), transform: `translateY(${(N < 725 ? barDy(1) : 0).toFixed(1)}px)`}}>
            <RecBar x={BARS.x - (N >= 725 ? bow : 0)} y={yB} label="write B" flash={flash} />
          </div>
          <div style={{...abs(0, 0, 1280, 720), opacity: barOp(2), transform: `translateY(${barDy(2).toFixed(1)}px)`}}>
            <RecBar x={BARS.x} y={BARS.ys[2]} label="write C" flash={0} />
          </div>
          <SoftIn N={N} f0={735} len={6}>
            <CText cx={NOTE.cx} cy={NOTE.cy} size={22} weight={600} color={GREY}>order depends on time</CText>
          </SoftIn>
        </div>
      </div>
    </CameraRig>
  );
};
