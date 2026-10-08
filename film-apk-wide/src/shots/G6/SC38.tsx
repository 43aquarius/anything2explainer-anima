import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, kf, powOutRemain, stepKf, easeOutCubic, FONT_MONO} from '../../common';
import {CText, ManifestCard, DocIcon, Box, LineArrow, WHITE, GREY, PURPLE_LIGHT, exitOp, glowOffK, softOp, abs} from '../../ui';
import {CameraRig, HeroGlow} from '../../fx';

/**
 * SC38 面单字段（ManifestCard 主角镜头）· N 5437–5660（S38 5445–5658：
 * 5445「The manifest is binary XML:」/ 5517「name, version, every permission the app wants,」/ 5619「every screen it can show.」）
 * 5445 大 ManifestCard（350×330 基准卡外包 scale 1.4 → 490×462 主角）slideUp Δ110/22f → 落位 5467 白闪 3f（AXML·binary 徽标为卡内置顶栏，随卡入场）；
 * 5468–5501 运镜 1→1.08 推向面单卡（33f，CameraRig，屏空间中心 (640,355)，全内容留在安全区内）；
 * 5501–5516 左下小注：`text XML` 文档图标（灰删除线）→ 箭头 draw-on → `binary` 白块；
 * 5517/5533/5553/5573/5619 五行字段逐行 reveal（revealP 阶梯 + 行遮罩左→右 10f wipe = 「读取中」），
 *   permission 行橙色（卡内置）+ 橙色闪现渐稳的敏感行底光；读取光标（紫下划线，24f 周期闪烁）逐行下移（持续动作），
 *   末行（activity，对齐 5619 节拍）落位后光标停驻闪烁至离场。
 * 段内镜头（停留不判）：末行 reveal 5619+10 → 离场 5653（TO−8），hold ~22f（段内可接受，读数已记录）。末 8 帧归零（紫光先灭 6f）。
 * 本镜零 glitch、零扫光。行数据 = EXAMPLE.manifestRows（package/version/permission×2/activity）。
 */
const F0 = 5437, TO = 5660;
const B_CARD = 5445, B_FLASH = 5467, CAM0 = 5468, CAM1 = 5501, B_ANN = 5501, B_STRIKE = 5503, B_ARROW = 5506, B_BIN = 5510;
const ROWS_T = [5517, 5533, 5553, 5573, 5619]; // 五行 reveal（第 5 行对齐 5619 节拍）

const CW = 350, CH = 330, CS = 1.4; // 基准卡 350×330，外包 1.4× → 490×462
const CARD = {x: 445, y: 132}; // 缩放后外框左上（y 132–594，内容主区内）
const ROW_TOP = (i: number) => 58 + i * ((CH - 70) / 5); // 行顶（卡内坐标，与 ManifestCard 内部布局一致）
const CAM_KEYS = [
  {f: CAM0, x: 640, y: 355, s: 1},
  {f: CAM1, x: 640, y: 355, s: 1.08},
];

