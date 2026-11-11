# retirementum-calc

Finished files for the RetireMentum Perspective funnel: the calculator, the published payout rates, and the payout lookup. Carrier names, product details, test cases and working notes are not kept here.

## Files

| File | What it is |
|---|---|
| `rm-calc-1.0.0.min.js` | Calculation core (tax, Social Security, required distributions, year-by-year cash flow) |
| `rm-payout-2026-11-11.json` | Lifetime income per $100,000 by issue age, single or joint, and years of deferral |
| `rm-payout-lookup-1.0.0.js` | Turns a prospect's age(s), deferral and premium into an income estimate using a payout file |
| `*.manifest.json` | Version, SHA-384 integrity hash and verification notes for each file |

## Release rules

- Each release is a versioned file that never changes. A fix or a rate update ships as a new file.
- The funnel loads each file with its SHA-384 integrity value, so a browser refuses any copy that differs from the tested one.
- `.nojekyll` tells GitHub Pages to serve files exactly as stored.

## How the funnel uses the payout files

```js
const table = await fetch(
  "https://gary832.github.io/retirementum-calc/rm-payout-2026-11-11.json",
  { integrity: "<integrity from rm-payout-2026-11-11.manifest.json>" }
).then(r => r.json());

const est = RMPayout.estimate(table, { age: 62, spouseAge: null, deferral: 5, premium: 250000 });
// est.status is "ok", "hold" or "unavailable"
// When "ok": est.annual, est.monthly, est.monthlyExact, est.incomeStartAge, est.method, est.quotesFrom, est.quotesTo
```

Pass `est.monthlyExact` to the calculator's income layer as the monthly income, so 12 × monthly equals the annual figure exactly. Use `est.incomeStartAge` as the income start age. Build the disclosure date line from `est.quotesFrom` and `est.quotesTo`, so the disclosure always matches the rates in use.

## Payout rules (release 2026-11-11)

- **Representative figure:** the middle annual payout of the three highest quotes for each issue age, single or joint, and deferral.
- **Quoted issue ages:** 55, 60, 65 and 70, with deferrals of 0–15 years.
- **Ages between quoted ages (56–69):** a straight-line estimate between the two nearest quoted ages at the same deferral.
- **Outside 55–70:** unavailable. There's no extrapolation past the oldest quoted age. Age-75 quotes are planned, and when they're added ages 71–74 will be estimated between 70 and 75.
- **Joint:** priced on the younger spouse's age.
- **Deferrals shown:** 0–10 years. Deferrals of 11–15 years are kept in the file but return "hold" (see below).
- **Premium:** income scales in proportion to premium.

### Why deferral 11 is held

Deferrals of 0–10 years were quoted on Nov 10–11, 2026. Deferrals of 11–15 years come from an earlier batch (Nov 9) with a different product mix. At ages 60 and 65 the 11-year joint figure is lower than the 10-year figure. Deferrals of 12–15 years are held until they're checked against current carrier illustrations.

## Updating rates

Rates are rebuilt from the private master workbook with a one-step script, which also checks the data. The new file gets a new date-stamped name and manifest, and the funnel is pointed at the new file and integrity value. Older rate files stay in place for the record.
