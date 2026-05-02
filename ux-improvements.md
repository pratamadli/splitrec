# Splitrec — UX Improvements (Feedback v1.3.1)

> **Dibuat:** 2026-05-01
> **Versi saat ini:** v1.3.1
> **Tujuan dokumen:** Panduan implementasi perbaikan UX berdasarkan feedback pengguna pertama. Dokumen ini berdiri sendiri — agent cukup baca ini untuk mengerjakan semua perubahan.

---

## Konteks feedback

| Pertanyaan | Jawaban | Skor |
|---|---|---|
| Seberapa mudah paham cara pakai Splitrec pertama kali? | Ngerti, tapi mesti agak ngulik | ~3/5 |
| Seberapa cepat alur buat bill sampai share link? | Ribet, agak lama | ~2/5 |
| Seberapa mudah pakai Splitrec secara keseluruhan? | — | 3/5 |
| Seberapa jelas alur peserta → item → split mode → settlement? | — | 3/5 |
| Kepuasan fitur: Tambah peserta | — | 2/5 🔴 |
| Kepuasan fitur: Tambah item | — | 2/5 🔴 |
| Kepuasan fitur: Pilih split mode | — | 5/5 ✅ |
| Kepuasan fitur: Lihat hasil settlement | — | 3/5 |
| NPS (0–10) | — | 5/10 🔴 |

**Kesimpulan:** NPS 5/10 = "Passive". Target 8/10 sebelum lanjut ke Phase 4 (monetisasi). Dua masalah paling kritis adalah flow tambah peserta dan tambah item. Split mode sudah sempurna — jangan diubah.

---

## Perubahan yang harus dikerjakan

### 1. `AddItemForm` — default semua consumer tercentang

**File:** `src/components/molecules/AddItemForm/AddItemForm.tsx`

**Root cause:** User harus manually pilih semua orang satu per satu. Untuk kasus paling umum (makan bareng, semua ikut), ini membuang banyak tap.

**Perubahan:**

```ts
// SEBELUM — konsumer kosong, user harus pilih manual
const [selectedIds, setSelectedIds] = useState<string[]>([])

// SESUDAH — semua peserta tercentang by default
const [selectedIds, setSelectedIds] = useState<string[]>(
  participants.map(p => p.id)
)
```

- Default: semua `participant.id` masuk ke initial state `selectedIds`
- User tinggal **uncheck** siapa yang tidak ikut (bukan check siapa yang ikut)
- Jika `participants` berubah (peserta baru ditambah saat form terbuka), re-sync default via `useEffect`

**Qty per consumer — collapsed by default:**

```tsx
// Tambah state toggle
const [showQty, setShowQty] = useState(false)

// Di bawah ParticipantSelector, tampilkan toggle
{selectedIds.length > 0 && (
  <button
    type="button"
    onClick={() => setShowQty(v => !v)}
    className="text-xs text-muted-foreground underline mt-1"
  >
    {showQty ? 'Sembunyikan qty' : 'Atur qty per orang (opsional)'}
  </button>
)}

// Qty inputs hanya tampil jika showQty === true
{showQty && selectedIds.map(id => (
  <QtyInput key={id} participantId={id} ... />
))}
```

**Submit dengan Enter:**

- Field terakhir di form (biasanya harga atau qty) pasang `onKeyDown`: jika `key === 'Enter'` dan form valid → panggil `handleSubmit`
- Tidak perlu klik tombol "Tambah Item"

**Setelah submit — form reset, bukan close:**

```ts
// SEBELUM
onSubmit(data)
onCancel() // menutup form

// SESUDAH
onSubmit(data)
resetForm()        // clear semua field
setSelectedIds(participants.map(p => p.id)) // reset ke semua tercentang
// JANGAN panggil onCancel() — biarkan form tetap terbuka
```

Tombol "Batal" tetap ada untuk menutup form secara eksplisit.

**Placeholder yang lebih jelas:**

```tsx
<Input placeholder="Nama menu (misal: Nasi Goreng)" ... />
```

---

### 2. `AddParticipantForm` — submit Enter, chip optimistic, hint

**File:** `src/components/molecules/AddParticipantForm/AddParticipantForm.tsx`
**File:** `src/components/organisms/ParticipantList/ParticipantList.tsx`

**Root cause:** Form terasa terputus dari konteks. User harus klik tombol "Tambah" setiap kali. Tidak ada feedback yang cukup.

**Submit dengan Enter:**

```tsx
<Input
  placeholder="Nama teman (misal: Adli, Farah...)"
  value={name}
  onChange={e => setName(e.target.value)}
  onKeyDown={e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }}
/>
```

**Chip optimistic — tampil sebelum API response:**

Di `ParticipantList`, pakai pola optimistic update yang sudah ada (`useOptimistic` atau SWR mutate):

