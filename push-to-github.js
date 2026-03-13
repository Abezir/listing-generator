#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = 'Abezir';
const REPO = 'listing-generator';
const BASE_DIR = path.dirname(__filename);

function api(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'BrobsBot/1.0',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function upsertFile(filePath, repoPath) {
  const content = fs.readFileSync(filePath).toString('base64');
  const existRes = await api('GET', `/repos/${USERNAME}/${REPO}/contents/${repoPath}`);
  const sha = existRes.status === 200 ? existRes.body.sha : undefined;
  const res = await api('PUT', `/repos/${USERNAME}/${REPO}/contents/${repoPath}`, {
    message: `Add ${repoPath}`,
    content,
    ...(sha ? { sha } : {}),
  });
  const statusLabel = res.status === 201 ? '✅ created' : res.status === 200 ? '✅ updated' : `❌ ${res.status}`;
  console.log(`  ${repoPath}: ${statusLabel}`);
  if (res.status !== 200 && res.status !== 201) {
    console.log('  Error:', JSON.stringify(res.body).slice(0, 200));
  }
}

async function main() {
  console.log('🪓 ListingCraft → GitHub\n');

  // Create repo
  console.log('Creating repo...');
  const createRes = await api('POST', '/user/repos', {
    name: REPO,
    description: 'AI-powered MLS listing generator for real estate agents',
    private: false,
    auto_init: false,
  });
  if (createRes.status === 201) {
    console.log(`✅ Repo created: https://github.com/${USERNAME}/${REPO}\n`);
  } else if (createRes.status === 422) {
    console.log('ℹ️  Repo already exists, continuing...\n');
  } else {
    console.log('❌ Create repo failed:', createRes.status, createRes.body.message);
    process.exit(1);
  }

  // Files to push
  const files = [
    ['package.json', 'package.json'],
    ['tsconfig.json', 'tsconfig.json'],
    ['tailwind.config.ts', 'tailwind.config.ts'],
    ['postcss.config.mjs', 'postcss.config.mjs'],
    ['next.config.ts', 'next.config.ts'],
    ['.env.local.example', '.env.local.example'],
    ['.gitignore', '.gitignore'],
    ['README.md', 'README.md'],
    ['app/globals.css', 'app/globals.css'],
    ['app/layout.tsx', 'app/layout.tsx'],
    ['app/page.tsx', 'app/page.tsx'],
    ['app/api/generate/route.ts', 'app/api/generate/route.ts'],
  ];

  console.log('Pushing files...');
  for (const [localPath, repoPath] of files) {
    const fullPath = path.join(BASE_DIR, localPath);
    if (fs.existsSync(fullPath)) {
      await upsertFile(fullPath, repoPath);
    } else {
      console.log(`  ⚠️  Skipped (not found): ${localPath}`);
    }
  }

  console.log(`\n✅ All done!`);
  console.log(`📦 Repo: https://github.com/${USERNAME}/${REPO}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
