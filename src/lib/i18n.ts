export type Lang = 'id' | 'en'

export const translations = {
  id: {
    // Common
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.add': 'Tambah',
    'common.edit': 'Ubah',
    'common.delete': 'Hapus',
    'common.saving': 'Menyimpan...',
    'common.copied': 'Disalin!',
    'common.copy': 'Salin',
    'common.bill_not_found': 'Tagihan tidak ditemukan.',
    'common.create_new_bill': 'Buat Tagihan Baru',

    // Home
    'home.no_signup': 'Tidak perlu daftar. Bagikan link ke teman setelah selesai.',
    'home.version': 'Versi',

    // Bill pages
    'bill.results_title': 'Hasil Pembagian',
    'bill.add_min_participants': 'Tambah minimal 2 peserta untuk melanjutkan',
    'bill.next_to_transactions': 'Lanjut ke Transaksi',
    'bill.calculate_split': 'Hitung Pembagian',
    'bill.back_to_participants': '← Peserta',

    // Errors / toasts
    'error.add_participant': 'Gagal menambah peserta',
    'error.delete_participant': 'Gagal menghapus peserta',
    'error.calculate': 'Gagal menghitung. Coba lagi.',
    'error.add_purchase': 'Gagal menambah transaksi',
    'error.update_purchase': 'Gagal mengupdate transaksi',
    'error.delete_purchase': 'Gagal menghapus transaksi',
    'error.add_item': 'Gagal menambah item',
    'error.update_item': 'Gagal mengupdate item',
    'error.delete_item': 'Gagal menghapus item',

    // SettlementResult
    'result.calculated': 'Tagihan selesai dihitung!',
    'result.people_transfers': '{people} orang · {transfers} transfer',
    'result.all_settled': 'Semua sudah lunas! 🎉',
    'result.bank_info': 'Info Rekening Penerima',
    'result.bank_name_placeholder': 'Nama bank (cth. BCA, Mandiri)',
    'result.account_placeholder': 'Nomor rekening',
    'result.not_filled': 'Belum diisi',
    'result.add_bank': '+ Isi',

    // SettlementRow
    'settlement.settled_to': 'lunas ke',
    'settlement.pay_to': 'bayar ke',
    'settlement.receives': 'menerima',
    'settlement.settled': 'lunas',
    'settlement.mark_paid': 'Tandai Lunas',
    'settlement.paid': '✓ Lunas',
    'settlement.no_transactions': 'Tidak ada transaksi',
    'settlement.equal_split': 'Bagi rata',
    'settlement.proportional_charges': 'Pajak & biaya lainnya (proporsional)',
    'settlement.copy_text': '{name} bayar {to} {amount}',

    // Participants
    'participants.title': 'Peserta',
    'participants.confirm_delete_title': 'Hapus peserta?',
    'participants.confirm_delete_desc': '{name} akan dihapus dari tagihan ini.',
    'participants.add_min': 'Tambah minimal 2 orang untuk mulai split bill',
    'participants.name_placeholder': 'Nama Peserta',
    'participants.name_required': 'Nama tidak boleh kosong',

    // Transactions / purchases
    'purchases.title': 'Transaksi',
    'purchases.empty_owner': 'Belum ada transaksi',
    'purchases.empty_hint': 'Tambah transaksi — siapa yang bayar dan item apa saja.',
    'purchases.empty_viewer': 'Belum ada transaksi yang ditambahkan',
    'purchases.choose_type': 'Pilih jenis pembagian',
    'purchases.equal_split': 'Bagi Rata',
    'purchases.equal_split_desc': 'Total dibagi semua peserta',
    'purchases.per_item': 'Per Item',
    'purchases.per_item_desc': 'Tentukan siapa pakai apa',
    'purchases.per_item_hint': '🧾 Per Item · Tambah item setelah ini',
    'purchases.transaction_name': 'Nama transaksi',
    'purchases.transaction_placeholder': 'cth. Makan siang, Bensin',
    'purchases.total': 'Total',
    'purchases.paid_by': 'Dibayar oleh',
    'purchases.add_and_enter': 'Tambah & Input Item',
    'purchases.add_transaction': '+ Tambah Transaksi',
    'purchases.confirm_delete_title': 'Hapus transaksi?',
    'purchases.confirm_delete_desc': '"{title}" dan semua itemnya akan dihapus.',

    // Items
    'items.add_item': '+ Tambah Item',
    'items.item_name': 'Nama item',
    'items.item_name_placeholder': 'Nama menu (misal: Nasi Goreng)',
    'items.total_price': 'Harga total',
    'items.discount': 'Diskon item (opsional)',
    'items.note': 'Catatan (opsional)',
    'items.note_placeholder': 'cth. pedas, tanpa bawang',
    'items.qty_per_person': 'Qty per orang',
    'items.all_consumers': 'Semua pemesan',
    'items.discount_label': 'diskon',

    // Charges
    'charges.additional': 'Biaya Tambahan',
    'charges.saving': 'Menyimpan...',
    'charges.tax': 'Pajak',
    'charges.service_charge': 'Service Charge',
    'charges.gratuity': 'Gratuity',
    'charges.others': 'Others (auto)',
    'charges.discount': 'Diskon',
    'charges.unbalanced': 'Transaksi belum balance. Kurangi nilai item/biaya atau tambah total.',

    // Purchase header
    'purchase.paid_by': 'Dibayar',

    // Split mode
    'split.per_item': 'Per item',
    'split.equal': 'Rata',

    // Step indicator
    'step.participants': 'Peserta',
    'step.transactions': 'Transaksi',
    'step.results': 'Hasil',

    // Share button
    'share.copy_success': '✓ Disalin!',
    'share.share_bill': '🔗 Bagikan Tagihan',
    'share.link_valid': 'Link berlaku hingga',

    // Balance row
    'balance.paid': 'Bayar',
    'balance.consumed': 'Konsumsi',

    // Bill summary
    'summary.total': 'Total',
    'summary.participants': 'Peserta',
    'summary.transactions': 'Transaksi',

    // Participant selector
    'selector.label': 'Pilih konsumen',

    // Not found
    'notfound.title': 'Halaman Tidak Ditemukan',
    'notfound.desc': 'Link yang kamu akses tidak valid atau sudah kadaluarsa.',
    'notfound.back': 'Kembali ke Beranda',
  },
  en: {
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.saving': 'Saving...',
    'common.copied': 'Copied!',
    'common.copy': 'Copy',
    'common.bill_not_found': 'Bill not found.',
    'common.create_new_bill': 'Create New Bill',

    // Home
    'home.no_signup': 'No sign-up required. Share the link when done.',
    'home.version': 'Version',

    // Bill pages
    'bill.results_title': 'Split Results',
    'bill.add_min_participants': 'Add at least 2 participants to continue',
    'bill.next_to_transactions': 'Continue to Transactions',
    'bill.calculate_split': 'Calculate Split',
    'bill.back_to_participants': '← Participants',

    // Errors / toasts
    'error.add_participant': 'Failed to add participant',
    'error.delete_participant': 'Failed to remove participant',
    'error.calculate': 'Calculation failed. Try again.',
    'error.add_purchase': 'Failed to add transaction',
    'error.update_purchase': 'Failed to update transaction',
    'error.delete_purchase': 'Failed to delete transaction',
    'error.add_item': 'Failed to add item',
    'error.update_item': 'Failed to update item',
    'error.delete_item': 'Failed to delete item',

    // SettlementResult
    'result.calculated': 'Bill calculated!',
    'result.people_transfers': '{people} people · {transfers} transfers',
    'result.all_settled': 'All settled! 🎉',
    'result.bank_info': 'Recipient Account Info',
    'result.bank_name_placeholder': 'Bank name (e.g. BCA, Mandiri)',
    'result.account_placeholder': 'Account number',
    'result.not_filled': 'Not filled',
    'result.add_bank': '+ Add',

    // SettlementRow
    'settlement.settled_to': 'settled to',
    'settlement.pay_to': 'pay to',
    'settlement.receives': 'receives',
    'settlement.settled': 'settled',
    'settlement.mark_paid': 'Mark as Paid',
    'settlement.paid': '✓ Paid',
    'settlement.no_transactions': 'No transactions',
    'settlement.equal_split': 'Split equally',
    'settlement.proportional_charges': 'Tax & other fees (proportional)',
    'settlement.copy_text': '{name} pays {to} {amount}',

    // Participants
    'participants.title': 'Participants',
    'participants.confirm_delete_title': 'Remove participant?',
    'participants.confirm_delete_desc': '{name} will be removed from this bill.',
    'participants.add_min': 'Add at least 2 people to start splitting',
    'participants.name_placeholder': 'Participant Name',
    'participants.name_required': 'Name cannot be empty',

    // Transactions / purchases
    'purchases.title': 'Transactions',
    'purchases.empty_owner': 'No transactions yet',
    'purchases.empty_hint': 'Add a transaction — who paid and what items.',
    'purchases.empty_viewer': 'No transactions have been added',
    'purchases.choose_type': 'Choose split type',
    'purchases.equal_split': 'Equal Split',
    'purchases.equal_split_desc': 'Total divided among all participants',
    'purchases.per_item': 'Per Item',
    'purchases.per_item_desc': 'Define who uses what',
    'purchases.per_item_hint': '🧾 Per Item · Add items after this',
    'purchases.transaction_name': 'Transaction name',
    'purchases.transaction_placeholder': 'e.g. Lunch, Gas',
    'purchases.total': 'Total',
    'purchases.paid_by': 'Paid by',
    'purchases.add_and_enter': 'Add & Enter Items',
    'purchases.add_transaction': '+ Add Transaction',
    'purchases.confirm_delete_title': 'Delete transaction?',
    'purchases.confirm_delete_desc': '"{title}" and all its items will be deleted.',

    // Items
    'items.add_item': '+ Add Item',
    'items.item_name': 'Item name',
    'items.item_name_placeholder': 'Item name (e.g. Fried Rice)',
    'items.total_price': 'Total price',
    'items.discount': 'Item discount (optional)',
    'items.note': 'Note (optional)',
    'items.note_placeholder': 'e.g. spicy, no onions',
    'items.qty_per_person': 'Qty per person',
    'items.all_consumers': 'All consumers',
    'items.discount_label': 'discount',

    // Charges
    'charges.additional': 'Additional Charges',
    'charges.saving': 'Saving...',
    'charges.tax': 'Tax',
    'charges.service_charge': 'Service Charge',
    'charges.gratuity': 'Gratuity',
    'charges.others': 'Others (auto)',
    'charges.discount': 'Discount',
    'charges.unbalanced': 'Transaction not balanced. Reduce item/charge values or increase total.',

    // Purchase header
    'purchase.paid_by': 'Paid by',

    // Split mode
    'split.per_item': 'Per item',
    'split.equal': 'Equal',

    // Step indicator
    'step.participants': 'Participants',
    'step.transactions': 'Transactions',
    'step.results': 'Results',

    // Share button
    'share.copy_success': '✓ Copied!',
    'share.share_bill': '🔗 Share Bill',
    'share.link_valid': 'Link valid until',

    // Balance row
    'balance.paid': 'Paid',
    'balance.consumed': 'Consumed',

    // Bill summary
    'summary.total': 'Total',
    'summary.participants': 'Participants',
    'summary.transactions': 'Transactions',

    // Participant selector
    'selector.label': 'Select consumers',

    // Not found
    'notfound.title': 'Page Not Found',
    'notfound.desc': 'The link you accessed is invalid or has expired.',
    'notfound.back': 'Back to Home',
  },
} as const

export type TranslationKey = keyof typeof translations.id

export function createT(lang: Lang) {
  return function t(key: TranslationKey, vars?: Record<string, string>): string {
    let str = translations[lang][key] as string
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v)
      }
    }
    return str
  }
}