export const SC38: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  if (op <= 0) return null;
  const gk = glowOffK(N, TO, 6);

  // 卡 slideUp Δ110/22f + 落位白闪（brightness 1.45 → 1，3f）
  const slide = 110 * powOutRemain(N - B_CARD, 22, 2.5);
  const cardOp = softOp(N - B_CARD, 8);
  const flash = N >= B_FLASH && N < B_FLASH + 3 ? 1 - (N - B_FLASH) * 0.33 : 0;
  const glowK = clamp01((N - (B_CARD + 4)) / 12) * gk;

  // 行 reveal：阶梯 revealP（shown=round(revealP·5)）+ 每行遮罩 10f 左→右 wipe
  const revealP = stepKf(N, [[F0, 0], [ROWS_T[0], 0.2], [ROWS_T[1], 0.4], [ROWS_T[2], 0.6], [ROWS_T[3], 0.8], [ROWS_T[4], 1]]);
  const wipe = (i: number) => clamp01((N - ROWS_T[i]) / 10);
  // permission 行（i=2,3）：橙色闪现 → 渐稳底光（敏感字段）
  const permA = (i: number) => {
    const t = N - ROWS_T[i] - 3;
    return t < 0 ? 0 : 0.26 * Math.exp(-t / 6) + 0.09 * clamp01(t / 2);
  };
  // 读取光标：驻留行落位 → 10f 滑到下一行；5577–5619 停在最后一行 permission（等待 activity 节拍）；到位后 24f 周期闪烁（持续动作）
  const cursorY = kf(N, [
    [ROWS_T[0], ROW_TOP(0) + 36],
    [ROWS_T[0] + 10, ROW_TOP(0) + 36],
    [ROWS_T[1], ROW_TOP(1) + 36],
    [ROWS_T[1] + 14, ROW_TOP(1) + 36],
    [ROWS_T[2] - 4, ROW_TOP(2) + 36],
    [ROWS_T[2] + 10, ROW_TOP(2) + 36],
    [ROWS_T[3], ROW_TOP(3) + 36],
    [ROWS_T[3] + 46, ROW_TOP(3) + 36],
    [ROWS_T[4] + 10, ROW_TOP(4) + 36],
  ] as Array<[number, number]>);
  const cursorOp = N >= ROWS_T[0] ? 0.62 + 0.38 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 24)) : 0;

  // 左下小注：text XML（灰删除线）→ 箭头 → binary
  const annOp = softOp(N - B_ANN, 8);
  const strikeP = easeOutCubic(clamp01((N - B_STRIKE) / 8));
  const arrowP = clamp01((N - B_ARROW) / 10);
  const binOp = softOp(N - B_BIN, 8);

  return (
    <CameraRig N={N} keys={CAM_KEYS}>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>
        {/* 大 ManifestCard（外包 scale 1.4；slideUp + 落位白闪 + 卡后紫柔光呼吸） */}
        {cardOp > 0 ? (
          <div
            style={{
              ...abs(CARD.x, CARD.y + slide, CW * CS, CH * CS),
              opacity: cardOp,
              filter: flash > 0 ? `brightness(${(1 + 0.45 * flash).toFixed(2)})` : undefined,
            }}
          >
            <HeroGlow x={0} y={0} w={CW * CS} h={CH * CS} r={20} N={N} k={glowK} />
            <div style={{...abs(0, 0, CW * CS, CH * CS), transform: `scale(${CS})`, transformOrigin: '0 0'}}>
              <ManifestCard x={0} y={0} w={CW} h={CH} revealP={revealP} active />
              {/* permission 敏感行底光（橙，闪现→渐稳；画在行文字之上、遮罩之下） */}
              {[2, 3].map((i) =>
                permA(i) > 0.001 ? (
                  <div key={`p${i}`} style={{...abs(14, ROW_TOP(i) - 6, 322, 36), background: `rgba(240,95,65,${permA(i).toFixed(3)})`}} />
                ) : null,
              )}
              {/* 行遮罩：reveal 后 10f 左→右 wipe（读取中的显影） */}
              {ROWS_T.map((t, i) => {
                const w = wipe(i);
                if (w <= 0 || w >= 1) return null;
                const left = 16 + 322 * w;
                return <div key={`c${i}`} style={{...abs(left, ROW_TOP(i) - 6, 336 - left, 36), background: '#000'}} />;
              })}
              {/* 读取光标（紫下划线 + 闪烁，逐行下移的持续动作） */}
              {cursorOp > 0 ? (
                <div
                  style={{
                    ...abs(16, cursorY, 318, 4),
                    background: PURPLE_LIGHT,
                    borderRadius: 2,
                    boxShadow: `0 0 10px 3px rgba(102,48,248,${(0.7 * gk).toFixed(2)})`,
                    opacity: cursorOp,
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {/* 左下小注：text XML（灰删除线）→ 箭头 → binary */}
        {annOp > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: annOp}}>
            <DocIcon x={88} y={468} w={72} h={92} lines={4} color={GREY} />
            {strikeP > 0 ? (
              <svg width={12} height={12} viewBox="0 0 12 12" style={{position: 'absolute', left: 80, top: 474, overflow: 'visible'}}>
                <line x1={0} y1={2} x2={84 * strikeP} y2={2 + 70 * strikeP} stroke={GREY} strokeWidth={4.5} strokeLinecap="round" />
              </svg>
            ) : null}
            <CText cx={124} cy={582} size={22} weight={600} color={GREY}>
              text XML
            </CText>
            {arrowP > 0 ? <LineArrow x0={182} y1={514} x1={258} y0={514} p={arrowP} rodW={3} headL={16} headW={18} opacity={0.85} /> : null}
            {binOp > 0 ? (
              <div style={{position: 'absolute', inset: 0, opacity: binOp}}>
                <Box x={268} y={486} w={118} h={58} r={8} sw={2.5} />
                <CText cx={327} cy={515} size={26} weight={700} family={FONT_MONO} color={WHITE}>
                  binary
                </CText>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </CameraRig>
  );
};

export default SC38;
