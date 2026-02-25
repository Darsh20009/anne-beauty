# GenMZ Shop - Onboarding & UX Psychology

**Phase 2: Onboarding & UX Psychology**

دي اللي زد وسلة بيكسبوا بيها

---

## 2.1 Onboarding Logic

### System Architecture

The onboarding system automatically detects missing setup steps and guides users through them.

#### Setup Steps (7 Total)

**Required Steps (Must Complete):**
1. **Profile Complete** - Add name and profile information
   - Detected: `user.name` is set
   - Action: Navigate to `/profile`

2. **First Product** - Add your first product
   - Detected: At least 1 product exists
   - Action: Navigate to `/admin/products`

3. **Branch Setup** - Configure your store location
   - Detected: At least 1 branch exists
   - Action: Navigate to `/admin/branches`

**Optional Steps (Enhance Experience):**
4. **Staff Created** - Add team members
   - Detected: At least 1 staff member exists
   - Action: Navigate to `/admin/staff`

5. **First Order** - Receive your first order
   - Detected: At least 1 order exists
   - Action: Navigate to `/orders`

6. **Payment Configured** - Enable payment methods
   - Detected: At least 1 payment method enabled
   - Action: Navigate to `/admin/settings`

7. **Shipping Setup** - Configure shipping companies
   - Detected: At least 1 shipping company exists
   - Action: Navigate to `/admin/shipping`

### Progress Calculation

```
completionPercentage = (completed_steps / total_steps) * 100

Examples:
- 3 completed steps = 43% progress (3/7)
- 5 completed steps = 71% progress (5/7)
- 7 completed steps = 100% progress (7/7) ✓
```

### Onboarding Display Rules

**Show Onboarding When:**
- User role is `admin` or `employee`
- No setup steps completed (first login)
- Less than 70% completion

**Hide Onboarding When:**
- User dismisses the dialog
- Completion reaches 70% (auto-hide)
- All required steps completed
- User navigates away

### Deep Links

Every step has a direct link for easy access:

```
Profile:   /profile
Products:  /admin/products
Branches:  /admin/branches
Staff:     /admin/staff
Orders:    /orders
Payments:  /admin/settings
Shipping:  /admin/shipping
```

### Implementation Files

**Core Files:**
- `hooks/use-onboarding.ts` - Onboarding state management
- `constants/onboarding.tsx` - Step definitions
- `types/onboarding.ts` - Type definitions
- `components/OnboardingFlow.tsx` - Main UI component

**Usage in App:**
```tsx
import { OnboardingFlow } from "@/components/OnboardingFlow"

function App() {
  return (
    <>
      <OnboardingFlow />
      {/* Rest of app */}
    </>
  )
}
```

---

## 2.2 Empty States

### Design Principles

Every page with dynamic data should have an empty state showing:

1. **Title (واضح - Clear)**
   - One line, specific to the page
   - Example: "لا توجد منتجات بعد"

2. **Description (بشري - Human)**
   - Supportive, helpful tone
   - Explain why the page is empty
   - Example: "لم تضف أي منتجات حتى الآن. ابدأ بإضافة منتجك الأول!"

3. **Primary CTA (واحد - Single)**
   - One main action button
   - Links to resource creation page
   - Example: "إضافة منتج"

4. **Optional Secondary Action**
   - Secondary way to proceed
   - Example: "عرض الدليل" or "اتصل بالدعم"

### Empty State Examples

#### Products Page
```tsx
<EmptyState
  title="لا توجد منتجات بعد"
  description="لم تضف أي منتجات حتى الآن. ابدأ بإضافة منتجك الأول وتخصيصه مع الصور والأسعار!"
  icon={<Package className="w-12 h-12" />}
  action={{
    label: "إضافة منتج",
    href: "/admin/products/new",
    variant: "primary",
  }}
  secondaryAction={{
    label: "اقرأ الدليل",
    href: "/guide/products",
  }}
/>
```

