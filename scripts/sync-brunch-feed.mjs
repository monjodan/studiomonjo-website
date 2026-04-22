#!/usr/bin/env node
/**
 * Fetches the Brunch RSS feed and writes data/brunch-featured.json
 * with canonical profile URLs (@profileId) and the newest articles.
 *
 * Usage: node scripts/sync-brunch-feed.mjs
 * Requires: Node 18+ (global fetch)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'data', 'brunch-featured.json');

const RSS_URL = 'https://brunch.co.kr/rss/@@hqSD';
const PROFILE_ID = '444d2811f4b84ad';
const PROFILE_URL = `https://brunch.co.kr/@${PROFILE_ID}`;
const FEATURED_COUNT = 4;

function stripTags(html) {
  if (!html) return '';
  return html
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*$/g, '')
    .trim();
}

function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&mdash;/g, '\u2014');
}

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function parseRssItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = decodeEntities(stripTags(extractTag(block, 'title')));
    const link = stripTags(extractTag(block, 'link'));
    const rawDesc = extractTag(block, 'description');
    const decodedDesc = decodeEntities(rawDesc);
    const beforeImg = decodedDesc.split(/<img\b/i)[0];
    const description = stripTags(beforeImg);
    const idMatch = link.match(/\/(\d+)\s*$/);
    const id = idMatch ? idMatch[1] : null;
    if (title && id) {
      items.push({
        id,
        title,
        url: `${PROFILE_URL}/${id}`,
        excerpt: description.length > 220 ? `${description.slice(0, 220).trim()}…` : description,
      });
    }
  }
  return items;
}

async function main() {
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'StudioMonjoSiteSync/1.0 (+https://studiomonjo.com)' },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  const all = parseRssItems(xml);
  const articleCount = all.length;
  const featured = all.slice(0, FEATURED_COUNT);

  const payload = {
    profileUrl: PROFILE_URL,
    rssUrl: RSS_URL,
    profileId: PROFILE_ID,
    syncedAt: new Date().toISOString(),
    articleCount,
    featured,
    all,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT} (${articleCount} articles, ${featured.length} featured).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
