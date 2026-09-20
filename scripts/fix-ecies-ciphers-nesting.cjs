// npm hoists `@ecies/ciphers` (a transitive dep of eciesjs, itself a
// transitive dep of @dotenvx/dotenvx used by @opennextjs/cloudflare) to the
// root node_modules as a sibling of `eciesjs` rather than nesting it inside
// eciesjs's own node_modules. `@ecies/ciphers` needs @noble/ciphers@^1.x,
// but the root already has @noble/ciphers@2.x for better-auth — and because
// it was hoisted to root rather than nested under eciesjs, Node's
// directory-walking module resolution can never see eciesjs's own correct
// nested @noble/ciphers@1.x copy sitting right next to it. This is a real
// npm dedupe limitation for this specific graph shape (confirmed via `npm
// ls @noble/ciphers`, which reports the hoisted 2.x as "invalid" against
// @ecies/ciphers's own stated range) — overrides alone don't fix it because
// the version constraint is already correct on paper, only the physical
// nesting is wrong.
//
// This just copies the already-correct 1.x copy eciesjs has into where
// @ecies/ciphers will actually find it, with no new download.
const fs = require("fs")
const path = require("path")

const root = __dirname + "/.."
const source = path.join(root, "node_modules/eciesjs/node_modules/@noble/ciphers")
const dest = path.join(root, "node_modules/@ecies/ciphers/node_modules/@noble/ciphers")

if (!fs.existsSync(source) || !fs.existsSync(path.join(root, "node_modules/@ecies/ciphers"))) {
  // Dependency tree shape changed (or these packages are gone) — nothing to fix.
  process.exit(0)
}

fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.rmSync(dest, { recursive: true, force: true })
fs.cpSync(source, dest, { recursive: true })
console.log("Nested a compatible @noble/ciphers under @ecies/ciphers (npm hoisting workaround).")
