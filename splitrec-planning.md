# Splitrec — Planning Document

> **Tagline:** Split receipts, not friendships.
> **Status:** Pre-development · MVP phase
> **Last updated:** 2026-05-03
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
17. [Changelog](#17-changelog)

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
charges       jsonb          -- nullable: { tax, serviceCharge, gratuity, discount, discountMode }

-- items
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
purchase_id   uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE
name          text NOT NULL
price         numeric(15,2) NOT NULL
quantity      integer NOT NULL DEFAULT 1
note          text
discount      numeric(15,2) NOT NULL DEFAULT 0   -- per-item discount total (shared among consumers proportionally)

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
| `items.discount` | `numeric(15,2)` NOT NULL DEFAULT 0 | Per-item discount total. Distributed proportionally among consumers by their qty share. Applied before charges calculation. Migration: `0003_item_discount.sql`. |
| `purchases.charges` | JSONB, nullable | Stores per-purchase additional charges. Null = no charges. Never stored as a separate table — it's always loaded with the purchase. |
| `purchases.charges.discountMode` | Always `'equal'` going forward | `'item'` mode removed from UI; field kept in JSONB for backward compat with existing data. |
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
    charges: { tax, serviceCharge, gratuity, discount, discountMode } | null,
    payer: { id, name },
    items: [{
      id, name, price, quantity, note,
      discount: number,   // per-item discount total
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
{
  name: string,
  price: number,
  note?: string,
  discount?: number,   // per-item discount total (default 0)
  consumers: { participantId: string, quantity: number }[]
}
// consumers REQUIRED — at least 1 consumer must be specified
// each consumer pays: (price × consumerQty) − proportional share of item discount
```

**PATCH `/api/purchases/[id]`**
```ts
// Body (all fields optional)
{
  title?: string
  paidBy?: string
  totalAmount?: number
  charges?: {
    tax: number
    serviceCharge: number
    gratuity: number
    discount: number          // global discount — always split equally
    discountMode: 'equal'     // only 'equal' used; 'item' mode removed from UI
  } | null
}
```

**PATCH `/api/items/[id]`**
```ts
// Body (all fields optional)
{ name?: string, price?: number, note?: string | null, discount?: number, consumers?: { participantId: string, quantity: number }[] }
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
   effectiveCost = (price × sum(consumer.quantity)) − item.discount
   each consumer pays: round(effectiveCost × (consumer.quantity / totalQty), 2)
   -- consumers always required; empty consumers is a legacy fallback only

2. paid[p]     = sum of purchase.totalAmount where paidBy === p
   consumed[p] = sum of all item amounts assigned to p
   balance[p]  = paid[p] - consumed[p]
```

### Mode B + Charges (per-purchase additional charges)

When a per-item purchase has `charges` set:

```
effectiveItemTotal = sum over items of (price × sum(consumer.quantity) − item.discount)
others (auto)      = max(0, totalAmount + globalDiscount − effectiveItemTotal − tax − serviceCharge − gratuity)

For each participant p:
  equalShare    = round((tax + serviceCharge + gratuity + others) / participants.length, 2)
  discountShare = round(globalDiscount / participants.length, 2)   -- always equal split
  consumed[p]   = round(itemConsumed[p] + equalShare − discountShare, 2)
```

`others` is auto-calculated (not stored) — absorbs the gap between `totalAmount` and the sum of effective item costs + explicit charges.  
**Two discount types:**
- **Per-item discount** (`items.discount`) — deducted from an item's total cost before distributing among that item's consumers.
- **Global discount** (`purchases.charges.discount`) — always divided equally among all participants. `discountMode` field kept in schema for backward compat but UI only ever writes `'equal'`.

**Balance enforcement:** `effectiveItemTotal + tax + serviceCharge + gratuity − globalDiscount` must not exceed `totalAmount`. If `others` would go negative (items + charges > total + globalDiscount), the UI auto-populates the global discount field with the excess and blocks "Hitung Pembagian" until all per-item purchases are balanced.

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

export interface PurchaseCharges {
  tax: number
  serviceCharge: number
  gratuity: number
  discount: number          // global discount — always equal split
  discountMode: 'equal' | 'item'  // kept for backward compat; UI always writes 'equal'
}

export interface SplitInput {
  splitMode: SplitMode
  participants: { id: string; name: string }[]
  purchases: {
    id: string
    paidBy: string
    totalAmount: number
    charges?: PurchaseCharges | null
    items: {
      id: string
      price: number          // per-portion price = totalItemCost / sum(consumer.quantity)
      quantity: number       // fallback when consumers empty (legacy)
      discount?: number      // per-item discount total (distributed proportionally among consumers)
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
| `PurchaseCard` | `usePurchase` | One purchase + items + inline edit form + badge (Per Item / Bagi Rata) + `ChargesPanel` |
| `PurchaseList` | `useBill` | All PurchaseCards + add purchase |
| `SettlementResult` | `useSettlement` | Debt rows + balance breakdown + charges breakdown + `<AdSlot />` |

### Templates

**`BillEditLayout`** — named slots: `{ header, summary, participants, purchases, result }`

**`ShareLayout`** — named slots: `{ header, result }`

---

## 10. UI/UX Flow

### Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing — Logo + "Buat Tagihan Baru" CTA button |
| `/bills/[id]` | Owner (deviceId match) | Full edit view |
| `/bills/[id]/result` | Owner | Hasil pembagian — shows settlement + "Buat Tagihan Baru" + ShareButton |
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

> **Status terakhir diupdate:** 2026-05-03
> **Stack aktual:** Next.js 16.2.4 · Tailwind v4 · Drizzle ORM 0.45.2 · @neondatabase/serverless 1.1.0 · Vitest 4.1.4 · @vercel/analytics 2.0.1 · @vercel/speed-insights 2.0.0
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

**Phase 3 post-release fixes (2026-04-25) — v1.1.0 / v1.1.1:**
- [x] **Per-consumer quantity** — `item_consumers.quantity` column ditambah (migration applied). Setiap konsumer punya qty sendiri. Form hapus global "Qty" item, ganti dengan qty input per orang setelah centang konsumer.
- [x] **Edit item** — tombol ✏️ di `ItemRow` buka inline `AddItemForm` (mode edit) dengan data pre-filled. Submit via `PATCH /api/items/:id`. `usePurchase.updateItem` ditambah.
- [x] **Input angka bukan `type="number"`** — semua qty input pakai `type="text"` + `inputMode="numeric"` (tidak ada arrow spinner).
- [x] **Format nominal dengan titik** — `CurrencyInput` sekarang format `1.000.000` saat blur, raw digits saat focus.
- [x] **Fix NaN di CurrencyInput saat edit item** — `quantity` per consumer tidak di-serialize di response. Fix: tambah `quantity: c.quantity` di consumers mapping di kedua GET route.

**Phase 3 post-release features (2026-04-27) — v1.2.0: Per-item charges:**
- [x] **DB migration** — `charges jsonb` column ditambah ke tabel `purchases` (`drizzle/0002_purchase_charges.sql`, applied via Neon Serverless SDK langsung karena drizzle-kit migrate timeout).
- [x] **Types** — `PurchaseCharges` interface di `src/types/bill.types.ts`; `charges: PurchaseCharges | null` di `PurchaseData`.
- [x] **Service + API** — `purchase.service.ts` dan `PATCH /api/purchases/[id]` menerima dan menyimpan `charges`. `GET /api/bills/[id]` dan `GET /api/bills/share/[token]` menyertakan `charges` di response.
- [x] **Algorithm** — `src/algorithms/split.ts` extended: per-purchase charges distribution (tax/service/gratuity/others = equal split; discount = equal atau per-item proportional). `others` dihitung otomatis sebagai selisih antara `totalAmount` dan sum item + explicit charges.
- [x] **ChargesPanel** — komponen baru di `PurchaseCard.tsx`. Input pajak, service charge, gratuity, diskon. `Others (auto)` dikalkulasi live. Discount mode toggle (rata / per item). **Auto-save** dengan debounce 800ms via `useRef` — tidak ada tombol "Simpan Biaya", perubahan tersimpan otomatis. Indikator "Menyimpan..." saat save berjalan.
- [x] **Badge Per Item / Bagi Rata** — pill di sebelah judul transaksi di `PurchaseHeader`. `isPerItem = purchase.items.length > 0 || defaultAddingItem`.
- [x] **Edit transaksi inline** — mode edit di `PurchaseCard`: ubah judul, total, pembayar. Charges panel hanya tampil setelah minimal 1 item ditambahkan.
- [x] **Sembunyikan "Tambah Item" untuk bagi rata** — section items hanya tampil jika `purchase.items.length > 0 || (defaultAddingItem && isOwner)`.
- [x] **SettlementResult breakdown** — `computeBreakdown` di `SettlementResult.tsx` menyertakan charges breakdown (pajak & biaya lainnya rata, diskon) sebagai baris tambahan per peserta.
- [x] **Halaman hasil pembagian** — `app/bills/[id]/result/page.tsx` sebagai halaman dedicated result. Berisi `SettlementResult`, `ShareButton`, tombol "Edit" (owner only), dan tombol **"Buat Tagihan Baru"** (fungsi identik dengan landing page).

**Phase 3 post-release bug fixes (2026-04-27) — v1.2.0 (lanjutan):**
- [x] **Others (auto) floating point** — Semua kalkulasi intermediate di `ChargesPanel` dan `computeBreakdown` menggunakan `r2 = (n) => Math.round(n * 100) / 100`. Tidak ada lagi residual seperti `0.01`.
- [x] **itemTotal formula salah** — Bug: `item.price * item.quantity` (= per-portion price × 1). Fix: `item.price × sum(consumer.quantity)` untuk item dengan konsumer. Diperbaiki di `ChargesPanel` (owner + non-owner view) dan `SettlementResult.computeBreakdown`.
- [x] **Harga total tampil float** — CurrencyInput `handleFocus` dan `formatWithDots` sekarang `Math.round()` sebelum display. `AddItemForm` initial price juga `Math.round(price × totalQty)`.
- [x] **Qty per orang tidak bisa dihapus** — `qtys` state di `AddItemForm` diganti dari `Record<string, number>` ke `Record<string, string>`. User bisa hapus angka dan isi ulang. Submit diblokir jika ada qty < 1.
- [x] **Charges tidak retain saat navigasi Edit → Result → Edit** — Diatasi oleh auto-save charges (debounce 800ms). Charges tersimpan otomatis tanpa perlu klik tombol.
- [x] **BillSummary crash saat bill baru dibuat** — `purchases ?? []` sebagai fallback defensif. Root cause: SWR fetcher tidak throw saat response non-OK, body error tersimpan sebagai `data`.

**Phase 3 post-release patch (2026-04-30) — v1.3.1: Vercel Analytics & Speed Insights:**
- [x] **Vercel Analytics** — `@vercel/analytics` ditambah. `<Analytics />` di-render di `app/layout.tsx`. Page views + visitor data otomatis terkirim ke Vercel dashboard saat production. Dev mode tidak mengirim data ke dashboard.
- [x] **Speed Insights** — `@vercel/speed-insights` ditambah. `<SpeedInsights />` di-render di `app/layout.tsx`. Core Web Vitals (LCP, FID, CLS) dilacak otomatis saat deployed ke Vercel. Tidak perlu env variable apapun.

**Phase 3 post-release features (2026-04-28) — v1.3.0: Per-item discount + balance enforcement + UX polish:**
- [x] **DB migration `0003_item_discount.sql`** — `discount numeric(15,2) NOT NULL DEFAULT 0` ditambah ke tabel `items`. Applied via Neon Serverless HTTP ke dev dan production.
- [x] **Per-item discount** — `ItemData.discount: number` di types. `AddItemForm` punya field "Diskon item (opsional)". `ItemRow` menampilkan baris diskon jika > 0. Service, API POST/PATCH, dan GET bill route semua pass-through `discount`.
- [x] **Algorithm update** — per-item discount dikurangi dari cost item sebelum didistribusikan ke consumers secara proporsional. Global discount (`charges.discount`) sekarang selalu equal split — logika `discountMode: 'item'` dihapus dari UI (field tetap ada di schema untuk backward compat).
- [x] **Hapus toggle Diskon Rata / Diskon Per Item** — toggle buttons di `ChargesPanel` dihapus. Global discount selalu equal split. Non-owner label juga disederhanakan dari `Diskon (rata/per item)` → `Diskon`.
- [x] **Balance enforcement** — `computeItemTotal` di-extract ke module-level dan di-export dari `PurchaseCard`. `ChargesPanel` auto-populate `charges.discount` jika `effectiveItemTotal + charges > totalAmount`. Alert inline muncul di bawah baris diskon jika transaksi masih unbalanced. Tombol "Hitung Pembagian" disabled sampai semua per-item transaksi balanced.
- [x] **Participants required** — Label "Siapa yang makan? (kosongkan = dibagi ke pemesan)" → "Participants". Submit item diblokir jika belum memilih minimal 1 participant.
- [x] **Button tidak sticky** — "Hitung Pembagian" dipindah dari `fixed bottom-0` ke slot `footer` di `BillEditLayout`. `pb-24` → `pb-8`. Template `BillEditLayout` dapat prop `footer?: ReactNode`.
- [x] **SettlementResult breakdown update** — `computeBreakdown` menyertakan per-item discount dalam kalkulasi share per peserta (dikurangi proporsional sesuai qty konsumer).

**Done when:** Create, fill, share — friend views result on phone. Link preview shows logo.

---

**Phase 3 post-release features (2026-05-02) — v1.4.0: UX feedback improvements:**
- [x] **`AddItemForm` — semua consumer default tercentang** — `selectedIds` diinisialisasi dengan semua `participant.id`. User tinggal uncheck siapa yang tidak ikut. `useEffect` re-sync jika peserta baru ditambah saat form terbuka.
- [x] **`AddItemForm` — qty per orang collapsed by default** — Toggle "Atur qty per orang (opsional)" tersembunyi di bawah participant selector. Qty inputs hanya tampil jika toggle aktif.
- [x] **`AddItemForm` — submit dengan Enter** — Field terakhir (harga) pasang `onKeyDown`: `Enter` → submit jika form valid.
- [x] **`AddItemForm` — form reset bukan close setelah submit** — Setelah tambah item, form clear dan tetap terbuka. Tombol "Batal" untuk tutup eksplisit. `selectedIds` direset ke semua tercentang.
- [x] **`AddParticipantForm` — submit dengan Enter** — Input nama pasang `onKeyDown` untuk trigger submit.
- [x] **`AddParticipantForm` — hint minimal 2 peserta** — Label hint di bawah input, hanya tampil jika `participants.length < 2`.
- [x] **`ParticipantList` — optimistic chip** — Chip peserta muncul sebelum API response, rollback jika gagal.
- [x] **`StepIndicator`** — Komponen baru `src/components/molecules/StepIndicator/StepIndicator.tsx`. 3 step: Peserta → Transaksi → Hasil. Status `done`/`active`/`pending` dihitung dari jumlah peserta dan transaksi. Ditampilkan di `BillEditLayout` dan halaman result (owner only).
- [x] **Section Transaksi dimmed** — `opacity-40 pointer-events-none` jika `participants.length < 2`.
- [x] **`SettlementResult` — summary banner** — Banner hijau di atas list: "Tagihan selesai dihitung!" + jumlah orang + jumlah transfer. Alternatif "Semua sudah lunas! 🎉" jika tidak ada hutang.
- [x] **`SettlementRow` — nominal lebih besar** — Amount ditampilkan `text-lg font-semibold text-brand-green`, bukan `Badge`.
- [x] **`SettlementRow` — tombol "Salin" per baris** — Copy teks `"[dari] bayar [ke] Rp X"` ke clipboard + feedback "Disalin!".
- [x] **`SettlementResult` — bank info creditor** — Section "Info Rekening Penerima" ditampilkan di atas settlement list. Owner bisa isi/edit nama bank dan nomor rekening per creditor. Non-owner melihat info yang sudah diisi (atau "Belum diisi"). Tombol copy nomor rekening.
- [x] **`useBillParticipants` — `updateBankInfo`** — PATCH `/api/participants/:id` dengan `{ bankName, bankAccount }`.
- [x] **DB migration `bank_name`/`bank_account`** — Dua kolom `text` nullable ditambah ke tabel `participants` (`scripts/apply-bank-info-migration.mjs`, applied via Neon Serverless HTTP).
- [x] **`ParticipantData` types** — `bankName?: string | null` dan `bankAccount?: string | null` ditambah ke interface.
- [x] **`app/bills/[id]/transaksi/page.tsx`** — Halaman edit terpisah untuk transaksi. `app/bills/[id]/page.tsx` difokuskan ke peserta + step navigator.
- [x] **Algorithm fix** — Kalkulasi charges distribution diperbaiki.

**Phase 3 post-release bug fixes (2026-05-02) — v1.4.1: Share page bank info:**
- [x] **`app/api/bills/share/[token]/route.ts` — bank info missing** — `bankName` dan `bankAccount` tidak diinclude di response participants. Fix: tambah kedua field ke mapping.
- [x] **`app/s/[token]/page.tsx` — bank info missing** — Server component juga strip `bankName`/`bankAccount` saat build `BillData`. Fix: tambah kedua field ke mapping participants.

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

1. **[HARUS DILAKUKAN MANUAL]** Verifikasi end-to-end flow v1.4.1 di browser — jalankan `pnpm dev`, test: buat tagihan → tambah peserta → tambah transaksi + item → hitung pembagian → isi rekening creditor → share link → buka di incognito/device lain → pastikan info rekening muncul
2. **[HARUS DILAKUKAN MANUAL]** Mobile audit (390px, 430px) — test StepIndicator, AddItemForm (default semua tercentang, qty toggle), SettlementRow (nominal besar, tombol Salin), bank info card
3. **[DEPLOY]** Deploy ke production — `vercel --prod`
4. Setelah mobile audit dan deploy: Phase 4 (SEO, analytics, AdSense)

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

---

## 17. Changelog

### v1.4.1 — 2026-05-02
**Bug fixes**
- Fix info rekening (bank name + nomor rekening) tidak muncul di halaman share (`/s/[token]`) meskipun sudah diisi — dua titik yang sama-sama strip field saat serialisasi: `app/api/bills/share/[token]/route.ts` (API route) dan `app/s/[token]/page.tsx` (server component).

---

### v1.4.0 — 2026-05-02
**UX improvements berdasarkan feedback pengguna pertama (NPS 5/10 → target 8/10)**

- `AddItemForm`: semua consumer default tercentang — user tinggal uncheck siapa yang tidak ikut
- `AddItemForm`: qty per orang collapsed by default di balik toggle "Atur qty per orang (opsional)"
- `AddItemForm`: submit dengan Enter, form reset (bukan close) setelah tambah item
- `AddParticipantForm`: submit dengan Enter, hint "Tambah minimal 2 peserta"
- `ParticipantList`: optimistic chip muncul sebelum API response
- `StepIndicator`: komponen baru, 3 langkah (Peserta → Transaksi → Hasil), tampil di halaman edit dan result
- Section Transaksi dimmed (`opacity-40 pointer-events-none`) jika peserta < 2
- `SettlementResult`: summary banner hijau di atas list ("Tagihan selesai dihitung!" / "Semua sudah lunas! 🎉")
- `SettlementRow`: nominal transfer ditampilkan `text-lg font-semibold text-brand-green` (bukan Badge kecil)
- `SettlementRow`: tombol "Salin" per baris — copy teks `"[dari] bayar [ke] Rp X"` ke clipboard
- `SettlementResult`: section "Info Rekening Penerima" — owner isi/edit nama bank + no rekening per creditor, non-owner lihat hasilnya
- DB migration: kolom `bank_name` dan `bank_account` (text, nullable) ditambah ke tabel `participants`
- `app/bills/[id]/transaksi/page.tsx`: halaman transaksi dipisah dari halaman peserta
- Algorithm fix: perbaikan distribusi charges

---

### v1.3.1 — 2026-04-30
**Observability**
- Tambah `@vercel/analytics` — page views + visitor data otomatis ke Vercel dashboard di production
- Tambah `@vercel/speed-insights` — Core Web Vitals (LCP, FID, CLS) dilacak otomatis

---

### v1.3.0 — 2026-04-28
**Per-item discount + balance enforcement + UX polish**

- DB migration: kolom `discount numeric(15,2) NOT NULL DEFAULT 0` ditambah ke tabel `items`
- `AddItemForm`: field "Diskon item (opsional)" per item
- `ItemRow`: baris diskon ditampilkan jika > 0
- Algorithm: per-item discount dikurangi dari cost item sebelum distribusi ke consumers (proporsional per qty). Global discount (`charges.discount`) sekarang selalu equal split — toggle `discountMode` dihapus dari UI
- `ChargesPanel`: hapus toggle Diskon Rata / Diskon Per Item. Global discount selalu equal split
- Balance enforcement: `ChargesPanel` auto-populate `charges.discount` jika `effectiveItemTotal + charges > totalAmount`. Alert inline muncul jika masih unbalanced. Tombol "Hitung Pembagian" disabled sampai semua per-item transaksi balanced
- `AddItemForm`: submit diblokir jika belum pilih minimal 1 participant
- Tombol "Hitung Pembagian" dipindah dari `fixed bottom-0` ke slot `footer` di `BillEditLayout`
- `SettlementResult`: `computeBreakdown` menyertakan per-item discount dalam kalkulasi share per peserta

---

### v1.2.0 — 2026-04-27
**Per-purchase charges**

- DB migration: kolom `charges jsonb` nullable ditambah ke tabel `purchases`
- `PurchaseCharges` interface: `{ tax, serviceCharge, gratuity, discount, discountMode }`
- `ChargesPanel`: input pajak, service charge, gratuity, diskon dengan auto-save debounce 800ms. `Others (auto)` dikalkulasi live sebagai selisih `totalAmount` dan sum item + explicit charges
- Algorithm extended: distribusi charges per purchase — tax/service/gratuity/others dibagi equal; discount dibagi equal atau per-item proporsional
- Badge "Per Item" / "Bagi Rata" di `PurchaseHeader`
- Edit transaksi inline di `PurchaseCard`
- `app/bills/[id]/result/page.tsx`: halaman hasil pembagian dedicated

Bug fixes (lanjutan v1.2.0):
- Fix `others` floating point — semua kalkulasi intermediate pakai `r2 = Math.round(n * 100) / 100`
- Fix `itemTotal` formula salah (`price × quantity` → `price × sum(consumer.quantity)`)
- Fix harga total tampil float di `CurrencyInput`
- Fix qty per orang tidak bisa dihapus — `qtys` state diganti dari `Record<string, number>` ke `Record<string, string>`

---

### v1.1.1 — 2026-04-25
**Bug fixes**

- Fix NaN di `CurrencyInput` saat edit item — `quantity` per consumer tidak di-serialize di response. Fix: tambah `quantity: c.quantity` di consumers mapping di GET route

---

### v1.1.0 — 2026-04-25
**Per-consumer quantity + edit item**

- DB migration: kolom `quantity integer NOT NULL DEFAULT 1` ditambah ke tabel `item_consumers`
- `AddItemForm`: hapus global "Qty" item, ganti dengan qty input per consumer setelah centang
- `ItemRow`: tampilkan qty per consumer (e.g. "Alice (2×), Bob")
- Edit item inline: tombol ✏️ di `ItemRow` buka `AddItemForm` mode edit dengan data pre-filled. Submit via `PATCH /api/items/:id`
- Semua qty input pakai `type="text"` + `inputMode="numeric"` (tidak ada arrow spinner)
- `CurrencyInput`: format `1.000.000` saat blur, raw digits saat focus
- Daily cron cleanup + 7-day share link expiry warning

---

### v1.0.0 — 2026-04-25
**MVP production launch**

- Full bill creation flow: buat tagihan → tambah peserta → tambah transaksi + item → assign consumer → hitung pembagian → share link
- Dua split mode: **item-based** (assign item per orang) dan **equal** (bagi rata total)
- Share via read-only link (`/s/[token]`) — server component + `ShareView` client wrapper
- OG image + Twitter card di share page
- Auto-calculate setelah setiap mutation
- Optimistic UI di semua mutations (rollback on error)
- `deviceId` (localStorage UUID) sebagai sole ownership check
- Event logging infrastructure (fire-and-forget, tidak pernah diawait)
- `app/icon.png` sebagai favicon (Next.js native)

---

### v0.0.1 — 2026-04-18
**Initial commit**

- Init Next.js + pnpm + TypeScript + Tailwind v4
- Schema Neon + Drizzle: semua tabel (`bills`, `participants`, `purchases`, `items`, `item_consumers`, `debts`, `events`, `feature_flags`, `settlements`)
- Semua services, API routes, split algorithm
- Unit tests split algorithm (9 tests, Vitest)

---

*End of planning document.*
*Next step: Phase 1 — init project, schema, and API routes.*
