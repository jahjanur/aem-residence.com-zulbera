/**
 * Downloads DejaVu Sans TTF fonts for PDF Unicode support (e.g. Turkish ş, ı, ğ).
 * Run: node scripts/download-fonts.js (or npm run postinstall from api).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, '..', 'fonts');
// DejaVu or Noto Sans (both support Turkish ş, ı, ğ, etc.). Try multiple sources.
const FONTS = [
  {
    file: 'DejaVuSans.ttf',
    urls: [
      'https://raw.githubusercontent.com/google/fonts/main/ofl/dejavusans/DejaVuSans.ttf',
      'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
    ],
  },
  {
    file: 'DejaVuSans-Bold.ttf',
    urls: [
      'https://raw.githubusercontent.com/google/fonts/main/ofl/dejavusans/DejaVuSans-Bold.ttf',
      'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf',
    ],
  },
];

function download(url) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Node font download)' } };
    https.get(url, opts, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }
  for (const { file, urls } of FONTS) {
    const outPath = path.join(FONTS_DIR, file);
    if (fs.existsSync(outPath)) {
      console.log(`Font exists: ${file}`);
      continue;
    }
    let ok = false;
    for (const url of urls) {
      console.log(`Downloading ${file}...`);
      try {
        const buf = await download(url);
        if (buf && buf.length > 1000) {
          fs.writeFileSync(outPath, buf);
          console.log(`Wrote ${file}`);
          ok = true;
          break;
        }
      } catch (e) {
        console.warn(`  Failed: ${e.message}`);
      }
    }
    if (!ok) {
      console.warn(`Could not download ${file}. For Turkish PDF characters, add DejaVuSans.ttf and DejaVuSans-Bold.ttf to apps/api/fonts/ (see https://dejavu-fonts.github.io/Download.html).`);
    }
  }
}

main();
