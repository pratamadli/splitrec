# Splitrec PRD (MVP)

## 🎯 Objective

Membangun aplikasi split bill sederhana yang:

- cepat digunakan (<1 menit)
- mudah dipahami
- scalable untuk monetization

---

## 📦 Scope (MVP)

### In Scope

- Create bill
- Add participants
- Add items
- Split calculation
- Summary

### Out of Scope

- OCR receipt
- Payment integration
- Ads UI (hanya preparation)

---

## 👤 User Stories

### 1. Create Bill

As a user,
I want to create a bill,
so I can start splitting expenses.

### 2. Add Participants

As a user,
I want to add friends,
so I can split with them.

### 3. Assign Items

As a user,
I want to assign items,
so cost is fair.

### 4. View Summary

As a user,
I want to see who owes who,
so we can settle easily.

---

## ⚙️ Functional Requirements

### Bill

- User can create bill
- Bill has:
  - title
  - total amount

### Participant

- Add/remove participant
- Name only (MVP)

### Item

- Name
- Price
- Assigned users

### Split Calculation

- Equal split
- Item-based split

### Summary

- Total per user
- Debt graph

---

## 🧠 Non-Functional Requirements

- Fast (<1s calculation)
- Mobile-friendly
- Simple UI
- Scalable backend

---

## 🧩 Future Considerations

### Ads

- Event logging required
- Hook after split

### Reward System

- Feature flag per user

### Payment

- Settlement table needed

---

## ✅ Success Criteria

- User completes split in < 1 min
- ≥80% completion rate
- Positive UX feedback
