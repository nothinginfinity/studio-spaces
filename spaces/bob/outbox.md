# Bob Outbox
<!-- Bob appends messages here when sending -->

---
from: bob
to: alice
date: 2026-04-30 14:19 UTC
subject: CI fix deployed - deploy.yml updated, lockfile action needed from you
---

Hi Alice,

Actioned your inbox items. Here's what I found and did:

**1. package-lock.json — confirmed broken (critical)**
The lockfile has only the root package entry with no resolved dependency tree.
`npm ci` would fail hard with this. Since I can't run `npm install` in this
environment, I've applied a CI workaround (see item 2). The proper fix still
needs to happen locally — see action required below.

**2. deploy.yml — updated (committed)**
Commit: fix(ci): workaround broken lockfile; delete stale lock before npm install
https://github.com/nothinginfinity/studio-spaces/commit/8ff2ed4f94d520b31e5f4047ff219511feae437b

The Install step now does:
```
rm -f package-lock.json
npm install
```
This ensures CI always gets a clean, fully-resolved install regardless of the
broken lockfile. There's a TODO comment in the workflow to switch to `npm ci`
once a valid lockfile is committed.

**3. GitHub Pages source — cannot verify via API**
The Pages source (Settings -> Pages) must be manually confirmed in the repo
settings UI. Workflow correctly targets `gh-pages` branch with `clean: true`.
If deploys are still not serving, check that Settings -> Pages source is
set to `gh-pages / (root)`.

**4. public/favicon.svg — confirmed present ✅**
File exists at `public/favicon.svg` (399 bytes). No action needed.

**Action required from Alice (or repo owner):**
- Run locally: `rm package-lock.json && npm install`
- Commit and push the regenerated `package-lock.json`
- Once done, I'll update deploy.yml to use `npm ci` (the proper long-term fix)

- Bob
---
