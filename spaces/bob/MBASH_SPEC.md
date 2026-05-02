# Mbash — Multi-Agent Bash for MMCLI

**Version:** 0.1 (Draft)  
**Author:** Bob (CI/DevOps, studio-spaces)  
**Status:** Proposal — open for review by Alice and owner

---

## Overview

Mbash is a shell language and runtime for the MMCLI stack. It replaces traditional bash pipelines with a message-passing, agent-aware execution model built on top of existing infrastructure already proven across two repos: **DragonPy** (MDLCL protocol, `oi_core`, `workflow_builder`) and **email-for-ai** (MCP server, inbox/outbox transport, tool registry, multi-agent messaging).

The core insight: bash routes data between programs via pipes (`|`); Mbash routes intent between agents via MMCP envelopes. Both are shells. One orchestrates processes. The other orchestrates minds.

---

## Why Mbash — The Conceptual Gap

| bash | Mbash |
|---|---|
| Forks OS processes | Spawns agent Spaces |
| `command \| command` (pipe) | `@agent → @agent` (MMCP route) |
| Environment variables (`$VAR`) | QA.Stone context / `secure_qa_stone.py` |
| Filesystem (`ls`, `cat`, `echo`) | GitHub API via `mmcp-api` (read/write repo) |
| Cron / `sleep` | GitHub Actions schedules / `workflow_builder.py` |
| Shell scripts (`.sh`) | MMCLI scripts (`.msh`) |
| `stdin` / `stdout` | Conversation TTY / MMCP envelopes |
| `exit 0` / `exit 1` | MMCP ack / nack envelope |
| `sudo` / permissions | QA.Stone access tiers + `stone-vault` |
| Package manager (`apt`, `pip`) | `tool_registry.json` from `email-for-ai` |

Mbash does not replace bash for system administration. It replaces bash as the **glue language for multi-agent workflows** — the thing you reach for when you want two agents to collaborate on a task, pass context between sessions, or schedule recurring work.

---

## What's Already Built (Reusability Audit)

### From DragonPy

The following modules are **directly reusable** in Mbash with minimal adaptation:

| Module | Path | What it provides | Mbash role |
|---|---|---|---|
| `oi_core.py` | `dragonpy/oi_core.py` | Orchestrator Interface — agent registration, task dispatch, result collection | **Mbash kernel** — the `exec()` equivalent |
| `mdlcl_protocol.py` | `dragonpy/mdlcl_protocol.py` | Multi-Directionally Linked Command Line — bidirectional message routing between CLI nodes | **Pipe replacement** — `@alice \| @bob` fan-out |
| `workflow_builder.py` | `dragonpy/workflow_builder.py` | Declarative workflow graph: steps, dependencies, conditions, parallel branches | **`.msh` script interpreter** — sequential/parallel command execution |
| `cli_linker.py` | `dragonpy/cli_linker.py` | Links CLI nodes together for multi-directional routing | **Shell session setup** — equivalent to opening a terminal |
| `secure_qa_stone.py` | `dragonpy/secure_qa_stone.py` | Encrypted context stones — scoped secrets with access tiers | **Environment variables** (`$PATH`, `$SECRET_KEY`) |
| `prompt_history.py` | `prompt_history.py` | Prompt replay / history | **Shell history** (`history`, `!!`, `Ctrl+R`) |
| `prompt_intelligence_orchestrator.py` | root | Prompt routing intelligence | **Shell tab-completion / autocomplete** |

The `mdlcls/` directory in DragonPy contains pre-built MDLCL configurations — these are the closest thing to `.bashrc` / shell profiles that already exist.

### From email-for-ai

The following components are **directly reusable** as Mbash's I/O and transport layer:

| Component | Path | What it provides | Mbash role |
|---|---|---|---|
| MCP server | `run_mcp_sdk.py`, `run_mcp_server.py` | Full MCP protocol server for agent tool access | **syscall interface** — how `.msh` scripts call tools |
| HTTP proxy | `mcp_http_proxy.py` | HTTP ↔ MCP bridge | **Remote shell** — `ssh` equivalent for cross-repo agents |
| `email_for_ai/` package | `email_for_ai/` | Inbox/outbox, message threading, delivery | **Pipe I/O** — stdin/stdout for agents |
| `tool_registry.json` | root (138KB) | 500+ registered tools with schemas | **`/usr/bin/`** — the tool path |
| `SPEC_TASK_HANDOFF_PROTOCOL.md` | root | Handoff envelopes, task lifecycle, ack/nack | **Process exit codes + `wait()`** |
| `SPEC_SHARED_MEMORY_CONSISTENCY.md` | root | Shared memory model across agents | **Shared memory / `mmap`** |
| `HANDOFF_MULTI_AGENT.md` | root | Multi-agent coordination patterns | **`xargs`, `parallel`, `&&` / `\|\|` logic** |
| `PRD_PROJECT_SCOPED_INBOXES.md` | root | Per-project inbox isolation | **Process namespaces / `chroot`** |
| `cli/` directory | `cli/` | CLI tooling for email-for-ai | **Shell binary** — the `mbash` executable itself |
| `agent-creator/` | root | Agent bootstrapping | **`fork()` / `exec()`** — spawning new agents |

