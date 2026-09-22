# dev-journal — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `acb18e728a44e6fdf488d3715eee508c24a7e5d1`. Commands are source-inspected; no execution results are asserted.

## Workflow

Scans configured directories for repositories, collects commit metadata and change counts, and offers today, week, standup, streak and export commands. Generated entries are stored as Markdown under ~/.dev-journal; export can write a chosen file.

Requires Git. Generation uses the Anthropic SDK and its API-key configuration; use only repositories whose activity you are authorized to send. --paths limits the scan.

```bash
node bin/journal.js streak
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `today / week / standup` | Generate an Anthropic-assisted activity draft |
| `streak` | Calculate commit streak information |
| `export` | Read saved entries into Markdown |
| `--paths LIST` | Limit repository discovery roots |

## Interpretation and side effects

The writing commands send collected repository activity to Anthropic and may incur API charges. Review generated prose before sharing it; commit activity is not a complete record of work. Streak uses Git history and does not require generated prose.

## Implementation reference

- [package.json](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/package.json)
- [bin/journal.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/bin/journal.js)
- [src/index.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/test/smoke.test.js)
