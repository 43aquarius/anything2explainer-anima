import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, emphasisPulse, FONT_ORB} from '../../common';
import {CText, Check, Pill, PacketIcon, WHITE, GREY, GREY_LIGHT, exitOp, softOp, SoftIn, abs} from '../../ui';
import {PathMap, pathEnvX, StationCircle, LaptopIcon} from './g3ui';

/**
 * SC14 立足点①：本机 · N 2776–2956（S17 2784–2954：2784「自己的机器」/ 2854「系统本来就看得见」/ 2922「最容易的」）
 * 承接位移（Ch2 运镜①）：SC13 路径组 16 帧 easeInOutPow(2.5) 缩到左下角（中心 (640,400)→(300,512)，s→0.34，不清场）；
 *   左端电脑节点同帧放大到中央（(160,400) w120 → (640,380) w320，t=0 与 SC13 末帧逐像素一致）。
 * 版式：中央 LaptopIcon 320px（屏内 OS 小方块 + seeing 指示灯）；两侧信封双向流动（上道 y332 右行 / 下道 y428 左行，
 *   穿过机身后面）；屏上方 `your own traffic` 灰 24px；左上角 ① 站位角标（紫）；右侧绿 Check + `the easy one` Pill。
 * 节拍：2784 `your own traffic` SoftIn；2854 信封双向流动（2.8px/帧持续）+ OS 方块 SoftIn + seeing 灯点亮（紫闪）；
 *   2922 绿 Check draw-on 12 帧 + Pill SoftIn；运镜：2800–2920 整组 1→1.05 慢推（段内镜头）。
 * 停留：段内不判（S17 非 ¶）。末 8 帧整组归零。主角：笔记本 224px 高（HeroGlow 紫柔光）。
 */
