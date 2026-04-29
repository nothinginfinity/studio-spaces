# Studio Spaces — UI/UX Specification

## Design Philosophy

Spaces are workspaces. The UI treats them like a pro creative tool treats projects — not like a chat app treats conversations.

**Principles:**
1. **Space-first** — The Space Library is the home screen. There is no news feed, no trending, no home timeline.
2. **Context persistence** — The current Space is always visible. Navigation doesn't lose your place.
3. **Configuration is a first-class activity** — Space settings, template editing, and file management are not buried in modals. They have their own panels.
4. **Templates are the hero feature** — The template gallery is prominently placed, not hidden.

---

## App Shell

```
┌──────────────────────────────────────────────────────────────────┐
│  Sidebar (240px)           │  Main Content Area                  │
│                            │                                      │
│  [Studio Spaces logo]      │  [Space View / Library / Settings]  │
│                            │                                      │
│  ── SPACES ──              │                                      │
│  ● My Research Assistant   │                                      │
│  ○ Code Reviewer           │                                      │
│  ○ Studio OS Chat          │                                      │
│  ○ Brand Voice             │                                      │
│  + New Space               │                                      │
│                            │                                      │
│  ── TEMPLATES ──           │                                      │
│  ☆ Template Gallery        │                                      │
│  ☆ My Templates            │                                      │
│                            │                                      │
│  ── ──                     │                                      │
│  ⚙ Settings                │                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Space View

```
┌─ Space Header ───────────────────────────────────────────────────┐
│  🔬 My Research Assistant        [Configure] [Duplicate] [...]   │
├─ Space Context Bar ──────────────────────────────────────────────┤
│  📁 3 files  •  🔗 5 sources  •  🤖 Research Analyst  •  Claude │
├─ Chat Area ──────────────────────────────────────────────────────┤
│                                                                   │
│  [Thread list / conversation]                                    │
│                                                                   │
├─ Input Area ─────────────────────────────────────────────────────┤
│  [Message input                              ] [📎] [Send]       │
└──────────────────────────────────────────────────────────────────┘
```

### Space Configure Panel (slide-in from right)
```
┌─ Configure Space ────────────────────────────────────────────────┐
│  Name & Icon                                                      │
│  ──────────────────────────────────────────────────────────────  │
│  AI Direction Profile        [Research Analyst ▾]                │
│  ──────────────────────────────────────────────────────────────  │
│  Custom Instructions         [Edit ▾]                            │
│  ──────────────────────────────────────────────────────────────  │
│  Files                       [+ Add File]                        │
│    research-framework.pdf    45KB                    [✕]         │
│    product-brief.docx        12KB                    [✕]         │
│  ──────────────────────────────────────────────────────────────  │
│  Source Links                [+ Add Source]                      │
│    hbr.org                                           [✕]         │
│    mckinsey.com/insights                             [✕]         │
│  ──────────────────────────────────────────────────────────────  │
│  [Save as Template]          [Duplicate Space]                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Template Gallery

```
┌─ Template Gallery ───────────────────────────────────────────────┐
│  [Search templates...]    [All ▾]  [Research] [Writing] [Code]  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ 🔬           │  │ ✍️           │  │ 💻           │           │
│  │ Research     │  │ Brand Voice  │  │ Code         │           │
│  │ Analyst      │  │ Writer       │  │ Reviewer     │           │
│  │              │  │              │  │              │           │
│  │ 3 files      │  │ 1 file       │  │ 0 files      │           │
│  │ 5 sources    │  │ 2 sources    │  │ 0 sources    │           │
│  │ Claude       │  │ GPT-4o       │  │ Claude       │           │
│  │              │  │              │  │              │           │
│  │ [Preview]    │  │ [Preview]    │  │ [Preview]    │           │
│  │ [Use This]   │  │ [Use This]   │  │ [Use This]   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  [Import .space file]                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## "Save as Template" Flow

```
User clicks [Save as Template] in Space Configure panel
          │
          ▼
┌─ Save as Template ───────────────────────────────────────────────┐
│  Template Name         [Research Assistant              ]        │
│  Description           [A Space for rigorous research...]        │
│  Tags                  [research] [analysis] [+ add tag]         │
│                                                                   │
│  Files to include:                                               │
│  ☑ research-framework.pdf   (embed — 45KB)                      │
│  ☐ product-brief.docx       (too large — user must re-upload)   │
│    Upload prompt: [Upload your project brief (DOCX)      ]       │
│                                                                   │
│  Source links: ✓ included (5 sources)                           │
│  AI Profile:   ✓ included (Research Analyst)                    │
│  Instructions: ✓ included                                       │
│                                                                   │
│  [Cancel]                    [Save to My Templates]             │
│                              [Export as .space file]            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Mobile Layout

- Bottom tab bar: Spaces | Templates | Settings
- Space view is full-screen with a swipe-down to return to Space Library
- Configure panel slides up from bottom (sheet pattern)
- Chat input is pinned to bottom, keyboard-aware
- Template gallery is a vertically scrolled grid (2 columns)

---

## Design Tokens

Studio Spaces uses the Nexus Design System:
- **Surfaces:** warm beige (light) / warm dark (dark)
- **Accent:** Hydra Teal (`#01696f`)
- **Font (body):** Satoshi (Fontshare)
- **Font (display):** General Sans (Fontshare)
- **Radius:** `--radius-md` for inputs, `--radius-lg` for cards
- **Motion:** 180ms cubic-bezier(0.16, 1, 0.3, 1) for all interactive transitions

---

## Key Interaction Rules

- Spaces are **never deleted without confirmation** ("Move to Trash" with 7-day recovery)
- Templates show a **diff preview** when re-used after being updated
- File uploads show **real-time indexing progress** (chunking + embedding)
- Source URLs show **cache status** ("Fetched 2 hours ago" / "Not yet fetched")
- The AI profile selector shows **a brief description** of each profile's behavior on hover
- Every empty state has a **clear call to action** and a subtle illustration
