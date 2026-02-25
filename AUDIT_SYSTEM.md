# GenMZ Shop - Audit Log System

**Phase 4: Audit Log (Enterprise Compliance)**

ده اللي يخليك Enterprise فعلًا

---

## 4.1 System Overview

The audit log system tracks **every operation** in the system with:
- **Who** (employeeId, employeeName, role)
- **When** (createdAt timestamp)
- **What** (action: create, update, delete, refund)
- **Where** (targetType: order, product, customer, staff)
- **Why** (details and changes)
- **IP Address** (for security tracking)

### Core Principle: Immutability
**Audit logs cannot be deleted or modified.**
- Once created, logs are permanent
- Compliance with financial regulations
- No tampering or cover-ups possible
- Read-only access via API

---

## 4.2 Audit Entry Structure

```typescript
{
  _id: ObjectId
  employeeId: string              // Staff member ID
  employeeName: string            // Human-readable name
  action: string                  // "create" | "update" | "delete" | "refund"
  targetType: string              // "order" | "product" | "customer" | "staff" | "wallet"
  targetId: string                // Entity ID (order._id, product._id, etc.)
  changes: {                       // Before/after values
    fieldName: {
      before: any
      after: any
    }
  }
  details: string                 // Human-readable summary
  ipAddress: string               // Source IP for security
  createdAt: Date                 // Immutable timestamp
  updatedAt: Date
}
```

---

## 4.3 Logging Operations

### Staff Management Logs
```typescript
logStaffAction(
  employeeId: "admin1",
  employeeName: "أحمد",
  action: "create",
  staffId: "staff123",
  staffName: "محمد",
  details: "Added new cashier"
)
// Result: "staff_create" action logged
```

### Product Changes
```typescript
logProductChange(
  employeeId: "admin1",
  employeeName: "أحمد",
  action: "update",
  productId: "prod123",
  productName: "T-Shirt",
  changes: {
    price: { before: 100, after: 150 },
    stock: { before: 50, after: 45 }
  }
)
// Result: "product_update" with changes tracked
```

### Order Modifications
```typescript
logOrderChange(
  employeeId: "cashier1",
  employeeName: "علي",
  action: "refund",
  orderId: "order123",
  amount: 500
)
// Result: "order_refund" logged
```

### Financial Transactions
```typescript
logFinancialTransaction(
  employeeId: "accountant1",
  employeeName: "سارة",
  type: "invoice",
  amount: 1500,
  targetId: "invoice123",
  details: "Invoice #INV-001"
)
// Result: "financial_invoice" logged with amount
```

---

## 4.4 Querying Audit Logs

### Get All Logs
```
GET /api/audit-logs
```

### Filter by Date Range
```
GET /api/audit-logs?startDate=2025-01-01&endDate=2025-01-31
```

### Filter by Employee
```
GET /api/audit-logs?employeeId=emp123
```

### Filter by Action
```
GET /api/audit-logs?action=product_update
```

### Financial Logs Only
```
GET /api/audit-logs/financial
```

---

## 4.5 Log Categories

### Staff Logs
- `staff_create` - New employee added
- `staff_update` - Employee details changed
- `staff_delete` - Employee removed
- `staff_password_reset` - Password reset
- `staff_activate` - Account reactivated
- `staff_deactivate` - Account deactivated

### Product Logs
- `product_create` - New product added
- `product_update` - Product details changed (price, images, etc.)
- `product_delete` - Product removed

### Order Logs
- `order_create` - New order placed
- `order_update` - Order status changed
- `order_refund` - Refund processed
- `order_cancel` - Order cancelled

### Financial Logs
- `financial_invoice` - Invoice created
- `financial_bank_transfer` - Bank transfer recorded
- `financial_wallet_adjustment` - Wallet balance changed

### Customer Logs
- `customer_create` - New customer registered
- `customer_update` - Customer info changed
- `customer_delete` - Customer deleted

---

## 4.6 UI: Audit Log Viewer

**Page:** `/admin/audit-logs`

### Features
- ✅ Sortable table with all operations
- ✅ Filters: Date range, Employee, Action, Type
- ✅ Search by order/product/customer ID
- ✅ Export to CSV
- ✅ Real-time updates
- ✅ Read-only (no delete button)

### Filter Panel
```
┌─────────────────────────────────┐
│ Filters                          │
├─────────────────────────────────┤
│ Date Range: [__] to [__]        │
│ Employee: [▼ Select]            │
│ Action: [▼ All]                 │
│ Type: [▼ All]                   │
└─────────────────────────────────┘
```

