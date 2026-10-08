import React from 'react';
import {clamp01, kf, easeOutCubic, FONT_MONO} from '../../common';
import {CText, ParcelIcon, PersonIcon, abs, WHITE, GREY, GREY_MID, GREY_LINE, PURPLE_LIGHT, BLOOM_SOFT, GLOW_PURPLE_S} from '../../ui';

/**
 * G7b 组内图元（第 3 章下半下半段：SC45–SC48，沙箱 → 图标出现 → 从未解压 → 被一截一截读）。
 * 全部纯函数（动画量由调用方按 N 算好传入）；随机只用 rnd（本组无随机元素）。
 *
 * 几何常量：
 *   FENCE —— SC45 的「围墙沙箱」（x 400–880, y 200–500，分镜表坐标）
 *   HOUSE45 —— SC45 沙箱内小屋（含门 / 窗 / 门牌位）
 *   DIR48 —— SC48 的 /data/app 目录屋（按 G6/g6ui DirectoryHouse 的同款几何放大复制：
 *            屋体 + 三角屋顶 + 两横一竖文件架 + 灰邻居包裹；中排给大包裹让位）
 */

// ---------- SC45：围墙沙箱 ----------
export const FENCE = {x: 400, y: 200, w: 480, h: 300};

/** 围栏（四面墙依次合围 draw-on + 角柱 + 栅栏尖）：p = 总进度 0–1（18 帧线性给 kf/ease） */
export const SandboxFence: React.FC<{p: number; opacity?: number}> = ({p, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const walls = [
    {x0: FENCE.x, y0: FENCE.y, x1: FENCE.x + FENCE.w, y1: FENCE.y, horiz: true}, // 上 →
    {x0: FENCE.x + FENCE.w, y0: FENCE.y, x1: FENCE.x + FENCE.w, y1: FENCE.y + FENCE.h, horiz: false}, // 右 ↓
    {x0: FENCE.x + FENCE.w, y0: FENCE.y + FENCE.h, x1: FENCE.x, y1: FENCE.y + FENCE.h, horiz: true}, // 下 ←
    {x0: FENCE.x, y0: FENCE.y + FENCE.h, x1: FENCE.x, y1: FENCE.y, horiz: false}, // 左 ↑
  ];
  // 角柱：被「以该角收尾的那面墙」点亮（左上=左墙末 / 右上=上墙末 / 右下=右墙末 / 左下=下墙末）
  const posts: Array<{x: number; y: number; at: number}> = [
    {x: FENCE.x, y: FENCE.y, at: 0.97},
    {x: FENCE.x + FENCE.w, y: FENCE.y, at: 0.25},
    {x: FENCE.x + FENCE.w, y: FENCE.y + FENCE.h, at: 0.5},
    {x: FENCE.x, y: FENCE.y + FENCE.h, at: 0.75},
  ];
  // 栅栏尖：横墙 9 枚 / 竖墙 5 枚，随本墙进度沿墙依次冒出
  const pickets: Array<{x: number; y: number; w: number; h: number; wi: number; f: number}> = [];
  walls.forEach((wl, i) => {
    const pi = clamp01(p * 4 - i);
    if (pi <= 0) return;
    const n = wl.horiz ? 9 : 5;
    for (let j = 1; j <= n; j++) {
      const f = j / (n + 1);
      const t = wl.x0 + (wl.x1 - wl.x0) * (wl.horiz ? f : 1);
      const ty = wl.y0 + (wl.y1 - wl.y0) * (wl.horiz ? 1 : f);
      pickets.push(
        wl.horiz
          ? {x: t - 1.5, y: ty + (i === 0 ? 1 : -17), w: 3, h: 16, wi: i, f}
          : {x: t + (i === 1 ? -17 : 1), y: ty - 1.5, w: 16, h: 3, wi: i, f},
      );
    }
  });
  return (
    <svg width={FENCE.w + 60} height={FENCE.h + 60} viewBox={`0 0 ${FENCE.w + 60} ${FENCE.h + 60}`} style={{position: 'absolute', left: FENCE.x - 30, top: FENCE.y - 30, overflow: 'visible', filter: BLOOM_SOFT, opacity}}>
      <g transform="translate(30,30)">
        {walls.map((wl, i) => {
          const pi = clamp01(p * 4 - i);
          if (pi <= 0) return null;
          const L = Math.hypot(wl.x1 - wl.x0, wl.y1 - wl.y0);
          return <line key={i} x1={wl.x0} y1={wl.y0} x2={wl.x1} y2={wl.y1} stroke={WHITE} strokeWidth={2.5} strokeDasharray={L} strokeDashoffset={L * (1 - pi)} />;
        })}
        {posts.map((ps, i) => {
          const op = clamp01((p - ps.at) / 0.06);
          if (op <= 0) return null;
          return <rect key={i} x={ps.x - 6} y={ps.y - 6} width={12} height={12} fill={WHITE} opacity={op} />;
        })}
        {pickets.map((pk, i) => {
          const pi = clamp01(p * 4 - pk.wi);
          const op = clamp01((pi - pk.f) / 0.18);
          if (op <= 0) return null;
          return <rect key={`p${i}`} x={pk.x} y={pk.y} width={pk.w} height={pk.h} fill={WHITE} opacity={op * 0.95} />;
        })}
      </g>
    </svg>
  );
};

// ---------- SC45：沙箱内小屋 ----------
export const HOUSE45 = {x: 555, y: 300, w: 170, h: 120}; // 屋体；屋顶自 y−48 起
export const PLATE45 = {cx: 640, cy: 322, w: 160, h: 38};
export const WIN45 = {x: 672, y: 344, w: 36, h: 34};

/** 小屋（白描边黑填充 + 三角屋顶 + 门 + 暖白窗灯）：winK = 窗灯亮度 0–1（含呼吸由调用方给） */
export const SandboxHouse: React.FC<{opacity?: number; winK: number; winOp?: number}> = ({opacity = 1, winK, winOp = 1}) => {
  if (opacity <= 0) return null;
  const {x, y, w, h} = HOUSE45;
  const roof = 48;
  const door = {x: 57, y: 68, w: 36, h: 52}; // 门（屋底，局部坐标，原点 = 屋体左上）
  const winL = {x: 117, y: 44, w: 36, h: 34}; // 窗（门右侧，局部坐标）
  const win = WIN45;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width={w + 44} height={h + roof + 8} viewBox={`0 0 ${w + 44} ${h + roof + 8}`} style={{position: 'absolute', left: x - 22, top: y - roof, overflow: 'visible', filter: BLOOM_SOFT}}>
        <g transform={`translate(22,${roof})`}>
          {/* 屋体 + 屋顶（屋檐略外挑） */}
          <path d={`M0,0 H${w} V${h} H0 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={`M-16,0 L${w / 2},${-(roof - 4)} L${w + 16},0`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
          {/* 门 + 门把手 */}
          <rect x={door.x} y={door.y} width={door.w} height={door.h} fill="#000" stroke={WHITE} strokeWidth={2} />
          <circle cx={door.x + door.w - 8} cy={door.y + 26} r={2.5} fill={WHITE} />
          {/* 窗框 + 中梃 */}
          <rect x={winL.x} y={winL.y} width={winL.w} height={winL.h} fill="#000" stroke={WHITE} strokeWidth={2} />
          <line x1={winL.x + winL.w / 2} y1={winL.y} x2={winL.x + winL.w / 2} y2={winL.y + winL.h} stroke={WHITE} strokeWidth={1.4} />
        </g>
      </svg>
      {/* 暖白窗灯（持续微呼吸，由调用方传 winK） */}
      <div style={{...abs(win.x, win.y, win.w, win.h), background: `rgba(255,240,214,${(0.5 * winK * winOp).toFixed(3)})`, boxShadow: `0 0 ${Math.round(10 + 6 * winK)}px ${Math.round(3 + 3 * winK)}px rgba(255,238,210,${(0.5 * winK * winOp).toFixed(2)})`}} />
    </div>
  );
};

// ---------- SC45：围栏小锁 ----------
/** 挂锁（挂环 arc draw-on → 锁体淡入 → 锁孔）；p 0–1（12 帧），glowK 紫（GLOW_PURPLE_S 强度） */
export const LockGlyph: React.FC<{cx: number; cy: number; p: number; glowK?: number; opacity?: number}> = ({cx, cy, p, glowK = 0, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const arc = Math.PI * 9; // 挂环半圆长
  const shP = clamp01(p / 0.5);
  const bodyOp = clamp01((p - 0.45) / 0.35);
  const holeOp = clamp01((p - 0.78) / 0.22);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <div style={{...abs(cx - 20, cy - 10, 40, 42), borderRadius: 6, boxShadow: `0 0 24px 8px rgba(102,48,248,${(0.6 * clamp01(glowK)).toFixed(3)})`, opacity: clamp01(glowK) > 0.01 ? 1 : 0}} />
      <svg width={40} height={42} viewBox="0 0 40 42" style={{...abs(cx - 20, cy - 10), overflow: 'visible', filter: BLOOM_SOFT}}>
        {/* 挂环（绕住栅栏横杆） */}
        <path d="M11,20 A9,9 0 1 1 29,20" fill="none" stroke={WHITE} strokeWidth={3} strokeDasharray={arc + 20} strokeDashoffset={(arc + 20) * (1 - shP)} strokeLinecap="round" />
        {/* 锁体 */}
        {bodyOp > 0 ? <rect x={6} y={20} width={28} height={21} rx={4} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={2.5} opacity={bodyOp} /> : null}
        {/* 锁孔 */}
        {holeOp > 0 ? (
          <g opacity={holeOp}>
            <circle cx={20} cy={27} r={2.6} fill={PURPLE_LIGHT} />
            <rect x={18.8} y={28.5} width={2.4} height={6} rx={1.2} fill={PURPLE_LIGHT} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

// ---------- SC45：用户徽章 ----------
/** 徽章 = 小人头像 + 等宽 UID + 独立虚线圈（先实线弧 draw-on，后交叉淡入虚线态）；ringP 0–1（10 帧） */
export const BadgeGlyph: React.FC<{cx: number; cy: number; text: string; ringP: number; opacity?: number}> = ({cx, cy, text, ringP, opacity = 1}) => {
  if (opacity <= 0) return null;
  const R = 52;
  const C = 2 * Math.PI * R;
  const solidP = clamp01(ringP / 0.75);
  const solidOp = 1 - clamp01((ringP - 0.72) / 0.28);
  const dashOp = clamp01((ringP - 0.6) / 0.4);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <PersonIcon cx={cx} cy={cy - 9} size={44} label={undefined} opacity={opacity} />
      <CText cx={cx} cy={cy + 28} size={22} weight={700} family={FONT_MONO} color={WHITE} letterSpacing={0.5}>
        {text}
      </CText>
      <svg width={(R + 6) * 2} height={(R + 6) * 2} viewBox={`0 0 ${(R + 6) * 2} ${(R + 6) * 2}`} style={{...abs(cx - R - 6, cy - R - 6), overflow: 'visible'}}>
        {solidOp > 0.01 ? <circle cx={R + 6} cy={R + 6} r={R} fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray={C} strokeDashoffset={C * (1 - solidP)} opacity={solidOp * 0.9} /> : null}
        {dashOp > 0.01 ? <circle cx={R + 6} cy={R + 6} r={R} fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray="9 9" opacity={dashOp * 0.75} /> : null}
      </svg>
    </div>
  );
};

// ---------- SC46：十秒小钟 ----------
/** 小钟（r 50）：白盘 + 灰刻度 + 橙色计时针（needleDeg 自 12 点顺时针）+ 表盘橙光由调用方叠 */
export const MiniClock10: React.FC<{cx: number; cy: number; r: number; needleDeg: number; opacity?: number}> = ({cx, cy, r, needleDeg, opacity = 1}) => {
  if (opacity <= 0) return null;
  const a = ((needleDeg - 90) * Math.PI) / 180;
  const nx = cx + r * 0.64 * Math.cos(a);
  const ny = cy + r * 0.64 * Math.sin(a);
  return (
    <svg width={r * 2 + 10} height={r * 2 + 10} viewBox={`0 0 ${r * 2 + 10} ${r * 2 + 10}`} style={{...abs(cx - r - 5, cy - r - 5), overflow: 'visible', filter: BLOOM_SOFT}}>
      <circle cx={r + 5} cy={r + 5} r={r - 2} fill="#000" stroke={WHITE} strokeWidth={2.5} />
      {Array.from({length: 12}, (_, i) => {
        const t = ((i * 30 - 90) * Math.PI) / 180;
        const big = i % 3 === 0;
        return <circle key={i} cx={r + 5 + (r - 11) * Math.cos(t)} cy={r + 5 + (r - 11) * Math.sin(t)} r={big ? 2.6 : 1.8} fill={GREY_MID} />;
      })}
      <line x1={r + 5} y1={r + 5} x2={nx} y2={ny} stroke="#F05F41" strokeWidth={3} strokeLinecap="round" />
      <circle cx={r + 5} cy={r + 5} r={4} fill="#000" stroke={WHITE} strokeWidth={2} />
    </svg>
  );
};

// ---------- SC48：/data/app 目录屋（SC39 同款几何放大复制） ----------
export const DIR48 = {x: 150, y: 300, w: 400, h: 240, roof: 80};

/** 目录屋：屋体 + 屋顶 + 两横一竖文件架 + 4 枚灰邻居小包裹（顶排 2 / 底排 2；中排给主角大包裹让位） */
export const DirectoryHouse48: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  if (opacity <= 0) return null;
  const {x, y, w, h, roof} = DIR48;
  const shelf1 = roof + h / 3;
  const shelf2 = roof + (2 * h) / 3;
  const leftC = (15 + w / 2 - 10) / 2;
  const rightC = (w / 2 + 10 + w - 15) / 2;
  const neighbors: Array<[number, number]> = [
    [leftC, roof + 20 + (shelf1 - roof - 40) / 2],
    [rightC, roof + 20 + (shelf1 - roof - 40) / 2],
    [leftC, (shelf2 + roof + h) / 2],
    [rightC, (shelf2 + roof + h) / 2],
  ];
  return (
    <div style={{...abs(x, y - roof, w, h + roof), opacity}}>
      <svg width={w} height={h + roof} viewBox={`0 0 ${w} ${h + roof}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <path d={`M0,${roof} H${w} V${roof + h} H0 Z`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M-26,${roof} L${w / 2},3 L${w + 26},${roof}`} fill="#000" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />
        <line x1={6} y1={shelf1} x2={w - 6} y2={shelf1} stroke={GREY_MID} strokeWidth={2} />
        <line x1={6} y1={shelf2} x2={w - 6} y2={shelf2} stroke={GREY_MID} strokeWidth={2} />
        <line x1={w / 2} y1={roof + 12} x2={w / 2} y2={roof + h - 12} stroke={GREY_MID} strokeWidth={2} />
      </svg>
      {neighbors.map(([nx, ny], i) => (
        <ParcelIcon key={i} cx={nx} cy={ny} w={58} h={42} color={GREY} label={''} opacity={0.5} />
      ))}
    </div>
  );
};

// ---------- SC48：读取光锥（探照灯） ----------
/** 探照灯锥（白 10% α）：自 (px,py) 指向 aim 方向偏 angleDeg 度；半张角 halfDeg，长 len；clipY 以下不画（字幕带保护） */
export const ReadCone: React.FC<{px: number; py: number; aimX: number; aimY: number; angleDeg: number; halfDeg: number; len: number; clipY?: number; opacity?: number; gradId?: string}> = ({px, py, aimX, aimY, angleDeg, halfDeg, len, clipY = 614, opacity = 1, gradId = 'g7b-cone-grad'}) => {
  if (opacity <= 0) return null;
  const phi = Math.atan2(aimY - py, aimX - px) + (angleDeg * Math.PI) / 180;
  const ux = Math.cos(phi), uy = Math.sin(phi);
  const ex = px + ux * len, ey = py + uy * len; // 轴线远端（约落在包裹面上）
  const halfW = len * Math.tan((halfDeg * Math.PI) / 180);
  const pxv = -uy, pyv = ux; // 轴向垂线
  const ax = ex + pxv * halfW, ay = ey + pyv * halfW;
  const bx = ex - pxv * halfW, by = ey - pyv * halfW;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      <defs>
        <clipPath id="g7b-cone-clip">
          <rect x={0} y={0} width={1280} height={clipY} />
        </clipPath>
        <linearGradient id={gradId} x1={px} y1={py} x2={ex} y2={ey} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.10} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <g clipPath="url(#g7b-cone-clip)">
        <polygon points={`${px},${py} ${ax.toFixed(1)},${ay.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`} fill={`url(#${gradId})`} />
        <line x1={px} y1={py} x2={ax} y2={ay} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
        <line x1={px} y1={py} x2={bx} y2={by} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
        {/* 落点光斑（椭圆，贴轴的垂向） */}
        <ellipse cx={ex} cy={ey} rx={halfW * 0.92} ry={halfW * 0.34} transform={`rotate(${(phi * 180) / Math.PI} ${ex.toFixed(1)} ${ey.toFixed(1)})`} fill="rgba(255,255,255,0.10)" />
      </g>
    </svg>
  );
};

// ---------- SC48：右缘缩微手机（读取光的来源，屏会眨） ----------
/** 缩微手机：白边圆角机身 + 听筒 + 屏幕（blink 0–1 白闪）；光锥自此射出 */
export const MiniPhone: React.FC<{cx: number; cy: number; w: number; h: number; blink: number; opacity?: number}> = ({cx, cy, w, h, blink, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{...abs(cx - w / 2, cy - h / 2, w, h), opacity}}>
      <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${WHITE}`, borderRadius: 10, background: 'rgba(0,0,0,0.92)'}} />
      <div style={{position: 'absolute', left: '50%', top: 5, transform: 'translateX(-50%)', width: w * 0.34, height: 4, borderRadius: 2, background: GREY_MID}} />
      <div
        style={{
          position: 'absolute',
          left: 6,
          right: 6,
          top: 14,
          bottom: 8,
          borderRadius: 5,
          background: `rgba(255,255,255,${(0.05 + 0.5 * clamp01(blink)).toFixed(3)})`,
          boxShadow: blink > 0.02 ? `0 0 ${Math.round(6 + 10 * blink)}px ${Math.round(2 + 3 * blink)}px rgba(255,255,255,${(0.35 * blink).toFixed(2)})` : undefined,
        }}
      />
    </div>
  );
};

// ---------- 小工具 ----------
/** 打字机可见字数（每 2 帧 1 字） */
export const typedLen = (n: number, chars: number) => (n < 0 ? 0 : Math.min(chars, Math.floor(n / 2) + 1));
