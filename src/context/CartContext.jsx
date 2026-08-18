import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"

const CartContext = createContext(null)
const STORAGE_KEY = "thrift-vault-cart"
const WISHLIST_STORAGE_KEY = "thrift-vault-wishlist"

// A cart "line" is unique per product+size, so the same tee in S and M are separate rows
function lineKey(productId, size) {
  return `${productId}__${size}`
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isWishlistOpen, setWishlistOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, variant = "success") => {
      const id = crypto.randomUUID()
      setToasts((t) => [...t, { id, message, variant }])
      setTimeout(() => dismissToast(id), 2800)
    },
    [dismissToast]
  )

  const addToCart = useCallback(
    (product, size, qty = 1) => {
      setLines((prev) => {
        const key = lineKey(product.id, size)
        const existing = prev.find((l) => l.key === key)
        if (existing) {
          return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            name: product.name,
            brand: product.brand,
            image: product.image,
            price: product.price,
            size,
            qty,
          },
        ]
      })
      pushToast(`${product.name} (${size}) added to cart`, "cart")
    },
    [pushToast]
  )

  const removeFromCart = useCallback((key) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) return
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty } : l)))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id)
        pushToast(
          exists ? `Removed ${product.name} from wishlist` : `Saved ${product.name} to wishlist`,
          "wishlist"
        )
        return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product]
      })
    },
    [pushToast]
  )

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const wishlistIds = useMemo(() => wishlist.map((p) => p.id), [wishlist])
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.price, 0), [lines])

  const value = {
    lines,
    itemCount,
    subtotal,
    isCartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    wishlist,
    wishlistIds,
    toggleWishlist,
    removeFromWishlist,
    isWishlistOpen,
    setWishlistOpen,
    toasts,
    pushToast,
    dismissToast,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside a CartProvider")
  return ctx
}
