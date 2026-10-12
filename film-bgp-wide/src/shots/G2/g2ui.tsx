import React from 'react';
import {clamp01} from '../../common';
import {
  MapFrame, GREY, GREY_MID, GREY_LINE, PURPLE_LIGHT, WHITE, glowPurpleS, mixHex,
} from '../../ui';

/**
 * G2 组内共用小图元（不改 ui.tsx；风格：白描边 2–3px + 黑填充）。
 * MapMini = SC04 章首承接件（SC03 地图缩微）；ChipCell = SC04 芯片海；
 * TypeCard / TerritoryQuad / HouseIcon = SC05 外交官镜头的三件套。
 */

/** SC03 地图缩微（章界承接，SC04 右上角在场）：MapFrame 缩微 + 灰白节点 + 细线（SC03 芯片网的余像）。 */
export const MapMini: React.FC<{cx: number; cy: number; w: number; h: number; opacity?: number; dotsOp?: number}> = ({cx, cy, w, h, opacity = 1, dotsOp = 1}) => (
  <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity}}>
    <MapFrame cx={w / 2} cy={h / 2} w={w} h={h} opacity={0.85} />
    <svg width={w} height={h} viewBox="0 0 560 400" style={{position: 'absolute', inset: 0, opacity: dotsOp}}>
      {/* SC03 的稀疏网余像：6 节点 + 细线 */}
      <g stroke={GREY_MID} strokeWidth={2} opacity={0.8}>
        <line x1={110} y1={120} x2={210} y2={255} />
        <line x1={210} y1={255} x2={400} y2={300} />
        <line x1={315} y1={150} x2={465} y2={190} />
        <line x1={110} y1={120} x2={255} y2={80} />
        <line x1={255} y1={80} x2={315} y2={150} />
        <line x1={210} y1={255} x2={315} y2={150} />
      </g>
      {[
        [110, 120, 9], [210, 255, 9], [315, 150, 9], [400, 300, 8], [465, 190, 8], [255, 80, 8],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#000" stroke={i % 3 === 0 ? GREY : GREY_MID} strokeWidth={2} />
          <circle cx={x} cy={y} r={2.2} fill={GREY} />
        </g>
      ))}
    </svg>
  </div>
);

/** 小芯片格（SC04 芯片海 6×5）：引脚 + 圆角方 + 状态灯 + 芯片内电路线，无文字（SC03 缩微后的「海」用）。
 *  litK = 描边灰→白亮度（点亮）；ledK = 状态灯强度（默认同 litK，可单独迟到）；ledOp = 轮闪乘子。 */
export const ChipCell: React.FC<{cx: number; cy: number; size?: number; litK?: number; ledK?: number; ledOp?: number; opacity?: number; scale?: number}> = ({cx, cy, size = 60, litK = 0, ledK, ledOp = 1, opacity = 1, scale = 1}) => {
  const led = Math.min(1, (ledK === undefined ? litK : ledK)) * ledOp;
  const stroke = mixHex(GREY_LINE, '#E2E2E2', clamp01(litK) * 0.9);
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity, transform: `scale(${scale.toFixed(4)})`}}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{position: 'absolute', inset: 0}}>
        {/* 引脚（单 path，省 DOM） */}
        <path d="M0 28 H5 M0 60 H5 M0 92 H5 M115 28 H120 M115 60 H120 M115 92 H120" stroke={GREY_MID} strokeWidth={4} />
        <rect x={5} y={5} width={110} height={110} rx={14} fill="#000" stroke={stroke} strokeWidth={3.5} />
        {/* 内部电路线 */}
        <path d="M22 82 H98 M60 40 V82" stroke={GREY_MID} strokeWidth={2} fill="none" opacity={0.22 + 0.4 * clamp01(litK)} />
        {led > 0.02 ? <circle cx={100} cy={100} r={5.5} fill={PURPLE_LIGHT} opacity={led.toFixed(3)} /> : null}
      </svg>
    </div>
  );
};

