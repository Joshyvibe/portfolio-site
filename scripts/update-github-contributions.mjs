#!/usr/bin/env node
// Snapshots a GitHub user's public contribution calendar into assets/github-contributions.json,
// which the site renders in the "Shipping cadence" card. The site is static and GitHub's
// contributions page doesn't allow cross-origin fetches, so the data is baked in here instead.
//
// Usage: node scripts/update-github-contributions.mjs [username]   (Node 18+)

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const user = process.argv[2] || "joshyvibe";
const out = fileURLToPath(new URL("../assets/github-contributions.json", import.meta.url));

const res = await fetch(`https://github.com/users/${user}/contributions`, {
  headers: { "User-Agent": "portfolio-contributions-snapshot" },
});
if (!res.ok) throw new Error(`GitHub responded ${res.status} for ${user}`);
const html = await res.text();

// Each day is a <td data-date data-level id>; its count lives in the <tool-tip for=id> text.
const counts = new Map();
for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
  const m = text.match(/^(\d[\d,]*) contributions?/);
  counts.set(id, m ? Number(m[1].replace(/,/g, "")) : 0);
}

const days = [];
for (const [td] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
  const date = td.match(/data-date="([^"]+)"/)[1];
  const level = Number(td.match(/data-level="(\d)"/)?.[1] ?? 0);
  const id = td.match(/\bid="([^"]+)"/)?.[1];
  days.push({ date, count: counts.get(id) ?? 0, level });
}
if (!days.length) throw new Error("No contribution days found — GitHub's markup may have changed.");
days.sort((a, b) => a.date.localeCompare(b.date));

const total = days.reduce((sum, d) => sum + d.count, 0);
await writeFile(out, JSON.stringify({ user, generatedAt: new Date().toISOString(), total, days }) + "\n");
console.log(`${user}: ${total} contributions across ${days.length} days → ${out}`);
