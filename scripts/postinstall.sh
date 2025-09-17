#!/bin/bash

# Post-install script for mini-exchange-admin
# Initializes shadcn/ui components and project setup

echo "🚀 Setting up mini-exchange-admin project..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Create .env.local from .env.example if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "✅ .env.local created. Please update it with your configuration."
fi

# Initialize shadcn/ui components if not already done
if [ ! -f "components.json" ]; then
  echo "🎨 Initializing shadcn/ui..."
  
  # Create components.json configuration
  cat > components.json << EOF
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
EOF

  echo "✅ shadcn/ui configuration created."
fi

# Add additional shadcn/ui components
echo "📦 Installing additional shadcn/ui components..."

# List of components to install
components=(
  "button"
  "input"
  "card"
  "table"
  "dialog"
  "dropdown-menu"
  "toast"
  "tabs"
  "switch"
  "select"
  "checkbox"
  "label"
  "separator"
  "avatar"
  "badge"
  "alert"
  "sheet"
  "form"
)

# Install components (this would require shadcn CLI to be available)
# For now, we'll create a note about manual installation
echo "📋 Components to install manually with shadcn CLI:"
for component in "${components[@]}"; do
  echo "  - pnpx shadcn-ui@latest add $component"
done

# Create TypeScript path mapping file
echo "🔧 Setting up TypeScript configuration..."

cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create ESLint configuration
echo "🔍 Setting up ESLint configuration..."

cat > .eslintrc.json << EOF
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["node_modules/", ".next/", "dist/"]
}
EOF

# Create Prettier configuration
echo "💅 Setting up Prettier configuration..."

cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
  echo "📁 Creating .gitignore..."
  cat > .gitignore << EOF
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/

# OS
Thumbs.db
EOF
fi

echo "✅ Project setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Install dependencies: pnpm install"
echo "3. Install shadcn/ui components manually (see list above)"
echo "4. Start development server: pnpm dev"
echo ""
echo "🎉 Happy coding!"
