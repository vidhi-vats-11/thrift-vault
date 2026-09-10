# Thrift Vault

A production e-commerce platform for one-of-one secondhand streetwear — where every item has a stock
of exactly one, so the interesting problem is making sure two people can never buy the same piece.

**Live demo:** [thriftvaultstore.vercel.app](https://thriftvaultstore.vercel.app)

> The storefront runs as a demo: payments are simulated, but accounts, stock and orders are real.

---

## Stack

| Layer | Technology |
|---|---|
| API | Node.js, Express 4 |
| Database | PostgreSQL via Prisma ORM |
| Cache / rate limiting | Redis (ioredis) |
| Auth | JWT access + refresh tokens, bcrypt |
| Validation | Zod |
| Security | Helmet, CORS allowlist, Redis-backed rate limiting |
| Storage | Vercel Blob (falls back to local disk in development) |
| Frontend | React 18, Vite, Tailwind CSS, Lucide icons |
| Hosting | Vercel |

## Architecture

The API is organised by domain rather than by technical layer. Each module owns its routes, its
service logic, and its serialisation:

```
Backend/src
├── modules/
│   ├── auth/         registration, login, refresh-token rotation
│   ├── catalog/      products, categories, sizes, images
│   ├── cart/         cart items, quantity rules
│   ├── wishlist/     saved items
│   ├── order/        checkout, stock reservation, order lifecycle
│   ├── payment/      gateway abstraction + webhook handling
│   ├── address/      shipping addresses
│   ├── admin/        catalog and order administration
│   ├── internal/     cron-triggered maintenance endpoints
│   └── newsletter/   subscriptions
├── middleware/       auth, validation, rate limiting, request context, error handling
├── jobs/             releaseExpiredOrders — the inventory sweep
├── lib/              logger, errors, storage, email
└── config/           env, prisma, redis
```

The Prisma schema models 14 entities: `User`, `RefreshToken`, `Address`, `Category`, `Product`,
`ProductImage`, `ProductSize`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Payment`,
`Review`, `NewsletterSubscriber`.

## Two decisions worth explaining

**Stock reservation, not stock decrement.** Because every product is unique, decrementing stock at
payment confirmation leaves a window where two customers can both be mid-checkout on the same item.
Instead, checkout *reserves* the item and starts a hold (`ORDER_HOLD_MINUTES`, default 15). A
background job — `jobs/releaseExpiredOrders.js`, run daily in production by Vercel Cron against
`/api/v1/internal/sweep` — sweeps
orders whose hold has lapsed and returns their inventory to the catalog. An abandoned checkout
therefore frees the item automatically instead of parking it forever.

**Payments behind an interface.** `modules/payment/gateway.js` defines the contract; `gateways/
mock.gateway.js` implements it for the demo. Swapping in a real provider means adding one file and
changing `PAYMENT_GATEWAY` — no order logic is touched. Webhooks are verified against
`PAYMENT_WEBHOOK_SECRET` so payment state is driven by the gateway, not by the client.

## Running locally

**Requirements:** Node 18+, a PostgreSQL database, optionally Redis.

```bash
# 1. Backend
cd Backend
npm install
cp .env.example .env        # then fill in the values below
npx prisma migrate dev
npm run seed
npm run dev                 # http://localhost:4000

# 2. Frontend (separate terminal)
cd Frontend
npm install
npm run dev                 # http://localhost:5173
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | yes | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | yes | Signs refresh tokens |
| `REDIS_URL` | no | Enables Redis-backed rate limiting |
| `CORS_ORIGINS` | no | Comma-separated allowlist (default `http://localhost:5173`) |
| `JWT_ACCESS_TTL` | no | Access token lifetime (default `15m`) |
| `JWT_REFRESH_TTL_DAYS` | no | Refresh token lifetime in days (default `30`) |
| `ORDER_HOLD_MINUTES` | no | How long checkout reserves stock (default `15`) |
| `PAYMENT_GATEWAY` | no | `mock` by default |
| `PAYMENT_WEBHOOK_SECRET` | no | Verifies incoming payment webhooks |
| `BLOB_READ_WRITE_TOKEN` | no | Set by Vercel Blob; switches uploads from disk to Blob |

## Features

- Email/password auth with refresh-token rotation and revocation
- Product catalog with categories, per-size stock, and multiple images
- Cart and wishlist tied to the account, surviving logout
- Checkout with inventory reservation and automatic release of expired holds
- Order history and status tracking
- Admin routes for managing catalog and orders
- Product reviews and newsletter signup
- Rate limiting, request validation and structured error responses across every route

---

Built by [Vidhi Vats](https://github.com/vidhi-vats-11) ·
[Portfolio](https://vidhivats-portfolio.vercel.app) ·
[LinkedIn](https://linkedin.com/in/vidhivats-)
