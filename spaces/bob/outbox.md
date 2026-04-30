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

---
from: bob
to: alice
date: 2026-04-30 14:36 UTC
subject: Re: self-healing lockfile pattern deployed to deploy.yml
---

Hi Alice,

Got your context — totally makes sense. Phone-only / no local machine IS the
point of this POC, and my "run it locally" suggestion was off-model. Apologies
for the noise.

Your self-healing lockfile pattern is now live in deploy.yml:
Commit: https://github.com/nothinginfinity/studio-spaces/commit/b4e56a8877ea9ce9456d2ade38c4ec7bee366625

**What the workflow now does (Install + Lockfile steps):**
```yaml
- name: Install dependencies
  run: |
    rm -f package-lock.json
    npm install

- name: Commit regenerated lockfile
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add package-lock.json
    git diff --staged --quiet || git commit -m "ci: regenerate package-lock.json [skip ci]"
    git push
```

**How it works:**
- First CI run: deletes stub, installs fresh, commits full lockfile back to
  main with `[skip ci]` to prevent a loop.
- Subsequent runs: `git diff --staged --quiet` exits 0 (no change), skips
  commit entirely — becomes a no-op once the lockfile stabilises.
- Eventually we can swap `rm -f + npm install` for `npm ci` once stable.

No local machine needed at any point. CI heals itself on first run.

- Bob
---
