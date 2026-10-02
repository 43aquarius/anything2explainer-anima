import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, FONT_MONO} from '../../common';
import {CameraRig} from '../../fx';
import {
  CText, Pill, Svg, Check, PersonIcon, EXAMPLE, abs, softOp, firstOp, scaleIn, exitOp, glowOffK,
  WHITE, GREY, GREY_MID, GREY_LIGHT, PURPLE_LIGHT, GREEN, BLOOM_SOFT, GLOW_PURPLE_S,
} from '../../ui';

/**
 * SC34 连接迁移 · N 9181–9417（S64 9189–9380 ¶+gap15；按「章内段末延到 SC35.from−1」延至 9417）
 * 版式：手机 (120×220，屏内缩微通话界面 + 顶部信号角标) 从 (520,360) 沿弧线滑向蜂窝塔；
 *       `ID: 7f3a` 紫边小牌全程跟随（不变，主角光）；左 Wi-Fi 节点 (240,264) 波纹 / 右蜂窝塔 (980) 覆盖波纹；
 *       轨迹末端绿 Check + `still connected`（分镜表指定的收束文案）。
 * 节拍：9189 手机缩放入场（21 帧）；9196 ID 牌 SoftIn 常驻跟随；9262 Wi-Fi 节点波纹 draw-on（3 圈，12 帧）
 *       + 节点/标签入场；9295 手机 kf 33 帧弧线滑向蜂窝塔（同步横向运镜 1.0→1.08/40 帧）
 *       + 途中 ~9311 Wi-Fi 波纹淡出、蜂窝波纹淡入（信号切换）+ ID 牌白闪一次（"没变"）；
 *       9352 绿 Check draw-on（12 帧）+ `still connected` SoftIn。
 * 持续动作：Wi-Fi/蜂窝覆盖波纹循环扩散 + 手机屏头像光环 30 帧呼吸 + 手机屏信号角标 Wi-Fi↔蜂窝切换。
 * 运镜：CameraRig 9295–9335 横移+轻推 (640,360,1.0)→(700,345,1.08)；结束 9335 ≤ 离场 9410−30 ✓。
 * 离场：末 8 帧归零（9410–9417；ID 牌/头像光环先灭光）。停留：Check 落位 9364 → 离场 9410，46 帧 ✓。
 * 主角：手机+ID 牌组 220px；光 = ID 牌紫光（GLOW_PURPLE_S）+ Check 绿。
 */
const F0 = 9181;
const TO = 9417;
const T_PHONE = 9189, T_TAG = 9196, T_WIFI = 9262, T_MOVE = 9295, T_SWITCH = 9311, T_CHECK = 9352;

const WIFI = {cx: 240, cy: 264};
const TOWER = {cx: 980, top: 208, base: 318, rippleCy: 236};
const P0 = {x: 520, y: 360}, P1 = {x: 848, y: 338};
const MOVE_LEN = 33;

// 覆盖波纹：3 圈，各 stagger 4 帧出现（12 帧内全部亮起），56 帧循环扩散淡出
const rippleK = (N: number, t0: number, i: number) => softOp(N - (t0 + i * 4), 4);
const ripplePhase = (N: number, t0: number, i: number) => ((N - t0) / 56 + i / 3) % 1;