```ts
// Saat user submit nama:
// 1. Langsung tambah chip sementara dengan id='temp-{timestamp}'
// 2. Hit API
// 3. Jika berhasil: replace temp chip dengan data asli dari server
// 4. Jika gagal: hapus temp chip + tampilkan toast error
const tempParticipant = { id: `temp-${Date.now()}`, name }
mutate([...participants, tempParticipant], false) // optimistic
const result = await addParticipant(billId, name)
mutate() // revalidate dengan data asli
```

**Hint di bawah input:**

```tsx
<p className="text-xs text-muted-foreground mt-1">
  Tambah minimal 2 orang untuk mulai split
</p>
```

Hint ini hanya tampil jika `participants.length < 2`. Sembunyikan jika sudah ≥ 2 orang.

**Warning jika "Hitung Pembagian" diklik dengan < 2 peserta:**

Di `SettlementResult` atau tombol "Hitung Pembagian":

```tsx
if (participants.length < 2) {
  // Jangan hit /calculate
  // Scroll ke section Peserta
  // Tampilkan inline warning di bawah daftar peserta:
  // "Tambah minimal 2 peserta untuk menghitung pembagian"
  return
}
```

---

### 3. Step indicator di halaman edit bill

**File:** `src/components/templates/BillEditLayout/BillEditLayout.tsx`
**File:** `src/components/organisms/BillHeader/BillHeader.tsx` (atau buat komponen baru `StepIndicator`)

**Root cause:** User tidak tahu ada 3 langkah yang harus dilakukan. Alur tidak terbaca sendirinya.

**Komponen `StepIndicator`:**

```tsx
// src/components/molecules/StepIndicator/StepIndicator.tsx

interface Step {
  number: number
  label: string
  status: 'done' | 'active' | 'pending'
}

const steps: Step[] = [
  { number: 1, label: 'Peserta', status: ... },
  { number: 2, label: 'Transaksi', status: ... },
  { number: 3, label: 'Hasil', status: ... },
]
```

Status logika:
- Step 1 "Peserta": `done` jika `participants.length >= 2`, `active` jika `< 2`
- Step 2 "Transaksi": `done` jika ada minimal 1 purchase dengan minimal 1 item, `active` jika peserta sudah ≥ 2 tapi belum ada transaksi, `pending` jika peserta belum cukup
- Step 3 "Hasil": `active` jika step 1 dan 2 done

Tampilan:
```tsx
// Step done: lingkaran brand-blue penuh + centang putih + label brand-blue
// Step active: lingkaran brand-blue outline + angka brand-blue + label brand-blue
// Step pending: lingkaran abu-abu + angka abu-abu + label muted
// Connector line: brand-blue jika langkah sebelumnya done, abu-abu jika pending
```

Letakkan `StepIndicator` di `BillEditLayout` tepat di bawah `BillHeader`, di atas section Peserta.

**Section dimmed jika belum bisa diakses:**

```tsx
// Section Transaksi dimmed jika participants.length < 2
<div className={participants.length < 2 ? 'opacity-40 pointer-events-none' : ''}>
  <PurchaseList ... />
</div>
```

---

### 4. Polish halaman hasil settlement

**File:** `app/bills/[id]/result/page.tsx`
**File:** `src/components/organisms/SettlementResult/SettlementResult.tsx`

**Root cause:** Tidak ada rasa "selesai" yang jelas. Nominal transfer tidak menonjol. Share button tidak prominent.

**Summary banner di atas settlement list:**

```tsx
// Tampilkan hanya jika debts.length > 0
<div className="rounded-lg bg-brand-green/10 border border-brand-green/30 px-4 py-3 mb-4 text-center">
  <p className="text-sm text-brand-green font-medium">
    Tagihan selesai dihitung!
  </p>
  <p className="text-xs text-muted-foreground mt-0.5">
    {participants.length} orang · {debts.length} transfer
  </p>
</div>

// Jika semua sudah lunas (debts.length === 0):
<div className="rounded-lg bg-brand-green/10 border border-brand-green/30 px-4 py-3 mb-4 text-center">
  <p className="text-sm text-brand-green font-medium">Semua sudah lunas! 🎉</p>
</div>
```

**Nominal transfer lebih besar di `SettlementRow`:**

```tsx
// SEBELUM — nominal kecil di Badge
<Badge variant="success">{formatIDR(amount)}</Badge>

// SESUDAH — nominal besar dan menonjol
<span className="text-lg font-semibold text-brand-green ml-auto">
  {formatIDR(amount)}
</span>
```

**Tombol Salin per baris settlement:**

