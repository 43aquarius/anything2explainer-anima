/**
 * 片子级配置（EP7 · WiFi — The Conversation in the Air）。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'wifiwide',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'WiFi', rest: '', en: 'The Conversation in the Air', tagline: 'One sky. One voice at a time.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: 'built with Anything2Explainer',
  chapterTech: ['', 'half-duplex \u00b7 one talker', 'listen first \u00b7 random pause', 'channels 1/6/11 \u00b7 hidden nodes', '1997 \u00b7 taking turns'],
  hud: [
    {fromS: 'S01', toS: 'S02', text: 'Invisible air'},
    {fromS: 'S03', toS: 'S03', text: 'Half-duplex'},
    {fromS: 'S04', toS: 'S05', text: 'One talker'},
    {fromS: 'S06', toS: 'S07', text: 'Listen first'},
    {fromS: 'S08', toS: 'S10', text: 'Random pause'},
    {fromS: 'S11', toS: 'S12', text: 'Good manners'},
    {fromS: 'S13', toS: 'S13', text: 'Crowded air'},
    {fromS: 'S14', toS: 'S14', text: 'Channels 1/6/11'},
    {fromS: 'S15', toS: 'S16', text: 'Shared airwaves'},
    {fromS: 'S17', toS: 'S18', text: 'Hidden nodes'},
    {fromS: 'S19', toS: 'S20', text: 'Announce first'},
    {fromS: 'S21', toS: 'S22', text: 'Since 1997'},
    {fromS: 'S23', toS: 'S24', text: 'The engineering'},
    {fromS: 'S25', toS: 'S25', text: 'Taking turns'},
    {fromS: 'S26', toS: 'S27', text: 'The answer'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 2,
};
