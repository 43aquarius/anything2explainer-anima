/**
 * APK 竖版（TikTok 720×1280）配置。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'apkvert',
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'APK', rest: '', en: 'The Zip That Becomes an App', tagline: 'Every app is a zip.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: '', // 与交付修订保持一致：移除片尾 built-with 画面
  chapterTech: [] as string[],
  hud: [
    {fromS: 'S01', toS: 'S02', text: 'The rename'},
    {fromS: 'S03', toS: 'S04', text: '1989 · P, K'},
    {fromS: 'S05', toS: 'S06', text: 'The wax seal'},
    {fromS: 'S07', toS: 'S07', text: 'The label'},
    {fromS: 'S08', toS: 'S09', text: 'Compile'},
    {fromS: 'S10', toS: 'S10', text: 'The sandbox'},
    {fromS: 'S11', toS: 'S12', text: 'Never unzipped'},
    {fromS: 'S13', toS: 'S14', text: 'Still zips'},
    {fromS: 'S15', toS: 'S15', text: 'The read'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6, // 末句 S15 末块 51 帧：(S15.to−6)−块首 2098 = 44 ≥ 30 ✓
};
