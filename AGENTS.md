# Agents: start here

<!--
Template: kazoku-ui templates/AGENTS.md. Copy it to AGENTS.md at the repo root and fill in the Facts table below the marker.
Everything above the marker is the same in every package repo: change it here, then copy it over, never by hand in one repo.
Everything below the marker belongs to the repo. Public repo: no private hosts, addresses, home paths, logins or keys.
-->

This repo is one of the family of John Morris's npm packages. The rules every package repo shares are below; what differs is in the **Facts** table under the marker.

## Read first

1. spx-stats `docs/package-work.md` (https://github.com/spxis/spx-stats/blob/main/docs/package-work.md), and the section "Who may change what" in spx-stats `AGENTS.md`. They hold the boards, filing, checks, release, hand-off and reporting rules. If your session has an spx-stats checkout, `git pull` it first.
2. This repo's `CONTRIBUTING.md` and README, for the rules and commands of the code itself.
3. The Facts table below: your board, ports, checks, release path and hand-off project.

## Work

- **Board.** Every ticket for this repo is on the board named in Facts, titled `<title prefix>: ...` with `--area <title prefix>`. From the spx-stats checkout's `web/` directory: `pnpm task --board <board> list`, then `claim <id> "<who>"` with the whole id before you start. Read the ticket's full detail first. Anything you find outside your ticket becomes a new ticket; say so in your report. Never run `done`: the coordinating session closes tickets.
- **A gap in a shared part** (the view controls, theme switch, language picker, address state, save-as-image) is a `kazoku-ui:` ticket on the `kazoku-ui` board, not a copy or a workaround here.
- **One agent per repo**, in a new git worktree from `origin/main`. Never work in the main checkout or in another agent's worktree.
- **Ports.** Only the block in Facts. Check `lsof -iTCP:<port> -sTCP:LISTEN` first, stop only your own process by its PID, never `pkill`.
- **Commits.** As John Morris <john@johnmorris.ca>, Conventional Commits, subject 50 characters or less, no AI attribution, files added by name (never `git add -A`). Push fast-forward to `main` after `git fetch` and a rebase.
- **Never.** GitHub issues, pull requests, discussions or comments; a token, key or private address in any file, commit or ticket; John's SPX, SPXN or SPXIS marks in an MIT package; anything that bills; a new package name, first publish, major version, deprecation or licence change without John's yes.
- **Japanese.** Whatever you write for John, give the English beside it. A docs page is in one language.

## Checks, release, hand-off

- **Before every push** run the checks in Facts. Green locally, then green in CI after the push (`gh run watch`).
- **Release.** Make a release commit (bump `package.json`, move the CHANGELOG's Unreleased block under the version), push it, wait for CI. **Do not tag and do not publish.** John runs the Release workflow (Actions → Release → Run workflow, from `main`). It checks the tag against `package.json`, runs the repo's check script, skips a version already on npm, tags `v<version>`, and publishes by trusted publishing. The repo's `release.yml` should call kazoku-ui's `reusable-release.yml` (kazoku-ui `docs/release-workflow.md`); the trusted-publisher entry on npmjs.com names `release.yml`.
- **Hand-off** for every finished ticket: write `<ticket-id>.json` and run `SPX_HANDOFF_PROJECT=<hand-off project> python3 -I scripts/handoff/handoff.py check|write <file>` from the spx-stats checkout (the variable on the same command line; the id is the ticket's whole id). Read the replies at the start and before you finish. Then release your hold: `pnpm task --board <board> release <id> --by "<who>"`.
- **Report** in under 12 lines, first line `<your name>, ticket <id> (<title>)` (`subagent of <name>` for a subagent): what changed, shas, CI, anything John must decide, new tickets, and last `HAND-OFF WRITTEN: <path>`. If you stop for any reason, say so at once.

<!-- repo-specific: everything below this line belongs to this repo. A template update never touches it. -->

## Facts

| | |
|---|---|
| Package | `@johnmorrisdotca/senshu-jerseys` |
| Repo | `johnmorrisdotca/senshu-jerseys` |
| Board | `senshu-jerseys` (its own board; see the one-home table in spx-stats `docs/package-work.md`) |
| Title prefix and `--area` | `senshu-jerseys` |
| Ports | 7300 to 7399: 7300 the demo, 7301 the tests, 7302 the picture script, 7303 and up for a worktree |
| Checks before a push | `pnpm check`, `pnpm test:readme`, `pnpm test:usage`, `pnpm test:demo` |
| Release | `release.yml` → `reusable-release.yml`; trusted publisher entry: `release.yml` |
| Hand-off project | `senshu-jerseys` |

## This repo

Sports jerseys, kits, caps, helmets, banners and judogi as SVG strings, with a demo site. Rules true only here (the long form is `CONTRIBUTING.md`):

- No runtime dependencies. The family's shared parts (`@johnmorrisdotca/kazoku-ui`) are dev dependencies used by the demo only.
- A preset is colours and stripes only: no crest, logo, wordmark or sponsor's mark, current or defunct.
- A drawing is a pure function of its options: no clock, no random number.
- Japanese names and words are read by someone who reads Japanese before they ship.
- Docs pages are single-language; a test (`docs-language.test`) holds them to it.
- Reference images live in Dropbox `/Projects/Resources/senshu-jerseys/`, never in this repository.