/** SC05 类型标签卡（ISP / cloud / university）：黑底白边圆角 + 左侧小图标 + 白字；glowK = 提到该词时的紫光。 */
const TYPE_ICONS: Record<'isp' | 'cloud' | 'uni', React.ReactNode> = {
  isp: (
    <g stroke={WHITE} strokeWidth={2.2} fill="none" strokeLinecap="round">
      <circle cx={14} cy={21} r={2.6} fill={WHITE} stroke="none" />
      <path d="M8.2 15.8 Q14 10.6 19.8 15.8" />
      <path d="M4.6 11.2 Q14 3.4 23.4 11.2" />
    </g>
  ),
  cloud: <path d="M7 20 Q6 13 13 12.5 Q15 7 20.5 8.6 Q26 9.4 25.4 15 Q28.4 19 24 20.4 H8.4 Q6.8 20.6 7 20 Z" stroke={WHITE} strokeWidth={2.2} fill="none" strokeLinejoin="round" />,
  uni: (
    <g stroke={WHITE} strokeWidth={2.2} fill="none" strokeLinecap="round">
      <path d="M4.5 10.5 L14 4.5 L23.5 10.5 Z" strokeLinejoin="round" />
      <path d="M8 13.5 V21.5 M12 13.5 V21.5 M16 13.5 V21.5 M20 13.5 V21.5" />
      <path d="M5.5 24.5 H22.5" />
    </g>
  ),
};

export const TypeCard: React.FC<{cx: number; cy: number; w: number; text: string; kind: 'isp' | 'cloud' | 'uni'; glowK?: number; opacity?: number; scale?: number}> = ({cx, cy, w, text, kind, glowK = 0, opacity = 1, scale = 1}) => (
  <div style={{
    position: 'absolute', left: cx - w / 2, top: cy - 60, width: w, height: 120, borderRadius: 12,
    background: '#000', border: `2px solid ${WHITE}`, boxSizing: 'border-box', opacity,
    transform: `scale(${scale.toFixed(4)})`,
    boxShadow: glowK > 0.02 ? glowPurpleS(glowK) : undefined,
  }}>
    <svg width={52} height={52} viewBox="0 0 28 28" style={{position: 'absolute', left: 22, top: 34}}>{TYPE_ICONS[kind]}</svg>
    <div style={{position: 'absolute', left: 50, right: 10, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Exo 2',sans-serif", fontWeight: 600, fontSize: 40, color: WHITE, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
);

/** SC05 领地象限（MapFrame 的四分之一）：虚线框 + 左上紫刻度 L + 角点 + 淡网格；glowK = 1121 拍的紫光晕。 */
export const TerritoryQuad: React.FC<{cx: number; cy: number; w?: number; h?: number; glowK?: number; opacity?: number; children?: React.ReactNode}> = ({cx, cy, w = 340, h = 250, glowK = 0, opacity = 1, children}) => (
  <div style={{
    position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: 8, opacity,
    boxShadow: glowK > 0.02 ? glowPurpleS(0.75 * clamp01(glowK)) : undefined,
  }}>
    <svg width={w} height={h} viewBox="0 0 340 250" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={6} fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray="10 8" opacity={0.9} />
      {/* 左上角紫刻度（MapFrame 同款） */}
      <g stroke={PURPLE_LIGHT} strokeWidth={3.5}>
        <line x1={3} y1={3} x2={21} y2={3} />
        <line x1={3} y1={3} x2={3} y2={21} />
      </g>
      {/* 淡虚网格（象限内） */}
      <g stroke={GREY_LINE} strokeWidth={1} strokeDasharray="4 10" opacity={0.4}>
        <line x1={w / 2} y1={10} x2={w / 2} y2={h - 10} />
        <line x1={10} y1={h / 2} x2={w - 10} y2={h / 2} />
      </g>
      {[[22, 22], [w - 22, 22], [22, h - 22], [w - 22, h - 22]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={GREY_MID} />)}
    </svg>
    {children}
  </div>
);

/** SC05 领地里的小房子：屋顶 + 房身 + 门 + 烟囱（白描边黑填充）。 */
export const HouseIcon: React.FC<{cx: number; cy: number; w?: number; opacity?: number; scale?: number}> = ({cx, cy, w = 112, opacity = 1, scale = 1}) => {
  const h = w * (100 / 120);
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity, transform: `scale(${scale.toFixed(4)})`}}>
      <svg width={w} height={h} viewBox="0 0 120 100" style={{position: 'absolute', inset: 0}}>
        <path d="M82 22 H94 V38" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M18 46 L60 12 L102 46 Z" fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={24} y={46} width={72} height={46} rx={3} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        <rect x={52} y={62} width={16} height={30} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        <circle cx={61} cy={78} r={2} fill={WHITE} />
      </svg>
    </div>
  );
};
