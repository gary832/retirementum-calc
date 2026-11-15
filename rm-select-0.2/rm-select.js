/*! rm-select 0.2.0 | RetireMentum v2 selector bridge: maps options A-D onto rm-box 1.0.5 and returns one display-ready result.
 *  Needs rm-calc 2.0.0 (window.RMCalc), rm-box 1.0.5 (window.RMBox), and for B-D the payout lookup and a payout table.
 *  rm-box itself is unchanged. Option D is the only new calculation.
 *
 *  Result contract (schema rm-select-result/1): every option returns the same shape.
 *    status: ok | capped | no_layer | unavailable | invalid_input | error
 *    reason: { code, text } written for display (no advisor or booking prompts), or null
 *    basis:  as-of year, report year and ages, inflation, and the dollar basis of every amount
 *    before / after: rm-box report-year summaries (after = before when there is no layer)
 *    layer, limit, goal (D only), equalTo (C only, when it matches B), versions
 *
 *  Option D sizing contract:
 *    goal input   = after-tax dollars a month, in today's dollars (as-of year = rm-calc's ASOF)
 *    goal in use  = input x 12 x (1 + plan inflation)^(report year - as-of year), both read from rm-calc for these answers
 *    benefit      = baseline withdrawal - withdrawal with the layer, in the report year (layer income minus the extra tax it creates)
 *    met          = benefit >= min(goal, baseline withdrawal) - $1   (one $1 tolerance everywhere)
 *    premium      = smallest whole $1,000 that is met, verified against the $1,000 step below
 *    cap          = rm-box's limit (lower of 50% of investable assets and eligible accounts), read from a $1,000 probe */
