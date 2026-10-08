import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutPow, clamp01, easeOutCubic} from '../../common';
import {CText, Svg, Check, GREEN, GREY, GREY_MID, WHITE, exitOp, glowOffK, softOp, firstOp} from '../../ui';
import {CameraRig} from '../../fx';
import {DIAG, ZipDiagramFinal, FileEntryBlock, DrawLine} from './g4ui';

/**
 * SC19 只读一个文件（2721–2858，S19：2729 打开一个文件 / 2804 不用解开其余）
 * 承接 SC18（已归零）→ 0.4× 缩微结构图（同 DIAG 几何）firstOp 6f 重现于左侧（cx 300, cy 330）。
 * 节拍：2729 绿引线 draw-on（10f，目录卡 → block1，直达无折返）→ 2739 绿光标沿线滑行（12f）
 *      → 2751 到达即目标块弹出（kf 14f 移到右侧 (850,320) 放大 1.7×，绿边+绿光；缩微图其余块压灰 + 原位虚线槽）
 *      → 2804 绿 Check draw-on（12f）+ `unzip` 小标签 SoftIn 即被灰删除线划过（"不解包"）；
 *        光标贴块心 24 帧呼吸（持续到离场）。
 * 运镜：2816 起整组 1.0→1.04 慢推向演示区（贯穿例外；分镜表本镜未列运镜，慢推补"每句一处变化"）。
 * 停留：段内不判。主角：直达演示组（缩微图+引线+光标+放大块+标签）≈230px；光：目标块绿光（绿=正确）。
 * 偏离：分镜表写"该块 1.2× 放大点亮"——按 0.4× 缩微图字面放大只有 43px，低于空场判据；改为放大到
 *      1.7× 全尺寸（153×110）+ 标签/Check 组成主角组，与「主角·尺寸 220px」列一致（坐标/尺寸为参考值）。
 */
export const F0 = 2721;
const B_LINE = 2729, B_CURSOR = 2739, B_POP = 2751, B_CHECK = 2804, B_TAG = 2805, B_STRIKE = 2809, TO = 2858, EXIT_LEN = 8;
const MONO = "'SF Mono', Menlo, Consolas, monospace";
const GLOW_GREEN = '0 0 22px 7px rgba(143,247,64,.5), 0 0 44px 14px rgba(143,247,64,.28)';

