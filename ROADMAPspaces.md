# Studio Spaces — Product Roadmap

> **Purpose:** This document is the shared north star for the Studio Spaces project. It defines what we are building, why, the architecture that makes it work, and the ordered plan to get there. Bob (CI/DevOps) and Alice (Frontend) should reference this document when scoping any task.

---

## Vision

Studio Spaces is a **project-scoped multi-agent workspace** — a chat application where every Space is an AI agent, every project maps to a GitHub repository, and all inter-agent coordination flows through the **MMCP (Multi-Modal Communication Protocol) inbox/outbox system**.

The core insight: a GitHub repo is not just a codebase — it is a communication bus. Markdown files in `spaces/{agent}/inbox.md` and `spaces/{agent}/outbox.md` are the message queue. Every message is committed, auditable, and persistent. No real-time API calls between agents are needed. The protocol is already working in production between Bob and Alice today.

The goal is to give the owner a clean UI that makes it easy to:
- Create projects (each backed by a GitHub repo)
- Create Spaces (AI agents) within each project
- Wire Spaces together via MMCP so they can collaborate
- Scale to 70+ projects, each with their own set of collaborating Spaces
- Eventually cross-wire projects so Spaces from Project A can message Spaces in Project B

---

## The Bigger Picture — A Repo-Native Agent OS

> *Added 2026-04-30 after Phase 1.5 shipped. This section captures the architectural vision that emerged from the first working build.*

Studio Spaces is converging on something larger than a chat UI: a **repo-native, mobile-first agent operating system** where GitHub repositories serve every role a traditional OS filesystem would serve — but with version control, auditability, and multi-agent access built in by default.

### Repos as OS Primitives

In a traditional OS, you have memory, tools, libraries, and executables. In Studio Spaces, every GitHub repo plays one or more of these roles:

| Repo Type | OS Equivalent | Example |
|---|---|---|
| **Codebase repo** | Executable / application | `studio-spaces` — the app itself |
| **Skill repo** | Library / shared module | A repo of `.md` prompt files, patterns, best practices |
| **Tool repo** | System utility | A specialized calculator, design renderer, data processor |
| **Template repo** | Project scaffold | Bootstrap a new project with pre-wired Space structure |
| **Memory repo** | Persistent storage | Commit history = full auditable agent memory |
| **MMCP bus** | IPC / message queue | `spaces/{agent}/inbox.md` — the inter-agent channel |

### Why This Replaces Traditional MCP

The Model Context Protocol (MCP) requires a running server, API endpoints, and a client SDK. Studio Spaces achieves the same result — giving LLMs access to tools, memory, and context — using only git:

- **No server required.** Any agent with a GitHub token can read/write any repo it has access to.
- **No SDK required.** The protocol is markdown files + git commits. Any LLM that can call the GitHub API speaks it natively.
- **Mobile-first by default.** No daemon to run, no local machine needed. Fully operational from a phone.
- **Persistent and auditable.** Every tool call, every message, every result is a git commit. Nothing is ever lost.

### The Composability Loop

```
Owner defines a task
    │
    ▼
Agent A (in Repo 1) reads skill repo for context
    │  writes spec to outbox
    ▼
Agent B (in Repo 2) reads Agent A's message
    │  pulls tool repo as execution context
    │  commits output (code, data, content)
    ▼
CI pipeline (GitHub Actions) auto-deploys the output
    │
    ▼
PWA / web app is live — owner opens it on phone
    │
    ▼
Owner reviews, approves, or redirects via MMCP message
```

10–20 LLM instances, each a different model (GPT-4o, Claude, Gemini, Llama), each owning a different concern, all collaborating through git. The owner's GitHub account is the hard drive. Studio Spaces is the shell.

---

## Core Concepts

### Project
A named workspace tied to a single GitHub repository. A project is the unit of isolation — all Spaces within it share access to the same codebase, MMCP inbox tree, and context.

```
Project: studio-spaces
  GitHub repo: github.com/nothinginfinity/studio-spaces
  Spaces: Bob, Alice, studio-os-chat
```