#### Orders Page
```tsx
<EmptyState
  title="لا توجد طلبات بعد"
  description="عندما يضع العملاء الطلبات، ستظهر هنا. تأكد من أن متجرك قيد التشغيل!"
  icon={<ShoppingCart className="w-12 h-12" />}
  action={{
    label: "عرض المتجر",
    href: "/",
    variant: "primary",
  }}
/>
```

#### Customers Page
```tsx
<EmptyState
  title="لا يوجد عملاء بعد"
  description="سيتم عرض العملاء هنا بعد أول عملية شراء أو عند إضافتهم يدويًا"
  icon={<Users className="w-12 h-12" />}
  action={{
    label: "إضافة عميل يدويًا",
    href: "/admin/customers/new",
    variant: "primary",
  }}
/>
```

### Component API

**EmptyStateProps:**
```typescript
interface EmptyStateProps {
  title: string;           // Main heading (واضح)
  description: string;     // Supporting text (بشري)
  icon?: ReactNode;        // Optional icon (12px size)
  action?: {
    label: string;         // Button text
    href: string;          // Navigation link
    variant?: "primary" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}
```

**Usage:**
```tsx
import { EmptyState } from "@/components/EmptyState"
import { Package } from "lucide-react"

export function ProductsPage() {
  const { data: products, isLoading } = useProducts()

  if (isLoading) return <Skeleton />

  if (!products?.length) {
    return (
      <EmptyState
        title="لا توجد منتجات بعد"
        description="ابدأ بإضافة منتجك الأول!"
        icon={<Package className="w-12 h-12" />}
        action={{
          label: "إضافة منتج",
          href: "/admin/products/new",
        }}
      />
    )
  }

  return (
    <div>
      {/* Product list */}
    </div>
  )
}
```

---

## 2.3 Onboarding Journey Map

### Day 1: Initial Setup
```
Login → Onboarding Dialog Opens
   ↓
Complete Profile → 14% progress
   ↓
Add First Product → 43% progress
   ↓
Setup Branch → 57% progress (Required steps done)
```

### Day 2: Extended Setup
```
Return to Dashboard
   ↓
See Onboarding (57% complete)
   ↓
Add Staff → 71% progress
   ↓
Onboarding Auto-hides (70%+ threshold)
```

### Completion Path
```
First Order Received → 86% progress
   ↓
Configure Payments → 100% progress ✓
   ↓
Onboarding Dialog Closes
```

---

## 2.4 UX Psychology Principles Applied

### 1. **Progress Visibility**
- Show completion percentage
- Visual progress bar
- Completed items marked with ✓
- Current task highlighted

### 2. **Reduced Friction**
- One required action at a time
- Deep links avoid extra navigation
- Optional steps don't block progress
- Auto-hide at 70% keeps momentum

### 3. **Psychological Wins**
- Checkmarks for completed items
- Green styling for success states
- Celebrate progress milestones
- Optional steps feel like bonus content

### 4. **Clear Language**
- Arabic throughout (ar)
- Supportive, encouraging tone
- Action-oriented button text
- No jargon or technical terms

### 5. **Smart Defaults**
- Show only when helpful
- Don't interrupt workflow
- Remember dismissals
- Respect user preferences

---

## Implementation Checklist

- [x] Onboarding detection logic
- [x] Progress calculation algorithm
- [x] Deep link routing for each step
- [x] Show/hide logic (auto-hide at 70%)
- [x] Empty state component
- [x] OnboardingFlow dialog
- [x] Step tracking hooks
- [x] Grouping by category
- [x] Optional vs required steps
- [x] Arabic localization

---

## Future Enhancements

- [ ] Analytics tracking for dropout points
- [ ] A/B testing different CTAs
- [ ] Smart timing based on user behavior
- [ ] Video tutorials linked to each step
- [ ] Tooltip hints on each step
- [ ] Backend persistence of completion status
- [ ] Celebration animations on completion
- [ ] Referral bonuses for early completion

---

**Status:** ✅ Phase 2 Complete
**Last Updated:** December 30, 2025
