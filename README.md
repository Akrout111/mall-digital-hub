# Mall Digital Hub | المنصة الرقمية المتكاملة للمول

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## 🇬🇧 English

### Overview

**Mall Digital Hub** is a comprehensive digital platform that connects customers, merchants, and mall administrators in a seamless, modern web experience. Built for Grand Mall (جراند مول), it provides a smart directory, click & collect ordering, hot deals browsing, interactive mall map, merchant portal, and admin dashboard — all in a single-page application with Arabic-first RTL support.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) |
| **Database** | Prisma ORM with SQLite |
| **State Management** | Zustand (client) + TanStack Query (server) |
| **Authentication** | NextAuth.js v4 |
| **Validation** | Zod |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Theming** | next-themes (light/dark) |
| **Runtime** | Bun |

### Features

#### Customer Features
- **Smart Directory** — Browse and search all shops with category, floor, and open-status filters
- **Hot Deals** — Browse featured and active deals with countdown timers and discount badges
- **Click & Collect** — Order supermarket products online and pick up in-store
- **Interactive Map** — Visual floor-by-floor mall map with category color-coding
- **Shop Details** — Full shop information with deals, tags, contact info, and visit tracking
- **Inquiries** — Send questions directly to any shop
- **Bilingual** — Full Arabic (RTL) and English support with one-click toggle
- **Dark Mode** — System-aware dark/light theme switching
- **Accessibility** — Skip-to-content, ARIA labels, reduced motion support

#### Merchant Features
- **Shop Management** — Edit shop details, hours, and contact info
- **Deal Management** — Create, submit, and track promotional deals
- **Order Management** — Process click & collect orders with status workflow
- **Product Management** — Manage product inventory and pricing (supermarket shops)
- **Inquiry Responses** — Reply to customer inquiries
- **Dashboard Overview** — Quick stats for products, deals, inquiries, and orders

#### Admin Features
- **Statistics Dashboard** — Key metrics with interactive charts (top shops, categories, orders)
- **Shop Management** — View and manage all shops with search and subscription filters
- **Subscription Management** — Upgrade/downgrade shop subscription tiers
- **Deal Approval** — Review, approve, reject, and feature deals
- **Order Oversight** — Monitor all orders with status filtering
- **Banner Management** — Create and manage promotional banners

### Getting Started

#### Prerequisites
- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 20 (for Docker deployment)

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-project

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (especially NEXTAUTH_SECRET)

# Set up the database
bun run db:push
bun run db:seed

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`.

#### Environment Setup

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth | Required |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mall` | Mall information with counts |
| GET | `/api/shops` | List shops (with filters, pagination) |
| GET | `/api/shops/[id]` | Shop detail with products & deals |
| GET | `/api/categories` | List shop categories |
| GET | `/api/products` | List products (with filters, pagination) |
| GET | `/api/products/[id]` | Product detail |
| GET | `/api/deals` | List active approved deals (pagination) |
| GET/POST | `/api/deals/manage` | List all deals / Create new deal |
| PUT | `/api/deals/manage` | Approve/feature/reject deal |
| GET | `/api/orders` | List orders (with filters, pagination) |
| POST | `/api/orders` | Create click & collect order |
| GET/PUT | `/api/orders/[id]` | Order detail / Update status |
| GET | `/api/inquiries` | List inquiries (with filters) |
| POST | `/api/inquiries` | Create inquiry |
| PUT | `/api/inquiries/[id]` | Reply to inquiry |
| GET | `/api/stats` | Visitor statistics & top entities |
| GET | `/api/banners` | Active promotional banners |
| GET/PUT | `/api/merchant/shop` | Merchant shop info / Update shop |
| GET/PUT | `/api/subscriptions` | List subscriptions / Update tier |
| POST | `/api/visit` | Track shop/category visit |
| GET | `/api/health` | Health check endpoint |

