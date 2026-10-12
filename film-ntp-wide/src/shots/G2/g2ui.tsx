import React from 'react';
import {PURPLE_LIGHT, GREY_MID, GREY_LIGHT, WHITE, abs, mixHex} from '../../ui';

/**
 * G2 共用（第 2 章上：S09–S13）。
 * - quadPt：二次贝塞尔取点（SC06 信号弧 / SC07 询问信封弧线共用）。
 * - LaptopGlyph：`your laptop` 简笔（屏幕 + 键盘底座 + 屏内小钟）。
 *   屏内小钟 = 章一「石英钟」母题：grey = 自己走着的普通钟（SC07）；
 *   purple + glowK = 收到 GPS 耳语点亮（SC06，1263 拍后随信号点亮）。
 *   尺寸是配角档（w 96–120），主角不在这里。
 */

/** 二次贝塞尔取点 */
export const quadPt = (t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

/**
 * 笔记本简笔（viewBox 120×68 原生，w 缩放）：
 * 屏幕 64×44 圆角框 + 合页缝 + 梯形底座；screenClock 时屏内一枚小表盘（N 驱动秒针，石英母题）。
 * rot：摇头小弧动（SC07 1329 拍「买不起」），绕 (cx, cy) 旋转。
 */
export const LaptopGlyph: React.FC<{
  cx: number; cy: number; w?: number; N?: number; opacity?: number; rot?: number;
  screenClock?: 'none' | 'grey' | 'purple'; clockK?: number; glow?: boolean;
}> = ({cx, cy, w = 120, N = 0, opacity = 1, rot = 0, screenClock = 'none', clockK = 0, glow = false}) => {
  const s = w / 120;
  const tick = (N % 60) * 6 - 90; // 秒针角（度）
  const handCol = screenClock === 'purple' ? mixHex(GREY_MID, PURPLE_LIGHT, clockK) : GREY_MID;
  return (
    <div style={{
      ...abs(cx - w / 2, cy - (68 * s) / 2, w, 68 * s), opacity,
      transformOrigin: `${cx}px ${cy}px`, transform: rot ? `rotate(${rot.toFixed(2)}deg)` : undefined,
      filter: glow ? 'drop-shadow(0 0 8px rgba(255,255,255,.35))' : undefined,
    }}>
      <svg width={w} height={68 * s} viewBox="0 0 120 68" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g stroke={WHITE} strokeWidth={2.6} fill="#000" strokeLinejoin="round">
          <rect x={28} y={3} width={64} height={44} rx={4} />
          <path d="M12 53 H108 L114 65 H6 Z" />
        </g>
        {/* 合页缝 */}
        <line x1={28} y1={50.5} x2={92} y2={50.5} stroke={GREY_MID} strokeWidth={1.6} />
        {/* 键盘纹理 */}
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={16 + i * 17} y1={56.5} x2={16 + i * 17} y2={62} stroke={GREY_MID} strokeWidth={1.2} opacity={0.7} />)}
        {/* 屏内小钟（石英母题） */}
        {screenClock !== 'none' ? (
          <g>
            <circle cx={60} cy={25} r={13.5} fill="#000" stroke={handCol} strokeWidth={2}
              opacity={0.4 + 0.6 * (screenClock === 'purple' ? clockK : 0.5)} />
            <line x1={60} y1={25} x2={60 + Math.cos((tick * Math.PI) / 180) * 10} y2={25 + Math.sin((tick * Math.PI) / 180) * 10}
              stroke={screenClock === 'purple' ? PURPLE_LIGHT : GREY_LIGHT} strokeWidth={2} strokeLinecap="round"
              opacity={0.5 + 0.5 * (screenClock === 'purple' ? clockK : 0.6)} />
            <circle cx={60} cy={25} r={1.8} fill={GREY_LIGHT} />
            {screenClock === 'purple' && clockK > 0.03 ? (
              <circle cx={60} cy={25} r={13.5 + 6 * clockK} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.6} opacity={0.5 * clockK} />
            ) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
};
