# DzMarket — Product Request Marketplace (Algeria)

A lightweight MVP web platform where users in Algeria can request products that are difficult to find locally, and intermediaries abroad can offer to source and ship them.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Next.js Server Actions, PostgreSQL, Prisma ORM
- **Auth:** JWT-based session cookies, bcrypt password hashing
- **UI:** Custom shadcn/ui-inspired components (no external UI lib dependency)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your Supabase PostgreSQL connection strings and JWT secret.

- `DATABASE_URL`: use the Supabase pooler URL (`pooler.supabase.com:6543`) for app runtime on Vercel.
- `DIRECT_URL`: use the direct database URL (`db.<project-ref>.supabase.co:5432`) for Prisma CLI operations.

Optional email notifications (Resend):

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=notifications@your-domain.com
APP_BASE_URL=http://localhost:3000
```

If these variables are missing, the app falls back to mock email logs in the server console.

### 3. Set up the database
```bash
npx prisma db push
npx prisma generate
```

If you are using Supabase, create a PostgreSQL database there first, then set both `DATABASE_URL` (pooler) and `DIRECT_URL` (direct).

Optional admin moderation test seed:

```bash
npm run db:seed:moderation
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    actions/          # Server Actions (auth, requests, offers, shipments)
    (dashboard)/      # Dashboard routes with shared layout
      client/
        requests/     # Client: my requests + create form
        offers/       # Client: received offers
      agent-buyer/
        requests/     # Agent buyer: browse public requests
        offers/       # Agent buyer: my submitted offers
        shipments/    # Agent buyer: manage shipments
    request/[id]/     # Public request detail page
    login/            # Login page
    register/         # Registration page
    page.tsx          # Landing page
  components/
    ui/               # Reusable UI primitives (Button, Card, Input, etc.)
    requests/         # RequestCard, StatusBadge, CreateRequestForm
    offers/           # OfferCard, SubmitOfferForm
    layout/           # Header, DashboardLayout
  lib/
    prisma.ts         # Prisma client singleton
    auth.ts           # Auth utilities (JWT, sessions, guards)
    utils.ts          # Helpers (cn, formatPrice, formatDate)
  types/
    index.ts          # Shared TypeScript types
prisma/
  schema.prisma       # Database schema
```

## Order Status Flow

```
REQUEST_CREATED
    ↓
OFFERS_RECEIVED
    ↓
OFFER_ACCEPTED
    ↓
PAYMENT_PENDING
    ↓
PURCHASE_IN_PROGRESS
    ↓
SHIPPED
    ↓
DELIVERED
    ↓
PAYMENT_RELEASED
```

## User Roles

### Client
- Create product requests
- View offers
- Accept an offer
- Track deliveries
- Confirm receipt

### Agent buyer
- Browse public requests
- Submit offers
- Manage shipments (mark shipped / delivered)

## Important Notes

- **No real payment integration** is included in this MVP. The `Transaction` model tracks payment status manually.
- **No image upload** is implemented; images are provided as URLs.
- **No email verification** — simple email/password auth.
- **Transactional notifications** are supported via Resend or mock logs.
- **No prohibited products** validation is enforced at the app level; this should be added in production (medications, weapons, regulated goods).
- **Mobile-first** responsive design.