### Table Columns
```
| الوقت        | الموظف | الإجراء | الكيان | التفاصيل | IP |
|------------|--------|--------|--------|----------|-----|
| 5:30 PM   | أحمد   | تحديث  | طلب    | حالة → معالج | ... |
| 4:15 PM   | علي    | إنشاء  | موظف   | محمد      | ... |
| 3:45 PM   | سارة   | فاتورة | مالي   | SAR 1500 | ... |
```

---

## 4.7 Financial Audit Trail

### Separate Financial Logs
All financial transactions are logged with:
- ✅ Amount (in SAR)
- ✅ Transaction type (invoice, transfer, refund)
- ✅ Employee who processed it
- ✅ Timestamp to the second
- ✅ Reference document (invoice #, order #)

### Example Financial Audit Flow
```
1. Customer places order → order_create logged
2. Payment received → Order.paymentStatus updated → order_update logged
3. Accounting team issues invoice → financial_invoice logged
4. Bank transfer recorded → financial_bank_transfer logged
5. Refund requested → order_refund + financial_wallet_adjustment logged
```

### Compliance
- Every SAR movement tracked
- Employee accountability
- No gaps or missing transactions
- Immutable record for auditors

---

## 4.8 Immutability Enforcement

### No Delete Operations
```typescript
// This will ALWAYS fail:
DELETE /api/audit-logs/:id  // ❌ Returns 403 Forbidden

// Audit logs cannot be:
// - Deleted
// - Updated (modified)
// - Hidden
// - Filtered out (except in UI queries)
```

### Database Level
- No delete triggers on AuditLog collection
- Indexes on createdAt and employeeId for fast queries
- Archive after 7 years (automatic retention policy)

---

## 4.9 Integration Examples

### Logging a Staff Creation
```typescript
// In POST /api/staff endpoint
const newStaff = await UserModel.create(staffData);

await logStaffAction(
  req.user.id,
  req.user.name,
  'create',
  newStaff._id,
  staffData.name,
  `Role: ${staffData.role}, Branch: ${staffData.branchId}`,
  req.ip
);

res.json(newStaff);
```

### Logging an Order Refund
```typescript
// In POST /api/orders/:id/refund endpoint
const refund = await processRefund(orderId, amount);

await logOrderChange(
  req.user.id,
  req.user.name,
  'refund',
  orderId,
  amount,
  { status: 'completed', refundMethod: 'wallet' },
  req.ip
);

res.json(refund);
```

### Logging a Price Update
```typescript
// In PATCH /api/products/:id endpoint
const oldPrice = product.price;
const newProduct = await ProductModel.findByIdAndUpdate(id, updates);

await logProductChange(
  req.user.id,
  req.user.name,
  'update',
  id,
  product.name,
  { price: { before: oldPrice, after: updates.price } },
  req.ip
);

res.json(newProduct);
```

---

## 4.10 Audit Dashboard Stats

```
┌──────────────────────────────────┐
│ Audit Summary (Last 30 Days)     │
├──────────────────────────────────┤
│ Total Operations:     2,547      │
│ Created:              1,234      │
│ Updated:                892      │
│ Deleted:                 89      │
│ Refunded:                332      │
│                                  │
│ Financial Volume:   SAR 125,450  │
│ Invoices Issued:         234     │
│ Refunds Processed:       45      │
└──────────────────────────────────┘
```

---

## Implementation Status

- [x] AuditLog schema (database)
- [x] Audit logging utilities (audit.ts)
- [x] Logging functions (staff, products, orders, financial)
- [x] Immutability enforcement
- [x] AdminAuditLogs.tsx page (exists, partial)
- [ ] API endpoint for filtered queries
- [ ] Export to CSV feature
- [ ] Real-time dashboard stats
- [ ] Archive policy (7-year retention)
- [ ] Compliance report generator

---

## Compliance Features

✅ **Non-Repudiation** - Employee can't deny their actions
✅ **Accountability** - Clear who did what and when
✅ **Integrity** - Logs cannot be tampered with
✅ **Availability** - Full audit trail always accessible
✅ **Confidentiality** - Only authorized staff can view logs

---

**Status:** ✅ Foundation Complete
**What's Done:** Utilities, logging functions, immutability
**What's Next:** API endpoints, CSV export, dashboard
**Last Updated:** December 30, 2025
