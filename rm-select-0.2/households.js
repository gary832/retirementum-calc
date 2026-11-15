// Intake answers in the rm-calc answer-mapper format. Monthly amounts for spending and Social Security.
function household(over) {
  const base = {
    two: true, spouseName: 'Pat', age: 64, ageS: 64, retired: false, retAge: 65, retiredS: false, retAgeS: 65,
    spendStart: 'first', planAge: 95, planAgeS: 95, state: 'TX',
    spendMode: 'simple', spendTotal: 8000, essentialShare: 62.5, health: 'yes', healthAmt: null, budget: {},
    ss: 1750, ssStatus: 'estimate', ssClaim: 65, ssS: 1750, ssStatusS: 'estimate', ssClaimS: 65,
    mix: 'balanced', cEq: 60, cBd: 40, cCs: 0,
    iraC: 500000, planC: 0, rothC: 150000, iraS: 350000, planS: 0, rothS: 0, brokerage: 200000, shr: 50, fee: 1.0,
    penC: { has: false }, penS: { has: false }, annuity: 'none', otherAsk: false, other: []
  };
  return Object.assign(base, over || {});
}

// Profiles for the Option C test: different spending mixes, savings levels, guaranteed income and ages.
const profiles = {
  sample:        { label: 'Sample couple, 64/64, $1.2M, SS $3,500/mo, spend $8,000/mo (62.5% essential), TX', a: {} },
  lean:          { label: 'Lean couple, 63/61, $650k, SS $3,800/mo, spend $6,500/mo (75% essential), FL',
                   a: { age: 63, ageS: 61, retAge: 65, retAgeS: 65, state: 'FL', spendTotal: 6500, essentialShare: 75, ss: 2100, ssS: 1700, ssClaimS: 65,
                        iraC: 380000, iraS: 120000, rothC: 50000, rothS: 0, brokerage: 100000 } },
  affluent:      { label: 'Affluent couple, 62/60, $2.4M, SS $4,600/mo, spend $14,000/mo (45% essential), AZ',
                   a: { age: 62, ageS: 60, retAge: 65, retAgeS: 63, state: 'AZ', spendTotal: 14000, essentialShare: 45, ss: 2900, ssS: 1700, ssClaim: 67, ssClaimS: 67,
                        iraC: 1300000, iraS: 400000, rothC: 200000, rothS: 100000, brokerage: 400000 } },
  single:        { label: 'Single, 66, $800k, SS $2,400/mo, spend $5,500/mo (70% essential), NC',
                   a: { two: false, age: 66, ageS: null, retAge: 66, retired: true, state: 'NC', spendTotal: 5500, essentialShare: 70, ss: 2400, ssClaim: 66,
                        iraC: 600000, iraS: 0, rothC: 50000, rothS: 0, brokerage: 150000 } },
  pension:       { label: 'Couple with pension, 65/63, $900k, SS $3,600/mo + pension $2,000/mo, spend $9,000/mo (60% essential), OH',
                   a: { age: 65, ageS: 63, retired: true, retAge: 65, retAgeS: 65, state: 'OH', spendTotal: 9000, essentialShare: 60, ss: 2200, ssS: 1400, ssClaim: 65, ssClaimS: 65,
                        penC: { has: true, amt: 2000, age: 65, basis: 'quoted', cola: 'no', surv: '50' },
                        iraC: 550000, iraS: 150000, rothC: 0, rothS: 0, brokerage: 200000 } },
  highDisc:      { label: 'High discretionary, 60/60, $1.5M, SS $3,000/mo at 67, spend $10,000/mo (40% essential), TN',
                   a: { age: 60, ageS: 60, retAge: 62, retAgeS: 62, state: 'TN', spendTotal: 10000, essentialShare: 40, ss: 1600, ssS: 1400, ssClaim: 67, ssClaimS: 67,
                        iraC: 700000, iraS: 500000, rothC: 100000, rothS: 0, brokerage: 200000 } },
  highWithdrawal: { label: 'High withdrawal, single 66, $500k, SS $2,000/mo, spend $6,000/mo (70% essential), TX',
                   a: { two: false, age: 66, ageS: null, retired: true, retAge: 66, spendTotal: 6000, essentialShare: 70, ss: 2000, ssClaim: 66,
                        iraC: 450000, iraS: 0, rothC: 0, rothS: 0, brokerage: 50000 } },
  lowWithdrawal: { label: 'Low withdrawal, 67/66, $1.6M, SS $4,400/mo, spend $8,000/mo (65% essential), TX',
                   a: { age: 67, ageS: 66, retired: true, retiredS: true, retAge: 67, retAgeS: 66, spendTotal: 8000, essentialShare: 65, ss: 2600, ssS: 1800, ssClaim: 67, ssClaimS: 66,
                        iraC: 900000, iraS: 400000, rothC: 100000, rothS: 0, brokerage: 200000 } }
};

module.exports = { household, profiles };
