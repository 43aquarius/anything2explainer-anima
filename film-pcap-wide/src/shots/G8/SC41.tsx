import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, FONT_MONO, FONT_ORB} from '../../common';
import {Box, CText, EXAMPLE, GREY, GREY_LINE, GREY_LIGHT, LogCard, ORANGE, Pill, PURPLE, PURPLE_LIGHT, WHITE, abs, exitOp, firstOp, scaleIn, SoftIn} from '../../ui';
import {HaloRing} from '../../fx';

/**
 * SC41 日志相信 vs 线路发生 · N 9221–9431（S53 9229 / S54 9294·9316 / S55 9373·9397）
 * 版式：左卡（x 80–540）= SC02 日志卡 0.55× 缩微（transform scale，配字号按缩微处理；可读的日志行在思考气泡里全尺寸打字机）+
 *   顶部灰标签 `believed` + 思考气泡（内 `?` + EXAMPLE.logLine 打字机循环）；右卡（x 740–1200）= pcap 文件图标（DocIcon 风）+
 *   紫标签 `happened` + HaloRing 小型（draw-on 20 帧）+ 卡内 mini 时间轴条持续点亮；两卡间 `≠` 白 64px。
 * 节拍：9229 两张底板 2 帧错峰 slideUp（S53「教训」搭台：左实线、右虚线灰=待定）；9294 日志卡缩微淡入 + `believed` SoftIn；
 *   9316 思考气泡自卡上方长出（缩放入场）+ 日志行打字机（持续到离场）；9373 右卡内容缩放入位 + 虚线框变实线 + `happened` SoftIn +
 *   mini 时间轴开始逐格点亮；9397 HaloRing draw-on 20 帧 + `≠` 缩放入场 + 左右两卡 1.05 微脉冲对撞（12 帧错峰）。
 * 停留：段内不判（S55 非段末，末块 33 帧；HaloRing 9397+20 落位，末 8 帧归零）。
 * 零 glitch（白名单 SC41 无）。持续动作：气泡打字机 / 时间轴逐格点亮 + 白色游标 / 光环波纹相位。
 */
const F0 = 9221, TO = 9431;
const T_PLATES = 9229, T_LOG = 9294, T_BUBBLE = 9316, T_RIGHT = 9373, T_HALO = 9397;
const LP = {x: 80, y: 250, w: 460, h: 300}; // 左板
const RP = {x: 740, y: 250, w: 460, h: 300}; // 右板
const BUB = {x: 95, y: 125, w: 430, h: 82}; // 思考气泡
const LOG1 = EXAMPLE.logLine.split('60 ms')[0]; // 'POST /checkout 200 · '
const LOG2 = '60 ms';
const DOC = {x: 895, y: 305, w: 150, h: 170}; // pcap 文件图标
const HALO = {cx: 970, cy: 468, rxo: 150, ryo: 31, rxi: 106, ryi: 15};
const STRIP = {x: 800, y: 522, w: 340, h: 20, cells: 10};
const tri = (n: number, len = 12) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));

/** 气泡内日志行打字机：type 52 帧 → hold 30 → 空 8 → 重打（周期 90） */
const typed = (N: number) => {
  const c = Math.max(0, N - T_BUBBLE) % 90;
  return c < 52 ? Math.floor(c / 2) : c < 82 ? LOG1.length + LOG2.length : 0;
};

