import React from 'react';
import {clamp01, kf, easeOutCubic, powIn, FONT_MONO, FONT_ORB} from '../../common';
import {
  CText, ParcelIcon, WaxSeal, Pill, abs, WHITE, GREY, GREY_MID, GREY_LINE, GREY_LIGHT,
  PURPLE_LIGHT, ORANGE, GREEN, RED_DEEP, CORAL, BLOOM_SOFT, mixHex, softOp,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G5 组共用图元（第 3 章上半：SC26–SC34，点安装 → 陌生人 → v1 收条 → ★v2 签名块 → 更快）。
 * 全部纯函数（动画量由调用方按 N 算好传入）；随机只用 rnd。
 * 几何常量：
 *   GRP —— SC29/SC30 的「v1 收条包裹组」（SC29 全幅态；SC30 以 0.8× 承接缩到左侧，同一坐标保证边界一致）
 *   DGM —— SC32/SC33 的「ZIP 结构图 + 签名块」（SC32 全幅态；SC33 以 0.5× 承接缩到左侧；labels=false 时不渲染小字）
 */

// ---------- 包裹 + 主角柔光（SC26 承接飞入 / SC27 / SC29 / SC31 共用） ----------
export const ParcelGlow: React.FC<{
  cx: number; cy: number; w: number; h: number; s?: number; N?: number; openP?: number; sealP?: number;
  label?: string; glowK?: number; opacity?: number; accent?: boolean;
}> = ({cx, cy, w, h, s = 1, N, openP = 0, sealP = 0, label = 'APK', glowK = 1, opacity = 1, accent = false}) => {
  if (opacity <= 0 || s <= 0.01) return null;
  const W = w * s, H = h * s;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity}}>
      <HeroGlow x={0} y={0} w={W} h={H} r={16} N={N} k={glowK} />
      <ParcelIcon cx={W / 2} cy={H / 2} w={w} h={h} scale={s} openP={openP} sealP={sealP} label={s > 0.55 ? label : ''} accent={accent} />
    </div>
  );
};

/** 展开包裹的缝隙紫光（SC29；30 帧呼吸） */
export const GapGlowAt: React.FC<{cx: number; cy: number; w: number; h: number; openP: number; N: number; opacity?: number}> = ({cx, cy, w, h, openP, N, opacity = 1}) => {
  if (openP <= 0.02 || opacity <= 0) return null;
  const gw = 12 + 78 * openP;
  const gh = h * (0.2 + 0.52 * openP);
  const breathe = 0.72 + 0.28 * Math.sin((2 * Math.PI * N) / 30);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - gw / 2,
        top: cy - gh / 2,
        width: gw,
        height: gh,
        borderRadius: 6,
        background: `rgba(161,117,241,${(0.24 * breathe).toFixed(3)})`,
        boxShadow: `0 0 ${Math.round(18 + 10 * breathe)}px ${Math.round(5 + 4 * breathe)}px rgba(102,48,248,${(0.5 * breathe).toFixed(3)})`,
        opacity,
      }}
    />
  );
};

// ---------- SC26：Install 大按钮（按下动画 + 双波纹 + 变灰） + 手指 ----------
export const INSTALL26 = {cx: 900, cy: 520, r: 72};

