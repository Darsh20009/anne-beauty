# Anne Beauty (آن بيوتي) - Beauty E-commerce Platform

## Overview

Anne Beauty is a full-featured bilingual (Arabic/English) beauty and makeup e-commerce platform targeting Saudi Arabia's market. The platform features a modern, Noon/Amazon-inspired layout with maroon (#8B1D24) brand identity, complete storefront functionality, shopping cart, user authentication, POS system, and an admin dashboard for managing products, orders, staff, and customers.

The application follows a monorepo structure with a React frontend (Vite), Express backend, and MongoDB database using Mongoose. It supports RTL layout for Arabic, dark/light themes, PWA capabilities, and is designed mobile-first with responsive breakpoints.

## User Preferences

Preferred communication style: Simple, everyday language (Arabic/English).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom plugins for Replit integration
- **Routing**: Wouter (lightweight React router)
- **State Management**: 
  - TanStack Query for server state (products, orders, auth)
  - Zustand for client state (shopping cart with persistence)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Icons**: Lucide React + react-icons for social media icons
- **Brand Colors**: Primary maroon #8B1D24 (HSL 354 70% 35%), dark mode variant HSL 354 70% 45%

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules (tsx for development)
- **Authentication**: Passport.js with local strategy, express-session with memory store
- **Password Hashing**: Node crypto scrypt with salt
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation

### Database Layer
- **Database**: MongoDB (connected via MONGODB_URI)
- **ODM**: Mongoose with TypeScript models
- **Schema Location**: shared/schema.ts (Zod validation) + server/models.ts (Mongoose schemas)
- **Key Collections**: users, products, orders, categories, marketing
- **Product Variants**: Stored as subdocument arrays (color, size, sku, stock, cost)
- **Product Custom Options**: Admin-defined questions/option groups per product (single/multiple choice, price adjustments)
- **Product File Upload**: Toggleable per product - allows customers to attach files
- **Product Notes**: Toggleable per product - allows customers to add notes

### Project Structure
```
├── client/src/           # React frontend
│   ├── assets/           # Logo and brand images
│   ├── components/       # Reusable UI components (Layout, ProductCard, SplashScreen, etc.)
│   ├── pages/            # Route pages (Home, Products, Cart, Admin, POS, etc.)
│   ├── hooks/            # Custom hooks (auth, cart, products, language)
│   └── lib/              # Utilities and query client
├── client/public/        # Static assets (favicon, PWA icons, manifest.json)
├── server/               # Express backend
│   ├── routes.ts         # API endpoint definitions
│   ├── models.ts         # Mongoose schemas/models
│   ├── auth.ts           # Authentication setup
│   └── seed.ts           # Initial data seeding
├── shared/               # Shared code
│   ├── schema.ts         # Zod validation schemas and TypeScript types
│   └── routes.ts         # API route definitions with Zod schemas
└── attached_assets/      # User-provided assets and reference materials
```

### Key Pages
- **Home**: Noon/Amazon-style with hero carousel, category icons, flash deals, product grids, promo banners
- **Products**: Product listing with category filtering
- **ProductDetails**: Individual product view with variants
- **Cart/Checkout**: Shopping cart and checkout flow
- **Admin**: Full dashboard (products, orders, staff, branches, banners, audit logs, roles)
- **POS**: Point of sale interface for physical stores
- **Login/Register**: Phone-based authentication

### Design System
- **Brand**: Anne Beauty (آن بيوتي) - domain AnneBeauty.sa
- **Primary Color**: Maroon #8B1D24
- **Typography**: Arabic-first with RTL support, various Google Fonts loaded
- **Home Page Style**: Noon.com/Amazon-inspired with rich sections, category grids, countdown timers, promo banners
- **PWA**: Service worker, manifest with properly sized icons (32, 180, 192, 512px)
- **Splash Screen**: Animated intro with logo, maroon accents, progress bar
- **Theme Toggle**: Dark/light mode with localStorage persistence (key: annebeauty-theme)

### User Roles
- **admin**: Full access to dashboard, products, orders, staff, settings
- **employee**: Access based on granular permissions (orders.view, products.edit, pos.access, etc.)
- **customer**: Storefront shopping, order tracking, profile
- **support**: Customer service access

### Admin Credentials
- Phone: 567326086
- Password: 20262030

## External Dependencies

### Database
- **MongoDB**: Primary database via MONGODB_URI environment variable
- **Mongoose**: ODM for MongoDB with TypeScript support

### Payment Integrations
- **Tamara**: Buy-now-pay-later widget (embedded via CDN)
- **Tabby**: Installment payment widget (embedded via CDN)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **zustand**: Client-side state with localStorage persistence for cart
- **shadcn/ui**: Pre-built accessible UI components (Radix primitives)
- **framer-motion**: Animation library for transitions
- **react-hook-form + zod**: Form handling with validation
- **react-phone-input-2**: International phone number input

### Build and Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### SEO & Social
- Open Graph meta tags configured for annebeauty.sa
- Twitter card meta tags
- og-image.png generated with maroon brand background + logo
