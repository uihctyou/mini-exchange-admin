# Mini Exchange Admin 管理後台

> **mini-exchange** 數位貨幣交易所的管理後台。基於 **Next.js + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + next-intl** 構建，通過 **mini-exchange-backend** 提供的 REST API 進行數據管理。

## 🚀 項目狀態

- ✅ **項目設置**: 完成 Next.js 14 框架及 TypeScript 配置
- ✅ **UI 組件**: shadcn/ui 組件庫及 Tailwind CSS 樣式
- ✅ **用戶認證**: 模擬登錄系統及基於角色的訪問控制
- ✅ **國際化**: 支持英文和繁體中文
- ✅ **路由保護**: 基於中間件的認證守衛
- ✅ **儀表板**: 基礎儀表板含統計數據和系統狀態
- 🚧 **後端集成**: 已準備好 API 集成 (localhost:9977)
- 📋 **用戶管理**: 計劃中
- 📋 **交易功能**: 計劃中

## 🧪 演示帳號

應用程序包含以下測試帳號：

- **管理員**: `admin@example.com` / `admin123`
- **操作員**: `operator@example.com` / `operator123`
- **審計員**: `auditor@example.com` / `auditor123`

---

## 技術棧

* **框架**: Next.js (App Router) + TypeScript
* **UI**: Tailwind CSS + shadcn/ui (Radix UI 基元)
* **狀態與數據**: TanStack Query (數據獲取/緩存) + Zustand (全局狀態)
* **國際化**: next-intl 與 `app/[locale]` 路由結構
* **表單**: react-hook-form + zod 模式驗證
* **認證**: Next.js 路由處理器作為 BFF 代理，JWT 令牌
* **圖表**: recharts (可選)
* **開發工具**: ESLint, Prettier, Jest (單元測試), Playwright (E2E)

> **依賴項目**: **mini-exchange-backend** (Spring Boot 帶 JWT 認證)

---

## 快速開始

```bash
# 1. 安裝依賴
pnpm install

# 2. 設置環境變數
cp .env.example .env.local
# 編輯 .env.local 配置您的設置

# 3. 開發模式
pnpm dev

# 4. 生產構建
pnpm build && pnpm start
```

## 🏗️ 項目結構

```
mini-exchange-admin/
├── app/
│   ├── [locale]/               # 國際化路由 (en, zh-TW)
│   │   ├── (auth)/
│   │   │   └── login/          # 登錄頁面
│   │   ├── (dashboard)/        # 儀表板路由
│   │   │   ├── page.tsx        # 儀表板首頁
│   │   │   ├── users/          # 用戶管理
│   │   │   ├── orders/         # 訂單管理
│   │   │   ├── markets/        # 市場管理
│   │   │   ├── risk/           # 風險管理
│   │   │   └── settings/       # 系統設置
│   │   └── layout.tsx          # 區域佈局
│   ├── api/                    # BFF 路由處理器
│   │   └── auth/               # 認證 API
│   └── middleware.ts           # 路由保護
├── components/
│   ├── ui/                     # shadcn/ui 組件
│   └── ...                     # 自定義組件
├── lib/
│   ├── auth.ts                 # 認證工具
│   ├── http.ts                 # HTTP 客戶端
│   ├── rbac.ts                 # 基於角色的訪問控制
│   └── utils.ts                # 工具函數
├── hooks/
│   ├── use-auth.ts             # 認證鉤子
│   └── queries/                # TanStack Query 鉤子
└── locales/                    # 國際化
    ├── en/                     # 英文翻譯
    └── zh-TW/                  # 繁體中文
```

## 認證與授權

### BFF 模式 (推薦)
- JWT 令牌存儲在安全的 HTTP-only cookies 中
- Next.js API 路由代理對後端的請求
- 通過 XSS 保護提供更好的安全性

### 直接模式 (開發)
- 直接調用後端 API
- 令牌存儲在 localStorage/sessionStorage 中
- 設置更簡單但安全性較低

