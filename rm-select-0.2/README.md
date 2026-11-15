# rm-select 0.2.1 — RetireMentum v2 selector bridge and acceptance suite

Prototype for review, not published. The baseline funnel does not load any of this.

## Pinned engine

| Item | Value |
| --- | --- |
| Repository | https://github.com/gary832/retirementum-calc |
| Commit | `e331e24dbf3928b1b553894d96289633f1bab157` |
| `rm-calc-2.0.0.min.js` | sha256 `96ae55fb98b1415c9404962a308edc3edf777583ee402700554af0c1f6111ea1` |
| `rm-payout-lookup-1.0.0.js` | sha256 `5a23f32c3fab28ee1d34f1ca137b7b7c4d65ea48886a61d35ec4712e57612c6b` |
| `rm-box-1.0.5.js` | sha256 `3ddc4f2ae965dbf37d7ab4fe7c0cd243e6bf5ecbff88d1cb7e45fde86905e713` |
| `rm-payout-2026-11-11-r2.js` | sha256 `4c0f10ed033ec76e01c140d6fb3d18d3651266319794f2e6b48bd499fd501ce8` |

`load.js` checks the commit (when the repo is a git checkout) and every file hash before running anything. A mismatch exits with code 2.

## Run

```sh
git clone https://github.com/gary832/retirementum-calc.git calc
git -C calc checkout e331e24dbf3928b1b553894d96289633f1bab157
node suite.js --repo=calc            # 2,001 checks; exit 1 on any failure; writes suite-results.json
node option-c-test.js --repo=calc    # Option C assertions; exit 1 on any failure; writes option-c-results.json
```

Or `./ci.sh` (clones, pins, runs both, fails the build on any failure). Verified on Node 22.23.4; the reviewer's earlier package run used Node 24.22.1.

## Files

