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

        // If adding from a different shop, clear the cart first
        if (cartShopId && item.shopId && cartShopId !== item.shopId && cart.length > 0) {
          // Different shop - clear cart and start fresh
          set({ cart: [item], cartShopId: item.shopId || null })
          return
        }

        const existingItem = cart.find((i) => i.productId === item.productId)

        if (existingItem) {
          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ cart: [...cart, item], cartShopId: cartShopId || item.shopId || null })
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
        if (quantity <= 0) {
          const newCart = cart.filter((i) => i.productId !== productId)
          set({
            cart: newCart,
            cartShopId: newCart.length === 0 ? null : get().cartShopId,
          })
        } else {
          set({
            cart: cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          })
        }
      },

      clearCart: () => set({ cart: [], cartShopId: null }),

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
      // Only persist cart and language
      partialize: (state) => ({
        cart: state.cart,
        cartShopId: state.cartShopId,
        language: state.language,
      }),
    }
  )
)
