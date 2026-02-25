# GenMZ Shop - Design System

**Phase 1: Design System & Frontend Base**

دي اللي بتخلي المستخدم يقول "واو" من أول ثانية

---

## 1.1 Design Tokens

### Typography System

We use **Cairo** font exclusively for all text (already loaded from Google Fonts).

#### Heading Scale (Responsive)
```
h1: clamp(2rem, 5vw, 3.5rem)      // Hero titles
h2: clamp(1.5rem, 4vw, 2.5rem)    // Section titles
h3: clamp(1.25rem, 3vw, 1.875rem) // Subsections
h4: clamp(1.1rem, 2.5vw, 1.5rem)  // Card titles
h5: clamp(1rem, 2vw, 1.25rem)     // Small titles
```

#### Body Text
```
lg: 1.125rem  (18px)  // Large body text
base: 1rem    (16px)  // Standard body text
sm: 0.875rem  (14px)  // Smaller details
xs: 0.75rem   (12px)  // Helper text
```

#### Font Weights
```
thin: 200        // Thin text (rare)
light: 300       // Light emphasis
normal: 400      // Default body
medium: 500      // Slightly bold
semibold: 600    // Emphasized text
bold: 700        // Strong emphasis
extrabold: 800   // Headers
black: 900       // Headlines (rare)
```

### Color Tokens

#### Primary Color (Emerald Green)
```
Primary: hsl(161 94% 30%)          // #0D8659
Primary Foreground: hsl(210 40% 98%) // White text on primary
```

#### Status Colors
```
Success: rgb(34 197 94)   // Green ✓
Warning: rgb(245 158 11)  // Amber ⚠
Error: rgb(239 68 68)     // Red ✗
Info: rgb(59 130 246)     // Blue ℹ
```

#### Neutral Palette
```
White: #FFFFFF
Black: #1A1A1A

Gray Scale (light → dark):
50:  #F9FAFB     // Lightest background
100: #F3F4F6     // Light background
200: #E5E7EB     // Light borders
300: #D1D5DB     // Medium borders
400: #9CA3AF     // Disabled text
500: #6B7280     // Medium text
600: #4B5563     // Strong text
700: #374151     // Dark text
800: #1F2937     // Very dark text
900: #111827     // Darkest text
```

#### Theme Variables (Light Mode)
```
Background:     hsl(210 20% 98%)
Foreground:     hsl(222.2 84% 4.9%)
Card:           hsl(0 0% 100%)
Border:         hsl(214.3 31.8% 91.4%)
Input:          hsl(214.3 31.8% 91.4%)
Ring (Focus):   hsl(161 94% 30%) // Primary
```

#### Theme Variables (Dark Mode)
```
Background:     hsl(222.2 84% 4.9%)
Foreground:     hsl(210 40% 98%)
Card:           hsl(222.2 84% 4.9%)
Border:         hsl(217.2 32.6% 17.5%)
Input:          hsl(217.2 32.6% 17.5%)
Ring (Focus):   hsl(161 94% 30%) // Primary
```

### Spacing Scale

A consistent 4px base unit (4px = 1).

```
0:  0px      // Remove spacing
1:  4px      // xs (minimal)
2:  8px      // sm (small)
3:  12px     // md (medium)
4:  16px     // lg (standard)
6:  24px     // xl (large)
8:  32px     // 2xl (extra large)
12: 48px     // 3xl (huge)
16: 64px     // 4xl (massive)
```

**Usage Examples:**
```css
padding: 4px;      /* p-1 */
padding: 8px;      /* p-2 */
padding: 16px;     /* p-4 */
margin: 12px;      /* m-3 */
gap: 24px;         /* gap-6 */
```

### Border Radius Rules

```
none: 0px       // No rounding (edges)
sm:   2px       // Minimal (small inputs)
md:   6px       // Medium (cards, buttons)
lg:   8px       // Large (modals, dropdowns)
full: 50%       // Perfect circle (avatars)
```

**Component Assignments:**
```
Button (md):            6px
Input fields (md):      6px
Cards (md):             6px
Modals/Dialogs (lg):    8px
Avatars (full):         50%
Small elements (sm):    2px
```

### Shadow System

```
none:   none
sm:     0 1px 2px rgba(0, 0, 0, 0.05)
base:   0 4px 6px rgba(0, 0, 0, 0.1)
md:     0 10px 15px rgba(0, 0, 0, 0.1)
lg:     0 20px 25px rgba(0, 0, 0, 0.15)
xl:     0 25px 50px rgba(0, 0, 0, 0.25)
```

