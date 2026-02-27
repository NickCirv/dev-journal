import { execFileSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Find all git repos under a given directory (max depth 3 to avoid deep traversal).
 */
function findGitRepos(rootDir, depth = 0, maxDepth = 3) {
  const repos = [];

  if (depth > maxDepth) return repos;

  if (existsSync(join(rootDir, '.git'))) {
    repos.push(rootDir);
    return repos; // Don't recurse into nested repos
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
 * Get the short name for a repo path.
 */
function repoName(repoPath) {
  return repoPath.split('/').pop();
}

/**
 * Run a git command in a given directory. Returns stdout as string or null on failure.
 */
function gitExec(repoPath, args) {
  try {
    return execFileSync('git', args, {
      cwd: repoPath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Parse the --numstat output lines into file change objects.
 */
function parseNumstat(numstatOutput) {
  if (!numstatOutput) return [];

  return numstatOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('\t');
      if (parts.length < 3) return null;
      const [insertions, deletions, file] = parts;
      return {
        file,
        insertions: insertions === '-' ? 0 : parseInt(insertions, 10) || 0,
        deletions: deletions === '-' ? 0 : parseInt(deletions, 10) || 0,
      };
    })
    .filter(Boolean);
}

/**
 * Collect commits from a single repo for a given since/until range.
 */
function collectFromRepo(repoPath, since, until) {
  const logArgs = [
    'log',
    `--since=${since}`,
    `--until=${until}`,
    '--format=%H|||%s|||%an|||%ae|||%ad',
    '--date=iso',
    '--no-merges',
  ];

  const logOutput = gitExec(repoPath, logArgs);
  if (!logOutput) return null;

  const commits = logOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, subject, author, email, date] = line.split('|||');
      return { hash, subject, author, email, date };
    });

  if (commits.length === 0) return null;

  // Get numstat for the range
  const numstatArgs = [
    'log',
    `--since=${since}`,
    `--until=${until}`,
    '--numstat',
    '--format=',
    '--no-merges',
  ];
  const numstatOutput = gitExec(repoPath, numstatArgs);
  const fileChanges = parseNumstat(numstatOutput);

  // Aggregate stats
  const totalInsertions = fileChanges.reduce((sum, f) => sum + f.insertions, 0);
  const totalDeletions = fileChanges.reduce((sum, f) => sum + f.deletions, 0);

  // Get unique files changed
  const uniqueFiles = [...new Set(fileChanges.map((f) => f.file))];

  // Detect main language from file extensions
  const extCounts = {};
  for (const file of uniqueFiles) {
    const ext = file.split('.').pop().toLowerCase();
    if (ext && ext.length <= 10) {
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    }
  }
  const topExtensions = Object.entries(extCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ext]) => ext);

  return {
    repo: repoName(repoPath),
    repoPath,
    commits,
    commitCount: commits.length,
    filesChanged: uniqueFiles.length,
    insertions: totalInsertions,
    deletions: totalDeletions,
    topExtensions,
    topFiles: uniqueFiles.slice(0, 10),
  };
}

/**
 * Main collection function. Scans repos and returns structured git activity data.
 *
 * @param {object} options
 * @param {string} options.since - git --since value (e.g. "1 day ago", ISO date)
 * @param {string} options.until - git --until value (e.g. "now")
 * @param {string[]} options.paths - directories to scan (defaults to cwd)
 */
export async function collectActivity({ since, until = 'now', paths } = {}) {
  const scanPaths = paths && paths.length > 0 ? paths.map(resolve) : [process.cwd()];

  const repos = [];
  for (const scanPath of scanPaths) {
    repos.push(...findGitRepos(scanPath));
  }

  // Deduplicate repos by resolved path
  const uniqueRepos = [...new Map(repos.map((r) => [resolve(r), r])).values()];

  const results = [];
  for (const repoPath of uniqueRepos) {
    const data = collectFromRepo(repoPath, since, until);
    if (data) results.push(data);
  }

  // Compute global stats
  const totalCommits = results.reduce((sum, r) => sum + r.commitCount, 0);
  const totalInsertions = results.reduce((sum, r) => sum + r.insertions, 0);
  const totalDeletions = results.reduce((sum, r) => sum + r.deletions, 0);
  const totalFilesChanged = results.reduce((sum, r) => sum + r.filesChanged, 0);

  return {
    since,
    until,
    repos: results,
    totals: {
      repos: results.length,
      commits: totalCommits,
      insertions: totalInsertions,
      deletions: totalDeletions,
      filesChanged: totalFilesChanged,
    },
  };
}

/**
 * Collect activity for "today" (since midnight).
 */
export async function collectToday(paths) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return collectActivity({ since: today.toISOString(), until: 'now', paths });
}

/**
 * Collect activity for the current week (last 7 days).
 */
export async function collectWeek(paths) {
  return collectActivity({ since: '7 days ago', until: 'now', paths });
}

/**
 * Collect activity for "yesterday".
 */
export async function collectYesterday(paths) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return collectActivity({
    since: yesterday.toISOString(),
    until: todayMidnight.toISOString(),
    paths,
  });
}
