# GenMZ Shop - System Architecture

**Foundation Lock: Phase 0**

بدونها أي تطوير بعد كده هيطلع مهزوز

---

## 0.1 Architecture Decisions (قرارات لا رجعة فيها)

### Core Entity Definitions

#### Product = كيان واحد (Store + POS)
- **Single Product Entity** across the entire system
- One price list for both online store and POS systems
- Variants (color, size, SKU) are stored within the product
- Stock is stored at the variant level in central inventory
- Both store customers and POS customers order the same products

#### Customer = كيان واحد (Wallet + Orders)
- **Single Customer Entity** for all purchase channels
- Customers can place orders via store (online) or POS (in-person)
- Wallet system is unified across all channels
- Loyalty points accumulate from both online and POS purchases
- One customer profile regardless of how they shop

#### Order.type = online | pos
- Orders have a clear `type` field indicating origin
- **online**: Customer places order through web store
- **pos**: Transaction initiated at Point of Sale (branch/cashier)
- Both types follow the same Order schema and workflow
- Financial and inventory impact is identical for both

#### Branch = نقطة بيع فقط (Sales Point, No Inventory)
- Branches are **sales/service points only**, NOT warehouses
- Branches do NOT maintain inventory
- Branches do NOT have stock allocation
- Branches connect to orders via `branchId` and `cashierId` fields
- All inventory is centralized and managed globally
- Branch serves as a location for POS transactions and customer service

### Clear Separation of Concerns

#### 1. Frontend Layer
- **Client Application** (`client/` directory)
- React-based UI for both store and admin dashboard
- Handles user interactions and form validation
- Communicates with backend via REST API

#### 2. Business Logic Layer
- **API Routes** (`server/routes.ts`)
- **Services** (`server/services/`)
  - `analyticsService.ts` - Analytics calculations
  - `barcodeService.ts` - Barcode generation and management
  - `loyaltyService.ts` - Loyalty points calculation
  - `zatcaService.ts` - Saudi tax compliance
  - (Future: inventoryService, orderService, etc.)
- Contains domain rules and business operations
- Validates data before persistence
- Handles cross-entity operations

#### 3. Data Layer
- **Models** (`server/models.ts`)
- **Database** - MongoDB with Mongoose ODM
- Direct database access and schema definitions
- No business logic in data layer

---

## 0.2 Data Models - Consolidated Schema

### Key Field Naming Convention
All reference IDs use **camelCase**: `branchId`, `cashierId`, `userId`, `productId`, `variantSku`

### Order Model (Core Transaction Entity)

```typescript
Order {
  userId: string (required)        // Customer who placed the order
  type: "online" | "pos"           // Channel: store or Point of Sale
  
  // POS Context (null for online orders)
  branchId?: string                // Sales location
  cashierId?: string               // Employee who processed transaction
  
  // Financial
  total: string
  subtotal: string
  vatAmount: string
  shippingCost: string
  tapCommission: string
  netProfit: string
  discountAmount: string
  
  // Items
  items: [{
    productId: string
    variantSku: string
    quantity: number
    price: number
    cost: number
    title: string
  }]
  
  // Status & Workflow
  status: "new" | "processing" | "shipped" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  
  // Shipping (online orders)
  shippingMethod?: "pickup" | "delivery"
  shippingAddress?: { city, street, country }
  pickupBranch?: string
  shippingProvider?: string
  trackingNumber?: string
  
  // Returns
  returnRequest?: {
    status: "none" | "pending" | "approved" | "rejected"
    reason?: string
    type?: "return" | "exchange"
  }
  
  timestamps: createdAt, updatedAt
}
```

### User/Staff Model

```typescript
User {
  username: string
  password: string
  role: "admin" | "employee" | "customer" | "support" | "cashier" | "accountant"
  
  // Staff Connection
  branchId?: string                // Assigned branch (staff only)
  
  // Profile
  name: string
  email: string
  phone: string
  
  // Customer Features
  walletBalance: string            // Unified wallet
  loyaltyPoints: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum"
  totalSpent: number
  addresses: [{ id, name, city, street, isDefault }]
  
  // Staff Features
  loginType: "dashboard" | "pos" | "both"
  permissions: string[]
  isActive: boolean
  mustChangePassword: boolean
  
  timestamps: createdAt, updatedAt
}
```

