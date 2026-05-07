import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ TYPES ============

export type View = 'home' | 'directory' | 'deals' | 'supermarket' | 'map' | 'merchant' | 'admin'

export interface CartItem {
  productId: string
  name: string
  nameAr?: string
  price: number
  quantity: number
  image?: string
  unit: string
  shopId?: string
}

interface MallStore {
  // Navigation state
  currentView: View
  selectedShopId: string | null
  selectedCategory: string | null
  searchQuery: string

  // Cart state (click & collect)
  cart: CartItem[]
  cartShopId: string | null

  // Wishlist state
  wishlist: string[] // product IDs

  // Auth state
  isMerchantLoggedIn: boolean
  merchantShopId: string | null
  isAdminLoggedIn: boolean

  // Language
  language: 'ar' | 'en'

  // Navigation actions
  setView: (view: View) => void
  setSelectedShop: (id: string | null) => void
  setSelectedCategory: (cat: string | null) => void
  setSearchQuery: (q: string) => void

  // Cart actions
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Wishlist actions
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean

  // Language action
  setLanguage: (lang: 'ar' | 'en') => void

  // Auth actions
  loginMerchant: (shopId: string) => void
  logoutMerchant: () => void
  loginAdmin: () => void
  logoutAdmin: () => void
}

export const useMallStore = create<MallStore>()(
  persist(
    (set, get) => ({
      // Navigation state
      currentView: 'home',
      selectedShopId: null,
      selectedCategory: null,
      searchQuery: '',

      // Cart state
      cart: [],
      cartShopId: null,

      // Wishlist state
      wishlist: [],

      // Auth state
      isMerchantLoggedIn: false,
      merchantShopId: null,
      isAdminLoggedIn: false,

      // Language
      language: 'ar',

      // Navigation actions
      setView: (view) => set({ currentView: view }),

      setSelectedShop: (id) => set({ selectedShopId: id }),

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      setSearchQuery: (q) => set({ searchQuery: q }),

      // Cart actions
      addToCart: (item) => {
        const { cart, cartShopId } = get()
        const MAX_QUANTITY = 99

        // If adding from a different shop, clear the cart first
        if (cartShopId && item.shopId && cartShopId !== item.shopId && cart.length > 0) {
          set({ cart: [{ ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }], cartShopId: item.shopId || null })
          return
        }

        const existingItem = cart.find((i) => i.productId === item.productId)

        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + item.quantity, MAX_QUANTITY)
          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: newQuantity }
                : i
            ),
          })
        } else {
          set({ cart: [...cart, { ...item, quantity: Math.min(item.quantity, MAX_QUANTITY) }], cartShopId: cartShopId || item.shopId || null })
        }
      },

      removeFromCart: (productId) => {
        const { cart } = get()
        const newCart = cart.filter((i) => i.productId !== productId)
        set({
          cart: newCart,
          // Clear cartShopId if cart is empty
          cartShopId: newCart.length === 0 ? null : get().cartShopId,
        })
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get()
        const MAX_QUANTITY = 99
        const clampedQuantity = Math.min(quantity, MAX_QUANTITY)
        if (clampedQuantity <= 0) {
          const newCart = cart.filter((i) => i.productId !== productId)
          set({
            cart: newCart,
            cartShopId: newCart.length === 0 ? null : get().cartShopId,
          })
        } else {
          set({
            cart: cart.map((i) =>
              i.productId === productId ? { ...i, quantity: clampedQuantity } : i
            ),
          })
        }
      },

      clearCart: () => set({ cart: [], cartShopId: null }),

      // Wishlist actions
      addToWishlist: (productId) => {
        const { wishlist } = get()
        if (!wishlist.includes(productId)) {
          set({ wishlist: [...wishlist, productId] })
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get()
        set({ wishlist: wishlist.filter((id) => id !== productId) })
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId)
      },

      // Language action
      setLanguage: (lang) => set({ language: lang }),

      // Auth actions
      loginMerchant: (shopId) =>
        set({ isMerchantLoggedIn: true, merchantShopId: shopId }),

      logoutMerchant: () =>
        set({ isMerchantLoggedIn: false, merchantShopId: null }),

      loginAdmin: () => set({ isAdminLoggedIn: true }),

      logoutAdmin: () => set({ isAdminLoggedIn: false }),
    }),
    {
      name: 'mall-digital-hub-storage',
      // Only persist cart, wishlist, and language
      partialize: (state) => ({
        cart: state.cart,
        cartShopId: state.cartShopId,
        wishlist: state.wishlist,
        language: state.language,
      }),
    }
  )
)
