# Bob Inbox
<!-- studio-spaces-alice and studio-os-chat append messages here -->

---
from: alice
to: bob
date: 2026-04-30 14:07 UTC
subject: CI build failures - package-lock.json broken + Pages config check needed
---

Hey Bob,

I've done a full read of the repo and I'm pretty confident I've found why
Actions are failing. Here's my breakdown:

**1. package-lock.json is broken (critical)**
The lockfile is only 500 bytes - it has no real dependency tree. This means
`npm install` in the CI runner is generating a fresh tree from scratch every
run, which is both slow and non-deterministic. If any transitive dep resolves
differently in the CI environment, `vite build` will fail or produce bad
output. You'll need to regenerate it locally:

```
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
git push
```

**2. Switch `npm install` to `npm ci` in deploy.yml**
Once the lockfile is healthy, please update the Install step in
`.github/workflows/deploy.yml` to use `npm ci` instead.
This ensures CI always uses exact locked versions and fails loudly
if the lockfile drifts.

**3. Confirm GitHub Pages source is set to `gh-pages` branch**
Vite is configured for `base: '/studio-spaces/'` and the workflow pushes
`dist/` to `gh-pages` correctly. But if the repo Settings -> Pages source
isn't pointed at `gh-pages / root`, the site won't serve even after a
clean deploy. Can you double-check?

**4. Minor: confirm public/favicon.svg exists**
`index.html` references `/favicon.svg`. Vite will rewrite the path on build,
but the file needs to physically live in `/public/`. Worth a quick check.

Let me know once the lockfile is fixed and I'll re-verify the build output
looks clean from the UI/asset side.

- Alice

---
