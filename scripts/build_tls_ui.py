#!/usr/bin/env python3
"""组装 TLS 片 ui.tsx：DNS 版共享核心 + Postcard/StampSeal/EyeGlyph/BrowserWin + TLS 新图元"""
import re, pathlib

SRC = pathlib.Path('/home/z/my-project/film-dns-wide/src/ui.tsx').read_text(encoding='utf-8')
DST = pathlib.Path('/home/z/my-project/film-tls-wide/src/ui.tsx')

# 1) 截取共享核心（去掉 "DNS 片专用图元" 段：从其标题行起全部不要）
m = re.search(r'// ===================== DNS 片专用图元', SRC)
core = SRC[:m.start()]

# 2) 从 DNS 专用段提取要保留的组件（按空行分块，取包含目标导出的块：注释+组件体）
dns_sec = SRC[m.start():]
blocks = dns_sec.split('\n\n')
wanted = ['PostcardIcon', 'StampSeal', 'EyeGlyph', 'BrowserWin']
keep_blocks = [b for b in blocks if re.search(r'export const (%s)\b' % '|'.join(wanted), b)]
assert len(keep_blocks) == 4, [b[:60] for b in keep_blocks]
keep = '\n\n'.join(keep_blocks) + '\n'

# 3) TLS EXAMPLE（替换 core 里的 DNS EXAMPLE 块）
tls_example = '''/** 贯穿示例语境常量（全片唯一一套，各组不得自造） */
export const EXAMPLE = {
  /** TLS 片贯穿示例（The Invisible Internet EP3） */
  domain: 'shop.example',
  url: 'https://shop.example/checkout',
  httpUrl: 'http://shop.example/login',
  pw: 'cafe2026',               // 示意密码（明文展示用，交付说明标"示意"）
  yearDH: '1976', yearSSL: '1994', yearSheep: '2010', yearLE: '2015', year13: '2018',
  suites: '5', suitesOld: '31',
  caCount: '\\u2248120',
  share: '4 in 5',
  pqShare: '\\u224870%',
  cipher: 'AES-128-GCM',
  curve: 'X25519',
  rfc: 'RFC 8446',
  /** 邻桌明文抓包行（SC01–SC03 用，示意） */
  capRows: [
    {t: '0.000', src: 'you', dst: 'shop.example', info: 'GET /login'},
    {t: '0.041', src: 'you', dst: 'shop.example', info: 'POST /login user=you pw=cafe2026'},
    {t: '0.103', src: 'you', dst: 'shop.example', info: 'GET /cart'},
    {t: '0.155', src: 'you', dst: 'shop.example', info: 'GET /checkout'},
  ],
  /** 密文行（SC12/SC27 用，示意） */
  cipherRow: '8f3a 9c2e 41db 07e5 ...',
};
'''
core = re.sub(r'/\*\* 贯穿示例语境常量.*?\n\};\n', lambda _: tls_example, core, flags=re.S)

