import React from 'react';
import {DocIcon, Pill, WHITE, PURPLE, GREY, abs} from '../../ui';

/** pcap 文件图标（章界承接：SC22 的折角文档 + `pcap` 标签，同款几何；labelOp 飞行途中可隐标签） */
export const PcapIcon: React.FC<{cx: number; cy: number; scale?: number; opacity?: number; labelOp?: number}> = ({cx, cy, scale = 1, opacity = 1, labelOp = 1}) => (
  <div style={{...abs(cx - 52 * scale, cy - 62 * scale, 104 * scale, (124 + 34) * scale), opacity}}>
    <div style={{width: 104 * scale, height: 124 * scale, transformOrigin: '0 0', transform: `scale(${scale})`}}>
      <DocIcon x={0} y={0} w={104} h={124} lines={4} />
    </div>
    {labelOp > 0.02 ? (
      <div style={{position: 'absolute', left: 0, top: 124 * scale, width: 104 * scale, textAlign: 'center', fontFamily: 'inherit', fontSize: 26 * scale, fontWeight: 600, color: WHITE, lineHeight: 1.2, opacity: labelOp}}>
        pcap
      </div>
    ) : null}
  </div>
);

/** 面板大标题：紫底号码 Pill + Noto 900 大字 + 灰色小副标（SC24/25/26 顶栏统一版式） */
export const PaneTitle: React.FC<{x: number; y: number; no: string; text: string; sub?: string; op?: number}> = ({x, y, no, text, sub, op = 1}) => (
  <div style={{...abs(x, y), opacity: op, display: 'flex', alignItems: 'flex-start', gap: 16}}>
    <Pill x={0} y={2} w={44} h={44} fill={PURPLE} stroke={WHITE} sw={2} text={no} fontSize={26} weight={800} textDy={0} />
    <div>
      <div style={{fontWeight: 900, fontSize: 46, color: WHITE, lineHeight: 1, letterSpacing: 0.5, textShadow: '0 0 14px rgba(255,255,255,.3)'}}>{text}</div>
      {sub ? <div style={{marginTop: 10, fontSize: 24, fontWeight: 600, color: GREY, lineHeight: 1}}>{sub}</div> : null}
    </div>
  </div>
);
