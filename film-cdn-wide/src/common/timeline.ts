// 自动生成：scripts/tts_build.py。帧号 1 起含端点。
export const TOTAL_FRAMES = 4465;
export const CHAPTER_STARTS: Array<{n: number; title: string; from: number}> = [
  {n: 1, title: "The Distance Problem", from: 86},
  {n: 2, title: "The Edge Network", from: 894},
  {n: 3, title: "The Cache Hit", from: 1958},
  {n: 4, title: "The Invisible Half", from: 2732},
];
export type Sentence = {id: string; chapter: number; from: number; to: number; text: string};
export const SENTENCES: Sentence[] = [
  {id: "S01", chapter: 1, from: 86, to: 208, text: "Friday night, eight o'clock. You press play on a two-gigabyte movie."},
  {id: "S02", chapter: 1, from: 219, to: 354, text: "The origin server sits on another continent — eight thousand kilometers away."},
  {id: "S03", chapter: 1, from: 365, to: 507, text: "Light itself needs real time to cross that. Fiber carries it at two-thirds of c."},
  {id: "S04", chapter: 1, from: 518, to: 666, text: "Even on a perfect 100-megabit line, two gigabytes would take about three minutes."},
  {id: "S05", chapter: 1, from: 677, to: 730, text: "Yet your movie starts in one second."},
  {id: "S06", chapter: 1, from: 741, to: 838, text: "The data didn't come that far. It was already waiting in your city."},
  {id: "S07", chapter: 2, from: 914, to: 993, text: "Bandwidth can be bought. The speed of light cannot."},
  {id: "S08", chapter: 2, from: 1004, to: 1093, text: "The fix is not a faster network — it's a shorter one."},
  {id: "S09", chapter: 2, from: 1104, to: 1274, text: "A CDN puts copies of the content in hundreds of cities — points of presence, edge nodes."},
  {id: "S10", chapter: 2, from: 1285, to: 1416, text: "When you press play, you're not talking to the origin. You're talking to the nearest shelf."},
  {id: "S11", chapter: 2, from: 1427, to: 1666, text: "The trick that routes you there is called anycast: one address, announced from everywhere. The network itself picks the closest copy."},
  {id: "S12", chapter: 2, from: 1692, to: 1902, text: "And the first question of your request is answered by DNS — the name you type points to the edge, not to the origin."},
  {id: "S13", chapter: 3, from: 1958, to: 2122, text: "Most requests never reach the origin at all. The edge answers from its cache — a cache hit."},
  {id: "S14", chapter: 3, from: 2133, to: 2393, text: "The content lives there until its TTL expires; then the edge pulls one fresh copy from the origin — a cache miss — and the timer starts again."},
  {id: "S15", chapter: 3, from: 2404, to: 2676, text: "This is why most of what you stream never crosses an ocean. Video is more than half of all traffic now, and nearly all of it is served from someone's edge."},
  {id: "S16", chapter: 4, from: 2747, to: 2803, text: "The idea predates the web boom."},
  {id: "S17", chapter: 4, from: 2814, to: 3023, text: "In the nineties at MIT, a hard question circulated: if the whole world hits one server, that server will melt."},
  {id: "S18", chapter: 4, from: 3034, to: 3290, text: "Akamai, spun out of MIT in 1998, became the answer — today its platform carries a meaningful share of the internet's traffic."},
  {id: "S19", chapter: 4, from: 3301, to: 3474, text: "Others followed: open appliances inside ISPs, edges in three hundred-plus cities."},
  {id: "S20", chapter: 4, from: 3520, to: 3559, text: "And the failure mode flipped."},
  {id: "S21", chapter: 4, from: 3570, to: 3778, text: "In 2021, one bad config at an edge provider took down roughly a tenth of the internet for forty-nine minutes."},
  {id: "S22", chapter: 4, from: 3789, to: 4003, text: "The trick that beat distance also concentrates trust: the edge became a single point of failure for everyone at once."},
  {id: "S23", chapter: 4, from: 4049, to: 4110, text: "So — Friday night, your movie."},
  {id: "S24", chapter: 4, from: 4121, to: 4278, text: "One second in, it plays. Not because the network is fast — because the copy was close."},
  {id: "S25", chapter: 4, from: 4289, to: 4365, text: "The internet isn't fast. It's close."},
];
