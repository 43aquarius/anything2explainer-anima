/**
 * PCAP 竖版（TikTok 720×1280）配置。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'pcapvert',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'PCAP', rest: '', en: 'Packet Capture', tagline: 'The wire doesn\u2019t lie.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: '', // 交付修订：移除片尾 built-with-Anything2Explainer 画面
  chapterTech: [] as string[],
  hud: [
    {fromS: 'S01', toS: 'S03', text: 'The mystery'},
    {fromS: 'S04', toS: 'S05', text: 'Packets'},
    {fromS: 'S06', toS: 'S07', text: 'Where & how'},
    {fromS: 'S08', toS: 'S10', text: 'The reveal'},
    {fromS: 'S11', toS: 'S12', text: 'The limits'},
    {fromS: 'S13', toS: 'S15', text: 'The close'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6,
};
