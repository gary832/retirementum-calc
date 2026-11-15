// rm-select 0.2 acceptance suite. Exits 1 if any check fails (2 if the engine files don't match the pin).
// node suite.js --repo=<retirementum-calc clone at e331e24>   Writes suite-results.json.
const fs = require('fs');
const E = require('./load.js');
const SEL = require('./rm-select.js');
const REC = require('./rm-record.js');
const { household, profiles } = require('./households.js');

const S = SEL.make(E, E.rates);
const TOL = S.tolerance;
const checks = [];
const t = (group, name, ok, detail) => checks.push({ group, name, ok: !!ok, detail: ok ? undefined : detail });
const r0 = n => Math.round(n);

// Households: the eight review fixtures plus edge cases.
const extra = {
  brokerHeavy:   household({ iraC: 150000, iraS: 50000, rothC: 0, brokerage: 800000 }),
  reviewer50k:   household({ iraC: 50000, iraS: 0, rothC: 0, brokerage: 1150000 }),
  brokerOnly:    household({ iraC: 0, iraS: 0, rothC: 0, brokerage: 1000000 }),
  tradToRoth:    household({ iraC: 200000, iraS: 0, rothC: 400000, brokerage: 200000 }),
  surplus:       household({ ss: 5000, ssS: 5000, spendTotal: 6000 }),
  zeroAssets:    household({ iraC: 0, iraS: 0, rothC: 0, brokerage: 0 }),
  tinyAssets:    household({ iraC: 1000, iraS: 0, rothC: 0, brokerage: 0 }),
  young:         household({ age: 50, ageS: 50, retAge: 52, retAgeS: 52 }),
  planConfirmed: household({ iraC: 0, iraS: 0, rothC: 0, planC: 700000, brokerage: 200000, planFormer: true, planReleaseOk: true, planEligibleAmt: 300000 }),
  planUnknown:   household({ iraC: 0, iraS: 0, rothC: 0, planC: 700000, brokerage: 200000, planFormer: true, planReleaseOk: true }),
  taxRefSingle:  household({ two: false, ageS: null, age: 66, retired: true, retAge: 66, ssStatus: 'zero', ss: 0, ssClaim: 67,
                             spendTotal: 5000, essentialShare: 70, iraC: 800000, iraS: 0, rothC: 0, rothS: 0, brokerage: 0 }),
  taxRefJoint:   household({ age: 66, ageS: 66, retired: true, retiredS: true, retAge: 66, retAgeS: 66, ssStatus: 'zero', ssStatusS: 'zero', ss: 0, ssS: 0,
                             spendTotal: 7000, essentialShare: 70, iraC: 600000, iraS: 400000, rothC: 0, rothS: 0, brokerage: 0 }),
  allRoth:       household({ iraC: 0, iraS: 0, rothC: 900000, rothS: 300000, brokerage: 0 })
};
const fixtures = Object.assign({}, Object.fromEntries(Object.entries(profiles).map(([k, p]) => [k, household(p.a)])), extra);

// ---------- helpers ----------
const ASSETS = a => E.RMCalc.stateOf(a).ASSETS;
function surplusOf(s) { const lhs = s.essential + s.discretionary + s.tax, rhs = s.guaranteed + s.fromPortfolio; return s.fromPortfolio <= TOL ? Math.max(0, rhs - lhs) : 0; }

