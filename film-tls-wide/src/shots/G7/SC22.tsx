import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, kf} from '../../common';
import {CameraRig} from '../../fx';
import {PersonIcon, RackIcon, BrowserWin, CertCard, CText, Svg, SoftIn, Pill, Cross, GREY, GREY_MID, WHITE, CORAL, abs, fadeIn, exitOp} from '../../ui';

/**
 * SC22 MITM 失败（4563–4750）。S31。
 * 节拍：4571 三方 2 帧错峰入场 + 两条握手弧线 draw-on（各 16 帧）+ 橙色数据流沿弧线跑（持续）
 *       ｜4634 假证书翻出（旋转 12 帧）→ 递向浏览器（kf 16 帧）→ 扫描线扫过（8 帧）→ 戳位空白虚圈 bracket 特写（8 帧）
 *       ｜4690 大红 Cross 旋转盖下（scale 1.3→1 / 18 帧）+ 白闪 + `not trusted` 拒绝条弹出 + MITM Pill 变灰 + 弧线断裂抖动。
 * 持续：Cross 3° 摆动警示。运镜：1→1.15 推向假证书（4563–4640，运镜不进末拍）。主角：假证书+Cross 320px。
 */
const F0 = 4563;
const TO = 4750;

const BROW = {x: 90, y: 300, w: 190, h: 150};
const ATK = {x: 640, y: 380};
const SRV = {x: 1130, y: 390};

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  // 三方入场（4571 起 2 帧错峰，18 帧）
  const in3 = (i: number) => slideIn(N - (4571 + i * 2), 18);

  // 两条弧线（4575/4577 draw-on 各 16 帧）
  const arcL = clamp01((N - 4575) / 16);
  const arcR = clamp01((N - 4577) / 16);

  // 数据流（持续：两路橙点往返）
  const flowPh = ((N - 4595) % 36) / 36;

  // 假证书：翻出（4634 旋转 12 帧）→ 递向浏览器（4650–4666）
  const certSpin = clamp01((N - 4634) / 12);
  const deliverT = clamp01((N - 4650) / 16);
  const certX = 640 - 380 * deliverT;
  const certY = 380 - 60 * deliverT;
  // 扫描线（4670–4678）+ 戳位特写 bracket（4680–4688）
  const scanP = clamp01((N - 4670) / 8);
  const brkP = clamp01((N - 4680) / 8);

  // Cross（4690 起 18 帧）+ 白闪 + 拒绝条
  const crossP = clamp01((N - 4690) / 18);
  const flash = N >= 4706 && N < 4709 ? 1 : 0;
  const barIn = clamp01((N - 4708) / 10);
  // 弧线断裂抖动（4708 起 6 帧）
  const broken = N >= 4708;
  const shake = broken && N < 4714 ? Math.sin(N * 2.7) * 3 : 0;
  // MITM Pill 变灰（4708 起）
  const mitmGrey = broken;

  // Cross 警示摆动（持续）
  const sway = 3 * Math.sin((N / 24) * Math.PI * 2);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 4622, x: 640, y: 360, s: 1}, {f: 4640, x: 520, y: 400, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        {/* 左：浏览器 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: in3(0)}}>
          <BrowserWin x={BROW.x} y={BROW.y} w={BROW.w} h={BROW.h} url="shop.example" barP={1} opacity={0.9} />
        </div>
        {/* 右：服务器 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: in3(1)}}>
          <RackIcon cx={SRV.x} cy={SRV.y} w={110} h={150} units={5} lit={2} label="server" />
        </div>
        {/* 中：攻击者 */}
        <div style={{...abs(0, 0, 1280, 720), opacity: in3(2)}}>
          <PersonIcon cx={ATK.x} cy={ATK.y} size={150} label="the middle" />
          <Pill x={ATK.x - 52} y={ATK.y - 140} w={104} h={40} fontSize={24} text="MITM" color={mitmGrey ? GREY : CORAL} stroke={mitmGrey ? GREY : CORAL} />
        </div>

        {/* 两条握手弧线 + 数据流 */}
        <Svg bloom={false}>
          {arcL > 0 ? <path d={`M${BROW.x + BROW.w} ${BROW.y + 75} Q${(BROW.x + BROW.w + ATK.x) / 2} ${ATK.y - 120} ${ATK.x - 90} ${ATK.y - 20}`} fill="none" stroke={broken ? GREY : CORAL} strokeWidth={2.5} strokeDasharray={`${arcL * 420} 420`} opacity={0.8} transform={`translate(${shake},0)`} /> : null}
          {arcR > 0 ? <path d={`M${ATK.x + 90} ${ATK.y - 20} Q${(ATK.x + SRV.x) / 2} ${ATK.y - 120} ${SRV.x - 60} ${SRV.y - 75}`} fill="none" stroke={broken ? GREY : CORAL} strokeWidth={2.5} strokeDasharray={`${arcR * 420} 420`} opacity={0.8} transform={`translate(${-shake},0)`} /> : null}
        </Svg>
        {!broken && arcL >= 1 ? (
          <Svg bloom>
            <circle cx={BROW.x + BROW.w + (ATK.x - 90 - BROW.x - BROW.w) * flowPh} cy={BROW.y + 75 - 90 * Math.sin(Math.PI * flowPh)} r={5} fill={CORAL} />
            <circle cx={ATK.x + 90 + (SRV.x - 60 - ATK.x - 90) * ((flowPh + 0.5) % 1)} cy={ATK.y - 20 - 100 * Math.sin(Math.PI * ((flowPh + 0.5) % 1))} r={5} fill={CORAL} />
          </Svg>
        ) : null}

        {/* 假证书（翻出 → 递向浏览器） */}
        {certSpin > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: certSpin, transform: `translate(${certX - 640}px, ${certY - 380}px) rotate(${(1 - certSpin) * 30}deg)`}}>
            <CertCard x={certX - 150} y={certY - 100} w={300} h={200} domain="shop.example" ca="" stamped={0} />
            {/* 戳位空白虚圈特写 bracket */}
            {brkP > 0 ? (
              <Svg bloom={false}>
                <rect x={certX + 40} y={certY + 10} width={92} height={92} fill="none" stroke={GREY_MID} strokeWidth={2} strokeDasharray="6 6" opacity={brkP * 0.8} />
              </Svg>
            ) : null}
          </div>
        ) : null}

        {/* 扫描线 */}
        {scanP > 0 && scanP < 1 ? (
          <div style={{position: 'absolute', left: certX - 150, top: certY - 100 + 190 * scanP, width: 300, height: 3, background: 'rgba(255,255,255,.8)', boxShadow: '0 0 10px rgba(255,255,255,.6)'}} />
        ) : null}

        {/* 大红 Cross（旋转盖下）+ 白闪 */}
        {crossP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: crossP, transform: `rotate(${(1 - crossP) * 24 + sway}deg) scale(${1.3 - 0.3 * crossP})`}}>
            <Cross cx={certX + 86} cy={certY + 56} size={110} sw={6} />
            {flash ? <div style={{position: 'absolute', left: certX + 20, top: certY - 20, width: 140, height: 160, background: 'rgba(255,255,255,.45)', borderRadius: 10}} /> : null}
          </div>
        ) : null}

        {/* 拒绝条 */}
        {barIn > 0 ? (
          <div style={{...abs(BROW.x - 20, BROW.y - 46, 230, 44), opacity: barIn, background: '#000', border: `2.5px solid ${CORAL}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{fontFamily: 'inherit', fontSize: 22, color: CORAL, fontWeight: 700}}>not trusted</span>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
