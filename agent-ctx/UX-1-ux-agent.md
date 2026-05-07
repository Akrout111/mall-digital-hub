# UX-1 Work Record - Dark Mode, Error Boundaries, Accessibility, Reduced Motion

## Task Summary
Added dark mode with next-themes, error boundaries, accessibility improvements, reduced-motion support, and cart improvements (wishlist + max quantity).

## Changes Made

### 1. Dark Mode with next-themes
- **`src/app/layout.tsx`**: Added `ThemeProvider` from next-themes wrapping children with `attribute="class"`, `defaultTheme="system"`, `enableSystem`. Changed `lang="en"` to `lang="ar"`, added `suppressHydrationWarning` to body. Updated metadata to Arabic mall-themed.
- **`src/components/mall/theme-toggle.tsx`**: New component with Sun/Moon icon toggle, uses `useTheme()` hook, bilingual aria-label.
- **`src/components/mall/navbar.tsx`**: Added ThemeToggle component next to language toggle button.

### 2. Error Boundaries
- **`src/app/error.tsx`**: Global error boundary page with Arabic error message, retry and home buttons, AlertCircle icon.
- **`src/components/mall/error-boundary.tsx`**: Reusable class-based ErrorBoundary component with fallback UI and retry button. Accepts optional custom fallback prop.

### 3. Accessibility Improvements
- **`src/components/mall/skip-to-content.tsx`**: Skip-to-content link, bilingual, uses sr-only/focus:not-sr-only pattern.
- **`src/components/mall/navbar.tsx`**:
  - Added `role="navigation"` and `aria-label` to desktop nav
  - Added `aria-current="page"` to active nav item
  - Added `aria-expanded` on mobile menu button
  - Added `aria-label` on all icon-only buttons (language, merchant, admin)
- **`src/app/page.tsx`**: Added `<SkipToContent />` at top, `id="main-content"` and `role="main"` on main element.

### 4. Reduced Motion Support
- **`src/hooks/use-reduced-motion.ts`**: Hook using `useSyncExternalStore` for SSR-safe reduced motion detection.
- **`src/components/mall/motion-wrapper.tsx`**: MotionDiv component that renders plain div when reduced motion is preferred, otherwise renders framer-motion motion.div.
- **`src/app/globals.css`**: Added `@media (prefers-reduced-motion: reduce)` rule that disables all animations and transitions.

### 5. Cart Improvements (Zustand Store)
- **`src/lib/store.ts`**:
  - Added `wishlist: string[]` state (product IDs)
  - Added `addToWishlist`, `removeFromWishlist`, `isInWishlist` actions
  - Added `MAX_QUANTITY = 99` limit in `addToCart` and `updateCartQuantity`
  - Added `wishlist` to persist partialize function

### 6. Page.tsx ErrorBoundary Wrapping
- Each view is now wrapped with `<ErrorBoundary>`: HomeView, DirectoryView, DealsView, SupermarketView, MapView, MerchantView, AdminView.

## Lint Result
- All files pass ESLint with 0 errors.