The `tool_registry.json` is especially powerful — it's already a structured catalog of every tool available in the system, equivalent to `$PATH` listing all executables. Mbash's `which` command just queries this registry.

### Already-Proven Pattern: The MMCP Envelope as a Process

The MMCP envelope format used in `studio-spaces` is already functionally equivalent to a **process spawn + stdout capture**:

```
# bash process spawn:
result=$(python analyze.py --input data.csv)

# Mbash equivalent (MMCP envelope):
---
from: bob
to: alice
date: 2026-05-01
subject: analyze data.csv
---
Please analyze data.csv and report findings.
---
# alice's reply = stdout; subject line = argv; from/to = process ownership
```

The envelope IS the process. This means the MMCP envelope format already implements the fundamental unit of computation in Mbash.

---

## The `.msh` Script Format

An `.msh` (Mbash script) file is a plain-text, line-oriented script committed to the repo. MMCLI reads and executes it sequentially, routing each command to the appropriate agent or tool.

### Syntax Reference

```bash
# Comment — ignored by interpreter

# 1. Send a message to an agent (async, non-blocking)
@alice "Please review the latest PR"

# 2. Send and wait for reply (blocking, like subprocess with capture)
result = @alice? "What is the status of Phase 1?"

# 3. Route output of one agent to input of another (pipe)
@bob status | @alice summarize

# 4. Fan-out to multiple agents simultaneously (parallel)
@alice @bob @charlie "morning sync: what did you work on yesterday?"

# 5. Conditional execution
@ci check-build && @alice "build is green, safe to deploy"
@ci check-build || @owner "build failed, needs attention"

# 6. Set context variable
set $PROJECT = "studio-spaces"
set $BRANCH = "main"

# 7. Read a QA.Stone secret into a variable
set $API_KEY = stone("github-token")

# 8. Call a registered tool from tool_registry.json directly
tool github.create_pr --title "Phase 1 complete" --base main

# 9. Schedule a recurring script
schedule "0 9 * * 1-5" daily-standup.msh

# 10. Spawn a new agent Space
spawn @qa-agent from template "code-reviewer" with context $PROJECT

# 11. Write to a file / append to outbox
write spaces/bob/outbox.md "Mbash spec v0.1 drafted"

# 12. Exit with status
done "all tasks complete"
error "something went wrong"
```

### Example: Morning Standup Script

```bash
# morning-standup.msh — runs daily at 9am via GitHub Actions cron

set $DATE = env("TODAY")
set $REPO = env("GITHUB_REPO")

@alice @bob "Good morning — starting daily sync for $DATE"

alice_status = @alice? "What did you ship yesterday? What's blocked?"
bob_status   = @bob?   "What did you ship yesterday? What's blocked?"

@owner "Daily sync $DATE:\n\nAlice: $alice_status\n\nBob: $bob_status"

write spaces/studio-os-chat/inbox.md "Daily sync complete: $DATE"
done "standup complete"
```

### Example: CI Failure Handler

```bash
# ci-failure-handler.msh — triggered by GitHub Actions on workflow failure

set $RUN_ID   = env("GITHUB_RUN_ID")
set $BRANCH   = env("GITHUB_REF_NAME")
set $WORKFLOW = env("GITHUB_WORKFLOW")

diagnosis = @bob? "CI run $RUN_ID failed on branch $BRANCH in $WORKFLOW — what went wrong?"

@alice "CI failure on $BRANCH: $diagnosis — does this affect your work?"
@owner "🔴 CI failure: $WORKFLOW on $BRANCH\n\nDiagnosis: $diagnosis"

error "ci failure handled, investigation in progress"
```

---

## Architecture: The Mbash Stack

```
┌─────────────────────────────────────────────────────────┐
│                    USER / OWNER                         │
│              types .msh scripts or                      │
│           runs `mmcli run script.msh`                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 MBASH INTERPRETER                       │
│         (DragonPy: workflow_builder.py +                │
│          mdlcl_protocol.py + oi_core.py)                │
│                                                         │
│  Parses .msh → builds execution graph →                 │
│  routes commands to agents or tools                     │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌───────────▼───────────────────┐
│   MMCP TRANSPORT    │   │     TOOL REGISTRY             │
│  (email-for-ai:     │   │  (email-for-ai:               │
│   inbox/outbox,     │   │   tool_registry.json,         │
│   MCP server,       │   │   run_mcp_sdk.py)             │
│   HTTP proxy)       │   │                               │
│                     │   │  500+ tools as Mbash builtins │
│  Delivers envelopes │   └───────────────────────────────┘
│  to agent inboxes   │
└──────────┬──────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                    AGENT SPACES                         │
│      (GitHub repo: spaces/alice/, spaces/bob/)          │
│                                                         │
│  Each agent reads inbox.md, acts, writes outbox.md      │
│  Response captured as Mbash command output              │
└─────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                   CONTEXT LAYER                         │
│    (DragonPy: secure_qa_stone.py + stone-vault)         │
│                                                         │
│  $VARIABLES, secrets, session state                     │
└─────────────────────────────────────────────────────────┘
```

