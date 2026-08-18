import { CheckCircle2, ShoppingBag, Heart, X } from "lucide-react"
import { useCart } from "../context/CartContext"

const ICONS = {
  success: CheckCircle2,
  cart: ShoppingBag,
  wishlist: Heart,
}

const ACCENTS = {
  success: "border-lime/50 text-lime",
  cart: "border-lime/50 text-lime",
  wishlist: "border-pink/50 text-pink",
}

export default function Toast() {
  const { toasts, dismissToast } = useCart()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant] ?? CheckCircle2
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg animate-[fadeIn_0.2s_ease-out] ${ACCENTS[toast.variant] ?? ACCENTS.success}`}
          >
            <Icon size={18} className="shrink-0" />
            <p className="flex-1 text-sm font-medium text-white/90">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
