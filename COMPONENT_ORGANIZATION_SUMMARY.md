# Component Organization Summary

## ✅ Recovery Page (Functional Components)
**Location:** `src/features/recovery/components/`

### Components that belong here:
- **`recovery-work-queue.tsx`** - Manage missed payments, retry, enroll in flows
- **`recovery-flows.tsx`** - Create, edit, and manage recovery flows  
- **`create-flow-modal.tsx`** - Modal for creating new recovery flows

### Purpose:
- **Functional operations** for payment recovery
- **Flow management** and configuration
- **Action-oriented** UI for processing payments

---

## 📊 Insights Page (Analytics Components)  
**Location:** `src/features/insights/components/`

### Components that should remain here:
- **`recovery-kpis.tsx`** - KPI cards showing recovery metrics
- **`recovery-timeline.tsx`** - Timeline chart of recovery performance  
- **`recovery-by-segment.tsx`** - Recovery analytics by customer segment
- **`recovery-reasons.tsx`** - Analysis of payment failure reasons

### Purpose:
- **Analytics and insights** about recovery performance
- **Reporting and visualization** of recovery data
- **Data-driven insights** for strategy decisions

---

## 🔗 Navigation Flow

### Recovery Page Flow:
1. **Recovery Page** → Functional tools (work queue, flows)
2. **"View Analytics" button** → Links to `insights?tab=recovery`
3. **Insights Page** → Recovery tab shows analytics components

### User Journey:
- **Recovery page** = "I want to DO something with recovery"
- **Insights page** = "I want to SEE how recovery is performing"

---

## 📁 Current File Structure

```
src/features/recovery/
├── api/
│   └── recovery.ts              # Recovery API hooks
├── components/
│   ├── index.ts
│   ├── create-flow-modal.tsx    # ✅ Functional
│   ├── recovery-work-queue.tsx  # ✅ Functional  
│   └── recovery-flows.tsx       # ✅ Functional
└── types/
    └── recovery.ts              # Recovery types

src/features/insights/components/
├── recovery-kpis.tsx           # 📊 Analytics
├── recovery-timeline.tsx       # 📊 Analytics
├── recovery-by-segment.tsx     # 📊 Analytics
└── recovery-reasons.tsx        # 📊 Analytics
```

---

## ✨ Benefits of This Organization

### 1. **Clear Separation of Concerns**
- Recovery = Action & Management
- Insights = Analytics & Reporting

### 2. **Better User Experience**  
- Recovery page focuses on getting work done
- Analytics are grouped with other insights

### 3. **Maintainable Codebase**
- Components are logically grouped by purpose
- Easier to find and modify functionality

### 4. **Scalable Architecture**
- New recovery features go in recovery folder
- New analytics go in insights folder
- Clear boundaries prevent confusion

This organization now correctly reflects the functional vs analytical nature of the components!
