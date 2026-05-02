# Rumus Perhitungan Billing Restoran (PB1)

Dokumen ini menjelaskan urutan perhitungan tagihan restoran yang melibatkan subtotal, biaya tambahan, diskon, biaya layanan, pajak, dan tip.

## 1. Komponen Perhitungan

| Komponen | Deskripsi |
| :--- | :--- |
| **Subtotal** | Total harga makanan dan minuman sesuai menu. |
| **Other** | Biaya tambahan yang setara subtotal (misal: *extra topping*, *corkage fee*). |
| **Diskon** | Potongan harga (biasanya dalam persentase %). |
| **Service Charge** | Biaya layanan (biasanya 5% - 10%). |
| **PB1 / PBJT** | Pajak Restoran (maksimal 10%). |
| **Tip** | Pemberian sukarela untuk staf (tidak kena pajak). |

---

## 2. Rumus Bertahap

Lakukan perhitungan sesuai urutan di bawah ini untuk menghindari kesalahan nominal:

1.  **Total Dasar (Gross Subtotal)**
    > `Total Dasar = Subtotal + Other`
2.  **Net Subtotal (Setelah Diskon)**
    > `Potongan Diskon = Total Dasar × % Diskon`  
    > `Net Subtotal = Total Dasar - Potongan Diskon`
3.  **Service Charge**
    > `Service Charge = Net Subtotal × % Service Charge`
4.  **Dasar Pengenaan Pajak (DPP)**
    > `DPP = Net Subtotal + Service Charge`
5.  **Pajak PB1 (Pajak Restoran)**
    > `PB1 = DPP × 10%` (atau tarif daerah yang berlaku)
6.  **Total Akhir (Grand Total)**
    > `Grand Total = DPP + PB1 + Tip`

---

## 3. Contoh Simulasi

**Data Pesanan:**
- Subtotal: Rp100.000
- Other: Rp50.000
- Diskon: 10%
- Service Charge: 5%
- Pajak PB1: 10%
- Tip: Rp20.000

**Perhitungan:**
1. **Total Dasar:** $100.000 + 50.000 = 150.000$
2. **Diskon:** $150.000 \times 10\% = 15.000$
3. **Net Subtotal:** $150.000 - 15.000 = 135.000$
4. **Service Charge:** $135.000 \times 5\% = 6.750$
5. **DPP:** $135.000 + 6.750 = 141.750$
6. **PB1:** $141.750 \times 10\% = 14.175$
7. **Grand Total:** $141.750 + 14.175 + 20.000 = \mathbf{175.925}$

---

## 4. Catatan Penting
- **Urutan Service Charge:** Biaya layanan selalu dihitung sebelum pajak karena biaya layanan adalah bagian dari objek pajak.
- **Tip:** Tip dimasukkan setelah semua pajak dihitung agar konsumen tidak membayar pajak atas uang tip yang mereka berikan.