/** 绿边圆按钮：f0 起缩放入场；pressAt 按下（1.06→0.97 squash）；pressAt+5 起描边绿→灰；波纹两圈各 12 帧 */
export const InstallBig: React.FC<{N: number; f0: number; pressAt: number; opacity?: number}> = ({N, f0, pressAt, opacity = 1}) => {
  const n = N - f0;
  if (n < 0 || opacity <= 0) return null;
  const s = kf(n, [[0, 0.6], [12, 1]], easeOutCubic);
  // 按压形变：pressAt−2 蓄力 1.06 → pressAt+3 压扁 0.97，保持（已按下）
  const squash = kf(N, [[pressAt - 2, 1], [pressAt, 1.06], [pressAt + 3, 0.97]]);
  const greyK = clamp01((N - (pressAt + 5)) / 6);
  const stroke = mixHex(GREEN, GREY, greyK);
  const ringPh = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  const ringOp = N < pressAt ? 0.22 + 0.3 * ringPh : Math.max(0, 0.5 - (N - pressAt) * 0.2);
  const ripple = (t0: number, rMax: number) => {
    if (N < t0) return null;
    const t = clamp01((N - t0) / 12);
    if (t >= 1) return null;
    return <circle key={t0} cx={0} cy={0} r={INSTALL26.r + (rMax - INSTALL26.r) * easeOutCubic(t)} fill="none" stroke={GREEN} strokeWidth={2.4} opacity={(1 - t) * 0.75} />;
  };
  return (
    <div style={{position: 'absolute', left: INSTALL26.cx, top: INSTALL26.cy, transform: `translate(-50%,-50%) scale(${(s * squash).toFixed(4)})`, opacity}}>
      <svg width={320} height={320} viewBox="0 0 320 320" style={{position: 'absolute', left: -160, top: -160, overflow: 'visible'}}>
        <circle cx={0} cy={0} r={INSTALL26.r + 9 + 4 * ringPh} fill="none" stroke={GREEN} strokeWidth={2} opacity={ringOp} />
        <circle cx={0} cy={0} r={INSTALL26.r} fill="#000" stroke={stroke} strokeWidth={3.2} />
        {N < pressAt + 4 ? <circle cx={0} cy={0} r={INSTALL26.r - 7} fill="none" stroke={GREEN} strokeWidth={1.4} opacity={0.5 * (1 - greyK)} /> : null}
      </svg>
      {ripple(pressAt + 1, 152)}
      {ripple(pressAt + 6, 126)}
      <CText cx={0} cy={0} size={30} weight={700} color={WHITE}>Install</CText>
    </div>
  );
};

