import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, kf, GlitchIn, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {LockSeal, AtomIcon, NoiseField, CText, Svg, SoftIn, Pill, GREY, GREY_MID, WHITE, PURPLE_LIGHT, ORANGE, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC25 锁在重锻（5207–5493）。S34（¶段末）。
 * 节拍：5215 LockSeal 承接 SC24 小锁放大位移到中央（16 帧）+ 锻造光弧 draw-on（3 圈错峰 14 帧）+ 旋转 + 锁体脉动
 *       ｜5284 地址条（明文 SNI）SoftIn → 5330 噪声版 + 下箭头 + `ECH` Pill 紫光 + 明文版打灰
 *       ｜5366 AtomIcon 缩入 + 轨道旋转 + `post-quantum` GlitchIn(rgbSplit 4)
 *       ｜5420 `≈70%` 20 帧计数 + 橙光晕 + emphasisPulse。
 * 持续：光弧旋转 + 轨道旋转 + 锁脉动（5420 后全部冻结进入停留）。
 * 停留：段末 `≈70%` 落位 5440 → 离场 5473，≥30 ✓。运镜：1.0→1.05 慢推（5207–5440，运镜不进末拍）。
 * 主角：重锻 LockSeal 260px（锻造弧白 BLOOM / 锁紫光脉动）。
 */
const F0 = 5207;
const TO = 5513;

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 锁承接（5215 起 16 帧，从小锁位滑到中央并放大）
  const mvT = clamp01((N - 5215) / 16);
  const lockX = 918 + (640 - 918) * mvT;
  const lockY = 476 + (380 - 476) * mvT;
  const lockS = 0.35 + 1.0 * mvT; // 38/110 ≈ 0.35 → 1.35

  // 锻造光弧（5225/5233/5241 draw-on 各 14 帧；旋转到 5440 冻结）
  const arcP = (i: number) => clamp01((N - (5225 + i * 8)) / 14);
  const spin = Math.min(N - 5225, 5440 - 5225) * 0.8;

  // 锁体脉动（紫↔白，5230 起；5440 后冻结）
  const pulseT = Math.min(N - 5230, 210);
  const pulse = 0.5 + 0.5 * Math.sin((pulseT / 34) * Math.PI * 2);

  // 地址条：明文版（5284 SoftIn）→ 噪声版（5330）+ 下箭头 + ECH Pill（5342）+ 明文打灰（5350）
  const sni1In = clamp01((N - 5284) / 8);
  const sni2In = clamp01((N - 5330) / 10);
  const arrowP = clamp01((N - 5336) / 10);
  const echIn = clamp01((N - 5342) / 8);
  const grey1 = clamp01((N - 5350) / 8);

  // AtomIcon（5366 缩入 21 帧）+ 轨道旋转（到 5440 冻结）
  const atomIn = slideIn(N - 5366, 21);
  const atomSpin = Math.min(N - 5370, 70) * 1.2;

  // ≈70% 计数（5420 起 20 帧）
  const roll = clamp01((N - 5420) / 20);
  const val = Math.round(70 * (1 - Math.pow(1 - roll, 2)));
  const landed = roll >= 1;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 5440, x: 640, y: 360, s: 1.05}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 锻造光弧（三圈，旋转） */}
        {[0, 1, 2].map((i) => {
          const p = arcP(i);
          if (p <= 0.02) return null;
          const r = 150 + i * 34;
          return (
            <div key={i} style={{...abs(0, 0, 1280, 720), transform: `rotate(${(spin + i * 40) % 360}deg)`, opacity: 0.75}}>
              <Svg bloom>
                <path d={`M${640 - r} ${380} A ${r} ${r} 0 0 1 ${640 + r} ${380}`} fill="none" stroke={WHITE} strokeWidth={2.5 - i * 0.4} strokeLinecap="round" strokeDasharray={`${(Math.PI * r * 0.62 * p).toFixed(0)} ${Math.PI * r}`} />
              </Svg>
            </div>
          );
        })}

        {/* 重锻锁（主角） */}
        <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 5207) / 5), transform: `translate(${(lockX - 640).toFixed(0)}px, ${(lockY - 380).toFixed(0)}px) scale(${lockS.toFixed(3)})`}}>
          <div style={{...abs(0, 0, 1280, 720), filter: `drop-shadow(0 0 ${(18 + 10 * pulse).toFixed(0)}px rgba(102,45,248,${(0.35 + 0.25 * pulse).toFixed(2)}))`}}>
            <LockSeal cx={640} cy={380} w={150} h={188} glow />
          </div>
        </div>

        {/* 左下：SNI 地址条（明文 → 噪声）+ ECH */}
        <div style={{...abs(120, 470, 420, 40), opacity: sni1In, filter: grey1 > 0 ? `saturate(${(1 - grey1 * 0.75).toFixed(2)}) opacity(${(1 - grey1 * 0.4).toFixed(2)})` : undefined, background: '#000', border: `2px solid ${GREY_MID}`, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 14}}>
          <span style={{fontFamily: FONT_MONO, fontSize: 21, color: WHITE}}>SNI: shop.example</span>
        </div>
        <Svg bloom={false}>
          {arrowP > 0 ? <line x1={330} y1={516} x2={330} y2={516 + 26 * arrowP} stroke={GREY_MID} strokeWidth={2.5} strokeLinecap="round" /> : null}
          {arrowP >= 1 ? <path d="M330 548 l-6 -8 h12 Z" fill={GREY_MID} /> : null}
        </Svg>
        <div style={{...abs(120, 556, 420, 40), opacity: sni2In, background: '#000', border: `2px solid ${PURPLE_LIGHT}`, borderRadius: 6, overflow: 'hidden'}}>
          <NoiseField x={0} y={0} w={420} h={40} N={N} cols={24} rows={2} seed={11} opacity={0.85} />
          <span style={{position: 'absolute', left: 14, top: 8, fontFamily: FONT_MONO, fontSize: 21, color: WHITE}}>SNI: </span>
        </div>
        {echIn > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: echIn}}>
            <Pill x={556} y={562} w={104} h={44} fontSize={26} text="ECH" color={PURPLE_LIGHT} stroke={PURPLE_LIGHT} />
          </div>
        ) : null}

        {/* 右下：AtomIcon + post-quantum + ≈70% */}
        <div style={{...abs(0, 0, 1280, 720), opacity: atomIn}}>
          <AtomIcon cx={960} cy={440} size={160} spin={atomSpin} glow label="post-quantum" />
        </div>
        {N >= 5366 ? (
          <GlitchIn N={N} f0={5366} rgbSplit={4}>
            <div style={{...abs(0, 0, 1280, 720)}}>
              <CText cx={1120} cy={560} size={64} weight={700} family={FONT_ORB} color={landed ? ORANGE : GREY} letterSpacing={2}
                style={landed ? {textShadow: '0 0 36px rgba(243,95,69,.6), 0 0 10px rgba(243,95,69,.45)'} : undefined}>
                {landed ? '≈70%' : val + '%'}
              </CText>
            </div>
          </GlitchIn>
        ) : null}
        <SoftIn N={N} f0={5432}>
          <CText cx={1120} cy={616} size={22} weight={400} color={GREY}>of browser traffic</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
