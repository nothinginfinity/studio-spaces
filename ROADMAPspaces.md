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

- [ ] **Remove all hardcoded Space labels** from the sidebar and any preset data in `db.js` / `store.js`
- [ ] **Define the Project schema** in `db.js`:
  ```js
  Project {
    id: string,
    name: string,
    repoUrl: string,        // e.g. "https://github.com/nothinginfinity/studio-spaces"
    repoOwner: string,      // e.g. "nothinginfinity"
    repoName: string,       // e.g. "studio-spaces"
    createdAt: timestamp
  }
  ```
- [ ] **Define the Space schema** in `db.js`:
  ```js
  Space {
    id: string,
    projectId: string,
    name: string,
    role: string,           // system prompt / instructions
    inboxPath: string,      // e.g. "spaces/bob/inbox.md"
    outboxPath: string,     // e.g. "spaces/bob/outbox.md"
    linkedFiles: string[],  // files this Space has authority over
    mmcpConnections: {      // Spaces this Space can message
      spaceId: string,
      label: string,
      inboxPath: string,
      repoOwner: string,    // can be a different project's repo
      repoName: string
    }[],
    createdAt: timestamp
  }
  ```
- [ ] **Update `store.js`** to load Projects and Spaces from IndexedDB
- [ ] **Update sidebar** (Alice) to render Projects as collapsible groups, Spaces as items within them
- [ ] **Add "New Project" flow** — modal with name + GitHub repo URL, auto-parses owner/repo
- [ ] **Add "New Space" flow** — modal with name, role, auto-suggests inbox/outbox paths from name, allow override

**Done when:** The sidebar is fully dynamic. No hardcoded names anywhere. Owner can create a Project linked to a repo and add custom Spaces to it.

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

*Document created: 2026-04-30. Maintained by the Studio Spaces owner. Bob and Alice should append updates to `spaces/studio-os-chat/inbox.md` when a Phase milestone is complete.*