function reconcile(fx, tag, r) {
  const g = 'reconcile';
  const a = r.after, b = r.before;
  if (a.fromPortfolio == null || b.fromPortfolio == null) {
    // Savings can't cover the year: the engine leaves the withdrawal and rate unresolved and reports what is uncovered.
    t(g, `${fx} ${tag}: unresolved year → rate null, state not ok, uncovered amount reported`, a.rate === null && a.rateState !== 'ok' && a.uncovered > 0, { state: a.rateState, uncovered: a.uncovered });
    return;
  }
  const lhs = a.essential + a.discretionary + a.tax, rhs = a.guaranteed + a.fromPortfolio, sur = surplusOf(a);
  t(g, `${fx} ${tag}: need + tax + surplus = reliable income + withdrawal`,
    a.fromPortfolio > TOL ? Math.abs(lhs - rhs) <= TOL : rhs - lhs >= -TOL, { lhs: r0(lhs), rhs: r0(rhs), surplus: r0(sur) });
  t(g, `${fx} ${tag}: reliable = SS + other + layer`, Math.abs(a.socialSecurity + a.otherIncome + a.layerIncome - a.guaranteed) <= TOL);
  t(g, `${fx} ${tag}: tax split adds up`, Math.abs(a.essentialTax + a.discretionaryTax - a.tax) <= TOL);
  t(g, `${fx} ${tag}: spending and SS unchanged`, Math.abs(a.essential - b.essential) <= TOL && Math.abs(a.discretionary - b.discretionary) <= TOL && Math.abs(a.socialSecurity - b.socialSecurity) <= TOL);
  if (r.layer) {
    const drop = b.fromPortfolio - a.fromPortfolio, dTax = a.tax - b.tax, dSur = sur - surplusOf(b);
    t(g, `${fx} ${tag}: withdrawal drop = layer - extra tax - extra surplus`, Math.abs(drop - (a.layerIncome - dTax - dSur)) <= TOL,
      { drop: r0(drop), layer: r0(a.layerIncome), dTax: r0(dTax), dSurplus: r0(dSur) });
    // Payout cross-check: each funding group priced independently through the lookup.
    const st = E.RMCalc.stateOf(fixtures[fx]);
    const base = E.RMBox.run(fixtures[fx], E.rates, { mode: 'none' });
    const est = p => E.RMPayout.estimate(E.rates, { age: Number(st.ageNow), spouseAge: st.spouseOn ? Number(st.ageS) : null, deferral: base.deferral, premium: p }).annual;
    const whole = est(r.layer.premium);
    t(g, `${fx} ${tag}: layer income = payout lookup (within $1 per funding group)`, Math.abs(whole - r.layer.annualIncome) <= r.layer.taxTypes.length, { lookup: whole, engine: r.layer.annualIncome });
    // Funding: aggregate per account, eligible accounts only, workplace plans within the confirmed amount, within the cap.
    const assets = ASSETS(fixtures[fx]), byAid = Object.fromEntries(assets.map(x => [x.aid, x]));
    const per = {};
    r.layer.fund.forEach(f => { per[f.aid] = (per[f.aid] || 0) + f.amt; });
    const total = Object.values(per).reduce((s, v) => s + v, 0);
    const answers = fixtures[fx];
    const okAgg = Object.entries(per).every(([aid, amt]) => {
      const acct = byAid[aid];
      if (!acct || acct.cls === 'at' || acct.type === 'inh') return false;
      if (amt > Number(acct.bal) + TOL) return false;
      if (acct.type === 'plan') { const conf = acct.own === 's' ? answers.planEligibleAmtS : answers.planEligibleAmt; return conf != null && amt <= conf + TOL; }
      return true;
    });
    t(g, `${fx} ${tag}: funding totals per account within balance / confirmed plan amount; never brokerage`, okAgg && Math.abs(total - r.layer.premium) <= TOL, per);
    t(g, `${fx} ${tag}: premium within cap`, r.layer.premium <= r.limit.cap, { premium: r.layer.premium, cap: r.limit.cap });
  }
}

