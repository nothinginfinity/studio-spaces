# Studio Spaces — Roadmap: Phase 6 & 7

> **Status:** Future vision. Captured 2026-04-30. Not blocked on Phases 1–5. These phases extend the repo-native agent OS into ephemeral, transactable software delivery.

---

## The Big Idea — Ephemeral Commerce PWAs

Every PWA built by Studio Spaces agents can be treated as a **message that is also a transaction** — a personalized, single-use storefront delivered like a Snapchat, opened like a link, and gone after its purpose is fulfilled.

This flips the traditional e-commerce model:

| Traditional storefront | Ephemeral PWA storefront |
|---|---|
| Generic, permanent URL | Personalized, expiring URL |
| Anyone can visit at any time | Sent directly to one recipient |
| Owner maintains the shop | Agent generates the shop on demand |
| Buyer feels like a customer | Buyer feels like a VIP |
| Conversion driven by SEO | Conversion driven by relevance + urgency |

Ephemerality increases conversion because the storefront signals: *this was made for you, it won't be here tomorrow.*

---

## What Can Be Sold

The ephemeral storefront model works for any deliverable that can be gated behind a token:

- **Digital downloads** — files, PDFs, presets, templates, code
- **Video / content access** — buyer receives a token that unlocks a stream or download
- **Tickets** — event entry, access codes, time-limited passes
- **Physical products** — T-shirts, prints, merch; order captured, storefront disappears
- **Services** — booking a session, reserving a slot
- **Subscriptions** — first-month trial offer sent personally, expires if not activated

---

## How It Works (Technical Flow)

```
Owner defines product + recipient context
    │
    ▼
Agent generates personalized storefront
  - pulls product data from repo
  - customizes copy/design for recipient
  - commits generated index.html to a ephemeral deploy branch
    │
    ▼
CI deploys to a scoped URL with a session token
  e.g. https://studio-spaces.app/s/{token}
    │
    ▼
Owner shares link via SMS, QR code, Bluetooth, or NFC
    │
    ▼
Recipient opens link — storefront loads
    │
    ├── If purchase made → token redeemed, storefront URL returns 410 Gone
    └── If TTL expires → same result, regardless of purchase
    │
    ▼
Agent notified via MMCP — logs outcome, triggers fulfillment if needed
```

### Self-Destruct Logic

No complex server required. A token is a file in the repo:

```
tokens/{token-id}.json
  { "expires": "2026-05-02T00:00:00Z", "redeemed": false, "product": "...", "recipient": "..." }
```

The deployed PWA checks this file on load via the GitHub (or Gitea) API. If `redeemed: true` or `expires` is in the past, it renders a minimal "This storefront has expired" screen. When a purchase completes, the payment webhook flips `redeemed: true` via a commit. The storefront is now gone — enforced by the source of truth in git, not by a custom server.

---

## Phase 6 — Ephemeral Storefront Engine
**Owner: Bob (token/CI infrastructure) + Alice (storefront UI generator)**
**Goal: Generate, deploy, and expire single-use personalized PWA storefronts via link or QR code.**

### 6.1 — Token System
- [ ] **Token schema** — define `tokens/{id}.json` structure in the repo: `id`, `product`, `recipient`, `expires`, `redeemed`, `views`, `maxViews`
- [ ] **Token generator** — in the app, a "Create Storefront" flow that produces a token file committed to the active project repo
- [ ] **Expiry enforcement** — deployed PWA fetches its token file on load; renders expired state if TTL passed or `redeemed: true`
- [ ] **Redemption webhook** — on successful payment, a serverless function commits `redeemed: true` to the token file and optionally triggers an MMCP message to the owner's Space
- [ ] **View counter** — optional `maxViews` field; incremented on each load via a lightweight edge function; storefront self-destructs after N views even without purchase

### 6.2 — Storefront Generator
- [ ] **Agent-generated storefronts** — a Space (agent) takes product data + recipient context and generates a complete `index.html` storefront using a template repo as scaffold
- [ ] **Storefront template repo** — a dedicated repo of storefront templates (minimal, product card, video unlock, event ticket, merch drop) that agents pull from as a skill/tool repo
- [ ] **Personalization layer** — agent customizes headline, imagery, CTA copy, and pricing based on recipient context passed in the Space chat
- [ ] **Payment integration** — Stripe Payment Links or Stripe Checkout embedded in the generated PWA; no custom payment backend required
- [ ] **Fulfillment trigger** — on purchase, agent receives MMCP notification and handles fulfillment (send download link, issue ticket token, log order)

### 6.3 — Delivery via Link & QR
- [ ] **Shareable short URL** — generated storefront deployed to a predictable path: `/{project-slug}/s/{token-id}`
- [ ] **QR code generator** — in the app, one-tap QR code for any generated storefront token; displayed fullscreen for in-person scanning
- [ ] **SMS / iMessage share** — native Web Share API so owner can send the link directly from the app to any contact
- [ ] **Link preview metadata** — storefront `<head>` includes Open Graph tags so the link unfurls beautifully in iMessage, WhatsApp, etc.
- [ ] **Copy-link button** — simple fallback for any other delivery method

