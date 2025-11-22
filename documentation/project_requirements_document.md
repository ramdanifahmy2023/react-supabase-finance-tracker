# Project Requirements Document (PRD)

## 1. Project Overview

The **React-Supabase Finance Tracker** is a web application designed to help companies log, track, and report on all income (pemasukan) and expenses (pengeluaran). It provides a real-time dashboard showing key metrics like total income, total expenses, and net profit, while also letting users add, edit, and delete individual transactions via intuitive, form-based dialogs. Built on a modern stack—React, Vite, Tailwind CSS, and Supabase—this tool aims to streamline corporate financial record-keeping and give decision-makers instant visibility into money flows.

We’re building this tracker to replace manual spreadsheets and disconnected systems, reducing errors and increasing productivity. Key objectives include: 1) capturing every transaction accurately with form validation, 2) displaying up-to-date financial summaries automatically, and 3) securing data through authentication and role-based access. Success will be measured by user adoption, data accuracy, and sub-two-second load times on core pages.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1.0)
- User Authentication & Authorization via Supabase Auth  
- Role-Based Access Control (Admin vs. Employee) using Supabase Row Level Security  
- CRUD for Income and Expense records  
- Real-time Dashboard with total income, total expenses, net profit  
- Transaction List Table with pagination and sorting  
- Dialog-based forms with React Hook Form & Zod validation  
- TanStack Query for data fetching, caching, and live updates  
- Toast notifications for success/error messages  
- Responsive UI using Tailwind CSS and shadcn/ui components  
- Environment configuration (`.env`) for Supabase keys and build settings  

### Out-of-Scope (Later Phases)
- Advanced charting and time-series graphs (e.g., Recharts or Chart.js)  
- Automated email or SMS notifications on specific events  
- Mobile offline mode or native mobile app  
- Budgeting modules or forecast tools  
- Multi-currency and exchange rate handling  
- Audit logs or version history per transaction  

---

## 3. User Flow

A new user lands on the **Sign Up** page, enters their company email and password, and completes email verification. After verifying, they sign in on the **Login** page. Upon successful login, the user is directed to the **Dashboard**. The layout features a left-hand navigation bar with links to Dashboard, Income, Expenses, and Settings. The main content area displays summary cards (Total Income, Total Expenses, Net Profit) and a table of recent transactions.

To add a transaction, the user clicks the **"Add Income"** or **"Add Expense"** button in the top bar. A modal dialog opens, containing a form with fields for amount, date (via DatePicker), category (via Select), and description (via Input). React Hook Form manages inputs, and Zod validates each field. Upon submitting, TanStack Query sends the data to Supabase and automatically refetches the transaction list. The modal closes, and a toast message confirms success. Admin users can switch to **Settings** to manage user roles.

---

## 4. Core Features

- **Authentication & Authorization**: Sign-up, login, password reset via Supabase Auth; RLS for Admin vs. Employee roles.
- **Dashboard**: Summary cards and a table of recent transactions with filters.
- **Income/Expense Management**: CRUD operations via Dialog forms, validated by Zod.
- **Real-Time Updates**: Automatic UI refresh when data changes, powered by TanStack Query’s subscriptions.
- **Form Handling**: React Hook Form for state management; Zod for schema validation to enforce numeric amounts and required fields.
- **Notifications**: Toast messages for successful saves, updates, or errors.
- **Responsive Design**: Mobile and desktop layouts via Tailwind CSS and shadcn/ui.

---

## 5. Tech Stack & Tools

- Frontend: React (UI library), Vite (build tool), TypeScript (type safety)  
- Styling: Tailwind CSS (utility-first CSS), shadcn/ui (accessible component library)  
- Forms & Validation: React Hook Form, Zod (runtime schema validation)  
- Data Fetching: TanStack Query (caching, real-time sync)  
- Backend: Supabase (PostgreSQL database, Auth, RLS)  
- Animations: Framer Motion (smooth transitions)  
- Icons: Lucide React (SVG icon set)  
- Environment: `.env` for secure API keys  
- IDE/Editor: VS Code recommended; optionally install Tailwind CSS IntelliSense and Supabase extension  

No AI models are integrated in version 1.0.

---

## 6. Non-Functional Requirements

- **Performance**: Core pages must load in under 2 seconds on a 4G connection; API fetches should respond within 200ms.  
- **Security**: All traffic over HTTPS; use Supabase RLS to enforce data access rules; store secrets in environment variables.  
- **Usability**: WCAG AA accessibility compliance; keyboard navigation and screen-reader support for all dialogs and forms.  
- **Reliability**: 99.9% uptime for critical data operations; retry failed network requests automatically up to two times.  
- **Maintainability**: Follow component-driven architecture; use path aliases (`@/`) for imports; keep code coverage above 80% with Vitest.  

---

## 7. Constraints & Assumptions

- Assumes Supabase Free or Pro plan with real-time capabilities enabled.  
- Users have modern browsers (Chrome, Firefox, Safari, Edge) with ES6 support.  
- Stable internet connection required; offline support is not provided in v1.0.  
- Environment variables must be set before running the dev server or production build.  
- Database schema (`transactions` table) to be created in Supabase prior to frontend configuration.  

---

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Free Supabase plans may throttle real-time subscriptions; mitigate by batching queries and limiting subscription scope.  
- **Data Validation Edge Cases**: Zod schemas must cover negative or zero amounts; include custom error messages.  
- **RLS Complexity**: Misconfigured Row Level Security can lock out users. Always test roles with dummy accounts.  
- **Large Data Sets**: Rendering thousands of rows can slow the table; plan for server-side pagination or virtualization later.  
- **Focus Management in Modals**: Ensure keyboard focus moves into dialogs and returns to trigger elements on close to maintain accessibility.  


*End of PRD.*