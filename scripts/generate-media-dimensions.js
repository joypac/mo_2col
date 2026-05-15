#!/usr/bin/env node
/*
 * Generates the `mediaDimensions` object from disk.
 * Walks `assets/` looking for .webp, .jpg, .jpeg, .png, .mp4, .mov files,
 * detects width/height via `sips` (images) or `ffprobe` (video), and prints
 * a JS object literal you can paste into main.js, replacing the existing one.
 *
 * Usage:
 *   node scripts/generate-media-dimensions.js
 *   node scripts/generate-media-dimensions.js > dims.txt   # save to file
 *
 * Requires: macOS `sips` (built-in) and `ffprobe` (brew install ffmpeg).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const IMG_EXT = ['.webp', '.jpg', '.jpeg', '.png'];
const VID_EXT = ['.mp4', '.mov'];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function imageDimensions(file) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${file}"`, { encoding: 'utf8' });
  const w = out.match(/pixelWidth:\s*(\d+)/);
  const h = out.match(/pixelHeight:\s*(\d+)/);
  if (!w || !h) throw new Error(`No dimensions for ${file}`);
  return [parseInt(w[1], 10), parseInt(h[1], 10)];
}

function videoDimensions(file) {
  const out = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${file}"`,
    { encoding: 'utf8' }
  );
  const [w, h] = out.trim().split(',').map(n => parseInt(n, 10));
  if (!w || !h) throw new Error(`No dimensions for ${file}`);
  return [w, h];
}

function main() {
  if (!fs.existsSync(ASSETS)) {
    console.error('No assets/ directory found at', ASSETS);
    process.exit(1);
  }

  const files = walk(ASSETS).sort();
  const entries = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (rel.endsWith('.DS_Store')) continue;
    try {
      let dims;
      if (IMG_EXT.includes(ext)) dims = imageDimensions(file);
      else if (VID_EXT.includes(ext)) dims = videoDimensions(file);
      else continue;
      entries.push([rel, dims]);
    } catch (e) {
      console.error('Skipping', rel, '—', e.message);
    }
  }

  // Group by deepest folder under assets/ for readability.
  const grouped = {};
  for (const [rel, dims] of entries) {
    const parts = rel.split('/');
    // parts[0] = 'assets', last is the filename. Use everything in between, or 'assets' if flat.
    const group = parts.length > 2 ? parts.slice(1, -1).join('/') : 'assets';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push([rel, dims]);
  }

  console.log('var mediaDimensions = {');
  const groupKeys = Object.keys(grouped).sort();
  for (const g of groupKeys) {
    console.log(`  // ${g}`);
    for (const [rel, dims] of grouped[g]) {
      console.log(`  '${rel}': [${dims[0]}, ${dims[1]}],`);
    }
  }
  console.log('};');
}

main();
