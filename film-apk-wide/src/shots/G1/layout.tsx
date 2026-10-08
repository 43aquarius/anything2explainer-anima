import React from 'react';
import {clamp01, easeOutCubic, powOutRemain, kf, FONT_MONO} from '../../common';
import {
  CText, ParcelIcon, Box, EXAMPLE,
  PURPLE_LIGHT, GREEN, GREY, WHITE, GREY_LIGHT,
  firstOp, exitOp, glowPurpleS, mixHex, scaleIn, abs,
} from '../../ui';
import {HeroGlow} from '../../fx';

/**
 * G1 第 1 章上半共用布局（SC01–SC05）：下载现场 → 改后缀魔术 → 打开包裹 → 逐个点名。
 * 所有状态是绝对帧号 N 的纯函数；SC02/SC03 共用 FilenameCard、SC04/SC05 共用 EntryList → 镜头边界零跳变。
 * 节拍（timeline.json 已核）：S01 86/138/193 · S02 260/305 · S03 340/373 · S04 454/483/533/589 · S05 660/722/774。
 */

// ---- 几何常量 ----
export const PHONE = {x: 140, y: 130, w: 240, h: 480};
export const PARCEL1 = {cx: 800, cy: 300, w: 300, h: 210}; // SC01
export const PARCEL2 = {cx: 545, cy: 360, w: 320, h: 220}; // SC04（分镜表参考值 cx640/w380 为避免与右侧条目列表重叠左移缩小，见 BUILD_NOTES）
export const INSTALL = {cx: 975, cy: 530, r: 64};

// 文件名卡（SC02 入场 / SC03 改名魔术），mono 30px 逐字定位
export const CARD = {x: 340, y: 380, w: 600, h: 120};
const ADV = 18; // 30px 等宽字符 advance
const FTEXT = EXAMPLE.fileName; // 'chatapp-release.apk'
const BASE_N = 15; // 'chatapp-release'
export const TEXT_X = Math.round(640 - (FTEXT.length * ADV) / 2);
export const SUF_X = TEXT_X + BASE_N * ADV;
const CUR_X = SUF_X + 4 * ADV + 4;
// 后缀交换时序（SC03）
export const X_SEL = 340;
export const X_XCH = 373;
export const X_FLASH = 391;
export const X_ZIP = 394;

// 条目列表（SC04 滑出 / SC05 聚焦点名）
export const ENTRY_NAMES = ['AndroidManifest.xml', 'classes.dex', 'resources.arsc', 'res/', 'META-INF/']; // 分镜表 G1·SC04 / research §3
export const ROW = {x: 815, y0: 195, w: 375, h: 44, pitch: 66};
export const FOCUS_AT = [674, 736, 784, 794, 804]; // 聚焦圈到达各条目（= 滑动起点 + 腿长）
export const rowY = (i: number) => ROW.y0 + i * ROW.pitch;

/** 包裹 + 主角柔光（SC01/SC02 承接/SC04 解剖共用；cx/cy/s/openP 由调用方按 N 算好传入） */
export const ParcelBlock: React.FC<{
  cx: number; cy: number; w: number; h: number; s: number; N: number;
  glowK?: number; openP?: number; bump?: number; opacity?: number; label?: string;
}> = ({cx, cy, w, h, s, N, glowK = 1, openP = 0, bump = 1, opacity = 1, label = 'APK'}) => {
  if (opacity <= 0 || s <= 0.01) return null;
  const W = w * s, H = h * s;
  return (
    <div style={{...abs(cx - W / 2, cy - H / 2, W, H), opacity, transform: bump !== 1 ? `scale(${bump.toFixed(4)})` : undefined, transformOrigin: '50% 50%'}}>
      <HeroGlow x={0} y={0} w={W} h={H} r={16} N={N} k={glowK} />
      <ParcelIcon cx={W / 2} cy={H / 2} w={w} h={h} scale={s} openP={openP} label={label} />
    </div>
  );
};

