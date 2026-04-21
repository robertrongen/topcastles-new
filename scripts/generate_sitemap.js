#!/usr/bin/env node
/**
 * Generates new_app/public/sitemap.xml from castles.json.
 *
 * Includes one <url> per castle detail page plus the main static pages.
 * Uses today's date as <lastmod> for all URLs.
 *
 * Usage:
 *   node scripts/generate_sitemap.js
 *
 * Run after generate_lean_castles.js to include the latest castle list.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = join(__dirname, '..');
const CASTLES    = join(REPO_ROOT, 'new_app', 'src', 'assets', 'data', 'castles.json');
const OUT        = join(REPO_ROOT, 'new_app', 'public', 'sitemap.xml');

const BASE_URL = 'https://www.topcastles.eu';
const TODAY    = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { path: '/',              priority: '1.0', changefreq: 'monthly' },
  { path: '/top1000',       priority: '0.9', changefreq: 'monthly' },
  { path: '/top-countries', priority: '0.8', changefreq: 'monthly' },
  { path: '/top-regions',   priority: '0.7', changefreq: 'monthly' },
  { path: '/developer',     priority: '0.5', changefreq: 'yearly'  },
  { path: '/background',    priority: '0.5', changefreq: 'yearly'  },
];

const castles = JSON.parse(readFileSync(CASTLES, 'utf8'));

function url(loc, priority, changefreq) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...STATIC_PAGES.map(p => url(`${BASE_URL}${p.path}`, p.priority, p.changefreq)),
  ...castles.map(c => url(`${BASE_URL}/castles/${c.castle_code}`, '0.6', 'yearly')),
  '</urlset>',
];

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`✓ Wrote sitemap with ${STATIC_PAGES.length} static + ${castles.length} castle URLs → ${OUT}`);