All list endpoints support pagination via `page` and `limit` query parameters. Responses use a standardized envelope format: `{ success: true, data: ..., meta?: { page, limit, total, totalPages } }`.

### Project Structure

```
my-project/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script with sample data
│   └── dev.db                 # SQLite database
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── banners/       # Banner management
│   │   │   ├── categories/    # Shop categories
│   │   │   ├── deals/         # Deals & promotions
│   │   │   ├── health/        # Health check
│   │   │   ├── inquiries/     # Customer inquiries
│   │   │   ├── mall/          # Mall information
│   │   │   ├── merchant/      # Merchant endpoints
│   │   │   ├── orders/        # Click & collect orders
│   │   │   ├── products/      # Product catalog
│   │   │   ├── shops/         # Shop directory
│   │   │   ├── stats/         # Visitor statistics
│   │   │   ├── subscriptions/ # Subscription management
│   │   │   └── visit/         # Visit tracking
│   │   ├── error.tsx          # Global error boundary
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Main SPA page
│   │   ├── sitemap.ts         # Dynamic sitemap
│   │   └── robots.ts          # Robots.txt
│   ├── components/
│   │   ├── mall/              # Mall-specific components
│   │   │   ├── admin-view.tsx       # Admin dashboard
│   │   │   ├── cart-sheet.tsx       # Shopping cart sidebar
│   │   │   ├── deal-card.tsx        # Deal display card
│   │   │   ├── deals-view.tsx       # Hot deals page
│   │   │   ├── directory-view.tsx   # Shop directory page
│   │   │   ├── error-boundary.tsx   # Error boundary wrapper
│   │   │   ├── floating-cart-button.tsx  # Floating cart FAB
│   │   │   ├── home-view.tsx        # Home page
│   │   │   ├── inquiry-dialog.tsx   # Inquiry form dialog
│   │   │   ├── login-card.tsx       # Reusable login card
│   │   │   ├── map-view.tsx         # Interactive mall map
│   │   │   ├── merchant-view.tsx    # Merchant portal
│   │   │   ├── motion-wrapper.tsx   # Reduced-motion wrapper
│   │   │   ├── navbar.tsx           # Navigation bar
│   │   │   ├── product-card.tsx     # Product display card
│   │   │   ├── shop-card.tsx        # Shop display card
│   │   │   ├── shop-detail-dialog.tsx  # Shop detail dialog
│   │   │   ├── skip-to-content.tsx  # Accessibility skip link
│   │   │   ├── stat-card.tsx        # Stat display card
│   │   │   ├── supermarket-view.tsx # Click & collect page
│   │   │   └── theme-toggle.tsx     # Dark/light mode toggle
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   │   └── use-reduced-motion.ts  # Reduced motion hook
│   └── lib/
│       ├── api-response.ts    # Standardized API response helpers
│       ├── auth.ts            # NextAuth configuration
│       ├── auth-middleware.ts  # Auth helper functions
│       ├── db.ts              # Prisma client instance
│       ├── error-handler.ts   # Unified error handling
│       ├── rate-limit.ts      # In-memory rate limiter
│       ├── store.ts           # Zustand state management
│       ├── types.ts           # TypeScript type definitions
│       └── validations.ts     # Zod validation schemas
├── .env.example               # Environment template
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Multi-stage Docker build
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies & scripts
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check health
docker-compose ps

# View logs
docker-compose logs -f app
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run migrations |
| `bun run db:seed` | Seed database with sample data |

### License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🇸🇦 العربية

### نظرة عامة

**المنصة الرقمية المتكاملة للمول** هي منصة رقمية شاملة تربط العملاء والتاجر ومديري المول في تجربة ويب حديثة وسلسة. مصممة لجراند مول، توفر دليلاً ذكياً للمحلات، وطلب أونلاين مع استلام من المحل، وعروض ترويجية ساخنة، وخريطة تفاعلية للمول، وبوابة التاجر، ولوحة تحكم المشرف — كل ذلك في تطبيق صفحة واحدة مع دعم كامل للغة العربية واتجاه RTL.

### التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| **الإطار** | Next.js 16 (App Router) |
| **اللغة** | TypeScript 5 |
| **التنسيق** | Tailwind CSS 4 + shadcn/ui |
| **قاعدة البيانات** | Prisma ORM مع SQLite |
| **إدارة الحالة** | Zustand (العميل) + TanStack Query (الخادم) |
| **المصادقة** | NextAuth.js v4 |
| **التحقق** | Zod |
| **الرسوم البيانية** | Recharts |
| **الحركات** | Framer Motion |
| **الأيقونات** | Lucide React |
| **السمات** | next-themes (فاتح/داكن) |
| **بيئة التشغيل** | Bun |

### المميزات

#### مميزات العميل
- **دليل ذكي** — تصفح وبحث جميع المحلات مع فلترة بالفئة والطابق وحالة الافتتاح
- **عروض ساخنة** — تصفح العروض المميزة والنشطة مع مؤقتات العد التنازلي
- **اطلب واستلم** — طلب منتجات السوبرماركت أونلاين واستلامها من المحل
- **خريطة تفاعلية** — خريطة مرئية للمول بطابق مع تلوين حسب الفئة
- **تفاصيل المحل** — معلومات كاملة عن المحل مع العروض والوسوم ومعلومات الاتصال
- **الاستفسارات** — إرسال أسئلة مباشرة لأي محل
- **ثنائي اللغة** — دعم كامل للعربية (RTL) والإنجليزية بتبديل بنقرة واحدة
- **الوضع الداكن** — تبديل تلقائي بين السمة الفاتحة والداكنة
- **إمكانية الوصول** — رابط تخطي للمحتوى، تسميات ARIA، دعم تقليل الحركة

#### مميزات التاجر
- **إدارة المحل** — تعديل تفاصيل المحل وساعات العمل ومعلومات الاتصال
- **إدارة العروض** — إنشاء وتقديم وتتبع العروض الترويجية
- **إدارة الطلبات** — معالجة طلبات الطلب والاستلام مع سير العمل
- **إدارة المنتجات** — إدارة مخزون وأسعار المنتجات (محلات السوبرماركت)
- **الرد على الاستفسارات** — الرد على استفسارات العملاء
- **لوحة نظرة عامة** — إحصائيات سريعة للمنتجات والعروض والاستفسارات والطلبات

#### مميزات المشرف
- **لوحة الإحصائيات** — مقاييس رئيسية مع رسوم بيانية تفاعلية
- **إدارة المحلات** — عرض وإدارة جميع المحلات مع البحث والفلترة
- **إدارة الاشتراكات** — ترقية/تخفيض مستويات اشتراك المحلات
- **موافقة العروض** — مراجعة والموافقة على العروض ورفضها وتمييزها
- **مراقبة الطلبات** — مراقبة جميع الطلبات مع فلترة الحالة
- **إدارة البانرات** — إنشاء وإدارة البانرات الإعلانية

### البدء

#### المتطلبات
- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 20 (لنشر Docker)

#### التثبيت

```bash
# استنساخ المستودع
git clone <رابط-المستودع>
cd my-project

