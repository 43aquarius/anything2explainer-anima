/**
 * PCAP 竖版（TikTok 720×1280）配置。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'dnsvert',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'DNS', rest: '', en: 'The Internet\u2019s Phonebook', tagline: 'A name is a question. DNS is the answer.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: 'built with Anything2Explainer',
  chapterTech: [] as string[],
  hud: [
    {fromS: 'S01', toS: 'S02', text: 'The half-second'},
    {fromS: 'S03', toS: 'S05', text: 'Names vs numbers'},
    {fromS: 'S06', toS: 'S08', text: 'One file to DNS'},
    {fromS: 'S09', toS: 'S11', text: 'The lookup'},
    {fromS: 'S12', toS: 'S13', text: 'Under a tenth'},
    {fromS: 'S13', toS: 'S13', text: 'Sticky notes'},
    {fromS: 'S14', toS: 'S14', text: '1.9 trillion'},
    {fromS: 'S15', toS: 'S15', text: 'The answer'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6,
};
