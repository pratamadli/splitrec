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
  tax: [/\bpb1\b/i, /\bpajak\b/i, /\btax\b/i, /\bppn\b/i, /\bvat\b/i, /\bppnbm\b/i],
  serviceCharge: [/service\s*charge/i, /\bservice\b/i, /\bservis\b/i, /biaya\s*layanan/i, /biaya\s*pelayanan/i],
  gratuity: [/\bgratuity\b/i, /\bgratifikasi\b/i, /\btips?\b/i],
  discount: [/\bdiskon\b/i, /\bdiscount\b/i, /\bpromo\b/i, /\bvoucher\b/i, /\bpotongan\b/i],
}

const SKIP_PATTERNS = [
  /\btotal\b/i, /\bsubtotal\b/i, /\bsub\s+total\b/i, /\bgrand\s*total\b/i,
  /\bjumlah\b/i, /\bbayar\b/i, /\bkembalian\b/i, /\bkembali\b/i,
  /\bcash\b/i, /\btunai\b/i, /\bkartu\b/i, /\bdebit\b/i, /\bkredit\b/i,
  /\bcredit\b/i, /\bchange\b/i, /terima\s*kasih/i, /thank\s*you/i,
  /\bnota\b/i, /\bkasir\b/i, /\bmeja\b/i, /\btable\b/i,
  /\btelp\b/i, /\bwifi\b/i, /\bnpwp\b/i, /\balamat\b/i,
]

// Extracts the last price-like number from a line.
// In IDR context dots and commas are always thousands separators.
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

  for (const line of rawText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 4) continue

    const price = extractLastPrice(trimmed)
    if (!price) continue

    // Name = everything before the last number group
    const lastNumMatch = trimmed.match(/\b\d{1,3}(?:[.,]\d{3})*\b\s*$|\b\d+\b\s*$/)
    if (!lastNumMatch) continue
    const nameRaw = trimmed.slice(0, trimmed.lastIndexOf(lastNumMatch[0])).trim()
    const name = nameRaw
      .replace(/\s+/g, ' ')
      .replace(/\s*\d+\s*[x×]\s*$/i, '')  // strip trailing qty like "2x"
      .replace(/\s*\d+\s*pcs?\s*$/i, '')   // strip "2 pcs"
      .trim()

    if (!name || name.length < 2) continue
    if (SKIP_PATTERNS.some((p) => p.test(name))) continue

    let isCharge = false
    for (const [key, patterns] of Object.entries(CHARGE_KEYWORDS)) {
      if (patterns.some((p) => p.test(name))) {
        result.charges[key as keyof ParsedCharges] = price
        isCharge = true
        break
      }
    }
    if (isCharge) continue

    result.items.push({ name: titleCase(name), price })
  }

  return result
}
