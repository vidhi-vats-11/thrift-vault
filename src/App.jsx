import { useMemo, useState } from "react"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import CategoryStrip from "./components/CategoryStrip"
import ProductGrid from "./components/ProductGrid"
import ProductModal from "./components/ProductModal"
import Testimonials from "./components/Testimonials"
import Newsletter from "./components/Newsletter"
import Footer from "./components/Footer"
import CartDrawer from "./components/CartDrawer"
import WishlistDrawer from "./components/WishlistDrawer"
import Toast from "./components/Toast"
import { products } from "./data/products"

function ShopContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const newDrops = useMemo(
    () => products.filter((p) => p.tag === "NEW DROP" || p.tag === "TRENDING"),
    []
  )

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [searchTerm, activeCategory])

  return (
    <div className="min-h-screen bg-ink">
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main>
        <Hero />

        <section id="new-drops" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-1 font-display text-sm font-bold uppercase tracking-widest text-lime">
                  Fresh In
                </p>
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  This Week's New Drops
                </h2>
              </div>
              <a
                href="#shop"
                className="hidden cursor-pointer text-sm font-semibold text-white/50 hover:text-lime sm:block"
              >
                View all →
              </a>
            </div>
            <ProductGrid products={newDrops} onQuickView={setQuickViewProduct} />
          </div>
        </section>

        <section id="shop" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="mb-1 font-display text-sm font-bold uppercase tracking-widest text-pink">
                The Vault
              </p>
              <h2 className="mb-5 font-display text-2xl font-bold text-white sm:text-3xl">
                Shop All Pieces
              </h2>
              <CategoryStrip active={activeCategory} onChange={setActiveCategory} />
            </div>
            <ProductGrid products={filteredProducts} onQuickView={setQuickViewProduct} />
          </div>
        </section>

        <Testimonials />
        <Newsletter />
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <Toast />
      <ProductModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <ShopContent />
    </CartProvider>
  )
}
