![dev-journal — Nicholas Ashkar repository collection](assets/nicholas-ashkar/banner.png)

# dev-journal

Turn Git activity into draft journal entries and standup summaries using an Anthropic model.


<a id="usage"></a>

## What it does

Scans configured directories for repositories, collects commit metadata and change counts, and offers today, week, standup, streak and export commands. Generated entries are stored as Markdown under ~/.dev-journal; export can write a chosen file. See the pinned [implementation](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/bin/journal.js).


<a id="install"></a>

## Quickstart

Node requirement from the inspected manifest: **`>=20`**. Requires Git. Generation uses the Anthropic SDK and its API-key configuration; use only repositories whose activity you are authorized to send. --paths limits the scan.

The following example is **source-inspected, not executed**. It uses a pinned checkout; npm package publication is not assumed. Replace project paths or provide the stated input fixtures before running it.

```bash
git clone https://github.com/NickCirv/dev-journal.git
cd dev-journal
git checkout acb18e728a44e6fdf488d3715eee508c24a7e5d1
npm install --ignore-scripts
node bin/journal.js streak
```

Dependencies are installed with lifecycle scripts disabled in this recipe. Read the package scripts before enabling any lifecycle step required by your environment.

## Usage and reference

`dev-journal` are the executable names declared by the package. [Command reference](docs/REFERENCE.md) covers source-backed options and entry points.

| Control | Behavior in the inspected implementation |
| --- | --- |
| `today / week / standup` | Generate an Anthropic-assisted activity draft |
| `streak` | Calculate commit streak information |
| `export` | Read saved entries into Markdown |
| `--paths LIST` | Limit repository discovery roots |

## Limits and operational notes

The writing commands send collected repository activity to Anthropic and may incur API charges. Review generated prose before sharing it; commit activity is not a complete record of work. Streak uses Git history and does not require generated prose.

## Development

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

| Script | Declared command |
| --- | --- |
| `start` | `node bin/journal.js` |
| `test` | `node --test` |

Work from the pinned source, keep changes focused, and reproduce the affected behavior with a small fixture before proposing a change. Existing contribution and security policies remain authoritative where present.

## Research and status

[Research record](docs/RESEARCH.md) identifies the inspected revision, source evidence, documentation disposition and verification gaps. Static inspection supports the descriptions here; runtime behavior, dependency installation and current hosted services remain unverified.

## License and author

[License](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/LICENSE)

[Nicholas Ashkar](https://nicholashkar.com) · Applied AI, systems and consulting.