export const SC41: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  // 底板入场（slide + fade，2 帧错峰）
  const pl = clamp01((N - T_PLATES) / 16);
  const pr = clamp01((N - T_PLATES - 2) / 16);
  // 右板：9373 虚线灰框 → 实线白框（交叉淡化）
  const solidK = clamp01((N - T_RIGHT) / 8);
  // 日志卡缩微（0.55×）
  const logK = clamp01((N - T_LOG) / 10);
  // 气泡长出（自卡上方，缩放 + 淡入）
  const bubN = N - T_BUBBLE;
  const bubS = bubN < 0 ? 0 : 0.6 + 0.4 * (1 - Math.pow(1 - clamp01(bubN / 14), 3));
  // 右卡内容缩放入位
  const rcN = N - T_RIGHT;
  const rcS = rcN < 0 ? 0 : 0.4 + 0.6 * scaleIn(rcN);
  // ≠ 与光环
  const neqN = N - T_HALO;
  const haloP = easeOutCubic(clamp01((N - T_HALO) / 20));
  const haloFill = clamp01((N - (T_HALO + 8)) / 12) * Math.max(0, 1 - (N - (TO - 13)) / 6);
  const phase = Math.floor(Math.max(0, N - T_HALO) / 2) * 5;
  // 微脉冲对撞（左先右后，12 帧错峰）
  const bumpL = tri(N - T_HALO, 12);
  const bumpR = tri(N - T_HALO - 12, 12);
  // 时间轴逐格点亮 + 白游标循环
  const stripN = N - (T_RIGHT + 10);
  const hi = stripN > 0 ? Math.floor(stripN / 5) % STRIP.cells : -1;
  const shown = typed(N);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {/* ===== 左卡（believed）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PLATES, 8), transform: `translateY(${(38 * Math.pow(1 - pl, 2.2)).toFixed(2)}px) translateX(${(10 * bumpL).toFixed(2)}px) scale(${(1 + 0.05 * bumpL).toFixed(4)})`, transformOrigin: '310px 400px'}}>
        <Box x={LP.x} y={LP.y} w={LP.w} h={LP.h} r={14} sw={2.5} />
        {/* 日志卡 0.55× 缩微（缩微件：可读的日志行在气泡里） */}
        {logK > 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: logK}}>
            <div style={{position: 'absolute', left: 145, top: 312, width: 330, height: 176, transform: 'scale(0.55)', transformOrigin: '0 0', opacity: 0.95}}>
              <LogCard x={0} y={0} w={600} h={320} rows={4} highlight={3} dim />
            </div>
          </div>
        ) : null}
        {/* believed 灰标签 */}
        <SoftIn N={N} f0={T_LOG}>
          <Pill x={230} y={262} w={160} h={40} sw={2} stroke={GREY} fill="#000" text="believed" fontSize={26} weight={700} color={GREY} />
        </SoftIn>
      </div>
      {/* 思考气泡（在左卡之上、believed 之右） */}
      {bubN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: clamp01(bubN / 10), transform: `scale(${bubS.toFixed(4)})`, transformOrigin: '310px 207px'}}>
          <div style={{...abs(BUB.x, BUB.y, BUB.w, BUB.h), background: '#000', border: `2.5px solid ${GREY}`, borderRadius: 42}} />
          <CText cx={138} cy={166} size={36} weight={700} family={FONT_ORB} color={GREY} dy={0}>?</CText>
          <div style={{position: 'absolute', left: 170, top: 152, fontFamily: FONT_MONO, fontSize: 22, lineHeight: 1.3, whiteSpace: 'nowrap', display: 'flex'}}>
            <span style={{color: GREY_LIGHT}}>{LOG1.slice(0, shown)}</span>
            {shown > LOG1.length ? <span style={{color: ORANGE}}>{LOG2.slice(0, shown - LOG1.length)}</span> : null}
          </div>
          {/* 气泡 trail 小圆（连向日志卡） */}
          <div style={{...abs(352, 218, 16, 16), borderRadius: 8, background: '#000', border: `2px solid ${GREY}`}} />
          <div style={{...abs(380, 240, 11, 11), borderRadius: 6, background: '#000', border: `2px solid ${GREY}`}} />
        </div>
      ) : null}
      {/* ===== ≠（两卡之间）===== */}
      {neqN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(0.4 + 0.6 * scaleIn(neqN)).toFixed(4)})`, transformOrigin: '640px 400px'}}>
          <CText cx={640} cy={400} size={64} weight={900} color={WHITE} shadow="0 0 18px rgba(255,255,255,.35)">&ne;</CText>
        </div>
      ) : null}
      {/* ===== 右卡（happened）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - T_PLATES - 2, 8), transform: `translateY(${(38 * Math.pow(1 - pr, 2.2)).toFixed(2)}px) translateX(${(-10 * bumpR).toFixed(2)}px) scale(${(1 + 0.05 * bumpR).toFixed(4)})`, transformOrigin: '970px 400px'}}>
        {/* 虚线灰框（待定）→ 实线白框 */}
        <Box x={RP.x} y={RP.y} w={RP.w} h={RP.h} r={14} sw={2} dashed stroke={GREY} opacity={1 - solidK} />
        <Box x={RP.x} y={RP.y} w={RP.w} h={RP.h} r={14} sw={2.5} opacity={solidK} />
        {rcN >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: clamp01(rcN / 8)}}>
            {/* 光环后半（图标之后） */}
            <HaloRing cx={HALO.cx} cy={HALO.cy} rxo={HALO.rxo} ryo={HALO.ryo} rxi={HALO.rxi} ryi={HALO.ryi} p={haloP} fillOp={haloFill * 0.9} phase={phase} half="back" />
            {/* pcap 文件图标（DocIcon 风：折角 + 文本线条，首行紫） */}
            <div style={{position: 'absolute', inset: 0, transform: `scale(${rcS.toFixed(4)})`, transformOrigin: '970px 390px'}}>
              <div style={{...abs(DOC.x, DOC.y, DOC.w, DOC.h)}}>
                <svg width={DOC.w} height={DOC.h} viewBox={`0 0 ${DOC.w} ${DOC.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(255,255,255,.35))'}}>
                  <path d={`M1.5,1.5 H${DOC.w - 45 - 1.5} L${DOC.w - 1.5},${45 + 1.5} V${DOC.h - 1.5} H1.5 Z`} fill="#000" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
                  <path d={`M${DOC.w - 45 - 1.5},1.5 V${45 + 1.5} H${DOC.w - 1.5}`} fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinejoin="round" />
                  {[0, 1, 2, 3].map((i) => {
                    const ly = 62 + i * 26;
                    const lw = (i === 3 ? 0.5 : 0.78 - i * 0.06) * (DOC.w - 36);
                    return <rect key={i} x={18} y={ly} width={lw} height={4} fill={i === 0 ? PURPLE_LIGHT : GREY_LIGHT} opacity={i === 0 ? 1 : 0.85} />;
                  })}
                </svg>
              </div>
              {/* mini 时间轴条（逐格点亮 + 白游标循环） */}
              <div style={{...abs(STRIP.x, STRIP.y, STRIP.w, STRIP.h), background: '#000', border: `1.5px solid ${GREY_LINE}`, borderRadius: 10}} />
              {Array.from({length: STRIP.cells}, (_, i) => {
                const cw = 27, gap = (STRIP.w - 14 - STRIP.cells * cw) / (STRIP.cells - 1);
                const lit = stripN >= i * 5;
                const hot = i === hi;
                return <div key={i} style={{position: 'absolute', left: STRIP.x + 7 + i * (cw + gap), top: STRIP.y + 4.5, width: cw, height: STRIP.h - 9, borderRadius: 4, background: hot ? WHITE : lit ? PURPLE : '#15161c', border: `1.5px solid ${hot ? WHITE : lit ? PURPLE : GREY_LINE}`, boxShadow: hot ? '0 0 10px 2px rgba(255,255,255,.5)' : undefined, opacity: lit || hot ? 1 : 0.8}} />;
              })}
            </div>
            {/* 光环前半（图标之前） */}
            <HaloRing cx={HALO.cx} cy={HALO.cy} rxo={HALO.rxo} ryo={HALO.ryo} rxi={HALO.rxi} ryi={HALO.ryi} p={haloP} fillOp={haloFill * 0.9} phase={phase} half="front" />
            {/* pcap 标识 */}
            <CText cx={970} cy={517} size={24} weight={700} family={FONT_MONO} color={WHITE} letterSpacing={1} dy={0}>pcap</CText>
          </div>
        ) : null}
        {/* happened 紫标签 */}
        <SoftIn N={N} f0={T_RIGHT + 2}>
          <Pill x={890} y={262} w={160} h={40} fill={PURPLE} sw={2.5} text="happened" fontSize={26} weight={700} glow="0 0 14px 3px rgba(102,45,248,.4)" />
        </SoftIn>
      </div>
    </div>
  );
};
