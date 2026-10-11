import React from 'react';
import {clamp01, FONT_ORB, FONT_HEAVY, FONT_MONO} from '../../common';
import {Box, CText, PacketIcon, LockSeal, GREY, GREY_LIGHT, GREY_MID, WHITE, PURPLE_LIGHT, ORANGE, BLOOM, softOp} from '../../ui';
import {HeroGlow, GlowBlob} from '../../fx';

/**
 * G2 组内补件（ui.tsx 没有的语义图形；只在本组使用）。
 * 全部为 N 的纯函数；动画量由调用方按 N 算好传入。
 * ⚠ 本文件不得 import LightSweep / StageLine / GhostText（扫光白名单只有 SC06.tsx 可用，selfcheck 按文件静态计数）。
 */

// ===================== YearRoll（年份滚落：SC05 `1994`；G5/G7 可复制） =====================
/** 年份逐位滚落：每位错峰停住（8/10/12/14 帧），模糊 ≥blur px 归 0（分镜表：14 帧归 0）。Orbitron tabular 感。 */
export const YearRoll: React.FC<{N: number; f0: number; cx: number; cy: number; value: string; size?: number; color?: string; blur?: number; opacity?: number}> = ({N, f0, cx, cy, value, size = 96, color = GREY_LIGHT, blur = 9, opacity = 1}) => {
  const n = N - f0;
  if (n < 0) return null;
  const chars = value.split('');
  const cw = size * 0.82; // Orbitron 数字步进
  const w = cw * chars.length;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - size * 0.62, width: w, height: size * 1.24, opacity: softOp(n, 10) * opacity}}>
      {chars.map((ch, i) => {
        const stop = 8 + i * 2; // 第 i 位在 f0+8+2i 帧停住（末位 14 帧归 0）
        const p = clamp01(n / stop);
        const d = parseInt(ch, 10);
        // 里程表式上滚到目标位：floor 随缓出递减 → 数字递增穿过绕回点
        const roll = Number.isNaN(d) ? ch : String(((d - Math.floor(16 * Math.pow(1 - p, 1.6))) % 10 + 10) % 10);
        const b = blur * Math.pow(1 - p, 0.9);
        return (
          <div key={i} style={{position: 'absolute', left: i * cw, top: 0, width: cw, height: size * 1.24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_ORB, fontWeight: 700, fontSize: size, color, lineHeight: 1, filter: b > 0.4 ? `blur(${b.toFixed(1)}px)` : undefined}}>
            {roll}
          </div>
        );
      })}
    </div>
  );
};

