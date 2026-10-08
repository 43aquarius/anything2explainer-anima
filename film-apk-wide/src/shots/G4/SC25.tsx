import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeOutCubic, clamp01, emphasisPulse} from '../../common';
import {CText, WHITE, PURPLE_LIGHT, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {HeroGlow} from '../../fx';
import {ParcelIcon} from '../../ui';

/**
 * SC25 章末收束（3605–3721 注册，内容 3668 归零，S25 ¶+gap20：3613 箱子比看起来聪明）
 * 承接 SC24（已归零）→ 中央一枚大 ParcelIcon（cx 640, cy 350, w 280 h 200，半开 openP 0.15→0.25 / 8f +
 * 封条 sealP 1）+ 上方一行 `smarter than it looks`（Noto 900 56px 白+紫描边，SoftIn + emphasisPulse）；
 * 包裹角标换 `ZIP`；封条紫光呼吸（HeroGlow 30f 周期）；包裹轻微悬浮 ±3px（72f 周期，持续动作）。
 * 末 10 帧整组归零（3658–3668，进章节卡——章节卡 3669 起在下层露出；3669–3721 组件返回 null）。
 * 停留：落位 3628（入场 3613+15）→ 离场 3658，30 帧 ✓（分镜表：大字落位 3613+18 → 离场 3668−10）。
 * 主角：包裹+大字 200px+；光：封条紫光（HeroGlow 呼吸，离场先灭光）。
 */
export const F0 = 3605;
const B_PARCEL = 3613, B_TEXT = 3613, B_PULSE = 3621, EXIT_TO = 3668, EXIT_LEN = 10, TO = 3721;

const PARCEL = {cx: 640, cy: 350, w: 280, h: 200};

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 注册区间到 3721（分镜表 G4 表 3605–3766 的收口：内容 3668 归零让章节卡露出，见 BUILD_NOTES 偏离）
  const op = exitOp(N, EXIT_TO, EXIT_LEN);
  if (op <= 0) return null;
  const gk = glowOffK(N, EXIT_TO, 6, EXIT_LEN);

  // 承接入场：包裹缩放 0.8→1（14f）+ 拉链再开一点 openP 0.15→0.25（8f）
  const inS = 0.8 + 0.2 * easeOutCubic(clamp01((N - B_PARCEL) / 14));
  const openP = 0.15 + 0.1 * easeOutCubic(clamp01((N - B_PARCEL) / 8));
  // 轻微悬浮 ±3px（72f 周期，入场完成后起）
  const bob = N >= B_PARCEL + 14 ? 3 * Math.sin(((N - (B_PARCEL + 14)) / 72) * Math.PI * 2) : 0;
  // 大字脉冲
  const pulse = emphasisPulse(N - B_PULSE, {peak: 1.11, up: 13, hold: 4, down: 13});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 大字（上方，Noto 900 56px 白+紫描边） */}
      {N >= B_TEXT ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${pulse.toFixed(4)})`, transformOrigin: '640px 175px'}}>
          <CText
            cx={640}
            cy={175}
            size={56}
            weight={900}
            color={WHITE}
            letterSpacing={1}
            opacity={softOp(N - B_TEXT, 8)}
            style={{
              WebkitTextStroke: `2.5px rgba(161,117,241,${(0.95 * gk).toFixed(3)})`,
              paintOrder: 'stroke fill',
              textShadow: `0 0 ${(12 + 6 * Math.sin((N / 30) * Math.PI * 2)) * gk}px rgba(102,48,248,.5)`,
            }}
          >
            smarter than it looks
          </CText>
        </div>
      ) : null}

      {/* 包裹（主角，封条紫光呼吸 = HeroGlow；悬浮 ±3px） */}
      {N >= B_PARCEL ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, opacity: firstOp(N - B_PARCEL, 6)}}>
          <HeroGlow x={PARCEL.cx - PARCEL.w / 2 - 10} y={PARCEL.cy - PARCEL.h / 2 + bob - 10} w={PARCEL.w + 20} h={PARCEL.h + 20} r={18} N={N} k={gk} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${inS.toFixed(4)})`, transformOrigin: `${PARCEL.cx}px ${PARCEL.cy}px`}}>
            <ParcelIcon cx={PARCEL.cx} cy={PARCEL.cy + bob} w={PARCEL.w} h={PARCEL.h} openP={openP} sealP={1} label="ZIP" labelColor={PURPLE_LIGHT} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SC25;
