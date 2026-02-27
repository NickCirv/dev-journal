# dev-journal

Auto-generated daily dev journal from git activity. Never write standup notes again.

![dev-journal banner](banner.svg)

---

## What it does

`dev-journal` scans all git repos under your working directory, reads commit history, and uses Claude (Haiku) to generate a natural-language journal entry. No manual note-taking. No standup anxiety.

---

## Example output

### `npx dev-journal today`

```
# Dev Journal — 2026-02-27

## Summary

Spent the day building out the Jarvis Telegram command layer and fixing a persistent TDZ bug in the agent viewer dashboard. Also cleaned up 22 stale skills from the dispatch table and expanded brain-os.md routing to cover 85+ intents.

## Projects Touched

- **agent-viewer** — Unified Telegram bot + jarvis-brain into a single Express server with an 8-module command layer
- **dev-journal** — Initial scaffolding: collector, writer, storage, streak modules

## Key Changes

- Extracted `router.js`, `capture.js`, `projects.js` from monolithic `server.js` to reduce coupling
- Fixed TDZ crash by consolidating all `let`/`const` declarations into a STATE block at line 3668
- Added exponential backoff (1min→10min) to research polling in agent viewer
- Retired `jarvis-bot.py` — archived and disabled LaunchAgent plist to prevent 409 conflicts
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

---

### `npx dev-journal standup`

```
**Yesterday:**
- Completed agent viewer audit — fixed 17 JS errors, consolidated TDZ, added mobile More tab
- Retired standalone Jarvis bot, unified into server.js with 8-module command layer
- Ran system-wide vault audit — fixed 8 stale files, created 6 CLAUDE.md files

**Today:**
- Scaffold dev-journal CLI (collector, writer, storage, streak)
- Wire Anthropic API for natural-language journal generation
- Set up npm package + bin entry point

**Blockers:** None
```

---

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

## Install

```bash
# Run without installing
npx dev-journal today

# Or install globally
npm install -g dev-journal
```

**Requires:** Node 18+, `ANTHROPIC_API_KEY` env var.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Commands

### `dev-journal today`

Generate today's journal entry from commits made since midnight.

```bash
npx dev-journal today
npx dev-journal today --force          # Regenerate if entry exists
npx dev-journal today --no-save        # Print only, don't write to disk
npx dev-journal today -p ~/repos,~/work  # Scan specific directories
```

Entries are saved to `~/.dev-journal/entries/YYYY-MM-DD.md`.

---

### `dev-journal week`

Weekly summary of the last 7 days. Highlights shipped work, identifies in-progress threads, and infers next steps.

```bash
npx dev-journal week
npx dev-journal week -p ~/repos
```

---

### `dev-journal standup`

Formatted standup update with Yesterday / Today / Blockers. Ready to paste into Slack.

```bash
npx dev-journal standup
npx dev-journal standup -p ~/repos,~/work
```

---

### `dev-journal export`

Export stored journal entries as a single markdown file.

```bash
npx dev-journal export                              # Last 30 days, stdout
npx dev-journal export --from 2026-02-01 --to 2026-02-28
npx dev-journal export -o ./february-journal.md    # Write to file
```

---

### `dev-journal streak`

Show your coding streak with a 28-day commit calendar.

```bash
npx dev-journal streak
npx dev-journal streak -p ~/repos
```

---

## How it works

1. **Collector** (`src/collector.js`) — Finds all git repos under the target directories (max depth 3). Runs `git log` with `--numstat` to get commits, file changes, and line counts. No shell injection — uses `execFileSync` with argument arrays.

2. **Writer** (`src/writer.js`) — Sends structured activity data to `claude-haiku-4-5` via the Anthropic SDK. Haiku is the cheapest model — journal writing doesn't need Opus. Generates natural prose with consistent formatting.

3. **Storage** (`src/storage.js`) — Reads and writes entries to `~/.dev-journal/entries/YYYY-MM-DD.md`. Simple flat-file store, no database.

4. **Streak** (`src/streak.js`) — Scans commit history for the last 365 days across all repos. Calculates current and longest streaks. Renders a block-character calendar.

---

## Options

| Flag | Description |
|------|-------------|
| `-p, --paths <paths>` | Comma-separated list of directories to scan for git repos |
| `--force` | Re-generate an entry even if one exists for the date |
| `--no-save` | Print output without writing to `~/.dev-journal/` |
| `--from <date>` | Start date for export (YYYY-MM-DD) |
| `--to <date>` | End date for export (YYYY-MM-DD) |
| `-o, --output <file>` | Write export to file instead of stdout |

---

## Storage

Journal entries live in `~/.dev-journal/entries/`. Each entry is a standalone markdown file — readable without the CLI, portable, and easy to back up.

```
~/.dev-journal/
  entries/
    2026-02-25.md
    2026-02-26.md
    2026-02-27.md
    week-2026-02-24.md
```

---

## License

MIT — [NickCirv](https://github.com/NickCirv)