// 缩微结构图（0.4×，左侧）
const DM = {cx: 300, cy: 330, scale: 0.4};
const BLK = DIAG.blocks[0]; // block1 = AndroidManifest.xml
const B1X = DM.cx + (BLK.x + BLK.w / 2 - DIAG.center.x) * DM.scale;
const B1Y = DM.cy + (BLK.y + BLK.h / 2 - DIAG.center.y) * DM.scale;
// 绿引线：目录卡左缘 → block1 中心（直达，无折返）
const G0 = {x: DM.cx + (DIAG.card.x - DIAG.center.x) * DM.scale, y: DM.cy + (DIAG.lines[0].y0 - DIAG.center.y) * DM.scale};
// 目标块展示位（1.7× 全尺寸）
const SHOW = {x: 850, y: 320, s: 1.7};

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, EXIT_LEN);
  if (op <= 0) return null;

  const e = easeInOutPow(2.5);
  const dmOp = firstOp(N - 2721, 6);
  // 其余块压灰（目标弹出的同时）
  const dimK = clamp01((N - (B_POP + 4)) / 8);

  // 绿引线 draw-on + 光标滑行
  const lineP = easeOutCubic(clamp01((N - B_LINE) / 10));
  const curT = e(clamp01((N - B_CURSOR) / 12));
  // 目标块弹出：位置/尺寸 kf 14f（起点 = 缩微图内 block1 的精确几何）
  const popT = e(clamp01((N - B_POP) / 14));
  const bx = B1X + (SHOW.x - B1X) * popT;
  const by = B1Y + (SHOW.y - B1Y) * popT;
  const bs = DM.scale + (SHOW.s - DM.scale) * popT;
  const slotOp = clamp01((popT - 0.25) / 0.3); // 原位虚线槽（块离开后可见）
  // 光标：滑行期贴引线，到达后贴块心（呼吸 24 帧周期）
  const cxA = N >= B_POP ? bx : G0.x + (B1X - G0.x) * curT;
  const cyA = N >= B_POP ? by : G0.y + (B1Y - G0.y) * curT;
  const breathe = 1 + 0.16 * Math.sin(((N - B_CURSOR) / 24) * Math.PI * 2);
  const curR = (N >= B_POP ? 7 : 5.5) * breathe;
  const gk = glowOffK(N, TO, 6, EXIT_LEN);

  // Check + unzip 标签 + 灰删除线
  const checkP = clamp01((N - B_CHECK) / 12);
  const tagOp = softOp(N - B_TAG, 8);
  const strikeP = easeOutCubic(clamp01((N - B_STRIKE) / 8));

  return (
    <CameraRig N={N} keys={[{f: 2721, x: 640, y: 360, s: 1}, {f: 2816, x: 640, y: 360, s: 1}, {f: 2858, x: 660, y: 340, s: 1.04}]}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 左侧：缩微结构图（其余块在目标弹出后压灰） */}
        <ZipDiagramFinal N={N} cx={DM.cx} cy={DM.cy} scale={DM.scale} opacity={dmOp} dotFrom={2733} hideFirst={N >= B_POP} dimOthers={dimK * 0.85} />

        {/* 绿引线（直达路径）+ 原位虚线槽 */}
        <Svg bloom={false}>
          {lineP > 0 ? <DrawLine x0={G0.x} y0={G0.y} x1={B1X} y1={B1Y} p={lineP} w={2.2} color={GREEN} opacity={0.9} /> : null}
          {slotOp > 0 ? (
            <rect x={B1X - (BLK.w * DM.scale) / 2} y={B1Y - (BLK.h * DM.scale) / 2} width={BLK.w * DM.scale} height={BLK.h * DM.scale} rx={4} fill="none" stroke={GREY} strokeWidth={1.2} strokeDasharray="5 5" opacity={slotOp * 0.85} />
          ) : null}
        </Svg>

        {/* 弹出的目标块（绿边高亮 + 绿光） */}
        {N >= B_POP ? (
          <div
            style={{
              position: 'absolute',
              left: bx - (BLK.w * bs) / 2,
              top: by - (BLK.h * bs) / 2,
              width: BLK.w,
              height: BLK.h,
              transform: `scale(${bs.toFixed(4)})`,
              transformOrigin: '50% 50%',
            }}
          >
            <div style={{position: 'absolute', inset: -5, borderRadius: 10, boxShadow: GLOW_GREEN, opacity: gk}} />
            <FileEntryBlock x={0} y={0} w={BLK.w} h={BLK.h} stroke={GREEN} />
          </div>
        ) : null}

        {/* 绿光标（滑行 → 贴块心呼吸） */}
        <Svg>
          {N >= B_CURSOR ? <circle cx={cxA} cy={cyA} r={curR} fill={GREEN} style={{filter: `drop-shadow(0 0 ${8 * gk}px rgba(143,247,64,.9))`}} /> : null}
        </Svg>

        {/* 目标块标签（弹出落定后） */}
        <CText cx={SHOW.x} cy={SHOW.y + (BLK.h * SHOW.s) / 2 + 26} size={24} weight={600} family={MONO} color={WHITE} opacity={softOp(N - (B_POP + 10), 8)}>AndroidManifest.xml</CText>

        {/* 绿 Check（2804 "不用解开其余"） */}
        <Check cx={SHOW.x + (BLK.w * SHOW.s) / 2 + 6} cy={SHOW.y - (BLK.h * SHOW.s) / 2 + 8} size={44} p={checkP} sw={7} />

        {/* unzip 标签 + 灰删除线（"不做这件事"） */}
        {tagOp > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: tagOp}}>
            <CText cx={SHOW.x} cy={SHOW.y + (BLK.h * SHOW.s) / 2 + 72} size={24} weight={600} family={MONO} color={GREY}>unzip</CText>
            <Svg bloom={false}>
              {strikeP > 0 ? (
                <line x1={SHOW.x - 38} y1={SHOW.y + (BLK.h * SHOW.s) / 2 + 72} x2={SHOW.x - 38 + 76 * strikeP} y2={SHOW.y + (BLK.h * SHOW.s) / 2 + 72} stroke={GREY_MID} strokeWidth={4} strokeLinecap="round" opacity={0.95} />
              ) : null}
            </Svg>
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};

export default SC19;