### Product Model

```typescript
Product {
  name: string
  description: string
  price: string                    // Store price
  cost: string                     // Cost price
  images: string[]
  categoryId?: string
  
  variants: [{
    color?: string
    size?: string
    sku: string                    // Unique per product
    stock: number                  // Central inventory
    cost: number
    image?: string
  }]
  
  isFeatured: boolean
  barcode?: string
  
  timestamps: createdAt, updatedAt
}
```

### Branch Model

```typescript
Branch {
  name: string                     // Branch name (store location)
  location: string                 // Physical address
  phone: string                    // Contact number
  isActive: boolean
  
  // NOTE: Branch stores NO inventory
  // Branch connects to orders via branchId field in Order model
  
  timestamps: createdAt, updatedAt
}
```

### Cash Shift Model

```typescript
CashShift {
  branchId: string                 // Which branch
  cashierId: string                // Which employee
  status: "open" | "closed"
  
  openingBalance: number
  closingBalance?: number
  actualCash?: number              // Physical count
  difference?: number              // Variance
  
  openedAt: Date
  closedAt?: Date
  
  timestamps: createdAt, updatedAt
}
```

### Customer Wallet Model

```typescript
WalletTransaction {
  userId: string                   // Which customer
  amount: number
  type: "deposit" | "withdrawal" | "payment" | "refund"
  description: string
  
  timestamps: createdAt, updatedAt
}
```

### Audit & Compliance Models

```typescript
AuditLog {
  employeeId: string               // Who performed action
  employeeName: string             // Name for readability
  action: string                   // create, update, delete, etc.
  targetType: string               // order, product, customer, etc.
  targetId?: string                // Which entity
  changes?: any                    // What changed (before/after)
  details?: string                 // Additional context
  ipAddress?: string               // Where from
  
  timestamps: createdAt (immutable)
}

Invoice {
  userId: string                   // Customer
  orderId?: string                 // Related order
  invoiceNumber: string (unique)
  issueDate: Date
  dueDate?: Date
  status: "draft" | "issued" | "paid" | "void" | "refunded"
  items: [{ description, quantity, unitPrice, taxRate, taxAmount, total }]
  subtotal: number
  taxTotal: number
  total: number
  notes?: string
  qrCode?: string                  // ZATCA requirement
  
  timestamps: createdAt, updatedAt
}
```

---

## 0.3 Removed/Deprecated Patterns

### ✅ REMOVED: Branch Inventory
- **OLD**: `BranchInventorySchema` - branches had separate inventory
- **NEW**: Single central inventory in Product.variants[].stock
- Branches only record location and contact info

### ✅ UNIFIED: Naming Convention
- All identifiers use camelCase
- `branchId`, `cashierId`, `userId`, `productId`, `variantSku`
- No mixing of naming patterns

### ✅ CLARIFIED: Order Creation Flow
- Online orders: `type="online"`, branchId/cashierId are null
- POS orders: `type="pos"`, branchId/cashierId are required
- Both use identical financial and item schemas

---

## 0.4 Future Extensions (Do Not Implement Yet)

- [ ] Inventory Transfer Requests (between branches and warehouse)
- [ ] Advanced Analytics Dashboards
- [ ] Multi-currency Support
- [ ] API Rate Limiting
- [ ] Advanced Recommendation Engine

---

## Database Connection
- **Provider**: MongoDB
- **ORM**: Mongoose
- **Compliance**: ZATCA Tax Integration (Saudi Arabia)

## API Communication
- **Protocol**: REST over HTTP/HTTPS
- **Framework**: Express.js
- **Session Management**: Express-session with MemoryStore

---

**Last Updated**: December 30, 2025
**Status**: Foundation Lock - Ready for Development
