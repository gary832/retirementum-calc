// Option C differentiation, with assertions. Exits 1 on failure.
// Expected: B < C at 25% < C at 50% in added income, and the withdrawal rate does not rise from B to C,
// except where B already reaches the cap: then B, C25 and C50 must be identical and C must be marked equal to B.
const fs = require('fs');
const E = require('./load.js');
const SEL = require('./rm-select.js');
const { household, profiles } = require('./households.js');
const S = SEL.make(E, E.rates);

const rows = [], fails = [];
for (const [k, p] of Object.entries(profiles)) {
  const a = household(p.a);
  const sc25 = S.screen(a, 0.25), sc50 = S.screen(a, 0.5);
  const B = sc50.B, C25 = sc25.C, C50 = sc50.C;
  const inc = r => r.layer ? r.layer.annualIncome : 0, rate = r => r.after.rate;
  const tie = B.status === 'capped';
  const row = { household: k, label: p.label, reportYear: B.basis.reportYear, bCapped: tie,
    monthly: { B: Math.round(inc(B) / 12), C25: Math.round(inc(C25) / 12), C50: Math.round(inc(C50) / 12) },
    rate: { A: sc50.A.after.rate, B: rate(B), C25: rate(C25), C50: rate(C50) },
    shareOfSavings: { C50: C50.layer ? C50.layer.shareOfAssets : 0 }, equalTo: { C25: C25.equalTo, C50: C50.equalTo } };
  rows.push(row);
  if (tie) {
    if (!(inc(B) === inc(C25) && inc(C25) === inc(C50))) fails.push(`${k}: B capped but B/C25/C50 income differ`);
    if (C25.equalTo !== 'B' || C50.equalTo !== 'B') fails.push(`${k}: B capped but C not marked equal to B`);
  } else {
    if (!(inc(B) < inc(C25) && inc(C25) < inc(C50))) fails.push(`${k}: expected B < C25 < C50 income, got ${inc(B)}, ${inc(C25)}, ${inc(C50)}`);
    if (!(rate(C25) <= rate(B) + 1e-12 && rate(C50) <= rate(C25) + 1e-12)) fails.push(`${k}: withdrawal rate rose from B to C`);
    if (C25.equalTo || C50.equalTo) fails.push(`${k}: C marked equal to B without a cap`);
  }
}
const expectTies = ['highWithdrawal'];
const ties = rows.filter(r => r.bCapped).map(r => r.household);
if (JSON.stringify(ties) !== JSON.stringify(expectTies)) fails.push(`expected cap ties ${expectTies}, got ${ties}`);

fs.writeFileSync(__dirname + '/option-c-results.json', JSON.stringify({ engine: E.pin, rows, fails }, null, 1));
for (const r of rows) console.log(`${r.household.padEnd(15)} B ${r.monthly.B}  C25 ${r.monthly.C25}  C50 ${r.monthly.C50} /mo${r.bCapped ? '  (B capped: tie expected)' : ''}`);
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'Option C: all assertions pass');
process.exit(fails.length ? 1 : 0);
