# Splitrec Product Guide

## 🧾 Overview

**Splitrec** adalah aplikasi untuk membantu pengguna membagi tagihan (split bill) menggunakan receipt (struk).

**Tagline:**

> Split receipts, not friendships.

---

## 🎯 Problem

- Split bill ribet & manual
- Perhitungan tidak akurat
- Tidak transparan (siapa bayar apa)
- Menyebabkan awkward moment

---

## 💡 Solution

Splitrec membantu user:

- Membagi bill dengan cepat
- Assign item ke masing-masing user
- Melihat summary pembayaran secara jelas

---

## 👤 Target User

- Anak muda (18–35)
- Pekerja kantoran
- Mahasiswa
- Group dining / traveling

---

## 🚀 MVP Features

### 1. Create Bill

- Input total bill / manual items

### 2. Add Participants

- Tambah user ke session

### 3. Split Logic

- Equal split
- Custom split (per item)

### 4. Summary

- Total per user
- Who owes who

---

## 🧠 UX Principles

- Simple & fast (< 1 min)
- Minimal input
- Clear visualization

---

## 📱 User Flow

1. Create bill
2. Add participants
3. Add items / total
4. Assign split
5. View summary

---

## 💰 Monetization Strategy (Future-Ready)

### Phase 1 (MVP)

- ❌ No monetization (focus UX & growth)
- ✅ Architecture prepared for ads & payments

### Phase 2

- Rewarded Ads
  - Unlock receipt scan
  - Unlock premium split

### Phase 3

- Payment Integration (main revenue)
- Premium subscription

---

## 🏗️ Monetization-Ready Architecture

System harus sudah siap untuk:

### Ads Integration (Future)

- Event tracking:
  - bill_created
  - split_completed
- Ad placement hooks:
  - after_split_screen
- Reward system:
  - unlock_feature flag

### Payment Integration (Future)

- Settlement entity
- Payment status tracking

---

## 📊 Key Metrics

- Time to split
- Completion rate
- Daily active users
- Bills created

---

## 🔥 Vision

Menjadi aplikasi split bill paling simple & powerful dengan:

> fast, fair, frictionless experience
