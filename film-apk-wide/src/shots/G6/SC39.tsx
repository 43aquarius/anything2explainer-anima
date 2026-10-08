import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlitchIn, clamp01, easeInOutCubic, kf, powOutRemain, FONT_MONO} from '../../common';
import {CText, ParcelIcon, Box, Svg, EXAMPLE, GREY_MID, PURPLE_LIGHT, exitOp, glowOffK, softOp, firstOp, abs} from '../../ui';
import {HeroGlow} from '../../fx';
import {DirectoryHouse} from './g6ui';

/**
 * SC39 落位 /data/app · N 5661–5823（S39 5669–5789 ¶+gap12：5669「The package gets copied to its home,」/ 5732「under /data/app.」）
 * 5669 虚线路径 draw-on 12f（clip 自左 wipe，x 单调）→ 5681 包裹（0.5×，140×98）沿二次贝塞尔 kf 滑入 24f（easeInOut，= 复制动作）→ 5705 到位；
 * 5726 目录屋（DirectoryHouse，主角 282px 高含屋顶）slideUp Δ80/18f（节拍 −6）→ 5732 门牌 `/data/app` GlitchIn（rgbSplit 4，**本镜唯一 glitch**）+ 立牌紫光；
 * 5734 路径轨迹渐隐 12f；5746 目标槽（第 2 行左）紫光 draw-on + 包裹缩位 1→0.62 入格（包裹入住）。
 * 段末（¶+gap12）：槽位亮起/缩位落位 5758 → 离场 5816（TO−8），hold ~58f ≥30 ✓（分镜表「5791−8」为 S39.to+2 旧口径，见 BUILD_NOTES §A2）。
 * 末 8 帧归零（门牌/槽位紫光先灭 6f）。事实：EXAMPLE.dataApp = '/data/app'（AOSP）。
 */
const F0 = 5661, TO = 5823;
const B_PATH = 5669, B_MOVE = 5681, B_HOUSE = 5726, B_PLATE = 5732, B_TRAIL = 5734, B_SLOT = 5746;

const PATH = {p0: {x: 300, y: 415}, p1: {x: 575, y: 515}, p2: {x: 857, y: 393}}; // x 单调（clip wipe 用）
const HOUSE = {x: 770, y: 285, w: 340, h: 210, roof: 72};
const SIGN = {x: 835, y: 500, w: 210, h: 52};

// 二次贝塞尔（与 SVG 路径 M p0 Q p1 p2 同一条）
const qBez = (t: number) => ({
  x: (1 - t) * (1 - t) * PATH.p0.x + 2 * (1 - t) * t * PATH.p1.x + t * t * PATH.p2.x,
  y: (1 - t) * (1 - t) * PATH.p0.y + 2 * (1 - t) * t * PATH.p1.y + t * t * PATH.p2.y,
});

export const SC39: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6);

  // 路径 draw-on（clip 自左 12f）→ 淡淡轨迹（包裹走完后 5734 起 12f 渐隐）
  const pathP = clamp01((N - B_PATH) / 12);
  const pathOp = kf(N, [[B_PATH, 0.6], [B_MOVE + 24, 0.6], [B_TRAIL, 0.6], [B_TRAIL + 12, 0]]);
  // 包裹滑入 24f（easeInOut = 复制动作）→ 5746 起缩位入格 1→0.62
  const pt = easeInOutCubic(clamp01((N - B_MOVE) / 24));
  const pos = qBez(pt);
  const ps = kf(N, [[B_SLOT, 1], [B_SLOT + 12, 0.62]], easeInOutCubic);
  const parcelOp = firstOp(N - B_PATH, 6);
  // 目录屋 slideUp Δ80/18f（节拍 5732 −6）；槽位紫光
  const houseOp = softOp(N - B_HOUSE, 8);
  const houseSlide = 80 * powOutRemain(N - B_HOUSE, 18, 2.5);
  const slotK = clamp01((N - B_SLOT) / 10);
  // 门牌立牌（SoftIn −4f 前挂）+ GlitchIn 文本（5732 节拍，rgbSplit 4）+ 紫光
  const signOp = softOp(N - (B_PLATE - 4), 8);
  const signGlow = clamp01((N - (B_PLATE + 6)) / 8) * gk;
  const slotGlow = slotK * gk;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* 虚线路径（复制轨迹：draw-on → 渐隐） */}
      {pathP > 0 && pathOp > 0 ? (
        <Svg bloom={false}>
          <defs>
            <clipPath id="g6-sc39-path">
              <rect x={280} y={330} width={620 * pathP} height={240} />
            </clipPath>
          </defs>
          <path
            d={`M ${PATH.p0.x} ${PATH.p0.y} Q ${PATH.p1.x} ${PATH.p1.y} ${PATH.p2.x} ${PATH.p2.y}`}
            fill="none"
            stroke={GREY_MID}
            strokeWidth={2.5}
            strokeDasharray="7 9"
            opacity={pathOp}
            clipPath="url(#g6-sc39-path)"
          />
        </Svg>
      ) : null}

      {/* 目录屋（主角，含 5 枚邻居小包裹 + 目标槽紫光；slideUp 不带包裹——包裹先到、屋起） */}
      {houseOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: houseOp, transform: `translateY(${houseSlide.toFixed(1)}px)`}}>
          <HeroGlow x={HOUSE.x + 15} y={HOUSE.y + 76} w={150} h={58} r={10} N={N} k={0.8 * slotGlow} />
          <DirectoryHouse x={HOUSE.x} y={HOUSE.y} w={HOUSE.w} h={HOUSE.h} roof={HOUSE.roof} slotK={slotK} />
        </div>
      ) : null}

      {/* 包裹（0.5×，140×98；沿路径滑入后缩位入格） */}
      {parcelOp > 0 ? (
        <ParcelIcon cx={pos.x} cy={pos.y} w={140} h={98} scale={ps} label={'APK'} opacity={parcelOp} />
      ) : null}

      {/* 门牌立牌（/data/app，本镜唯一 glitch；屋前地面立式，不随屋入场） */}
      {signOp > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: signOp}}>
          <HeroGlow x={SIGN.x} y={SIGN.y} w={SIGN.w} h={SIGN.h} r={26} N={N} k={signGlow} />
          <Box x={SIGN.x} y={SIGN.y} w={SIGN.w} h={SIGN.h} r={10} sw={2.5} />
          <div style={{...abs(SIGN.x + 65, SIGN.y + SIGN.h, 5, 34), background: GREY_MID}} />
          <div style={{...abs(SIGN.x + 140, SIGN.y + SIGN.h, 5, 34), background: GREY_MID}} />
          <GlitchIn N={N} f0={B_PLATE} rgbSplit={4} seed={39}>
            <CText cx={SIGN.x + SIGN.w / 2} cy={SIGN.y + 27} size={26} weight={700} family={FONT_MONO} color={PURPLE_LIGHT} letterSpacing={0.5} shadow={`0 0 14px rgba(102,48,248,${(0.85 * gk).toFixed(2)})`}>
              {EXAMPLE.dataApp}
            </CText>
          </GlitchIn>
        </div>
      ) : null}
    </div>
  );
};

export default SC39;
