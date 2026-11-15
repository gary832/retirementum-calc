/*! rm-record 0.2.2 | The saved record behind the Snapshot, and the one display model both the selector and the Snapshot render.
 *  The Snapshot renders from the saved record only: it never calls the engine. Change my choice re-runs the engine and saves a new record. */
(function (root) {
  'use strict';

  var VERSION = '0.2.2';

  // A record holds what was asked, what was chosen, what the engine returned, and which engine and payout files produced it.
  function save(answers, selection, result, meta) {
    meta = meta || {};
    return {
      schema: 'rm-select-record/1',
      savedAt: meta.savedAt || null,
      selected_option: result.selected_option || selection.option,
      additional_income_layer: !!result.additional_income_layer,
      selection_path: meta.selectionPath || 'card',
      inputs: { answers: answers, selection: selection },
      result: result,
      versions: Object.assign({}, result.versions, meta.engineCommit ? { engineCommit: meta.engineCommit } : {})
    };
  }

  function round(n) { return n == null || !isFinite(n) ? null : Math.round(n); }
  function pct(r) { return r == null || !isFinite(r) ? null : Math.round(r * 10000) / 100; }
  // rm-calc leaves the rate null in two different situations; they read differently.
  function rateText(s, p) {
    if (s.rateState === 'zero') return 'None needed';
    return p == null ? 'Not available' : p.toFixed(2) + '%';
  }

  // Every number either screen shows comes from here, so the selector and the Snapshot cannot disagree.
  function display(result) {
    if (!result || !result.before) return { status: result ? result.status : 'error', reasonText: result && result.reason ? result.reason.text : null };
    var a = result.after, b = result.before, bs = result.basis;
    var rate = pct(a.rate), baseRate = pct(b.rate);
    return {
      option: result.option,
      status: result.status,
      reasonCode: result.reason ? result.reason.code : null,
      reasonText: result.reason ? result.reason.text : null,
      equalTo: result.equalTo || null,
      additionalIncomeLayer: !!result.additional_income_layer,
      year: bs.reportYear, age: bs.reportAge, spouseAge: bs.spouseReportAge, dollars: bs.amounts,
      spending: round(a.essential + a.discretionary),
      tax: round(a.tax),
      taxCurrentPlan: round(b.tax),
      reliableIncome: round(a.socialSecurity + a.otherIncome),
      addedIncome: round(a.layerIncome),
      fromSavings: round(a.fromPortfolio),
      fromSavingsCurrentPlan: round(b.fromPortfolio),
      rate: rate,
      rateText: rateText(a, rate),
      rateCurrentPlanText: rateText(b, baseRate),
      rateRises: rate != null && baseRate != null && rate > baseRate,
      rateState: a.rateState,
      savingsCoverYear: a.rateState === 'ok' || a.rateState === 'zero',
      uncovered: a.rateState === 'ok' || a.rateState === 'zero' ? 0 : round(a.uncovered),
      fromSavingsText: a.fromPortfolio == null ? 'Not available: savings don’t cover this year' : '$' + round(a.fromPortfolio).toLocaleString('en-US'),
      premium: result.layer ? result.layer.premium : 0,
      shareOfSavings: result.layer ? Math.round(result.layer.shareOfAssets * 1000) / 10 : 0,
      layerStartAge: result.layer ? result.layer.startAge : null,
      goalMonthlyToday: result.goal ? result.goal.monthlyToday : null,
      goalAnnualReportYear: result.goal && result.goal.annualReportYear != null ? result.goal.annualReportYear : null,
      feasibleMonthlyToday: result.goal ? result.goal.feasibleMonthlyToday : null,
      feasibleAnnualReportYear: result.goal && result.goal.feasibleAnnualAfterTax != null ? result.goal.feasibleAnnualAfterTax : null,
      feasibleAnnualBasis: result.goal && result.goal.feasibleAnnualAfterTax != null ? 'after tax, a year, in ' + bs.amounts : null,
      goalInputBasis: result.goal ? bs.goalInput : null,
      limitBinding: result.limit ? result.limit.binding : null,
      limitReached: result.limit ? !!result.limit.reached : false,
      remainingEssentialGap: result.limit ? result.limit.remainingEssentialGap : null
    };
  }

  // The Snapshot: render from the saved record alone.
  function snapshot(record) {
    if (!record || record.schema !== 'rm-select-record/1') return { status: 'error', reasonText: 'This Snapshot could not be read.' };
    return Object.assign(display(record.result), { selectedOption: record.selected_option, versions: record.versions });
  }

  var api = { version: VERSION, save: save, display: display, snapshot: snapshot };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RMRecord = api;
})(typeof window !== 'undefined' ? window : globalThis);
