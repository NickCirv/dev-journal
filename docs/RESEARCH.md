# dev-journal — research record

## Revision and scope

- Repository: [NickCirv/dev-journal](https://github.com/NickCirv/dev-journal)
- Commit: `acb18e728a44e6fdf488d3715eee508c24a7e5d1`
- Tree: `b4834e622eca7f09d1b2acfdfe67e05029fc80be`
- Captured: 11 of 11 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/package.json) | verified in manifest; installation unverified |
| Turn Git activity into draft journal entries and standup summaries using an Anthropic model. | [implementation](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/bin/journal.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/bin/journal.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/package.json) | verified as a declaration only |

## Findings carried into the rewrite

The writing commands send collected repository activity to Anthropic and may incur API charges. Review generated prose before sharing it; commit activity is not a complete record of work. Streak uses Git history and does not require generated prose.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `8edf13ba2a2e443fa49e42493414f6952a4a14b6c407983a7c95162ab37f6265`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/LICENSE) · blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/README.md) · blob `edda8761f3a327795f51a9143973e1592eaba9bd`.
- [package.json](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/package.json) · blob `dff99d23e816c09ee22d1efb2375aadf16086e2d`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/journal.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/bin/journal.js) · blob `3385e06abcb73fc903097b8ced854d7e27903fde`.
- [src/collector.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/collector.js) · blob `8d56e154f17bb6f7f7ab61a015394baf11bbed3d`.
- [src/index.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/index.js) · blob `f05a49e3f7ed8d666038819a48c74ea19c379bf4`.
- [src/storage.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/storage.js) · blob `62a671f40edf4eefbbba60f8f9e8859644daf96d`.
- [src/streak.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/streak.js) · blob `1c6b050214dd8ffb2ba13b17175f1d6ef6dd4c3f`.
- [src/writer.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/src/writer.js) · blob `d9a3e3821ff9163cd3177cc2202c9b49fd82fb83`.
- [test/smoke.test.js](https://github.com/NickCirv/dev-journal/blob/acb18e728a44e6fdf488d3715eee508c24a7e5d1/test/smoke.test.js) · blob `4da9b08b932877dee57fe0c103730248a5e8b560`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `.gitignore`
- `banner.svg`
- `package-lock.json`
