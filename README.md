<div align="center">

# dev-journal

**Turn your git history into daily dev journals and standup notes — no manual writing.**

[![license](https://img.shields.io/badge/license-MIT-blue?labelColor=0B0A09)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
# Requires an Anthropic API key
export ANTHROPIC_API_KEY=your-key-here

npx github:NickCirv/dev-journal <command>
```

## Usage

```bash
npx github:NickCirv/dev-journal today      # journal entry from today's commits
npx github:NickCirv/dev-journal standup    # Yesterday / Today / Blockers for standups
npx github:NickCirv/dev-journal week       # weekly summary
npx github:NickCirv/dev-journal streak     # 28-day commit calendar
npx github:NickCirv/dev-journal export     # dump entries to a markdown file
```

| Flag | Description |
|------|-------------|
| `-p, --paths <paths>` | Comma-separated directories to scan for git repos |
| `--force` | Re-generate even if an entry already exists for today |
| `--no-save` | Print output without writing to `~/.dev-journal/` |
| `--from <date>` | Start date for export (YYYY-MM-DD) |
| `--to <date>` | End date for export (YYYY-MM-DD) |
| `-o, --output <file>` | Write export to a file instead of stdout |

## What it does

`dev-journal` scans git repos under your working directories (up to depth 3), reads `git log --numstat` output, and sends structured activity data to Claude Haiku to produce natural-language journal entries. Entries are saved as plain markdown files at `~/.dev-journal/entries/YYYY-MM-DD.md` — readable without the CLI. The `streak` command calculates current and longest commit streaks and renders a block-character 28-day calendar.

---
<sub>3 dependencies · Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
