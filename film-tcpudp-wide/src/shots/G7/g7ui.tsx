import React from 'react';
import {abs, GamepadIcon, BLOOM_SOFT, GREY, GREY_MID, GREY_LIGHT, WHITE, PURPLE_LIGHT} from '../../ui';
import {FONT_MONO, FONT_ORB} from '../../common';

/**
 * G7 组内共用小图元（组目录 g7ui.tsx，规则：组内特有的放这里，不改 ui.tsx）。
 * SC30 两列清单的行卡图标 + SC31 端口旗/端口轨。风格：黑填充 + 白描边 2.5px + BLOOM_SOFT。
 * 成片 v1 修复（tcpudp-wide-fix-C）：图标微动作加大幅度（骨架线 22 帧交替 / 振动环 ±6° / 折页角 40 帧翻动），
 * 新增 DocGlyphLive（折页角）与 PortRailX（SC31 双格亮 tick）。
 */

/** 网页图标（`web pages` 行）：迷你浏览器窗（外框 + 顶栏双点 + 两条骨架线）。phase 驱动骨架线交替闪（22 帧周期，亮度 0.4↔0.9，持续动作）。viewBox 100×78。 */
export const WebGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; color?: string; phase?: number}> = ({cx, cy, w = 88, opacity = 1, color = WHITE, phase = 0}) => {
  const h = w * 0.78;
  const a = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin((2 * Math.PI * phase) / 22));
  const b = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin((2 * Math.PI * phase) / 22 + Math.PI));
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 100 78" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT}}>
        <rect x="3" y="3" width="94" height="72" rx="6" fill="#000" stroke={color} strokeWidth="3" />
        <line x1="3" y1="20" x2="97" y2="20" stroke={color} strokeWidth="2.5" />
        <circle cx="13" cy="11.5" r="2.6" fill="none" stroke={GREY_MID} strokeWidth="2" />
        <circle cx="22" cy="11.5" r="2.6" fill="none" stroke={GREY_MID} strokeWidth="2" />
        <line x1="12" y1="36" x2="88" y2="36" stroke={GREY_LIGHT} strokeWidth="3.4" opacity={a} strokeLinecap="round" />
        <line x1="12" y1="54" x2="72" y2="54" stroke={GREY_LIGHT} strokeWidth="3.4" opacity={b} strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** 银行楼柱图标（`banking` 行）：山形楣 + 4 根柱 + 基座。phase 驱动 4 柱按 8 帧轮亮（marquee，亮柱加粗提亮，持续动作）。viewBox 100×84。 */
export const BankGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; color?: string; phase?: number}> = ({cx, cy, w = 84, opacity = 1, color = WHITE, phase = 0}) => {
  const h = w * 0.84;
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 100 84" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT}}>
        <path d="M50 4 L96 26 L4 26 Z" fill="#000" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        {[16, 36, 56, 76].map((x, i) => {
          const lit = Math.floor(phase / 8) % 4 === i;
          return <line key={x} x1={x} y1="33" x2={x} y2="66" stroke={lit ? WHITE : GREY_MID} strokeWidth={lit ? 6 : 3} opacity={lit ? 1 : 0.55} strokeLinecap="round" />;
        })}
        <line x1="6" y1="73" x2="94" y2="73" stroke={color} strokeWidth="3.5" />
      </svg>
    </div>
  );
};

/** 电话听筒图标（`calls` 行）：经典听筒弧 + 话音弧。ringP 0–1 驱动两侧振动弧亮起；rot 为振动弧绕图标中心的往复旋转（±6°、24 帧周期，持续动作，「活的通话」）。viewBox 100×84。 */
export const PhoneGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; color?: string; ringP?: number; rot?: number}> = ({cx, cy, w = 84, opacity = 1, color = WHITE, ringP = 0, rot = 0}) => {
  const h = w * 0.84;
  // 振动弧：ringP 0→1 内两对弧依次亮起再收（弧半径随 ringP 外扩）
  const arc = (x: number, dir: number, k: number) => {
    const r = 14 + 10 * k;
    return <path d={`M ${x + dir * 4} 30 q ${dir * r} 12 ${0} 24`} fill="none" stroke={color} strokeWidth={2.6} opacity={0.85 * k} strokeLinecap="round" />;
  };
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <svg width={w} height={h} viewBox="0 0 100 84" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT, overflow: 'visible'}}>
        {/* 听筒（旋转 -35° 的胶囊 + 弧柄） */}
        <g transform="rotate(-35 50 42)">
          <rect x="44" y="10" width="12" height="34" rx="6" fill="#000" stroke={color} strokeWidth="3" />
          <rect x="27" y="6" width="15" height="14" rx="6" fill="#000" stroke={color} strokeWidth="3" />
          <rect x="58" y="6" width="15" height="14" rx="6" fill="#000" stroke={color} strokeWidth="3" />
        </g>
        {ringP > 0 ? (
          <g transform={rot ? `rotate(${rot.toFixed(2)} 50 42)` : undefined}>
            {arc(30, -1, ringP)}
            {arc(70, 1, ringP)}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/** 放大镜图标（`lookups` 行）：镜片 + 柄 + 镜心查询点（橙，dotP 呼吸）。viewBox 100×100。 */
export const MagnifierGlyph: React.FC<{cx: number; cy: number; w?: number; opacity?: number; color?: string; dotP?: number}> = ({cx, cy, w = 80, opacity = 1, color = WHITE, dotP = 0}) => {
  return (
    <div style={{...abs(cx - w / 2, cy - w / 2, w, w), opacity}}>
      <svg width={w} height={w} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, filter: BLOOM_SOFT}}>
        <circle cx="42" cy="42" r="26" fill="#000" stroke={color} strokeWidth="3.2" />
        <line x1="61" y1="61" x2="86" y2="86" stroke={color} strokeWidth="6" strokeLinecap="round" />
        {dotP > 0 ? <circle cx="42" cy="42" r={5 + 2 * dotP} fill="#F05F41" opacity={0.5 + 0.5 * dotP} /> : null}
      </svg>
    </div>
  );
};

