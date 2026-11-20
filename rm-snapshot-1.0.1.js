/*! rm-snapshot 1.0.1 | RetireMentum Retirement Snapshot formatter and page fragment | copy 2026-11-19 v3.1 RC2
 *  Needs rm-box 1.0.5 results (mode "none" and mode "essential"). Display only: never changes engine values.
 *  window.RMSnapshot.build(base, comparison, ctx) -> { display, branches, model }
 *  window.RMSnapshot.render(container, base, comparison, ctx, opt) -> mounts the Snapshot and wires print. */
(function (root) {
  "use strict";
  var defs = {
    "./copy_strings_v3.1.json": function (module) { module.exports = {
 "copy_version": "2026-11-19 v3.1 RC2",
 "status": "Owner-approved (Gary Jensen, Nov 19, 2026). No other review required. Production release pending end-to-end QA.",
 "engine": {
  "rm-calc": "2.0.0",
  "rm-box": "1.0.5",
  "payout_table": "2026-11-11-r2"
 },
 "notes": [
  "Strings use **bold** markers and {tokens}; render bold as <strong>.",
  "Branch rules, data fields and rounding: Implementation Spec v3.1.",
  "Restored strings (N-*, TU, C2-*, MSG-plan, PV-*, disclosures) are verbatim from the live baseline funnel, read Nov 19, 2026. N-nogap changes 'guaranteed' to 'reliable' only.",
  "When booking is not allowed, N-range and N-nofunds show their first sentence only, and CTA/CTA-0/C1/A-soft-* are not shown.",
  "No-gap path (gap_today = 0): T0 shows the no-gap narrative; the lifetime-income section and all 4% guideline text are suppressed; the rate tile reads 'No portfolio withdrawals needed.'; priority paragraphs that assume withdrawals are not shown (spouse_secure still shows).",
  "Coverage: nearest whole percent from unrounded engine values; below 100% shows at most 99%; full/partial branch decided on the engine's unrounded shortfall.",
  "PRINT-contact prints only (hidden on screen) and only when booking is allowed."
 ],
 "strings": {
  "G": "{first_name}, here's your Retirement Snapshot",
  "G-noname": "Here's your Retirement Snapshot",
  "H": "**In {year}, your savings may need to cover {gap_today} a month.** That's {spending} of spending plus {tax_today} of estimated taxes, after {ss_pension} of {income_label}.",
  "H0": "**In {year}, your income may cover your estimated spending.** That's {spending} of spending plus {tax_today} of estimated taxes, against {ss_pension} of {income_label}.",
  "Bridge": "These figures are for {year}, the first year all your reliable income has started. In {first_year}, before it starts, savings may need to cover about {gap_first} a month.",
  "TO": "Keeping your savings invested preserves growth potential and flexibility. **But investment returns are not guaranteed**, and market declines early in retirement can make withdrawals harder to sustain, an effect known as **sequence-of-returns risk**.",
  "T0": "Your {ng_income} may be sufficient to cover your current retirement spending without drawing from savings. That gives your investments greater flexibility for future needs, unexpected expenses, and a potential legacy. Reviewing how inflation and changing expenses could affect this balance over time remains an important part of retirement planning.",
  "TX": "Your income may fall short of your estimated spending by {gap_today} a month, and no savings were entered to fill the gap. This is worth reviewing with a professional before you settle on a spending level.",
  "T1": "Your {wr_phrase} is **{wr_today}**, {vs_4} the commonly referenced **4% guideline**. That's a useful starting point, not a guarantee: returns, inflation and how long you live all affect whether savings last.",
  "T2": "Your {wr_phrase} is **{wr_today}**, above the commonly referenced **4% guideline**. This isn't a pass-or-fail test, but maintaining spending flexibility can help manage the risks of market downturns.",
  "T3": "Your {wr_phrase} is **{wr_today}**, well above the commonly referenced **4% guideline**. This places greater pressure on your invested savings, making spending flexibility especially important during market downturns.",
  "T4": "Your {wr_phrase} is **{wr_today}**. At this level, withdrawals could place significant pressure on your savings, especially during market downturns. Reviewing your spending, retirement timing, and available income options is particularly important.",
  "LH-heading": "With lifetime income",
  "LH-badge": "Illustrative estimate",
  "LH": "**With lifetime income, your savings would need to cover {gap_with} a month, {pct_less}% less.**",
  "LH-neutral": "**With lifetime income, your savings would need to cover {gap_with} a month.**",
  "AL": "Allocating {premium} of your savings to a lifetime income layer could provide an estimated **{gross_li} per month {life}**, before taxes.",
  "L1": "That would lower your {wr_phrase} further. {combined} could {essentials}. Your remaining **{remaining}** stays invested for lifestyle spending, future needs, and a potential legacy for loved ones.",
  "L2a": "That would bring your {wr_phrase} {vs_4_new} the commonly referenced 4% guideline. {combined} could {essentials}. Your remaining **{remaining}** stays invested for lifestyle spending, future needs, and a potential legacy for loved ones.",
  "L2b": "That would lower your {wr_phrase}, but it would stay above the commonly referenced 4% guideline, so keeping spending at a level your savings can support still matters. {combined} could {essentials}. Your remaining **{remaining}** stays invested for lifestyle spending, future needs, and a potential legacy for loved ones.",
  "L3-rise": "Your {wr_phrase} would rise, because less of your savings would remain invested. {combined} could {essentials}. The amount allocated to lifetime income and the spending level your remaining savings can support are important planning considerations.",
  "L3-flat": "Your {wr_phrase} would remain approximately unchanged. Although lifetime income reduces the amount needed from savings, a smaller portfolio remains available to fund withdrawals. {combined} could {essentials}. The amount allocated to lifetime income and the spending level your remaining savings can support are important planning considerations.",
  "E-full": "cover all of your current essential expenses",
  "E-cap": "cover **{ess_pct}%** of your current essential expenses, leaving **{ess_left} a month** to come from savings. We kept the income layer to no more than half your savings so you keep flexibility",
  "E-fund": "cover **{ess_pct}%** of your current essential expenses, leaving **{ess_left} a month** to come from savings. The income layer is limited to the IRA or eligible workplace-plan money available to fund it",
  "TR": "**The tradeoff:** In exchange for more predictable income designed to last {life_long}, you give up some growth potential and flexibility. The {premium} is no longer invested in your portfolio, access to those funds may be limited, and level income payments will gradually lose purchasing power as prices rise.",
  "CM-label": "Essential expenses covered by reliable income",
  "CM": "{cm_lead} Reliable income here means Social Security, pensions and estimated lifetime income; future coverage may change as expenses and income change.",
  "P-head": "You told us what matters most",
  "CTA": "A **no-cost Retirement Clarity Review with a licensed specialist** can walk through your numbers with you and show the options that fit what matters most to you.",
  "CTA-0": "A **no-cost Retirement Clarity Review with a licensed specialist** can walk through your numbers with you and show the options that fit your retirement goals.",
  "C1-button": "Schedule my Retirement Clarity Review",
  "C1-micro": "No cost · No obligation",
  "A-soft-link": "Want to see how lifetime income could change this? **See it with lifetime income →**",
  "A-soft-review": "Want to see how lifetime income could change this? We can walk you through it in your review.",
  "MN": "{mn_lead}, not a prediction of how long your savings will last. The 4% guideline is a general planning reference; future returns, inflation, spending, and income terms all matter.",
  "see-numbers": "See the numbers",
  "key-results-heading": "Key results, {year}",
  "L3-flat-neutral": "Your {wr_phrase} would remain approximately unchanged. {combined} could {essentials}. The amount allocated to lifetime income and the spending level your remaining savings can support are important planning considerations.",
  "E-partial": "cover **{ess_pct}%** of your current essential expenses, leaving **{ess_left} a month** to come from savings",
  "H-noinc": "**In {year}, your savings may need to cover {gap_today} a month.** That's {spending} of spending plus {tax_today} of estimated taxes, with no Social Security or pension income entered.",
  "Bridge-rate": "Your first-year rate ({wr_first}) is higher because savings cover the years before all your income starts. Those early withdrawals also reduce the balance available later.",
  "G-prelim": "{first_name}, here's your preliminary income picture",
  "G-prelim-noname": "Your preliminary income picture",
  "N-range": "Income estimates are currently available for ages 55 to 75 and for income that starts within 10 years. Talk with us for a personalized estimate if you fall outside this age range, or want longer deferral periods.",
  "N-unavail": "Estimate temporarily unavailable.",
  "N-nofunds": "This self-service estimate only uses traditional IRAs, Roth IRAs and workplace plans confirmed as available to roll over. We can look at your other options together in a free Retirement Clarity Review.",
  "N-nogap": "Your reliable income already covers your essential spending in {year}.",
  "N-error": "We couldn't build the income comparison for these answers.",
  "TU": "Your savings may not be able to fund this year's draw: about {unfunded}/mo of spending and taxes couldn't be covered in {year}.",
  "MSG-plan": "A workplace plan was left out of this estimate because the amount available to roll over now isn't confirmed. We can review it with you.",
  "PV-prelim": "Your estimate excludes income you haven't provided yet, so your actual savings requirement may be lower.",
  "PV-ss-unknown": "Social Security isn't included in this estimate, so the gap may look larger than it is.",
  "PV-pension-unknown": "Pension income is left out for now; you can review it later.",
  "PV-annuity-later": "You indicated that you own an annuity that may provide income later. That potential income has not been included in this preliminary Snapshot.",
  "PV-ss-rough": "Based on your rough Social Security guess.",
  "C2-geo": "Consultations aren't available in your area yet. Here's your Snapshot.",
  "C2-gate": "Your Retirement Snapshot is complete.",
  "L-remaining-future": "**{remaining}** would remain invested when the income layer is established. Its modeled balance in {year} is approximately {bal_with}.",
  "RMD-note": "At your age, required minimum distributions from your pre-tax accounts are larger than this spending draw. The taxes shown are on the withdrawals your spending needs; the rest of the distribution and its taxes aren't shown.",
  "T0-bridge": "Your {ng_income} may be sufficient to cover your retirement spending in {year} without drawing from savings. That gives your investments greater flexibility for future needs, unexpected expenses, and a potential legacy. Reviewing how inflation and changing expenses could affect this balance over time remains an important part of retirement planning.",
  "PRINT-contact": "To schedule your no-cost Retirement Clarity Review, call (724) 390-3332."
 },
 "priority_paragraphs": {
  "knowing_income_lasts": {
   "label": "Knowing my income can last as long as I do",
   "full_single": "Social Security and lifetime income are designed to keep paying for as long as you live, which is why many plans use them to cover essential expenses. The savings that stay invested can then focus on growth, flexibility, and the costs you can't predict.",
   "full_couple": "Lifetime income is designed to keep paying for as long as either of you lives, and Social Security continues for life, though household benefits usually drop after the first death. That's why many plans use them to cover essential expenses, while the savings that stay invested focus on growth, flexibility, and the costs you can't predict.",
   "partial_single": "Social Security and lifetime income are designed to keep paying for as long as you live, which is why many plans use them for essential expenses. Here they would cover part of your essentials, so the savings that stay invested would still fund the rest along with growth, flexibility, and the costs you can't predict.",
   "partial_couple": "Lifetime income is designed to keep paying for as long as either of you lives, and Social Security continues for life, though household benefits usually drop after the first death. Here they would cover part of your essentials, so the savings that stay invested would still fund the rest.",
   "no_layer": "When all of your savings stay invested, how long your income lasts depends on market returns and how much you withdraw each year. Planning for a long retirement means testing your spending level against weak markets as well as strong ones.",
   "full_single_noss": "Lifetime income is designed to keep paying for as long as you live, which is why many plans use it to cover essential expenses. The savings that stay invested can then focus on growth, flexibility, and the costs you can't predict.",
   "partial_single_noss": "Lifetime income is designed to keep paying for as long as you live, which is why many plans use it for essential expenses. Here it would cover part of your essentials, so the savings that stay invested would still fund the rest along with growth, flexibility, and the costs you can't predict.",
   "full_couple_noss": "Lifetime income is designed to keep paying for as long as either of you lives, which is why many plans use it to cover essential expenses, while the savings that stay invested focus on growth, flexibility, and the costs you can't predict.",
   "partial_couple_noss": "Lifetime income is designed to keep paying for as long as either of you lives, which is why many plans use it for essential expenses. Here it would cover part of your essentials, so the savings that stay invested would still fund the rest."
  },
  "less_money_worry": {
   "label": "Enjoying retirement without constantly worrying about money",
   "full": "Worrying less about money often comes from knowing your essential bills are covered by reliable income each month. Pairing that income with savings that stay invested for everything else is one way to build that confidence.",
   "partial": "Worrying less about money often comes from knowing more of your essential bills are covered by reliable income each month. Here, part of those bills would still come from savings, so a clear spending plan matters as much as the income itself.",
   "no_layer": "Worrying less about money often comes from knowing a spending level your savings can support, and having a plan for when markets fall."
  },
  "confident_in_down_markets": {
   "label": "Feeling confident spending, even when markets are down",
   "full": "Spending confidently during a market downturn can be easier when your essential expenses are covered by reliable income. This can reduce the need to sell investments when markets are down, giving your remaining savings greater flexibility and the opportunity to participate in a potential recovery.",
   "partial": "Spending confidently in a down market is easier when less of your essential spending depends on selling investments. Level lifetime income doesn't rise or fall with the markets, but part of your essentials would still come from savings, so a plan for down markets still matters.",
   "no_layer": "With all of your savings invested, a down market can mean selling investments at lower prices to cover expenses. A plan for adjusting withdrawals, or for which assets to draw from first, can help you keep spending with confidence."
  },
  "travel_bucket_list": {
   "label": "Having the freedom to travel and enjoy my bucket list",
   "full": "Travel and bucket-list plans usually come from lifestyle spending, so they depend on the savings that stay invested. Covering essentials with reliable income lets you plan those experiences separately from the bills that must be paid.",
   "partial": "Travel and bucket-list plans usually come from lifestyle spending, so they depend on the savings that stay invested. With part of your essentials still coming from savings too, planning when and how to fund those experiences matters even more.",
   "no_layer": "Travel and bucket-list plans often come early in retirement, when withdrawals are highest and a market drop can hurt most. Planning when and how to fund them can help keep them from crowding out your later years."
  },
  "legacy": {
   "label": "Leaving something meaningful to the people I care about",
   "full": "Lifetime income strategies are designed to support your retirement spending needs. An important part of retirement planning is finding the right balance between assets that provide reliable income for essential expenses and savings that remain invested for future growth, flexibility, and a legacy for loved ones.",
   "partial": "Lifetime income strategies are designed to support your retirement spending needs. In this example, reliable income would cover part of your essential expenses, with your remaining savings still needed to fund the difference. Finding the right balance means preserving flexibility for future spending, growth, and the legacy you hope to leave loved ones.",
   "no_layer": "Leaving something meaningful depends on what your savings can still hold after years of withdrawals. Balancing what you spend now with what you hope to pass on is an important part of retirement planning."
  },
  "spouse_secure": {
   "label": "Knowing my spouse or partner will be financially secure",
   "full_couple": "Joint lifetime income is designed to keep paying for as long as either of you lives, while household Social Security usually drops after the first death. Covering essential expenses this way can help the surviving spouse keep paying the bills, with the savings that stay invested available for everything else.",
   "partial_couple": "Joint lifetime income is designed to keep paying for as long as either of you lives, while household Social Security usually drops after the first death. Here it would cover part of your essentials, so planning how the surviving spouse would fund the rest still matters.",
   "no_layer_couple": "When one spouse dies, household Social Security usually drops while many expenses stay the same. Planning how the surviving spouse's income and savings would cover the bills is an important part of a retirement plan.",
   "single_any": "This Snapshot models income for you alone. If a spouse or partner relies on your income, your review can look at how your plan would support them.",
   "single_any_nobook": "This Snapshot models income for you alone. If a spouse or partner relies on your income, that is worth planning for separately."
  }
 },
 "labels": {
  "tile_needed": "Needed from savings",
  "tile_wr": "{wr_label}",
  "tile_wr_sub_today": "of {bal_today} {bal_when}",
  "tile_wr_sub_layer": "{rate_change} · of {bal_with} {bal_when_layer}",
  "tile_needed_sub_today": "Reliable income covers {coverage_total_today}%",
  "tile_needed_sub_layer": "↓ {net_gap_reduction} a month less",
  "caption_income": "Reliable income covers {x}%",
  "caption_savings": "Savings cover {y}%",
  "ledger": [
   "Monthly spending",
   "Estimated taxes",
   "Social Security & pensions",
   "Lifetime income",
   "Needed from savings"
  ],
  "legend": [
   "Essential",
   "Lifestyle",
   "Estimated taxes",
   "Social Security & pensions",
   "Lifetime income",
   "Needed from savings"
  ],
  "key_results_rows": [
   "Needed from savings",
   "{wr_label}",
   "Essential expenses covered by reliable income",
   "Lifetime income (estimated, before taxes)",
   "Savings in the income layer",
   "Savings that stay invested",
   "Spending covered by reliable income"
  ],
  "tile_wr_none": "No portfolio withdrawals needed.",
  "tile_unfunded": "Unfunded monthly need",
  "key_results_rows_future_extra": "Modeled balance in {year}"
 },
 "token_values": {
  "vs_4": {
   "wr_display<4.0": "below",
   "wr_display==4.0": "approximately in line with"
  },
  "vs_4_new": {
   "wr_new_display<4.0": "below",
   "wr_new_display==4.0": "approximately in line with"
  },
  "life": {
   "single_or_not_joint_contract": "for life",
   "joint_life_contract": "for as long as either of you lives"
  },
  "life_long": {
   "single_or_not_joint_contract": "for life",
   "joint_life_contract": "as long as either of you lives"
  },
  "income_label": {
   "ss_only": "Social Security",
   "pension_only": "your pension",
   "both": "Social Security and your pension",
   "none": null
  },
  "combined": {
   "income_kind != none": "Combined with {income_label}, this income",
   "income_kind == none": "On its own, this income"
  },
  "wr_phrase": {
   "year == first retirement year": "first-year portfolio withdrawal rate",
   "otherwise (bridge)": "portfolio withdrawal rate in {year}"
  },
  "wr_label": {
   "year == first retirement year": "First-year portfolio withdrawal rate",
   "otherwise (bridge)": "Portfolio withdrawal rate in {year}"
  },
  "cm_lead": {
   "no bridge": "First-year estimate.",
   "bridge": "Estimate for {year}."
  },
  "mn_lead": {
   "no bridge": "These are first-year estimates",
   "bridge": "These are estimates for {year}"
  },
  "bal_when": {
   "year == current year": "in savings",
   "otherwise": "at the start of {year}"
  },
  "bal_when_layer": {
   "year == current year": "remaining",
   "otherwise": "at the start of {year}"
  },
  "rate_change": {
   "wr_new < wr_today": "down from {wr_today}",
   "wr_new > wr_today": "up from {wr_today}",
   "equal (displayed)": "about the same as {wr_today}"
  },
  "ng_income": {
   "both": "Social Security and other reliable income",
   "ss_only": "Social Security",
   "pension_only": "pension and other reliable income"
  }
 },
 "disclosures": {
  "source": "Live baseline funnel \"RetireMentum — Retirement Snapshot (rm-box 1.0.5)\", Perspective id 6af60a1a5cedbd9c9677098f, read Nov 19, 2026. Verbatim; do not edit.",
  "snapshot_footer_always": [
   "Figures for each year are in that year's dollars (future dollars), assume 2.5% yearly inflation, and include estimated federal and state income tax. This is an educational estimate, not advice.",
   "Income amounts (Social Security, pensions and estimated annuity income) are shown before taxes. Spending amounts include estimated taxes.",
   "Your spending estimate doesn't include long-term care or unusual medical costs, which may need separate planning."
  ],
  "snapshot_footer_couple": "For couples, this snapshot starts when both of you are retired. It leaves out the years when one of you may still be working.",
  "snapshot_footer_mix_estimated": "We used an illustrative balanced investment mix because your actual allocation was not provided.",
  "how_we_calculate_link": "How we calculate",
  "layer_always_visible": [
   "Estimated income for comparison only. This is not a quote or an offer. See details below.",
   "This is a hypothetical estimate, not an offer, a quote or a recommendation. Rates change often, and actual income depends on the product, the insurance company, your state, your ages and the contract terms at purchase. Guarantees are backed by the financial strength and claims-paying ability of the issuing insurance company. Annuities are not FDIC-insured and are not bank deposits. Ask for a personalized illustration before making any decision.",
   "Estimates assume the income layer is funded from Traditional or Roth IRAs, or from a workplace plan that can be rolled over. Moving these funds directly to an annuity generally creates no current income tax. Using other savings could create taxes at purchase; we'll review funding options with you."
  ],
  "layer_facts": [
   "Rate source: middle of the three highest quotes we collected for level lifetime income from fixed indexed annuity income riders, before rider fees. Rates as of {quote_dates}.",
   "Level income: it doesn't rise with inflation.",
   "Access to your money: the premium leaves your invested savings. Most contracts limit extra withdrawals during a surrender period, often 7–10 years, and withdrawals above the income amount reduce future income."
  ],
  "layer_survivor_joint": "Survivor: joint income continues as long as either of you is living. Any remaining contract value after that goes to your beneficiaries.",
  "layer_survivor_single": "Survivor: income stops at death. Any remaining contract value goes to your beneficiaries.",
  "layer_methodology_link": "How this estimate is calculated",
  "layer_methodology_behind_link": "Estimated lifetime income is based on quotes for fixed indexed annuities with lifetime income riders, gathered from an independent annuity quoting service on {quote_dates} for a $100,000 premium and scaled to the amount shown. For each age, single or joint coverage, and waiting period, we use the middle of the three highest quoted annual amounts. Quotes were collected for ages 55, 60, 65, 70 and 75. For ages in between, we estimate between the two nearest quoted ages. Estimates are available for ages 55 to 75. Single-life figures were quoted for a female. Joint-life figures use the younger spouse's age and assume income continues unchanged to the surviving spouse. Income that starts later reflects each income rider's growth terms as quoted. Rider fees are charged separately and reduce the contract value."
 },
 "priority_key_map": {
  "last": "knowing_income_lasts",
  "worry": "less_money_worry",
  "downturns": "confident_in_down_markets",
  "spouse": "spouse_secure",
  "bucket": "travel_bucket_list",
  "legacy": "legacy"
 },
 "priority_rules": [
  "knowing_income_lasts uses the *_noss versions when the household has no Social Security in {year}.",
  "spouse_secure: couple versions for two-person households; single_any (or single_any_nobook when booking is not allowed) for one-person households."
 ],
 "owner_approval_record": {
  "approver": "Gary Jensen, CFP®",
  "date": "2026-11-19",
  "source": "Snapshot v3.1 Owner Approvals, Final Corrections & Release Instructions",
  "approved": [
   "four-part narrative",
   "coverage rounding (nearest whole %, partial capped at 99%)",
   "confident_in_down_markets.full",
   "legacy.partial",
   "licensed specialist wording",
   "income methodology and disclosures",
   "$250,000 and AK/HI booking rules",
   "no-gap narrative and tile",
   "Unfunded monthly need label",
   "H20 future-year explanation",
   "RMD-note",
   "T0-bridge",
   "PRINT-contact (print-only line, shown when booking is allowed; RetireMentum general number from GHL)",
   "no carrier/IMO/legal review required (owner, Nov 19, 2026 7:25 pm CT)",
   "Snapshot code hosted on GitHub Pages as hash-pinned files",
   "Compare income strategies button shown only to households that entered a workplace plan"
  ]
 }
}; },
    "./fmt.js": function (module, exports, require) {
// RetireMentum Snapshot v3.1 RC1: reference formatter.
// Input: rm-box 1.0.5 results (mode 'none' and, when shown, mode 'essential') plus visitor context.
// Output: display values (every one traceable to an engine field), the original engine values, and branch IDs.
// Engine values are never modified. Display rounding rules:
//   R1 Headline results (needed from savings, gross lifetime income, premium, balances, rates) = each engine value rounded on its own.
//   R2 Breakdown lines that explain a headline are rounded so they add up exactly to the headline, using largest-remainder
//      rounding on spending and estimated taxes only (lifetime card: taxes only, so spending and income match today's card);
//      income and the gross lifetime payment are never adjusted. In the lifetime card four figures are rounded on their own
//      (spending, income, payment, needed from savings), so its estimated-tax line can sit up to $2 from the engine value. Each line stays
//      within $1 of its engine value; if that is impossible the test suite fails.
//   R3 "less" = displayed today amount minus displayed lifetime-income amount (so the tiles add up on screen). It is never
//      set equal to the gross payment; when taxes don't change, it can differ from the gross payment by $1 (rounding).
//   R4 Coverage % = nearest whole percent of the unrounded engine coverage; below 100% shows at most 99%.
//      Full vs partial is decided on the engine's unrounded remaining essential gap (<= $1 a year = full).
//   R5 Rates: one decimal, half up, only when the engine rate state is "ok".
const CURRENT_YEAR = 2026;
const DIV = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2 };
const r0 = x => Math.round(x);
const wrDisp = r => Math.round(r * 1000 + 1e-9) / 10;
const covPct = (x, full) => full ? 100 : Math.min(99, Math.round(x * 100 + 1e-9));

// Largest-remainder rounding of signed parts to an exact integer total (R2). Returns rounded parts and the adjustments made.
function reconcile(parts, total, locked, fixed) {
  locked = locked || []; fixed = fixed || {};
  const out = parts.map((p, i) => i in fixed ? fixed[i] : r0(p)), adj = parts.map(() => 0);
  let diff = total - out.reduce((a, b) => a + b, 0), guard = 0;
  while (diff !== 0 && guard++ < 10) {
    const s = Math.sign(diff); let best = -1, bestv = -Infinity;
    parts.forEach((p, i) => { if (locked.includes(i)) return; const v = (p - out[i]) * s; if (v > bestv) { bestv = v; best = i; } });
    out[best] += s; adj[best] += s; diff -= s;
  }
  return { out, adj };
}
function rmdAge(birthYear) { return birthYear <= 1950 ? 72 : birthYear <= 1959 ? 73 : 75; }

function display(base, cmp, ctx) {
  const B = base.before, B1 = base.beforeAtRetirement || B, inp = ctx.inputs || {};
  const d = { engine: { before: B, beforeAtRetirement: B1, assets: base.assets, after: cmp && cmp.after, layer: cmp && cmp.layer } };
  const CY = Number(ctx.asOfYear) || CURRENT_YEAR;
  d.year = B.year; d.first_year = B1.year; d.bridge = B.year > B1.year; d.future = B.year !== CY;
  d.two = !!ctx.two; d.savings_total = base.assets;
  d.unfundable = B.rateState === 'unfundable';
  d.no_gap = !d.unfundable && (B.rateState === 'zero' || B.fromPortfolio <= 0.5);
  const need = d.unfundable ? B.fromPortfolio + B.shortfall + B.discretionaryGap : B.fromPortfolio;
  d.gap_today = d.no_gap ? 0 : r0(need / 12);                             // R1
  const spend = (B.essential + B.discretionary) / 12, tax = B.tax / 12, inc = (B.socialSecurity + B.otherIncome) / 12;
  if (d.no_gap) { d.spending = r0(spend); d.tax_today = r0(tax); d.ss_pension = r0(inc); d.breakdown_adj = [0, 0, 0]; }
  else { const rc = reconcile([spend, tax, -inc], d.gap_today, [2]); /* income is never adjusted */ d.spending = rc.out[0]; d.tax_today = rc.out[1]; d.ss_pension = -rc.out[2]; d.breakdown_adj = rc.adj; }
  d.income_kind = B.socialSecurity > 0 && B.otherIncome > 0 ? 'both' : B.socialSecurity > 0 ? 'ss_only' : B.otherIncome > 0 ? 'pension_only' : 'none';
  d.has_ss = B.socialSecurity > 0;
  // Coverage (R4)
  d.cov_full_today = B.shortfall <= 1;
  d.coverage_today = (B.essential + B.essentialTax) <= 0 ? null : covPct(B.essentialCovered, d.cov_full_today);
  d.ess_left_today = d.cov_full_today ? 0 : r0(B.shortfall / 12);
  const allNeed = B.essential + B.discretionary + B.tax;
  d.cov_total_today = need <= 6 ? 100 : covPct(Math.min(1, B.guaranteed / allNeed), false);
  // Rates (R5) and the balance each rate is measured on
  d.rs_today = B.rateState;
  d.wr_today = B.rateState === 'ok' ? wrDisp(B.rate) : null;
  d.bal_today = B.rateState === 'ok' && B.rate > 0 ? r0(B.fromPortfolio / B.rate) : null;
  d.wr_first = B1.rateState === 'ok' ? wrDisp(B1.rate) : null; d.gap_first = r0(B1.fromPortfolio / 12);
  d.unfunded_today = d.unfundable ? r0((B.shortfall + B.discretionaryGap) / 12) : 0;
  // RMD check (P0-C): engine taxes are the taxes on the spending-funded withdrawal; RMDs above that draw are not shown.
  const ageNow = Number(inp.age), by = CY - ageNow, ageY = Number(B.age);
  const pretaxNow = (Number(inp.iraC) || 0) + (Number(inp.planC) || 0);
  let pretaxY = pretaxNow;
  if (d.future && d.bal_today && base.assets > 0) pretaxY = d.bal_today * pretaxNow / base.assets;
  d.rmd_est_today = ageY >= rmdAge(by) && DIV[ageY] ? r0(pretaxY / DIV[ageY] / 12) : 0;   // client only; monthly
  d.rmd_note = d.rmd_est_today > 0 && d.rmd_est_today > r0(B.fromPortfolio / 12) + 1;
  // Comparison
  d.cmp_status = cmp ? cmp.status : 'not_run';
  if (cmp && cmp.status === 'ok') {
    const A = cmp.after, L = cmp.layer;
    d.premium = L.premium; d.gross_li = L.monthlyIncome; d.remaining = base.assets - L.premium;
    d.rs_with = A.rateState;
    d.gap_with = r0(A.fromPortfolio / 12);                                // R1
    d.net_gap_reduction = d.gap_today - d.gap_with;                       // R3
    d.net_exact = (B.fromPortfolio - A.fromPortfolio) / 12;
    d.pct_less = d.gap_today > 0 && d.net_gap_reduction > 0 ? r0(d.net_exact / (B.fromPortfolio / 12) * 100) : null;
    d.tax_delta_exact = (A.tax - B.tax) / 12;
    const rc = reconcile([(A.essential + A.discretionary) / 12, A.tax / 12, -(A.socialSecurity + A.otherIncome) / 12, -A.layerIncome / 12], d.gap_with, [0, 2, 3], { 0: d.spending, 2: -d.ss_pension, 3: -L.monthlyIncome });   // spending and income match today's card; the gross payment is never adjusted; only estimated taxes absorb rounding
    d.ledger_with = { spending: rc.out[0], tax: rc.out[1], ss_pension: -rc.out[2], lifetime: -rc.out[3], adj: rc.adj };
    d.wr_with = A.rateState === 'ok' ? wrDisp(A.rate) : null;
    d.bal_with = A.rateState === 'ok' && A.rate > 0 ? r0(A.fromPortfolio / A.rate) : null;
    d.cov_full_with = A.shortfall <= 1;
    d.coverage_with = (A.essential + A.essentialTax) <= 0 ? null : covPct(A.essentialCovered, d.cov_full_with);
    d.ess_left_with = d.cov_full_with ? 0 : r0(A.shortfall / 12);
    d.cov_total_with = A.fromPortfolio <= 6 ? 100 : covPct(Math.min(1, A.guaranteed / (A.essential + A.discretionary + A.tax)), false);
    d.constraint = cmp.cta ? cmp.cta.reason : 'none';
    d.joint = d.two;                                                      // rm-box prices joint layers at 100% to the survivor
    d.messages = cmp.messages;
  } else if (cmp) {
    d.no_layer_reason = cmp.noLayerReason || null;
    d.payout_status = cmp.payout ? cmp.payout.status : null; d.payout_rate_data = cmp.payout ? cmp.payout.rateData : null; d.payout_reason = cmp.payout ? cmp.payout.reason : null;
    d.error_code = cmp.code || null; d.messages = cmp.messages || [];
  }
  d.geo_ok = ctx.state !== 'AK' && ctx.state !== 'HI';
  d.booking = typeof ctx.bookingAllowed === 'boolean' ? ctx.bookingAllowed : (d.geo_ok && ctx.totalAssets >= 250000);   // the funnel passes its own A.bookingAvailable
  return d;
}

function branches(d, ctx) {
  const ids = [];
  ids.push(ctx.firstName ? (ctx.prelim ? 'G-prelim' : 'G') : (ctx.prelim ? 'G-prelim-noname' : 'G-noname'));
  ids.push(d.unfundable ? 'H-unf' : d.no_gap ? 'H0' : d.income_kind === 'none' ? 'H-noinc' : 'H');
  if (d.rmd_note) ids.push('RMD-note');
  if (d.bridge) ids.push('Bridge');
  // Beat 2
  if (d.unfundable) { /* the headline carries the live TU explanation */ }
  else if (d.no_gap) ids.push(d.bridge ? 'T0-bridge' : 'T0');
  else if (d.rs_today === 'none' || d.savings_total <= 0) ids.push('TX');
  else if (d.rs_today !== 'ok') ids.push('TO');
  else ids.push('TO', d.wr_today <= 4.0 ? 'T1' : d.wr_today <= 7.0 ? 'T2' : d.wr_today <= 13.0 ? 'T3' : 'T4');
  // Beat 3
  const beat3 = !ctx.optionA && !d.unfundable && !d.no_gap && d.rs_today === 'ok';
  let layer = false;
  if (beat3) {
    if (d.cmp_status === 'ok' && (d.wr_with === null)) ids.push('N-error');
    else if (d.cmp_status === 'ok') {
      layer = true;
      ids.push(d.net_gap_reduction > 0 ? 'LH' : 'LH-neutral', 'AL');
      if (d.wr_with > d.wr_today) ids.push('L3-rise');
      else if (d.wr_with === d.wr_today) ids.push(d.net_gap_reduction > 0 ? 'L3-flat' : 'L3-flat-neutral');
      else if (d.wr_today <= 4.0) ids.push('L1');
      else if (d.wr_with <= 4.0) ids.push('L2a');
      else ids.push('L2b');
      ids.push(d.cov_full_with ? 'E-full' : d.constraint === 'premium_above_cap' ? 'E-cap' : d.constraint === 'needs_other_accounts' ? 'E-fund' : 'E-partial');
      if (d.future) ids.push('L-remaining-future');
      ids.push('TR', 'CM');
    } else if (d.cmp_status === 'no_estimate') ids.push(d.payout_rate_data === 'unavailable' ? 'N-unavail' : 'N-range');   // same rule as the live funnel's renderCompare
    else if (d.cmp_status === 'no_layer' && d.no_layer_reason === 'no_eligible_funds') ids.push('N-nofunds');
    else if (d.cmp_status === 'no_gap') ids.push('N-nogap');
    else ids.push('N-error');
  }
  // Beat 4
  const p1 = ctx.priorities && ctx.priorities[0];
  if (p1) {
    ids.push('P-head');
    const col = !layer ? 'no_layer' : ids.includes('E-full') ? 'full' : 'partial';
    // No-gap path: paragraphs that assume withdrawals are not shown; spouse_secure has no such assumption.
    if (!d.no_gap || p1 === 'spouse') ids.push('P1:' + p1 + ':' + col);
  }
  if (d.booking) { ids.push(p1 ? 'CTA' : 'CTA-0', 'C1'); if (ctx.optionA) ids.push('A-soft-link'); }
  else ids.push(d.geo_ok ? 'C2-gate' : 'C2-geo');
  ids.push('MN');
  return ids;
}
module.exports = { display, branches, wrDisp, covPct, reconcile, rmdAge, DIV, CURRENT_YEAR };

    },
    "./snapshot.js": function (module, exports, require) {
// Snapshot v3.1 RC1: builds the page model from formatter output + copy, and renders it as text (for tests) and HTML.
const C = require('./copy_strings_v3.1.json');
const S = C.strings, P = C.priority_paragraphs, LB = C.labels, D = C.disclosures;
const usd = n => '$' + Math.round(n).toLocaleString('en-US');
const pc = n => n.toFixed(1) + '%';
const PRIO_LABEL = k => P[C.priority_key_map[k]].label;
function fill(t, v) { return t.replace(/\{(\w+)\}/g, (m, k) => (k in v && v[k] !== null && v[k] !== undefined) ? String(v[k]) : '«' + k + '»'); }
const firstSentence = t => t.split('. ')[0] + '.';

function tokens(d, ctx) {
  const lbl = { ss_only: 'Social Security', pension_only: 'your pension', both: 'Social Security and your pension', none: null }[d.income_kind];
  const v = {
    first_name: ctx.firstName, year: d.year, first_year: d.first_year,
    gap_today: usd(d.gap_today), spending: usd(d.spending), tax_today: usd(d.tax_today), ss_pension: usd(d.ss_pension), income_label: lbl,
    ng_income: C.token_values.ng_income[d.income_kind] || null,
    wr_today: d.wr_today !== null ? pc(d.wr_today) : null, wr_first: d.wr_first !== null ? pc(d.wr_first) : null, gap_first: usd(d.gap_first),
    unfunded: usd(d.unfunded_today),
    wr_phrase: d.bridge ? 'portfolio withdrawal rate in ' + d.year : 'first-year portfolio withdrawal rate',
    wr_label: d.bridge ? 'Portfolio withdrawal rate in ' + d.year : 'First-year portfolio withdrawal rate',
    combined: d.income_kind === 'none' ? 'On its own, this income' : 'Combined with ' + lbl + ', this income',
    cm_lead: d.bridge ? 'Estimate for ' + d.year + '.' : 'First-year estimate.', mn_lead: d.bridge ? 'These are estimates for ' + d.year : 'These are first-year estimates',
    bal_today: d.bal_today !== null ? usd(d.bal_today) : null, bal_when: d.future ? 'at the start of ' + d.year : 'in savings', bal_when_layer: d.future ? 'at the start of ' + d.year : 'remaining',
    vs_4: d.wr_today !== null && d.wr_today < 4.0 ? 'below' : 'approximately in line with'
  };
  if (d.cmp_status === 'ok') Object.assign(v, {
    gap_with: usd(d.gap_with), pct_less: d.pct_less, premium: usd(d.premium), gross_li: usd(d.gross_li), remaining: usd(d.remaining),
    life: d.joint ? 'for as long as either of you lives' : 'for life', life_long: d.joint ? 'as long as either of you lives' : 'for life',
    wr_new: d.wr_with !== null ? pc(d.wr_with) : null, vs_4_new: d.wr_with !== null && d.wr_with < 4.0 ? 'below' : 'approximately in line with',
    bal_with: d.bal_with !== null ? usd(d.bal_with) : null, ess_pct: d.coverage_with, ess_left: usd(d.ess_left_with),
    rate_change: d.wr_with === null || d.wr_today === null ? '' : (d.wr_with < d.wr_today ? 'down from ' : d.wr_with > d.wr_today ? 'up from ' : 'about the same as ') + pc(d.wr_today)
  });
  return v;
}

function priorityText(id, d, r) {
  const [, k, col] = id.split(':'), key = C.priority_key_map[k], pp = P[key];
  if (key === 'spouse_secure') return d.two ? pp[(col === 'no_layer' ? 'no_layer' : col) + '_couple'] : (d.booking ? pp.single_any : pp.single_any_nobook);
  if (key === 'knowing_income_lasts') return col === 'no_layer' ? pp.no_layer : pp[col + '_' + (d.two ? 'couple' : 'single') + (d.has_ss ? '' : '_noss')];
  return pp[col];
}

function model(d, ids, ctx) {
  const v = tokens(d, ctx), m = { ids, blocks: [], tiles: {}, keyResults: null, disclosures: [], beat: {} };
  const add = (beat, id, text) => m.blocks.push({ beat, id, text: fill(text, v) });
  const E = ids.find(x => /^E-/.test(x)); if (E) v.essentials = fill(S[E], v);
  for (const id of ids) {
    if (id === 'G' || id === 'G-noname' || id === 'G-prelim' || id === 'G-prelim-noname') { m.greeting = fill(S[id] || C.strings[id], v); continue; }
    if (id === 'H-unf') { add(1, id, '**' + S.TU + '** ' + S.H.split('** ')[1]); continue; }
    if (id === 'RMD-note') { add(1, id, S['RMD-note']); continue; }
    if (id === 'Bridge') { add(1, id, S.Bridge); if (d.wr_first !== null && d.wr_today !== null && d.wr_first - d.wr_today > 1) add(1, 'Bridge-rate', S['Bridge-rate']); continue; }
    if (id === 'T0-bridge') { add(2, id, S['T0-bridge']); continue; }
    if (/^E-/.test(id) || id === 'P-head' || id === 'C1' || id === 'CM' || id === 'L-remaining-future') continue;
    if (/^L(1|2a|2b|3)/.test(id)) {
      let t = fill(S[id], v);
      if (ids.includes('L-remaining-future')) t = t.replace(/Your remaining \*\*[^*]+\*\* stays invested for lifestyle spending, future needs, and a potential legacy for loved ones\./, fill(S['L-remaining-future'], v));
      m.blocks.push({ beat: 3, id, text: t }); continue;
    }
    if (id.startsWith('P1:')) { add(4, id, priorityText(id, d)); continue; }
    if (id === 'MN') { let t = fill(S.MN, v); if (d.no_gap || d.unfundable) t = firstSentence(t); add(5, id, t); continue; }
    let t = S[id]; if (t === undefined) { m.blocks.push({ beat: 0, id, text: '«missing ' + id + '»' }); continue; }
    if (!d.booking && (id === 'N-range' || id === 'N-nofunds')) t = firstSentence(t);
    const beat = /^(H|H0|H-noinc)$/.test(id) ? 1 : /^(LH|LH-neutral|AL|TR|N-)/.test(id) ? 3 : /^T/.test(id) ? 2 : 4;
    add(beat, id, t);
  }
  if (ids.includes('E-cap') || ids.includes('E-fund')) { /* E text is inside the L paragraph */ }
  m.priorities = (ctx.priorities || []).map(PRIO_LABEL);
  m.showPriorities = ids.includes('P-head');
  m.cta = ids.includes('C1') ? { button: S['C1-button'], micro: S['C1-micro'] } : null;
  m.layerShown = ids.includes('AL');
  // Tiles
  const today = { needLabel: d.unfundable ? LB.tile_unfunded : LB.tile_needed, need: d.gap_today, needSub: d.unfundable ? null : fill(LB.tile_needed_sub_today, { coverage_total_today: d.cov_total_today }),
    rateLabel: v.wr_label };
  if (d.no_gap) { today.rate = null; today.rateText = LB.tile_wr_none; }
  else if (d.unfundable) { today.rate = null; today.rateText = "Your savings wouldn't cover this year's withdrawals"; }
  else if (d.wr_today === null) { today.rate = null; today.rateText = "Needs a specialist's review"; }
  else { today.rate = v.wr_today; today.rateSub = fill(LB.tile_wr_sub_today, v); }
  today.ledger = d.no_gap || d.unfundable ? null : [['Monthly spending', d.spending], ['Estimated taxes', d.tax_today], ['Social Security & pensions', -d.ss_pension]];
  m.tiles.today = today;
  if (m.layerShown) {
    m.tiles.layer = { needLabel: LB.tile_needed, need: d.gap_with, needSub: ids.includes('LH') ? fill(LB.tile_needed_sub_layer, { net_gap_reduction: usd(d.net_gap_reduction) }) : null,
      rateLabel: v.wr_label, rate: v.wr_new, rateSub: fill(LB.tile_wr_sub_layer, v),
      ledger: [['Monthly spending', d.ledger_with.spending], ['Estimated taxes', d.ledger_with.tax], ['Social Security & pensions', -d.ledger_with.ss_pension], ['Lifetime income', -d.ledger_with.lifetime]] };
    m.meter = { label: S['CM-label'], today: d.coverage_today, withLayer: d.coverage_with, note: fill(S.CM, v) };
    m.keyResults = [
      ['Needed from savings', usd(d.gap_today) + '/mo', usd(d.gap_with) + '/mo'],
      [v.wr_label, v.wr_today, v.wr_new],
      [S['CM-label'], d.coverage_today + '%', d.coverage_with + '%'],
      ['Lifetime income (estimated, before taxes)', 'None', usd(d.gross_li) + '/mo'],
      ['Savings in the income layer', 'None', usd(d.premium)],
      ['Savings that stay invested', usd(d.savings_total), usd(d.remaining)]
    ];
    if (d.future) m.keyResults.push([fill(LB.key_results_rows_future_extra, v), v.bal_today, v.bal_with]);
    m.keyResults.push(['Spending covered by reliable income', d.cov_total_today + '%', d.cov_total_with + '%']);
  }
  // Disclosures
  m.disclosures = D.snapshot_footer_always.slice();
  if (d.two) m.disclosures.push(D.snapshot_footer_couple);
  if (ctx.mixEstimated) m.disclosures.push(D.snapshot_footer_mix_estimated);
  if (m.layerShown) {
    m.layerDisclosures = D.layer_always_visible.slice();
    m.layerFacts = D.layer_facts.map(t => fill(t, { quote_dates: ctx.quoteDates || 'the dates shown' })).concat([d.joint ? D.layer_survivor_joint : D.layer_survivor_single]);
    m.methodology = fill(D.layer_methodology_behind_link, { quote_dates: ctx.quoteDates || 'the dates shown' });
  }
  if (d.messages && d.messages.some(x => /workplace plan was left out/.test(x))) m.blocks.push({ beat: 3, id: 'MSG-plan', text: S['MSG-plan'] });
  m.v = v;
  return m;
}

function toText(m) {
  const lines = [m.greeting];
  for (const b of m.blocks) lines.push('[' + b.id + '] ' + b.text);
  const t = m.tiles.today;
  lines.push('[tile today] ' + t.needLabel + ' ' + usd(t.need) + (t.needSub ? ' · ' + t.needSub : '') + ' | ' + t.rateLabel + ': ' + (t.rate ? t.rate + ' · ' + t.rateSub : t.rateText));
  if (m.tiles.layer) { const l = m.tiles.layer; lines.push('[tile layer] ' + l.needLabel + ' ' + usd(l.need) + (l.needSub ? ' · ' + l.needSub : '') + ' | ' + l.rateLabel + ': ' + l.rate + ' · ' + l.rateSub); }
  if (m.showPriorities) lines.push('[priorities] ' + m.priorities.join(' → '));
  if (m.cta) lines.push('[button] ' + m.cta.button + ' / ' + m.cta.micro);
  return lines.join('\n');
}

// ---------- HTML ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const PRINTER = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';

// All rules are scoped to .rms so the Snapshot can sit inside the funnel page without touching its styles.
const CSS = `
.rms{font-family:'Open Sans',Arial,sans-serif;color:#0F2D52;display:flex;flex-direction:column;gap:20px}
.rms *{box-sizing:border-box}
.rms .rms-brand{display:none}
.rms .rms-brand.show{display:block;padding:0 0 10px;border-bottom:1px solid #DDE4EE}
.rms .rms-brand b{font-family:Montserrat,Arial,sans-serif;font-weight:800;font-size:20px}.rms .rms-brand b i{color:#A8721A}.rms .rms-brand span{font-size:12px;color:#4A5668;margin-left:6px}.rms .rms-brand em{display:block;font-style:normal;font-size:12px;color:#4A5668}
.rms .greet{font-size:13px;font-weight:700;color:#1B6B33}
.rms h1{margin:6px 0;font-family:Montserrat,Arial,sans-serif;font-weight:800;font-size:clamp(26px,3.2vw,36px);line-height:1.2;color:#0F2D52;text-wrap:balance}
.rms h1.long{font-size:clamp(22px,2.6vw,28px)}
.rms p{margin:0;font-size:15px;line-height:1.6;color:#22324A}
.rms .sub{color:#2E3D52;line-height:1.55}
.rms .note{margin-top:8px;background:#EAF0F8;border-radius:10px;padding:10px 12px;font-size:14px;color:#2E3D52}
.rms .grid{display:grid;grid-template-columns:1fr;gap:20px;align-items:start}
@media(min-width:900px){.rms .grid{grid-template-columns:1fr 1fr}}
.rms .card{background:#fff;border:1px solid #DDE4EE;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px}
.rms .card.slim{padding:16px 20px}
.rms h2{margin:0;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:19px;color:#0F2D52}
.rms .badge{display:inline-block;vertical-align:middle;margin-left:6px;background:#EAF0F8;border-radius:6px;padding:3px 8px;font-family:'Open Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.rms .lh{font-weight:700}
.rms .tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rms .tile{background:#F4F7FB;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:4px;min-height:120px}
.rms .tl{font-size:13.5px;font-weight:700}.rms .tv{font-family:Montserrat,Arial,sans-serif;font-weight:800;font-size:28px}.rms .tv small{font-size:14px}
.rms .tv.need{color:#8F1D2C}.rms .tv.need.zero{color:#1B6B33}.rms .tv.txt{font-size:15px;line-height:1.35}
.rms .ts{font-size:12.5px;color:#4A5668}
.rms .ledger{display:flex;flex-direction:column;gap:6px;font-size:14.5px;margin-top:10px}.rms .ledger div{display:flex;justify-content:space-between}.rms .ledger span:last-child{font-weight:700}.rms .ledger .inc{color:#1B6B33}.rms .ledger .li{color:#8A5A00}
.rms .meter{display:flex;flex-direction:column;gap:8px}.rms .ml{font-size:13.5px;font-weight:700}.rms .mrow{display:flex;align-items:center;gap:10px;font-size:12.5px}.rms .mrow span{width:120px;flex:none}
.rms .bar{flex:1;height:10px;border-radius:5px;background:#E6EBF2;overflow:hidden;display:flex}.rms .bar i{display:block;height:100%;background:#1B6B33}.rms .bar i.li{background:#DC9F36}.rms .mrow b{width:44px;text-align:right;font-family:Montserrat,Arial,sans-serif}.rms .mn{font-size:12px;color:#4A5668;line-height:1.5}
.rms .ldisc{border-top:1px solid #E6EBF2;padding-top:10px;display:flex;flex-direction:column;gap:6px}.rms .ldisc p,.rms .ldisc li{font-size:12px;line-height:1.5;color:#4A5668}.rms .ldisc ul{margin:0;padding-left:18px}
.rms details summary{cursor:pointer;color:#1A56C8;font-weight:600;font-size:13px;min-height:24px}
.rms .chips{display:flex;flex-wrap:wrap;gap:8px}.rms .chips span{background:#EAF0F8;border-radius:14px;padding:7px 12px;font-size:13.5px}
.rms .cta-btn{min-height:52px;padding:12px 16px;border:none;border-radius:10px;background:#1A56C8;color:#fff;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:16px;cursor:pointer}
.rms .cta-btn:hover{background:#123F94}
.rms .micro{font-size:13px;color:#4A5668;text-align:center}
.rms .softlink{font-size:13.5px;text-align:center;color:#4A5668}.rms .softlink a{color:#1A56C8;font-weight:700}
.rms table{width:100%;border-collapse:collapse;font-size:14px}.rms th,.rms td{text-align:left;padding:8px 6px;border-bottom:1px solid #E6EBF2}.rms td{font-weight:700;white-space:nowrap}
.rms .krd summary{display:none}
@media(max-width:899px){.rms .krd summary{display:list-item}.rms .krd:not([open]) h2,.rms .krd:not([open]) table{display:none}}
.rms .print-only{display:none}
.rms .printbar{display:flex;justify-content:center}
.rms .print-btn{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:10px 18px;background:#fff;color:#1A56C8;border:2px solid #1A56C8;border-radius:10px;font-family:'Open Sans',Arial,sans-serif;font-weight:700;font-size:15px;cursor:pointer}
.rms .print-btn:hover{background:#EEF4FE}.rms .print-btn:focus-visible,.rms .cta-btn:focus-visible{outline:3px solid #4486F6;outline-offset:2px}
@media(max-width:899px){.rms .print-btn{width:100%;justify-content:center}}
.rms .rms-foot{display:flex;flex-direction:column;gap:8px;padding:0 4px}.rms .rms-foot p{font-size:12px;line-height:1.55;color:#4A5668}.rms .rms-foot a{font-size:12px;color:#1A56C8}
@page{size:Letter;margin:0.5in 0.55in}
@media print{
html,body{background:#fff !important}
[data-rms-hide]{display:none !important}
.rms{-webkit-print-color-adjust:exact;print-color-adjust:exact;gap:10px}
.rms .rms-brand{display:block !important;padding:0 0 6px;border-bottom:1px solid #C9D3E0}
.rms .grid{grid-template-columns:1fr !important;gap:10px}
.rms .card{border:1px solid #C9D3E0;border-radius:10px;padding:10px 14px;gap:7px;break-inside:auto}
.rms .card.slim{padding:8px 14px}
.rms h1{font-size:20pt !important;margin:4px 0}.rms h1.long{font-size:16pt !important}
.rms h2{font-size:13.5pt;break-after:avoid;page-break-after:avoid}
.rms p,.rms .sub,.rms .note{font-size:10.5pt;line-height:1.42}
.rms p,.rms .fig,.rms .meter,.rms .ldisc ul,.rms li,.rms table,.rms tr,.rms .chips,.rms .mrow{break-inside:avoid;page-break-inside:avoid}
.rms .tile{min-height:0;padding:7px 10px}.rms .tv{font-size:19pt}.rms .tl{font-size:10pt}.rms .ts{font-size:9pt}
.rms .ledger{font-size:10.5pt;gap:3px}
.rms .meter .ml{font-size:10pt}.rms .mn{font-size:8.5pt}
.rms .ldisc p,.rms .ldisc li{font-size:8.5pt;line-height:1.38}
.rms table{font-size:10pt}.rms th,.rms td{padding:4px 6px}
.rms .kr,.rms .consult,.rms .rms-foot{break-inside:avoid;page-break-inside:avoid}
.rms .chips span{font-size:10pt;padding:4px 10px;border:1px solid #C9D3E0}
.rms button,.rms .printbar,.rms details>summary,.rms [data-id="A-soft-link"],.rms .micro,.rms .rms-foot a{display:none !important}
.rms .print-only{display:block !important;font-size:11pt;font-weight:700;color:#0F2D52;text-align:center;margin:2px 0}
.rms .rms-foot p{font-size:8.5pt;line-height:1.38}
}`;

function tile(t) {
  const ledger = t.ledger ? '<div class="ledger">' + t.ledger.map(([k, n]) => `<div><span>${esc(k)}</span><span class="${n < 0 ? (k === 'Lifetime income' ? 'li' : 'inc') : ''}">${n < 0 ? '−' + usd(-n) : (k === 'Monthly spending' ? usd(n) : '+' + usd(n))}</span></div>`).join('') + '</div>' : '';
  return `<div class="fig"><div class="tiles">
  <div class="tile"><span class="tl">${esc(t.needLabel)}</span><span class="tv need${t.need === 0 ? ' zero' : ''}">${usd(t.need)}<small>/mo</small></span>${t.needSub ? `<span class="ts">${esc(t.needSub)}</span>` : ''}</div>
  <div class="tile"><span class="tl">${esc(t.rateLabel)}</span>${t.rate ? `<span class="tv">${esc(t.rate)}</span><span class="ts">${esc(t.rateSub)}</span>` : `<span class="tv txt">${esc(t.rateText)}</span>`}</div>
</div>${ledger}</div>`;
}

// The Snapshot as an HTML fragment. opt: { print: true } opens details; opt.showBrand shows the brand header on screen;
// opt.preparedDate is printed under the brand; opt.bookAttrs is copied onto the booking button (e.g. the funnel's data attributes).
function fragment(m, opt) {
  opt = opt || {};
  const P_ = b => `<p data-id="${b.id}">${md(b.text)}</p>`;
  const B = n => m.blocks.filter(b => b.beat === n).map(P_).join('\n');
  const hb = m.blocks.find(b => b.beat === 1 && /^H/.test(b.id)) || { text: '' };
  const h1m = hb.text.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
  const h1 = h1m ? `<h1${h1m[1].length > 80 ? ' class="long"' : ''}>${esc(h1m[1])}</h1><p class="sub">${md(h1m[2])}</p>` : '';
  const rest1 = m.blocks.filter(b => b.beat === 1 && !/^H/.test(b.id)).map(b => `<p class="note" data-id="${b.id}">${md(b.text)}</p>`).join('');
  const lh = m.blocks.find(b => b.id === 'LH' || b.id === 'LH-neutral');
  const layer = m.layerShown ? `<section class="card">
  <h2>With lifetime income <span class="badge">${esc(S['LH-badge'] || 'Illustrative estimate')}</span></h2>
  <p class="lh">${md(lh.text.replace(/^\*\*With lifetime income, y/, '**Y'))}</p>
  ${tile(m.tiles.layer)}
  <div class="meter"><span class="ml">${esc(m.meter.label)}</span>
   <div class="mrow"><span>Today</span><div class="bar"><i style="width:${m.meter.today}%"></i></div><b>${m.meter.today}%</b></div>
   <div class="mrow"><span>With lifetime income</span><div class="bar"><i style="width:${m.meter.today}%"></i><i class="li" style="width:${Math.max(0, m.meter.withLayer - m.meter.today)}%"></i></div><b>${m.meter.withLayer}%</b></div>
   <span class="mn">${esc(m.meter.note)}</span></div>
  ${m.blocks.filter(b => b.beat === 3 && !/^LH/.test(b.id)).map(P_).join('\n')}
  <div class="ldisc">${m.layerDisclosures.map(t => `<p>${esc(t)}</p>`).join('')}<ul>${m.layerFacts.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  <details${opt.print ? ' open' : ''}><summary>${esc(D.layer_methodology_link)}</summary><p>${esc(m.methodology)}</p></details></div>
</section>` : m.blocks.filter(b => b.beat === 3).map(b => `<section class="card slim">${P_(b)}</section>`).join('');
  const kr = m.keyResults ? `<section class="card kr"><details class="krd"${opt.print ? ' open' : ''}><summary>See the numbers</summary><h2>Key results, ${m.v.year}</h2><table><thead><tr><th></th><th scope="col">Today's plan</th><th scope="col">With lifetime income</th></tr></thead><tbody>${m.keyResults.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></details></section>` : '';
  const soft = m.blocks.find(b => b.id === 'A-soft-link');
  const prio = (m.showPriorities ? `<h2>${esc(S['P-head'])}</h2><div class="chips">${m.priorities.map(p => `<span>${esc(p)}</span>`).join('')}</div>` : '') + m.blocks.filter(b => b.beat === 4 && b.id !== 'A-soft-link').map(P_).join('\n');
  const cta = (m.cta ? `<button type="button" class="cta-btn" data-rms="book"${opt.bookAttrs ? ' ' + opt.bookAttrs : ''}>${esc(m.cta.button)}</button><span class="micro">${esc(m.cta.micro)}</span>` : '') +
    (soft ? `<p class="softlink" data-id="A-soft-link">${esc(soft.text.replace(/\*\*[^*]+\*\*/, '').trim())} <a href="#" data-rms="optiona">${esc((soft.text.match(/\*\*([^*]+)\*\*/) || [, ''])[1])}</a></p>` : '');
  return `<div class="rms" data-rms-version="${VERSION}" data-copy-version="${esc(C.copy_version)}">
<div class="rms-brand${opt.showBrand ? ' show' : ''}"><b>Retire<i>Mentum</i></b><span>by Annuityverse</span>${opt.preparedDate ? `<em>Prepared ${esc(opt.preparedDate)}${opt.brandNote ? ' · ' + esc(opt.brandNote) : ''}</em>` : ''}</div>
<section><span class="greet">${esc(m.greeting)}</span>${h1}${rest1}</section>
<div class="grid">
<section class="card"><h2>Today's plan</h2>${tile(m.tiles.today)}${B(2)}</section>
${layer}
</div>
${kr}
<section class="card consult">${prio}${cta}</section>
${m.cta ? `<p class="print-only" data-id="PRINT-contact">${esc(S['PRINT-contact'])}</p>` : ''}
<div class="printbar"><button type="button" class="print-btn" data-rms="print" aria-label="Print or save this Snapshot as a PDF">${PRINTER}<span>Print / Save as PDF</span></button></div>
<footer class="rms-foot">${B(5)}${m.disclosures.map(t => `<p>${esc(t)}</p>`).join('')}<a href="#" data-rms="howcalc">How we calculate</a></footer>
</div>`;
}

// Browser only: puts the style sheet in the page once, wires the print button, and expands details / hides the rest of the page while printing.
function attach(root, doc) {
  doc = doc || root.ownerDocument; const win = doc.defaultView;
  if (!doc.getElementById('rms-style')) { const st = doc.createElement('style'); st.id = 'rms-style'; st.textContent = CSS; doc.head.appendChild(st); }
  if (win.matchMedia && win.matchMedia('(min-width:900px)').matches) root.querySelectorAll('.krd').forEach(d => { d.open = true; });
  let saved = null;
  const expand = () => {
    if (saved) return; saved = { open: [], hidden: [] };
    root.querySelectorAll('details').forEach(d => { saved.open.push([d, d.open]); d.open = true; });
    let n = root.closest('.rms') || root;   // hide everything that is not on the path to the Snapshot
    while (n && n.parentElement && n !== doc.body) { Array.from(n.parentElement.children).forEach(s => { if (s !== n && s.tagName !== 'SCRIPT' && s.tagName !== 'STYLE' && !s.hasAttribute('data-rms-hide')) { s.setAttribute('data-rms-hide', ''); saved.hidden.push(s); } }); n = n.parentElement; }
  };
  const restore = () => { if (!saved) return; saved.open.forEach(([d, o]) => { d.open = o; }); saved.hidden.forEach(s => s.removeAttribute('data-rms-hide')); saved = null; };
  win.addEventListener('beforeprint', expand); win.addEventListener('afterprint', restore);
  const mq = win.matchMedia && win.matchMedia('print'); if (mq && mq.addListener) mq.addListener(e => { e.matches ? expand() : restore(); });
  const pb = root.querySelector('[data-rms="print"]');
  if (pb) pb.addEventListener('click', () => { expand(); win.setTimeout(() => win.print(), 50); });
  return { expand, restore };
}

// Reference page (used for the QA renders): the fragment inside a bare page, brand shown on screen.
function toHTML(m, opt) {
  opt = Object.assign({ showBrand: true, preparedDate: 'November 19, 2026', brandNote: 'reference render from the v3.1 formatter (not the production funnel)' }, opt || {});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Retirement Snapshot · ${esc(opt.title || '')}</title>
<style>body{margin:0;background:#F4F7FB}.wrap{max-width:1120px;margin:0 auto;padding:20px 16px 40px}@media print{.wrap{padding:0}}${CSS}</style></head>
<body><div class="wrap">${fragment(m, opt)}</div>
<script>window.__rmsAttach=(${attach.toString()});var __r=window.__rmsAttach(document.querySelector('.rms'));function rmExpand(){__r.expand()}</script></body></html>`;
}
const VERSION = '1.0.1';
module.exports = { model, toText, toHTML, fragment, attach, CSS, tokens, usd, VERSION };

    }
  };
  var cache = {};
  function req(n) { if (cache[n]) return cache[n].exports; var m = cache[n] = { exports: {} }; defs[n](m, m.exports, req); return m.exports; }
  var F = req("./fmt.js"), SN = req("./snapshot.js"), COPY = req("./copy_strings_v3.1.json");
  function build(base, comparison, ctx) {
    var d = F.display(base, comparison, ctx), ids = F.branches(d, ctx), m = SN.model(d, ids, ctx);
    return { display: d, branches: ids, model: m };
  }
  function render(container, base, comparison, ctx, opt) {
    var b = build(base, comparison, ctx);
    container.innerHTML = SN.fragment(b.model, opt || {});
    b.print = SN.attach(container.querySelector(".rms"), container.ownerDocument);
    return b;
  }
  root.RMSnapshot = { version: "1.0.1", copyVersion: COPY.copy_version, build: build, render: render, fragment: SN.fragment, text: SN.toText, css: SN.CSS };
})(typeof window !== "undefined" ? window : this);
