// 自动生成：scripts/tts_build.py。帧号 1 起含端点。
export const TOTAL_FRAMES = 2249;
export const CHAPTER_STARTS: Array<{n: number; title: string; from: number}> = [
  {n: 1, title: "One Tap", from: 86},
];
export type Sentence = {id: string; chapter: number; from: number; to: number; text: string};
export const SENTENCES: Sentence[] = [
  {id: "S01", chapter: 1, from: 86, to: 182, text: "Rename any APK to ZIP — it just opens."},
  {id: "S02", chapter: 1, from: 193, to: 307, text: "The manifest, the code, the signatures: it's all right there."},
  {id: "S03", chapter: 1, from: 318, to: 390, text: "Every Android app ships as a ZIP archive."},
  {id: "S04", chapter: 1, from: 433, to: 750, text: "The format comes from 1989. A programmer named Phil Katz invented it after getting sued, and his initials, P, K, are still the first two bytes of the file."},
  {id: "S05", chapter: 1, from: 796, to: 951, text: "When you hit Install, the phone checks the wax seal: one signature over the entire file."},
  {id: "S06", chapter: 1, from: 962, to: 1023, text: "Flip one byte, the install dies."},
  {id: "S07", chapter: 1, from: 1069, to: 1221, text: "It reads the label: a binary manifest, permissions, screens, version."},
  {id: "S08", chapter: 1, from: 1252, to: 1362, text: "Then it compiles the code into machine language for your exact CPU."},
  {id: "S09", chapter: 1, from: 1373, to: 1483, text: "That is the \"optimizing apps\" bar you see after a big update."},
  {id: "S10", chapter: 1, from: 1514, to: 1608, text: "And builds a sandbox: one hidden Linux user per app."},
  {id: "S11", chapter: 1, from: 1654, to: 1716, text: "The zip itself? Never unzipped."},
  {id: "S12", chapter: 1, from: 1727, to: 1839, text: "It just sits in /data/app, being read in pieces."},
  {id: "S13", chapter: 1, from: 1885, to: 1995, text: "Google's app bundles from 2021? Still zips underneath."},
  {id: "S14", chapter: 1, from: 2006, to: 2052, text: "Two bytes in: P, K."},
  {id: "S15", chapter: 1, from: 2098, to: 2148, text: "Every app is a zip you can read."},
];