/** 手指简笔（指尖朝下）：pressAt 起降 10px 按住；tipY = 指尖静止时触碰的 y（按钮顶 −8） */
export const FingerPress: React.FC<{cx: number; tipY: number; N: number; f0: number; pressAt: number; opacity?: number}> = ({cx, tipY, N, f0, pressAt, opacity = 1}) => {
  const n = N - f0;
  if (n < 0 || opacity <= 0) return null;
  const op = softOp(n, 8);
  const dy = kf(N, [[pressAt, 0], [pressAt + 3, 10]]);
  return (
    <div style={{...abs(cx - 24, tipY - 66, 48, 70), opacity: op * opacity, transform: `translateY(${dy.toFixed(1)}px)`}}>
      <svg width={48} height={70} viewBox="0 0 48 70" style={{overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={17} y={2} width={14} height={52} rx={7} fill="#000" stroke={GREY} strokeWidth={2.5} />
        <ellipse cx={24} cy={54} rx={4.4} ry={5.6} fill="none" stroke={GREY} strokeWidth={2} />
        <path d="M16,16 q-8,10 -2,20" fill="none" stroke={GREY} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M32,18 q6,9 0,17" fill="none" stroke={GREY} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ---------- SC29 / SC30：v1 收条包裹组几何（同一坐标，SC30 以 0.8× 承接） ----------
export const GRP = {
  parcel: {cx: 640, cy: 480, w: 360, h: 230},
  blockW: 132,
  blockH: 88,
  blocks: [
    {cx: 450, cy: 218}, {cx: 640, cy: 218}, {cx: 830, cy: 218},
    {cx: 450, cy: 330}, {cx: 640, cy: 330}, {cx: 830, cy: 330},
  ],
  receiptOff: {dx: 26, dy: 26}, // 收条贴在文件块右下角
  center: {x: 644, y: 385}, // 组包围盒中心（缩放基准）
};

/** 文件块（132×88：黑底白边 + 3 行灰线） */
export const FileBlockSmall: React.FC<{cx: number; cy: number; s?: number; opacity?: number}> = ({cx, cy, s = 1, opacity = 1}) => {
  if (opacity <= 0 || s <= 0.02) return null;
  const W = GRP.blockW * s, H = GRP.blockH * s;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${GRP.blockW} ${GRP.blockH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={GRP.blockW - 2.5} height={GRP.blockH - 2.5} rx={7} fill="#000" stroke={WHITE} strokeWidth={2.5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={16} y={17 + i * 22} width={i === 2 ? GRP.blockW * 0.5 : GRP.blockW * 0.66} height={4} rx={2} fill={GREY_LINE} opacity={0.9} />
        ))}
      </svg>
    </div>
  );
};

/** 签收条（白边小卡 + 绿勾 + sha1 字样）：text=false 供 0.8× 缩微态（小字不可读即省略）；lit 0–1 → 边框白→橙（SC30 验过） */
export const Receipt: React.FC<{
  cx: number; cy: number; s?: number; rot?: number; opacity?: number; flash?: number; lit?: number; checkP?: number; text?: boolean;
}> = ({cx, cy, s = 1, rot = -4, opacity = 1, flash = 0, lit = 0, checkP = 1, text = true}) => {
  if (opacity <= 0 || s <= 0.02) return null;
  const RW = 96, RH = 54;
  const stroke = mixHex(WHITE, ORANGE, clamp01(lit) * 0.75);
  return (
    <div style={{...abs(cx - (RW * s) / 2, cy - (RH * s) / 2, RW * s, RH * s), opacity, transform: `rotate(${rot}deg)`}}>
      <div
        style={{
          position: 'absolute', inset: 0, boxSizing: 'border-box', background: '#000',
          border: `${Math.max(1.4, 2 * s)}px solid ${flash > 0.05 ? WHITE : stroke}`,
          borderRadius: 5,
          boxShadow: flash > 0.05 ? `0 0 ${18 * flash}px ${6 * flash}px rgba(255,255,255,${0.55 * flash})` : undefined,
        }}
      />
      {checkP > 0 ? (
        <svg width={RW * s} height={RH * s} viewBox={`0 0 ${RW} ${RH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g transform={`scale(${s.toFixed(3)})`}>
            <polyline
              points="14,27 21,34 35,18"
              fill="none"
              stroke={GREEN}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={32}
              strokeDashoffset={32 * (1 - clamp01(checkP))}
              style={{filter: 'drop-shadow(0 0 3px rgba(143,247,64,.7))'}}
            />
          </g>
        </svg>
      ) : null}
      {text ? <CText cx={64} cy={26} size={22} weight={600} family={FONT_MONO} color={WHITE}>sha1</CText> : null}
    </div>
  );
};

// ---------- SC32 / SC33：ZIP 结构图 + 签名块几何（SC33 以 0.5× 承接） ----------
export const DGM = {
  files: [
    {x: 150, y: 225}, {x: 150, y: 293}, {x: 150, y: 361}, {x: 150, y: 429},
  ], // 各 88×60（SC17 风格文件块，竖排 4 枚）
  fileW: 88,
  fileH: 60,
  fileLabel: {cx: 194, cy: 516},
  sign: {x: 330, y: 240, w: 200, h: 140}, // ★签名块（插在目录卡左侧）
  signTitle: {l1: 430, y1: 322, l2: 430, y2: 356}, // 标题两行中心（镜头用 GlitchIn 渲染）
  card: {x: 700, y: 235, w: 250, h: 150}, // 中央目录卡
  eocd: {x: 1010, y: 280, w: 110, h: 60}, // EOCD 条
  conn: {x0: 950, x1: 1010, y: 310}, // 目录—EOCD 点线
  arc: {cx: 650, cy: 355, rx: 565, ry: 180, t0: 247.1}, // 覆盖弧（自签名块顶顺时针兜一圈）
  note: {cx: 615, cy: 462, ay0: 437, ay1: 396}, // 「immediately before…」箭头注
  arcLabel: {cx: 650, cy: 148},
  shift: {files: -5, card: 7, eocd: 9}, // 签名块插入时各块微让位（px）
  center: {x: 650, y: 355},
};

/** 目录卡左缘 → 各文件块右缘 的索引引线（绕签名块下方的贝塞尔；dx 为让位位移） */
export const dgmCurves = (dxCard: number, dxFiles: number): string[] =>
  DGM.files.map((f, i) => {
    const sx = DGM.card.x + dxCard;
    const sy = DGM.card.y + 30 + 12 * i;
    const ex = f.x + DGM.fileW + dxFiles;
    const ey = f.y + DGM.fileH / 2;
    return `M ${sx} ${sy} Q ${(sx + ex) / 2} 486 ${ex} ${ey}`;
  });

/** 覆盖弧 polyline 点列（t0 起顺时针一圈） */
export const arcPoints = (segs = 56): Array<[number, number]> => {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= segs; i++) {
    const th = ((DGM.arc.t0 + (i / segs) * 360) * Math.PI) / 180;
    pts.push([DGM.arc.cx + DGM.arc.rx * Math.cos(th), DGM.arc.cy + DGM.arc.ry * Math.sin(th)]);
  }
  return pts;
};

/** 覆盖弧（紫 4px 虚线 + 完成后慢速巡行）：p 0–1 draw-on；march 为完成后虚线行进帧数 */
export const CovArc: React.FC<{p: number; march?: number; opacity?: number; glowK?: number}> = ({p, march = 0, opacity = 1, glowK = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const pts = arcPoints();
  const pl = p >= 1 ? pts : pts.slice(0, Math.max(2, Math.round(pts.length * clamp01((p - 0.06) / 0.94))));
  const stemOp = clamp01(p * 8);
  const arcOp = clamp01((p - 0.04) * 10);
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      <g style={{filter: `drop-shadow(0 0 ${(6 * glowK).toFixed(1)}px rgba(161,117,241,${(0.6 * glowK).toFixed(2)}))`}}>
        {/* 茎：签名块顶 → 弧起点 */}
        <line x1={DGM.sign.x + DGM.sign.w / 2} y1={DGM.sign.y - 2} x2={DGM.sign.x + DGM.sign.w / 2} y2={DGM.arc.cy - DGM.arc.ry * 0.921 - 4} stroke={PURPLE_LIGHT} strokeWidth={3} opacity={stemOp * 0.9} />
        {pl.length > 1 ? (
          <polyline
            points={pl.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
            fill="none"
            stroke={PURPLE_LIGHT}
            strokeWidth={4}
            strokeDasharray="16 10"
            strokeDashoffset={-0.9 * march}
            strokeLinecap="round"
            opacity={arcOp}
          />
        ) : null}
      </g>
    </svg>
  );
};

/** 文件块（88×60，SC17 放大版语言）：flash 0–1 紫闪（弧线扫过）；dim 变暗 */
export const FileBlk: React.FC<{x: number; y: number; s?: number; opacity?: number; flash?: number; dim?: number}> = ({x, y, s = 1, opacity = 1, flash = 0, dim = 0}) => {
  if (opacity <= 0 || s <= 0.02) return null;
  const W = DGM.fileW * s, H = DGM.fileH * s;
  const stroke = flash > 0.05 ? mixHex(WHITE, PURPLE_LIGHT, clamp01(flash)) : WHITE;
  return (
    <div style={{...abs(x, y, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${DGM.fileW} ${DGM.fileH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: flash > 0.05 ? `drop-shadow(0 0 ${8 * flash}px rgba(161,117,241,.9))` : BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={DGM.fileW - 2.5} height={DGM.fileH - 2.5} rx={6} fill="#000" stroke={stroke} strokeWidth={2.5} opacity={1 - dim * 0.55} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={12} y={13 + i * 15} width={i === 2 ? DGM.fileW * 0.52 : DGM.fileW * 0.66} height={3} rx={1.5} fill={GREY_LINE} opacity={0.9 - dim * 0.5} />
        ))}
      </svg>
    </div>
  );
};

/** 中央目录卡（250×150：表头 + 3 行目录行 + 右缘页签）；labels=false 供缩微态 */
export const DirCard: React.FC<{x: number; y: number; s?: number; opacity?: number; dim?: number; labels?: boolean}> = ({x, y, s = 1, opacity = 1, dim = 0, labels = true}) => {
  if (opacity <= 0) return null;
  const {w, h} = DGM.card;
  const W = w * s, H = h * s;
  return (
    <div style={{...abs(x, y, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} rx={8} fill="#000" stroke={WHITE} strokeWidth={2.5} opacity={1 - dim * 0.55} />
        {[0, 1, 2].map((i) => {
          const ty = 44 + i * 34;
          return (
            <g key={i} opacity={1 - dim * 0.5}>
              <circle cx={16} cy={ty + 6} r={3} fill={GREY_MID} />
              <rect x={26} y={ty} width={w * (i === 2 ? 0.42 : 0.6)} height={3} rx={1.5} fill={GREY_LIGHT} opacity={0.85} />
              <rect x={26 + w * 0.62} y={ty + 0.5} width={26} height={2.5} rx={1.2} fill={GREY_LINE} />
            </g>
          );
        })}
        <line x1={12} y1={36} x2={w - 12} y2={36} stroke={GREY_LINE} strokeWidth={1.5} />
        {[0, 1, 2].map((i) => (
          <rect key={`t${i}`} x={w - 1} y={44 + i * 34} width={13} height={11} rx={2} fill="#000" stroke={PURPLE_LIGHT} strokeWidth={1.8} opacity={0.75} />
        ))}
      </svg>
      {labels ? <CText cx={w / 2} cy={18} size={22} weight={700} family={FONT_MONO} color={WHITE} dy={0} opacity={1 - dim}>central directory</CText> : null}
    </div>
  );
};

/** EOCD 条（110×60）；labels=false 供缩微态 */
export const EocdTag: React.FC<{x: number; y: number; s?: number; opacity?: number; flash?: number; dim?: number; labels?: boolean}> = ({x, y, s = 1, opacity = 1, flash = 0, dim = 0, labels = true}) => {
  if (opacity <= 0) return null;
  const {w, h} = DGM.eocd;
  const W = w * s, H = h * s;
  const c = flash > 0.05 ? mixHex(WHITE, PURPLE_LIGHT, clamp01(flash)) : WHITE;
  return (
    <div style={{...abs(x, y, W, H), opacity}}>
      <svg width={W} height={H} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: flash > 0.05 ? `drop-shadow(0 0 ${8 * flash}px rgba(161,117,241,.9))` : BLOOM_SOFT}}>
        <rect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} rx={6} fill="#000" stroke={c} strokeWidth={2.5} opacity={1 - dim * 0.55} />
        <line x1={10} y1={h - 16} x2={w - 10} y2={h - 16} stroke={GREY_LINE} strokeWidth={1.5} opacity={1 - dim * 0.5} />
      </svg>
      {labels ? <CText cx={w / 2} cy={h / 2 - 6} size={22} weight={700} family={FONT_MONO} color={WHITE} dy={0} opacity={1 - dim}>EOCD</CText> : null}
    </div>
  );
};

/** 签名块本体（200×140 紫边 + 迷你火漆）：标题由镜头用 GlitchIn 单独渲染在 DGM.signTitle */
export const SignBlkBody: React.FC<{x: number; y: number; s?: number; opacity?: number; glowK?: number; sealP?: number; dim?: number}> = ({x, y, s = 1, opacity = 1, glowK = 1, sealP = 1, dim = 0}) => {
  if (opacity <= 0) return null;
  const {w, h} = DGM.sign;
  const W = w * s, H = h * s;
  return (
    <div style={{...abs(x, y, W, H), opacity}}>
      <div
        style={{
          position: 'absolute', inset: 0, boxSizing: 'border-box',
          background: `rgba(102,48,248,${(0.16 * glowK * (1 - dim)).toFixed(3)})`,
          border: `3px solid ${PURPLE_LIGHT}`,
          borderRadius: 10,
          boxShadow: `0 0 ${(22 * glowK).toFixed(0)}px ${(8 * glowK).toFixed(0)}px rgba(102,48,248,${(0.55 * glowK * (1 - dim)).toFixed(2)})`,
          opacity: 1 - dim * 0.55,
        }}
      />
      <WaxSeal cx={W / 2} cy={H * 0.27} r={26 * s} stampP={sealP} opacity={1 - dim} />
    </div>
  );
};

// ---------- SC33：红字节 + 冲击波 + 裂纹 ----------
/** 红字节小方块（18×18 + 尾迹） */
export const ByteGlyph: React.FC<{x: number; y: number; trail?: Array<{x: number; y: number; op: number}>; opacity?: number}> = ({x, y, trail = [], opacity = 1}) => (
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
    {trail.map((t, i) => (
      <rect key={i} x={t.x - 9} y={t.y - 9} width={18} height={18} rx={2} fill={RED_DEEP} opacity={t.op * 0.4} />
    ))}
    <rect x={x - 9} y={y - 9} width={18} height={18} rx={2} fill={RED_DEEP} stroke={WHITE} strokeWidth={1.6} style={{filter: 'drop-shadow(0 0 7px rgba(236,8,31,.9))'}} />
  </svg>
);

/** 冲击波环（t0 起、r 8→rMax、len 帧） */
export const ShockRing: React.FC<{N: number; t0: number; rMax: number; len?: number; cx: number; cy: number; color?: string}> = ({N, t0, rMax, len = 12, cx, cy, color = RED_DEEP}) => {
  if (N < t0) return null;
  const t = clamp01((N - t0) / len);
  if (t >= 1) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <circle cx={cx} cy={cy} r={8 + (rMax - 8) * easeOutCubic(t)} fill="none" stroke={color} strokeWidth={3 * (1 - t) + 1} opacity={(1 - t) * 0.85} />
    </svg>
  );
};

/** 裂纹（锯齿红线 draw-on；点列屏幕坐标） */
export const CRACK_PTS: Array<[number, number]> = [
  [148, 300], [208, 320], [256, 294], [318, 334], [388, 304], [452, 342], [520, 316],
];
export const CrackPath: React.FC<{p: number; opacity?: number}> = ({p, opacity = 1}) => {
  if (p <= 0 || opacity <= 0) return null;
  const segs = CRACK_PTS.length - 1;
  const pl = CRACK_PTS.slice(0, Math.max(1, Math.round(segs * clamp01(p))) + 1).map((q) => `${q[0]},${q[1]}`).join(' ');
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none'}}>
      <polyline points={pl} fill="none" stroke={CORAL} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 6px rgba(236,8,31,.8))'}} />
    </svg>
  );
};

// ---------- SC31 / SC34 小件 ----------
/** stampIn 公用：n<0 未入场；scale 1.35→1（powIn 2.2）+ 前 2 帧白闪 */
export const stampIn = (n: number, len = 8): {s: number; flash: number} => {
  if (n < 0) return {s: 0, flash: 0};
  return {
    s: kf(n, [[0, 1.35], [len, 1]], powIn(2.2)),
    flash: n < 2 ? 1 - n * 0.4 : 0,
  };
};

/** v1 / v2 版本 Pill（stampIn + 光晕） */
export const VersionPill: React.FC<{x: number; y: number; w: number; h: number; text: string; color: string; glowColor: string; n: number}> = ({x, y, w, h, text, color, glowColor, n}) => {
  if (n < 0) return null;
  const {s, flash} = stampIn(n, 8);
  return (
    <div style={{...abs(x, y, w, h), transform: `scale(${s.toFixed(4)})`, transformOrigin: '50% 50%', boxShadow: `0 0 26px 8px ${glowColor}`}}>
      <Pill x={0} y={0} w={w} h={h} r={h / 2} fill={color} sw={2.5} text={text} fontSize={Math.round(h * 0.62)} weight={700} family={FONT_ORB} letterSpacing={1} textDy={0}
        style={flash > 0 ? {filter: `brightness(${1 + 0.6 * flash})`} : undefined} />
    </div>
  );
};
