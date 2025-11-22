# Frontend Guideline Document

This document outlines the architecture, design principles, styling, and tools used to build the **react-supabase-finance-tracker**. Anyone on the team can follow these guidelines to understand, extend, and maintain the frontend without prior deep technical knowledge.

## 1. Frontend Architecture

### 1.1 Overview
- Framework: **React** (with TypeScript) for building user interfaces as reusable components.
- Build Tool: **Vite** for lightning-fast development and optimized production builds.
- UI Library: **shadcn/ui** (built on Radix) provides accessible, pre-styled components like tables, dialogs, and date pickers.
- Styling: **Tailwind CSS** for utility-first, highly customizable styles.
- Backend Integration: **Supabase** (BaaS) for database, authentication, and real-time updates.
- Data Fetching & Caching: **TanStack Query** (React Query) to fetch, cache, and keep data in sync automatically.
- Form Management: **React Hook Form** with **Zod** for schema-based validation.
- Animations: **Framer Motion** for smooth, declarative animations.

### 1.2 How It Supports Scalability, Maintainability, and Performance
- Component-driven structure isolates UI pieces for reuse and easier testing.
- Vite’s fast hot module replacement accelerates development iterations.
- React Query handles cache invalidation and keeps UI in sync without manual reloads.
- TypeScript adds type safety, reducing runtime errors as the codebase grows.
- Tailwind CSS and shadcn/ui enforce consistent styling patterns and accessibility best practices.

## 2. Design Principles

### 2.1 Key Principles
- **Usability:** Clear layouts, straightforward forms, and immediate feedback (toasts) guide users.
- **Accessibility:** All components from shadcn/ui follow ARIA standards; keyboard and screen-reader support is tested.
- **Responsiveness:** Mobile-first design ensures the app works on phones, tablets, and desktops.
- **Clarity:** Minimalistic interfaces focus on essential financial data without clutter.

### 2.2 Applying These Principles
- Forms use labels, helper text, and real-time validation errors for clarity.
- Tables and cards adapt to different screen widths, hiding non-critical columns on small devices.
- High-contrast text and ARIA roles improve readability for all users.

## 3. Styling and Theming

### 3.1 Styling Approach
- Utility-first CSS via **Tailwind CSS**.
- CSS classes combined using the `cn` helper in `lib/utils.ts` to merge conditional styles.
- No custom CSS files—styles come from Tailwind configuration (`tailwind.config.ts`).

### 3.2 Theming
- Single light theme right now; can extend to dark mode by adding a `dark:` section in Tailwind config.
- Colors, spacing, and typography are defined in `tailwind.config.ts` so changes propagate globally.

### 3.3 Visual Style
- **Style:** Modern, flat design with subtle shadows for depth (e.g., glassmorphism-inspired cards).
- **Color Palette:**
  - Primary: #1D4ED8 (blue-700)
  - Secondary: #9333EA (purple-600)
  - Accent: #10B981 (green-500)
  - Background: #F3F4F6 (gray-100)
  - Surface: #FFFFFF (white)
  - Text: #111827 (gray-900)
  - Muted Text: #6B7280 (gray-500)

### 3.4 Typography
- Font: **Inter**, sans-serif (imported via Google Fonts or self-hosted).
- Base size: 16px; line-height: 1.5.
- Heading scale: h1:36px, h2:30px, h3:24px, h4:20px.

## 4. Component Structure

- **`src/components/ui/`**: Shadcn/ui components and wrappers (Button, Table, Card, Dialog, DatePicker, etc.).
- **`src/features/transactions/`**: Domain-specific features (`AddTransactionForm.tsx`, `TransactionTable.tsx`, hooks, and queries).
- **`src/pages/`**: Route targets (`Dashboard.tsx`, `IncomePage.tsx`, `ExpensesPage.tsx`, `Settings.tsx`).
- **`src/hooks/`**: Custom hooks (e.g., `useTransactions`, `useToast`).
- **`src/lib/`**: Utilities (`cn`), Supabase client initialization, API wrappers.

### 4.1 Benefits of Component-Based Architecture
- **Reusability:** One Button definition powers all actions (Add, Edit, Delete).
- **Isolation:** Components manage their own state and styles, reducing side effects.
- **Ease of Testing:** Small, focused components are easier to unit test.

## 5. State Management

- **React Query (TanStack Query):** Handles server state—fetching, caching, and invalidation.
- **React Hook Form:** Manages local form state and validation histories.
- **Context API (optional):** For global UI state (e.g., theme toggle) if needed in the future.

### 5.1 Data Flow
1. Component calls a React Query hook (e.g., `useTransactionsQuery`).
2. Data is fetched from Supabase and stored in the cache.
3. Components subscribe to the cache and re-render on updates.
4. Mutations (add/edit/delete) trigger cache invalidation, causing refetch.

## 6. Routing and Navigation

- **Library:** **React Router** for client-side routing.
- **Structure:** `App.tsx` sets up a `<BrowserRouter>` and `<Routes>` for each page.
- **Navigation:** A collapsible sidebar or top bar holds links to Dashboard, Income, Expenses, Reports, and Settings.
- **Protected Routes:** Wrap routes with an Auth Guard that checks Supabase Auth status.

## 7. Performance Optimization

- **Code Splitting:** Lazy-load pages via `React.lazy` and `Suspense`.
- **Tree Shaking:** Vite and ES modules ensure unused code is removed.
- **Optimized Assets:** SVG icons imported as React components (Lucide React) instead of large icon fonts.
- **Caching:** React Query cache avoids unnecessary network requests.
- **Tailwind JIT:** Generates only used CSS classes, keeping bundle small.

## 8. Testing and Quality Assurance

- **Unit Tests:** **Vitest** + **React Testing Library** for components and hooks.
- **Integration Tests:** Test pages in isolation, mocking API calls with msw (Mock Service Worker).
- **End-to-End Tests:** **Cypress** or **Playwright** for user flows (login, add transaction, view report).
- **Linting & Formatting:** ESLint (with TypeScript rules) and Prettier ensure code consistency.
- **Accessibility Checks:** axe-core or Cypress-axe to catch a11y issues.

## 9. Conclusion and Overall Frontend Summary

This frontend setup combines modern tools—React, Vite, Tailwind, Supabase, and TanStack Query—to deliver a scalable, maintainable, and performant finance tracker. By following these guidelines, the team can build a professional, accessible user interface that handles real-time financial data with ease. The component-driven architecture, clear design principles, and robust testing strategy ensure the app will grow with your company’s needs while maintaining reliability and usability.

---

Feel free to reach out to the team lead if you have any questions or suggestions for improving these guidelines.