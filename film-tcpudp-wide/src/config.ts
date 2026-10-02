/**
 * 片子级配置（唯一需要按主题改的文件之一；另一个是 script/narration.txt）。
 * 《TCP & UDP — Two Ways to Travel》横版（YouTube 1280×720）。
 */
export type HudEntry = {fromS: string; toS: string; text: string; tech?: string; fromOffset?: number; toOffset?: number; w?: number};
export type RailSpec = {steps: string[]; switchS: string[]; fromS: string; toS: string};
export const VIDEO = {
  slug: 'tcpudpwide', // 素材目录 public/assets/<slug>/（配音 audio.wav 由 tts_build.py 写到这里）
  lang: 'en' as 'zh' | 'en',
  bg: 'dots' as 'stars' | 'dots',
  title: {big: 'TCP / UDP', rest: '', en: 'Two Ways to Travel', tagline: 'Never lose. Never wait.'},
  credit: null as {kicker: string; title: string; byline: string; note: string} | null,
  builtBy: '', // 与 PCAP 片交付修订保持一致：移除片尾 built-with 画面
  chapterTech: ['', 'RFC 793 \u00b7 handshake \u00b7 sequence numbers', 'RFC 768 \u00b7 8 bytes \u00b7 no ceremony', 'ports \u00b7 QUIC \u00b7 HTTP/3'],
  hud: [
    {fromS: 'S01', toS: 'S02', text: 'The setup'},
    {fromS: 'S04', toS: 'S06', text: 'Packets'},
    {fromS: 'S07', toS: 'S08', text: 'IP: best effort'},
    {fromS: 'S09', toS: 'S09', text: 'Almost nothing'},
    {fromS: 'S10', toS: 'S11', text: 'The design'},
    {fromS: 'S12', toS: 'S14', text: 'What goes wrong'},
    {fromS: 'S15', toS: 'S17', text: 'Two promises'},
    {fromS: 'S18', toS: 'S18', text: 'Origins: 1974'},
    {fromS: 'S19', toS: 'S23', text: 'The handshake'},
    {fromS: 'S24', toS: 'S26', text: 'Numbers & receipts'},
    {fromS: 'S27', toS: 'S27', text: 'In order'},
    {fromS: 'S28', toS: 'S28', text: 'The window'},
    {fromS: 'S29', toS: 'S30', text: 'Congestion control'},
    {fromS: 'S31', toS: 'S32', text: 'The contract'},
    {fromS: 'S33', toS: 'S35', text: 'The price'},
    {fromS: 'S36', toS: 'S37', text: 'The postcard'},
    {fromS: 'S38', toS: 'S39', text: 'The ceremony'},
    {fromS: 'S40', toS: 'S42', text: 'The honest spec'},
    {fromS: 'S43', toS: 'S45', text: 'DNS'},
    {fromS: 'S46', toS: 'S50', text: 'Late means dead'},
    {fromS: 'S51', toS: 'S51', text: 'Games'},
    {fromS: 'S52', toS: 'S53', text: 'Honest, not careless'},
    {fromS: 'S54', toS: 'S56', text: 'The rule of thumb'},
    {fromS: 'S57', toS: 'S59', text: 'Ports'},
    {fromS: 'S60', toS: 'S62', text: 'The QUIC twist'},
    {fromS: 'S63', toS: 'S64', text: 'Rebuilt above the wire'},
    {fromS: 'S65', toS: 'S66', text: 'Where reliability lives'},
    {fromS: 'S67', toS: 'S70', text: 'Same wire, two promises'},
    {fromS: 'S71', toS: 'S72', text: 'Never lose. Never wait.'},
  ] as HudEntry[],
  rails: [] as RailSpec[],
  endingFade: 6, // 末句 S72 末块 41 帧：压黑从 S72.to−6 起，末行大字可读窗口 ≥30 帧（见分镜表 SC37）
};