```tsx
// Di setiap SettlementRow, tambah tombol copy di ujung kanan
<button
  onClick={() => {
    const text = `${from.name} bayar ${to.name} ${formatIDR(amount)}`
    navigator.clipboard.writeText(text)
    // Tampilkan feedback singkat "Disalin!"
  }}
  className="text-xs text-muted-foreground hover:text-foreground ml-2"
  title="Salin untuk kirim ke WA"
>
  Salin
</button>
```

**Share button full-width di bawah settlement list:**

```tsx
// Di result page, setelah SettlementResult
<div className="mt-6 space-y-3">
  <ShareButton
    shareToken={bill.shareToken}
    className="w-full bg-brand-green text-white hover:bg-brand-green/90"
    label="Bagikan ke teman"
  />
  {isOwner && (
    <Button variant="outline" className="w-full" onClick={() => router.back()}>
      Edit tagihan
    </Button>
  )}
</div>
```

---

### 5. Guided empty state untuk bill baru

**File:** `src/components/organisms/ParticipantList/ParticipantList.tsx`
**File:** `src/components/organisms/PurchaseList/PurchaseList.tsx`

**Root cause:** Empty state saat ini hanya ilustrasi + teks pasif. User tidak tahu harus mulai dari mana.

**Empty state `ParticipantList` (bill baru, 0 peserta):**

```tsx
// Ganti EmptyState generik dengan guided card
<div className="rounded-lg border border-dashed border-border p-6 text-center space-y-4">
  <p className="text-sm font-medium text-foreground">Mulai dengan tambah peserta</p>
  <p className="text-xs text-muted-foreground">
    Siapa saja yang ikut? Tambah nama mereka di bawah.
  </p>
  {/* Form tambah peserta langsung tampil di sini, tidak perlu tap tombol lagi */}
  <AddParticipantForm onSubmit={handleAdd} isLoading={isLoading} autoFocus />
</div>
```

**Empty state `PurchaseList` (peserta sudah ada, belum ada transaksi):**

```tsx
<div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
  <p className="text-sm font-medium text-foreground">Belum ada transaksi</p>
  <p className="text-xs text-muted-foreground">
    Tambah transaksi — siapa yang bayar dan item apa saja.
  </p>
  <Button
    size="sm"
    onClick={openAddPurchaseSheet}
    className="bg-brand-blue text-white"
  >
    Tambah transaksi pertama
  </Button>
</div>
```

---

## Urutan pengerjaan

Kerjakan dalam urutan ini — P1 dulu sebelum P2/P3 karena dampaknya paling besar:

```
1. AddItemForm — default semua tercentang + qty collapsed + Enter submit + form reset
2. AddParticipantForm — Enter submit + optimistic chip + hint + warning < 2 peserta
3. StepIndicator — komponen baru + pasang di BillEditLayout + section dimmed
4. SettlementResult — summary banner + nominal besar + tombol Salin + share full-width
5. Empty state — guided card di ParticipantList + PurchaseList
```

---

## File yang terpengaruh

| File | Perubahan |
|---|---|
| `src/components/molecules/AddItemForm/AddItemForm.tsx` | Default consumer, qty toggle, Enter submit, form reset |
| `src/components/molecules/AddParticipantForm/AddParticipantForm.tsx` | Enter submit, placeholder, hint |
| `src/components/organisms/ParticipantList/ParticipantList.tsx` | Optimistic chip, warning < 2, guided empty state |
| `src/components/organisms/PurchaseList/PurchaseList.tsx` | Guided empty state |
| `src/components/organisms/SettlementResult/SettlementResult.tsx` | Summary banner, nominal besar, tombol Salin |
| `src/components/molecules/SettlementRow/SettlementRow.tsx` | Nominal styling + tombol Salin |
| `src/components/molecules/StepIndicator/StepIndicator.tsx` | **File baru** |
| `src/components/templates/BillEditLayout/BillEditLayout.tsx` | Tambah slot StepIndicator, section dimmed logic |
| `app/bills/[id]/result/page.tsx` | Share button full-width, tombol Edit |

---

## Hal yang TIDAK boleh diubah

- **Split mode toggle** — sudah 5/5, jangan disentuh
- **Algoritma kalkulasi** — sudah benar dan terverifikasi
- **Charges panel** — sudah berfungsi, bukan bagian dari keluhan
- **Share page** (`/s/[token]`) — read-only view tidak dikeluhkan

---

## Definisi selesai

Phase 3.5 dianggap selesai jika:

1. Semua 5 perubahan di atas sudah diimplementasi
2. `pnpm build` berhasil, 0 TypeScript error
3. Manual test: buat bill baru → tambah 2 peserta (Enter) → tambah 3 item (Enter, semua tercentang by default) → lihat step indicator bergerak → lihat hasil → klik salin di satu baris → klik share
4. Waktu dari buka app sampai klik share ≤ 60 detik
5. Re-test dengan user yang sama → target NPS ≥ 8/10
