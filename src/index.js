import { program } from 'commander';
import chalk from 'chalk';
import { collectToday, collectWeek, collectYesterday } from './collector.js';
import { writeJournalEntry, writeWeeklySummary, writeStandup } from './writer.js';
import {
  saveEntry,
  loadEntry,
  todayDate,
  yesterdayDate,
  weekStartDate,
  exportMarkdown,
  listEntryDates,
} from './storage.js';
import { calculateStreak, renderStreakCalendar } from './streak.js';

const VERSION = '1.0.0';

function printHeader(title) {
  console.log('');
  console.log(chalk.bold.cyan(`  ◆ ${title}`));
  console.log(chalk.dim('  ' + '─'.repeat(50)));
}

function printStat(label, value) {
  console.log(chalk.dim(`  ${label}`) + '  ' + chalk.white.bold(value));
}

function splitPaths(val) {
  return val ? val.split(',').map((s) => s.trim()) : [];
}

export function run() {
  program
    .name('dev-journal')
    .description('Auto-generated dev journal from git activity')
    .version(VERSION);

  // ─── today ────────────────────────────────────────────────────────────────
  program
    .command('today')
    .description("Generate today's journal entry from git activity")
    .option('-p, --paths <paths>', 'Comma-separated directories to scan', splitPaths)
    .option('--no-save', 'Print entry without saving to disk')
    .option('--force', 'Regenerate even if entry already exists for today')
    .action(async (opts) => {
      printHeader("Today's Dev Journal");

      const date = todayDate();
      const existing = loadEntry(date);

      if (existing && !opts.force) {
        console.log(chalk.yellow(`  Existing entry found for ${date}. Use --force to regenerate.\n`));
        console.log(existing);
        return;
      }

      process.stdout.write(chalk.dim('  Scanning git activity...'));
      const activity = await collectToday(opts.paths);
      process.stdout.write(chalk.green(' done\n'));

      if (activity.totals.commits === 0) {
        console.log(chalk.yellow('\n  No commits found yet today. Go ship something!\n'));
        return;
      }

      printStat('Commits', activity.totals.commits);
      printStat('Repos', activity.totals.repos);
      printStat('Lines added', `+${activity.totals.insertions}`);
      printStat('Lines removed', `-${activity.totals.deletions}`);
      console.log('');

      process.stdout.write(chalk.dim('  Generating journal entry...'));
      const entry = await writeJournalEntry(activity, date);
      process.stdout.write(chalk.green(' done\n\n'));

      if (opts.save !== false) {
        const filePath = saveEntry(date, entry);
        console.log(chalk.dim(`  Saved to ${filePath}\n`));
      }

      console.log(entry);
      console.log('');
    });

  // ─── week ─────────────────────────────────────────────────────────────────
  program
    .command('week')
    .description('Generate a weekly summary from git activity')
    .option('-p, --paths <paths>', 'Comma-separated directories to scan', splitPaths)
    .option('--no-save', 'Print summary without saving')
    .action(async (opts) => {
      printHeader('Weekly Dev Summary');

      const weekStart = weekStartDate();
      const today = todayDate();

      process.stdout.write(chalk.dim('  Scanning 7 days of git activity...'));
      const activity = await collectWeek(opts.paths);
      process.stdout.write(chalk.green(' done\n'));

      if (activity.totals.commits === 0) {
        console.log(chalk.yellow('\n  No commits found this week.\n'));
        return;
      }

      printStat('Total commits', activity.totals.commits);
      printStat('Repos active', activity.totals.repos);
      printStat('Lines added', `+${activity.totals.insertions}`);
      printStat('Lines removed', `-${activity.totals.deletions}`);
      printStat('Files changed', activity.totals.filesChanged);
      console.log('');

      process.stdout.write(chalk.dim('  Generating weekly summary...'));
      const summary = await writeWeeklySummary(activity, weekStart, today);
      process.stdout.write(chalk.green(' done\n\n'));

      if (opts.save !== false) {
        const weekFile = `week-${weekStart}`;
        const filePath = saveEntry(weekFile, summary);
        console.log(chalk.dim(`  Saved to ${filePath}\n`));
      }

      console.log(summary);
      console.log('');
    });

  // ─── standup ──────────────────────────────────────────────────────────────
  program
    .command('standup')
    .description('Generate a formatted standup update (yesterday/today/blockers)')
    .option('-p, --paths <paths>', 'Comma-separated directories to scan', splitPaths)
    .action(async (opts) => {
      printHeader('Standup Update');

      process.stdout.write(chalk.dim('  Scanning yesterday + today...'));
      const [yesterday, today] = await Promise.all([
        collectYesterday(opts.paths),
        collectToday(opts.paths),
      ]);
      process.stdout.write(chalk.green(' done\n'));

      const yesterdayCommits = yesterday.totals.commits;
      const todayCommits = today.totals.commits;

      printStat('Yesterday commits', yesterdayCommits);
      printStat('Today commits so far', todayCommits);
      console.log('');

      if (yesterdayCommits === 0 && todayCommits === 0) {
        console.log(chalk.yellow('  No commits found for yesterday or today.\n'));
        return;
      }

      process.stdout.write(chalk.dim('  Generating standup...'));
      const standup = await writeStandup(yesterday, today);
      process.stdout.write(chalk.green(' done\n\n'));

      console.log(standup);
      console.log('');
      console.log(chalk.dim('  ─────────────────────────────────'));
      console.log(chalk.dim('  Copy the above into your standup!'));
      console.log('');
    });

  // ─── export ───────────────────────────────────────────────────────────────
  program
    .command('export')
    .description('Export journal entries as markdown')
    .option('--format <format>', 'Output format: md (default)', 'md')
    .option('--from <date>', 'Start date (YYYY-MM-DD), defaults to 30 days ago')
    .option('--to <date>', 'End date (YYYY-MM-DD), defaults to today')
    .option('-o, --output <file>', 'Output file path (prints to stdout if omitted)')
    .action(async (opts) => {
      printHeader('Export Journal');

      const to = opts.to || todayDate();
      const from = opts.from || (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
      })();

      const dates = listEntryDates();
      const inRange = dates.filter((d) => d >= from && d <= to);

      if (inRange.length === 0) {
        console.log(chalk.yellow(`\n  No entries found between ${from} and ${to}.\n`));
        return;
      }

      printStat('Entries found', inRange.length);
      printStat('Date range', `${from} → ${to}`);
      console.log('');

      const markdown = exportMarkdown(from, to);

      if (opts.output) {
        const { writeFileSync } = await import('fs');
        writeFileSync(opts.output, markdown, 'utf8');
        console.log(chalk.green(`  Exported to ${opts.output}\n`));
      } else {
        console.log(markdown);
      }
    });

  // ─── streak ───────────────────────────────────────────────────────────────
  program
    .command('streak')
    .description('Show your coding streak and commit calendar')
    .option('-p, --paths <paths>', 'Comma-separated directories to scan', splitPaths)
    .action(async (opts) => {
      printHeader('Coding Streak');

      process.stdout.write(chalk.dim('  Scanning commit history (last 365 days)...'));
      const streak = calculateStreak(opts.paths);
      process.stdout.write(chalk.green(' done\n\n'));

      // Current streak with fire indicator
      const streakColor = streak.current >= 7 ? chalk.green : streak.current >= 3 ? chalk.yellow : chalk.white;
      console.log(
        '  ' + chalk.dim('Current streak  ') + streakColor.bold(`${streak.current} day${streak.current !== 1 ? 's' : ''}`) +
        (streak.current >= 7 ? chalk.red(' 🔥') : '')
      );
      console.log('  ' + chalk.dim('Longest streak  ') + chalk.white.bold(`${streak.longest} days`));
      console.log('  ' + chalk.dim('Total days      ') + chalk.white.bold(`${streak.totalDays} days`));

      if (streak.lastCommitDate) {
        console.log('  ' + chalk.dim('Last commit     ') + chalk.white(streak.lastCommitDate));
      }

      console.log('');
      console.log(chalk.dim('  Last 28 days:'));
      console.log('');

      const calendar = renderStreakCalendar(streak.commitDates);
      calendar.split('\n').forEach((row) => {
        console.log('  ' + chalk.cyan(row));
      });

      console.log('');
      console.log(chalk.dim('  █ = commit  ░ = no commit'));
      console.log('');

      if (streak.current === 0) {
        console.log(chalk.yellow('  No streak active. Make a commit today to start one!\n'));
      } else if (streak.current === 1) {
        console.log(chalk.white('  Day 1 — keep it going!\n'));
      } else if (streak.current >= streak.longest && streak.current > 1) {
        console.log(chalk.green('  New personal best streak!\n'));
      }
    });

  program.parse(process.argv);
}