### Space
A named AI agent within a project. Each Space has:
- A **name** (e.g. "Bob", "Alice", "Researcher")
- A **role / system instructions** (its persona, focus, responsibilities)
- An **inbox path** (`spaces/{name}/inbox.md`) — where it receives messages
- An **outbox path** (`spaces/{name}/outbox.md`) — where it records what it sent
- An optional list of **linked files** (files it has authority over)
- A list of **MMCP connections** — other Spaces it is allowed to message

### MMCP Protocol
The **inbox/outbox protocol** is the backbone of all inter-Space communication. Rules:
- All messages are appended to markdown files in the repo
- Messages use the envelope format: `from`, `to`, `date`, `subject`, `body`
- A Space reads its own inbox; it writes to other Spaces' inboxes
- `[skip ci]` in commit messages prevents infinite CI trigger loops
- The repo commit log is the full audit trail — no message is ever lost

### Cross-Project Communication
When two projects need to collaborate, a Space in Project A is given the inbox path of a Space in Project B (in a different repo). The protocol is identical — only the target repo changes. This allows child projects to be spawned from parent projects while maintaining full context continuity through the MMCP log.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Studio Spaces UI                    │
│                                                         │
│  ┌──────────────────┐   ┌──────────────────────────┐    │
│  │  Project Sidebar │   │     Space Chat View      │    │
│  │                  │   │                          │    │
│  │  ▾ studio-spaces │   │  [Space Name]            │    │
│  │    Bob           │   │  [Role / Instructions]   │    │
│  │    Alice    ●────┼───▶  [Chat thread]           │    │
│  │    + Space       │   │  [MMCP connections]      │    │
│  │                  │   │                          │    │
│  │  ▾ project-two   │   └──────────────────────────┘    │
│  │    Researcher    │                                    │
│  │    + Space       │                                    │
│  │                  │                                    │
│  │  + New Project   │                                    │
│  └──────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
                          │
            MMCP inbox/outbox (GitHub repo files)
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
  spaces/bob/       spaces/alice/    spaces/studio-os-chat/
  inbox.md          inbox.md         inbox.md
  outbox.md         outbox.md        outbox.md
