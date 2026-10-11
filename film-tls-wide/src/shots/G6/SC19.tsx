import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, kf, emphasisPulse, FONT_ORB, FONT_MONO} from '../../common';
import {CameraRig, BigNumber} from '../../fx';
import {CText, Svg, SoftIn, Pill, Cross, GREY, GREY_MID, WHITE, PURPLE_LIGHT, ORANGE, CORAL, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC19 五套件（3830–4093）。S27（¶段末）。
 * 节拍：3838 旧墙 31 枚 Pill 分 4 批入场（每批 4 帧）+ `mandatory` 紫光 Pill 墙顶
 *       ｜3934 旧墙灰化（12 帧）+ 8 枚弱套件坠落淡出（2 帧错峰）
 *       ｜4009 计数器 `31` SoftIn → `→` draw-on → 31→5 快滚（16 帧）+ `5` 橙光晕爆发 + 新架 5 枚 Pill 依次紫光点亮 + 旧墙淡出。
 * 持续：新架 Pill 呼吸轮亮（40 帧周期）。停留：段末 `5`+新架落位 4025 → 离场 4077，≥30 ✓。
 * 运镜：33 帧 1→1.2 推向计数器（4009–4042，运镜不进末拍）。主角：套件墙+计数器 380px（`5` 橙光晕）。
 */
const F0 = 3830;
const TO = 4093;

// 旧墙 31 枚（4 行 × 8 列）
const OLD_SUITES = [
  'RSA_3DES', 'RC4_MD5', 'RSA_DES_CBC', 'NULL_SHA', 'RC4_128_SHA', '3DES_EDE', 'RSA_AES_128', 'RSA_AES_256',
  'DHE_RSA', 'DHE_DSS', 'ECDH_ECDSA', 'ECDHE_RSA', 'CAMELLIA', 'SEED_SHA', 'AES_CCM', 'AES_GCM',
  'PSK_RSA', 'PSK_DHE', 'SRP_SHA', 'RSA_PSK', 'ECDHE_PSK', 'ARIA', 'CHACHA', 'AES_128_CCM',
  'DES40_CBC', 'IDEA_CBC', 'RC2_CBC', 'KRB5', 'SHA384', 'SHA legacy', 'MD5 legacy',
];
const NEW_SUITES = ['AES_128_GCM_SHA256', 'AES_256_GCM_SHA384', 'CHACHA20_POLY1305', 'AES_128_CCM', 'AES_128_CCM_8'];
const WEAK = [0, 1, 2, 3, 4, 5, 10, 12]; // 带小红叉先坠落的示意弱套件

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 旧墙入场（3838 起 4 批 × 4 帧）
  const oldIn = (i: number) => clamp01((N - (3838 + Math.floor(i / 8) * 4)) / 6);
  // 灰化（3934 起 12 帧）
  const grey = clamp01((N - 3934) / 12);
  // 弱套件坠落（3940 起，每枚 8 帧，2 帧错峰）
  const weakFall = (k: number) => clamp01((N - (3940 + k * 2)) / 8);
  // 旧墙其余淡出（4012 起 16 帧 → 只剩 20% 轮廓）
  const oldFade = N >= 4012 ? Math.max(0.2, 1 - clamp01((N - 4012) / 16) * 0.8) : 1;
  // 计数器：31 SoftIn（4009）→ 滚动 31→5（4013–4029）→ `5` 落定 + 橙光晕
  const cntOp = clamp01((N - 3838) / 6);
  const roll = clamp01((N - 3934) / 16);
  const val = Math.round(31 - 26 * (1 - Math.pow(1 - roll, 2))); // c2 先示 31，c3 滚到 5
  const landed = roll >= 1;
  // 新架 5 枚 Pill 依次紫光点亮（4029 + i*6）
  const newOn = (i: number) => clamp01((N - (4029 + i * 6)) / 8);
  // 新架呼吸轮亮（持续）
  const breathe = (i: number) => 0.85 + 0.15 * Math.sin(((N + i * 8) / 40) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 4009, x: 640, y: 360, s: 1}, {f: 4042, x: 640, y: 340, s: 1.2}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：旧墙 31 枚 */}
        {OLD_SUITES.map((s, i) => {
          const row = Math.floor(i / 8), col = i % 8;
          const x = 150 + col * 78, y = 200 + row * 66;
          const isWeak = WEAK.indexOf(i) >= 0;
          const weakIdx = WEAK.indexOf(i);
          const fall = isWeak ? weakFall(weakIdx) : 0;
          const op = oldIn(i) * (isWeak ? 1 - fall : 1) * oldFade;
          return op <= 0.02 ? null : (
            <div key={i} style={{...abs(0, 0, 1280, 720), opacity: op, transform: `translateY(${(90 * fall).toFixed(0)}px)`, filter: grey > 0 && !landed ? `saturate(${(1 - grey * 0.8).toFixed(2)})` : undefined}}>
              <div style={{position: 'absolute', left: x, top: y, width: 72, height: 46, borderRadius: 6, border: `1.5px solid ${GREY_MID}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontFamily: FONT_MONO, fontSize: 15, color: GREY, whiteSpace: 'nowrap'}}>{s}</span>
              </div>
              {isWeak && fall <= 0 ? <Cross cx={x + 62} cy={y + 8} size={18} sw={3} /> : null}
            </div>
          );
        })}
        {/* 旧墙连体外框（c1 起就有大主体） */}
        <div style={{position: 'absolute', left: 140, top: 186, width: 648, height: 332, border: `2.5px solid ${GREY_MID}`, borderRadius: 12, opacity: clamp01((N - 3838) / 8)}} />
        <CText cx={450} cy={166} size={24} weight={600} color={GREY}>TLS 1.2</CText>
        <SoftIn N={N} f0={3838}>
          <Pill x={620} y={140} w={190} h={44} fontSize={24} text="mandatory" color={PURPLE_LIGHT} stroke={PURPLE_LIGHT} />
        </SoftIn>

        {/* 中：计数器（31 → 5） */}
        {cntOp > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: cntOp}}>
            <CText cx={640} cy={392} size={100} weight={700} family={FONT_ORB} color={landed ? ORANGE : GREY} letterSpacing={2}
              style={landed ? {textShadow: '0 0 42px rgba(243,95,69,.65), 0 0 12px rgba(243,95,69,.5)', transform: `scale(${emphasisPulse(N - 4029, {peak: 1.11})})`} : undefined}>
              {landed ? '5' : val}
            </CText>
            <Svg bloom={false}>
              {roll > 0 ? <line x1={584} y1={392} x2={584 + 60 * clamp01(roll)} y2={392} stroke={GREY} strokeWidth={3} strokeLinecap="round" /> : null}
              <line x1={540} y1={392} x2={572} y2={392} stroke={GREY} strokeWidth={3} strokeLinecap="round" />
            </Svg>
            {!landed ? <CText cx={500} cy={392} size={100} weight={700} family={FONT_ORB} color={GREY}>31</CText> : null}
            {landed ? <CText cx={640} cy={448} size={24} weight={500} color={GREY}>cipher suites</CText> : null}
          </div>
        ) : null}

        {/* 右：新架 5 枚 */}
        {NEW_SUITES.map((s, i) => {
          const y = 210 + i * 62;
          const on = newOn(i);
          return on <= 0.02 ? null : (
            <div key={s} style={{...abs(0, 0, 1280, 720), opacity: on}}>
              <div style={{position: 'absolute', left: 860, top: y, width: 310, height: 56, borderRadius: 8, border: `2px solid ${PURPLE_LIGHT}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${(10 * breathe(i)).toFixed(0)}px rgba(102,45,248,.4)`, opacity: breathe(i)}}>
                <span style={{fontFamily: FONT_MONO, fontSize: 21, color: WHITE}}>{s}</span>
              </div>
            </div>
          );
        })}
        {/* 新架连体外框（计数器 c2 起点亮时同步出现） */}
        {cntOp > 0 ? <div style={{position: 'absolute', left: 846, top: 196, width: 340, height: 348, border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 12, opacity: 0.85 * cntOp, boxShadow: '0 0 24px 8px rgba(102,45,248,.25)'}} /> : null}
        <CText cx={1015} cy={166} size={24} weight={600} color={PURPLE_LIGHT}>TLS 1.3</CText>
        <SoftIn N={N} f0={4050}>
          <CText cx={640} cy={478} size={22} weight={400} color={GREY}>no exceptions · no weak suites</CText>
        </SoftIn>
      </div>
    </CameraRig>
  );
};
