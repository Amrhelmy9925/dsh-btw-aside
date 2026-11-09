#!/usr/bin/env node
/**
 * Build a plugin market index (format 1) for this bundle.
 *
 * The index names one installable version per plugin. This repository is the
 * package root, so the source is the repository's own commit: every published
 * index pins an exact SHA rather than a moving branch.
 *
 * Usage:
 *   node scripts/build-market-index.mjs [--out market/index.json] [--repo <https url>]
 *
 * Requirements: a git checkout with a remote `origin` (or --repo), and at least
 * one commit. Run it after committing, so the pinned SHA contains the code the
 * index describes.
 */
import { execFileSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Read one JSON file from the package root. */
function readJson(relative) {
  return JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));
}

/**
 * Run git in the package root and return trimmed stdout.
 *
 * Stdout is captured through a temporary file rather than a pipe: some sandboxes
 * forbid the named pipes that piped stdio needs, and the file path works the same
 * everywhere.
 * @param args - git arguments.
 * @returns trimmed stdout.
 */
function git(args) {
  const capture = join(tmpdir(), `btw-git-${process.pid}-${Date.now()}.out`);
  const fd = openSync(capture, 'w');
  try {
    execFileSync('git', args, { cwd: ROOT, stdio: ['ignore', fd, 'ignore'] });
  } finally {
    closeSync(fd);
  }
  try {
    return readFileSync(capture, 'utf8').trim();
  } finally {
    rmSync(capture, { force: true });
  }
}

/** Parse `--name value` pairs; unknown flags are a usage error. */
function parseArgs(argv) {
  const options = { out: 'market/index.json', repo: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    if (flag === '--out') options.out = value;
    else if (flag === '--repo') options.repo = value;
    else throw new Error(`unknown flag ${flag}`);
    index += 1;
  }
  return options;
}

/** Normalize a git remote to the canonical https form the index format requires. */
function httpsRepository(remote) {
  const scp = /^[a-z][a-z0-9+.-]*:\/\//iu.test(remote) ? null : /^(?:[^@/]+@)?([^:/]+):(.+)$/u.exec(remote);
  const base = scp === null ? remote : `https://${scp[1]}/${scp[2]}`;
  const url = new URL(base);
  if (url.protocol !== 'https:') throw new Error(`repository must be https, got ${url.protocol}`);
  if (url.username !== '' || url.password !== '') throw new Error('repository must not carry credentials');
  if (url.search !== '' || url.hash !== '') throw new Error('repository must not carry a query or fragment');
  return `${url.origin}${url.pathname.replace(/\.git$/u, '').replace(/\/$/u, '')}`;
}

const options = parseArgs(process.argv.slice(2));
const pkg = readJson('package.json');
const en = readJson('locale/en.json').meta;
const zh = readJson('locale/zh.json').meta;
const repo = httpsRepository(options.repo ?? git(['config', '--get', 'remote.origin.url']));
const commit = git(['rev-parse', 'HEAD']).toLowerCase();
if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`HEAD is not a 40-hex commit: ${commit}`);
const publishTimestamp = Number(git(['show', '-s', '--format=%ct', 'HEAD']));
const icon = `data:image/svg+xml;base64,${readFileSync(join(ROOT, 'icon.svg')).toString('base64')}`;

const index = {
  format: 1,
  title: { en: 'BTW side question', zh: 'BTW 侧边提问' },
  description: {
    en: 'A right-sidebar aside chat for DSH: ask a question without touching the main conversation.',
    zh: 'DSH 右侧栏附带提问：不影响主对话地提一个问题。',
  },
  metadata: { categories: {}, labels: {}, sortKeys: {} },
  plugins: [
    {
      name: pkg.name,
      title: { en: en.title, zh: zh.title },
      description: { en: en.description, zh: zh.description },
      icon,
      ...(typeof pkg.author === 'string' && pkg.author.length > 0 ? { author: pkg.author } : {}),
      homepage: repo,
      repository: { url: repo },
      metadata: { keywords: pkg.keywords ?? [] },
      versions: [
        {
          version: pkg.version,
          publishTimestamp,
          source: { type: 'git', url: repo, commit },
          engines: {},
        },
      ],
    },
  ],
};

const out = resolve(ROOT, options.out);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(index, null, 2)}\n`);
console.log(`wrote ${out} (commit ${commit.slice(0, 7)})`);