---

## Build Plan: 4 Milestones

### Milestone 1 — Proof of Concept (Week 1-2)

**Goal:** Run a single-line `.msh` script that sends a message to one agent and captures the reply.

- [ ] Create `mbash/` directory in `studio-spaces` (or new `mmcli-core` repo)
- [ ] Write `mbash/interpreter.py` — line parser for `@agent "message"` and `result = @agent? "question"`
- [ ] Wire to existing `email_for_ai` inbox/outbox append functions
- [ ] Test: `echo '@alice "hello"' | python mbash/interpreter.py`
- [ ] Confirm message appears in `spaces/alice/inbox.md`

**Reused directly:** `email_for_ai/` package, `run_mcp_sdk.py`

### Milestone 2 — Script Files + Pipes (Week 3-4)

**Goal:** Execute a saved `.msh` file with sequential commands and agent-to-agent pipes.

- [ ] Extend interpreter to read `.msh` files from disk / repo
- [ ] Implement `|` routing: capture output of `@agent1`, inject as input to `@agent2`
- [ ] Implement `&&` / `||` conditional execution using MMCP ack/nack
- [ ] Implement `set $VAR =` and `env()` for variable substitution
- [ ] Run `morning-standup.msh` example end-to-end

**Reused directly:** `workflow_builder.py`, `mdlcl_protocol.py`

### Milestone 3 — Tool Integration + Context (Week 5-6)

**Goal:** `.msh` scripts can call registered tools directly and read QA.Stone secrets.

- [ ] Implement `tool <name> --arg value` via `tool_registry.json` + MCP server
- [ ] Implement `stone("<key>")` via `secure_qa_stone.py`
- [ ] Implement `write <path> <content>` for repo file writes
- [ ] Implement `spawn @agent from template` via `agent-creator/`
- [ ] Run `ci-failure-handler.msh` as a live GitHub Actions trigger

**Reused directly:** `tool_registry.json`, `secure_qa_stone.py`, `agent-creator/`, `mcp_http_proxy.py`

### Milestone 4 — MMCLI Integration + `mbash` Binary (Week 7-8)

**Goal:** `mmcli run script.msh` works from the command line.

- [ ] Create `mmcli` CLI entry point (`cli/` in `email-for-ai` already has scaffolding)
- [ ] Add `mmcli run <script.msh>` subcommand
- [ ] Add `mmcli shell` — interactive Mbash REPL
- [ ] Add `mmcli which <tool>` — queries tool registry
- [ ] Add `mmcli ps` — lists active agent Spaces
- [ ] Add `mmcli history` — shows last N MMCP envelopes sent
- [ ] Add `schedule` command backed by GitHub Actions cron workflow generation

**Reused directly:** `cli/` from `email-for-ai`, `prompt_history.py` from DragonPy

---

## Open Questions

1. **Blocking vs. async by default** — Should `@alice "message"` be fire-and-forget (async) or block until reply? The `?` suffix suggests blocking. Needs a timeout convention.
2. **Error handling** — When an agent times out, Mbash needs `try/catch` equivalent. Proposal: `@alice? "task" timeout:30m || error "alice timed out"`
3. **Script storage** — `.msh` files live at `scripts/`. Should they be in `studio-spaces` or a dedicated `mmcli-scripts` repo?
4. **Interpreter language** — Python (reuses DragonPy/email-for-ai directly) vs. TypeScript (matches Alice's stack). Recommendation: Python first, TS wrapper later.
5. **Security model** — Need a `permissions` header in `.msh` files declaring which agents the script is allowed to contact, verified against QA.Stone access tiers.

---

## Lineage Map

```
DragonPy ──► mdlcl_protocol.py ──► Mbash pipe operator (|)
DragonPy ──► oi_core.py         ──► Mbash kernel / process scheduler
DragonPy ──► workflow_builder   ──► .msh script DAG executor
DragonPy ──► secure_qa_stone    ──► Mbash environment / $VARIABLES

email-for-ai ──► inbox/outbox    ──► Mbash I/O (stdin/stdout)
email-for-ai ──► tool_registry   ──► Mbash $PATH (installed tools)
email-for-ai ──► MCP server      ──► Mbash syscall interface
email-for-ai ──► cli/            ──► mmcli binary / shell entry point
email-for-ai ──► agent-creator   ──► Mbash fork() / exec()

studio-spaces ──► spaces/*/      ──► Mbash process table (running agents)
studio-spaces ──► MMCP envelope  ──► Mbash process = envelope
qastone       ──► .qastone files ──► Mbash session context (saved shells)
```

This is not a greenfield project. Mbash is a **thin interpreter layer** (~800 lines of new Python) that gives a unified syntax to infrastructure already built. Everything else is wiring.

---

*Last updated: 2026-05-01 by Bob (studio-spaces CI/DevOps)*
