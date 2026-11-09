#!/usr/bin/env node
/**
 * Check a plugin market index against the format-1 rules this bundle relies on.
 *
 * The authoritative validator is `@deepseek-ai/dsh-plugin-market-index`. This
 * script duplicates only the rules that catch the mistakes a generator and a
 * reviewer make, so CI can validate without a network install.
 *
 * Usage: node scripts/validate-index.mjs [path]   (default: market/index.json)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:\d*[a-zA-Z-][0-9a-zA-Z-]*|(?:0|[1-9]\d*))(?:\.[0-9a-zA-Z-]+)*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/u;
const COMMIT = /^[0-9a-f]{40}$/u;
const DATA_ICON = /^data:(?:image\/svg\+xml|image\/png|image\/jpeg|image\/webp);base64,([A-Za-z0-9+/]*={0,2})$/u;
const MAX_INLINE_ICON_BYTES = 32 * 1024;

/** Collect violations instead of throwing on the first one. */
function check(problems) {
  const report = [];
  const test = (condition, path, reason) => {
    if (!condition) report.push(`${path} ${reason}`);
  };

  test(problems.format === 1, '$.format', 'must be 1');
  test(Object.hasOwn(problems.title ?? {}, 'en'), '$.title', 'must contain en');
  test(Array.isArray(problems.plugins) && problems.plugins.length > 0, '$.plugins', 'must be a non-empty array');

  for (const [position, plugin] of (problems.plugins ?? []).entries()) {
    const at = `$.plugins[${position}]`;
    test(typeof plugin.name === 'string' && plugin.name.length > 0, `${at}.name`, 'must be a non-empty string');
    test(Array.isArray(plugin.versions) && plugin.versions.length > 0, `${at}.versions`, 'must be a non-empty array');
    if (typeof plugin.icon === 'string') {
      const icon = DATA_ICON.exec(plugin.icon);
      if (icon === null) test(false, `${at}.icon`, 'must be a supported data: URL');
      else test(Buffer.from(icon[1], 'base64').length <= MAX_INLINE_ICON_BYTES, `${at}.icon`, 'must stay within 32 KiB');
    }
    for (const [index, version] of (plugin.versions ?? []).entries()) {
      const versionAt = `${at}.versions[${index}]`;
      test(typeof version.version === 'string' && SEMVER.test(version.version), `${versionAt}.version`, 'must be exact SemVer');
      test(Number.isSafeInteger(version.publishTimestamp), `${versionAt}.publishTimestamp`, 'must be integer Unix seconds');
      const source = version.source ?? {};
      if (source.type === 'git') {
        test(typeof source.url === 'string' && source.url.startsWith('https://'), `${versionAt}.source.url`, 'must be an https URL');
        test(typeof source.commit === 'string' && COMMIT.test(source.commit), `${versionAt}.source.commit`, 'must be a 40-hex commit');
      } else if (source.type === 'npm') {
        test(source.registry === undefined || String(source.registry).startsWith('https://'), `${versionAt}.source.registry`, 'must be https when present');
      } else test(false, `${versionAt}.source.type`, 'must be npm or git');
    }
  }

  return report;
}

const target = resolve(ROOT, process.argv[2] ?? 'market/index.json');
const value = JSON.parse(readFileSync(target, 'utf8'));
const report = check(value);
if (report.length > 0) {
  console.error(`invalid index: ${target}`);
  for (const line of report) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`valid index: ${target}`);