# 4) TLS 新图元段
tls_new = '''
// ===================== TLS 片专用图元（跨组共用；风格：白描边 2–3px + 黑填充 + BLOOM_SOFT）=====================

/** 保留的 DNS 段图元：PostcardIcon / StampSeal / EyeGlyph / BrowserWin（HTTP=明信片、CA 邮戳、窥视之眼、浏览器） */

/** 山羊座 Firesheep（2010 劫持插件）：蓬身 + 头 + 腿 + 耳；白描边黑填充 */
export const SheepIcon: React.FC<{cx: number; cy: number; w?: number; h?: number; color?: string; opacity?: number; glow?: boolean; dim?: boolean}> = ({cx, cy, w = 200, h = 150, color = WHITE, opacity = 1, glow = false, dim = false}) => (
  <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity, filter: (glow ? BLOOM : 'none') + (dim ? ' saturate(0.4)' : '')}}>
    <svg width={w} height={h} viewBox="0 0 200 150" style={{position: 'absolute', inset: 0}}>
      <g stroke={color} strokeWidth={3} fill="#000" strokeLinejoin="round" strokeLinecap="round">
        {/* 蓬蓬身 */}
        <path d="M52 96 Q30 92 32 72 Q34 54 58 52 Q66 30 96 32 Q124 34 132 54 Q156 56 158 76 Q160 94 138 98 L138 116 L124 116 L124 104 Q108 108 92 104 L92 116 L78 116 L78 100 Q66 102 52 96 Z" />
        {/* 头 */}
        <path d="M132 54 Q156 44 164 60 Q170 72 158 78 L146 76" fill="#000" />
        {/* 耳 */}
        <path d="M150 56 L164 46" strokeWidth={2.5} />
        {/* 眼 */}
        <circle cx={148} cy={62} r={3} fill={color} stroke="none" />
        {/* 尾 */}
        <path d="M34 74 Q22 70 24 82" strokeWidth={2.5} fill="none" />
      </g>
    </svg>
  </div>
);

/** 挂锁（全片核心象征物 "The Little Lock"）：锁体 + 锁梁；openK 0→1 时锁梁弹开（锁定感/解锁感动画） */
export const LockSeal: React.FC<{cx: number; cy: number; w?: number; h?: number; color?: string; openK?: number; opacity?: number; glow?: boolean; label?: string; labelSize?: number; tilt?: number}> = ({cx, cy, w = 120, h = 150, color = WHITE, openK = 0, opacity = 1, glow = false, label, labelSize = 22, tilt = 0}) => (
  <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity, transform: `rotate(${tilt}deg)`, filter: glow ? BLOOM : 'none'}}>
    <svg width={w} height={h} viewBox="0 0 120 150" style={{position: 'absolute', inset: 0}}>
      <g stroke={color} strokeWidth={3.5} fill="#000" strokeLinejoin="round">
        {/* 锁梁：openK 0=扣合 1=弹开（右端抬起） */}
        <path d={`M34 62 L34 44 Q34 20 60 20 Q86 20 86 ${44 - 14 * Math.min(1, Math.max(0, openK))} L86 ${62 - 18 * Math.min(1, Math.max(0, openK))}`} fill="none" strokeLinecap="round" />
        {/* 锁体 */}
        <rect x={20} y={60} width={80} height={72} rx={10} fill="#000" />
        {/* 锁孔 */}
        <circle cx={60} cy={88} r={7} fill={color} stroke="none" />
        <rect x={55} y={92} width={10} height={22} rx={3} fill={color} stroke="none" />
      </g>
    </svg>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: h + 10, textAlign: 'center', fontFamily: FONT_TECH, fontSize: labelSize, color}}>{label}</div>}
  </div>
);

/** 颜料桶（Diffie-Hellman 颜料混合演示）：梯形桶 + 提梁 + 可动画液位/颜色；fillK 0→1 灌入 */
export const PaintPot: React.FC<{cx: number; cy: number; w?: number; h?: number; fill?: string; fillK?: number; color?: string; opacity?: number; label?: string; labelSize?: number}> = ({cx, cy, w = 170, h = 140, fill = '#F2C94C', fillK = 1, color = WHITE, opacity = 1, label, labelSize = 22}) => {
  const k = Math.min(1, Math.max(0, fillK));
  const fh = (h - 26) * k;
  const cid = `potclip_${Math.round(cx)}_${Math.round(cy)}`;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity}}>
      <svg width={w} height={h} viewBox="0 0 170 140" style={{position: 'absolute', inset: 0}}>
        {/* 提梁 */}
        <path d="M35 30 Q85 -6 135 30" stroke={color} strokeWidth={2.5} fill="none" />
        <g stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round">
          {/* 桶身（上宽下窄） */}
          <path d="M18 30 L28 128 L142 128 L152 30 Z" fill="#000" />
        </g>
        {/* 液体（clip 到桶内） */}
        <clipPath id={cid}>
          <path d="M18 30 L28 128 L142 128 L152 30 Z" />
        </clipPath>
        <g clipPath={`url(#${cid})`}>
          <rect x={14} y={128 - fh} width={142} height={fh + 4} fill={fill} opacity={0.92} />
          <rect x={14} y={128 - fh} width={142} height={2.5} fill="#fff" opacity={0.35} />
        </g>
      </svg>
      {label && <div style={{position: 'absolute', left: 0, right: 0, top: h + 8, textAlign: 'center', fontFamily: FONT_TECH, fontSize: labelSize, color}}>{label}</div>}
    </div>
  );
};

/** 证书卡：卡头域名 + 密钥摘要线 + CA 圆形邮戳角（stamped 0→1 邮戳盖下） */
export const CertCard: React.FC<{x: number; y: number; w?: number; h?: number; domain?: string; ca?: string; stamped?: number; opacity?: number; accent?: boolean}> = ({x, y, w = 330, h = 230, domain = 'shop.example', ca = 'CA', stamped = 1, opacity = 1, accent = false}) => {
  const st = Math.min(1, Math.max(0, stamped));
  return (
    <div style={{...abs(x, y, w, h), opacity}}>
      <div style={{position: 'absolute', inset: 0, background: '#000', border: `2.5px solid ${accent ? PURPLE_LIGHT : WHITE}`, borderRadius: 8}} />
      {/* 卡头 */}
      <div style={{position: 'absolute', left: 18, top: 14, fontFamily: FONT_HEAVY, fontSize: 27, color: WHITE}}>{domain}</div>
      <div style={{position: 'absolute', left: 18, top: 50, fontFamily: FONT_TECH, fontSize: 19, color: GREY}}>certificate</div>
      {/* 摘要线 */}
      {[0, 1, 2].map(i => <div key={i} style={{position: 'absolute', left: 18, top: 84 + i * 26, width: w - 36 - (i === 2 ? 60 : 0), height: 0, borderTop: `1.5px dashed ${GREY_LINE}`}} />)}
      {/* 公钥小块 */}
      <div style={{position: 'absolute', left: 18, top: 160, width: 150, height: 44, border: `1.5px solid ${GREY_LINE}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 16, color: GREY_LIGHT}}>public key</div>
      {/* CA 邮戳 */}
      <div style={{position: 'absolute', right: 14, top: h - 96, width: 78, height: 78, borderRadius: '50%', border: `2.5px solid ${st > 0.1 ? PURPLE_LIGHT : GREY_LINE}`, transform: `rotate(-14deg) scale(${1.35 - 0.35 * st})`, opacity: 0.35 + 0.65 * st, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_ORB, fontSize: 22, color: st > 0.1 ? PURPLE_LIGHT : GREY_MID, boxShadow: st > 0.5 ? '0 0 18px rgba(102,45,248,.35)' : 'none'}}>{ca}</div>
    </div>
  );
};

/** 钥匙（私钥/会话密钥）：圆环头 + 杆 + 齿；broken 0→1 折断（前向保密的销毁感） */
export const KeyIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; broken?: number; opacity?: number; glow?: boolean; tilt?: number}> = ({cx, cy, size = 150, color = WHITE, broken = 0, opacity = 1, glow = false, tilt = 0}) => {
  const bk = Math.min(1, Math.max(0, broken));
  const gap = 10 * bk;
  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity, transform: `rotate(${tilt + 8 * bk}deg)`, filter: glow ? BLOOM : 'none'}}>
      <svg width={size} height={size} viewBox="0 0 150 150" style={{position: 'absolute', inset: 0}}>
        <g stroke={color} strokeWidth={3.5} fill="#000" strokeLinejoin="round" strokeLinecap="round">
          {/* 环头 */}
          <circle cx={38} cy={75} r={22} />
          {/* 杆 */}
          <path d={`M60 75 L128 75 L128 ${75 + gap} L124 ${75 + gap} L124 75`} fill="none" />
          {/* 齿 */}
          <path d={`M112 75 L112 90 M124 75 L124 96`} fill="none" />
        </g>
      </svg>
    </div>
  );
};

/** 原子（后量子 ML-KEM 象征）：核 + 3 条椭圆轨道；spin 为轨道旋转角 */
export const AtomIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; spin?: number; opacity?: number; glow?: boolean; label?: string; labelSize?: number}> = ({cx, cy, size = 160, color = WHITE, spin = 0, opacity = 1, glow = false, label, labelSize = 22}) => (
  <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity, filter: glow ? BLOOM : 'none'}}>
    <svg width={size} height={size} viewBox="0 0 160 160" style={{position: 'absolute', inset: 0, transform: `rotate(${spin}deg)`}}>
      <g stroke={color} strokeWidth={2.5} fill="none">
        <ellipse cx={80} cy={80} rx={72} ry={30} />
        <ellipse cx={80} cy={80} rx={72} ry={30} transform="rotate(60 80 80)" />
        <ellipse cx={80} cy={80} rx={72} ry={30} transform="rotate(120 80 80)" />
        <circle cx={80} cy={80} r={9} fill={color} stroke="none" />
        <circle cx={146} cy={80} r={4.5} fill={PURPLE_LIGHT} stroke="none" />
        <circle cx={44} cy={117} r={4.5} fill={PURPLE_LIGHT} stroke="none" />
      </g>
    </svg>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: size + 6, textAlign: 'center', fontFamily: FONT_TECH, fontSize: labelSize, color}}>{label}</div>}
  </div>
);

/** 密文噪声场：seeded 随机小块阵列按帧闪烁（"letters have become noise" 的主角）；密度/亮度随 N 变化 */
export const NoiseField: React.FC<{x: number; y: number; w: number; h: number; N?: number; cols?: number; rows?: number; seed?: number; opacity?: number; hot?: boolean}> = ({x, y, w, h, N = 0, cols = 18, rows = 9, seed = 7, opacity = 1, hot = false}) => {
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ph = ((seed * 131 + r * 37 + c * 17 + Math.floor(N / 3) * 29) % 97) / 97;
      const on = ph > 0.42;
      const s = 4 + ((seed * 13 + r * 7 + c * 3) % 5);
      cells.push(<div key={`${r}-${c}`} style={{position: 'absolute', left: (c + 0.5) * (w / cols) - s / 2, top: (r + 0.5) * (h / rows) - s / 2, width: s, height: s, background: WHITE, opacity: on ? 0.25 + 0.65 * ((ph * 7) % 1) : 0.06}} />);
    }
  }
  return <div style={{...abs(x, y, w, h), opacity, outline: hot ? `1.5px solid ${PURPLE_LIGHT}` : 'none', borderRadius: 4, overflow: 'hidden', boxShadow: hot ? '0 0 24px 8px rgba(102,45,248,.45)' : 'none'}}>{cells}</div>;
};
'''

out = core + tls_new + '\n' + keep + '\n'
DST.write_text(out, encoding='utf-8')
print('written', DST, len(out.splitlines()), 'lines')
