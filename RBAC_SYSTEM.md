# GenMZ Shop - RBAC System

**Phase 3: Staff & RBAC (Enterprise Level)**

دي النقلة من نظام هاوي لنظام شركات

---

## 3.1 Staff Core

### Add Employee
```
POST /api/staff
{
  name: string
  phone: string (0551234567)
  email: string (optional)
  password: string (must be changed on first login)
  branchId: string
  loginType: "dashboard" | "pos" | "both"
  roleId: string (reference to Role)
}
```

**Validation:**
- Phone: SA format (05XXXXXXXX)
- Unique phone per staff
- Strong password (min 8 chars, mixed case, numbers)
- Valid branch exists
- Valid role exists

### Activate / Deactivate
```
PATCH /api/staff/:id
{
  isActive: boolean
}
```

**Rules:**
- Only admins can deactivate/activate
- Deactivated staff cannot login
- Sessions are NOT revoked (expire naturally)
- Audit log tracks changes

### Reset Password
```
POST /api/staff/:id/reset-password
{
  newPassword: string
}
```

**Rules:**
- Require staff to change password on next login
- Send email notification (future)
- Invalidate all sessions (logout everywhere)

### Assign Branch
```
PATCH /api/staff/:id/branch
{
  branchId: string
}
```

**Rules:**
- Only admins can reassign branches
- One branch per staff member
- Audit log tracks changes

### Login Type Options
```
"dashboard"  - Access admin dashboard only
"pos"        - Access Point of Sale only
"both"       - Access both dashboard and POS
```

---

## 3.2 Roles System

### Role Entity (Independent)
```
{
  _id: ObjectId
  name: string (unique)
  description: string
  permissions: string[] (array of permission IDs)
  isSystem: boolean (true = cannot be deleted)
  createdAt: Date
  updatedAt: Date
}
```

### Preset Roles (System Roles)

#### 1. Super Admin
- Description: "Full system access"
- Permissions: ALL
- Can manage users and roles
- Can view all data
- Cannot be deleted

#### 2. Admin
- Description: "Store owner/operator"
- Permissions:
  - orders.view, orders.edit, orders.refund
  - products.view, products.edit
  - customers.view, wallet.adjust
  - reports.view, staff.manage
  - settings.manage
  - pos.access
- Can create custom roles
- Cannot manage super admin

#### 3. Branch Manager
- Description: "Manages single branch"
- Permissions:
  - orders.view, orders.edit
  - products.view
  - customers.view
  - reports.view
  - pos.access
- Can only see own branch data
- Can manage cashiers at branch

#### 4. Cashier
- Description: "Point of Sale operator"
- Permissions:
  - orders.view, orders.edit
  - customers.view
  - pos.access
  - wallet.adjust
- Can only create POS orders
- Cannot view reports or settings

#### 5. Accountant
- Description: "Financial reporting"
- Permissions:
  - orders.view
  - reports.view
  - wallet.adjust
- Read-only access to financials
- Cannot edit orders

#### 6. Support
- Description: "Customer support team"
- Permissions:
  - orders.view
  - customers.view
  - wallet.adjust
- Can adjust customer wallets
- Cannot edit orders

---

## 3.3 Permissions (Granular)

### Permission List

**Orders:**
- `orders.view` - View all orders
- `orders.edit` - Edit order status/details
- `orders.refund` - Process refunds

**Products:**
- `products.view` - View product catalog
- `products.edit` - Create/edit products

**Customers:**
- `customers.view` - View customer list/profiles

**Wallet:**
- `wallet.adjust` - Add/remove wallet balance

**Reporting:**
- `reports.view` - Access analytics & reports

**Staff:**
- `staff.manage` - Create/edit/delete staff

**POS:**
- `pos.access` - Access Point of Sale

**Settings:**
- `settings.manage` - Access system settings

### Permission Checking

**Backend (Middleware):**
```typescript
// Protect route with permission
app.get('/api/orders', requirePermission('orders.view'), (req, res) => {
  // User has permission
})

// Check multiple permissions (AND logic)
requirePermission(['orders.view', 'orders.edit'])

// Super admin bypass
// Users with role="admin" auto-pass all checks
```

**Frontend (Hide UI):**
```tsx
import { usePermission } from '@/hooks/use-permission'

export function OrderActions() {
  const { hasPermission } = usePermission()
  
  if (!hasPermission('orders.refund')) {
    return null // Hide refund button
  }
  
  return <Button>Refund Order</Button>
}
```

---

## 3.4 API Endpoints

### Staff Management

```
GET    /api/staff              - List all staff
GET    /api/staff/:id          - Get staff details
POST   /api/staff              - Create new staff
PATCH  /api/staff/:id          - Update staff
DELETE /api/staff/:id          - Delete staff
POST   /api/staff/:id/reset-password - Reset password
PATCH  /api/staff/:id/branch   - Reassign branch
```

### Role Management

```
GET    /api/roles              - List all roles
GET    /api/roles/:id          - Get role details
POST   /api/roles              - Create custom role
PATCH  /api/roles/:id          - Update role
DELETE /api/roles/:id          - Delete role (custom only)
GET    /api/roles/preset       - Get all preset roles
```

### Permission Reference

```
GET    /api/permissions        - List all available permissions
```

---

## 3.5 Implementation Status

### ✅ Completed
- [x] Permission enum defined (11 permissions)
- [x] Role schema in database
- [x] User model has permissions array
- [x] Preset roles documented

### ⚠️ Partial (In Progress)
- [ ] Staff CRUD API endpoints (basic structure ready)
- [ ] Role CRUD API endpoints
- [ ] Permission checking middleware
- [ ] Frontend staff management page
- [ ] Frontend role management page
- [ ] Permission hooks for frontend
- [ ] Audit logging for staff changes
- [ ] Password reset flow
- [ ] Session invalidation on permission change

### ❌ Not Yet (Requires Autonomous Mode)
- [ ] Advanced permission testing
- [ ] Session management on role change
- [ ] Email notifications for staff
- [ ] Bulk staff operations
- [ ] Role templates/templates
- [ ] Permission inheritance/delegation
- [ ] Comprehensive audit trails
- [ ] Rate limiting on login attempts
- [ ] Two-factor authentication
- [ ] OAuth integration for staff

---

## Current Architecture

```
User (Staff)
  ├── role: string (enum)
  ├── roleId?: string (future - reference to Role doc)
  ├── permissions: string[] (current implementation)
  ├── branchId: string
  ├── loginType: "dashboard" | "pos" | "both"
  └── isActive: boolean

Role (New Document)
  ├── name: string (unique)
  ├── description: string
  ├── permissions: string[]
  ├── isSystem: boolean
  ├── createdAt: Date
  └── updatedAt: Date

Request Flow:
1. User logs in → checks isActive
2. API call → middleware checks permission
3. If granted → execute action
4. Log to AuditLog
```

---

**Status:** 🔄 Phase 3 Partial
**What's Done:** Architecture, permissions enum, preset roles
**What's Next:** API endpoints, frontend UI, permission middleware
**Last Updated:** December 30, 2025
