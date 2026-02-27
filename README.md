![Banner](banner.svg)

# dev-journal

> Auto-generated daily dev journal from git activity.

[![npm version](https://img.shields.io/npm/v/dev-journal?color=%236EE7B7&label=npm)](https://www.npmjs.com/package/dev-journal)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/NickCirv/dev-journal?style=flat)](https://github.com/NickCirv/dev-journal/stargazers)

---

## The Problem

Standup in 10 minutes. "What did I do yesterday?" You stare at Slack. You check Jira. You lie. What if your git history could write your standup for you?

`dev-journal` scans all git repos under your working directory, reads commit history, and uses Claude (Haiku) to generate a natural-language journal entry. No manual note-taking. No standup anxiety.

---

## Quick Start

```bash
# Set your API key once
export ANTHROPIC_API_KEY=sk-ant-...

# Generate today's journal
npx dev-journal today

# Get standup-ready output for Slack
npx dev-journal standup
```

---

## Example Output

### `npx dev-journal today`

```
# Dev Journal — 2026-02-27

## Summary

Spent the day building out the Jarvis Telegram command layer and fixing a persistent
TDZ bug in the agent viewer dashboard. Also cleaned up 22 stale skills from the
dispatch table and expanded brain-os.md routing to cover 85+ intents.

## Projects Touched

- **agent-viewer** — Unified Telegram bot + jarvis-brain into a single Express server
  with an 8-module command layer
- **dev-journal** — Initial scaffolding: collector, writer, storage, streak modules

## Key Changes

- Extracted `router.js`, `capture.js`, `projects.js` from monolithic `server.js`
- Fixed TDZ crash by consolidating all declarations into a STATE block at line 3668
- Added exponential backoff (1min→10min) to research polling in agent viewer
- Retired `jarvis-bot.py` — archived and disabled LaunchAgent plist
- Expanded brain-os.md dispatch from 30 → 85+ entries across 13 sections

## Stats

| Metric | Value |
|--------|-------|
| Commits | 14 |
| Repos | 2 |
| Lines added | +847 |
| Lines removed | -312 |
| Files changed | 23 |
```

### `npx dev-journal standup`

```
**Yesterday:**
- Completed agent viewer audit — fixed 17 JS errors, added mobile More tab
- Retired standalone Jarvis bot, unified into server.js with 8-module command layer
- Ran system-wide vault audit — fixed 8 stale files, created 6 CLAUDE.md files

**Today:**
- Scaffold dev-journal CLI (collector, writer, storage, streak)
- Wire Anthropic API for natural-language journal generation
- Set up npm package + bin entry point

**Blockers:** None
```

### `npx dev-journal streak`

```
  Current streak   12 days 🔥
  Longest streak   21 days
  Total days       89 days
  Last commit      2026-02-27

  Last 28 days:

  ░ █ █ █ █ █ █
  █ █ ░ █ █ █ █
  █ █ █ █ █ █ █
  █ █ █ █ █ █ █

  █ = commit  ░ = no commit
```

---

## Features

- Scans all git repos under your working directories (max depth 3)
- Natural-language summaries via Claude Haiku (cheapest model — no overkill)
- Standup format ready to paste into Slack or Notion
- Weekly summaries with shipped work highlights and inferred next steps
- 28-day coding streak calendar
- Flat-file storage at `~/.dev-journal/entries/` — readable without the CLI
- Export to a single markdown file for a given date range

---

## How It Works

1. **Collector** (`src/collector.js`) — finds all git repos under target directories, runs `git log --numstat` to get commits, file changes, and line counts. Uses `execFileSync` with argument arrays — no shell injection.
2. **Writer** (`src/writer.js`) — sends structured activity data to `claude-haiku-4-5` via the Anthropic SDK. Generates natural prose with consistent formatting.
3. **Storage** (`src/storage.js`) — reads and writes entries to `~/.dev-journal/entries/YYYY-MM-DD.md`. Simple flat-file store, no database.
4. **Streak** (`src/streak.js`) — scans commit history for the last 365 days, calculates current and longest streaks, renders a block-character calendar.

---

## Commands

| Command | Description |
|---------|-------------|
| `dev-journal today` | Generate today's journal from commits since midnight |
| `dev-journal week` | Weekly summary of the last 7 days |
| `dev-journal standup` | Formatted Yesterday / Today / Blockers for Slack |
| `dev-journal streak` | Show coding streak with 28-day commit calendar |
| `dev-journal export` | Export entries as a single markdown file |

### Options

| Flag | Description |
|------|-------------|
| `-p, --paths <paths>` | Comma-separated directories to scan for git repos |
| `--force` | Re-generate even if an entry exists for the date |
| `--no-save` | Print output without writing to `~/.dev-journal/` |
| `--from <date>` | Start date for export (YYYY-MM-DD) |
| `--to <date>` | End date for export (YYYY-MM-DD) |
| `-o, --output <file>` | Write export to file instead of stdout |

---

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` environment variable

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Storage

```
~/.dev-journal/
  entries/
    2026-02-25.md
    2026-02-26.md
    2026-02-27.md
    week-2026-02-24.md
```

Each entry is a standalone markdown file — readable without the CLI, portable, easy to back up.

---

## See Also

- [100x-dev](https://github.com/NickCirv/100x-dev) — measure your AI-powered velocity with a real multiplier
- [pr-poet](https://github.com/NickCirv/pr-poet) — auto-generate PR descriptions from your diffs
- [vibe-coding](https://github.com/NickCirv/vibe-coding) — ship entire features from a single prompt
- [blame-ai](https://github.com/NickCirv/blame-ai) — find out which parts of your codebase Claude wrote

---

## License

MIT — [NickCirv](https://github.com/NickCirv)
