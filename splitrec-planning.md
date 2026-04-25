# Splitrec — Planning Document

> **Tagline:** Split receipts, not friendships.
> **Status:** Pre-development · MVP phase
> **Last updated:** 2026-04-18
> **Sources:** Planning sessions + PRD (MVP) + Product Guide + Database schema review + Brand logo (splitrec_logo.png)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Target User](#2-target-user)
3. [Brand & Design Tokens](#3-brand--design-tokens)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Database Design](#6-database-design)
7. [API Specification](#7-api-specification)
8. [Core Algorithm](#8-core-algorithm)
9. [Component Architecture (Atomic Design)](#9-component-architecture-atomic-design)
10. [UI/UX Flow](#10-uiux-flow)
11. [Error Handling & Edge Cases](#11-error-handling--edge-cases)
12. [Security & Validation](#12-security--validation)
13. [Monetization-Ready Architecture](#13-monetization-ready-architecture)
14. [Development Roadmap](#14-development-roadmap)
15. [Success Criteria](#15-success-criteria)
16. [Key Principles](#16-key-principles)

---

## 1. Overview

Splitrec is a **no-login, link-shareable bill splitting app**. Users create a bill, add participants, add purchases with itemized costs, assign who consumed what, and get an auto-calculated settlement showing who pays whom.

### MVP Scope

**In scope:**
- Create bill
- Add participants
- Add purchases + items per purchase
- Two split modes: **equal split** (divide total evenly) and **item-based split** (assign items per person)
- Auto-calculate settlement (minimize number of transactions)
- Share bill via read-only link
- Event logging infrastructure (for future ads/analytics — no UI in MVP)

**Out of scope (fast follow):**
- OCR receipt scanning
- Payment integration
- Ads UI (architecture prepared, no UI yet)
- User accounts / authentication
- Collaborative real-time editing

---

## 2. Target User

- Age 18–35: young professionals, office workers, students
- Use cases: group dining, traveling, shared household expenses
- Device: primarily mobile (iOS/Android browser)
- Technical level: non-technical — must work without any onboarding

**Core UX requirement:** A user must be able to complete a full split in **under 1 minute**.

---

## 3. Brand & Design Tokens

### Logo

Source file: `splitrec_logo.png`

The logo consists of:
- **Icon:** Receipt document (navy outline) overlapping a pie chart (green + sky blue segments) with two arrows indicating splitting
- **Wordmark:** "Split" in bold navy + "rec" in bold lime green — no space between
- **Tagline:** "Split receipts, not friendships." in light gray below wordmark
- **Background in source file:** Black — always render the logo on a white or light surface in the app

Place logo assets at:
```
public/
├── logo.png           # full logo (icon + wordmark) — app header, OG image
├── logo-icon.png      # icon only (receipt + pie chart) — favicon, small spaces
└── favicon.ico        # generated from logo-icon.png (32×32)
```

### Brand colors

Extracted from `splitrec_logo.png`:

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `brand-blue` | `#1B3A7A` | `222 63% 29%` | "Split" wordmark, primary buttons, nav active, headings |
| `brand-green` | `#5CBF2A` | `96 63% 45%` | "rec" wordmark, success states, positive balance, CTA accent |
| `brand-blue-light` | `#4A8FD4` | `210 60% 56%` | Pie chart secondary, hover tints, info badges, avatar fallback |
| `brand-gray` | `#8C8C8C` | `0 0% 55%` | Tagline, muted labels, secondary text |

### Tailwind config

`tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue:        '#1B3A7A',
          'blue-light': '#4A8FD4',
          green:       '#5CBF2A',
          gray:        '#8C8C8C',
        },
      },
    },
  },
}
export default config
```

### shadcn/ui CSS variable override

`src/app/globals.css` — add inside `:root {}` block that shadcn generates:

```css
:root {
  /* Override shadcn defaults with Splitrec brand */
  --primary:            222 63% 29%;   /* brand-blue  #1B3A7A */
  --primary-foreground: 0 0% 100%;     /* white text on primary */

  --accent:             96 63% 45%;    /* brand-green #5CBF2A */
  --accent-foreground:  0 0% 100%;

  --ring:               222 63% 29%;   /* focus ring = brand-blue */
}
```

### Typography

```ts
// src/app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

| Context | Family | Weight | Color |
|---|---|---|---|
| UI headings (h1–h3) | Inter | 600 | `brand-blue` |
| UI body text | Inter | 400 | foreground (shadcn default) |
| Muted / secondary | Inter | 400 | `brand-gray` |
| Wordmark "Split" | Inter | 700 | `brand-blue` |
| Wordmark "rec" | Inter | 700 | `brand-green` |
| Settlement amount | Inter | 600 | `brand-green` |
| Negative balance | Inter | 600 | destructive (shadcn red) |

### Color application rules

| UI element | Color |
|---|---|
| Primary `Button` (CTA) | `bg-brand-blue text-white hover:bg-brand-blue/90` |
| Success `Badge`, positive balance | `brand-green` |
| Negative balance (debtor) | shadcn destructive (red) |
| Settlement amount in `SettlementRow` | `text-brand-green font-semibold` |
| Active `SplitModeToggle` pill | `bg-brand-blue text-white` |
| `Avatar` default fallback | `bg-brand-blue-light text-white` |
| Focus ring (all inputs) | `ring-brand-blue` |
| Share button | `bg-brand-green text-white` |

### Logo usage rules

- Always render on `bg-white` or very light surface — source file has black bg, the logo itself is blue + green
- Full logo minimum width: **120px**
- Icon-only minimum size: **32px**
- Never recolor or apply opacity to the logo programmatically
- Dark mode: logo is readable as-is (navy + lime green on dark backgrounds)

### UI tone

Navy + lime green signals: **trustworthy, energetic, transparent**. Apply this to UI feel:
- Clean and spacious — generous padding, not cluttered
- Confident — clear typography hierarchy, no decorative noise
- Fast — optimistic UI, instant feedback, minimal loading states

---

## 4. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server Components for initial data fetch |
| Language | TypeScript (strict mode) | No `any` types |
| Styling | Tailwind CSS | Utility-first |
| UI Components | shadcn/ui | Copy-paste into `src/components/atoms/`, not a node_modules dep |
| Database | PostgreSQL via Neon | Serverless-compatible |
| ORM | Drizzle ORM | Type-safe, lightweight |
| Data fetching | SWR | Client-side cache + revalidation |
| Deployment | Vercel | FE + BE + Edge functions |
| Package manager | pnpm | |

### Key dependencies

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.30.0",
    "swr": "^2.2.0",
    "uuid": "^9.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5"
  }
}
```

### shadcn/ui setup

```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button input label badge sheet dialog checkbox separator card
```

---

## 5. Project Structure

```
public/
├── logo.png                          # Full logo (icon + wordmark)
├── logo-icon.png                     # Icon only — favicon / OG image
└── favicon.ico

src/
├── app/
│   ├── page.tsx                      # Home — create bill entry point
│   ├── layout.tsx                    # Root layout + Inter font + providers
│   ├── globals.css                   # Tailwind base + shadcn CSS vars + brand overrides
│   ├── bills/
│   │   └── [id]/
│   │       ├── page.tsx              # Bill edit page (Server Component)
│   │       └── loading.tsx           # Skeleton loading state
│   ├── s/
│   │   └── [token]/
│   │       └── page.tsx              # Share / read-only page (Server Component)
│   └── api/
│       ├── bills/
│       │   ├── route.ts              # POST /api/bills
│       │   ├── share/[token]/
│       │   │   └── route.ts          # GET /api/bills/share/[token]
│       │   └── [id]/
│       │       ├── route.ts          # GET, PATCH, DELETE /api/bills/[id]
│       │       ├── participants/
│       │       │   └── route.ts      # GET, POST
│       │       ├── purchases/
│       │       │   └── route.ts      # GET, POST
│       │       └── calculate/
│       │           └── route.ts      # POST — trigger split calculation
│       ├── participants/
│       │   └── [id]/
│       │       └── route.ts          # PATCH, DELETE
│       ├── purchases/
│       │   └── [id]/
│       │       ├── route.ts          # PATCH, DELETE
│       │       └── items/
│       │           └── route.ts      # POST
│       └── items/
│           └── [id]/
│               └── route.ts          # PATCH, DELETE
│
├── components/
│   ├── atoms/                        # Zero business logic, zero API calls
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── CurrencyInput/            # IDR-formatted number input
│   │   ├── Avatar/                   # Initials-based, color from name hash
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   ├── EmptyState/
│   │   ├── Toast/
│   │   ├── IconButton/
│   │   ├── Checkbox/
│   │   ├── Logo/                     # Renders logo.png with correct sizing
│   │   ├── AdSlot/                   # Stub — renders null in MVP
│   │   └── index.ts
│   ├── molecules/                    # Atom combinations — local state OK, no API
│   │   ├── ParticipantChip/
│   │   ├── ParticipantSelector/
│   │   ├── AddParticipantForm/
│   │   ├── ItemRow/
│   │   ├── AddItemForm/
│   │   ├── PurchaseHeader/
│   │   ├── SettlementRow/
│   │   ├── BalanceRow/
│   │   ├── ShareButton/
│   │   ├── SplitModeToggle/          # Toggle between 'equal' and 'item' mode
│   │   ├── ConfirmDialog/
│   │   └── index.ts
│   ├── organisms/                    # Business logic, hooks allowed
│   │   ├── BillHeader/
│   │   ├── BillSummary/
│   │   ├── ParticipantList/
│   │   ├── PurchaseCard/
│   │   ├── PurchaseList/
│   │   ├── SettlementResult/         # Contains <AdSlot /> stub
│   │   └── index.ts
│   └── templates/
│       ├── BillEditLayout/
│       └── ShareLayout/
│
├── hooks/
│   ├── useBill.ts
│   ├── useBillParticipants.ts
│   ├── usePurchase.ts
│   ├── useSettlement.ts
│   ├── useDeviceId.ts
│   ├── useOptimistic.ts
│   ├── useToast.ts
│   └── useShareLink.ts
│
├── lib/
│   ├── format.ts                     # formatIDR, formatDate
│   ├── colors.ts                     # avatarColor(name) hash
│   ├── initials.ts                   # getInitials(name)
│   ├── device.ts                     # generateDeviceId()
│   ├── events.ts                     # logEvent() — fire-and-forget, never throws
│   └── cn.ts                         # clsx + tailwind-merge
│
├── db/
│   ├── index.ts                      # Neon + Drizzle connection
│   └── schema.ts                     # All tables, relations, exported types
│
├── services/
│   ├── bill.service.ts
│   ├── participant.service.ts
│   ├── purchase.service.ts
│   ├── item.service.ts
│   ├── settlement.service.ts
│   └── event.service.ts
│
├── algorithms/
│   └── split.ts                      # Pure function — no DB, no side effects
│
└── types/
    ├── bill.types.ts
    └── api.types.ts
```

---

## 6. Database Design

### Architecture decision: `bill → purchases → items` (not flat)

We use a hierarchical structure because:
- Real receipts group items by transaction/purchase
- Multiple people can pay different purchases within one bill
- Flat structure loses "who paid for this receipt" — critical for accurate split

### Tables

```sql
-- bills
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
title         text NOT NULL
share_token   text NOT NULL UNIQUE
device_id     text NOT NULL
split_mode    text NOT NULL DEFAULT 'item'   -- 'equal' | 'item'
currency      text NOT NULL DEFAULT 'IDR'
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()

-- participants
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
bill_id       uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE
name          text NOT NULL

-- purchases
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
bill_id       uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE
title         text NOT NULL
paid_by       uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
total_amount  numeric(15,2) NOT NULL

-- items
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
purchase_id   uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE
name          text NOT NULL
price         numeric(15,2) NOT NULL
quantity      integer NOT NULL DEFAULT 1
note          text

-- item_consumers (composite PK prevents duplicates at DB level)
item_id        uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE
participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
quantity       integer NOT NULL DEFAULT 1   -- per-consumer quantity (how many units this person consumed)
PRIMARY KEY (item_id, participant_id)

-- debts (computed result — fully replaced on every /calculate call)
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
bill_id             uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE
from_participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
to_participant_id   uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
amount              numeric(15,2) NOT NULL

-- events (analytics + ads infrastructure — fire-and-forget, no PII)
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
device_id   text
event_name  text NOT NULL
metadata    jsonb
created_at  timestamptz NOT NULL DEFAULT now()

-- feature_flags (rewarded ads system — keyed by device_id for MVP)
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
device_id   text NOT NULL
feature     text NOT NULL                 -- 'receipt_scan' | 'premium_split'
enabled     boolean NOT NULL DEFAULT false
created_at  timestamptz NOT NULL DEFAULT now()
UNIQUE (device_id, feature)

-- settlements (future payment integration — in schema, unused in MVP)
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
bill_id             uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE
from_participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
to_participant_id   uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE
amount              numeric(15,2) NOT NULL
status              text NOT NULL DEFAULT 'pending'   -- 'pending' | 'paid'
paid_at             timestamptz
created_at          timestamptz NOT NULL DEFAULT now()
```

> **No `users` table in MVP.** `device_id` (localStorage UUID) is the sole identity. Add `users` in Phase 4.

### Recommended indexes

```sql
CREATE INDEX ON bills(share_token);
CREATE INDEX ON participants(bill_id);
CREATE INDEX ON purchases(bill_id);
CREATE INDEX ON items(purchase_id);
CREATE INDEX ON events(event_name);
CREATE INDEX ON events(device_id);
CREATE UNIQUE INDEX ON feature_flags(device_id, feature);
```

### Schema decision log

| Decision | Choice | Reason |
|---|---|---|
| Money columns | `numeric(15,2)` | Never `float` — precision errors in split math |
| `share_token` | Server-generated 12-char | Never from client |
| `device_id` | localStorage UUID | Sole ownership check for MVP |
| `item_consumers` PK | Composite `(item_id, participant_id)` | Prevents duplicates at DB level |
| `item_consumers.quantity` | Per-consumer integer (default 1) | Each person can consume a different number of units of the same item |
| `items.quantity` | Always 1 when consumers assigned | Only meaningful when consumers is empty (fallback equal-split uses it) |
| `debts` | Fully replaced on `/calculate` | Computed result, not a ledger |
| `settlements` | In schema, unused in MVP | Zero-migration activation for payment later |
| `events` | Always async, never awaited | Failure must never affect user flow |
| `feature_flags` | Keyed by `device_id` | No accounts in MVP |
| `users` table | Not created in MVP | No user value yet |

### Event catalog

| Event name | Fired when | Metadata |
|---|---|---|
| `bill_created` | POST /api/bills succeeds | `{ billId, splitMode }` |
| `participant_added` | Participant added | `{ billId, participantCount }` |
| `split_completed` | POST /api/bills/[id]/calculate | `{ billId, participantCount, debtCount, splitMode }` |
| `share_link_copied` | User copies share link | `{ billId }` |
| `bill_viewed_shared` | Share page opened | `{ billId }` |

---

## 7. API Specification

All endpoints under `/api`. All responses JSON.
Error format: `{ "error": string, "field"?: string, "reason"?: string }`.

### Auth convention

All mutating endpoints require:
```
x-device-id: <uuid from localStorage>
```
Server fetches `bills.device_id` and compares. Never trust `billId` from request body.

---

### Bills

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/bills` | Create new bill |
| `GET` | `/api/bills/[id]` | Get full bill with all relations |
| `PATCH` | `/api/bills/[id]` | Update title or split_mode |
| `DELETE` | `/api/bills/[id]` | Delete bill + cascade all data |
| `GET` | `/api/bills/share/[token]` | Get bill by shareToken — public |

**POST `/api/bills`**
```ts
// Body
{ title: string, deviceId: string, splitMode?: 'equal' | 'item' }
// Response 201
{ id, title, shareToken, splitMode, createdAt }
// Side effect: logEvent('bill_created') — no await
```

**GET `/api/bills/[id]`**
```ts
{
  id, title, shareToken, splitMode, currency, createdAt, updatedAt,
  participants: [{ id, name }],
  purchases: [{
    id, title, totalAmount,
    payer: { id, name },
    items: [{
      id, name, price, quantity, note,
      consumers: [{ participant: { id, name }, quantity: number }]
    }]
  }],
  debts: [{ id, amount, from: { id, name }, to: { id, name } }]
}
```

---

### Participants

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/bills/[id]/participants` | Add participant |
| `PATCH` | `/api/participants/[id]` | Rename |
| `DELETE` | `/api/participants/[id]` | Delete — 409 if has linked data |

---

### Purchases & Items

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/bills/[id]/purchases` | Add purchase |
| `PATCH` | `/api/purchases/[id]` | Update purchase |
| `DELETE` | `/api/purchases/[id]` | Delete + cascade items |
| `POST` | `/api/purchases/[id]/items` | Add item |
| `PATCH` | `/api/items/[id]` | Update item |
| `DELETE` | `/api/items/[id]` | Delete item + consumers |

**POST `/api/purchases/[id]/items`**
```ts
// Body
{ name: string, price: number, note?: string, consumers: { participantId: string, quantity: number }[] }
// consumers empty → cost goes to purchase payer (equal-split fallback)
// consumers non-empty → each person pays price × their own quantity
```

**PATCH `/api/items/[id]`**
```ts
// Body (all fields optional)
{ name?: string, price?: number, note?: string | null, consumers?: { participantId: string, quantity: number }[] }
```

---

### Calculate

**POST `/api/bills/[id]/calculate`** — Response 200:
```ts
{
  splitMode: 'equal' | 'item',
  balances: [{ participantId, name, paid, consumed, balance }],
  debts: [{ fromParticipantId, fromName, toParticipantId, toName, amount }]
}
// Side effect: logEvent('split_completed') — no await
```

---

## 8. Core Algorithm

File: `src/algorithms/split.ts` — pure function, no DB, no side effects.

### Mode A: Equal split

```
total       = sum of all purchase.totalAmount
share       = round(total / participants.length, 2)
paid[p]     = sum of purchases where paidBy === p
consumed[p] = share  ← same for everyone
balance[p]  = paid[p] - share
```

### Mode B: Item-based split

```
1. For each item:
   if consumers is empty → assign full cost (price × quantity) to purchase payer
   if consumers non-empty → each consumer pays round(price × consumer.quantity, 2)

2. paid[p]     = sum of purchase.totalAmount where paidBy === p
   consumed[p] = sum of all item amounts assigned to p
   balance[p]  = paid[p] - consumed[p]
```

### Settlement (both modes)

```
3. Greedy minimization:
   Sort creditors desc by balance
   Sort debtors desc by abs(balance)
   while both lists non-empty:
     amount = min(debtor.remaining, creditor.remaining)
     emit debt(debtor → creditor, amount)
     reduce remainders, advance pointer when 0
```

### TypeScript interfaces

```ts
export type SplitMode = 'equal' | 'item'

export interface SplitInput {
  splitMode: SplitMode
  participants: { id: string; name: string }[]
  purchases: {
    id: string
    paidBy: string
    totalAmount: number
    items: {
      id: string
      price: number
      quantity: number  // only used when consumers is empty (equal-split fallback)
      consumers: { participantId: string; quantity: number }[]
    }[]
  }[]
}

export interface SplitOutput {
  balances: { participantId: string; name: string; paid: number; consumed: number; balance: number }[]
  debts: { fromParticipantId: string; fromName: string; toParticipantId: string; toName: string; amount: number }[]
}

export function calculateSplit(input: SplitInput): SplitOutput
```

> Always use `Math.round(value * 100) / 100` for all intermediate money values.

---

## 9. Component Architecture (Atomic Design)

### Layer rule

```
Pages → Templates → Organisms → Molecules → Atoms
```

No layer imports from above. Hooks used in Organisms and Pages only.

---

### Atoms

| Component | Description |
|---|---|
| `Button` | variant: `primary\|ghost\|danger\|outline`. Primary uses `bg-brand-blue`. |
| `Input` | Controlled. `label`, `error`, `hint`. Focus ring: `ring-brand-blue`. |
| `CurrencyInput` | IDR-formatted. `value: number`, `onChange: (n) => void`. `type="text"` + `inputMode="numeric"` — no arrow spinners. Formats with dot separators (1.000.000) on blur. |
| `Avatar` | Initials circle. Color from name hash. Falls back to `brand-blue-light`. |
| `Badge` | variant: `success\|warning\|info\|neutral\|danger`. Success uses `brand-green`. |
| `Spinner` | size: `sm\|md`. |
| `EmptyState` | Illustration + title + subtitle + optional CTA. |
| `Toast` | variant: `success\|error\|warning`. Auto-dismiss 3s. |
| `IconButton` | Round icon-only. For edit/delete. |
| `Checkbox` | Controlled. For consumer assignment. |
| `Logo` | Renders `logo.png` via `next/image`. Props: `size: 'sm'\|'md'\|'lg'`. |
| `AdSlot` | Stub — always returns `null` in MVP. Props: `position: 'after_split_screen'`. |

### Molecules

| Component | Key props | Description |
|---|---|---|
| `ParticipantChip` | `participant`, `onDelete?` | Avatar + name + delete |
| `ParticipantSelector` | `participants`, `selectedIds`, `onChange` | Multi-checkbox consumer assign |
| `AddParticipantForm` | `onSubmit`, `isLoading` | Inline input + add |
| `ItemRow` | `item`, `onEdit`, `onDelete` | Item detail row — shows per-consumer qty (e.g. "Alice (2×), Bob") |
| `AddItemForm` | `participants`, `initialValues?`, `submitLabel?`, `onSubmit`, `onCancel` | Name + price-per-unit + consumer checkboxes + per-consumer qty inputs. `initialValues` enables edit mode. |
| `PurchaseHeader` | `purchase`, `payer`, `onEdit`, `onDelete` | Purchase title + payer + total |
| `SettlementRow` | `from`, `to`, `amount` | Avatar → Avatar + amount. Amount in `brand-green`. |
| `BalanceRow` | `balance` | Positive balance in `brand-green`, negative in red. |
| `ShareButton` | `shareToken` | Copy + Web Share API + "Disalin!" feedback |
| `SplitModeToggle` | `mode`, `onChange` | Toggle equal / item. Active pill: `brand-blue`. |
| `ConfirmDialog` | `title`, `description`, `onConfirm`, `onCancel` | Destructive confirm |

### Organisms

| Component | Hooks | Description |
|---|---|---|
| `BillHeader` | `useBill` | Logo + title (editable) + split mode toggle |
| `BillSummary` | `useBill` | 3 metric cards: total, participants, purchases |
| `ParticipantList` | `useBillParticipants` | Chips + add form |
| `PurchaseCard` | `usePurchase` | One purchase + items. Collapsible. |
| `PurchaseList` | `useBill` | All PurchaseCards + add purchase |
| `SettlementResult` | `useSettlement` | Debt rows + balance breakdown + `<AdSlot />` |

### Templates

**`BillEditLayout`** — named slots: `{ header, summary, participants, purchases, result }`

**`ShareLayout`** — named slots: `{ header, result }`

---

## 10. UI/UX Flow

### Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing — Logo + "Buat Tagihan" CTA button |
| `/bills/[id]` | Owner (deviceId match) | Full edit view |
| `/s/[token]` | Public | Read-only share view |

### Step-by-step

```
1. Open app → see Logo + "Buat Tagihan Baru" (brand-blue button)
   → POST /api/bills → redirect /bills/[id]
   → logEvent('bill_created')

2. Choose split mode via SplitModeToggle
   Default: 'item'. Option: 'equal' (hides items section)

3. Add participants → logEvent('participant_added')

4a. [Item mode] Add purchases → add items → assign consumers
4b. [Equal mode] Add purchases with totalAmount only

5. Auto-calculate on every change
   → logEvent('split_completed')
   → Show debts (amount in brand-green) + balance breakdown

6. Share → copy /s/[shareToken] → logEvent('share_link_copied')
```

### UX principles

- **Auto-save:** every action hits API — no save button
- **Optimistic UI:** update before response, rollback silently on failure
- **Auto-recalculate:** fires after every change
- **Mobile-first:** bottom sheets for all forms, 44px min touch targets
- **Equal mode:** hides items section entirely for faster flow
- **deviceId lost:** read-only mode + banner

---

## 11. Error Handling & Edge Cases

### HTTP codes

| Code | Scenario |
|---|---|
| `400` | Missing field, negative amount, invalid UUID |
| `403` | `x-device-id` mismatch |
| `404` | Resource not found |
| `409` | Delete conflict |
| `500` | Unexpected error — never expose stack trace |

### Algorithm edge cases

| Case | Behavior |
|---|---|
| Item no consumers | Auto-assign to purchase payer |
| Purchase no items (item mode) | Excluded from calc. Show hint. |
| Sum items > totalAmount | Warning. Calculate from item prices. |
| Sum items < totalAmount | Info: "Ada selisih Rp X" |
| All balances zero | Show "Semua sudah lunas!" |
| 1 participant | No debts, show breakdown only |

### Client

- Network error → toast "Gagal menyimpan. Coba lagi."
- `403` → banner "Kamu tidak dapat mengedit tagihan ini."
- Event log failure → silently ignored

---

## 12. Security & Validation

### Input rules

| Field | Rule |
|---|---|
| `title` | Non-empty. Max 200 chars. Trim. |
| `name` | Non-empty. Max 100 chars. Trim. |
| `totalAmount`, `price` | Positive. Max 999,999,999.99. |
| `quantity` | Integer. Min 1. Max 999. |
| `splitMode` | `'equal'` or `'item'` only. |
| `participantId` / `consumerIds` | Valid UUID, must belong to same bill. |

### Ownership check

```ts
async function verifyOwnership(resourceId: string, deviceIdHeader: string): Promise<void> {
  // Derive billId from resource → fetch bills.device_id → compare → 403 if mismatch
  // Never trust billId from request body
}
```

### Rate limiting

| Endpoint | Limit |
|---|---|
| `POST /api/bills` | 10 / hour / IP |
| `GET /api/bills/share/[token]` | 100 / min / IP |
| Other mutations | 60 / min / IP |

---

## 13. Monetization-Ready Architecture

No UI in MVP. Zero schema changes needed to activate.

### Event logging

```ts
// src/lib/events.ts — never throws, never awaited in user code
export async function logEvent(deviceId: string, eventName: string, metadata?: Record<string, unknown>) {
  try {
    await db.insert(events).values({ deviceId, eventName, metadata })
  } catch { /* silent */ }
}
```

### Feature flags

```ts
export async function isFeatureEnabled(deviceId: string, feature: string): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: and(eq(featureFlags.deviceId, deviceId), eq(featureFlags.feature, feature))
  })
  return flag?.enabled ?? false
}
```

Keys: `receipt_scan`, `premium_split`

### AdSlot stub

```tsx
// src/components/atoms/AdSlot/AdSlot.tsx
export function AdSlot({ position }: { position: 'after_split_screen' }) {
  return null  // TODO Phase 4: Google AdSense
}
```

Placed in `SettlementResult` between debt list and balance breakdown.

### Settlements table

Present in schema with `status: 'pending' | 'paid'`. Unused in MVP. Activated in Phase 4 for payment flow — no migration needed.

---

## 14. Development Roadmap

> **Status terakhir diupdate:** 2026-04-25
> **Stack aktual:** Next.js 16.2.4 · Tailwind v4 · Drizzle ORM 0.45.2 · @neondatabase/serverless 1.1.0 · Vitest 4.1.4
> **Catatan:** `tailwind.config.ts` tidak dipakai di Tailwind v4 — brand colors didefinisikan via `@theme` di `globals.css`. `app/` ada di root (bukan `src/app/`). Kode backend di `src/`. Share page pakai pola server component + client wrapper (`ShareView.tsx`) karena Next.js tidak izinkan passing fungsi dari server ke client component.
> **Favicon:** Sudah fix — `app/icon.png` (copy dari `logo-icon.png`), Next.js 13+ otomatis pakai sebagai favicon. `public/favicon.ico` lama tidak perlu dihapus.
> **API verified:** Semua endpoint ditest via curl dan hasilnya benar — item split, equal split, share token, ownership 403 check.

### Phase 1 — Backend foundation ✅ SELESAI

- [x] Init Next.js + pnpm + TypeScript + Tailwind (sudah ada saat project dibuat)
- [x] Add brand colors ke `globals.css` via `@theme` (Tailwind v4)
- [x] Logo files di `public/` (`logo.png`, `logo-icon.png`, `favicon.ico`)
- [x] Setup Neon + Drizzle (`src/db/index.ts`) — menggunakan `drizzle-orm/neon-http`
- [x] Full schema di `src/db/schema.ts` + applied ke Neon via node script (drizzle-kit push tidak support non-TTY)
- [x] Semua services (`src/services/`: bill, participant, purchase, item, settlement, event)
- [x] Split algorithm (`src/algorithms/split.ts`) — kedua mode + semua edge case
- [x] Semua API routes (`app/api/`: bills, participants, purchases, items, calculate, share)
- [x] Event logging (fire-and-forget, tidak pernah `await` dari user code)
- [x] Unit tests untuk split algorithm — `src/algorithms/split.test.ts`, 9 tests (vitest), semua pass ✅
- [x] Manual API test via curl — POST bills, participants, purchases, items, calculate, share, PATCH, DELETE, 403 ownership check semua ✅

**Done when:** Full CRUD works via API. Both split modes correct across all edge cases.

---

### Phase 2 — UI ✅ SELESAI (diupdate 2026-04-21)

- [x] `Logo` atom via `next/image`
- [x] Semua atoms: Button, Input, CurrencyInput, Avatar, Badge, Spinner, EmptyState, Toast, IconButton, Checkbox, Logo, AdSlot
- [x] Semua molecules: ParticipantChip, ParticipantSelector, AddParticipantForm, ItemRow, AddItemForm, PurchaseHeader, SettlementRow, BalanceRow, ShareButton, SplitModeToggle, ConfirmDialog
- [x] Semua organisms: BillHeader, BillSummary, ParticipantList, PurchaseCard, PurchaseList, SettlementResult
- [x] Templates: `BillEditLayout` dan `ShareLayout`
- [x] Semua custom hooks: useBill, useBillParticipants, usePurchase, useSettlement, useDeviceId, useToast, useShareLink
- [x] `app/page.tsx` — landing page dengan CTA "Buat Tagihan Baru" + POST /api/bills + redirect
- [x] `app/bills/[id]/page.tsx` — halaman edit bill, wire semua organisms + ToastContainer
- [x] `app/bills/[id]/loading.tsx` — skeleton loading (animated pulse)
- [x] Optimistic UI untuk semua mutations — SWR `KeyedMutator` dipakai di `useBillParticipants` dan `usePurchase` untuk instant UI update + rollback on error ✅
- [x] Auto-calculate setelah setiap mutation — `autoCalculate()` dipanggil silent setelah add/delete peserta, transaksi, item ✅

**Done when:** Full bill creation flow end-to-end on mobile.

---

### Phase 3 — Share & polish ✅ SELESAI (diupdate 2026-04-21)

- [x] `app/s/[token]/page.tsx` — server component, fetch by token, pass serialized BillData ke ShareView
- [x] `app/s/[token]/ShareView.tsx` — client wrapper (server component tidak bisa passing fungsi ke client component)
- [x] `ShareButton` (Web Share API + clipboard fallback) — wired di bill page dan share page
- [x] `ToastContainer` wired ke `app/bills/[id]/page.tsx`
- [x] Loading skeletons (`app/bills/[id]/loading.tsx`)
- [x] EmptyState component — dipakai di PurchaseList
- [x] Build check — `pnpm build` berhasil, 0 TypeScript error, semua routes terdaftar
- [x] End-to-end API verified via curl — item split, equal split, share token, 403 ownership check semua benar
- [ ] Mobile audit (390px, 430px) — **belum dilakukan** (butuh browser — lakukan manual di DevTools)
- [x] Favicon — `app/icon.png` (Next.js native, dari `logo-icon.png`) ✅
- [x] OG image + Twitter card — `layout.tsx` dan `app/s/[token]/page.tsx` sudah ada `generateMetadata` ✅

**Phase 3 post-release fixes (2026-04-25):**
- [x] **Per-consumer quantity** — `item_consumers.quantity` column ditambah (migration applied). Setiap konsumer punya qty sendiri. Form hapus global "Qty" item, ganti dengan qty input per orang setelah centang konsumer.
- [x] **Edit item** — tombol ✏️ di `ItemRow` buka inline `AddItemForm` (mode edit) dengan data pre-filled. Submit via `PATCH /api/items/:id`. `usePurchase.updateItem` ditambah.
- [x] **Input angka bukan `type="number"`** — semua qty input pakai `type="text"` + `inputMode="numeric"` (tidak ada arrow spinner).
- [x] **Format nominal dengan titik** — `CurrencyInput` sekarang format `1.000.000` saat blur, raw digits saat focus.
- [x] **Fix NaN di CurrencyInput saat edit item** — `quantity` per consumer tidak di-serialize di response `GET /api/bills/[id]` dan `GET /api/bills/share/[token]`. `AddItemForm` menghitung `initialTotalQty` dari `consumers.reduce(...)` — karena `quantity` undefined, hasilnya NaN yang masuk ke state `price`, lalu tampil sebagai "NaN" di input harga. Fix: tambah `quantity: c.quantity` di consumers mapping di kedua route (`app/api/bills/[id]/route.ts` dan `app/api/bills/share/[token]/route.ts`).

**Done when:** Create, fill, share — friend views result on phone. Link preview shows logo.

---

### Phase 4 — Growth & monetization ⏳ BELUM DIMULAI

- [ ] SEO: `generateMetadata()`, branded OG image per bill
- [ ] Analytics dari tabel `events`
- [ ] Aktifkan `<AdSlot />` dengan Google AdSense
- [ ] Rewarded ads → flip `receipt_scan` feature flag
- [ ] OCR receipt scan
- [ ] Payment integration (aktifkan tabel `settlements`)
- [ ] User accounts (tabel `users`)

---

### Yang perlu diselesaikan berikutnya (prioritas)

1. **[HARUS DILAKUKAN MANUAL]** Verifikasi end-to-end flow di browser — jalankan `pnpm dev`, test full flow: buat tagihan → tambah peserta → tambah transaksi + item → hitung → share link
2. **[HARUS DILAKUKAN MANUAL]** Mobile audit (390px, 430px) — buka Chrome DevTools → toggle device toolbar → test semua interaksi touch
3. **[HARUS DILAKUKAN MANUAL]** Test share page dari link yang di-share — pastikan OG preview muncul dengan judul bill yang benar
4. Setelah mobile audit: Phase 4 (SEO, analytics, AdSense)

---

## 15. Success Criteria

| Metric | Target | Measurement |
|---|---|---|
| Time to complete split | < 1 minute | `bill_created` → `split_completed` timestamp delta in `events` |
| Completion rate | ≥ 80% | `split_completed` / `bill_created` ratio |
| UX feedback | Positive from first 10 users | Qualitative interviews |
| Calculation speed | < 1 second | `/calculate` server response time |

---

## 16. Key Principles

1. **Under 1 minute.** Every UX decision filtered through this constraint.
2. **No over-engineering.** Add abstraction only when duplication is proven.
3. **Mobile-first.** Design for 390px. Everything else is enhancement.
4. **Atomic design boundaries are strict.** Atoms have zero business knowledge.
5. **Optimistic UI by default.** Every action feels instant. Rollback silently.
6. **Numeric precision is non-negotiable.** `numeric(15,2)` in DB. Never `float`.
7. **Events are fire-and-forget.** Never `await` a log call in user-facing code.
8. **Monetization is architecture, not afterthought.** Tables exist. Stubs placed. Zero schema changes to activate Phase 4.
9. **Two result concepts, clearly separated.** `debts` = ephemeral computed result. `settlements` = confirmed payment intent.
10. **Brand consistency.** `brand-blue` for primary actions, `brand-green` for positive/success states, always on white background.
11. **Readable above clever.** Any file understandable in under 2 minutes.

---

*End of planning document.*
*Next step: Phase 1 — init project, schema, and API routes.*