/** SC04 拉链缝隙紫光（openP 同步点亮 + 30 帧呼吸） */
export const GapGlow: React.FC<{N: number; openP: number; opacity?: number}> = ({N, openP, opacity = 1}) => {
  if (openP <= 0.02 || opacity <= 0) return null;
  const w = 10 + 46 * openP;
  const h = 30 + 160 * openP;
  const breathe = 0.72 + 0.28 * Math.sin((2 * Math.PI * N) / 30);
  return (
    <div
      style={{
        position: 'absolute',
        left: PARCEL2.cx - w / 2,
        top: PARCEL2.cy - h / 2,
        width: w,
        height: h,
        borderRadius: 5,
        background: `rgba(161,117,241,${(0.22 * breathe).toFixed(3)})`,
        boxShadow: `0 0 ${Math.round(20 + 10 * breathe)}px ${Math.round(6 + 5 * breathe)}px rgba(102,48,248,${(0.5 * breathe).toFixed(3)})`,
        opacity,
      }}
    />
  );
};

/** Install 圆按钮（绿边 + 30 帧待命呼吸光环）。SC02 复用时传同一 f0（入场已完成）+ exit 漂移 */
export const InstallBtn: React.FC<{N: number; f0: number; opacity?: number; drift?: number}> = ({N, f0, opacity = 1, drift = 0}) => {
  const n = N - f0;
  if (n < 0 || opacity <= 0) return null;
  const s = scaleIn(n, 21);
  const ph = 0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 30);
  return (
    <div style={{position: 'absolute', left: INSTALL.cx, top: INSTALL.cy, transform: `translate(-50%,-50%) translateY(${drift.toFixed(2)}px) scale(${s.toFixed(4)})`, opacity}}>
      <svg width={190} height={190} viewBox="0 0 190 190" style={{position: 'absolute', left: -95, top: -95, overflow: 'visible'}}>
        <circle cx={95} cy={95} r={INSTALL.r + 8 + 4 * ph} fill="none" stroke={GREEN} strokeWidth={2} opacity={0.2 + 0.32 * ph} />
        <circle cx={95} cy={95} r={INSTALL.r} fill="#000" stroke={GREEN} strokeWidth={3} />
      </svg>
      <CText cx={0} cy={0} size={30} weight={700} color={WHITE}>Install</CText>
    </div>
  );
};