**Usage Guidelines:**
```
Flat UI (cards):         shadow-sm
Hover states:            shadow-md
Dropdowns/Popovers:      shadow-lg
Modals:                  shadow-xl
Elevated states:         shadow-lg
```

**Utility Classes:**
```css
.hover-elevate {
  @apply transition-all duration-300 hover:-translate-y-1 hover:shadow-xl;
}

.luxury-glass {
  @apply bg-white/70 backdrop-blur-md border border-white/20 shadow-xl;
}

.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400;
}
```

---

## 1.2 Component Library

### Button Component

**File:** `client/src/components/design/Button.tsx`

**Variants:**
```
primary (solid)   - Main CTAs (emerald green background)
secondary (soft)  - Secondary actions (light gray background)
outline           - Less important actions (border only)
ghost             - Minimal actions (text only)
destructive       - Danger actions (red)
```

**Sizes:**
```
sm (32px)  - Compact, inline usage
md (44px)  - Standard buttons
lg (52px)  - Hero / prominent CTAs
```

**Examples:**
```tsx
<Button variant="primary" size="md">
  تأكيد
</Button>

<Button variant="outline" size="sm">
  إلغاء
</Button>

<Button variant="destructive" size="lg">
  حذف
</Button>
```

**Properties:**
- Smooth transitions (300ms)
- Focus states with ring (outline)
- Disabled state support
- Loading spinner support
- Full width option

### Input / Select / Switch

**File:** `client/src/components/design/Input.tsx`

**Input Specifications:**
```
Height:           44px
Padding:          12px 16px
Border Radius:    6px
Border Width:     1px
Border Color:     gray-300
Focus Ring:       2px primary color
Font Size:        14px
Background:       white (light), dark-input (dark)
```

**States:**
```
default    - Standard input
focus      - Active with ring
disabled   - Grayed out
error      - Red border + error message
success    - Green checkmark indicator
loading    - Spinner inside input
```

**Select Component:**
- Same dimensions as Input
- Dropdown arrow indicator
- Accessible with keyboard
- Option groups supported
- Search/filter capability

**Switch Component:**
- Toggle true/false state
- Smooth animation
- Label support
- Disabled state
- Accessible (keyboard + screen reader)

### Modal / Drawer

**Modal (Dialog):**
```
Background Overlay:  Black with opacity
Modal Size:          Max-width 500px (mobile responsive)
Border Radius:       lg (8px)
Padding:             24px
Shadow:              xl
Animations:          Fade in/out (200ms)
Close Button:        Top right corner
```

**Drawer (Sheet):**
```
Position:            Slide from right or bottom (mobile)
Width:               400px (desktop), 100% (mobile)
Height:              Auto (desktop), 80vh (mobile)
Border Radius:       lg top-left/right
Animation:           Slide in/out (300ms)
Overlay:             Clickable to close
```

**Usage:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>تأكيد الحذف</DialogTitle>
    </DialogHeader>
    <DialogBody>هل أنت متأكد؟</DialogBody>
    <DialogFooter>
      <Button variant="outline">إلغاء</Button>
      <Button variant="destructive">تأكيد الحذف</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table Component

**File:** `client/src/components/design/Table.tsx`

**Specifications:**
```
Header Background:   Light gray (gray-100)
Row Hover:          Light background change
Border Color:       gray-200
Padding:            12px 16px (cells)
Font Size:          14px
Sticky Header:      On scroll
Alternating Rows:   Optional zebra striping
```

**Features:**
- Sortable columns
- Filterable rows
- Pagination support
- Responsive (scrollable on mobile)
- Row selection (checkboxes)
- Action columns

