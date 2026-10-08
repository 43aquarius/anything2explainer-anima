/**
 * 片子级配置（唯一需要按主题改的文件之一；另一个是 script/narration.txt）。
 * 《APK — The Zip That Becomes an App》横版（YouTube 1280×720）。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'apkwide', // 素材目录 public/assets/<slug>/（配音 audio.wav 由 tts_build.py 写到这里）
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'APK', rest: '', en: 'The Zip That Becomes an App', tagline: 'Every app is a zip.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: '', // 与 PCAP 片交付修订保持一致：移除片尾 built-with 画面
  chapterTech: ['', 'rename .apk → .zip · what is inside', '1989 · PK · index · alignment', 'v2 seal · dex2oat · sandbox', 'AAB · split APKs · still zips'],
  hud: [
    {fromS: 'S01', toS: 'S01', text: 'The download'},
    {fromS: 'S02', toS: 'S03', text: 'The rename'},
    {fromS: 'S04', toS: 'S05', text: 'Inside the box'},
    {fromS: 'S06', toS: 'S08', text: 'One archive'},
    {fromS: 'S09', toS: 'S10', text: 'The question'},
    {fromS: 'S11', toS: 'S12', text: 'Phil Katz, 1989'},
    {fromS: 'S13', toS: 'S15', text: 'P, K'},
    {fromS: 'S16', toS: 'S17', text: 'The index'},
    {fromS: 'S18', toS: 'S19', text: 'Random access'},
    {fromS: 'S20', toS: 'S21', text: 'Tooling + Java'},
    {fromS: 'S22', toS: 'S25', text: 'The alignment twist'},
    {fromS: 'S26', toS: 'S28', text: "A stranger's zip"},
    {fromS: 'S29', toS: 'S30', text: 'v1: receipts'},
    {fromS: 'S31', toS: 'S34', text: 'v2: the wax seal'},
    {fromS: 'S35', toS: 'S36', text: 'The key is the ID'},
    {fromS: 'S37', toS: 'S38', text: 'Reading the label'},
    {fromS: 'S39', toS: 'S39', text: '/data/app'},
    {fromS: 'S40', toS: 'S44', text: 'dex2oat'},
    {fromS: 'S45', toS: 'S48', text: 'Sandbox + the twist'},
    {fromS: 'S49', toS: 'S54', text: 'App Bundle, 2018'},
    {fromS: 'S55', toS: 'S56', text: 'Google HQ'},
    {fromS: 'S57', toS: 'S58', text: 'Two bytes'},
    {fromS: 'S59', toS: 'S59', text: 'The read'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6, // 末句 S59 末块 52 帧：(S59.to−6)−块首 8848 = 45 ≥ 30 ✓（见分镜表末镜）
};
