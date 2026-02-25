# GenMZ Shop - Branches System

**Phase 5: Branches System**

الفروع = Context مش مخزون

---

## 5.1 Branch Management

### Add Branch
```
POST /api/branches
{
  name: string              // Branch name (مقهى الرياض)
  location: string          // Address (الشارع الخامس، الرياض)
  phone: string             // Contact (0551234567)
  latitude: number          // Map coordinates
  longitude: number         // Map coordinates
  posEnabled: boolean       // Enable Point of Sale?
  assignedStaff: string[]   // Staff IDs
}
```

### Location (Map)
- **Interactive map** - Click to set coordinates
- **Auto-populate** - Drag pin to adjust
- **Address search** - Search for location
- **Visual feedback** - Show branch pin on map
- **Saudi Arabia default** - Centered on Riyadh (24.7136, 46.6753)

### Status (Active / Closed)
- **isActive** - Boolean toggle
- **Active** - Can accept orders, staff can login
- **Closed** - No POS access, orders paused
- **Status display** - Green/Red badge in UI

### Assign Staff
- **Per-branch staff** - Assign cashiers and managers
- **Branch context** - Users see only their branch data
- **Multi-branch support** - Staff can have multiple branches
- **Reassign anytime** - No deletion needed, just reassign

### Enable POS Per Branch
```
posEnabled: true
- Branch opens POS system
- Cashiers can login
- Accept cash/card payments
- Real-time inventory checks
```

---

## 5.2 Branch Entity

```typescript
Branch {
  _id: ObjectId
  name: string              // "فرع الرياض"
  location: string          // "الشارع الخامس، الرياض"
  phone: string             // "0551234567"
  latitude: number          // 24.7136
  longitude: number         // 46.6753
  isActive: boolean         // true/false
  posEnabled: boolean       // Can staff login to POS?
  assignedStaff: string[]   // [staffId1, staffId2]
  createdAt: Date
  updatedAt: Date
}
```

---

## 5.3 Key Concept: Branches = Context, NOT Inventory

**IMPORTANT: Branches do NOT store inventory**

- All products = Centralized in one place
- Branches = Sales point context
- Orders = Reference a branch for context
- Inventory = Managed globally, not per-branch
- Stock = Shared across all branches

**Example:**
```
Product "T-Shirt" has 1000 units in stock

Branch "Riyadh": 
  - Can sell the T-Shirt
  - Reduces global stock
  - DOES NOT have "Riyadh inventory" subset

Branch "Jeddah":
  - Can also sell the T-Shirt
  - Reduces SAME global stock
  - No separate Jeddah inventory
```

---

## 5.4 Branch in Order Context

### Online Order
```
Order {
  userId: "customer123"
  type: "online"
  branchId: null          // No branch for online
  status: "processing"
  items: [...]
}
```

### POS Order
```
Order {
  userId: "customer456"
  type: "pos"
  branchId: "branch_riyadh"   // Which branch
  cashierId: "cashier1"        // Who processed it
  status: "completed"
  items: [...]
}
```

---

## 5.5 API Endpoints

```
GET    /api/branches              - List all branches
GET    /api/branches/:id          - Get branch details
POST   /api/branches              - Create new branch
PATCH  /api/branches/:id          - Update branch
DELETE /api/branches/:id          - Delete branch
PATCH  /api/branches/:id/staff    - Assign staff
GET    /api/branches/:id/staff    - Get assigned staff
POST   /api/branches/:id/pos/enable  - Enable POS
POST   /api/branches/:id/pos/disable - Disable POS
```

---

## 5.6 Staff Assignment

### One Staff → Multiple Branches
```
User "Ahmed" {
  branchId: "main_branch"        // Primary branch
  // Can access:
  // - Main branch (primary)
  // - Riyadh branch (if assigned)
  // - Jeddah branch (if assigned)
}
```

### Branch Assignment Flow
1. Admin creates branch
2. Admin selects staff members
3. Staff can login to that branch's POS
4. Orders tagged with branch ID
5. Reports filtered by branch

---

## 5.7 Implementation Status

- [x] Branch schema (name, location, phone, coordinates)
- [x] isActive status
- [x] posEnabled flag
- [x] assignedStaff field
- [x] AdminBranches.tsx page exists
- [x] LocationMap component exists
- [ ] Add branch staff assignment UI
- [ ] Add POS enable/disable controls
- [ ] Add staff reassignment API
- [ ] Add branch-filtered queries for orders

---

## 5.8 Usage Example

### Create Branch with Map
```tsx
import { AdminBranches } from "@/pages/AdminBranches"

export function App() {
  return <AdminBranches />
}

// User clicks "Add Branch"
// Selects location on map
// Enters name, phone
// Selects staff members
// Enables POS if needed
// Saves
```

### Use Branch Context in Order
```typescript
const order = {
  userId: customerId,
  type: "pos",
  branchId: "riyadh_branch",    // From map/context
  cashierId: userId,
  items: [...],
}

await createOrder(order)
// Audit logged with branch context
// Reports filtered by branch
```

---

**Status:** ✅ Foundation Complete
**What's Done:** Schema with coordinates, AdminBranches page, Map component
**What's Next:** Staff assignment UI, POS controls, branch filtering
**Last Updated:** December 30, 2025
