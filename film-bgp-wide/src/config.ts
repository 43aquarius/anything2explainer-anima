/**
 * 片子级配置（EP5 · BGP — The Internet's Diplomats）。
 * 句 id（S01…）来自 scripts/tts_build.py 生成的 timeline.ts；章节数与标题来自 narration.txt 的 `# CHAPTER n 标题` 行。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'bgpwide', // 素材目录 public/assets/<slug>/（配音 audio.wav 由 tts_build.py 写到这里）
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'BGP', rest: '', en: 'The Internet\u2019s Diplomats', tagline: 'The internet has no map.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: 'built with Anything2Explainer',
  chapterTech: ['', 'AS \u00b7 ASN \u00b7 announcements', '1997 \u00b7 2008 \u00b7 longest match', 'RPKI \u00b7 signed routes'],
  hud: [
    {fromS: 'S01', toS: 'S02', text: 'October 2021'},
    {fromS: 'S03', toS: 'S03', text: 'Not a hack'},
    {fromS: 'S04', toS: 'S05', text: 'No map'},
    {fromS: 'S06', toS: 'S07', text: 'A hundred thousand'},
    {fromS: 'S08', toS: 'S08', text: 'Diplomats'},
    {fromS: 'S09', toS: 'S10', text: 'BGP'},
    {fromS: 'S11', toS: 'S11', text: 'A chain of strangers'},
    {fromS: 'S12', toS: 'S13', text: 'The map draws itself'},
    {fromS: 'S14', toS: 'S14', text: 'A spoken map'},
    {fromS: 'S15', toS: 'S16', text: '1997'},
    {fromS: 'S17', toS: 'S18', text: '2008'},
    {fromS: 'S19', toS: 'S20', text: 'No locks'},
    {fromS: 'S21', toS: 'S22', text: 'The withdrawal'},
    {fromS: 'S23', toS: 'S23', text: 'Six hours'},
    {fromS: 'S24', toS: 'S25', text: 'RPKI'},
    {fromS: 'S26', toS: 'S27', text: 'Proof'},
    {fromS: 'S28', toS: 'S29', text: 'Still talking'},
    {fromS: 'S30', toS: 'S31', text: 'The answer'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 2, // 终镜金句拉满停留（CDN/TLS 同款模式）
};
