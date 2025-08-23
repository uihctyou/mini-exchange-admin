# Mini Exchange Admin

> Administrative panel for **mini-exchange** cryptocurrency exchange. Built with **Next.js + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + next-intl** for data management through **mini-exchange-backend** REST APIs.

## Project Status

- ✅ **Project Setup**: Complete Next.js 14 framework with TypeScript
- ✅ **UI Components**: shadcn/ui components with Tailwind CSS
- ✅ **Authentication**: Mock login system with role-based access control
- ✅ **Internationalization**: English and Traditional Chinese support
- ✅ **Route Protection**: Middleware-based authentication guards
- ✅ **Dashboard**: Basic dashboard with statistics and system status
- 🚧 **Backend Integration**: Ready for API integration (localhost:9977)
- 📋 **User Management**: Planned
- 📋 **Trading Features**: Planned

## Demo Credentials

The application includes demo accounts for testing:

- **Admin**: `admin@example.com` / `admin123`
- **Operator**: `operator@example.com` / `operator123`
- **Auditor**: `auditor@example.com` / `auditor123`

---

## Tech Stack

* **Framework**: Next.js (App Router) + TypeScript
* **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
* **State & Data**: TanStack Query (data fetching/caching) + Zustand (global state)
* **i18n**: next-intl with `app/[locale]` routing structure
* **Forms**: react-hook-form + zod schema validation
* **Authentication**: Next.js Route Handlers as BFF proxy with JWT tokens
* **Charts**: recharts (optional)
* **Development**: ESLint, Prettier, Jest (unit), Playwright (E2E)

> **Dependencies**: **mini-exchange-backend** (Spring Boot with JWT authentication).

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 3. Development mode
pnpm dev

# 4. Build for production
pnpm build && pnpm start
```

## Project Structure

```
mini-exchange-admin/
├── app/
│   ├── [locale]/               # i18n routes (en, zh-TW)
│   │   ├── (auth)/
│   │   │   └── login/          # Login page
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── users/          # User management
│   │   │   ├── orders/         # Order management
│   │   │   ├── markets/        # Market management
│   │   │   ├── risk/           # Risk management
│   │   │   └── settings/       # System settings
│   │   └── layout.tsx          # Locale layout
│   ├── api/                    # BFF Route Handlers
│   │   └── auth/               # Authentication APIs
│   └── middleware.ts           # Route protection
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── ...                     # Custom components
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   ├── http.ts                 # HTTP client
│   ├── rbac.ts                 # Role-based access control
│   └── utils.ts                # Utility functions
├── hooks/
│   ├── use-auth.ts             # Authentication hook
│   └── queries/                # TanStack Query hooks
└── locales/                    # Internationalization
    ├── en/                     # English translations
    └── zh-TW/                  # Traditional Chinese
```

## Authentication & Authorization

### BFF Mode (Recommended)
- JWT tokens stored in secure HTTP-only cookies
- Next.js API routes proxy requests to backend
- Better security with XSS protection

### Direct Mode (Development)
- Direct API calls to backend
- Tokens stored in localStorage/sessionStorage
- Simpler setup but less secure

### Role-Based Access Control
- **Super Admin**: Full system access
- **Admin**: Most administrative functions
- **Operator**: Daily operations
- **Auditor**: Read-only access for auditing
- **Viewer**: Limited read-only access

## Internationalization

Built-in support for multiple languages using next-intl:
- English (en) - Default
- Traditional Chinese (zh-TW)

Routes: `/en/...`, `/zh-TW/...`

## Environment Variables

```bash
# Development server port
PORT=3011

# Authentication mode: BFF or DIRECT
AUTH_MODE=BFF

# Backend API base URL
EXCHANGE_API_BASE_URL=http://localhost:9977

# Cookie settings (BFF mode)
AUTH_COOKIE_NAME=access_token
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=Strict
AUTH_COOKIE_MAXAGE=900

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,zh-TW
```

## UI Components

- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Data tables** with filtering, sorting, pagination
- **Forms** with react-hook-form and zod validation
- **Responsive layout** with sidebar and header

## Security Features

- ✅ **Client-Side Authentication**: JWT tokens with secure storage
- ✅ **Route Protection**: Middleware-based access control
- ✅ **RBAC**: Role-based access control with 5 user levels
- ✅ **Input Validation**: Zod schema validation for forms
- ✅ **XSS Protection**: Secure token handling
- 🚧 **CORS Protection**: Ready for backend integration
- 🚧 **Audit Logging**: Planned for user operations

## Architecture

### Authentication Flow
1. **Login**: User submits credentials
2. **Token Storage**: JWT stored in localStorage/sessionStorage
3. **Route Guard**: Middleware checks authentication on protected routes
4. **Auto Redirect**: Unauthenticated users → login, authenticated users → dashboard

### File Structure
```
lib/
├── auth.ts          # Client-side authentication utilities
├── auth-server.ts   # Server-side authentication (API routes only)
├── http.ts          # HTTP client with auth integration
├── rbac.ts          # Role-based access control definitions
└── env.ts           # Environment configuration
```

## Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm test         # Run tests
```

## Roadmap

- [ ] User and role management (CRUD operations)
- [ ] Order management (search, filter, export)
- [ ] Trading pair and fee configuration
- [ ] Risk management workflows (KYC/AML)
- [ ] Real-time dashboard with metrics
- [ ] Complete internationalization
- [ ] End-to-end testing with Playwright

## Troubleshooting

### Common Issues

1. **Port 3011 already in use**
   ```bash
   lsof -ti:3011 | xargs kill -9
   pnpm dev
   ```

2. **next/headers error in client components**
   - Use `lib/auth.ts` for client-side authentication
   - Use `lib/auth-server.ts` only in API routes

3. **Login not working**
   - Check demo credentials are entered correctly
   - Verify browser localStorage/sessionStorage for tokens
   - Check browser console for errors

4. **Middleware redirect loops**
   - Clear browser storage and cookies
   - Restart development server

### Backend Integration

To connect with real backend API:

1. Update `.env.local` with your backend URL
2. Replace mock login in `hooks/use-auth.ts` with real API calls
3. Configure CORS in your backend for `http://localhost:3011`
4. Update authentication middleware to validate real JWT tokens

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