const F0 = 2776;
const TO = 2956;
const T_T = 2776, T_BADGE = 2776, T_LABEL = 2784, T_OS = 2854, T_CHECK = 2922;
const MAP_END = {cx: 300, cy: 512, s: 0.34};
const LAPT_END = {cx: 640, cy: 380, w: 320};

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exOp = exitOp(N, TO, 8);

  // 承接位移：t=0 为 identity（组界帧与 SC13 末帧一致）
  const tt = easeInOutPow(2.5)(clamp01((N - T_T) / 16));
  const ms = 1 + (MAP_END.s - 1) * tt;
  const mtx = (MAP_END.cx - 640) * tt;
  const mty = (MAP_END.cy - 400) * tt;

  // 笔记本：从左端节点放大到中央；落位 2792 脉冲一次
  const lcx = PATH_LX + (LAPT_END.cx - PATH_LX) * tt;
  const lcy = 400 + (LAPT_END.cy - 400) * tt;
  const lw = 120 + (LAPT_END.w - 120) * tt;
  const landP = emphasisPulse(N - (T_T + 16), {peak: 1.08, up: 10, hold: 3, down: 12});

  // 信封流（承接期随路径组缩小，2792–2802 淡出）
  const envOp = 1 - clamp01((N - (T_T + 16)) / 10);

  // OS 方块 + seeing 指示灯
  const osOp = softOp(N - T_OS, 8);
  const indK = clamp01((N - (T_OS + 6)) / 8);
  const indA = indK * (0.55 + 0.45 * Math.sin((2 * Math.PI * N) / 16));

  // 机身两侧双向信封道（2854 起，2.8px/帧持续动作）
  const laneEnv = (i: number, dir: 1 | -1) => {
    const f = N - T_OS - (dir === 1 ? 0 : 2);
    if (f < i * 6) return null;
    const x = dir === 1 ? 100 + ((f * 2.8 + i * 180) % 1080) : 1180 - ((f * 2.8 + i * 180) % 1080);
    const edge = Math.min(1, (x - 100) / 40, (1180 - x) / 40);
    return {x, op: Math.max(0, edge)};
  };

  // 慢推（段内贯穿，1→1.05）
  const camS = 1 + 0.05 * easeInOutPow(2)(clamp01((N - (T_T + 24)) / 120));

  const ckP = clamp01((N - T_CHECK) / 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exOp}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(640px,360px) scale(${camS.toFixed(4)}) translate(-640px,-360px)`}}>
        {/* 缩略路径图（承接，不清场；① 亮） */}
        <div style={{position: 'absolute', inset: 0, transform: `translate(${mtx.toFixed(2)}px,${mty.toFixed(2)}px) translate(640px,400px) scale(${ms.toFixed(4)}) translate(-640px,-400px)`}}>
          <PathMap
            lineP={1}
            circ={[
              {s: 1, op: 1, lit: true},
              {s: 1, op: 0.8, lit: false},
              {s: 1, op: 0.8, lit: false},
            ]}
            envX={(i) => pathEnvX(N, i, 2691)}
            envOp={envOp}
          />
        </div>

        {/* 双向信封道（穿过机身后面：先画，机身后画盖住） */}
        {[0, 1, 2].map((i) => {
          const e = laneEnv(i, 1);
          return e && e.op > 0.02 ? <PacketIcon key={`r${i}`} cx={e.x} cy={332} w={56} h={38} opacity={e.op * 0.95} /> : null;
        })}
        {[0, 1, 2].map((i) => {
          const e = laneEnv(i, -1);
          return e && e.op > 0.02 ? <PacketIcon key={`l${i}`} cx={e.x} cy={428} w={56} h={38} opacity={e.op * 0.95} /> : null;
        })}

        {/* 笔记本（主角，HeroGlow） */}
        <div style={{position: 'absolute', inset: 0, transform: landP === 1 ? undefined : `scale(${landP.toFixed(4)})`, transformOrigin: '50% 50%'}}>
          <LaptopIcon cx={lcx} cy={lcy} w={lw} os={N >= T_OS} osOp={osOp} glow />
          {/* OS 小方块内容（OS + seeing 指示灯；块几何 = LaptopIcon 0.34w×0.36w @ (cx-0.17w, cy-0.24w)） */}
          {N >= T_OS ? (
            <div style={{...abs(lcx - lw * 0.17, lcy - lw * 0.24, lw * 0.34, lw * 0.36), opacity: osOp}}>
              <CText cx={(lw * 0.34) / 2} cy={lw * 0.105} size={30} weight={700} family={FONT_ORB} color={WHITE} letterSpacing={1}>
                OS
              </CText>
              <div style={{...abs((lw * 0.34) / 2 - 42, lw * 0.255, 10, 10), borderRadius: 5, background: indA > 0 ? `rgba(161,117,241,${(0.4 + 0.6 * indA).toFixed(3)})` : '#4A4A4A', boxShadow: indK > 0.05 ? `0 0 10px rgba(161,117,241,${(0.8 * indK).toFixed(2)})` : undefined}} />
              <CText cx={(lw * 0.34) / 2 + 12} cy={lw * 0.262} size={22} weight={600} color={GREY_LIGHT} letterSpacing={1}>
                seeing
              </CText>
            </div>
          ) : null}
        </div>

        {/* 屏上方小字 */}
        <SoftIn N={N} f0={T_LABEL}>
          <CText cx={640} cy={244} size={24} weight={600} color={GREY} letterSpacing={1}>
            your own traffic
          </CText>
        </SoftIn>

        {/* 右侧：绿 Check + the easy one */}
        {ckP > 0 ? <Check cx={905} cy={266} size={54} p={ckP} sw={7} /> : null}
        <SoftIn N={N} f0={T_CHECK + 4}>
          <Pill x={800} y={296} w={210} h={40} sw={2} text="the easy one" fontSize={24} weight={700} />
        </SoftIn>

        {/* 左上角 ① 站位角标 */}
        <SoftIn N={N} f0={T_BADGE}>
          <StationCircle cx={108} cy={158} r={30} lit digit="1" digitSize={40} />
        </SoftIn>
      </div>
    </div>
  );
};

const PATH_LX = 160; // SC13 左端节点 x
