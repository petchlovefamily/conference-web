# Conference Web

Public-facing portal for the Conference Management Platform. Built with **Next.js 16**, **React 19**, **TailwindCSS 4**, and **Stripe**.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Conference API running at http://localhost:8080

### Local Development
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start dev server (runs on port 3001 via Docker, or 3000 locally)
npm run dev
```

### With Docker
```bash
docker compose up --build
```

### Access
- **Public Web:** http://localhost:3001

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TailwindCSS 4 | Utility-first CSS |
| TanStack Query | Server state management |
| Zustand | Client state management |
| Radix UI | Accessible primitives |
| react-hook-form | Form handling |
| Zod | Form validation |
| Stripe.js | Client-side payments |
| Vitest | Unit testing |

## 📁 Project Structure

```
src/
├── __tests__/        # Unit tests
├── app/
│   ├── (auth)/       # Login & signup
│   ├── events/       # Event browsing
│   ├── register/     # Registration flow
│   ├── checkout/     # Ticket checkout
│   ├── payment/      # Payment processing
│   ├── agenda/       # Event agenda
│   ├── schedule/     # Session schedule
│   └── contact/      # Contact page
├── components/
│   ├── ui/           # Base UI components
│   ├── home/         # Homepage sections
│   ├── events/       # Event components
│   ├── layout/       # Layout components
│   └── shared/       # Shared utilities
├── config/           # App configuration
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── lib/              # API client, services, utils
└── types/            # TypeScript types
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |

## 📝 License
Proprietary software. All rights reserved.