/** 悬停拇指（灰简笔，指尖朝下）：16 帧周期 0→4→0 的小「犹豫」下探（不按下，8 帧半程） */
export const ThumbGlyph: React.FC<{N: number; f0: number; opacity?: number}> = ({N, f0, opacity = 1}) => {
  const n = N - f0;
  if (n < 0 || opacity <= 0) return null;
  const op = firstOp(n, 8);
  const dip = 4 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (N % 16)) / 16));
  const top = INSTALL.cy - INSTALL.r - 12 - 54; // 拇指底 = 按钮顶 −12px
  return (
    <div style={{...abs(INSTALL.cx - 22, top, 44, 54), transform: `translateY(${(dip + 1).toFixed(2)}px)`, opacity: op * opacity}}>
      <svg width={44} height={54} viewBox="0 0 44 54" style={{overflow: 'visible'}}>
        <rect x={15} y={4} width={14} height={42} rx={7} fill="#000" stroke={GREY} strokeWidth={2.5} />
        <ellipse cx={22} cy={38} rx={4.2} ry={5.2} fill="none" stroke={GREY} strokeWidth={2} />
        <path d="M14,20 q-7,9 -1,18" fill="none" stroke={GREY} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M30,22 q5,8 0,15" fill="none" stroke={GREY} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** 铅笔简图（SC02 改名蓄势）：x/y/rot/opacity 全由调用方算 */
export const PencilGlyph: React.FC<{x: number; y: number; rot: number; opacity: number}> = ({x, y, rot, opacity}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot.toFixed(1)}deg)`, opacity}}>
      <svg width={52} height={16} viewBox="0 0 52 16" style={{overflow: 'visible'}}>
        <g stroke={WHITE} strokeWidth={2.2} fill="#000" strokeLinejoin="round">
          <rect x={2} y={2} width={34} height={12} />
          <path d="M36,2 L48,8 L36,14 Z" />
          <line x1={12} y1={2} x2={12} y2={14} />
          <line x1={22} y1={2} x2={22} y2={14} />
        </g>
      </svg>
    </div>
  );
};

/** 文件名卡（SC02 260 入场 + 光标闪烁；SC03 340 后缀选中 / 373 交换 / 391 白闪）——绝对帧 N 驱动 */
export const FilenameCard: React.FC<{N: number; exitAt?: number}> = ({N, exitAt = Infinity}) => {
  const nIn = N - 260;
  if (nIn < 0) return null;
  const dy = 100 * powOutRemain(nIn, 22, 2.5);
  const op = firstOp(nIn, 6) * exitOp(N, exitAt, 8);
  if (op <= 0) return null;
  // 光标：30 帧周期；317（铅笔落到行尾）起加速为 12 帧
  const per = N >= 317 ? 12 : 30;
  const curOp = Math.floor(N / per) % 2 === 0 ? 1 : 0.12;
  // 后缀选中（白底反色 wipe 8 帧；373 起随字符飞出快速淡出）
  const selP = clamp01((N - X_SEL) / 8);
  const selFade = 1 - clamp01((N - X_XCH) / 4);
  const selBreath = N >= 348 && N < 356 ? 1 + 0.02 * Math.sin(((N - 348) / 8) * Math.PI) : 1;
  // 交换：.apk 末 4 字符上抛淡出（10 帧 powIn）；.zip 4 字符自下落入（12 帧 easeOut）
  const apkT = clamp01((N - X_XCH) / 10);
  const zipT = clamp01((N - X_XCH - 6) / 12);
  const apkOp = N < X_XCH ? 1 : 1 - apkT;
  const zipOp = N < X_XCH + 6 ? 0 : clamp01((N - X_XCH - 6) / 6);
  const flash = N >= X_FLASH && N < X_FLASH + 3;
  const charStyle = (left: number): React.CSSProperties => ({
    position: 'absolute', left, top: 40, width: ADV, height: 39, lineHeight: '39px',
    fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 0, textAlign: 'center',
  });
  const sufChar = (i: number, ch: string, mode: 'apk' | 'zip') => {
    const sel = mode === 'apk' && N < X_XCH && selP >= (i + 1) / 4;
    let ty = 0, tx = 0;
    if (mode === 'apk' && N >= X_XCH) {ty = -74 * apkT * apkT; tx = (i - 1.5) * 7 * apkT;}
    if (mode === 'zip' && N >= X_XCH + 6) {ty = 56 * (1 - easeOutCubic(zipT));}
    const o = mode === 'apk' ? apkOp : zipOp;
    if (o <= 0) return null;
    return (
      <span key={mode + i} style={{...charStyle(SUF_X + i * ADV), color: sel ? '#000' : WHITE, opacity: o, transform: `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`}}>
        {ch}
      </span>
    );
  };
  return (
    <div style={{...abs(CARD.x, CARD.y + dy, CARD.w, CARD.h), opacity: op}}>
      <Box
        x={0} y={0} w={CARD.w} h={CARD.h} r={10} sw={flash ? 3.5 : 2.5} stroke={WHITE} fill="rgba(0,0,0,0.82)"
        style={{boxShadow: flash ? '0 0 36px 10px rgba(255,255,255,.6)' : '0 0 24px 7px rgba(255,255,255,.15)'}}
      />
      <span style={{...charStyle(TEXT_X), width: BASE_N * ADV, textAlign: 'left', color: WHITE}}>{FTEXT.slice(0, BASE_N)}</span>
      {'.apk'.split('').map((ch, i) => sufChar(i, ch, 'apk'))}
      {'.zip'.split('').map((ch, i) => sufChar(i, ch, 'zip'))}
      {/* 选中高亮（白底，字符变黑） */}
      {selP > 0 && selFade > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: SUF_X - 3,
            top: 36,
            width: 4 * ADV + 6,
            height: 47,
            background: WHITE,
            borderRadius: 3,
            transform: `scaleX(${(selP * selBreath).toFixed(4)})`,
            transformOrigin: 'left center',
            opacity: selFade,
          }}
        />
      ) : null}
      {/* 光标 */}
      <div style={{position: 'absolute', left: CUR_X, top: 40, width: 3, height: 38, background: WHITE, opacity: curOp}} />
    </div>
  );
};

// ---- SC04/SC05 条目列表 ----
/** 每条目右侧的小图标（面单卡/代码/表格/文件夹/印章），pathLength=100 归一化 draw-on */
const CAT_PATHS: Array<Array<React.ReactElement<any>>> = [
  [<rect key="a" x={4} y={3} width={30} height={26} rx={2} />, <line key="b" x1={4} y1={10} x2={34} y2={10} />, <line key="c" x1={9} y1={16} x2={22} y2={16} />, <line key="d" x1={9} y1={21} x2={27} y2={21} />],
  [<path key="a" d="M14,8 L5,16 L14,24" />, <path key="b" d="M26,8 L35,16 L26,24" />, <path key="c" d="M22,5 L17,27" />],
  [<rect key="a" x={4} y={4} width={32} height={24} />, <line key="b" x1={4} y1={12} x2={36} y2={12} />, <line key="c" x1={4} y1={20} x2={36} y2={20} />, <line key="d" x1={15} y1={4} x2={15} y2={28} />, <line key="e" x1={26} y1={4} x2={26} y2={28} />],
  [<path key="a" d="M4,7 H13 L16,10 H36 V26 H4 Z" />],
  [<circle key="a" cx={20} cy={13} r={8} />, <path key="b" d="M11,27 H29" />, <path key="c" d="M15,21 V27 M25,21 V27" />],
];

/** 聚焦度：到达 FOCUS_AT[i] 起 8 帧 0→1；下一焦点出现后 8 帧回落 0（末行保持） */
const focusK = (i: number, N: number) => {
  const up = clamp01((N - FOCUS_AT[i]) / 8);
  const down = i < FOCUS_AT.length - 1 ? clamp01((N - FOCUS_AT[i + 1]) / 8) : 0;
  return Math.min(1, up - down < 0 ? up : up - down);
};

const EntryRow: React.FC<{i: number; N: number}> = ({i, N}) => {
  const nIn = N - (485 + 2 * i); // 483 字幕块 +2（运镜 484 结束后入场）
  if (nIn < 0) return null;
  const t = easeOutCubic(clamp01(nIn / 18));
  const dx = (PARCEL2.cx - ROW.x) * (1 - t); // 自拉链缝隙滑到列表位
  const dy = (PARCEL2.cy - rowY(i)) * (1 - t);
  const sc = 0.55 + 0.45 * t;
  const op = clamp01(nIn / 8);
  const fk = focusK(i, N);
  const dim = 1 - 0.4 * (fk > 0.05 ? 0 : clamp01((N - FOCUS_AT[0]) / 10)); // 其余条目变暗 40%
  const exit = exitOp(N, 870, 8);
  const catP = clamp01((N - (533 + 8 * i)) / 8);
  const rowOp = op * dim * exit;
  if (rowOp <= 0) return null;
  const name = ENTRY_NAMES[i];
  // classes.dex 行：3 行小字节码线（740 浮出 / 774 随聚焦离开淡出）
  const bars = i === 1 ? [96, 80, 62].map((bw, j) => {
    const bIn = clamp01((N - 740 - 2 * j) / 6) * (1 - clamp01((N - 774) / 8));
    if (bIn <= 0) return null;
    return <div key={j} style={{position: 'absolute', left: 1022 - ROW.x + j * 6, top: 9 + j * 10, width: bw, height: 3, borderRadius: 1.5, background: GREY_LIGHT, opacity: 0.85 * bIn}} />;
  }) : null;
  return (
    <div
      style={{
        ...abs(ROW.x, rowY(i), ROW.w, ROW.h),
        opacity: rowOp,
        transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${(sc * (1 + 0.12 * fk)).toFixed(4)})`,
        transformOrigin: '50% 50%',
      }}
    >
      <Box
        x={0} y={0} w={ROW.w} h={ROW.h} r={8}
        stroke={fk > 0 ? mixHex(WHITE, PURPLE_LIGHT, fk) : WHITE}
        sw={fk > 0 ? 2 + 0.5 * fk : 2}
        fill="rgba(0,0,0,0.6)"
        style={fk > 0.01 ? {boxShadow: glowPurpleS(fk)} : undefined}
      />
      {/* 左侧小文件图标 */}
      <svg width={22} height={28} viewBox="0 0 22 28" style={{position: 'absolute', left: 10, top: 8}}>
        <g fill="none" stroke={WHITE} strokeWidth={2} strokeLinejoin="round">
          <path d="M2,2 H13 L20,9 V26 H2 Z" />
          <path d="M13,2 V9 H20" />
          <line x1={6} y1={14} x2={15} y2={14} />
          <line x1={6} y1={19} x2={15} y2={19} />
        </g>
      </svg>
      <span style={{position: 'absolute', left: 45, top: 10, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: -0.5, lineHeight: '24px', color: WHITE, whiteSpace: 'nowrap'}}>{name}</span>
      {bars}
      {/* 右侧类别小图标（draw-on） */}
      {catP > 0 ? (
        <svg width={40} height={32} viewBox="0 0 40 32" style={{position: 'absolute', left: 320, top: 6}}>
          <g fill="none" stroke={WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {CAT_PATHS[i].map((el, j) => React.cloneElement(el, {
              key: j, pathLength: 100, strokeDasharray: 100, strokeDashoffset: 100 * (1 - catP),
            }))}
          </g>
        </svg>
      ) : null}
    </div>
  );
};

