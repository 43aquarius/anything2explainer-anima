import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, powIn} from '../../common';
import {exitOp, fadeIn} from '../../ui';
import {CameraRig} from '../../fx';
import type {CamKey} from '../../fx';
import {SlotCard, FloppyGlyph, CRTGlyph, PrinterGlyph, PromptGlyph} from './layout';

/**
 * SC08 选了 1989 · N 1155–1259（S08 1163–1222 ¶：1163 They picked one from 1989.）
 * 承接 SC07 虚线卡（不清场，相机停在 (950,360,1.06) 原样交接 → 交界帧 1154|1155 像素一致）：
 * 1163 问号 4 帧收合 → 1167 `1989`（Orbitron 130px 白+紫描边）scaleX 翻面 + 14 帧计数 + GlitchIn rgbSplit 6
 *   （本镜唯一 glitch）→ 1181 落位紫光晕爆发 + 卡虚线→实线（12 帧）+ 卡放大 380×200→500×300（均 SlotCard 内置）。
 * 1185+2i 四枚 DOS 元素（软盘/CRT/点阵打印机/命令行光标，白线条简笔 ≤80px）2 帧错峰自画外上缘 powIn(2.2) 落入
 *   下缘排开（世界坐标 560/830/1080/1330 → 屏幕 ≈227/513/778/1043；画在卡之前 = 从卡后露出；各 4 帧小弹跳）；
 * CRT 光标 24 帧周期 + 命令行 20 帧周期持续闪烁（持续动作）+ 1989 紫晕 30 帧呼吸。
 * 停留：末枚落位 1210 → 离场 1252−8，hold 42 帧 ✓（¶：末拍落位后 ≥30）。末 8 帧归零（紫晕先灭 6 帧）。
 * 分镜表 SC08 行无运镜（CH1 清单亦无）→ 相机静止在 SC07 末态。
 */
const F0 = 1155;
const TO = 1259;
const CAM: CamKey[] = [{f: 1155, x: 950, y: 360, s: 1.06}]; // SC07 末态原样

const T_DOS = 1185; // 四枚 DOS 元素 2 帧错峰（1989 落位爆发后 4 帧）
const DOS_Y = 562; // 落点行（世界坐标；→屏幕 ~574，卡下缘 ~520 之下、字幕带 637 之上）
const DOS0 = -58; // 起始（画外上缘，世界坐标 →屏幕 ~−76）
const FALL = 15; // powIn 落下帧数
const BOUNCE = 4; // 到位小弹跳帧数

const DOS: Array<{cx: number; t0: number; kind: 'floppy' | 'crt' | 'printer' | 'prompt'}> = [
  {cx: 560, t0: T_DOS, kind: 'floppy'},
  {cx: 830, t0: T_DOS + 2, kind: 'crt'},
  {cx: 1080, t0: T_DOS + 4, kind: 'printer'},
  {cx: 1330, t0: T_DOS + 6, kind: 'prompt'},
];

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);
  if (exOp <= 0) return null;
  return (
    <CameraRig N={N} keys={CAM}>
      {/* 四枚 DOS 元素（画在 SlotCard 之前：两枚中间者自卡后穿过、下缘露出；两枚侧翼全程可见） */}
      <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
        {DOS.map(({cx, t0, kind}, i) => {
          const n = N - t0;
          if (n < 0) return null;
          const t = clamp01(n / FALL);
          let y = DOS0 + (DOS_Y - DOS0) * powIn(2.2)(t); // powIn：重力感加速落下
          const bn = n - FALL;
          if (bn > 0 && bn < BOUNCE) y += 6 * Math.sin((Math.PI * bn) / BOUNCE); // 到位小弹跳（下冲回弹）
          const op = fadeIn(n, 5);
          if (kind === 'floppy') return <FloppyGlyph key={i} cx={cx} cy={y} op={op} />;
          if (kind === 'crt') return <CRTGlyph key={i} cx={cx} cy={y} N={N} op={op} />;
          if (kind === 'printer') return <PrinterGlyph key={i} cx={cx} cy={y} op={op} />;
          return <PromptGlyph key={i} cx={cx} cy={y} N={N} op={op} />;
        })}
      </div>
      {/* 虚线卡 → 1989 揭示（SC07 同组件同参数；本镜内翻面/计数/GlitchIn/实线化/放大，末 8 帧归零） */}
      <SlotCard N={N} exitAt={TO} />
    </CameraRig>
  );
};