### 基於角色的訪問控制
- **超級管理員**: 完整系統訪問權限
- **管理員**: 大部分管理功能
- **操作員**: 日常操作
- **審計員**: 用於審計的只讀訪問權限
- **查看者**: 有限的只讀訪問權限

## 國際化

使用 next-intl 內置多語言支持:
- 英文 (en) - 默認
- 繁體中文 (zh-TW)

路由: `/en/...`, `/zh-TW/...`

## 環境變數

```bash
# 開發服務器端口
PORT=3011

# 認證模式: BFF 或 DIRECT
AUTH_MODE=BFF

# 後端 API 基礎 URL
EXCHANGE_API_BASE_URL=http://localhost:9977

# Cookie 設置 (BFF 模式)
AUTH_COOKIE_NAME=access_token
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=Strict
AUTH_COOKIE_MAXAGE=900

# 國際化
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,zh-TW
```

## UI 組件

- 基於 Radix UI 基元的 **shadcn/ui** 組件
- 用於樣式的 **Tailwind CSS**
- 具有過濾、排序、分頁功能的**數據表格**
- 使用 react-hook-form 和 zod 驗證的**表單**
- 帶側邊欄和標題的**響應式佈局**

## 🔒 安全功能

- ✅ **客戶端認證**: JWT 令牌安全存儲
- ✅ **路由保護**: 基於中間件的訪問控制
- ✅ **角色訪問控制**: 5 級用戶權限管理
- ✅ **輸入驗證**: Zod 模式驗證表單
- ✅ **XSS 防護**: 安全令牌處理
- 🚧 **CORS 保護**: 準備後端集成
- 🚧 **操作審計**: 計劃用戶操作記錄

## 🏗️ 架構設計

### 認證流程
1. **用戶登錄**: 提交登錄憑據
2. **令牌存儲**: JWT 存儲在 localStorage/sessionStorage
3. **路由守衛**: 中間件檢查受保護路由的認證狀態
4. **自動重定向**: 未認證用戶 → 登錄頁，已認證用戶 → 儀表板

### 文件結構
```
lib/
├── auth.ts          # 客戶端認證工具
├── auth-server.ts   # 服務端認證工具 (僅 API 路由)
├── http.ts          # 帶認證集成的 HTTP 客戶端
├── rbac.ts          # 角色訪問控制定義
└── env.ts           # 環境配置
```

## 開發腳本

```bash
pnpm dev          # 啟動開發服務器
pnpm build        # 生產構建
pnpm start        # 啟動生產服務器
pnpm lint         # 運行 ESLint
pnpm type-check   # 運行 TypeScript 檢查
pnpm test         # 運行測試
```

## 開發路線圖

## 📋 路線圖

- [ ] 用戶和角色管理 (CRUD 操作)
- [ ] 訂單管理 (搜索、過濾、導出)
- [ ] 交易對和手續費配置
- [ ] 風險管理工作流 (KYC/AML)
- [ ] 實時儀表板與指標
- [ ] 完整國際化
- [ ] Playwright 端到端測試

## 🔧 故障排除

### 常見問題

1. **端口 3011 被佔用**
   ```bash
   lsof -ti:3011 | xargs kill -9
   pnpm dev
   ```

2. **客戶端組件中出現 next/headers 錯誤**
   - 客戶端認證使用 `lib/auth.ts`
   - `lib/auth-server.ts` 僅用於 API 路由

3. **登錄無法使用**
   - 檢查演示憑據是否輸入正確
   - 驗證瀏覽器 localStorage/sessionStorage 中的令牌
   - 檢查瀏覽器控制台錯誤

4. **中間件重定向循環**
   - 清除瀏覽器存儲和 cookies
   - 重啟開發服務器

### 後端集成

連接真實後端 API：

1. 在 `.env.local` 中更新後端 URL
2. 在 `hooks/use-auth.ts` 中用真實 API 調用替換模擬登錄
3. 在後端配置 CORS 允許 `http://localhost:3011`
4. 更新認證中間件以驗證真實 JWT 令牌

## 許可證

此項目基於 **MIT License** - 查看 [LICENSE](LICENSE) 文件了解更多細節.
