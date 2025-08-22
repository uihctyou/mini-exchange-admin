# Mini Exchange Admin - Development Guide

This document provides setup instructions and development guidelines for the mini-exchange-admin project.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (recommended package manager)
- Git

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Install additional UI components (optional):**
   ```bash
   # Install shadcn/ui CLI globally
   npm install -g shadcn-ui

   # Add additional components as needed
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add toast
   npx shadcn-ui@latest add tabs
   npx shadcn-ui@latest add switch
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add checkbox
   npx shadcn-ui@latest add label
   npx shadcn-ui@latest add separator
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

```
mini-exchange-admin/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── (auth)/              # Authentication routes
│   │   │   └── login/           # Login page
│   │   ├── (dashboard)/         # Dashboard routes
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── users/           # User management
│   │   │   ├── orders/          # Order management
│   │   │   ├── markets/         # Market management
│   │   │   ├── risk/            # Risk management
│   │   │   └── settings/        # Settings
│   │   └── layout.tsx           # Locale layout
│   ├── api/                     # API routes (BFF mode)
│   │   └── auth/                # Authentication APIs
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Root redirect
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── data-table/              # Data table components
│   ├── forms/                   # Form components
│   └── layout/                  # Layout components
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   └── queries/                # TanStack Query hooks
├── lib/                         # Utility libraries
│   ├── auth.ts                 # Authentication utilities
│   ├── http.ts                 # HTTP client
│   ├── rbac.ts                 # Role-based access control
│   ├── env.ts                  # Environment configuration
│   └── utils.ts                # General utilities
├── locales/                     # Internationalization
│   ├── en/                     # English translations
│   └── zh-TW/                  # Traditional Chinese translations
└── scripts/                     # Build and setup scripts
    └── postinstall.sh          # Post-install setup
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env.local`:

```bash
# Authentication mode (BFF recommended for production)
AUTH_MODE=BFF

# Backend API URL
EXCHANGE_API_BASE_URL=http://localhost:8080

# Cookie settings (BFF mode)
AUTH_COOKIE_NAME=access_token
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=Strict
AUTH_COOKIE_MAXAGE=900

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,zh-TW
```

### Authentication Modes

1. **BFF (Backend-for-Frontend) Mode** - Recommended
   - Tokens stored in secure HTTP-only cookies
   - Next.js API routes proxy requests to backend
   - Better security (XSS protection)

2. **Direct Mode** - For development/testing
   - Direct API calls to backend
   - Tokens stored in localStorage/sessionStorage
   - Simpler setup but less secure

## 🎨 UI Components

The project uses **shadcn/ui** components built on top of **Radix UI** and **Tailwind CSS**.

### Adding New Components

```bash
npx shadcn-ui@latest add [component-name]
```

### Component Examples

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 🌍 Internationalization

Using **next-intl** for i18n support.

### Adding Translations

1. Add translations to `locales/[locale]/common.json`
2. Use in components:

```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations();
  return <h1>{t('dashboard.title')}</h1>;
}
```

### Supported Locales

- `en` - English (default)
- `zh-TW` - Traditional Chinese

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

Available roles:
- **Super Admin** - Full system access
- **Admin** - Most admin functions
- **Operator** - Daily operations
- **Auditor** - Read-only access for auditing
- **Viewer** - Limited read-only access

### Using Authentication

```tsx
import { useAuth, usePermission } from '@/hooks/use-auth';
import { Permission } from '@/lib/rbac';

function Component() {
  const { user, logout } = useAuth();
  const canEditUsers = usePermission(Permission.UPDATE_USER);
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      {canEditUsers && <Button>Edit User</Button>}
    </div>
  );
}
```

## 📡 API Integration

### HTTP Client Usage

```tsx
import { httpClient } from '@/lib/http';

// GET request
const users = await httpClient.get('/admin/users');

// POST request
const newUser = await httpClient.post('/admin/users', userData);

// Error handling
try {
  const result = await httpClient.get('/admin/orders');
} catch (error) {
  console.error('API error:', error);
}
```

### TanStack Query Integration

```tsx
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/lib/http';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => httpClient.get('/admin/users'),
  });
}
```

## 🧪 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add comments for complex logic (in English)

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Pages: `page.tsx` (Next.js App Router)

## 🚀 Build & Deployment

### Development

```bash
pnpm dev          # Start development server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Production

```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

### Testing

```bash
pnpm test         # Run unit tests
pnpm test:watch   # Run tests in watch mode
pnpm test:e2e     # Run end-to-end tests
```

## 📝 API Documentation

The admin panel connects to the **mini-exchange-backend** API. Key endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### Admin APIs
- `GET /admin/users` - List users
- `GET /admin/orders` - List orders
- `GET /admin/markets` - List markets
- `GET /admin/reports` - System reports

## 🔍 Debugging

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Token Issues**: Verify AUTH_MODE and cookie settings
3. **Build Errors**: Run `pnpm type-check` to find type issues

### Development Tools

- Browser DevTools for debugging
- Next.js built-in error overlay
- React Developer Tools extension

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app)

## 🤝 Contributing

1. Create a feature branch
2. Follow coding standards
3. Add tests for new features
4. Update documentation
5. Submit a pull request

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.
