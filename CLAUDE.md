# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page wedding invitation landing for **Соня & Антон**, 23 May 2026, Minsk. Content is in **Russian** — preserve UTF-8 Cyrillic and the informal/editorial tone when paraphrasing. `text.md` holds the original full-length copy from the couple and is the canonical source for tone and content; the rendered page paraphrases it, not quotes it verbatim.

## Dev & deploy

No framework, no build step, zero dependencies. Serve the directory statically:

```bash
python3 -m http.server 8000
open http://localhost:8000
```

Fonts are loaded from Google Fonts CDN, so dev requires network. OSM map iframes and Google Maps "Открыть в картах" links likewise need the network.

Deploy target is **Cloudflare Pages**. Fastest iteration is Direct Upload (dashboard → Workers & Pages → Create → Pages tab → Upload assets → drag the folder with `index.html` at the root). Note: `*.workers.dev` URLs are *Workers*, not Pages — static-asset sites belong on Pages (`*.pages.dev`).

Git remote is `git@github.com:Lukyanau-Anton/landing.git`. SSH auth is routed through 1Password's agent via `~/.ssh/config` (`IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"`). The key 1Password serves is labeled `macbook-ssh` and must be registered at github.com/settings/keys before pushes work.

## Architecture (4 files, tightly coupled by date/time)

- **`index.html`** — semantic sections in order: hero, countdown, program (two venue cards), dress, gifts, rsvp, footer. Things that change across files together:
  - **RSVP Telegram handles** — placeholders `t.me/ANTON_TG` and `t.me/SONYA_TG` marked with `<!-- FILL: ANTON_TG -->` / `<!-- FILL: SONYA_TG -->` comments. Must be replaced with real handles before every deploy.
  - **OSM iframe URLs** encode coordinates in two *different* orders: `bbox=minLon,minLat,maxLon,maxLat` but `marker=lat,lon`. A swapped bbox silently centers on the wrong area without an error. Street-level view uses ≈ ±0.005 lon / ±0.003 lat around the marker.
- **`styles.css`** — design tokens as CSS custom properties on `:root` (`--bg` ivory, `--ink`, `--taupe` primary accent, `--sage` secondary accent on the "вечер" card, `--serif` Cormorant Garamond, `--sans` Inter). Mobile-first, `max-width` ≈ 560/720px. All motion is gated by `prefers-reduced-motion`.
- **`main.js`** — single IIFE with two concerns:
  1. Countdown to `Date.UTC(2026, 4, 23, 8, 0, 0)` — **11:00 Minsk = 08:00 UTC** (Europe/Minsk is UTC+3 year-round, no DST).
  2. `IntersectionObserver` reveal for `[data-reveal]` elements (adds `is-visible`).
- **`assets/favicon.svg`** — inline С&А monogram.

**Single-source-of-truth risk:** the wedding date/time appears in *three* places — the hero block in `index.html`, the `CEREMONY_UTC`/`DAY_END_UTC` constants in `main.js`, and the two Google Calendar `dates=…` query params on the RSVP anchors in `index.html` (percent-encoded `20260523T080000Z/20260523T090000Z` for the ceremony, `20260523T150000Z/20260523T210000Z` for the evening). If the date or times change, update all three; nothing enforces consistency.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

## Shell conventions on this system

Aliases may include `-i` on `cp`/`mv`/`rm`, which hangs the agent on a y/n prompt. Always pass `-f` (or `-rf`) explicitly. For network commands use `ssh -o BatchMode=yes`; for brew, prefix `HOMEBREW_NO_AUTO_UPDATE=1`.
