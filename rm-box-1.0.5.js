/*! rm-box 1.0.5 | RetireMentum "calc in a box": intake answers + payout table -> report figures.
 *  Needs rm-calc 2.0.0 (LayerWise v27.1.0) as window.RMCalc. The payout lookup (rm-payout-lookup 1.0.0, window.RMPayout) and the
 *  rate table are needed only for the income-layer comparison: the baseline snapshot works without them.
 *  Self-service funding (decided 2026-11-12): traditional IRAs first, then eligible workplace plans, then Roth IRAs. Brokerage and
 *  other after-tax money is never used here: a premium that would need it is capped and routed to an advisor.
 *  Workplace plans (1.0.5): being retired never makes a plan eligible by itself. A plan can fund the layer only for an owner who
 *  (a) no longer works for that employer and whose plan administrator has confirmed money can be rolled out now, or (b) still works
 *  there, is at least 59 1/2 and has confirmed the plan allows in-service rollovers. Either way the owner must also confirm how much
 *  of the pre-tax balance is available now; only that amount can fund the layer. The full balance stays in the baseline and in
 *  investable assets (and so in the 50% cap). An unknown amount leaves the plan out of automatic funding.
 *  Sizing (essential modes): find the smallest whole $1,000 premium whose layer covers essential spending and its tax in the report
 *  year, then add the 5% cushion (and, in essential_plus, 25% of discretionary spending). The advisor CTA appears only when a cap
 *  leaves part of the essential gap open (or, in essential_plus, the discretionary coverage). */
