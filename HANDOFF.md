# fcfb-website handoff (written 2026-11-03)

Branch `add-edit-uniform-field`. **Uncommitted changes exist** (list below). Andrew commits everything himself; never commit, push or tag, and never add AI attribution.

## Working rules
- Node: `PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH` (the default shell node is x64 and breaks rollup/esbuild).
- Checks: `npx prettier --write src`, `npx eslint src --ext .js,.jsx`, `npx jest` (889 passed), `npx vite build`.
- Layout: every page fits a 13" MBP (1470x780) with the footer visible; tabs over scrolling; modals over pages; no "·" separators; no native number spinners; logos next to team names; no horizontal table scroll on desktop.
- No inline `//` comments; reuse shared helpers (`textareaSx`, `PILL_HEIGHT`, `chartColor.js`).
- Screenshots: headless Playwright against a dev build on 127.0.0.1:4173 that proxies to the backend (`npx vite build --mode development --outDir <out> --emptyOutDir`).

## Uncommitted work (suggested commits)
- **Drive chart on the real field:** `DriveFieldChart.jsx`, `useGameField.js`, `stadiumApi.getGameField` (per-game promise cache). Home or neutral-site field with logos, scaled proportionally, compact 22-30px rows, away drives mirrored, border in the drive color. The "Score" pill only marks the last play of a touchdown drive (`PlaysPanel` takes `gamePlays`).
- **Around FCFB:** `useAroundFcfb.js` unwraps the week object into a number. It still fails because `/history/week` returns 401; Andrew is on it (backend handoff, item 3).
- **Pill height:** `TeamFilterPill.jsx` uses the shared `PILL_HEIGHT` (34px).
- **Matchup colors:** `pickMatchupColors` and `matchupColorsFor` in `src/utils/chartColor.js` give each team a color visible on the surface for the current mode, distinct from the opponent. Rules: 3:1 contrast, neutral-vs-neutral counts as a clash, same-hue-family counts as a clash, and accents (blue, gold, green, orange) must also avoid the opponent's brand colors. Used by `GameCard`, `HomeGameRow`, `scoreboardProps`, `DriveChart` and `WinProbChart`. Needs a visual check on real cards (K-State vs BYU was the last bug). If red teams look washed out on dark, consider relaxing the 3:1 threshold, which would also change the chart.

## Do these first after the Mac restarts
1. Restart the backend (V68/V69) and reload. The first game-field render is slow (about a minute); the navbar ticker was also slow to load.
2. Check the drive chart, the matchup colors on the scoreboard, and the Around FCFB strip.

## Backlog
- **M5:** a "Preview" modal (Field and Stadium tabs) on upcoming schedule rows and in the Matchup Previewer, once the backend matchup endpoint exists.
- Team appearance Field tabs run about 20px past the footer at 1470x780 (tall preview column); offered to shrink it.
- Conference logo missing in admin form selects (`TeamEditDialog`, `ModifyTeamForm`).
- Scoreboard Cards view still scrolls by design; Compact fits.
- Coach Stats tab and tendency tiles are blank on dev until the backend stats job runs.
- Play details page shows "No replay" for non-scrimmage games (backend flag).
- Data quirks: faint dark-theme logos for Colonial and Southland; Navy "AAC" and Arkansas State "SBC" as division.
- Phase 3 UI: time-slot and weather display, admin weather override on the game page.

## Merging the 2026-11-14 main hotfix into add-edit-uniform-field
- `src/utils/chartColor.js` and its test on main are copied verbatim from this branch; take the branch version.
- Main's `WinProbChart` and `ScoreChart` take marks only (no homeColor/awayColor). `ScoreChart` computes `matchupColorsFor(homeMark, awayMark, mode)` itself and renders its own legend (homeName/awayName props). The branch's GameDetails still passes scorebug `pickTeamColor` colors to ScoreChart, which is the bug; adopt main's ScoreChart and update both GameDetails and DriveChart callers. ColorModeContext moved to `context/` on the branch.
- `CoachTendencyCard` "Include sub games" toggle (`subs` URL param, default on), `getCoachStats(coach, includeSubGames)`, `coachedTeamOf` in `scoutingReport.js`.
- Jest on main now uses the branch's jest.config.js minus the resizeObserver setupFiles entry (main's eslintrc flags `globalThis`); take the branch config and stubs on merge. `npm test` script added.
- `DriveFieldChart` on main takes marks only and picks bar colors with `pickMatchupColors(homeMark, awayMark, TURF_COLOR)` so they contrast with the turf. The branch still passes page-surface colors and uses `FALLBACK_TURF`/the real field turf from `useGameField`; pick against that turf color when merging.