# تثبيت التبعيات
bun install

# إعداد متغيرات البيئة
cp .env.example .env
# عدّل .env بقيمك (خاصة NEXTAUTH_SECRET)

# إعداد قاعدة البيانات
bun run db:push
bun run db:seed

# بدء خادم التطوير
bun run dev
```

سيكون التطبيق متاحاً على `http://localhost:3000`.

#### إعداد البيئة

انسخ `.env.example` إلى `.env` وقم بالتهيئة:

| المتغير | الوصف | الافتراضي |
|---------|-------|-----------|
| `DATABASE_URL` | مسار قاعدة بيانات SQLite | `file:./dev.db` |
| `NEXTAUTH_SECRET` | مفتاح سري لـ NextAuth | مطلوب |
| `NEXTAUTH_URL` | الرابط الأساسي لـ NextAuth | `http://localhost:3000` |

### نقاط API

| الطريقة | النقطة | الوصف |
|---------|--------|-------|
| GET | `/api/mall` | معلومات المول مع الأعداد |
| GET | `/api/shops` | قائمة المحلات (مع فلاتر وتقسيم) |
| GET | `/api/shops/[id]` | تفاصيل المحل مع المنتجات والعروض |
| GET | `/api/categories` | قائمة فئات المحلات |
| GET | `/api/products` | قائمة المنتجات (مع فلاتر وتقسيم) |
| GET | `/api/products/[id]` | تفاصيل المنتج |
| GET | `/api/deals` | قائمة العروض النشطة المعتمدة |
| GET/POST | `/api/deals/manage` | عرض/إنشاء العروض |
| PUT | `/api/deals/manage` | اعتماد/تمييز/رفض العرض |
| GET | `/api/orders` | قائمة الطلبات (مع فلاتر) |
| POST | `/api/orders` | إنشاء طلب اطلب واستلم |
| GET/PUT | `/api/orders/[id]` | تفاصيل الطلب/تحديث الحالة |
| GET | `/api/inquiries` | قائمة الاستفسارات |
| POST | `/api/inquiries` | إنشاء استفسار |
| PUT | `/api/inquiries/[id]` | الرد على استفسار |
| GET | `/api/stats` | إحصائيات الزوار |
| GET | `/api/banners` | البانرات الإعلانية النشطة |
| GET/PUT | `/api/merchant/shop` | معلومات محل التاجر/تحديث |
| GET/PUT | `/api/subscriptions` | الاشتراكات/تحديث المستوى |
| POST | `/api/visit` | تتبع زيارة |
| GET | `/api/health` | فحص صحة النظام |

