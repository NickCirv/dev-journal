import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const JOURNAL_DIR = join(homedir(), '.dev-journal');
const ENTRIES_DIR = join(JOURNAL_DIR, 'entries');

/**
 * Ensure the journal directory structure exists.
 */
export function ensureJournalDir() {
  mkdirSync(ENTRIES_DIR, { recursive: true });
}

/**
 * Get the file path for a given date's journal entry.
 */
export function entryPath(date) {
  return join(ENTRIES_DIR, `${date}.md`);
}

/**
 * Save a journal entry for a given date.
 */
export function saveEntry(date, content) {
  ensureJournalDir();
  const filePath = entryPath(date);
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Load a journal entry for a given date. Returns null if not found.
 */
export function loadEntry(date) {
  const filePath = entryPath(date);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

/**
 * List all stored journal entry dates (sorted ascending).
 */
export function listEntryDates() {
  ensureJournalDir();
  return readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''))
    .sort();
}

/**
 * Load multiple entries by date range.
 */
export function loadEntriesInRange(startDate, endDate) {
  const dates = listEntryDates().filter((d) => d >= startDate && d <= endDate);
  return dates.map((date) => ({
    date,
    content: loadEntry(date),
  }));
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
export function todayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date string in YYYY-MM-DD format.
 */
export function yesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Get the start of the current week (Monday) as YYYY-MM-DD.
 */
export function weekStartDate() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = start of week
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

/**
 * Export journal entries as concatenated markdown.
 */
export function exportMarkdown(startDate, endDate) {
  const entries = loadEntriesInRange(startDate, endDate);
  if (entries.length === 0) {
    return `# Dev Journal Export\n\n*No entries found for ${startDate} to ${endDate}.*\n`;
  }

  const sections = entries.map(({ date, content }) => content).join('\n\n---\n\n');

  const header = `# Dev Journal Export\n*${startDate} to ${endDate}*\n\n---\n\n`;
  return header + sections;
}