// ---------- 1. Reconciliation across fixtures and options ----------
const settings = [{ option: 'A' }, { option: 'B' }, { option: 'C', cShare: 0.25 }, { option: 'C', cShare: 0.5 }, { option: 'D', dMonthlyToday: 1500 }, { option: 'D', dMonthlyToday: 6000 }];
const tagOf = s => s.option + (s.cShare != null ? '@' + s.cShare : '') + (s.dMonthlyToday != null ? '@' + s.dMonthlyToday : '');
for (const [fx, a] of Object.entries(fixtures)) for (const s of settings) {
  const r = S.select(a, s);
  if (!r.before) {
    t('reconcile', `${fx} ${tagOf(s)}: ${fx === 'zeroAssets' ? 'no accounts → baseline error with the engine message' : 'baseline computed'}`,
      fx === 'zeroAssets' && r.status === 'error' && r.reason.code === 'baseline_failed', r.reason);
    continue;
  }
  reconcile(fx, tagOf(s), r);
  t('contract', `${fx} ${tagOf(s)}: one result shape`, ['ok', 'capped', 'no_layer', 'unavailable', 'invalid_input', 'error'].includes(r.status) && r.schema === 'rm-select-result/1' && r.basis && r.versions, r.status);
  t('contract', `${fx} ${tagOf(s)}: no internal oversize request anywhere in the result`, !JSON.stringify(r).includes('100000000'));
  t('contract', `${fx} ${tagOf(s)}: display text has no advisor or booking prompt`, !/advisor|book|schedule/i.test(JSON.stringify(r.reason || '')), r.reason);
  t('contract', `${fx} ${tagOf(s)}: additional_income_layer matches layer`, r.additional_income_layer === !!(r.layer && r.layer.premium > 0));
}

