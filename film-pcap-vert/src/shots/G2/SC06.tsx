import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, rnd, FONT_MONO} from '../../common';
import {CText, EXAMPLE, PacketIcon, GREY, GREY_LINE, GREY_LIGHT, ORANGE, PURPLE_LIGHT, WHITE, abs, exitOp, firstOp, glowOffK, glowPurpleS, mixHex, scaleIn, SoftIn} from '../../ui';
import {MiniRowV, NumBadge, WSChromeV} from './g2ui';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * SC06 三个面板 · N 857–1100（S07 865–1078 ¶：865 三个面板 / 961 每包一行 / 1004 层层剥开 / 1049 原始字节）
 * 版式：竖版 Wireshark 窗口 x40–620（w580，y280–960，h680），三区竖排——
 *   ① packet list：表头 + 4 行 MiniRowV（EXAMPLE.wsRows 806/807/808/812；812 重传行紫底 + Info 橙显 + 落位白闪）；
 *   ② details tree：▸ Ethernet II ▸ IP(+src→dst) ▸ TCP(+443) ▸ TLSv1.3(+Application Data) 四层逐层展开（层间白闪）；
 *   ③ packet bytes：hex 网格 4 行 × 8 字节 + 0x 偏移列，逐字节级联点亮（约 3 字节/帧，1059 完成）。
 * 三枚 ①②③ 紫 Pill 挂各区右上；当前面板紫边框 + 侧边光条轮换（961/1004/1049），呼吸常亮。
 * 节拍：859 窗口 21 帧缩放入；866 副本信封自下方升起（G1 复印母题承接）→ 895/915/935 三区依次 wipe；
 *   959 表头逐列 wipe；961 数据行 2 帧错峰 wipe（979 当前行点亮）；1049 hex 级联。
 * 停留：¶ 段末 — 级联完成 1059 → 离场 1092，33 帧 ✓。末 8 帧先灭光再归零。零 glitch。
 * 主角：窗口（680px 高，当前面板紫边光）。
 */
const F0 = 857;
const TO = 1100;
const T_WIN = 859, T_ENV = 866;
const T_ZONE = [895, 915, 935];
const T_HEAD = 959, T_ROWS = 961, T_ACT = 979;
const T_TREE = [1004, 1016, 1028, 1040];
const T_HEX = 1049;

const WIN = {x: 40, y: 280, w: 580, h: 680};
const ZONE = [
  {y: 332, h: 246}, // ① packet list
  {y: 582, h: 187}, // ② details tree
  {y: 773, h: 183}, // ③ packet bytes
];
const ROWS = [EXAMPLE.wsRows[0], EXAMPLE.wsRows[1], EXAMPLE.wsRows[2], EXAMPLE.wsRows[3]];
const ACTIVE_ROW = 3; // 812 重传行
const HEADS = [
  {t: 'No.', x: 60},
  {t: 'Time', x: 112},
  {t: 'Protocol', x: 188},
  {t: 'Info', x: 306},
];
const TREE = [
  {name: 'Ethernet II', indent: 20},
  {name: 'IP', value: '198.51.100.24 \u2192 203.0.113.10', indent: 52},
  {name: 'TCP', value: '443', indent: 84},
  {name: 'TLSv1.3', value: 'Application Data', indent: 116},
];
const TREE_Y = [608, 655, 702, 749];
const HEX_Y = [798, 845, 892, 939];
const HEX_OFF_X = 70, HEX_CELL_X = 170, HEX_CELL_W = 45;
const BYTES = Array.from({length: 32}, (_, i) => Math.floor(rnd(i + 1, 7) * 256));
const PILL = [
  {cx: 585, cy: 352},
  {cx: 585, cy: 600},
  {cx: 585, cy: 789},
];
const hex = (v: number) => v.toString(16).toUpperCase().padStart(2, '0');

