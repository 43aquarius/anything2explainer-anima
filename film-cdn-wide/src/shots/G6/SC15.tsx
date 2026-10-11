import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, slideIn, FONT_ORB} from '../../common';
import {CameraRig} from '../../fx';
import {CText, Svg, SoftIn, Pill, Cross, GREY, GREY_MID, WHITE, ORANGE, PURPLE_LIGHT, abs, exitOp} from '../../ui';

/**
 * SC15 2021 反转（3512–3780）。S20–S21。
 * 节拍：3520 标题 ｜3569 `2021` YearRoll + 坏齿轮 + 裂纹 ｜3665 网图 draw-on + 大片节点熄灭 + 红 X + `~1/10` 计数
 *       ｜3736 `49 min` 计数 + 沙漏翻转 + 熄灭片余震（TO−40 前衰减）。
 * 运镜：推近 1.15/33f（3600–3633，不进末拍）。主角：熄灭网图 340px。零 glitch（熄灭是动作戏）。
 */
const F0 = 3512;
const TO = 3780;

const GEAR = {cx: 300, cy: 380};
const NET = {x: 620, y: 200};
const NODES = Array.from({length: 24}).map((_, i) => ({
  x: NET.x + 50 + (i % 6) * 90,
  y: NET.y + 70 + Math.floor(i / 6) * 92,
  dead: Math.floor(i / 6) >= 1 && Math.floor(i / 6) <= 2 && (i % 6) >= 1 && (i % 6) <= 4,
}));

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exit = exitOp(N, TO, 8);

  const yn = N - 3569;
  const roll = clamp01(yn / 14);
  const rollVal = Math.round(2025 - 210 * (1 - Math.pow(1 - roll, 2)));
  const gearIn = slideIn(N - 3550, 21); // v3：再提前
  const crackP = clamp01((N - 3568) / 12);

  const netP = clamp01((N - 3665) / 16);
  const deadK = (i: number) => clamp01((N - (3680 + i * 2)) / 8);
  const xP = clamp01((N - 3710) / 12);
  const shareRoll = clamp01((N - 3712) / 20);
  const minRoll = clamp01((N - 3736) / 16);
  const hourP = clamp01((N - 3740) / 20);
  const quake = N >= 3756 ? Math.sin((N - 3756) * 2.2) * 3 * Math.max(0, 1 - clamp01((N - 3756) / 20)) : 0;

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: 3600, x: 640, y: 360, s: 1}, {f: 3633, x: 890, y: 420, s: 1.15}]}>
      <div style={{...abs(0, 0, 1280, 720), opacity: exit}}>
        <SoftIn N={N} f0={3520}>
          <CText cx={640} cy={120} size={52} weight={900} color={WHITE} letterSpacing={1}>the failure mode flipped</CText>
        </SoftIn>

        {/* 左：2021 + 坏齿轮（余震） */}
        <SoftIn N={N} f0={3569}>
          <CText cx={GEAR.cx} cy={210} size={72} weight={700} family={FONT_ORB} color={GREY} letterSpacing={3}>{roll >= 1 ? '2021' : rollVal}</CText>
        </SoftIn>
        <div style={{...abs(0, 0, 1280, 720), opacity: gearIn, transform: `rotate(${quake.toFixed(1)}deg)`}}>
          <Svg bloom>
            <g stroke={WHITE} strokeWidth={3.5} fill="#000">
              <circle cx={GEAR.cx} cy={GEAR.cy} r={72} />
              {Array.from({length: 10}).map((_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <line key={i} x1={GEAR.cx + 72 * Math.cos(a)} y1={GEAR.cy + 72 * Math.sin(a)} x2={GEAR.cx + 90 * Math.cos(a)} y2={GEAR.cy + 90 * Math.sin(a)} strokeWidth={6} strokeLinecap="round" />;
              })}
              <circle cx={GEAR.cx} cy={GEAR.cy} r={16} />
            </g>
            {crackP > 0 ? (
              <path d={`M${GEAR.cx - 30} ${GEAR.cy - 62} L${GEAR.cx - 6} ${GEAR.cy - 10} L${GEAR.cx - 34} ${GEAR.cy + 30} L${GEAR.cx - 2} ${GEAR.cy + 66}`}
                fill="none" stroke="#F16043" strokeWidth={4} strokeDasharray={`${crackP * 200} 200`} strokeLinecap="round" />
            ) : null}
          </Svg>
          <Pill x={GEAR.cx - 70} y={GEAR.cy + 108} w={140} h={40} fontSize={22} text="bad config" color={ORANGE} />
        </div>

        {/* 右：网图（部分熄灭） */}
        <Svg bloom={false}>
          {netP > 0 ? NODES.map((nd, i) => {
            const dk = nd.dead ? deadK(i) : 0;
            const on = netP * (nd.dead ? 1 - dk : 1);
            return on <= 0.05 ? null : (
              <circle key={i} cx={nd.x} cy={nd.y} r={9} fill="#000" stroke={nd.dead ? GREY_MID : PURPLE_LIGHT} strokeWidth={2.5} opacity={nd.dead ? 0.45 * on : on} />
            );
          }) : null}
          {netP >= 1 ? NODES.map((nd, i) => {
            if (i % 6 === 5 || i >= 18) return null;
            const nx = NODES[i + 1];
            const dk = nd.dead ? deadK(i) : 0;
            return <line key={`l${i}`} x1={nd.x} y1={nd.y} x2={nx.x} y2={nx.y} stroke={GREY_MID} strokeWidth={1.5} opacity={(0.5 - 0.35 * dk) * netP} />;
          }) : null}
        </Svg>

        {/* 红 X（熄灭区） */}
        {xP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: xP, transform: `scale(${1.25 - 0.25 * xP})`}}>
            <Cross cx={880} cy={340} size={92} sw={6} />
          </div>
        ) : null}

        {/* 计数 */}
        {shareRoll > 0 ? (
          <CText cx={890} cy={612} size={44} weight={700} family={FONT_ORB} color={ORANGE} letterSpacing={2}
            style={{textShadow: '0 0 26px rgba(243,95,69,.55)'}}>
            ~1/10 {minRoll > 0 ? '· 49 min' : ''}
          </CText>
        ) : null}
        {minRoll > 0 ? <CText cx={890} cy={648} size={20} weight={400} color={GREY}>of the internet, offline</CText> : null}

        {/* 沙漏（翻转一次） */}
        {hourP > 0 ? (
          <div style={{...abs(0, 0, 1280, 720), opacity: clamp01((N - 3740) / 5)}}>
            <div style={{position: 'absolute', left: 460, top: 420, width: 54, height: 84, transform: `rotate(${180 * hourP}deg)`, transformOrigin: '27px 42px', border: `2.5px solid ${GREY_MID}`, borderRadius: 6, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${50 - 45 * hourP}%`, background: 'rgba(241,96,67,.5)'}} />
            </div>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