// ---------- 2. Option D sizing contract ----------
const D = (a, m) => S.select(a, { option: 'D', dMonthlyToday: m });
for (const [fx, a] of Object.entries(fixtures)) {
  for (const m of [500, 1500, 3000, 6000, 20000]) {
    const r = D(a, m), g = 'option D', gl = r.goal;
    if (!gl || r.status === 'unavailable' || r.status === 'no_layer' || r.status === 'error') {
      t(g, `${fx} D@${m}: non-modeled outcome has a reason and keeps the baseline`, r.reason && r.reason.code && r.after === r.before && !r.layer, r.status);
      continue;
    }
    const factor = Math.pow(1 + r.basis.inflation, r.basis.reportYear - r.basis.asOfYear);
    t(g, `${fx} D@${m}: goal converted with the engine's as-of year and inflation`, gl.annualReportYear === Math.round(m * 12 * factor) && r.basis.asOfYear === Number(E.RMCalc.stateOf(a).ASOF), { got: gl.annualReportYear, factor });
    t(g, `${fx} D@${m}: effective goal = min(goal, need)`, gl.effectiveAnnual === Math.round(Math.min(gl.annualReportYear, r.before.fromPortfolio)));
    const benefit = r.before.fromPortfolio - r.after.fromPortfolio;
    if (r.status === 'ok') {
      t(g, `${fx} D@${m}: chosen premium meets the goal`, gl.met && benefit >= gl.effectiveAnnual - TOL - 0.5, { benefit: r0(benefit), goal: gl.effectiveAnnual });
      t(g, `${fx} D@${m}: the $1,000 step below fails`, gl.verification.previousPremium === 0 || gl.verification.previousMeets === false, gl.verification);
      t(g, `${fx} D@${m}: no premium estimate when the goal is met`, gl.premiumEstimate === null);
      if (gl.aboveNeed) t(g, `${fx} D@${m}: above need → withdrawal replaced within $1`, r.after.fromPortfolio <= TOL && r.reason.code === 'goal_above_need');
    } else if (r.status === 'capped') {
      t(g, `${fx} D@${m}: capped → layer at the cap, feasible below goal`, r.layer.premium === r.limit.cap && gl.feasibleAnnualAfterTax < gl.effectiveAnnual - TOL && r.limit.reached, { cap: r.limit.cap, feasible: gl.feasibleAnnualAfterTax });
      t(g, `${fx} D@${m}: capped → entered goal, feasible amount, limit and reason all present`, gl.monthlyToday === m && gl.feasibleMonthlyToday >= 0 && ['assets', 'retirement_accounts'].includes(r.limit.binding) && /^cap_/.test(r.reason.code));
      t(g, `${fx} D@${m}: premium estimate marked approximate and positive`, gl.premiumEstimate && gl.premiumEstimate.approximate === true && gl.premiumEstimate.amount > r.limit.cap);
    }
  }
  // Exact-need boundary: a goal equal to the whole withdrawal.
  const base = S.select(a, { option: 'A' });
  if (base.before && base.before.fromPortfolio > TOL) {
    const exact = base.before.fromPortfolio / 12 / base.basis.goalFactor;
    const r = D(a, Math.round(exact * 100) / 100);
    if (r.status === 'ok') t('option D', `${fx} D@exact need: withdrawal replaced within $1, verified`, r.after.fromPortfolio <= TOL + 1 && r.goal.verification.previousMeets === false, { left: r0(r.after.fromPortfolio) });
    else t('option D', `${fx} D@exact need: capped or not modeled, with reason`, !!r.reason, r.status);
  }
}
// Invalid and formatted inputs.
for (const v of ['abc', '', '-5', -5, 0, '0', '1e9', 'NaN', null, undefined, 100001, '12.345', '2,000.50x']) {
  const r = D(fixtures.sample, v);
  t('option D', `input ${JSON.stringify(v)} → invalid_input, baseline kept`, r.status === 'invalid_input' && r.reason.code === 'invalid_goal' && r.after === r.before && !r.layer, r.status);
}
for (const [v, m] of [['2,000.50', 2000.5], ['$3,500', 3500], [' 1500 ', 1500], [2500, 2500]]) {
  const r = D(fixtures.sample, v);
  t('option D', `input ${JSON.stringify(v)} → parsed as ${m}`, r.goal && r.goal.monthlyToday === m && ['ok', 'capped'].includes(r.status), r.status);
}
// Reviewer cases.
{
  const r = D(fixtures.reviewer50k, 3000);
  t('option D', 'reviewer: $50k eligible + $1.15M brokerage → capped by retirement accounts at $50,000', r.status === 'capped' && r.limit.cap === 50000 && r.limit.binding === 'retirement_accounts' && r.reason.code === 'cap_accounts', r.limit);
  const r2 = D(fixtures.brokerOnly, 3000);
  t('option D', 'reviewer: brokerage only → no_layer, no_eligible_funds, no estimate', r2.status === 'no_layer' && r2.reason.code === 'no_eligible_funds' && !r2.goal.premiumEstimate && !r2.layer, r2.status);
  const r3 = D(fixtures.surplus, 2000);
  t('option D', 'reliable income covers all spending → no_layer, no_withdrawal_need', r3.status === 'no_layer' && r3.reason.code === 'no_withdrawal_need', r3.status);
  const d3 = REC.display(S.select(fixtures.surplus, { option: 'A' }));
  t('reference', 'no withdrawal needed (rate state zero) → shown as None needed, not Not available', d3.rateText === 'None needed' && d3.savingsCoverYear && d3.fromSavings === 0, d3);
}
// Pricing errors and unavailable payouts.
function stubbed(failOn) {
  let n = 0;
  const box = { version: E.RMBox.version, run(a, tb, o) {
    if (o && o.mode === 'premium') { n++; if (failOn(n)) return failOn.kind === 'throw' ? (() => { throw new Error('stub'); })() : failOn.kind === 'partial' ? { status: 'ok', layer: null } : { status: 'error', code: 'stub_error' }; }
    return E.RMBox.run(a, tb, o);
  } };
  return SEL.make({ RMBox: box, RMCalc: E.RMCalc }, E.rates);
}
for (const kind of ['error', 'throw', 'partial']) for (const k of [1, 2, 4]) {
  const f = n => n === k; f.kind = kind;
  let r, threw = false;
  try { r = stubbed(f).select(fixtures.sample, { option: 'D', dMonthlyToday: 2000 }); } catch (e) { threw = true; }
  t('failure', `pricing ${kind} on engine call ${k} → error result, baseline kept, no exception`, !threw && r.status === 'error' && r.before && r.after === r.before && !r.layer && r.reason, threw ? 'threw' : r && r.status);
}
{
  const N = SEL.make(E, null);
  for (const o of ['B', 'C', 'D']) {
    const r = N.select(fixtures.sample, { option: o, dMonthlyToday: 2000 });
    t('failure', `rate table missing → ${o} unavailable, baseline kept`, r.status === 'unavailable' && r.reason.code === 'payout_unavailable' && r.after === r.before);
  }
  t('failure', 'rate table missing → A still complete', N.select(fixtures.sample, { option: 'A' }).status === 'ok');
  for (const o of ['B', 'C', 'D']) {
    const r = S.select(fixtures.young, { option: o, dMonthlyToday: 2000 });
    t('failure', `age outside payout table → ${o} unavailable`, r.status === 'unavailable', r.status);
  }
}