| File | What it is |
| --- | --- |
| `rm-select.js` | Selector bridge. `make({RMBox, RMCalc}, table)` → `select(answers, {option, cShare, dMonthlyToday})` and `screen(answers, cShare)` (A, B, C for the selector's first view). Works in Node and the browser (`window.RMSelect`). |
| `rm-record.js` | Saved record (`save`), the one display model both screens use (`display`), and the Snapshot renderer (`snapshot`), which never calls the engine. |
| `suite.js` | Acceptance suite (below). |
| `option-c-test.js` | B vs C at 25% and 50% with assertions; the only expected tie is the cap-driven one. |
| `households.js` | The eight review fixtures. `suite.js` adds 13 edge-case fixtures. |
| `load.js` | Pinned engine loader. |
| `ci.sh` | One-step CI run. |

## Result contract (`rm-select-result/1`)

Every option returns the same shape: `status` (`ok`, `capped`, `no_layer`, `unavailable`, `invalid_input`, `error`), a display-ready `reason {code, text}` with no advisor or booking prompt, `basis` (as-of year, report year and ages, inflation, dollar basis), `before` and `after` (rm-box report-year summaries; `after` is `before` when there is no layer), `layer`, `limit` (cap, asset cap, eligible-account cap, binding limit, reached, remaining essential gap), `goal` (Option D only), `equalTo` (C only, `'B'` when C comes out the same as B; `select` and `screen` return the identical C result, so the explanation reaches the saved Snapshot), and `versions`. Failures return the baseline; they never throw.

## Option D sizing contract

- Input: after-tax dollars a month in today's dollars, $1 to $100,000. Strings: an optional `$`, digits with commas only in groups of three (`1,234`, `12,345.67`), at most two decimals, spaces only at the ends or after the `$`; the format is checked before any separator is removed, so `1,2`, `1 2` and `1$2` are rejected. Numbers: at most two decimals (`12.345` is rejected). Anything else → `invalid_input`.
- Conversion: input × 12 × (1 + plan inflation)^(report year − as-of year), with inflation and as-of year read from rm-calc for those answers.
- Benefit: baseline withdrawal − withdrawal with the layer, in the report year (layer income minus the extra tax it creates).
- Met: benefit ≥ min(goal, baseline withdrawal) − $1. The same $1 tolerance is used for the above-need case, the search and the final check.
- Premium: smallest whole $1,000 that is met; the result records the $1,000 step below and that it fails.
- Cap: read from a $1,000 probe. No oversize request is ever made or exposed.
- Feasible amount: `goal.feasibleAnnualAfterTax` (after tax, a year, report-year dollars) and `goal.feasibleMonthlyToday` (after tax, a month, today's dollars), both rounded down. The display model exposes both, with `feasibleAnnualBasis` naming the report year and inflation.
- Capped: layer at the cap, feasible amounts, binding limit, remaining essential gap from the priced result, and reason. A premium estimate is given only when the capped layer has a positive benefit, and is marked `approximate`.
- Pricing replies are validated field by field (summary figures, layer, funding list, funding limits) for B, C and D; an incomplete reply returns `error` (`engine_incomplete` or `pricing_failed`) with the baseline.
- Not modeled: unavailable payouts, savings that can't cover the year (`savings_unresolved`), no withdrawal needed, no eligible funds, no benefit, and engine errors each return their own status and reason.

## What the suite checks

| Group | Checks |
| --- | --- |
| reconcile | Need + scenario tax + any surplus = reliable income + withdrawal; reliable income = SS + other + layer; tax split; spending unchanged; withdrawal drop = layer − extra tax − extra surplus; payout lookup cross-check; funding totals per account within balance and confirmed plan amounts; never brokerage; within cap. Unresolved years: rate null and uncovered amount reported. |
| contract | One result shape; no internal oversize request; no advisor or booking text in reasons; layer flag consistent. |
| option D | Conversion basis; effective goal; met and verified against the step below; above-need; capped fields; approximate estimate; exact-need boundary; invalid and formatted inputs; reviewer's $50k-eligible and brokerage-only cases; no withdrawal needed. |
| failure | Pricing errors, exceptions and partial replies on engine calls 1, 2 and 4; missing rate table; ages outside the payout table. |
| monotonic | Benefit never falls as premium rises, including across a Traditional → Roth funding switch. |
| C formula | C premium = min(cap, round-up(required × 1.05 + share × discretionary ÷ payout)) at 25% and 50%, including no essential gap and cap-trimmed cases. |
| B/C limits | Cap ties marked equal; remaining gap; account-limited cap; confirmed and unconfirmed workplace plans; zero eligible balance; essentials already covered. |
| reference | Engine tax vs an independent 2026 federal calculation (IRS Rev. Proc. 2025-32 brackets and deductions, typed separately) for a single and a joint all-IRA household; all-Roth tax is $0; rate = withdrawal ÷ (assets − premium) when the report year is the as-of year; null rates (unresolved and no-withdrawal states); report-year timing and layer start. |
| review 0.2.0 | Regressions for the developer review of `bd1f5c3`: C-equals-B identical in preview and selected record and kept through save and reload (all fixtures, both shares); incomplete pricing replies with partly valid nested fields for B, C and D; the D input contract; feasible report-year amount with basis, rounded down; remaining essential gap. These 98 checks fail 45 times on 0.2.0 and pass on 0.2.1. |
| round trip | Record saved to a session store and read back without the engine; Snapshot figures = selector figures = the engine result for the chosen option; versions and engine commit stored; re-running stored inputs reproduces the stored result; Option A via link; Change my choice. |

Mutation check: the suite fails when the D search is skipped, the tolerance is loosened, D ignores tax, the today's-dollar conversion is removed, or the display shows the current plan's withdrawal.

## Not covered here

Browser behavior, Perspective's contact and OTP steps, real page reloads, GoHighLevel delivery and the hosted Snapshot page. These are the gate 1 demo and the funnel QA matrix. Federal tax is referenced only for all-IRA households with no Social Security; Social Security taxation and state tax have no independent reference yet.