**Example:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>الاسم</TableHead>
      <TableHead>السعر</TableHead>
      <TableHead>الإجراءات</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map((product) => (
      <TableRow key={product.id}>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.price}</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">تعديل</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge / Status Pill

**Badge Variants:**
```
default    - Gray background
primary    - Green background (primary color)
success    - Green (✓ completed)
warning    - Amber (⚠ attention)
destructive - Red (✗ error)
outline    - Border only
```

**Sizes:**
```
sm - Compact (small text)
md - Standard
lg - Large (bold text)
```

**Example:**
```tsx
<Badge variant="success">مكتمل</Badge>
<Badge variant="warning">قيد الانتظار</Badge>
<Badge variant="destructive">ملغي</Badge>
```

**Status Pill (Animated):**
```tsx
<StatusPill status="online" />    // Green + pulse
<StatusPill status="away" />      // Amber
<StatusPill status="busy" />      // Red
<StatusPill status="offline" />   // Gray
```

### Toast Notifications

**File:** `client/src/components/design/Toast.tsx`

**Variants:**
```
success  - Green (✓ Operation succeeded)
error    - Red (✗ Operation failed)
warning  - Amber (⚠ Caution needed)
info     - Blue (ℹ Information)
```

**Duration:**
```
success: 3000ms (auto-dismiss)
error:   5000ms (auto-dismiss)
warning: 4000ms (auto-dismiss)
info:    3000ms (auto-dismiss)
```

**Features:**
```
- Auto-dismiss after duration
- Manual close button
- Action button support
- Stacking (multiple toasts)
- Queue management
- Custom icons
- Dark mode support
```

**Usage:**
```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Success
toast({
  title: "نجح!",
  description: "تم حفظ البيانات بنجاح",
  variant: "success",
})

// Error
toast({
  title: "خطأ",
  description: "فشل في تحميل البيانات",
  variant: "destructive",
})

// With action
toast({
  title: "ملغي",
  description: "تم إلغاء الطلب",
  action: <ToastAction altText="تراجع">تراجع</ToastAction>,
})
```

### Skeleton Loader

**File:** `client/src/components/design/Skeleton.tsx`

**Specifications:**
```
Color:              Animated gray (shimmer effect)
Border Radius:      md (6px)
Background:         Light gray
Animation:          Pulsing shimmer (1.5s)
```

**Usage:**
```tsx
// Loading card
<div className="space-y-4">
  <Skeleton className="h-8 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>

// Loading table
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>

// Loading avatar
<Skeleton className="h-10 w-10 rounded-full" />
```

---

## 1.3 Responsive Design Rules

### Breakpoints
```
xs: 0px        // Mobile (default)
sm: 640px      // Tablet
md: 768px      // Tablet+
lg: 1024px     // Desktop
xl: 1280px     // Large desktop
2xl: 1536px    // Extra large
```

### Mobile-First Approach
- Design for mobile first
- Add complexity for larger screens
- Use Tailwind responsive prefixes (sm:, md:, lg:)

### Touch Targets
- Minimum 44px × 44px for touch buttons
- 12px minimum spacing between touch targets
- Larger on mobile (48px+ recommended)

---

## 1.4 Usage Examples

### Complete Page Example

```tsx
import { Button } from "@/components/design"
import { useToast } from "@/hooks/use-toast"

export function ProductPage() {
  const { toast } = useToast()
  
  const handleAddToCart = () => {
    toast({
      title: "تم الإضافة",
      description: "تمت إضافة المنتج إلى السلة",
      variant: "success",
    })
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero Section */}
      <h1 className="text-gradient">المنتج الجديد</h1>
      
      {/* Product Card */}
      <Card className="space-y-4">
        <img src={product.image} alt={product.name} />
        <h2>{product.name}</h2>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        
        {/* Price Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="primary">${product.price}</Badge>
          <Badge variant="success">متوفر</Badge>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="lg" 
            className="flex-1"
            onClick={handleAddToCart}
          >
            أضف إلى السلة
          </Button>
          <Button variant="outline" size="lg">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

## Component Implementation Checklist

- [x] Typography System (Cairo font)
- [x] Color Tokens (Primary + Status)
- [x] Spacing Scale (4px base)
- [x] Border Radius Rules
- [x] Shadow System
- [x] Button Component (variants + sizes)
- [x] Input / Select / Switch
- [x] Modal / Drawer
- [x] Table Component (base)
- [x] Badge / Status Pill
- [x] Toast Notifications
- [x] Skeleton Loader
- [x] Responsive Breakpoints
- [x] Dark Mode Support (theme toggle)

---

## Design Principles

### 1. Simplicity
- Two fonts maximum (Cairo primary, fallback system)
- Limited color palette (primary + status)
- Consistent spacing (multiples of 4px)

### 2. Consistency
- All buttons follow same variant/size rules
- All inputs same height/padding
- All cards same border radius
- All shadows follow scale

### 3. Accessibility
- Minimum 44px touch targets
- Color contrast WCAG AA compliant
- Keyboard navigation support
- ARIA labels on interactive elements

### 4. Performance
- Lazy load images
- Skeleton loaders for async data
- Optimize animations (300ms or less)
- Code splitting by route

---

**Status:** ✅ Design System Complete
**Last Updated:** December 30, 2025
