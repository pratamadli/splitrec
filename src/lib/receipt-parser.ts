export interface ParsedItem {
  name: string
  price: number
}

export interface ParsedCharges {
  tax: number
  serviceCharge: number
  gratuity: number
  discount: number
}

export interface ParsedReceipt {
  items: ParsedItem[]
  charges: ParsedCharges
}

const CHARGE_KEYWORDS: Record<keyof ParsedCharges, RegExp[]> = {
  tax: [
    /\bpb\.?1\b/i, /\bpajak\b/i, /\btax\b/i, /\bppn\b/i, /\bvat\b/i, /\bppnbm\b/i,
    /\bppm\b/i,                   // OCR variant of ppn
    /\b[ep][pn]n?\s+\d+\s*%/i,   // catches "En 11%", "PN 11%", "PPN 11%" (OCR-tolerant)
  ],
  serviceCharge: [/service\s*charge/i, /\bservice\b/i, /\bservis\b/i, /biaya\s*layanan/i, /biaya\s*pelayanan/i],
  gratuity: [/\bgratuity\b/i, /\bgratifikasi\b/i, /\btips?\b/i],
  discount: [/\bdiskon\b/i, /\bdiscount\b/i, /\bpromo\b/i, /\bvoucher\b/i, /\bpotongan\b/i],
}

// Skip entire line — header / metadata (no useful item data)
const LINE_SKIP_PATTERNS = [
  /^jl\.\s/i,              // street address
  /^jalan\s/i,
  /^no[.:]\s/i,            // "No: TRX..."
  /^nomor[.:]/i,
  /^kasir/i,               // cashier
  /^tanggal/i,             // date
  /^date[.:\s]/i,
  /^meja[.:\s]/i,          // table number
  /^table[.:\s]/i,
  /^waiter[.:\s]/i,
  /\btrx[-\d]/i,           // TRX transaction codes
  /^\*trx/i,               // *TRX... footer codes
  /@[\w.-]+\.\w+/,         // email addresses
  /\b\d{3}[-]\d{4,}/,      // phone numbers like 021-3456789
  /\bnpwp\b/i,
]

// Applied to extracted item name — skip if matches
const NAME_SKIP_PATTERNS = [
  /\btotal\b/i, /\bsubtotal\b/i, /\bsub\s+total\b/i, /\bgrand\s*total\b/i,
  /\bjumlah\b/i, /\bbayar\b/i, /\bkembalian\b/i, /\bkembali\b/i,
  /\bcash\b/i, /\btunai\b/i, /\bkartu\b/i, /\bdebit\b/i, /\bkredit\b/i,
  /\bcredit\b/i, /\bchange\b/i, /terima\s*kasih/i, /thank\s*you/i,
  /\bnota\b/i, /\bkasir\b/i, /\bmeja\b/i, /\btable\b/i,
  /\btelp\b/i, /\bwifi\b/i, /\bnpwp\b/i, /\balamat\b/i,
  /-\s*$/,   // trailing dash — address fragment like "Jakarta Pusat -"
]

// Qty-line pattern: "2x 28.000", "1 × 42.000", etc.
const QTY_LINE_RE = /^\d+\s*[x×]\s*[\d.,]/i

function extractLastPrice(line: string): number | null {
  const cleaned = line.replace(/\b(rp\.?\s*|idr\s*)/gi, '')
  const matches = [...cleaned.matchAll(/\b\d{1,3}(?:[.,]\d{3})*\b|\b\d+\b/g)]
  if (matches.length === 0) return null
  const raw = matches[matches.length - 1][0].replace(/[.,]/g, '')
  const num = parseInt(raw, 10)
  return isNaN(num) || num < 100 || num > 999_999_999 ? null : num
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function parseReceipt(rawText: string): ParsedReceipt {
  const result: ParsedReceipt = {
    items: [],
    charges: { tax: 0, serviceCharge: 0, gratuity: 0, discount: 0 },
  }

  let pendingName: string | null = null

  for (const line of rawText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue

    // Clear pendingName on separator lines (dashes, equals, etc.)
    if (/^[-=*_~]{3,}$/.test(trimmed)) {
      pendingName = null
      continue
    }

    // Skip header / metadata lines entirely
    if (LINE_SKIP_PATTERNS.some((p) => p.test(trimmed))) {
      pendingName = null
      continue
    }

    const price = extractLastPrice(trimmed)

    // No price on this line — candidate item name for two-line format
    if (!price) {
      if (
        /[a-zA-Z]/.test(trimmed) &&
        !NAME_SKIP_PATTERNS.some((p) => p.test(trimmed))
      ) {
        pendingName = trimmed
      }
      continue
    }

    // Has a price — determine the name
    let nameRaw: string

    if (QTY_LINE_RE.test(trimmed) && pendingName) {
      // Two-line format: "Item Name\n2x UnitPrice  Total"
      nameRaw = pendingName
      pendingName = null
    } else {
      pendingName = null
      const lastNumMatch = trimmed.match(/\b\d{1,3}(?:[.,]\d{3})*\b\s*$|\b\d+\b\s*$/)
      if (!lastNumMatch) continue
      const candidate = trimmed
        .slice(0, trimmed.lastIndexOf(lastNumMatch[0]))
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*\d+\s*[x×]\s*$/i, '')
        .replace(/\s*\d+\s*pcs?\s*$/i, '')
        .trim()
      if (!candidate || candidate.length < 2) continue
      nameRaw = candidate
    }

    if (!nameRaw || nameRaw.length < 2) continue
    if (NAME_SKIP_PATTERNS.some((p) => p.test(nameRaw))) continue

    let isCharge = false
    for (const [key, patterns] of Object.entries(CHARGE_KEYWORDS)) {
      if (patterns.some((p) => p.test(nameRaw))) {
        result.charges[key as keyof ParsedCharges] = price
        isCharge = true
        break
      }
    }
    if (isCharge) continue

    result.items.push({ name: titleCase(nameRaw), price })
  }

  return result
}
