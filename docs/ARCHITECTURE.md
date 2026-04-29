# Studio Spaces — Architecture

## Overview

Studio Spaces is a client-side-first single-page application (SPA) with optional GitHub-backed persistence. The core of the system is the **Space Engine** — a runtime that manages Space state, template resolution, file indexing, and AI routing.

---

## System Layers

```
┌─────────────────────────────────────────────┐
│                   UI Layer                  │
│  Space Library · Space View · Template      │
│  Gallery · Chat Thread · Settings           │
├─────────────────────────────────────────────┤
│               Space Engine                  │
│  SpaceManager · TemplateResolver ·          │
│  FileRegistry · AIRouter · SyncAdapter      │
├─────────────────────────────────────────────┤
│              Storage Layer                  │
│  IndexedDB (local) · GitHub Sync (optional) │
│  .space file export/import                  │
├─────────────────────────────────────────────┤
│               AI Layer                      │
│  Model Router · Persona Profiles ·          │
│  Prompt Builder · Context Assembler         │
└─────────────────────────────────────────────┘
```

---

## Core Entities

### Space
The primary unit. A Space is a persistent, configurable AI workspace. It contains:
- Identity (name, description, icon, color)
- AI Direction Profile (model, persona, tone, behavior rules)
- Custom Instructions (system prompt addendum)
- File Registry (attached files, indexed for retrieval)
- Source Links (pinned URLs, domains to search within)
- Thread Collection (conversation history)
- Template Metadata (if spawned from a template)

### Space Template
A serialized, portable snapshot of a Space configuration — *without* conversation threads. Templates are the core innovation of Studio Spaces.

A template carries:
- All Space configuration
- File manifests (file references + optional embedded content)
- Source link bundles
- AI direction profile
- Metadata: author, version, tags, description, thumbnail

Templates are stored as `.space` JSON files — importable, exportable, and shareable.

### AI Direction Profile
A named preset that configures model behavior:
- Model selection (e.g., GPT-4o, Claude Sonnet, Gemini Pro)
- Reasoning mode (focused / analytical / creative / strict)
- Response length preference
- Citation behavior
- Temperature and sampling settings (abstracted as named presets)

### File Registry
Each Space maintains a local file registry:
- Files are stored in IndexedDB as binary blobs
- The registry tracks metadata: name, type, size, upload date, indexing status
- Text-based files are chunked and embedded for RAG (retrieval-augmented generation)
- Files referenced in templates are stored as manifests and re-uploaded on instantiation

### Source Link Bundle
A named set of URLs and domain scopes that the AI uses as its search context:
- Individual URLs (scraped and indexed)
- Domain allow-lists (e.g., `*.vercel.com`, `docs.react.dev`)
- Saved at the Space level, carried in templates

---

## Data Flow — Sending a Message

```
User types message
       │
       ▼
Context Assembler
  ├── System prompt (AI Direction Profile + Custom Instructions)
  ├── File context (RAG retrieval from File Registry)
  ├── Source link context (fetched/indexed web content)
  └── Thread history (last N turns)
       │
       ▼
Model Router
  └── Selects model based on AI Direction Profile
       │
       ▼
AI Provider API
       │
       ▼
Response streamed to Chat Thread
```

---

## Template Instantiation Flow

```
User selects template from gallery
         │
         ▼
TemplateResolver.resolve(template)
  ├── Create new Space with template config
  ├── Re-attach files from manifest
  │     └── If files embedded: restore from base64
  │     └── If files external: prompt user to re-upload
  ├── Restore source link bundle
  └── Apply AI Direction Profile
         │
         ▼
New Space is ready — open in Space View
```

---

## Space Duplication Flow

```
User clicks "Duplicate" on a Space
         │
         ▼
SpaceManager.duplicate(spaceId)
  ├── Deep clone Space config
  ├── Copy file registry entries (re-index)
  ├── Copy source link bundle
  └── Assign new Space ID + "Copy of" name prefix
         │
         ▼
New duplicate Space appears in Space Library
```

---

## GitHub Sync (Optional)

Spaces can optionally be backed to a GitHub repository:
- Each Space is stored as a folder in `spaces/{space-id}/`
- `space.json` — Space config and metadata
- `files/` — File attachments (text files committed, binary files as LFS)
- `threads/` — Conversation thread history as markdown files
- Templates are stored in `templates/{template-id}.space`

This enables version control, team sharing, and cross-device access.

---

## Technology Stack (Planned)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React + Vite | Fast HMR, clean component model |
| Styling | CSS Modules + Design Tokens | Portable, avoids build complexity |
| Local DB | Dexie.js (IndexedDB) | Simple API for large blobs + metadata |
| AI routing | Vercel AI SDK | Unified interface across providers |
| File parsing | PDF.js, Mammoth, csv-parse | Client-side document parsing |
| GitHub sync | Octokit | GitHub API integration |
| State | Zustand | Lightweight, composable stores |
| Routing | React Router v7 | Hash-based SPA routing |