export const SC34: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 手机位置：弧线（中段上抬 44px）
  const mv = easeInOutPow(2.5)(clamp01((N - T_MOVE) / MOVE_LEN));
  const px = P0.x + (P1.x - P0.x) * mv;
  const py = P0.y + (P1.y - P0.y) * mv - 44 * Math.sin(Math.PI * mv);

  // 信号切换：Wi-Fi 淡出（保 0.18 底）→ 蜂窝淡入
  const wifiK = 1 - 0.82 * clamp01((N - T_SWITCH) / 10);
  const towerK = clamp01((N - T_SWITCH) / 12);
  const sigK = clamp01((N - T_SWITCH) / 10); // 屏内信号角标切换进度

  // ID 牌白闪（信号切换瞬间，"ID 没变"）：6 帧三角衰减
  const fl = N - 9310;
  const flashK = fl <= 0 || fl >= 6 ? 0 : 1 - fl / 6;

  // 手机入场
  const pn = N - T_PHONE;
  const ps = 0.25 + 0.75 * scaleIn(pn, 21);
  const pop = firstOp(pn, 6);

  // 头像光环呼吸（30 帧周期，全程）
  const halo = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  const tagGlow = GLOW_PURPLE_S ? `0 0 24px 8px rgba(102,45,248,${(0.6 * glowOffK(N, TO, 6, 8)).toFixed(3)})` : undefined;

  const checkP = clamp01((N - T_CHECK) / 12);
  const scOp = softOp(N - (T_CHECK + 4), 8);

  // 轨迹虚线弧（手机滑行时画出，12 帧）
  const pathP = clamp01((N - T_MOVE) / 12);

  return (
    <CameraRig N={N} keys={[{f: F0, x: 640, y: 360, s: 1}, {f: T_MOVE, x: 640, y: 360, s: 1}, {f: T_MOVE + 40, x: 700, y: 345, s: 1.08}]}>
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {/* ——— Wi-Fi 节点（左）：覆盖波纹（全画幅循环扩散）+ 扇形记号 + 标签 ——— */}
        <Svg bloom={false} opacity={softOp(N - T_WIFI, 8)}>
          {[0, 1, 2].map((i) => {
            const k = rippleK(N, T_WIFI, i) * wifiK;
            if (k <= 0.02) return null;
            const ph = ripplePhase(N, T_WIFI, i);
            return <circle key={i} cx={WIFI.cx} cy={WIFI.cy} r={16 + 54 * ph} fill="none" stroke={WHITE} strokeWidth={1.8} opacity={(1 - ph) * 0.5 * k} />;
          })}
        </Svg>
        {N >= T_WIFI ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_WIFI, 8)}}>
            {/* Wi-Fi 扇形记号（点 + 两弧） */}
            <svg width={60} height={44} viewBox="0 0 60 44" style={{position: 'absolute', left: WIFI.cx - 30, top: WIFI.cy - 24, overflow: 'visible', opacity: 0.4 + 0.6 * wifiK}}>
              <circle cx={30} cy={36} r={4} fill={WHITE} />
              <path d="M 18 26 A 17 17 0 0 1 42 26" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
              <path d="M 9 17 A 30 30 0 0 1 51 17" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
            </svg>
            <CText cx={WIFI.cx} cy={WIFI.cy + 62} size={24} weight={600} family={FONT_MONO} color={GREY} style={{opacity: 0.45 + 0.55 * wifiK}}>Wi-Fi</CText>
          </div>
        ) : null}

        {/* ——— 蜂窝塔节点（右）：覆盖波纹（切换后亮起）+ 塔身 + 标签 ——— */}
        <Svg bloom={false} opacity={softOp(N - T_MOVE, 8)}>
          {[0, 1, 2].map((i) => {
            const k = rippleK(N, T_SWITCH, i) * towerK;
            if (k <= 0.02) return null;
            const ph = ripplePhase(N, T_SWITCH, i);
            return <circle key={i} cx={TOWER.cx} cy={TOWER.rippleCy} r={20 + 62 * ph} fill="none" stroke={WHITE} strokeWidth={1.8} opacity={(1 - ph) * 0.5 * k} />;
          })}
        </Svg>
        {N >= T_MOVE ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_MOVE, 8)}}>
            {/* 塔身（梯形桁架 + 交叉撑 + 顶灯呼吸） */}
            <svg width={120} height={130} viewBox="0 0 120 130" style={{position: 'absolute', left: TOWER.cx - 60, top: TOWER.top - 6, overflow: 'visible', filter: BLOOM_SOFT, opacity: 0.5 + 0.5 * towerK}}>
              <path d="M 26 126 L 56 6 L 64 6 L 94 126" fill="none" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
              {[0.3, 0.55, 0.8].map((t, i) => {
                const y = 10 + t * 112;
                const half = 32 - t * 24;
                return <line key={i} x1={60 - half} y1={y} x2={60 + half} y2={y} stroke={WHITE} strokeWidth={2} opacity={0.85} />;
              })}
              <line x1={44} y1={40} x2={78} y2={78} stroke={WHITE} strokeWidth={2} opacity={0.6} />
              <line x1={78} y1={40} x2={44} y2={78} stroke={WHITE} strokeWidth={2} opacity={0.6} />
              <circle cx={60} cy={6} r={4} fill={WHITE} opacity={0.7 + 0.3 * halo} />
            </svg>
            <CText cx={TOWER.cx} cy={TOWER.base + 8} size={24} weight={600} family={FONT_MONO} color={GREY} style={{opacity: 0.5 + 0.5 * towerK}}>cellular</CText>
          </div>
        ) : null}

        {/* ——— 轨迹虚线弧（滑行起画出） ——— */}
        {pathP > 0 ? (
          <Svg bloom={false}>
            <path d={`M ${P0.x},${P0.y} Q ${P0.x + 164},${P0.y - 99} ${P1.x},${P1.y}`} fill="none" stroke={GREY_MID} strokeWidth={2} strokeDasharray="7 9" opacity={0.55 * pathP} />
          </Svg>
        ) : null}

        {/* ——— 手机（主角，含屏内缩微通话界面） ——— */}
        {pn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: pop, transform: ps < 1 ? `scale(${ps.toFixed(4)})` : undefined, transformOrigin: `${px}px ${py}px`}}>
            <div style={{...abs(px - 60, py - 110, 120, 220), boxSizing: 'border-box', background: '#000', border: `3px solid ${WHITE}`, borderRadius: 18, filter: BLOOM_SOFT}} />
            {/* 屏内：顶部信号角标（Wi-Fi 弧 → 蜂窝条） */}
            <svg width={30} height={22} viewBox="0 0 30 22" style={{position: 'absolute', left: px - 44, top: py - 94, overflow: 'visible'}}>
              <g opacity={1 - sigK}>
                <circle cx={7} cy={18} r={2.4} fill={GREY_LIGHT} />
                <path d="M 2.5 13.5 A 6.4 6.4 0 0 1 11.5 13.5" fill="none" stroke={GREY_LIGHT} strokeWidth={2.2} strokeLinecap="round" />
                <path d="M 0 9 A 10.5 10.5 0 0 1 14 9" fill="none" stroke={GREY_LIGHT} strokeWidth={2.2} strokeLinecap="round" />
              </g>
              <g opacity={sigK}>
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={17 + i * 3.4} y={18 - 4 - i * 4} width={2.4} height={4 + i * 4} fill={i >= 2 ? PURPLE_LIGHT : GREY_LIGHT} rx={0.6} />
                ))}
              </g>
            </svg>
            {/* 屏内：好友头像（光环呼吸，持续动作） */}
            <div
              style={{
                ...abs(px - 29, py - 69, 58, 58),
                borderRadius: '50%',
                border: `2.5px solid ${WHITE}`,
                background: '#000',
                boxShadow: `0 0 ${Math.round(8 + 12 * halo)}px ${Math.round(2 + 4 * halo)}px rgba(102,45,248,${((0.22 + 0.32 * halo) * glowOffK(N, TO, 6, 8)).toFixed(3)})`,
              }}
            >
              <PersonIcon cx={29} cy={31} size={40} opacity={0.9} />
            </div>
            {/* 屏内：通话时长（EXAMPLE.timer 示意） */}
            <CText cx={px} cy={py + 48} size={22} weight={600} family={FONT_MONO} color={GREY_LIGHT} style={{letterSpacing: 1}}>{EXAMPLE.timer}</CText>
            {/* 屏内：语音微波形（3 根呼吸竖线） */}
            {[0, 1, 2].map((i) => (
              <div key={i} style={{position: 'absolute', left: px - 17 + i * 12, top: py + 68, width: 5, height: Math.round(10 + 7 * Math.abs(Math.sin((2 * Math.PI * (N + i * 3)) / 24))), background: GREY_MID, borderRadius: 2, opacity: 0.8}} />
            ))}
          </div>
        ) : null}

        {/* ——— ID 牌（紫边，全程跟随，主角光；切换瞬间白闪） ——— */}
        {N >= T_TAG ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(N - T_TAG, 8)}}>
            <div style={{...abs(px - 58, py - 152 - 20, 116, 40), boxSizing: 'border-box', background: 'rgba(0,0,0,0.92)', border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 8, boxShadow: tagGlow}}>
              <CText cx={58} cy={20} size={24} weight={700} family={FONT_MONO} color={WHITE} style={{lineHeight: 1}}>{EXAMPLE.quicId}</CText>
            </div>
            {/* 白闪层（同位复制，白边白光） */}
            {flashK > 0 ? (
              <div style={{...abs(px - 58, py - 152 - 20, 116, 40), boxSizing: 'border-box', background: 'rgba(0,0,0,0.92)', border: `2.5px solid ${WHITE}`, borderRadius: 8, opacity: flashK, boxShadow: `0 0 ${Math.round(16 + 14 * flashK)}px ${Math.round(4 + 4 * flashK)}px rgba(255,255,255,${(0.6 * flashK).toFixed(2)})`}}>
                <CText cx={58} cy={20} size={24} weight={700} family={FONT_MONO} color={WHITE} style={{lineHeight: 1}}>{EXAMPLE.quicId}</CText>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ——— 轨迹末端：绿 Check + still connected ——— */}
        <Svg>
          {checkP > 0 ? <Check cx={800} cy={500} size={44} sw={8} p={checkP} opacity={exOp} /> : null}
        </Svg>
        {scOp > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: scOp}}>
            <CText cx={988} cy={500} size={22} weight={500} family={FONT_MONO} color={GREY} letterSpacing={1}>still connected</CText>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};
