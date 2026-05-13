// Generate an app icon for Turns using Gemini image generation.
// Usage: GEMINI_API_KEY=... node scripts/generate-favicon.mjs
import fs from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const OUT = path.resolve(process.cwd(), "frontend/src/app/icon.png");
const MODEL = "gemini-3-pro-image-preview";

const prompt = [
  "Minimalist app icon, square, designed to be readable at 32x32px.",
  "Subject: a single ornate love letter envelope with a glowing red wax heart seal,",
  "framed by a subtle gold filigree border inspired by tarot cards.",
  "Deep indigo / purple gradient background.",
  "Centered composition, high contrast, no text, no numbers, no logos.",
  "Painted in thick gouache and ink, gilded highlights, dramatic spotlight.",
].join(" ");

const body = {
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: { responseModalities: ["IMAGE"] },
};

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
console.log("generating favicon...");
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) {
  const t = await res.text();
  console.error(`FAIL: ${res.status} ${t.slice(0, 400)}`);
  process.exit(1);
}
const data = await res.json();
const parts = data?.candidates?.[0]?.content?.parts || [];
const img = parts.find((p) => p.inlineData?.data);
if (!img) {
  console.error("no image returned", JSON.stringify(data).slice(0, 400));
  process.exit(1);
}
const buf = Buffer.from(img.inlineData.data, "base64");
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, buf);
console.log(`wrote ${OUT} (${buf.length} bytes)`);
