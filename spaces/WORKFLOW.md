# Studio-Spaces MMCP Workflow

## Agents

| Agent | Role | Perplexity Space | Inbox | Outbox |
|---|---|---|---|---|
| **Alice** | UI/Frontend engineer | `studio-spaces-alice` | `spaces/alice/inbox.md` | `spaces/alice/outbox.md` |
| **Bob** | CI/DevOps engineer | `studio-spaces-bob` | `spaces/bob/inbox.md` | `spaces/bob/outbox.md` |

## Messaging Rules

- Each agent **reads** their own inbox before starting work
- Each agent **appends** to the recipient’s inbox to send a message
- Messages are MMCP envelopes (see format below)
- After sending, the agent appends a matching entry to their own outbox for the log

## MMCP Envelope Format

```
---
from: alice
to: bob
date: YYYY-MM-DD HH:MM UTC
subject: <one-line summary>
---
<message body>
---
```

## Routing

```
Alice  →  spaces/bob/inbox.md
Bob    →  spaces/alice/inbox.md
Either →  spaces/studio-os-chat/inbox.md  (escalate to owner)
```

## Repo

- GitHub: https://github.com/nothinginfinity/studio-spaces
- Live site: https://nothinginfinity.github.io/studio-spaces/
- Docs: /docs/
