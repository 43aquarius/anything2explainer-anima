/**
 * 片子级配置（EP6 · NTP — Why Every Clock Agrees）。
 * 句 id（S01…）来自 scripts/tts_build.py 生成的 timeline.ts；章节数与标题来自 narration.txt 的 `# CHAPTER n 标题` 行。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'ntpwide', // 素材目录 public/assets/<slug>/（配音 audio.wav 由 tts_build.py 写到这里）
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'NTP', rest: '', en: 'Why Every Clock Agrees', tagline: 'Time isn\u2019t kept. It\u2019s agreed.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: 'built with Anything2Explainer',
  chapterTech: ['', 'drift \u00b7 quartz \u00b7 why it matters', 'atomic \u00b7 GPS \u00b7 stratum 1\u201315', 'intersection \u00b7 slew', 'the pool \u00b7 1985 \u00b7 27 leap seconds'],
  hud: [
    {fromS: 'S01', toS: 'S01', text: 'Wrong right now'},
    {fromS: 'S02', toS: 'S03', text: 'Quartz drifts'},
    {fromS: 'S04', toS: 'S04', text: 'Wristwatch vs internet'},
    {fromS: 'S05', toS: 'S05', text: '30-second codes'},
    {fromS: 'S06', toS: 'S06', text: 'Certificate windows'},
    {fromS: 'S07', toS: 'S08', text: 'Order breaks'},
    {fromS: 'S09', toS: 'S09', text: 'Who has the time'},
    {fromS: 'S10', toS: 'S10', text: 'Atomic clocks'},
    {fromS: 'S11', toS: 'S11', text: 'GPS whispers'},
    {fromS: 'S12', toS: 'S13', text: 'Ask a server'},
    {fromS: 'S14', toS: 'S16', text: 'Stratum 1\u201315'},
    {fromS: 'S17', toS: 'S17', text: 'Answers arrive late'},
    {fromS: 'S18', toS: 'S19', text: 'Four answers'},
    {fromS: 'S20', toS: 'S21', text: 'Trust the crowd'},
    {fromS: 'S22', toS: 'S24', text: 'Slew, don\u2019t jump'},
    {fromS: 'S25', toS: 'S26', text: 'Volunteers'},
    {fromS: 'S27', toS: 'S28', text: 'Since 1985'},
    {fromS: 'S29', toS: 'S30', text: 'No perfect clock'},
    {fromS: 'S31', toS: 'S32', text: 'The answer'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 2, // 终镜金句拉满停留（TLS/CDN/BGP 同款模式）
};
