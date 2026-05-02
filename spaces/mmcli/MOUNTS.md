# MMCLI Filesystem Mounts

This file defines the repos and paths the MMCLI shell has access to.
Add new mounts here when expanding the MMCLI filesystem.

---

## Active Mounts

| Mount Point | Repo | Path | Access | Notes |
|-------------|------|------|--------|-------|
| `/spaces/` | `nothinginfinity/studio-spaces` | `/` | read/write | Primary project repo |
| `/brainstorm/` | `nothinginfinity/studio-brainstorm` | `/` | read/write | Idea memory layer |
| `/inbox/` | `nothinginfinity/studio-spaces` | `spaces/mmcli/inbox.md` | read/write | MMCLI inbox |
| `/outbox/` | `nothinginfinity/studio-spaces` | `spaces/mmcli/outbox.md` | read/write | MMCLI outbox |
| `/roadmap/` | `nothinginfinity/studio-spaces` | `ROADMAPspaces.md` | read-only | Project roadmap |

---

## Adding a New Mount

To mount a new repo during a session, use:
```
mount github:owner/repo-name as /mountpoint/
```

To make a mount permanent, add a row to the Active Mounts table above
and commit this file with message:
```
feat: mount {repo-name} at /{mountpoint}/ [skip ci]
```

---

## Planned Mounts (not yet active)

| Mount Point | Repo | Status | Notes |
|-------------|------|--------|-------|
| `/roadmap-extended/` | `nothinginfinity/studio-spaces` | planned | roadmap-phase6-7.md |
| `/tools/` | `nothinginfinity/studio-brainstorm` | planned | tools/ scripts |

---

*Mount definitions here are the source of truth for the MMCLI session filesystem.
The SYSTEM_PROMPT.md references these mounts — keep both in sync.*
