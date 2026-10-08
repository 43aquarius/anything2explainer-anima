import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic, FONT_MONO} from '../../common';
import {Box, CText, GREY, WHITE, abs, exitOp, glowOffK, softOp} from '../../ui';
import {CatIcon, FilenameCard} from './g1ui';

/**
 * SC02 全在里面 · N 185–309（S02 193–307：193 面单·代码·签名 / 278 都在这）。
 * 承接：文件名卡（SC01 末相机态 (360,440,1.15)）由容器变换 1:1 复现 → 14 帧缩到上 1/4（cy 330，0.55×）；
 * 中段纵向文件列表（y 470–798）：4 行条目（AndroidManifest.xml / classes.dex / resources.arsc / META-INF/，
 * 等宽 24px）193 起 2 帧错峰滑入 + 类别小图标 draw-on；条目行 0.5px 交替微漂（列队感，持续）。
 * 白色聚焦光随解说传递：manifest 203 → code 228 → signatures 253；278（"it's all right there"）四行同亮，
 * 底部小字 `it's all right there`（灰 24px）打字机（1 帧/字，278–298）。
 * 无运镜（分镜表清单 SC02 无）。末 8 帧归零（301–309，含卡——SC03 清场重开）。停留：段内不判。
 * 主角 = 文件列表 360px 高（470–830 区间），光 = 当前条目白光。
 */
const F0 = 185;
const TO = 309;
const T_SHRINK = 185; // 承接缩位移 14 帧
const T_ROWS = 193;
const T_TEXT = 278;
const ROWS = [
  {name: 'AndroidManifest.xml', cat: 0},
  {name: 'classes.dex', cat: 1},
  {name: 'resources.arsc', cat: 2},
  {name: 'META-INF/', cat: 3},
];
const ROW = {x: 110, w: 500, h: 64};
const rowCy = (i: number) => 502 + i * 88;
const FOCUS_SEQ = [0, 1, 3]; // 解说点名顺序：manifest → code → signatures（resources.arsc 未点名）
const FOCUS_AT = [203, 228, 253];

/** 白色聚焦光（随解说传递，8 帧亮起 / 下一焦点到达后 8 帧回落；末项 278 让位给四行同亮） */
const focusK = (i: number, N: number) => {
  const k = FOCUS_SEQ.indexOf(i);
  if (k < 0) return 0;
  const up = clamp01((N - FOCUS_AT[k]) / 8);
  const down = k < FOCUS_SEQ.length - 1 ? clamp01((N - FOCUS_AT[k + 1]) / 8) : clamp01((N - T_TEXT) / 8);
  return Math.max(0, Math.min(1, up - down));
};

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // 承接缩位移：相机态 (360,440,1.15) → 上 1/4（cy 330，0.55×）；容器原点 = 卡世界中心 (360,440)
  const st = easeInOutPow(2.5)(clamp01((N - T_SHRINK) / 14));
  const cardDy = 200 + (-110 - 200) * st; // 屏幕中心 640 → 330
  const cardK = 1.15 + (0.55 - 1.15) * st;

  // 278 四行同亮（"it's all right there"）
  const allK = Math.min(clamp01((N - T_TEXT) / 8), 1 - clamp01((N - 294) / 8));

  const typed = N < T_TEXT ? '' : "it's all right there".slice(0, Math.floor(N - T_TEXT));

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 文件名卡（SC01 承接 → 缩到上 1/4） */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '360px 440px',
          transform: `translate(0px, ${cardDy.toFixed(2)}px) scale(${cardK.toFixed(4)})`,
          opacity: exOp,
        }}
      >
        <FilenameCard N={N} exitAt={TO} />
      </div>

      {/* 纵向文件列表（主角） */}
      {ROWS.map((row, i) => {
        const n = N - (T_ROWS + 2 * i);
        if (n < 0) return null;
        const e = easeOutCubic(clamp01(n / 16));
        const drift = 0.5 * Math.sin((2 * Math.PI * (N - T_ROWS)) / 96 + i * Math.PI) * clamp01((n - 16) / 10);
        const ty = -46 * (1 - e) + drift;
        const op = softOp(n, 8) * exOp;
        if (op <= 0) return null;
        const fk = focusK(i, N);
        const glowA = Math.max(fk * 0.3, allK * 0.34) * gk;
        const catP = clamp01((N - (T_ROWS + 2 * i + 8)) / 10);
        return (
          <div key={i} style={{...abs(ROW.x, rowCy(i) - ROW.h / 2, ROW.w, ROW.h), opacity: op, transform: `translateY(${ty.toFixed(2)}px)`}}>
            <Box
              x={0}
              y={0}
              w={ROW.w}
              h={ROW.h}
              r={8}
              sw={2}
              stroke={WHITE}
              fill="rgba(0,0,0,0.6)"
              style={glowA > 0.01 ? {boxShadow: `0 0 24px 8px rgba(255,255,255,${glowA.toFixed(3)})`} : undefined}
            />
            <CatIcon x={18} y={16} cat={row.cat} p={catP} />
            <span style={{position: 'absolute', left: 72, top: 19, fontFamily: FONT_MONO, fontSize: 24, color: WHITE, whiteSpace: 'nowrap', lineHeight: '26px'}}>{row.name}</span>
          </div>
        );
      })}

      {/* 底部小字（打字机，278 起 1 帧/字 → 298 完成） */}
      <CText cx={360} cy={878} size={24} weight={600} color={GREY} letterSpacing={1} opacity={exOp}>
        {typed}
      </CText>
    </div>
  );
};