/** 文档图标（`files` 行）：DocIcon 同款页面 + 折页角每 40 帧翻动一次（12 帧内 scaleX 1→−0.55→1 绕折线，像掀起又落下的狗耳；低透明度脉冲，不新增元素）。phase 驱动。 */
export const DocGlyphLive: React.FC<{x: number; y: number; w?: number; h?: number; lines?: number; opacity?: number; phase?: number; color?: string}> = ({x, y, w = 44, h = 42, lines = 3, opacity = 1, phase = 0, color = WHITE}) => {
  const sw = 2;
  const f = w * 0.3;
  const local = (((phase % 40) + 40) % 40);
  const k = local < 12 ? Math.sin(Math.PI * (local / 12)) : 0; // 0→1→0（翻动中）
  const flap = 1 - 1.55 * k; // scaleX：1 → −0.55 → 1（翻过折线再落回）
  return (
    <div style={{...abs(x, y, w, h), opacity}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <path d={`M${sw / 2},${sw / 2} H${w - f - sw / 2} L${w - sw / 2},${f + sw / 2} V${h - sw / 2} H${sw / 2} Z`} fill="#000" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        {Array.from({length: lines}, (_, i) => {
          const ly = f + 10 + i * ((h - f - 18) / Math.max(1, lines - 1 + 0.6));
          const lw = (i === lines - 1 ? 0.55 : 0.72) * w;
          return <rect key={i} x={w * 0.14} y={ly} width={lw} height={3} fill={color} opacity={0.85} />;
        })}
        {/* 折页角（翻动：绕竖直折线 scaleX，中点翻到折线左侧 = 掀起的狗耳） */}
        <path d={`M${w - f - sw / 2},${sw / 2} L${w - sw / 2},${f + sw / 2} L${w - f - sw / 2},${f + sw / 2} Z`}
          fill="#000" stroke={color} strokeWidth={sw} strokeLinejoin="round" opacity={1 - 0.45 * k}
          style={{transformOrigin: `${w - f}px ${f / 2}px`, transform: `scaleX(${flap.toFixed(3)})`}} />
      </svg>
    </div>
  );
};
/** 手柄（`games` 行）：复用 ui.tsx GamepadIcon + 两枚 accent 键按 30 帧交替闪（轮流亮 + 半径同步脉动，持续动作，分镜表「手柄按键闪」）。 */
export const GamepadLive: React.FC<{cx: number; cy: number; size?: number; opacity?: number; color?: string; accent?: string; phase?: number}> = ({cx, cy, size = 84, opacity = 1, color = WHITE, accent, phase = 0}) => {
  const a = 0.5 + 0.5 * Math.sin((2 * Math.PI * phase) / 30);
  const b = 0.5 + 0.5 * Math.sin((2 * Math.PI * phase) / 30 + Math.PI);
  return (
    <div style={{...abs(cx - size / 2, cy - size / 2, size, size), opacity}}>
      <GamepadIcon cx={size / 2} cy={size / 2} size={size} color={color} accent={GREY_MID} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={size * 0.62} cy={size * 0.44} r={size * 0.062 * (0.85 + 0.5 * a)} fill="#F05F41" opacity={0.35 + 0.65 * a} />
        <circle cx={size * 0.76} cy={size * 0.56} r={size * 0.062 * (0.85 + 0.5 * b)} fill="#F05F41" opacity={0.35 + 0.65 * b} />
      </svg>
    </div>
  );
};

/**
 * 端口旗（SC31）：旗杆（自 railY 向 dir 方向伸出 44px）+ 旗盒（label + 可选 sub 小字）。
 * scale 供 stampIn（1.4→1，绕旗盒中心）；glow 传 boxShadow 字串。旗盒黑底描边。
 * sway 为旗面摆动角（度，绕旗盒底边的 skewX，±3°、30 帧周期，成片 v1 修复）——旗杆不动，只有旗面像布一样摆。
 */
export const FlagMark: React.FC<{
  cx: number; railY: number; dir?: 'up' | 'down'; label: string; sub?: string;
  w?: number; h?: number; color?: string; labelColor?: string; scale?: number; opacity?: number; glow?: string; poleFlash?: boolean; sway?: number;
}> = ({cx, railY, dir = 'up', label, sub, w = 104, h = 58, color, labelColor, scale = 1, opacity = 1, glow, poleFlash = false, sway = 0}) => {
  const h2 = sub ? h : h - 12; // 无 sub 时旗盒矮一档
  const POLE = 44;
  const boxTop = dir === 'up' ? railY - POLE - h2 : railY + POLE;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {/* 旗杆（自轨边长出；poleFlash 时白闪） */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={cx} y1={railY + (dir === 'up' ? -5 : 5)} x2={cx} y2={dir === 'up' ? railY - POLE : railY + POLE}
          stroke={poleFlash ? WHITE : color ?? GREY} strokeWidth={poleFlash ? 4 : 3} strokeLinecap="round" />
      </svg>
      {/* 旗盒（scale 绕自身中心；内层旗面 skewX 绕底边摆动） */}
      <div style={{...abs(cx - w / 2, boxTop, w, h2), transform: scale !== 1 ? `scale(${scale.toFixed(3)})` : undefined, transformOrigin: `${cx}px ${boxTop + h2 / 2}px`}}>
        <div style={{position: 'absolute', inset: 0, boxSizing: 'border-box', background: 'rgba(0,0,0,0.92)',
          border: `2.5px solid ${color ?? GREY}`, borderRadius: 6, boxShadow: glow,
          transform: sway ? `skewX(${(-sway).toFixed(2)}deg)` : undefined, transformOrigin: '50% 100%'}}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2}}>
            <span style={{fontFamily: "'Orbitron','Audiowide',sans-serif", fontSize: 26, fontWeight: 700, color: labelColor ?? WHITE, lineHeight: 1, whiteSpace: 'nowrap'}}>{label}</span>
            {sub ? <span style={{fontFamily: "'SF Mono',Menlo,Consolas,monospace", fontSize: 22, color: GREY, lineHeight: 1, whiteSpace: 'nowrap'}}>{sub}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 端口数轴·组内增强版（SC31，成片 v1 修复）：ui.tsx PortRail 的同款版式，tick 轮亮改为**同时亮相邻 2 格**，
 * 亮格加高（28px ≈ 1.4× 原 22px 亮格）、加宽到 3.5px 并带 2px 同色光晕（更亮），轮亮节拍仍 12 帧一格。
 */
export const PortRailX: React.FC<{x: number; y: number; w: number; label: string; color?: string; sweepP?: number; endL?: string; endR?: string; endSize?: number; opacity?: number; tickN?: number}> = ({x, y, w, label, color = PURPLE_LIGHT, sweepP = 0, endL = '0', endR = '65,535', endSize = 34, opacity = 1, tickN = 0}) => {
  const cur = Math.floor(tickN / 12) % 11;
  return (
    <div style={{...abs(x, y - 46, w, 92), opacity}}>
      <div style={{position: 'absolute', left: 0, top: 46, width: w, height: 10, background: '#000', border: `2.5px solid ${color}`}} />
      <div style={{position: 'absolute', left: 0, top: 46, width: Math.max(0, sweepP * w - 4), height: 10, background: color, opacity: 0.35}} />
      {Array.from({length: 11}).map((_, i) => {
        const tx = (i / 10) * (w - 8) + 4;
        const hot = tickN > 0 && (i === cur || i === (cur + 1) % 11);
        return <div key={i} style={{position: 'absolute', left: hot ? tx - 0.5 : tx, top: hot ? 37 : 44, width: hot ? 3.5 : 2.5, height: hot ? 28 : 14,
          background: hot ? color : GREY_MID, boxShadow: hot ? `0 0 2px 1px ${color}` : undefined}} />;
      })}
      <div style={{position: 'absolute', left: 0, top: 8, width: w, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 26, color}}>{label}</div>
      <div style={{position: 'absolute', left: 0, top: 64, fontFamily: FONT_ORB, fontSize: endSize, color: GREY_LIGHT}}>{endL}</div>
      <div style={{position: 'absolute', right: 0, top: 64, fontFamily: FONT_ORB, fontSize: endSize, color: GREY_LIGHT}}>{endR}</div>
    </div>
  );
};