export const EntryList: React.FC<{N: number}> = ({N}) => (
  <>{ENTRY_NAMES.map((_, i) => <EntryRow key={i} i={i} N={N} />)}</>
);

/** SC05 放大镜聚焦圈：虚线椭圆 + 柄，24 帧周期呼吸；kf 航点滑到当前念到的条目 */
export const FocusRing: React.FC<{N: number}> = ({N}) => {
  const inOp = firstOp(N - 652, 8);
  const exit = exitOp(N, 870, 8);
  const op = inOp * exit;
  if (op <= 0) return null;
  const sc = 0.92 + 0.08 * clamp01((N - 652) / 10);
  const EASE = (u: number) => u * u * (3 - 2 * u);
  const x = kf(N, [[652, 400], [660, 400], [674, 1002], [722, 1002], [736, 1002], [774, 1002], [804, 1002]], EASE);
  const y = kf(
    N,
    [[652, 340], [660, 340], [674, rowY(0) + 22], [722, rowY(0) + 22], [736, rowY(1) + 22], [774, rowY(1) + 22], [784, rowY(2) + 22], [794, rowY(3) + 22], [804, rowY(4) + 22]],
    EASE,
  );
  const br = Math.sin((2 * Math.PI * N) / 24);
  const rx = 195 + 3 * br, ry = 62 + 2 * br;
  return (
    <div style={{position: 'absolute', left: x - 240, top: y - 90, width: 480, height: 180, opacity: op, transform: `scale(${sc.toFixed(4)})`, transformOrigin: '50% 50%'}}>
      <svg width={480} height={180} viewBox="0 0 480 180" style={{overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
        <ellipse cx={240} cy={90} rx={rx} ry={ry} fill="none" stroke={WHITE} strokeWidth={2.5} strokeDasharray="12 9" strokeDashoffset={-2 * N} />
        <line x1={240 + 0.71 * rx} y1={90 + 0.71 * ry} x2={240 + 0.71 * rx + 26} y2={90 + 0.71 * ry + 26} stroke={WHITE} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>
  );
};
