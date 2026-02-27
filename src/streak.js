import { execFileSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { listEntryDates } from './storage.js';

/**
 * Find all git repos under a directory (same logic as collector, extracted here to avoid circular dep).
 */
function findGitRepos(rootDir, depth = 0, maxDepth = 3) {
  const repos = [];
  if (depth > maxDepth) return repos;

  if (existsSync(join(rootDir, '.git'))) {
    repos.push(rootDir);
    return repos;
  }

  let entries;
  try {
    entries = readdirSync(rootDir, { withFileTypes: true });
  } catch {
    return repos;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;
    if (entry.name === 'vendor') continue;
    repos.push(...findGitRepos(join(rootDir, entry.name), depth + 1, maxDepth));
  }

  return repos;
}

/**
 * Get all dates (YYYY-MM-DD) where the user made at least one commit,
 * scanning all repos under the given paths.
 */
function getCommitDates(paths) {
  const scanPaths = paths && paths.length > 0 ? paths.map(resolve) : [process.cwd()];

  const repos = [];
  for (const scanPath of scanPaths) {
    repos.push(...findGitRepos(scanPath));
  }

  const uniqueRepos = [...new Map(repos.map((r) => [resolve(r), r])).values()];

  const dateSet = new Set();

  for (const repoPath of uniqueRepos) {
    try {
      const output = execFileSync(
        'git',
        ['log', '--format=%ad', '--date=short', '--no-merges', '--since=365 days ago'],
        { cwd: repoPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim();

      if (output) {
        output.split('\n').filter(Boolean).forEach((date) => dateSet.add(date));
      }
    } catch {
      // Skip repos where git fails
    }
  }

  return [...dateSet].sort();
}

/**
 * Calculate the current consecutive coding streak (in days).
 */
export function calculateStreak(paths) {
  const commitDates = getCommitDates(paths);
  const dateSet = new Set(commitDates);

  if (dateSet.size === 0) {
    return { current: 0, longest: 0, totalDays: 0, commitDates };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  // Current streak: count backwards from today (or yesterday if no commits today)
  let streakStart = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;

  let current = 0;
  if (streakStart) {
    const d = new Date(streakStart);
    while (dateSet.has(d.toISOString().split('T')[0])) {
      current++;
      d.setDate(d.getDate() - 1);
    }
  }

  // Longest streak ever
  let longest = 0;
  let run = 0;
  const allDates = [...dateSet].sort();

  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      run = diff === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  }

  return {
    current,
    longest,
    totalDays: dateSet.size,
    commitDates,
    lastCommitDate: allDates[allDates.length - 1] || null,
  };
}

/**
 * Render a compact streak calendar for the last 4 weeks.
 * Uses block characters: filled = commit day, empty = no commit.
 */
export function renderStreakCalendar(commitDates) {
  const dateSet = new Set(commitDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back 28 days
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ dateStr, hasCommit: dateSet.has(dateStr) });
  }

  // Build 4 rows of 7 days (week rows, Mon→Sun)
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const rows = weeks.map((week) =>
    week.map((d) => (d.hasCommit ? '█' : '░')).join(' ')
  );

  return rows.join('\n');
}