جميع نقاط القوائم تدعم التقسيم عبر معاملي `page` و `limit`. تستجيب بصيغة موحدة: `{ success: true, data: ..., meta?: { page, limit, total, totalPages } }`.

### هيكل المشروع

```
my-project/
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   ├── seed.ts                # بيانات تجريبية
│   └── dev.db                 # قاعدة بيانات SQLite
├── src/
│   ├── app/
│   │   ├── api/               # مسارات API
│   │   ├── error.tsx          # حد الخطأ العام
│   │   ├── layout.tsx         # التخطيط الرئيسي
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── sitemap.ts         # خريطة الموقع
│   │   └── robots.ts          # ملف robots
│   ├── components/
│   │   ├── mall/              # مكونات المول
│   │   └── ui/                # مكونات shadcn/ui
│   ├── hooks/                 # خطافات مخصصة
│   └── lib/                   # أدوات مساعدة
├── .env.example               # قالب البيئة
├── docker-compose.yml         # إعدادات Docker
├── Dockerfile                 # بناء Docker متعدد المراحل
├── next.config.ts             # إعدادات Next.js
└── package.json               # التبعيات والسكريبتات
```

### النشر عبر Docker

```bash
# البناء والتشغيل مع Docker Compose
docker-compose up -d

# فحص الحالة
docker-compose ps

# عرض السجلات
docker-compose logs -f app
```

### السكريبتات المتاحة

| السكريبت | الوصف |
|----------|-------|
| `bun run dev` | بدء خادم التطوير |
| `bun run build` | بناء للإنتاج |
| `bun run start` | بدء خادم الإنتاج |
| `bun run lint` | تشغيل ESLint |
| `bun run db:push` | دفع المخطط لقاعدة البيانات |
| `bun run db:generate` | توليد عميل Prisma |
| `bun run db:migrate` | تشغيل الهجرات |
| `bun run db:seed` | تعبئة قاعدة البيانات ببيانات تجريبية |

### الرخصة

هذا المشروع مرخص بموجب رخصة MIT — راجع ملف [LICENSE](./LICENSE) للتفاصيل.
