# Studio Spaces — Roadmap

Phased build plan. Each phase is independently shippable.

---

## Phase 0 — Foundation (Week 1–2)
**Goal:** Working shell with Space CRUD and chat.

### Deliverables
- [ ] Repo scaffold: Vite + React + CSS Modules
- [ ] Design system: tokens, base CSS, Nexus palette, dark/light mode toggle
- [ ] App shell: sidebar navigation + main content area
- [ ] Space Library: list, create, rename, delete Spaces
- [ ] Space View: basic chat thread within a Space
- [ ] Local persistence: IndexedDB via Dexie.js
- [ ] AI routing: connect to at least one provider (OpenAI or Anthropic)
- [ ] Custom instructions: editable system prompt per Space

### Definition of Done
A user can create a Space, give it custom instructions, and have a conversation that persists on reload.

---

## Phase 1 — Files & Sources (Week 3–4)
**Goal:** Spaces become knowledge-loaded.

### Deliverables
- [ ] File upload UI (drag-and-drop + file picker)
- [ ] Client-side file parsing: PDF (PDF.js), DOCX (Mammoth), TXT, MD, CSV
- [ ] File registry per Space (metadata + blob in IndexedDB)
- [ ] RAG context injection: relevant file chunks included in AI context
- [ ] Source link bundle UI: add/remove URLs and domain scopes
- [ ] URL scraping: fetch and cache page content for context
- [ ] Source search mode selector: within-sources / sources-preferred / web-wide

### Definition of Done
A user can upload files and add source URLs to a Space, and the AI uses them when answering.

---

## Phase 2 — Templates (Week 5–6)
**Goal:** The core innovation — save, load, duplicate, share.

### Deliverables
- [ ] "Save as Template" from any Space
- [ ] Template metadata editor: name, description, tags, thumbnail
- [ ] File manifest in templates: embed small files, flag large files as "requires upload"
- [ ] Template Library: personal gallery view with search and tag filter
- [ ] "New from Template" flow: instantiate Space from template
- [ ] Re-upload prompt UI: when a template file requires re-upload, prompt gracefully
- [ ] Space duplication: one-click clone of any Space
- [ ] `.space` file export: download a template as a portable JSON bundle
- [ ] `.space` file import: load a template from a local file

### Definition of Done
A user can save any Space as a template, share the `.space` file with someone else, and they can instantiate an identical Space in under 30 seconds.

---

## Phase 3 — AI Direction Profiles (Week 7)
**Goal:** Fine-grained, named AI behavior presets.

### Deliverables
- [ ] Built-in profiles: Focused Assistant, Research Analyst, Creative Writer, Code Reviewer, Strict Editor
- [ ] Custom profile creator: name, model, reasoning mode, response length, citation behavior
- [ ] Profile selector in Space settings
- [ ] Profiles stored per-Space and included in templates
- [ ] Profile library: reuse profiles across Spaces

### Definition of Done
A user can pick "Research Analyst" and get a meaningfully different AI behavior than "Creative Writer" without writing any custom instructions.

---

## Phase 4 — Template Gallery & Sharing (Week 8–9)
**Goal:** A library of curated and community templates.

### Deliverables
- [ ] Curated starter templates: 10+ high-quality built-in templates
- [ ] Template categories: Research, Writing, Coding, Business, Personal, Creative
- [ ] Template preview: see a template's instructions, files required, and sources before installing
- [ ] Share via link: generate a shareable URL that encodes the template
- [ ] GitHub-backed template registry (optional): store templates in a GitHub repo

### Definition of Done
A user can browse a gallery of templates, preview one, and install it in one click.

---

## Phase 5 — GitHub Sync (Week 10–11)
**Goal:** Spaces are version-controlled and cross-device.

### Deliverables
- [ ] GitHub OAuth connection
- [ ] Space → GitHub repo sync: `spaces/{id}/space.json` + `threads/` + `files/`
- [ ] Template → GitHub sync: `templates/{id}.space`
- [ ] Pull on app load: sync local state from GitHub
- [ ] Push on change: commit changes to GitHub on save
- [ ] Conflict resolution: last-write-wins with user notification

### Definition of Done
A user can sync their Spaces to a GitHub repo, switch devices, and resume where they left off.

---

## Phase 6 — Polish & Mobile (Week 12)
**Goal:** Production-quality experience on all screen sizes.

### Deliverables
- [ ] Mobile layout: bottom tab bar, full-screen Space view, swipe gestures
- [ ] Keyboard shortcuts: Cmd+K command palette, Cmd+N new Space, Cmd+T new from template
- [ ] Onboarding flow: empty-state animation, first-Space creation guide
- [ ] Performance audit: < 2s LCP, skeleton loaders everywhere
- [ ] Accessibility audit: keyboard nav, ARIA, contrast
- [ ] PWA: installable, offline-capable (local Spaces work offline)

### Definition of Done
Studio Spaces passes a full quality audit and ships as a PWA.

---

## Future Considerations
- Collaborative Spaces (multi-user, real-time)
- Space-to-Space messaging (building on the studio-os-chat mailbox pattern)
- AI agent tasks that run in the background within a Space
- Perplexity API integration (if/when available) to stay compatible with existing Spaces
- Native mobile app (React Native, sharing Space Engine logic)