const flash = (n: number, len = 6) => (n <= 0 || n >= len ? 0 : n < len / 2 ? n / (len / 2) : 1 - (n - len / 2) / (len / 2));
const PANE_ON = [T_ROWS, T_TREE[0], T_HEX];

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const op = exitOp(N, TO, 8);
  const gk = glowOffK(N, TO, 6, 8);

  // 窗口 21 帧缩放入（0.86→1，中心 (330,620)）
  const wS = 0.86 + 0.14 * scaleIn(N - T_WIN, 21);
  const wOp = firstOp(N - T_WIN, 8);

  // 副本信封：自 SC05 卡③方向升起进入窗口中心后消散
  const en = N - T_ENV;
  const envT = clamp01(en / 30);
  const envY = 985 - 345 * (1 - Math.pow(1 - envT, 2.2));
  const envX = 250 + 110 * envT;
  const envOp = en < 0 ? 0 : Math.min(1, en / 5) * (1 - clamp01((en - 22) / 8));

  // 面板紫边：PANE_ON[i] 起 8 帧亮，下一面板起 8 帧回落
  const paneK = PANE_ON.map((t, i) => {
    const on = clamp01((N - t) / 8);
    const off = i < 2 ? clamp01((N - PANE_ON[i + 1]) / 8) : 0;
    return on * (1 - 0.95 * off);
  });
  const breathe = (0.85 + 0.15 * Math.sin((2 * Math.PI * N) / 30)) * gk;

  // 列表行 wipe（2 帧错峰，10 帧）
  const rowP = (i: number) => clamp01((N - (T_ROWS + i * 2)) / 10);
  const actRow = N >= T_ACT;
  const actFlash = flash(N - T_ACT, 6);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', inset: 0, opacity: wOp, transform: `translate(330px,620px) scale(${wS.toFixed(4)}) translate(-330px,-620px)`}}>
        <WSChromeV x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} title="Wireshark">
          {/* 三区矩形（依次 wipe；激活面板紫框 + 光） */}
          {ZONE.map((z, i) => {
            const zp = clamp01((N - T_ZONE[i]) / 16);
            if (zp <= 0) return null;
            const k = paneK[i];
            return (
              <div key={i} style={{...abs(46 - WIN.x, z.y - WIN.y, 568, z.h), clipPath: `inset(0 ${((1 - zp) * 100).toFixed(1)}% 0 0)`}}>
                <div style={{position: 'absolute', inset: 0, border: `1.5px solid ${mixHex(GREY_LINE, PURPLE_LIGHT, k)}`, opacity: k > 0.02 ? 1 : 0.5}} />
                {k > 0.02 ? <div style={{position: 'absolute', inset: 0, border: `2.5px solid ${PURPLE_LIGHT}`, borderRadius: 4, boxShadow: glowPurpleS(k * breathe)}} /> : null}
              </div>
            );
          })}

          {/* ① packet list：表头 + 4 行 */}
          {N >= T_HEAD ? (
            <div style={{...abs(6, 56, 568, 36), display: 'flex', alignItems: 'center', borderBottom: `2px solid ${GREY_LINE}`, opacity: firstOp(N - T_HEAD, 6)}}>
              {HEADS.map((h, i) => (
                <span key={h.t} style={{...abs(h.x - 46, 0, 120, 36), display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1, opacity: clamp01((N - (T_HEAD + i)) / 8)}}>
                  {h.t}
                </span>
              ))}
            </div>
          ) : null}
          {ROWS.map((row, i) => {
            const p = rowP(i);
            if (p <= 0) return null;
            return (
              <div key={row.no} style={{...abs(6, 92 + i * 52, 568, 52), clipPath: `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)`, filter: i === ACTIVE_ROW && actFlash > 0 ? `brightness(${(1 + 0.55 * actFlash).toFixed(2)})` : undefined}}>
                <MiniRowV x={0} y={0} w={568} row={row} active={i === ACTIVE_ROW && actRow} />
              </div>
            );
          })}

          {/* ② details tree：四层逐层展开（slide + 层间白闪） */}
          {TREE.map((tnode, j) => {
            const tn = N - T_TREE[j];
            if (tn < 0) return null;
            const sIn = 1 - Math.pow(1 - clamp01(tn / 8), 2.5);
            const tFlash = flash(N - (T_TREE[j] + 8), 5);
            return (
              <div key={tnode.name} style={{...abs(66 + tnode.indent, TREE_Y[j]), opacity: Math.min(1, tn / 6), transform: `translateX(${((1 - sIn) * -22).toFixed(1)}px)`, filter: tFlash > 0 ? `brightness(${(1 + 0.6 * tFlash).toFixed(2)})` : undefined, display: 'flex', alignItems: 'center', gap: 14}}>
                <span style={{width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `9px solid ${j === 3 ? PURPLE_LIGHT : GREY_LIGHT}`}} />
                <span style={{fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: tFlash > 0 || j === 3 ? WHITE : GREY_LIGHT, lineHeight: 1}}>{tnode.name}</span>
                {tnode.value ? (
                  <span style={{fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1, opacity: clamp01((tn - 6) / 8)}}>{tnode.value}</span>
                ) : null}
              </div>
            );
          })}

          {/* v2: 列表扫描条（{T_ACT}+30 起在 4 行间循环下移，持续到离场——可感知动词） */}
          {N >= T_ACT + 30 ? (() => {
            const sn = (N - T_ACT - 30) % 96;
            const si = Math.min(3, Math.floor(sn / 24));
            const fr = (sn % 24) / 24;
            const rowY = (i: number) => 92 + i * 52;
            const sy = rowY(si) + (si < 3 ? (rowY(si + 1) - rowY(si)) * fr : 0);
            return <div style={{...abs(10, sy + 6, 560, 40), background: 'rgba(102,48,248,.30)', borderTop: '2px solid rgba(226,214,255,.9)', borderBottom: '2px solid rgba(226,214,255,.9)', borderRadius: 3, opacity: 0.85 * Math.min(1, (N - T_ACT - 30) / 8)}} />;
          })() : null}
          {/* ③ packet bytes：偏移列 + hex 网格 4×8，逐字节级联（约 3 字节/帧） */}
          {N >= T_HEX ? (
            <div style={{position: 'absolute', inset: 0}}>
              {HEX_Y.map((y, r) => (
                <div key={r} style={{...abs(HEX_OFF_X, y), display: 'flex', alignItems: 'baseline', opacity: firstOp(N - T_HEX, 6)}}>
                  <span style={{width: 88, fontFamily: FONT_MONO, fontSize: 22, color: GREY, lineHeight: 1}}>0x{(r * 8).toString(16).padStart(4, '0')}</span>
                  {Array.from({length: 8}, (_, c) => {
                    const i = r * 8 + c;
                    const litAt = T_HEX + Math.floor(i / 6); // v2: 级联加速（3→6 字节/帧）
                    const lit = N >= litAt;
                    const fresh = N - litAt < 3;
                    return (
                      <span
                        key={c}
                        style={{
                          width: HEX_CELL_W,
                          textAlign: 'center',
                          fontFamily: FONT_MONO,
                          fontSize: 24,
                          lineHeight: 1,
                          color: lit ? WHITE : GREY_LINE,
                          opacity: lit ? clamp01((N - litAt) / 2) : 0.55,
                          textShadow: fresh ? '0 0 12px rgba(255,255,255,.8)' : undefined,
                        }}
                      >
                        {lit ? hex(BYTES[i]) : '--'}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : null}

          {/* ①②③ 紫 Pill（挂各区右上，随激活出现） */}
          {PANE_ON.map((t, i) => (
            <SoftIn key={i} N={N} f0={t}>
              <div style={{...abs(PILL[i].cx - WIN.x, PILL[i].cy - WIN.y)}}>
                <NumBadge cx={0} cy={0} r={17} digit={String(i + 1)} lit digitSize={22} fill />
              </div>
            </SoftIn>
          ))}
        </WSChromeV>
      </div>

      {/* 副本信封（窗口缩放层之外，直飞窗口中心） */}
      {envOp > 0.01 ? <PacketIcon cx={envX} cy={envY} w={44} h={30} accent glow opacity={envOp * gk} /> : null}
    </div>
  );
};