(function (root) {
  "use strict";

  var DEFAULTS = {
    mode: "essential",      // "essential" | "essential_plus" | "income" | "premium" | "none"
    income: null,           // annual income wanted, for mode "income"
    premium: null,          // premium, for mode "premium"
    cushion: 0.05,          // added to the smallest premium that closes the essential gap
    discShare: 0.25,        // share of discretionary spending added in mode "essential_plus"
    fund: null,             // [{aid, amt}] to set funding accounts (eligible accounts only, mode "premium"); otherwise automatic
    excludedStates: ["NY"], // states not served by the self-service funnel
    maxPasses: 12,          // upward sizing steps allowed while looking for a premium that closes the essential gap
    stressDrop: 0.20,       // market drop for the stress view
    includeState: false     // true: also return the exact calculator case files (for testing against LayerWise)
  };
  var CTA = { type: "schedule_1to1", label: "Discuss this with an advisor" };

  function run(intake, table, options) {
    var C = root.RMCalc;
    if (!C || C.version !== "2.0.0") return fail("calc_missing", "rm-calc 2.0.0 is not loaded.");
    if (!intake || typeof intake !== "object") return fail("bad_input", "No answers were provided.", "answers", true);
    var o = merge(DEFAULTS, options || {});
    var bad = checkOptions(o);
    if (bad) return fail("bad_option", bad.msg, bad.field, false);

    // 0. Required inputs. The state sets the state income tax rate, so a missing or unknown state is an input error, not zero tax.
    var answers = merge(intake, { state: typeof intake.state === "string" ? intake.state.trim().toUpperCase() : intake.state });
    var state = C.stateOf(answers);
    if (!state.stateCode) return fail("missing_state", "Choose the state you live in.", "state", true);
    var excluded = o.excludedStates.map(function (x) { return String(x).trim().toUpperCase(); });
    if (excluded.indexOf(state.stateCode) >= 0)
      return fail("state_not_served", "This estimate is not available for residents of " + state.stateCode + ".", "state", false);

    var startAge = Number(state.ageRet);      // the layer starts when retirement spending starts
    var ageNow = Number(state.ageNow);
    var reportAge = allIncomeOnAge(state, startAge);
    var opts = { layer: true, layerAge: reportAge };
    var essentialMode = o.mode === "essential" || o.mode === "essential_plus";

    // 1. The baseline snapshot, without a layer. It never depends on payout data, and every later outcome keeps it.
    var base = C.computeState(clone(state), opts);
    if (base.error) return fail("baseline_failed", "We couldn't calculate these answers. Please review them and try again.", null, true, base.error);
    var before = base.A;
    var result = {
      status: "ok",
      reportAge: reportAge,
      layerStartAge: startAge,
      deferral: startAge - ageNow,
      assets: base.assets,
      before: summary(before),
      beforeAtRetirement: summary(base.A1),
      layer: null,
      after: null,
      afterAtRetirement: null,
      stress: null,
      payout: null,
      messages: [],
      cta: null,
      noLayerReason: null,
      funding: null,
      sizing: { mode: o.mode, cushion: essentialMode ? o.cushion : 0, discretionaryShare: o.mode === "essential_plus" ? o.discShare : 0,
        closesEssentialGap: essentialMode, requiredPremium: null, cushionTrimmed: false, calculatorRuns: 0 }
    };
    if (o.mode === "none") { result.status = "no_layer"; result.noLayerReason = "baseline_only"; return finish(result, o); }

    // 1b. Confirmed workplace-plan amounts: a number from 0 up to that plan's balance, or left out (unknown).
    var badAmt = checkPlanAmounts(state, answers);
    if (badAmt) return finish(errorKeepingBaseline(badAmt.code, badAmt.msg, badAmt.field), o);

    // 2. Payout estimate. Missing, malformed, unreadable or implausible rate data leaves the baseline in place.
    var P = root.RMPayout, two = !!state.spouseOn, deferral = result.deferral, ok = tableOk(table);
    var est = function (premium) {
      try {
        var e = P.estimate(table, { age: ageNow, spouseAge: two ? Number(state.ageS) : null, deferral: deferral, premium: premium });
        return e && typeof e === "object" ? e : { status: "unavailable" };
      } catch (err) { return { status: "unavailable" }; }
    };
    var unit = P && ok ? est(table.premium_basis) : { status: "unavailable" };
    var perDollar = unit.status === "ok" ? unit.annual / table.premium_basis : NaN;
    // A payout rate outside 1%–50% a year means the rate data is unusable (for example, rates entered as fractions).
    if (unit.status === "ok" && !(perDollar >= 0.01 && perDollar <= 0.5)) { unit = { status: "unavailable" }; ok = false; }
    result.payout = { status: unit.status, reason: unit.status === "ok" ? null : unit.reason || "Income estimates are temporarily unavailable.",
      rateData: ok ? "ok" : "unavailable", quotesFrom: ok ? table.quotes_dated.from : null, quotesTo: ok ? table.quotes_dated.to : null,
      release: ok ? table.release : null };
    if (unit.status !== "ok") { result.status = "no_estimate"; return finish(result, o); }

    // 3. Eligible money and caps.
    var gap = before.shortfall;                       // essential spending + its tax - guaranteed income
    var elig = eligibleAccounts(state, answers);
    var eligTotal = elig.accounts.reduce(function (s, a) { return s + (Number(a.bal) || 0); }, 0);
    var assetCap = roundDown(base.assets * 0.5, 1000), fundCap = roundDown(eligTotal, 1000);
    var cap = Math.min(assetCap, fundCap);
    result.funding = { source: "Traditional IRAs, then eligible workplace plans (confirmed available amount only), then Roth IRAs",
      eligibleTotal: eligTotal, eligibleCap: fundCap, assetCap: assetCap, bindingLimit: fundCap < assetCap ? "retirement_accounts" : "assets",
      includedPlans: elig.includedPlans, excludedPlans: elig.excludedPlans };
    if (elig.excludedPlans.some(function (x) { return x.reason === "amount_unknown"; }))
      result.messages.push("A workplace plan was left out of this estimate because the amount available to roll over now isn't confirmed. We can review it with you.");
    var noEssentialGap = essentialMode && gap <= 1;
    if (noEssentialGap && (o.mode === "essential" || !(o.discShare * before.wants > 0))) {
      result.status = "no_gap";
      result.messages.push("Guaranteed income already covers essential spending in the report year.");
      return finish(result, o);
    }
    var runs = 0, priced = null, premium, capped = false, requested;

    if (noEssentialGap) {
      // 4a'. essential_plus with no essential gap: only the discretionary share is sized.
      result.sizing.requiredPremium = 0;
      requested = roundUp(o.discShare * before.wants / perDollar, 1000);
      if (cap < 1000) return noFunds(requested);
      capped = requested > cap; premium = Math.min(requested, cap);
      priced = price(premium); runs++;
      if (priced.error) return priced.error;
    } else if (essentialMode) {
      // 4a. Find the smallest whole $1,000 premium whose layer closes the report-year essential gap after tax (shortfall <= $1).
      //     Layer income from IRA money is taxable, so steps grow from the pre-tax estimate until the gap closes, then a search
      //     narrows to the smallest premium. Only then is the cushion added (and, in essential_plus, 25% of discretionary spending).
      if (cap < 1000) return noFunds(roundUp(gap / perDollar, 1000));
      var lo = 0, hi = null, hiPriced = null, p = Math.min(cap, Math.max(1000, roundUp(gap / perDollar, 1000)));
      for (var pass = 0; pass < o.maxPasses; pass++) {
        var t = price(p); runs++;
        if (t.error) return t.error;
        var s = t.res.B.shortfall;
        if (s <= 1) { hi = p; hiPriced = t; break; }
        lo = p;
        if (p >= cap) break;
        p = Math.min(cap, p + Math.max(1000, roundUp(s / perDollar, 1000)));
      }
      if (hi === null && lo >= cap) {
        // The cap leaves part of the essential gap open: show the capped layer and the advisor route.
        capped = true; premium = cap; priced = t;
        requested = cap + Math.max(1000, roundUp(t.res.B.shortfall / perDollar, 1000));
      } else if (hi === null) {
        // Out of sizing steps below the cap (only with a lowered maxPasses): show the last layer, its gap, and the advisor route.
        premium = lo; priced = t; requested = lo + Math.max(1000, roundUp(t.res.B.shortfall / perDollar, 1000));
        result.cta = { type: CTA.type, label: CTA.label, reason: "sizing_incomplete", requestedPremium: requested, cap: cap,
          limits: { assets: assetCap, retirementAccounts: fundCap } };
      } else {
        // Usually the first premium tried leaves a gap (the tax on layer income), so lo is already close. When it closes the gap
        // outright, the next $1,000 down is the likely answer: test it before a full search.
        if (lo === 0 && hi > 1000) {
          var d = price(hi - 1000); runs++;
          if (d.error) return d.error;
          if (d.res.B.shortfall <= 1) { hi -= 1000; hiPriced = d; } else lo = hi - 1000;
        }
        while (hi - lo > 1000) {
          var mid = roundDown((lo + hi) / 2, 1000), m = price(mid); runs++;
          if (m.error) return m.error;
          if (m.res.B.shortfall <= 1) { hi = mid; hiPriced = m; } else lo = mid;
        }
        result.sizing.requiredPremium = hi;
        requested = roundUp(hi * (1 + o.cushion) + (o.mode === "essential_plus" ? o.discShare * before.wants / perDollar : 0), 1000);
        premium = Math.min(requested, cap);
        if (o.mode === "essential_plus" && requested > cap) capped = true;   // the requested discretionary coverage doesn't fit
        else if (requested > cap) result.sizing.cushionTrimmed = true;         // the gap is closed; only part of the cushion fits
        if (premium === hi) priced = hiPriced;
        else { priced = price(premium); runs++; if (priced.error) return priced.error; }
      }
    } else {
      // 4b. Modes "income" and "premium": a stated amount, priced once.
      requested = o.mode === "income" ? roundUp(o.income / perDollar, 1000) : o.premium;
      if (requested === 0) { result.status = "no_layer"; result.noLayerReason = "zero_premium"; return finish(result, o); }
      if (cap < 1000) return noFunds(requested);
      capped = requested > cap;
      if (capped && o.fund != null) {
        var r0 = errorKeepingBaseline("fund_above_cap", "The premium is above the self-service limit.", "premium");
        setCap(r0, requested, cap, assetCap, fundCap);
        return finish(r0, o);
      }
      premium = Math.min(requested, cap);
      priced = price(premium); runs++;
      if (priced.error) return priced.error;
    }
    result.sizing.calculatorRuns = runs;
    if (capped) setCap(result, requested, cap, assetCap, fundCap);

    var res = priced.res, e = est(premium);
    if (o.includeState) result.caseState = { withoutLayer: state, withLayer: priced.withLayer, options: opts };
    result.layer = {
      mode: o.mode,
      essentialGap: Math.round(gap),
      requiredPremium: result.sizing.requiredPremium,
      premium: premium,
      annualIncome: priced.totalAnnual,
      monthlyIncome: Math.round(priced.totalAnnual / 12),
      payoutRate: e.payoutRate,
      method: e.method,
      coveredAge: e.coveredAge,
      capped: capped,
      cap: cap,
      shareOfAssets: base.assets > 0 ? premium / base.assets : null,
      fund: priced.fund,
      layers: priced.layers
    };
    result.after = summary(res.B);
    result.afterAtRetirement = summary(res.B1);
    if (result.after.shortfall > 1) result.messages.push("Some essential spending is still not covered by guaranteed income.");
    if (result.sizing.cushionTrimmed) result.messages.push("The layer closes the essential gap; the full 5% cushion does not fit within the self-service limit.");
    return finish(result, o);

    function noFunds(req) {
      result.status = "no_layer"; result.noLayerReason = "no_eligible_funds";
      setCap(result, req, cap, assetCap, fundCap);
      return finish(result, o);
    }
    function errorKeepingBaseline(code, msg, field) {
      var r = clone(result);
      r.status = "error"; r.code = code; r.error = msg; r.field = field || null; r.recoverable = true;
      return r;
    }
    // Funds, prices and runs one premium. Returns {error} (a finished result that keeps the baseline) or the priced case.
    function price(prem) {
      var fund = validateFunding(elig.accounts, prem, o.fund == null ? allocate(elig.accounts, prem) : o.fund);
      if (!fund) {
        var r = errorKeepingBaseline("bad_funding", "Use eligible retirement accounts (traditional or Roth IRAs, or an eligible workplace plan), each listed once, with positive amounts within their balances. Funding must equal the premium.", "fund");
        r.cta = { type: CTA.type, label: CTA.label, reason: "needs_other_accounts", requestedPremium: prem, cap: cap,
          limits: { assets: assetCap, retirementAccounts: fundCap } };
        return { error: finish(r, o) };
      }
      // The calculator needs one layer per funding group: one tax type, one owner, and an IRA kept apart from an employer plan.
      var groups = groupFunding(state.ASSETS, fund);
      if (groups.length > 7) return { error: finish(errorKeepingBaseline("too_many_layers", "LayerWise supports up to seven funding layers."), o) };
      var withLayer = clone(state), template = withLayer.SRC[0], layers = [], totalAnnual = 0, unusable = false;
      withLayer.SRC = groups.map(function (g, k) {
        var gEst = est(g.premium);
        if (gEst.status !== "ok" || !(gEst.annual >= 0) || !isFinite(gEst.monthlyExact)) unusable = true;
        totalAnnual += gEst.annual;
        layers.push({ premium: g.premium, annualIncome: gEst.annual, taxType: g.cls, owner: g.own, accounts: g.rows });
        var src = clone(template);
        src.sid = "L" + (k + 1);
        src.ci = String(k);
        src.prem = String(g.premium);
        src.inc = String(gEst.monthlyExact);
        src.age = String(startAge);
        src.life = two ? "J" : "C";
        src.spct = "100";
        src.fund = g.rows.map(function (f) { return { aid: f.aid, amt: String(f.amt) }; });
        return src;
      });
      if (unusable) {
        var u = clone(result); u.status = "no_estimate";
        u.payout.status = "unavailable"; u.payout.rateData = "unavailable"; u.payout.reason = "Income estimates are temporarily unavailable.";
        return { error: finish(u, o) };
      }
      var res = C.computeState(clone(withLayer), opts);
      if (res.error) {
        var f = errorKeepingBaseline("layer_failed", "We couldn't calculate the income layer for these answers.");
        f.detail = res.error; f.cta = { type: CTA.type, label: CTA.label, reason: "layer_failed", requestedPremium: prem, cap: cap,
          limits: { assets: assetCap, retirementAccounts: fundCap } };
        return { error: finish(f, o) };
      }
      return { fund: fund, layers: layers, totalAnnual: totalAnnual, withLayer: withLayer, res: res };
    }
  }

  // Options are set by the funnel, not the visitor, so a bad option is a configuration error.
  function checkOptions(o) {
    var modes = ["essential", "essential_plus", "income", "premium", "none"];
    var num = function (x, lo, hi) { return typeof x === "number" && isFinite(x) && x >= lo && x <= hi; };
    if (modes.indexOf(o.mode) < 0) return { field: "mode", msg: "Unknown mode: " + o.mode };
    if (!Array.isArray(o.excludedStates)) return { field: "excludedStates", msg: "excludedStates must be a list of state codes." };
    if (!num(o.cushion, 0, 1)) return { field: "cushion", msg: "cushion must be between 0 and 1." };
    if (!num(o.discShare, 0, 1)) return { field: "discShare", msg: "discShare must be between 0 and 1." };
    if (!num(o.maxPasses, 1, 100) || Math.floor(o.maxPasses) !== o.maxPasses) return { field: "maxPasses", msg: "maxPasses must be a whole number from 1 to 100." };
    if (!num(o.stressDrop, 0, 0.99)) return { field: "stressDrop", msg: "stressDrop must be between 0 and 0.99." };
    if (o.mode === "income" && !num(o.income, 0, 1e7)) return { field: "income", msg: "Enter an income target of $0 or more." };
    if (o.mode === "premium" && (!num(o.premium, 0, 1e8) || o.premium % 1000 !== 0)) return { field: "premium", msg: "Enter a premium in whole $1,000s, $0 or more." };
    if (o.fund != null && o.mode !== "premium") return { field: "fund", msg: "fund can be set only with mode \"premium\"." };
    return null;
  }

  function setCap(result, requested, cap, assetCap, fundCap) {
    var byFunds = fundCap < assetCap;
    result.cta = { type: CTA.type, label: CTA.label, reason: byFunds ? "needs_other_accounts" : "premium_above_cap",
      requestedPremium: requested, cap: cap, limits: { assets: assetCap, retirementAccounts: fundCap } };
    result.messages.push(byFunds
      ? "This estimate uses eligible retirement accounts only. A larger income layer would need other savings, which an advisor can review with you."
      : "The income layer is limited to 50% of investable assets in this estimate.");
  }

  function finish(r, o) {
    var d = 1 - o.stressDrop;
    r.stress = {
      drop: o.stressDrop,
      before: r.before && r.before.rate !== null ? r.before.rate / d : null,
      after: r.after && r.after.rate !== null ? r.after.rate / d : null
    };
    return r;
  }

  function summary(a) {
    if (!a) return null;
    return {
      year: a.year, age: a.age, spouseAge: a.sAge == null ? null : a.sAge,
      essential: a.needs, discretionary: a.wants, essentialTax: a.essTax, discretionaryTax: a.discTax, tax: a.T,
      socialSecurity: a.ss, otherIncome: a.oth, layerIncome: a.layer, guaranteed: a.floor,
      shortfall: a.shortfall, discretionaryGap: a.dgap, fromPortfolio: a.total,
      rate: a.rateState === "ok" ? a.rate : null, rateState: a.rateState,
      essentialCovered: a.essCovered, premium: a.premium, uncovered: a.uncovered,
      laterIncome: a.later
    };
  }

  // First age (client's) when every income source is on: retirement, Social Security, pensions and other income.
  function allIncomeOnAge(s, startAge) {
    var ageNow = Number(s.ageNow), plan = Number(s.agePlan), ages = [startAge];
    if (Number(s.ssAmtC) > 0) ages.push(Number(s.ssClaimC));
    if (s.spouseOn && Number(s.ssAmtS) > 0) ages.push(Number(s.ssClaimS) + ageNow - Number(s.ageS));
    (s.OTH || []).forEach(function (x) { if (Number(x.amt) > 0) ages.push(Number(x.age)); });
    return Math.min(plan, Math.max.apply(null, ages.filter(isFinite)));
  }

  // Workplace-plan eligibility for one owner. Being retired does not count by itself. Only strict true counts.
  //  former employer: planFormer and planReleaseOk (the administrator confirmed money can be rolled out now); no age gate.
  //  current employer: planInService, and age 60 or over, or age 59 with over595.
  function planEligibility(own, state, intake) {
    var s = own === "s", get = function (k) { return intake[s ? k + "S" : k]; };
    if (get("planFormer") === true) return get("planReleaseOk") === true ? "former_confirmed" : "release_not_confirmed";
    if (get("planInService") !== true) return "not_confirmed";
    var age = Number(s ? state.ageS : state.ageNow);
    if (!(age >= 59)) return "under_59_5";
    if (age < 60 && get("over595") !== true) return "age_59_5_not_confirmed";
    return "in_service_confirmed";
  }
  function planAmount(own, intake) { return intake[own === "s" ? "planEligibleAmtS" : "planEligibleAmt"]; }

  // A confirmed amount must be a number from 0 to that owner's plan balance; null or undefined means unknown.
  function checkPlanAmounts(state, intake) {
    var owners = state.spouseOn ? ["c", "s"] : ["c"];
    for (var i = 0; i < owners.length; i++) {
      var own = owners[i], field = own === "s" ? "planEligibleAmtS" : "planEligibleAmt", v = planAmount(own, intake);
      if (v == null) continue;
      if (typeof v !== "number" || !isFinite(v) || v < 0)
        return { code: "bad_plan_amount", field: field, msg: "Enter the amount available to roll over as $0 or more, or leave it blank if you're not sure." };
      var plan = state.ASSETS.filter(function (a) { return a.type === "plan" && a.own === own; })[0];
      var bal = plan ? Number(plan.bal) || 0 : 0;
      if (v > bal)
        return { code: "plan_amount_above_balance", field: field, msg: "The amount available to roll over can't be more than the plan's balance ($" + bal.toLocaleString("en-US") + ")." };
    }
    return null;
  }

  // Accounts that may fund a self-service estimate, in funding order: traditional IRAs, eligible pre-tax workplace plans,
  // Roth IRAs, then eligible Roth workplace plans. Brokerage and inherited accounts are never eligible. An eligible plan is listed
  // with its confirmed available amount as its balance, so funding can never use more than that amount.
  function eligibleAccounts(state, intake) {
    var list = [], excluded = [], included = [];
    state.ASSETS.forEach(function (a, i) {
      if (a.type === "inh" || (a.cls !== "pt" && a.cls !== "tf")) return;
      var acct = a;
      if (a.type === "plan") {
        var bal = Number(a.bal) || 0;
        if (!(bal > 0)) return;
        var why = planEligibility(a.own, state, intake);
        if (why === "former_confirmed" || why === "in_service_confirmed") {
          var amt = planAmount(a.own, intake);
          if (amt == null) why = "amount_unknown";
          else if (!(Math.floor(amt) >= 1)) why = "no_amount_available";
          else {
            acct = merge(a, { bal: String(Math.min(Math.floor(amt), bal)) });
            included.push({ aid: a.aid, owner: a.own, balance: bal, eligibleAmount: Math.min(Math.floor(amt), bal), path: why === "former_confirmed" ? "former_employer" : "current_employer" });
          }
        }
        if (acct === a) { excluded.push({ aid: a.aid, owner: a.own, balance: bal, reason: why }); return; }
      }
      list.push({ a: acct, r: (a.cls === "pt" ? 0 : 2) + (a.type === "plan" ? 1 : 0), i: i });
    });
    list.sort(function (x, y) { return x.r - y.r || x.i - y.i; });
    return { accounts: list.map(function (x) { return x.a; }), includedPlans: included, excludedPlans: excluded };
  }

  function tableOk(t) {
    return !!t && typeof t === "object" && t.schema === "rm-payout-rates/1" && typeof t.premium_basis === "number" && isFinite(t.premium_basis) && t.premium_basis > 0 && !!t.quotes_dated &&
      !!t.annual_per_100k && !!t.rules && Array.isArray(t.issue_ages) && Array.isArray(t.deferral_years);
  }

  function allocate(accounts, premium) {
    var left = premium, out = [];
    accounts.forEach(function (a) {
      if (left <= 0) return;
      var take = Math.min(left, Number(a.bal) || 0);
      if (take > 0) { out.push({ aid: a.aid, amt: take }); left -= take; }
    });
    return out;
  }

  function validateFunding(assets, premium, entries) {
    if (!Array.isArray(entries)) return null;
    var accounts = new Map(assets.map(function (a) { return [a.aid, a]; }));
    var used = new Set(), total = 0, fund = [];
    for (var entry of entries) {
      if (!entry || !["number", "string"].includes(typeof entry.amt) ||
          used.has(entry.aid) || !accounts.has(entry.aid)) return null;
      var amount = Number(entry.amt), cents = Math.round(amount * 100);
      if (!Number.isSafeInteger(cents) || cents <= 0 || Math.abs(amount - cents / 100) > 1e-8 ||
          amount > Number(accounts.get(entry.aid).bal)) return null;
      used.add(entry.aid);
      total += cents;
      fund.push({ aid: entry.aid, amt: cents / 100 });
    }
    return Math.abs(premium - total / 100) <= 1e-8 ? fund : null;
  }

  function groupFunding(assets, fund) {
    var byAid = {}, groups = {}, order = [];
    assets.forEach(function (a) { byAid[a.aid] = a; });
    fund.forEach(function (f) {
      var a = byAid[f.aid];
      if (!a) return;
      var key = a.cls + (a.cls !== "at" ? a.own : "") + (a.cls === "pt" ? a.type : "");
      if (!groups[key]) { groups[key] = { cls: a.cls, own: a.own, premium: 0, rows: [] }; order.push(key); }
      groups[key].premium += f.amt;
      groups[key].rows.push({ aid: f.aid, amt: f.amt, label: a.lbl });
    });
    return order.map(function (k) { return groups[k]; });
  }

  function roundUp(x, step) { return Math.ceil(x / step) * step; }
  function roundDown(x, step) { return Math.floor(x / step) * step; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function merge(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) if (b[k] !== undefined) r[k] = b[k]; return r; }
  function fail(code, msg, field, recoverable, detail) {
    return { status: "error", code: code, error: msg, field: field || null, recoverable: !!recoverable, detail: detail || null };
  }

  root.RMBox = { version: "1.0.5", defaults: DEFAULTS, run: run };
})(typeof window !== "undefined" ? window : globalThis);
