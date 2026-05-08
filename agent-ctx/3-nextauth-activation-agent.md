# Task 3 - NextAuth Activation Agent

## Summary
Activated NextAuth authentication in admin-view.tsx and merchant-view.tsx, replacing insecure Zustand boolean auth with real credential verification.

## Changes Made

### Files Created
1. `/home/z/my-project/src/types/next-auth.d.ts` - Type augmentation for NextAuth session (id, role)
2. `/home/z/my-project/src/components/providers.tsx` - SessionProvider wrapper component

### Files Modified
1. `/home/z/my-project/src/app/layout.tsx` - Added Providers (SessionProvider) wrapper
2. `/home/z/my-project/src/lib/store.ts` - Removed auth state, added setMerchantShopId
3. `/home/z/my-project/src/components/mall/login-card.tsx` - Complete rewrite with NextAuth signIn
4. `/home/z/my-project/src/components/mall/admin-view.tsx` - Replaced Zustand auth with NextAuth
5. `/home/z/my-project/src/components/mall/merchant-view.tsx` - Replaced Zustand auth with NextAuth

## Key Decisions
- Used `signIn('credentials', { redirect: false })` for client-side login
- Kept `merchantShopId` in Zustand for shop-specific operations
- Added `loginDone` local state in MerchantView to track shop selection
- Handled API envelope format (`res?.data ?? res`) in merchant shop fetching
- Session checking includes role verification (`session.user.role === 'admin'`/`'merchant'`)

## Test Credentials
- Admin: admin@mall.com / admin123
- Merchant 1: merchant1@mall.com / merchant123
- Merchant 2: merchant2@mall.com / merchant123
