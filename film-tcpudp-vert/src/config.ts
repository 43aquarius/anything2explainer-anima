/**
 * TCP & UDP 竖版（TikTok 720×1280）配置。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'tcpudpvert',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'TCP / UDP', rest: '', en: 'Two Ways to Travel', tagline: 'Never lose. Never wait.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: '', // 与交付修订保持一致：移除片尾 built-with 画面
  chapterTech: [] as string[],
  hud: [
    {fromS: 'S01', toS: 'S01', text: 'Two rules'},
    {fromS: 'S02', toS: 'S03', text: 'Packets & IP'},
    {fromS: 'S04', toS: 'S04', text: 'IP: nothing'},
    {fromS: 'S05', toS: 'S05', text: 'TCP: the courier'},
    {fromS: 'S06', toS: 'S06', text: 'The handshake'},
    {fromS: 'S07', toS: 'S08', text: 'Numbers & retries'},
    {fromS: 'S09', toS: 'S09', text: 'UDP: the postcard'},
    {fromS: 'S10', toS: 'S10', text: '8 bytes'},
    {fromS: 'S11', toS: 'S11', text: 'Late = dead'},
    {fromS: 'S12', toS: 'S13', text: 'The QUIC twist'},
    {fromS: 'S14', toS: 'S15', text: 'Two promises'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6,
};