// ---------- 3. Monotonic benefit (the search's assumption), across a Traditional → Roth funding switch ----------
for (const fx of ['sample', 'tradToRoth', 'pension', 'affluent']) {
  const a = fixtures[fx], base = E.RMBox.run(a, E.rates, { mode: 'none' });
  const probe = E.RMBox.run(a, E.rates, { mode: 'premium', premium: 1000 });
  const cap = Math.min(probe.funding.assetCap, probe.funding.eligibleCap);
  const grid = [];
  for (let p = 1000; p <= cap; p += (fx === 'tradToRoth' && p >= 180000 && p < 220000) ? 1000 : 10000) grid.push(p);
  if (grid.at(-1) !== cap) grid.push(cap);
  let prev = -Infinity, worst = null, types = new Set();
  for (const p of grid) {
    const r = E.RMBox.run(a, E.rates, { mode: 'premium', premium: p });
    r.layer.layers.forEach(x => types.add(x.taxType));
    const b = base.before.fromPortfolio - r.after.fromPortfolio;
    if (b < prev - TOL && !worst) worst = { premium: p, benefit: r0(b), prev: r0(prev) };
    prev = Math.max(prev, b);
  }
  t('monotonic', `${fx}: benefit never falls as premium rises (${grid.length} points, funding ${[...types].join('+')})`, !worst, worst);
}

// ---------- 4. B / C limits, equal outcomes, C sizing formula ----------
const perDollarOf = a => { const st = E.RMCalc.stateOf(a), base = E.RMBox.run(a, E.rates, { mode: 'none' });
  const u = E.RMPayout.estimate(E.rates, { age: Number(st.ageNow), spouseAge: st.spouseOn ? Number(st.ageS) : null, deferral: base.deferral, premium: E.rates.premium_basis });
  return u.status === 'ok' ? u.annual / E.rates.premium_basis : null; };
const up = x => Math.ceil(x / 1000) * 1000;
for (const [fx, a] of Object.entries(fixtures)) {
  const rawB = E.RMBox.run(a, E.rates, { mode: 'essential' });
  if (!rawB.funding || rawB.status === 'no_estimate') continue;
  const cap = Math.min(rawB.funding.assetCap, rawB.funding.eligibleCap), pd = perDollarOf(a), wants = rawB.before.discretionary;
  for (const share of [0.25, 0.5]) {
    const r = S.select(a, { option: 'C', cShare: share });
    if (!r.layer) { t('C formula', `${fx} C@${share}: no layer has a reason`, !!r.reason, r.status); continue; }
    let expected;
    if (rawB.status === 'no_gap') expected = Math.min(cap, up(share * wants / pd));
    else if (rawB.sizing.requiredPremium == null) expected = cap;
    else expected = Math.min(cap, up(rawB.sizing.requiredPremium * 1.05 + share * wants / pd));
    t('C formula', `${fx} C@${share}: premium = min(cap, round-up(required x 1.05 + share x discretionary / payout))`, r.layer.premium === expected, { got: r.layer.premium, expected });
    t('C formula', `${fx} C@${share}: capped flag matches the formula`, (r.status === 'capped') === (expected === cap && (rawB.sizing.requiredPremium == null || up(rawB.sizing.requiredPremium * 1.05 + share * wants / pd) > cap)), r.status);
  }
}
{
  const hw = S.screen(fixtures.highWithdrawal);
  t('B/C limits', 'B capped → C marked equal to B, same premium, reason same_as_B with the limit', hw.C.equalTo === 'B' && hw.C.layer.premium === hw.B.layer.premium && hw.C.reason.code === 'same_as_B' && /half of your savings/.test(hw.C.reason.text));
  t('B/C limits', 'B capped → remaining essential gap reported', hw.B.status === 'capped' && hw.B.limit.remainingEssentialGap > 0, hw.B.limit);
  const sm = S.screen(fixtures.sample);
  t('B/C limits', 'sample → C not marked equal to B', sm.C.equalTo === null && sm.C.layer.premium > sm.B.layer.premium);
  const bh = S.select(fixtures.brokerHeavy, { option: 'B' });
  t('B/C limits', 'eligible accounts below 50% → cap = accounts, reason cap_accounts', bh.limit.binding === 'retirement_accounts' && bh.limit.cap === 200000 && bh.reason && bh.reason.code === 'cap_accounts', bh.limit);
  const pc = S.select(fixtures.planConfirmed, { option: 'C', cShare: 0.5 });
  t('B/C limits', 'confirmed $300k of a $700k plan → funds at most $300k from it', pc.layer && pc.layer.premium <= 300000 && pc.limit.eligibleCap === 300000, pc.limit);
  const pu = S.select(fixtures.planUnknown, { option: 'B' });
  t('B/C limits', 'unconfirmed plan amount → plan left out, no eligible funds', pu.status === 'no_layer' && pu.reason.code === 'no_eligible_funds' && pu.limit.excludedPlans.some(x => x.reason === 'amount_unknown'), pu.limit);
  const bo = S.select(fixtures.brokerOnly, { option: 'B' });
  t('B/C limits', 'zero eligible balance → B no_layer, no_eligible_funds', bo.status === 'no_layer' && bo.reason.code === 'no_eligible_funds');
  const sp = S.select(fixtures.surplus, { option: 'B' });
  t('B/C limits', 'reliable income covers essentials → B no_layer, essentials_covered', sp.status === 'no_layer' && sp.reason.code === 'essentials_covered', sp.status);
}