### 6.4 — Storefront Dashboard
- [ ] **Active tokens list** — per project, a view showing all live storefronts: recipient, product, expiry, view count, redeemed status
- [ ] **Revoke / extend** — owner can manually revoke a token (sets `redeemed: true`) or extend its TTL
- [ ] **Outcome log** — MMCP messages from the fulfillment agent are surfaced as a transaction feed in the dashboard

**Done when:** Owner can generate a personalized storefront in the app, share it via link or QR, receive payment, and the storefront self-destructs — all without leaving Studio Spaces.

---

## Phase 7 — Local Delivery: Bluetooth, NFC & Proximity Commerce
**Owner: Bob (infra) + Alice (UI)**
**Goal: Deliver ephemeral storefronts over local wireless channels (Bluetooth, NFC, Wi-Fi Direct) for in-person commerce without requiring the recipient to have any app installed.**

Phase 7 is about closing the last gap in the delivery stack: **the in-person transaction**. Someone is standing in front of you at a market, an event, or a meeting. They don't have your link. You tap their phone. They have a storefront.

### 7.1 — Web Bluetooth Delivery
- [ ] **Bluetooth beacon mode** — use the Web Bluetooth API to broadcast the storefront URL as a short payload to nearby devices
- [ ] **Receive mode** — on the recipient's device, a lightweight receive page (or the Studio Spaces PWA) picks up the beacon and opens the storefront URL automatically
- [ ] **Range and timing control** — owner sets broadcast TTL (e.g. broadcast for 60 seconds); after that, Bluetooth advertising stops

### 7.2 — NFC Tap Delivery
- [ ] **NFC write** — use the Web NFC API (`NDEFWriter`) to write the storefront URL to any NFC tag or directly to an NFC-capable Android device
- [ ] **Tap-to-open** — recipient taps phone to NFC tag or owner's device; storefront URL opens automatically in their browser, no app required
- [ ] **Physical NFC artifacts** — owner can write a storefront token to a physical NFC card or sticker; hand it to the recipient; the card *is* the storefront delivery mechanism
- [ ] **iOS compatibility note** — Web NFC is currently Android/Chrome only; on iOS, fall back to QR code; document the limitation clearly in the UI

### 7.3 — Wi-Fi Direct / Local Network Delivery
- [ ] **Local serve mode** — when running on a laptop or home server, Studio Spaces can serve the generated PWA on the local network (e.g. `192.168.x.x:3000/s/{token}`) so nearby devices on the same Wi-Fi can access it without hitting GitHub Pages
- [ ] **mDNS discovery** — optional: broadcast the storefront URL via mDNS (`storefront.local`) so recipients on the same network can find it without typing an IP
- [ ] **Gitea / local forge integration** — when the local-first path (Phase 4) is active, the storefront is served from the local forge rather than GitHub Pages; full offline operation on a local network

### 7.4 — Proximity Commerce UX
- [ ] **"Send Storefront" action** in the app — a unified share sheet that presents all available delivery methods: Link, QR, NFC, Bluetooth, SMS; picks the best one based on device capabilities
- [ ] **Delivery confirmation** — when the recipient opens the storefront, the owner's Space receives an MMCP notification: "Storefront opened by [recipient]"
- [ ] **In-person payment fallback** — if the recipient can't complete digital payment, the storefront can display a "Pay in person" option that marks the token as pending and notifies the owner via MMCP

**Done when:** Owner can tap a recipient's phone at an in-person event, the recipient sees a personalized storefront in their browser (no app install required), and the purchase flow completes end-to-end. The storefront is gone afterward.

---

## The Vision in One Sentence

Studio Spaces becomes a **personal ephemeral commerce platform** — where every product, every storefront, and every transaction is generated by an agent, delivered like a message, and expires like a Snapchat.

---

## Dependencies

| Phase 6/7 feature | Requires |
|---|---|
| Token system | Phase 3 (repo-as-tool) + Phase 4 (provider abstraction) |
| Storefront generator | Phase 3 (repo-as-template linking) |
| Payment integration | Stripe account + webhook endpoint (Cloudflare Worker) |
| QR / Link share | Phase 5 (PWA service worker baseline) |
| Bluetooth delivery | Web Bluetooth API (Chrome/Android only for now) |
| NFC delivery | Web NFC API (Android/Chrome only; iOS fallback to QR) |
| Local network serve | Phase 4 (Gitea/Forgejo local-first path) |

---

## Notes & Constraints

- **No persistent payment backend needed for Phase 6.** Stripe handles payment processing; the only custom logic is the token redemption commit, which can be a Cloudflare Worker or a Gitea webhook handler.
- **Ephemerality is enforced by git, not by server state.** Token files in the repo are the source of truth. The storefront reads them on load. This is consistent with the Studio Spaces architecture principle: the repo IS the operating system.
- **Bluetooth and NFC are currently limited to Chrome on Android.** iOS support for Web NFC does not exist as of 2026. Plan for QR code as the iOS fallback in Phase 7 UI.
- **Personalization is the moat.** Generic storefronts have no advantage over Gumroad or Shopify. The value is that an agent can generate a storefront *customized for a specific recipient* in seconds — by name, by context, by what they care about. That is only possible because Studio Spaces knows the project context.

---

*Captured: 2026-04-30. Owner vision. Not blocking Phase 2–5. Revisit when Phase 5 (push notifications) is complete.*