(function (root) {
  'use strict';

  var VERSION = '0.2.0';
  var TOL = 1;
  var STEP = 1000;
  var MAX_MONTHLY = 100000;

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function make(engine, table) {
    var BOX = engine.RMBox, CALC = engine.RMCalc;

    function versions() {
      return { rmSelect: VERSION, rmBox: BOX.version, rmCalc: CALC.version, rmCalcBuild: CALC.build,
        payoutRelease: table && table.release ? table.release : null };
    }

    // One engine call. A thrown error or an empty answer becomes an error result, never an exception.
    function run(answers, opts) {
      var r;
      try { r = BOX.run(answers, table, opts); }
      catch (e) { return { status: 'error', code: 'engine_threw', error: String(e && e.message ? e.message : e) }; }
      return r && typeof r === 'object' ? r : { status: 'error', code: 'engine_empty', error: 'The calculator returned nothing.' };
    }

    function basisOf(answers, base) {
      var st = CALC.stateOf(answers);
      var asOf = Number(st.ASOF), infl = Number(st.planInf) / 100, year = base.before.year;
      return {
        asOfYear: asOf, reportYear: year, ageNow: Number(st.ageNow), reportAge: base.reportAge,
        spouseReportAge: base.before.spouseAge == null ? null : base.before.spouseAge,
        layerStartAge: base.layerStartAge, deferralYears: base.deferral,
        inflation: infl, goalFactor: Math.pow(1 + infl, year - asOf),
        amounts: 'report-year dollars (' + year + ', ' + (infl * 100).toFixed(1) + '% inflation from ' + asOf + ')',
        goalInput: 'after-tax dollars a month, in ' + asOf + ' dollars'
      };
    }

    function limitOf(res) {
      var f = res && res.funding;
      if (!f) return null;
      var cap = Math.min(f.assetCap, f.eligibleCap);
      return { cap: cap, assetCap: f.assetCap, eligibleCap: f.eligibleCap,
        binding: f.eligibleCap < f.assetCap ? 'retirement_accounts' : 'assets',
        reached: false, remainingEssentialGap: null, cushionTrimmed: false,
        includedPlans: f.includedPlans || [], excludedPlans: f.excludedPlans || [] };
    }

    function capReason(lim, assets) {
      return lim.binding === 'retirement_accounts'
        ? { code: 'cap_accounts', text: 'Only eligible retirement accounts can fund an income layer in this estimate (' + money(lim.eligibleCap) + ' available).' }
        : { code: 'cap_assets', text: 'This estimate limits an income layer to half of your savings: ' + money(lim.assetCap) + ' of ' + money(assets) + '.' };
    }

    var TEXT = {
      engine_error: 'We couldn’t calculate this option. Your current plan is shown.',
      payout_unavailable: 'Income estimates aren’t available for these answers.',
      no_eligible_funds: 'None of your savings is in an account that can fund an income layer in this estimate.',
      no_benefit: 'An income layer wouldn’t lower what you need from savings for these answers.'
    };

    function layerOf(res) {
      var L = res.layer;
      return { premium: L.premium, annualIncome: L.annualIncome, monthlyIncome: L.monthlyIncome, payoutRate: L.payoutRate,
        method: L.method, shareOfAssets: L.shareOfAssets, startAge: res.layerStartAge, fund: L.fund,
        taxTypes: L.layers.map(function (x) { return x.taxType; }) };
    }

    function result(option, base, basis, fields) {
      var o = { schema: 'rm-select-result/1', option: option, selected_option: option, additional_income_layer: false,
        status: 'ok', reason: null, basis: basis, assets: base.assets, before: base.before, after: base.before,
        layer: null, limit: null, goal: null, equalTo: null, engineMessages: [], versions: versions() };
      for (var k in fields) if (Object.prototype.hasOwnProperty.call(fields, k)) o[k] = fields[k];
      o.additional_income_layer = !!(o.layer && o.layer.premium > 0);
      if (!o.additional_income_layer) { o.layer = null; o.after = base.before; }
      return o;
    }

    function baseline(answers) {
      var base = run(answers, { mode: 'none' });
      if (base.status === 'error' || !base.before) {
        return { error: { schema: 'rm-select-result/1', status: 'error', field: base.field || null, versions: versions(),
          reason: { code: base.code || 'baseline_failed', text: base.error || 'We couldn’t calculate these answers. Please review them.' } } };
      }
      return { base: base, basis: basisOf(answers, base) };
    }

    // Options B and C: one rm-box call each, existing modes.
    function engineOption(option, answers, opts, b) {
      var res = run(answers, opts), base = b.base, basis = b.basis, msgs = res.messages || [];
      if (res.status === 'error')
        return result(option, base, basis, { status: 'error', reason: { code: res.code || 'engine_error', text: TEXT.engine_error }, engineMessages: msgs });
      if (res.status === 'no_estimate')
        return result(option, base, basis, { status: 'unavailable', reason: { code: 'payout_unavailable', text: (res.payout && res.payout.reason) || TEXT.payout_unavailable } });
      var lim = limitOf(res);
      if (res.status === 'no_gap')
        return result(option, base, basis, { status: 'no_layer', limit: lim, engineMessages: msgs,
          reason: { code: 'essentials_covered', text: 'Your reliable income already covers your essential spending in ' + basis.reportYear + '.' } });
      if (res.status === 'no_layer')
        return result(option, base, basis, { status: 'no_layer', limit: lim, engineMessages: msgs,
          reason: res.noLayerReason === 'no_eligible_funds' ? { code: 'no_eligible_funds', text: TEXT.no_eligible_funds }
            : { code: res.noLayerReason || 'no_layer', text: 'No income layer was modeled for these answers.' } });
      if (!res.layer || !res.after)
        return result(option, base, basis, { status: 'error', reason: { code: 'engine_incomplete', text: TEXT.engine_error } });
      var capped = !!res.layer.capped;
      lim.reached = res.layer.premium >= lim.cap;
      lim.remainingEssentialGap = Math.max(0, Math.round(res.after.shortfall));
      lim.cushionTrimmed = !!(res.sizing && res.sizing.cushionTrimmed);
      return result(option, base, basis, { status: capped ? 'capped' : 'ok', layer: layerOf(res), after: res.after, limit: lim,
        reason: capped ? capReason(lim, res.assets) : null, engineMessages: msgs });
    }

    function parseGoal(v) {
      if (typeof v === 'number') return isFinite(v) ? v : NaN;
      if (typeof v !== 'string') return NaN;
      var s = v.replace(/[\s$,]/g, '');
      return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s) : NaN;
    }

    // Option D: after-tax goal in today's dollars.
    function optionD(answers, rawGoal, b) {
      var base = b.base, basis = b.basis;
      var m = parseGoal(rawGoal);
      if (!(m >= 1) || m > MAX_MONTHLY)
        return result('D', base, basis, { status: 'invalid_input', goal: { input: rawGoal, monthlyToday: null },
          reason: { code: 'invalid_goal', text: 'Enter a monthly amount from $1 to ' + money(MAX_MONTHLY) + ', for example 2,000.' } });

      // rm-calc rate states: ok (normal), zero (no withdrawal needed), unresolved / unfundable (savings can't cover the year).
      var need = base.before.fromPortfolio, state = base.before.rateState;
      if (state !== 'zero' && (need == null || state !== 'ok'))
        return result('D', base, basis, { status: 'unavailable', goal: { input: rawGoal, monthlyToday: m },
          reason: { code: 'savings_unresolved', text: 'Your savings don’t cover your withdrawals in ' + basis.reportYear + ' in this estimate, so it can’t size an income layer to a monthly goal.' } });
      var goalAnnual = Math.round(m * 12 * basis.goalFactor);
      var goal = { input: rawGoal, monthlyToday: m, annualReportYear: goalAnnual, need: Math.round(need), aboveNeed: false,
        effectiveAnnual: null, met: false, feasibleAnnualAfterTax: null, feasibleMonthlyToday: null, premiumEstimate: null,
        verification: null, tolerance: TOL };
      if (!(need > TOL))
        return result('D', base, basis, { status: 'no_layer', goal: goal,
          reason: { code: 'no_withdrawal_need', text: 'Your reliable income already covers your spending in ' + basis.reportYear + ', so there is no withdrawal for an income layer to replace.' } });

      var eff = Math.min(goalAnnual, need);
      goal.aboveNeed = goalAnnual > need;
      goal.effectiveAnnual = Math.round(eff);
      var benefit = function (res) { return need - res.after.fromPortfolio; };
      var meets = function (res) { return benefit(res) >= eff - TOL; };
      var toMonthlyToday = function (annual) { return Math.floor(annual / basis.goalFactor / 12); };

      // Funding limits from a $1,000 probe: never an oversize request.
      var probe = run(answers, { mode: 'premium', premium: STEP });
      if (probe.status === 'error')
        return result('D', base, basis, { status: 'error', goal: goal, reason: { code: probe.code || 'engine_error', text: TEXT.engine_error } });
      if (probe.status === 'no_estimate')
        return result('D', base, basis, { status: 'unavailable', goal: goal,
          reason: { code: 'payout_unavailable', text: (probe.payout && probe.payout.reason) || TEXT.payout_unavailable } });
      var lim = limitOf(probe);
      if (!lim)   // every non-error probe that reached funding carries limits; anything else is a malformed reply
        return result('D', base, basis, { status: 'error', goal: goal, reason: { code: 'engine_incomplete', text: TEXT.engine_error } });
      if (lim.cap < STEP)
        return result('D', base, basis, { status: 'no_layer', goal: goal, limit: lim, reason: { code: 'no_eligible_funds', text: TEXT.no_eligible_funds } });

      var seen = {};
      function price(p) {
        if (seen[p]) return seen[p];
        var r = run(answers, { mode: 'premium', premium: p });
        if (r.status === 'error' || !r.after || !r.layer || r.layer.premium !== p) throw { pricing: true, premium: p, status: r.status, code: r.code || null };
        seen[p] = r;
        return r;
      }

      try {
        var atCap = price(lim.cap), capBenefit = benefit(atCap);
        if (!(capBenefit > TOL))
          return result('D', base, basis, { status: 'no_layer', goal: goal, limit: lim, reason: { code: 'no_benefit', text: TEXT.no_benefit } });

        if (!meets(atCap)) {
          lim.reached = true;
          goal.feasibleAnnualAfterTax = Math.round(capBenefit);
          goal.feasibleMonthlyToday = toMonthlyToday(capBenefit);
          goal.premiumEstimate = { amount: Math.ceil(eff / (capBenefit / lim.cap) / STEP) * STEP, approximate: true,
            method: 'straight-line from the capped result; not modeled' };
          return result('D', base, basis, { status: 'capped', goal: goal, limit: lim, layer: layerOf(atCap), after: atCap.after,
            reason: capReason(lim, base.assets), engineMessages: atCap.messages || [] });
        }

        // Smallest whole-$1,000 premium that meets the goal. lo never meets (0 has no benefit), hi always meets.
        var lo = 0, hi = lim.cap;
        var guess = Math.min(lim.cap, Math.max(STEP, Math.ceil(eff / (capBenefit / lim.cap) / STEP) * STEP));
        if (meets(price(guess))) hi = guess; else lo = guess;
        while (hi - lo > STEP) {
          var mid = Math.floor((lo + hi) / 2 / STEP) * STEP;
          if (meets(price(mid))) hi = mid; else lo = mid;
        }
        // Verification: the $1,000 step below must fail. If it doesn't (a non-monotonic benefit), walk down until it does.
        var walked = 0;
        while (hi - STEP >= STEP && meets(price(hi - STEP)) && walked < 50) { hi -= STEP; walked++; }
        var fin = price(hi), prev = hi - STEP;
        goal.met = meets(fin);
        goal.feasibleAnnualAfterTax = Math.round(benefit(fin));
        goal.feasibleMonthlyToday = toMonthlyToday(benefit(fin));
        goal.verification = { premium: hi, benefit: Math.round(benefit(fin)), meets: goal.met,
          previousPremium: prev >= STEP ? prev : 0, previousBenefit: prev >= STEP ? Math.round(benefit(price(prev))) : 0,
          previousMeets: prev >= STEP ? meets(price(prev)) : false, walkedDown: walked, engineRuns: Object.keys(seen).length + 1 };
        lim.reached = hi >= lim.cap;
        return result('D', base, basis, { status: 'ok', goal: goal, limit: lim, layer: layerOf(fin), after: fin.after, engineMessages: fin.messages || [],
          reason: goal.aboveNeed ? { code: 'goal_above_need', text: 'Your goal is more than you need from savings in ' + basis.reportYear + ', so the income layer is sized to replace all of it.' } : null });
      } catch (e) {
        if (e && e.pricing)
          return result('D', base, basis, { status: 'error', goal: goal, limit: lim, engineDetail: { premium: e.premium, status: e.status, code: e.code },
            reason: { code: 'pricing_failed', text: TEXT.engine_error } });
        throw e;
      }
    }

    function select(answers, sel) {
      var b = baseline(answers);
      if (b.error) return b.error;
      var o = sel && sel.option;
      if (o === 'A') return result('A', b.base, b.basis, {});
      if (o === 'B') return engineOption('B', answers, { mode: 'essential' }, b);
      if (o === 'C') return engineOption('C', answers, { mode: 'essential_plus', discShare: sel.cShare == null ? 0.5 : sel.cShare }, b);
      if (o === 'D') return optionD(answers, sel.dMonthlyToday, b);
      return { schema: 'rm-select-result/1', status: 'error', reason: { code: 'unknown_option', text: 'Unknown option.' }, versions: versions() };
    }

    // What the selector screen needs on load: A, B and C, with C marked when it comes out the same as B.
    function screen(answers, cShare) {
      var b = baseline(answers);
      if (b.error) return { error: b.error };
      var A = result('A', b.base, b.basis, {});
      var B = engineOption('B', answers, { mode: 'essential' }, b);
      var C = engineOption('C', answers, { mode: 'essential_plus', discShare: cShare == null ? 0.5 : cShare }, b);
      if (B.layer && C.layer && B.layer.premium === C.layer.premium) {
        C.equalTo = 'B';
        C.reason = { code: 'same_as_B', text: 'This comes out the same as covering your essentials. ' + (C.limit ? capReason(C.limit, C.assets).text : '') };
      }
      return { A: A, B: B, C: C };
    }

    return { version: VERSION, tolerance: TOL, select: select, screen: screen, parseGoal: parseGoal };
  }

  var api = { version: VERSION, make: make };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RMSelect = api;
})(typeof window !== 'undefined' ? window : globalThis);