// ===================== MiniSidebar（SC04 侧栏缩微回声：SC05 承接用） =====================
/** SC04「people nearby」侧栏的组内复刻（基尺寸 520×360，与 G1 分镜同规格；调用方用 s 缩放）。SC04 末态：bob 行已翻成 attacker。 */
export const MiniSidebar: React.FC<{cx: number; cy: number; s: number; opacity?: number; dim?: number}> = ({cx, cy, s, opacity = 1, dim = 0}) => {
  const rows = ['alice', 'attacker', 'carol', 'dave'];
  return (
    <div style={{position: 'absolute', left: cx - 260 * s, top: cy - 180 * s, width: 520, height: 360, transform: `scale(${s})`, transformOrigin: '0 0', opacity, filter: dim > 0 ? `saturate(${(1 - 0.6 * dim).toFixed(2)})` : undefined}}>
      <Box x={0} y={0} w={520} h={360} r={10} sw={2.5} />
      <CText cx={260} cy={32} size={22} weight={600} color={GREY} letterSpacing={3}>people nearby</CText>
      {rows.map((name, i) => {
        const hl = name === 'attacker';
        const y = 74 + i * 62;
        return (
          <div key={name} style={{position: 'absolute', left: 28, top: y, width: 464, height: 52, border: hl ? `2px solid ${PURPLE_LIGHT}` : '1.5px solid #26262b', borderRadius: 8, boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', left: 14, top: 11, width: 28, height: 28, borderRadius: '50%', border: `2px solid ${hl ? PURPLE_LIGHT : GREY_MID}`}} />
            <div style={{position: 'absolute', left: 58, top: 13, fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 26, color: hl ? PURPLE_LIGHT : WHITE, lineHeight: 1}}>{name}</div>
            <div style={{position: 'absolute', right: 14, top: 16, width: 22, height: 18, border: `2px solid ${GREY_MID}`, borderRadius: 3}} />
          </div>
        );
      })}
      <CText cx={260} cy={334} size={22} weight={600} color={GREY}>logged in as bob</CText>
    </div>
  );
};

// ===================== CreditCard（信用卡：SC05 右半主角） =====================
/** 信用卡图形：圆角白描边 + 芯片 + 卡号打码线逐段出现（f0num 起 3 段、每段 4 帧：•• / •• / 1234）。 */
export const CreditCard: React.FC<{cx: number; cy: number; N: number; f0num: number; glowK: number; opacity?: number}> = ({cx, cy, N, f0num, glowK, opacity = 1}) => {
  const s1 = N >= f0num, s2 = N >= f0num + 4, s3 = N >= f0num + 8;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <HeroGlow x={cx - 100} y={cy - 65} w={200} h={130} r={14} N={N} k={glowK} />
      <div style={{position: 'absolute', left: cx - 100, top: cy - 65, width: 200, height: 130, filter: BLOOM}}>
        <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${WHITE}`, borderRadius: 14, boxSizing: 'border-box'}} />
        {/* 芯片 */}
        <div style={{position: 'absolute', left: 18, top: 18, width: 30, height: 22, border: `2px solid ${ORANGE}`, borderRadius: 5}} />
        {/* 磁条位 */}
        <div style={{position: 'absolute', left: 60, top: 20, width: 74, height: 8, background: '#26262b'}} />
        {/* 卡号打码线：逐段出现 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 26, color: WHITE, letterSpacing: 2, lineHeight: 1, whiteSpace: 'pre'}}>
          {s1 ? '••' : '  '}{s2 ? '••' : '  '} {s3 ? '1234' : '    '}
        </div>
      </div>
    </div>
  );
};

// ===================== LockEnvelope（巨信封 + 挂锁：SC06 主角，SC07 承接共用） =====================
/**
 * SC06/SC07 共用的"巨信封 + 压在封口上的挂锁"（承接规则：两镜头同一组件同一参数）。
 * 定位固定：信封中心 (640,385)、w 420 h 290（PacketIcon 比例）；封口折点 (640,362) 即锁位（lockCy 可做落下动画）。
 * SC06 末帧与 SC07 首帧参数一致 → 无缝交接（SC07 外面再包 kf 缩移包装器）。
 */
export const LockEnvelope: React.FC<{N: number; glowK: number; lockGlowK: number; lockCy?: number; openK?: number; squash?: number; opacity?: number}> = ({N, glowK, lockGlowK, lockCy = 362, openK = 0, squash = 0, opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity}}>
    {/* 信封主角柔光（30 帧呼吸内建） */}
    <HeroGlow x={430} y={240} w={420} h={290} r={16} N={N} k={glowK} />
    {/* 信封本体（落锁冲击时的轻微下压回弹，squash 0→1→0 由调用方给 sin 包络） */}
    <div style={{position: 'absolute', inset: 0, transform: `scaleY(${(1 - 0.03 * squash).toFixed(4)})`, transformOrigin: '640px 530px'}}>
      <PacketIcon cx={640} cy={385} w={420} h={290} />
    </div>
    {/* 锁的紫光斑（登场的唯一大面积光；30 帧呼吸内建） */}
    <GlowBlob cx={640} cy={lockCy} r={118} N={N} k={lockGlowK} />
    <LockSeal cx={640} cy={lockCy} w={150} h={180} openK={openK} glow />
  </div>
);
