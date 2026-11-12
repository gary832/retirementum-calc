# retirementum-calc

Finished files for the RetireMentum Perspective funnel: the calculator, the funding bridge, the published payout rates, and the payout lookup. Carrier names, product details, test cases and working notes are not kept here.

## Current files (use these)

| File | What it is |
|---|---|
| `rm-calc-2.0.0.min.js` | Calculation core extracted from LayerWise v27.1.0 (tax, Social Security, required distributions, year-by-year cash flow) |
| `rm-box-1.0.5.js` | Funding bridge: validates answers, sizes and funds the income layer, and returns the report figures |
| `rm-payout-lookup-1.0.0.js` | Turns a prospect's age(s), deferral and premium into an income estimate using a payout file |
| `rm-payout-2026-11-11-r2.json` | Lifetime income per $100,000 by issue age (55–75), single or joint, and years of deferral |
| `rm-payout-2026-11-11-r2.js` | The same rate table as a script that sets `window.RMPayoutRates`, for pages that can't fetch data files (the Perspective funnel) |
| `*.manifest.json` | Version, SHA-384 integrity hash and verification notes for each file |

Load order: `rm-calc-2.0.0.min.js`, `rm-payout-lookup-1.0.0.js`, `rm-box-1.0.5.js`, then `rm-payout-2026-11-11-r2.js`, each with the `integrity` value from its manifest. Pages that can fetch may load the `.json` with its integrity value instead; both hold the identical table. If the lookup or the rate file fails to load, the baseline snapshot still works.

## Superseded (do not use)

| File | Why |
|---|---|
| `rm-calc-1.0.0.min.js`, `rm-calc-1.0.0.json` | Built from LayerWise v27.3.0, not the approved v27.1.0. Replaced by rm-calc 2.0.0. |
| `rm-payout-2026-11-11.json` and its manifest | First release, ages 55–70 only. Replaced by r2, which adds the confirmed age-75 quotes. |

Kept for the record only; the funnel must not load them.

## Release rules

- Each release is a versioned file that never changes. A fix or a rate update ships as a new file.
- The funnel loads each file with its SHA-384 integrity value, so a browser refuses any copy that differs from the tested one.
- `.nojekyll` tells GitHub Pages to serve files exactly as stored.

## How the funnel uses the files

```js
// Perspective funnel (no fetch allowed): after the four scripts load
let table = (typeof window.RMPayoutRates === "object") ? window.RMPayoutRates : null;

// Elsewhere, the JSON can be fetched instead:
// table = await fetch("https://gary832.github.io/retirementum-calc/rm-payout-2026-11-11-r2.json",
//   { integrity: "<integrity from rm-payout-2026-11-11-r2.manifest.json>" }).then(r => r.json()).catch(() => null);

const snapshot   = RMBox.run(answers, table, { mode: "none" });       // baseline only
const comparison = RMBox.run(answers, table, { mode: "essential" });  // with the income layer
```

## Self-service funding rule (rm-box 1.0.5)

- Funding order: traditional IRAs, then eligible workplace plans, then Roth IRAs. Brokerage and other after-tax money is never used.
- Premium cap: the lower of 50% of investable assets and the eligible account total, each rounded down to $1,000.
- A workplace plan is eligible only for an owner who:
  - no longer works for that employer, and the plan administrator has confirmed money can be rolled out now; or
  - still works there, is at least 59½ (age 60+, or 59 with that confirmed), and has confirmed the plan allows in-service rollovers.
- Being retired does not make a plan eligible by itself.
- Only the confirmed pre-tax amount available to roll over can fund the layer. The full plan balance stays in the baseline and in the 50% cap. If the amount is unknown, the plan is left out and reviewed in the consultation.

## Payout rules (release 2026-11-11-r2)

- **Representative figure:** the middle annual payout of the three highest quotes for each issue age, single or joint, and deferral.
- **Quoted issue ages:** 55, 60, 65, 70 and 75 (all confirmed November 12, 2026).
- **Ages between quoted ages:** a straight-line estimate between the two nearest quoted ages at the same deferral.
- **Outside 55–75:** unavailable. No extrapolation.
- **Joint:** priced on the younger spouse's age.
- **Deferrals shown:** 0–10 years. Deferrals of 11–15 years are kept in the file but return "hold".
- **Premium:** income scales in proportion to premium.

### Why deferrals over 10 years are held

Deferrals of 0–10 years were quoted on Nov 10–11, 2026. Deferrals of 11–15 years come from an earlier batch (Nov 9) with a different product mix. At ages 60 and 65 the 11-year joint figure is lower than the 10-year figure. Deferrals over 10 years are held until they're checked against current carrier illustrations.

## Updating rates

Rates are rebuilt from the private master workbook with a one-step script, which also checks the data. The new file gets a new date-stamped name and manifest, and the funnel is pointed at the new file and integrity value. Older rate files stay in place for the record.
