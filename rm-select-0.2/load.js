// Loads the RetireMentum engine files in funnel order into one context, after checking each file against its pinned SHA-256.
// Usage: require('./load.js') with --repo=<path to a clone of github.com/gary832/retirementum-calc> on the command line.
// A clone at a different commit, or any changed file, stops the run with exit code 2.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const PIN = {
  repo: 'https://github.com/gary832/retirementum-calc',
  commit: 'e331e24dbf3928b1b553894d96289633f1bab157',
  files: {
    'rm-calc-2.0.0.min.js': '96ae55fb98b1415c9404962a308edc3edf777583ee402700554af0c1f6111ea1',
    'rm-payout-lookup-1.0.0.js': '5a23f32c3fab28ee1d34f1ca137b7b7c4d65ea48886a61d35ec4712e57612c6b',
    'rm-box-1.0.5.js': '3ddc4f2ae965dbf37d7ab4fe7c0cd243e6bf5ecbff88d1cb7e45fde86905e713',
    'rm-payout-2026-11-11-r2.js': '4c0f10ed033ec76e01c140d6fb3d18d3651266319794f2e6b48bd499fd501ce8'
  }
};

const arg = process.argv.find(a => a.startsWith('--repo='));
const REPO = arg ? arg.slice(7) : process.env.RM_REPO;
if (!REPO) { console.error('Set --repo=<path to retirementum-calc clone> (or RM_REPO).'); process.exit(2); }

function stop(msg) { console.error('ENGINE PIN MISMATCH: ' + msg); process.exit(2); }

let commit = null;
try { commit = execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (e) { /* not a git checkout: hashes still checked */ }
if (commit && commit !== PIN.commit) stop(`repo is at ${commit}, expected ${PIN.commit}`);

const ctx = { console, Date, Math, JSON, Map, Set, Number, String, Object, Array, isFinite, isNaN, parseFloat, parseInt };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const [f, sha] of Object.entries(PIN.files)) {
  const src = fs.readFileSync(path.join(REPO, f));
  const got = crypto.createHash('sha256').update(src).digest('hex');
  if (got !== sha) stop(`${f} sha256 ${got}, expected ${sha}`);
  vm.runInContext(src.toString('utf8'), ctx, { filename: f });
}

module.exports = { RMCalc: ctx.RMCalc, RMPayout: ctx.RMPayout, RMBox: ctx.RMBox, rates: ctx.RMPayoutRates,
  pin: Object.assign({}, PIN, { checkedCommit: commit, node: process.version }) };
