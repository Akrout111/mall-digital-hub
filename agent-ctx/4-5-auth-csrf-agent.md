# Task 4-5: Auth Middleware & CSRF Protection Agent

## Work Record

### Task: Apply auth middleware and CSRF protection to all API routes

### Changes Made:

#### 1. Created CSRF protection helper (`/src/lib/csrf.ts`)
- `validateOrigin(request)` - Validates request origin matches host for CSRF protection
- `validateMutatingRequest(request)` - Combined CSRF + auth check for mutating endpoints
- Relies on SameSite cookies (NextAuth default) + origin checking as primary CSRF defense

#### 2. Added auth checks to API routes:

| Route | Method | Auth Check | Additional |
|-------|--------|------------|------------|
| `/api/deals/manage` | GET | `requireAdmin()` | Only admins see all deals including unapproved |
| `/api/deals/manage` | POST | `requireMerchant()` | Only merchants can create deals |
| `/api/deals/manage` | PUT | `requireAdmin()` | Only admins can approve/reject/feature deals |
| `/api/subscriptions` | PUT | `requireAdmin()` | Only admins can change subscription tiers |
| `/api/merchant/shop` | GET | `requireAuth()` | Must be logged in to view shop details |
| `/api/merchant/shop` | PUT | `requireMerchant()` + owner verify | Only shop owner can update their shop |
| `/api/orders/[id]` | PUT | `requireAuth()` + merchant/admin verify | Must be shop merchant or admin |
| `/api/stats` | GET | `requireAdmin()` | Only admins can see stats |
| `/api/banners` | POST | `requireAdmin()` | New POST handler with `createBannerSchema` |
| `/api/inquiries/[id]` | PUT | `requireAuth()` | Must be logged in to reply to inquiries |
| `/api/orders` | POST | `requireAuth()` | Must be logged in to create orders |
| `/api/inquiries` | POST | `requireAuth()` | Must be logged in to create inquiries |

#### 3. Added Zod validation to routes that had manual validation:

| Route | Schema Applied |
|-------|----------------|
| `/api/inquiries` POST | `createInquirySchema` |
| `/api/inquiries/[id]` PUT | `replyInquirySchema` |
| `/api/visit` POST | `trackVisitSchema` |
| `/api/subscriptions` PUT | `updateSubscriptionSchema` |
| `/api/merchant/shop` PUT | `updateShopSchema` |
| `/api/banners` POST | `createBannerSchema` (new endpoint) |

#### 4. Consistent response format:
All routes now use `successResponse()`, `errorResponse()`, `handleApiError()` from api-response.ts, and `unauthorizedResponse()`, `forbiddenResponse()` for auth failures.

### Files Created:
- `/home/z/my-project/src/lib/csrf.ts`

### Files Modified:
- `/home/z/my-project/src/app/api/deals/manage/route.ts`
- `/home/z/my-project/src/app/api/subscriptions/route.ts`
- `/home/z/my-project/src/app/api/merchant/shop/route.ts`
- `/home/z/my-project/src/app/api/orders/[id]/route.ts`
- `/home/z/my-project/src/app/api/stats/route.ts`
- `/home/z/my-project/src/app/api/banners/route.ts`
- `/home/z/my-project/src/app/api/inquiries/[id]/route.ts`
- `/home/z/my-project/src/app/api/orders/route.ts`
- `/home/z/my-project/src/app/api/inquiries/route.ts`
- `/home/z/my-project/src/app/api/visit/route.ts`

### Quality:
- ESLint passes with 0 errors
- Dev server running without errors
- Pre-existing TS error in auth.ts (line 46) unrelated to this task
- All existing functionality preserved
