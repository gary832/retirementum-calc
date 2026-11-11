/*! rm-payout-lookup 1.0.0 | Estimates lifetime income from a published rm-payout rate file. */
(function (root) {
  "use strict";

  // Returns one of:
  //   { status: "ok", annual, monthly, payoutRate, coveredAge, incomeStartAge, method, release, quotesFrom, quotesTo }
  //   { status: "hold" | "unavailable", reason }
  // Inputs: age (whole years), spouseAge (whole years, or null for single life),
  //         deferral (whole years before income starts), premium (dollars).
  function estimate(table, input) {
    var r = table.rules;
    var joint = input.spouseAge !== null && input.spouseAge !== undefined && input.spouseAge !== "";
    var age = Number(input.age), sAge = joint ? Number(input.spouseAge) : null;
    var deferral = Number(input.deferral), premium = Number(input.premium);

    if (!isWhole(age) || (joint && !isWhole(sAge))) return no("unavailable", "Age must be a whole number.");
    if (!isWhole(deferral) || deferral < 0) return no("unavailable", "Deferral must be a whole number of years, 0 or more.");
    if (!(premium > 0)) return no("unavailable", "Premium must be more than $0.");

    var covered = joint ? Math.min(age, sAge) : age;
    if (covered < r.min_age || covered > r.max_age) return no("unavailable", "Age is outside the " + r.min_age + "-" + r.max_age + " range.");

    var dIdx = table.deferral_years.indexOf(deferral);
    if (dIdx < 0) return no("unavailable", "No rates for a " + deferral + "-year deferral.");
    if (deferral > r.show_max_deferral) return no("hold", "Deferrals over " + r.show_max_deferral + " years are not shown.");

    var basis = joint ? "joint" : "single";
    var rows = table.annual_per_100k[basis], ages = table.issue_ages;
    var per100k, method;

    if (ages.indexOf(covered) >= 0) {
      per100k = rows[String(covered)][dIdx];
      method = "quoted";
    } else if (covered > r.top_quoted_age) {
      per100k = rows[String(r.top_quoted_age)][dIdx];
      method = "top_age";
    } else {
      var lo = null, hi = null;
      for (var i = 0; i < ages.length; i++) {
        if (ages[i] < covered) lo = ages[i];
        if (ages[i] > covered && hi === null) hi = ages[i];
      }
      if (lo === null || hi === null) return no("unavailable", "No quoted ages on both sides of " + covered + ".");
      var a = rows[String(lo)][dIdx], b = rows[String(hi)][dIdx];
      per100k = a + (b - a) * (covered - lo) / (hi - lo);
      method = "interpolated";
    }
    if (typeof per100k !== "number" || !(per100k > 0)) return no("unavailable", "No rate for this scenario.");

    var annual = Math.round(per100k * premium / table.premium_basis);
    return {
      status: "ok",
      annual: annual,
      monthly: Math.round(annual / 12),
      monthlyExact: annual / 12,          // pass this to the calculator so 12 x monthly = annual
      payoutRate: Math.round(per100k / table.premium_basis * 10000) / 100, // percent, 2 decimals
      coveredAge: covered,
      incomeStartAge: age + deferral,     // the client's age when income starts (calculator "age" field)
      method: method,
      release: table.release,
      quotesFrom: table.quotes_dated.from,
      quotesTo: table.quotes_dated.to
    };
  }

  function isWhole(n) { return typeof n === "number" && isFinite(n) && Math.floor(n) === n; }
  function no(status, reason) { return { status: status, reason: reason }; }

  root.RMPayout = { version: "1.0.0", estimate: estimate };
})(typeof window !== "undefined" ? window : globalThis);