// ---------- 5. Reference checks ----------
// Federal tax, 2026 (IRS Rev. Proc. 2025-32): typed here independently of the engine, so the engine's tax is checked against it.
const FED = { single: { sd: 16100, aged: 2050, br: [[12400, .10], [50400, .12], [105700, .22], [201775, .24]] },
              mfj:    { sd: 32200, aged: 1650, br: [[24800, .10], [100800, .12], [211400, .22], [403550, .24]] } };
const SENIOR = { amt: 6000, rate: 0.06, start: { single: 75000, mfj: 150000 } };   // OBBBA senior deduction, 2025-2028
function fedTax(agi, filing, n65) {
  const f = FED[filing];
  const senior = n65 * Math.max(0, SENIOR.amt - SENIOR.rate * Math.max(0, agi - SENIOR.start[filing]));
  const taxable = Math.max(0, agi - f.sd - n65 * f.aged - senior);
  let tax = 0, lo = 0;
  for (const [hi, rate] of f.br) { if (taxable <= lo) break; tax += (Math.min(taxable, hi) - lo) * rate; lo = hi; }
  return tax;
}
for (const [fx, filing, n65] of [['taxRefSingle', 'single', 1], ['taxRefJoint', 'mfj', 2]]) {
  const r = S.select(fixtures[fx], { option: 'A' });
  // All money is in Traditional IRAs, no Social Security, Texas: the whole withdrawal is ordinary income.
  const ref = fedTax(r.before.fromPortfolio, filing, n65);
  t('reference', `${fx}: engine tax matches an independent 2026 federal calculation (report year ${r.basis.reportYear})`,
    r.basis.reportYear === 2026 && Math.abs(r.before.tax - ref) <= 2, { engine: r0(r.before.tax), reference: r0(ref), withdrawal: r0(r.before.fromPortfolio) });
}
for (const o of [{ option: 'A' }, { option: 'B' }, { option: 'C' }, { option: 'D', dMonthlyToday: 2500 }]) {
  const r = S.select(fixtures.allRoth, o);
  t('reference', `all-Roth household ${o.option}: tax is $0`, r.after.tax <= TOL, r0(r.after.tax));
}
// Withdrawal-rate denominator: when the report year is the as-of year, rate = withdrawal / (investable assets - premium).
for (const fx of ['lowWithdrawal', 'single', 'highWithdrawal']) for (const o of [{ option: 'A' }, { option: 'B' }, { option: 'C' }, { option: 'D', dMonthlyToday: 1000 }]) {
  const r = S.select(fixtures[fx], o);
  if (r.basis.reportYear !== r.basis.asOfYear) { t('reference', `${fx}: fixture is a same-year case`, false, r.basis); continue; }
  const prem = r.layer ? r.layer.premium : 0, ref = r.after.fromPortfolio / (r.assets - prem);
  t('reference', `${fx} ${o.option}: rate = withdrawal / (assets - premium) in the as-of year`, Math.abs(r.after.rate - ref) < 1e-9, { engine: r.after.rate, reference: ref });
}
// Nullable rate.
{
  const r = S.select(fixtures.tinyAssets, { option: 'A' });
  const d = REC.display(r);
  t('reference', '$1,000 of savings → rate and withdrawal null, state unresolved, shown as Not available with the uncovered amount',
    r.before.rate === null && r.before.fromPortfolio === null && r.before.rateState !== 'ok' && d.rateText === 'Not available' && !d.savingsCoverYear && d.uncovered > 0,
    { rate: r.before.rate, state: r.before.rateState, uncovered: d.uncovered });
  const rd = S.select(fixtures.tinyAssets, { option: 'D', dMonthlyToday: 1000 });
  t('reference', 'unresolved year → Option D unavailable (savings_unresolved), not "no withdrawal needed"', rd.status === 'unavailable' && rd.reason.code === 'savings_unresolved', rd.reason);
}
// Timing: report year = first year all income is on; the layer starts at retirement.
for (const [fx, a] of Object.entries(fixtures)) {
  const r = S.select(a, { option: 'A' });
  if (!r.basis) continue;
  const st = E.RMCalc.stateOf(a);
  t('reference', `${fx}: report year - as-of year = report age - age now`, r.basis.reportYear - r.basis.asOfYear === r.basis.reportAge - r.basis.ageNow, r.basis);
  t('reference', `${fx}: layer starts at retirement, report age is on or after it`, r.basis.layerStartAge === Number(st.ageRet) && r.basis.reportAge >= r.basis.layerStartAge, { start: r.basis.layerStartAge, ret: st.ageRet, report: r.basis.reportAge });
}
t('reference', 'highDisc: retires at 62, Social Security at 67 → layer starts 62, report age 67', (() => { const r = S.select(fixtures.highDisc, { option: 'A' }); return r.basis.layerStartAge === 62 && r.basis.reportAge === 67; })());

