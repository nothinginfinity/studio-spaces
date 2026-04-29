# Studio Spaces

> A Spaces-first chat application — the missing feature Perplexity Spaces should have.

**Studio Spaces** is a standalone web application built around one idea: *Spaces should be first-class citizens, not an afterthought.* No news feed, no trending topics, no web-browser mode. Just powerful, configurable AI Spaces that you can template, duplicate, share, and launch instantly.

---

## The Problem

Perplexity Spaces are incredibly powerful — you can give an AI assistant custom instructions, load it with files, link it to specific sources, and tune its behavior for a specific domain. But:

- You **can't duplicate** a Space (start from scratch every time)
- You **can't create your own templates** (only Perplexity-curated templates exist)
- Templates **don't carry files, links, or full configuration** — just basic instructions
- There's **no template library** you can build, share, or reuse across projects

Studio Spaces solves all of this.

---

## What Studio Spaces Is

A focused, Spaces-only interface with:

| Feature | Description |
|---|---|
| 🗂️ **Custom Space Templates** | Save any Space as a reusable template — instructions, AI persona, files, source links, and all |
| 📋 **One-click Space Duplication** | Clone any existing Space with full config preserved |
| 📁 **Pre-loaded File Configs** | Templates carry attached files (PDFs, docs, code, images) |
| 🔗 **Source Link Bundles** | Templates include pinned URLs and web sources to search within |
| 🤖 **AI Direction Profiles** | Choose model behavior presets: focused, creative, analytical, strict |
| 🏷️ **Template Library** | Personal and shared template galleries, taggable and searchable |
| 🔄 **Space Sync** | Optionally back Spaces to GitHub for version control |
| 📤 **Template Export / Import** | Share templates as `.space` JSON bundles |

---

## What Studio Spaces Is NOT

- ❌ A news reader or trending topics feed
- ❌ A web browser or general search engine
- ❌ A thread-based conversational tool (Threads live *inside* Spaces, not the other way around)
- ❌ A social network or public feed

---

## Quick Start (Planned)

```bash
git clone https://github.com/nothinginfinity/studio-spaces
cd studio-spaces
npm install
npm run dev
```

Open `http://localhost:5173` — you'll land directly in your Space library.

---

## Repository Structure

```
studio-spaces/
├── docs/                   # Architecture, specs, and design decisions
│   ├── ARCHITECTURE.md     # System design and data flow
│   ├── SPACE-SCHEMA.md     # Space and Template JSON schema
│   ├── ROADMAP.md          # Phased build plan
│   └── UI-SPEC.md          # UI/UX specification
├── src/
│   ├── app/                # App shell, routing, layout
│   ├── spaces/             # Space engine — CRUD, template logic
│   ├── templates/          # Template library + gallery
│   ├── chat/               # Chat thread engine within a Space
│   ├── files/              # File upload, indexing, attachment
│   ├── ai/                 # AI model routing and persona profiles
│   └── ui/                 # Design system components
├── public/
└── package.json
```

---

## Philosophy

> Spaces are workspaces. Workspaces deserve to be saved, versioned, templated, and shared.

Every decision in Studio Spaces is made through this lens. If a feature doesn't serve the Space, it doesn't ship.

---

## Status

🟡 **Spec phase** — architecture and schema are being defined.

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the phased build plan.

---

## License

MIT
