import { useState } from "react"
import { Mail, ArrowRight } from "lucide-react"
import { useCart } from "../context/CartContext"

export default function Newsletter() {
  const { pushToast } = useCart()
  const [email, setEmail] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      pushToast("Enter a valid email to join the drop list", "wishlist")
      return
    }
    pushToast(`You're on the list, ${email.split("@")[0]}! Watch for Friday drops.`, "success")
    setEmail("")
  }

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="grid place-items-center">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-lime/15 text-lime">
            <Mail size={22} />
          </span>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Get first dibs on new drops
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/50">
            10% off your first order. No spam, just rare finds before they're gone.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full cursor-text rounded-full border border-line bg-surface px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-lime"
            />
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-lime px-6 py-3 text-sm font-bold text-ink shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              Join <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
