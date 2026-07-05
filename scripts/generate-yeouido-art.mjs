/**
 * 여의도 대전 카드 아트 생성기 — GLM CogView.
 *
 * 실행: GLM_API_KEY=<키> node scripts/generate-yeouido-art.mjs
 * (키는 절대 커밋하지 않는다. 이미 생성된 파일은 건너뛰므로 멱등.)
 *
 * 프롬프트에는 실존 인물명을 넣지 않는다 — 카드 아트는 익명 캐리커처,
 * 풍자는 카드명/텍스트가 담당한다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_KEY = process.env.GLM_API_KEY;
if (!API_KEY) {
  console.error("GLM_API_KEY env var required");
  process.exit(1);
}

const MODEL = "cogview-4-250304";
const SIZE = "864x1152";
const OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "games",
  "yeouido",
);

const STYLE =
  "satirical political cartoon trading card illustration, korean webtoon style, bold clean outlines, exaggerated facial expression, dramatic rim lighting, rich painterly background, vibrant colors, centered character portrait, no text, no letters, no watermark";

/** id → subject prompt (English works best with CogView). */
const PROMPTS = {
  // neutral units
  aide: "young exhausted parliamentary aide in a wrinkled suit carrying a tall stack of documents and four coffee cups, office hallway background",
  reporter: "eager newspaper reporter in a trench coat thrusting a microphone and voice recorder forward, camera flashes in background",
  pollster: "nerdy statistician holding a giant clipboard with bar charts, spectacles glinting, call-center background",
  youtuber: "loud internet pundit streaming in a dark room, gaming headset, pointing at the camera dramatically, RGB lights and superchat effects",
  activist: "determined middle-aged civic activist holding a protest picket sign, headband, standing firm with arms crossed",
  bodyguard: "tall stern man in black suit and dark sunglasses with an earpiece, arms spread wide protectively in front of a podium, shield-like stance, action pose",
  prosecutor: "stern prosecutor in formal robe slamming a thick indictment folder onto a desk, scales of justice in background",
  speaker: "dignified elderly national assembly speaker in formal hanbok-style suit banging a wooden gavel at a grand podium",
  expresident: "retired kindly elderly statesman in a beige cardigan feeding chickens in a countryside yard, gentle smile, a thick memoir book under his arm",
  chaebol: "wealthy old tycoon in a tailored pinstripe suit seated in a luxurious skyscraper office, golden city skyline behind, holding a fountain pen, smug expression",
  scarecrow: "sad straw scarecrow wearing an oversized borrowed suit and name tag, standing in an empty assembly hearing room",
  // neutral spells
  comment: "furious spokesperson at a press briefing podium shouting into a bouquet of microphones, spit flying, papers waving",
  poll: "giant glowing survey graph rising from a ballot box surrounded by floating percentage symbols, mystical blue light",
  filibuster: "disheveled lawmaker speaking at a podium for many hours, clock spirals melting behind, water bottles piled up, colleagues asleep",
  pledge: "beaming politician unveiling an absurdly huge golden promise scroll that unrolls down the stairs, fireworks",
  raid: "boxes of seized documents being carried out of an office at dawn by agents in windbreakers, dramatic flashlights",
  fakenews: "swirling storm of glowing smartphone screens and warped newspaper headlines forming a monstrous face, purple haze",
  pressconf: "chaotic emergency press conference, forest of microphones, blinding camera flashes like explosions, bowing figure",
  impeach: "giant ceremonial gavel striking down from stormy clouds onto a cracked podium, lightning, dramatic red sky",
  realign: "assembly hall chairs flying and swapping in a whirlwind, party flags of blue and red torn and remixing, chaos",
  // ruling faction
  fandom: "cheerful crowd of devoted political fans waving blue glow sticks and heart-shaped picket signs like a K-pop concert",
  hardliner: "fiery middle-aged lawmaker leaping over a desk mid-shout with finger pointed, blue tie flying, speech bubbles exploding",
  rally: "massive rally crowd in blue raising fists under confetti, candidate silhouette on stage with arms wide",
  reform: "giant blue reform hammer smashing through a wall of old documents and red tape, sparks flying",
  candlelight: "sea of warm candlelight held by a peaceful night crowd in a plaza, hopeful faces glowing",
  // opposition faction
  sitin: "lone determined protester in a small tent doing a one-person sit-in in front of the assembly, red scarf, banner overhead",
  protest: "roaring outdoor opposition rally with red flags and raised fists, leader on a truck stage with megaphone",
  chairman: "sharp middle-aged woman politician in red suit standing confidently with crossed arms in an emergency committee room",
  strongman: "burly veteran politician in red tie throwing a straight punch forward like a boxer, comical impact lines",
  martial: "ominous late-night emergency address on every screen of a dark city, tanks silhouetted, red warning light sweeping — dark political satire",
  // heroes
  hero_ruling: "confident charismatic middle-aged man in navy suit with blue necktie waving to a crowd, warm confident grin, blue balloons and banners background, friendly caricature",
  hero_opposition: "sharp intellectual middle-aged man with neatly parted hair and thin glasses in dark suit with red necktie, smirking confidently with arms crossed, red balloons and banners background, friendly caricature",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generateOne = async (id, subject) => {
  const outPath = path.join(OUT_DIR, `${id}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`skip ${id} (exists)`);
    return true;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ model: MODEL, prompt: `${STYLE}. ${subject}`, size: SIZE }),
      });
      const json = await res.json();
      const url = json?.data?.[0]?.url;
      if (!url) throw new Error(`no url: ${JSON.stringify(json).slice(0, 200)}`);
      // The CDN URL can 404 for a moment right after generation — retry the
      // download itself before burning another generation call.
      let buf = null;
      for (let d = 1; d <= 5; d++) {
        const img = await fetch(url);
        if (img.ok) {
          buf = Buffer.from(await img.arrayBuffer());
          break;
        }
        await sleep(1200 * d);
      }
      if (!buf) throw new Error("download failed after retries");
      fs.writeFileSync(outPath, buf);
      console.log(`✓ ${id} (${(buf.length / 1024).toFixed(0)}KB)`);
      return true;
    } catch (e) {
      console.warn(`retry ${id} #${attempt}: ${e.message}`);
      await sleep(1500 * attempt);
    }
  }
  console.error(`✗ FAILED ${id}`);
  return false;
};

const main = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const entries = Object.entries(PROMPTS);
  console.log(`generating ${entries.length} images → ${OUT_DIR}`);
  let failed = 0;
  // 동시 3개
  const queue = [...entries];
  const workers = Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const [id, subject] = queue.shift();
      const ok = await generateOne(id, subject);
      if (!ok) failed++;
    }
  });
  await Promise.all(workers);
  console.log(failed ? `${failed} failed — rerun to retry` : "all done");
  process.exit(failed ? 1 : 0);
};

main();