// ---------- 6. Selector → saved record → Snapshot ----------
function session() { const store = {}; return { set: (k, v) => { store[k] = JSON.stringify(v); }, get: k => store[k] == null ? null : JSON.parse(store[k]) }; }
const throwingEngine = SEL.make({ RMBox: { version: 'x', run() { throw new Error('Snapshot must not call the engine'); } }, RMCalc: E.RMCalc }, E.rates);
const cases = [
  ['A via link', fixtures.sample, { option: 'A' }, 'link'],
  ['A via card', fixtures.sample, { option: 'A' }, 'card'],
  ['B layered', fixtures.sample, { option: 'B' }, 'card'],
  ['C capped (equal to B)', fixtures.highWithdrawal, { option: 'C', cShare: 0.5 }, 'card'],
  ['D met', fixtures.sample, { option: 'D', dMonthlyToday: '2,000' }, 'card'],
  ['D capped', fixtures.sample, { option: 'D', dMonthlyToday: 4000 }, 'card'],
  ['D unavailable', fixtures.young, { option: 'D', dMonthlyToday: 2000 }, 'card'],
  ['null rate', fixtures.tinyAssets, { option: 'A' }, 'card']
];
for (const [label, a, sel, path] of cases) {
  const shown = S.select(a, sel);
  const store = session();
  store.set('rm.v2.record', REC.save(a, sel, shown, { selectionPath: path, savedAt: '2026-11-15T20:00:00Z', engineCommit: E.pin.commit }));
  // "Verification and reload": a new page reads the stored record; the engine is not available to it.
  const rec = store.get('rm.v2.record');
  void throwingEngine;
  const snap = REC.snapshot(rec), disp = REC.display(shown);
  const same = Object.keys(disp).every(k => JSON.stringify(disp[k]) === JSON.stringify(snap[k]));
  t('round trip', `${label}: Snapshot from the stored record shows the same figures as the selector`, same, Object.keys(disp).filter(k => JSON.stringify(disp[k]) !== JSON.stringify(snap[k])));
  t('round trip', `${label}: record holds option, layer flag, path, inputs, engine and payout versions`,
    rec.selected_option === sel.option && rec.additional_income_layer === !!shown.additional_income_layer && rec.selection_path === path &&
    rec.inputs && rec.versions.rmBox === '1.0.5' && rec.versions.rmCalc === '2.0.0' && rec.versions.engineCommit === E.pin.commit && 'payoutRelease' in rec.versions);
  t('round trip', `${label}: same dollar basis, scenario tax, withdrawal and rate on both`, snap.dollars === disp.dollars && snap.tax === disp.tax && snap.fromSavings === disp.fromSavings && snap.rateText === disp.rateText);
  // The shared display model must itself show the chosen scenario's engine figures (not the current plan's).
  const ar = shown.after;
  if (ar) t('round trip', `${label}: displayed figures equal the engine result for the chosen option`,
    snap.fromSavings === (ar.fromPortfolio == null ? null : Math.round(ar.fromPortfolio)) && snap.tax === Math.round(ar.tax) &&
    snap.addedIncome === Math.round(ar.layerIncome) && snap.spending === Math.round(ar.essential + ar.discretionary) &&
    snap.reliableIncome === Math.round(ar.socialSecurity + ar.otherIncome) &&
    snap.rate === (ar.rate == null ? null : Math.round(ar.rate * 10000) / 100) && snap.premium === (shown.layer ? shown.layer.premium : 0) &&
    snap.year === shown.basis.reportYear, snap);
  // Reload recompute: re-running the stored inputs on the same engine reproduces the stored result exactly.
  const again = S.select(rec.inputs.answers, rec.inputs.selection);
  t('round trip', `${label}: re-running stored inputs reproduces the stored result`, JSON.stringify(again) === JSON.stringify(rec.result));
}
{
  const r = S.select(fixtures.sample, { option: 'A' }), rec = REC.save(fixtures.sample, { option: 'A' }, r, { selectionPath: 'link' });
  const snap = REC.snapshot(JSON.parse(JSON.stringify(rec)));
  t('round trip', 'Option A: selected_option A, additional_income_layer false, complete baseline Snapshot',
    rec.selected_option === 'A' && rec.additional_income_layer === false && snap.status === 'ok' && snap.addedIncome === 0 && snap.fromSavings === Math.round(r.before.fromPortfolio) && snap.rateText !== 'Not available');
  // Option change: Change my choice → new run, new record replaces the old one.
  const store = session();
  store.set('rm.v2.record', REC.save(fixtures.sample, { option: 'B' }, S.select(fixtures.sample, { option: 'B' }), {}));
  const changed = S.select(fixtures.sample, { option: 'C' });
  store.set('rm.v2.record', REC.save(fixtures.sample, { option: 'C' }, changed, {}));
  const snap2 = REC.snapshot(store.get('rm.v2.record'));
  t('round trip', 'Change my choice B → C: the Snapshot shows C', snap2.option === 'C' && snap2.premium === changed.layer.premium);
}

// ---------- report ----------
const fail = checks.filter(c => !c.ok);
const byGroup = {};
checks.forEach(c => { byGroup[c.group] = byGroup[c.group] || { pass: 0, fail: 0 }; byGroup[c.group][c.ok ? 'pass' : 'fail']++; });
fs.writeFileSync(__dirname + '/suite-results.json', JSON.stringify({ engine: E.pin, rmSelect: SEL.version, pass: checks.length - fail.length, fail: fail.length, byGroup, checks }, null, 1));
console.log(JSON.stringify(byGroup));
console.log(`pass ${checks.length - fail.length}  fail ${fail.length}`);
fail.slice(0, 40).forEach(c => console.log('FAIL', c.group, '|', c.name, '|', JSON.stringify(c.detail)));
process.exit(fail.length ? 1 : 0);