```

---

## What to Remove

The current UI has hardcoded Space labels (Research, etc.) inherited from early scaffolding. These must go. Every Space in the final product is:

- User-defined (name, role, paths)
- Stored in the app's data layer (IndexedDB via `db.js`)
- Associated with a parent Project

No preset Space names should exist in the codebase after Phase 1 is complete.

---

## Roadmap

### Phase 1 — Project & Space Model (Foundation)
**Owner: Bob (data/CI) + Alice (UI)**
**Goal: Replace hardcoded Spaces with a fully dynamic Project → Space data model.**
**Status: ✅ COMPLETE — committed 2026-05-01**

- [x] Remove all hardcoded Space labels
- [x] Define Project schema in `db.js`
- [x] Define Space schema in `db.js`
- [x] Update `store.js` to load Projects and Spaces from IndexedDB
- [x] Update sidebar to render Projects as collapsible groups
- [x] Add "New Project" flow (name + GitHub repo URL + live parser)
- [x] Add "New Space" flow (name, role, auto-slugged inbox/outbox paths)

---

### Phase 1.5 — Multi-LLM + Repo Browser
**Owner: Alice (UI) + Bob (schema)**
**Goal: Per-Space model selection across providers; streamlined project creation.**
**Status: ✅ COMPLETE — committed 2026-05-01**

- [x] Fix duplicate default Space name (required name field in NewSpaceModal)
- [x] Multi-LLM model selector in ConfigPanel (OpenAI, Anthropic, Google, Groq, Ollama)
- [x] Per-provider API key storage in Settings (IndexedDB)
- [x] Provider/model header chip on Space view
- [x] GitHub repo browser in NewProjectModal (Browse repos tab, searchable, tap-to-select)

---

### Phase 2 — MMCP Connections UI
**Owner: Alice (UI) + Bob (path validation)**
**Goal: Make MMCP wiring visible and configurable in the UI.**

- [ ] **Space detail panel** — when a Space is selected, show its role, inbox/outbox paths, and MMCP connections list
- [ ] **"Can message" editor** — checklist of other Spaces in the same project that this Space can write to; rendered as a connection graph or simple list
- [ ] **Manual connection override** — allow adding a connection to a Space in a *different* project (cross-project MMCP); requires entering repo owner, repo name, and inbox path manually
- [ ] **MMCP envelope composer** — in the chat view, a structured "Send MMCP message" action that formats the envelope header automatically and commits it to the target inbox file via the GitHub API
- [ ] **Inbox reader** — display the current contents of a Space's `inbox.md` as a threaded message list, parsed from the envelope format

**Done when:** Owner can click a Space, see who it talks to, send a structured MMCP message to another Space, and read incoming messages — all within the UI.

---

### Phase 3 — Cross-Project Collaboration
**Owner: Bob (CI/routing) + Alice (UI)**
**Goal: Allow Spaces from different projects to communicate via MMCP.**

- [ ] **Cross-project connection UI** — when adding an MMCP connection, toggle between "Same project" and "Different project (enter repo details)"
- [ ] **Project directory** — a top-level view listing all projects, their repos, and which Spaces are currently active
- [ ] **Child project spawning** — a workflow where a Space in Project A can create a new Project B, bootstrap its Space structure, and automatically wire bidirectional MMCP connections between the two
- [ ] **Connection graph view** — a visual map showing all projects and their inter-Space MMCP links (nodes = Spaces, edges = MMCP connections, grouped by project)
- [ ] **Repo-as-tool linking** — in the Space config panel, a "Linked Repos" section where the owner can attach external repos as tools, skills, or templates available to that Space's context

**Done when:** Owner can have 5+ projects, Spaces across different repos can message each other, and the connection graph is visible in the UI.

---

### Phase 4 — Scale & Polish
**Owner: Both**
**Goal: Make the app production-ready for 70+ projects and dozens of Spaces.**

- [ ] **Search / filter** across all projects and spaces
- [ ] **Space templates** — pre-fill role/instructions from common patterns (CI agent, frontend agent, research agent, etc.) while keeping all fields editable
- [ ] **MMCP message history** — full threaded inbox view with timestamps, sender avatars, and reply composer
- [ ] **Notification badges** — unread message count on Space sidebar items (parsed from inbox.md, tracked in local state)
- [ ] **GitHub Actions status** — show last CI run status badge per project
- [ ] **Project settings page** — edit repo URL, manage Spaces, view MMCP topology
- [ ] **Export/import** — export a project's Space configuration as a JSON manifest; import to bootstrap a new project

**Done when:** The app handles the full scale of the vision without performance or UX degradation.

---

### Phase 5 — Live Agent Triggers & Push Notifications
**Owner: Bob (CI/webhook infrastructure) + Alice (PWA/UI)**
**Goal: Turn passive MMCP polling into an always-on agent operating system. When any agent commits to a Space's inbox, that Space is notified instantly — on mobile, in the background, without the owner having to manually open the app.**

This phase is what transforms Studio Spaces from "agents that can collaborate" into "agents that are always running."

#### The Core Problem
Currently, agents collaborate *asynchronously but passively* — an agent only knows it has a new message when the owner opens that Space manually. There is no push. There is no trigger. The system is as fast as the owner's attention.

Phase 5 closes that loop.

#### Implementation Plan

- [ ] **GitHub Webhook → Notification relay**
  Set up a lightweight serverless function (Cloudflare Worker or Vercel Edge Function) that:
  1. Receives GitHub `push` webhooks for any watched repo
  2. Parses the commit diff to detect changes to `spaces/*/inbox.md` files
  3. Identifies which Space's inbox was written to
  4. Sends a Web Push notification to the PWA with payload:
     `{ project, space, from, subject }` (parsed from the MMCP envelope)

- [ ] **PWA service worker — push subscription**
  - Register a service worker in Studio Spaces that subscribes to Web Push (VAPID keys stored in Settings)
  - On push receipt: show a native mobile notification with sender + subject
  - Notification tap: deep-links into the correct Project → Space in the app
  - Works on iOS (Safari PWA, iOS 16.4+) and Android Chrome

- [ ] **Webhook registration UI**
  - In Project settings, a "Live Triggers" toggle: on/off per project
  - When enabled, auto-registers the GitHub webhook via the GitHub API (using the stored token)
  - Shows webhook status (active / delivery history)
  - Webhook secret stored in IndexedDB, sent with each delivery for verification

- [ ] **Space "waiting" state**
  - When a Space has unread inbox messages AND a push notification was received, open that Space in a pre-loaded state that surfaces the new message at the top of the chat view
  - The first message shown is the MMCP envelope rendered as a chat bubble from the sending Space
  - Owner can reply inline (which composes and commits a new MMCP message back) or dismiss

- [ ] **Agent auto-resume**
  - Optional per-Space setting: "Auto-load on notification"
  - When a push arrives for this Space, the app automatically opens it and pre-populates the chat input with: *"You have a new message in your inbox from [sender]. Read it and respond."*
  - One tap = the agent reads its inbox and continues the collaboration thread
  - This is the mobile equivalent of a background agent daemon — but without any server, without any always-on process, triggered entirely by a git commit

- [ ] **Notification preferences**
  - Per-Space notification toggle (some Spaces are noisy; owner may want to silence CI bots)
  - Quiet hours (no push between set hours)
  - Digest mode — batch notifications into a single "X new messages across Y spaces" summary

#### Architecture Addition

```
Agent commits to spaces/alice/inbox.md
    │
    ▼
GitHub fires push webhook
    │
    ▼
Cloudflare Worker / Vercel Edge
  - verifies webhook secret
  - parses diff for inbox.md changes
  - extracts MMCP envelope (from/subject)
  - sends Web Push to subscribed PWA instances
    │
    ▼
Studio Spaces PWA (service worker)
  - receives push payload
  - shows native notification: "Alice ← Bob: [subject]"
    │
    ▼
Owner taps notification
  - app opens to Alice's Space
  - new inbox message rendered at top
  - one-tap agent resume available
```

**The relay server is the only new infrastructure required.** It is stateless — it receives a webhook, fires a push, and forgets. No database. No auth beyond the webhook secret. Deployable as a free-tier Cloudflare Worker in under 50 lines of code.

**Done when:** A commit to any watched Space's inbox triggers a native push notification on the owner's phone within 5 seconds. Tapping the notification opens the correct Space with the new message visible. The owner can resume the agent collaboration thread with a single tap.

---

## MMCP Envelope Format Reference

All inter-Space messages follow this format when appended to an inbox file:

```markdown
---
from: {sender-space-name}
to: {recipient-space-name}
date: YYYY-MM-DD HH:MM UTC
subject: {one-line summary}
---

{message body}

---
```

The `[skip ci]` tag must be included in the **git commit message** (not the MMCP envelope body) when committing to prevent CI loops:

```
git commit -m "mmcp: alice -> bob: component pattern update [skip ci]"
```

---

## File Authority Map

| File / Directory | Owner Space | Notes |
|---|---|---|
| `.github/workflows/deploy.yml` | Bob | CI pipeline |
| `package.json`, `vite.config.js` | Bob | Build config |
| `src/` (components, styles) | Alice | All UI files |
| `spaces/bob/` | Bob | Bob's inbox/outbox |
| `spaces/alice/` | Alice | Alice's inbox/outbox |
| `spaces/studio-os-chat/` | Owner | Escalation channel |
| `ROADMAP*.md` | Owner / Bob | Planning docs |

---

## Communication Protocol for This Build

- **Bob → Alice**: append to `spaces/alice/inbox.md` — CI status, build changes, env vars, base URL info
- **Alice → Bob**: append to `spaces/bob/inbox.md` — UI issues, asset requests, CI failures observed
- **Either → Owner**: append to `spaces/studio-os-chat/inbox.md` — blockers, decisions needed, milestone completions
- **All outgoing messages** also appended to sender's own `outbox.md` for audit trail

Every task in this roadmap that requires both Bob and Alice should begin with one agent posting an MMCP message to the other to establish scope before writing code.

---

*Document created: 2026-04-30. Phase 5 added 2026-04-30. Maintained by the Studio Spaces owner. Bob and Alice should append updates to `spaces/studio-os-chat/inbox.md` when a Phase milestone is complete.*
