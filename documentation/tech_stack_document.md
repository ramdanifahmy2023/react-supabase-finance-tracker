# Tech Stack Document

This document explains the technology choices behind the **react-supabase-finance-tracker** project. It’s written in everyday language so everyone—technical or not—can understand why we picked each tool and how they work together.

## 1. Frontend Technologies

These are the tools and libraries we use to build everything you see and interact with in your browser.

- **React**
  • A popular library for building user interfaces.  
  • Lets us break the app into reusable pieces (components), such as buttons, tables, and forms.

- **Vite**
  • A modern build tool and development server.  
  • Starts up almost instantly, so developers see changes in the browser right away.
  • Produces a fast, optimized package when we’re ready to publish.

- **TypeScript**
  • An enhanced version of JavaScript that adds type checking.  
  • Helps catch mistakes early (like mixing up numbers and text).
  • Makes the code easier to maintain as the project grows.

- **Tailwind CSS**
  • A styling framework that provides pre-defined CSS classes.  
  • Lets us build clean, professional layouts without writing lots of custom CSS.

- **shadcn/ui**
  • A library of ready-made, accessible components (tables, dialogs, date pickers, etc.).  
  • Ensures a consistent look and feel across the app.

- **Lucide React**
  • A set of simple, modern icons.  
  • Helps make buttons and menus more intuitive.

- **React Hook Form**
  • A tool for managing form state (e.g., inputs for amount, date, category).  
  • Fast performance and easy integration with validation rules.

- **Zod**
  • A library for defining and enforcing data rules (schemas).  
  • Works with React Hook Form to ensure fields like “amount” always contain valid numbers.

- **TanStack Query**
  • Handles data fetching, caching, and background updates.  
  • Keeps the financial data on screen always up to date without manual refreshes.

- **Framer Motion**
  • Adds smooth transitions and animations (like dialog pop-ups).  
  • Improves the overall user experience by making interactions feel lively.

- **Charting Library (e.g., Recharts)**
  • Optional integration to display financial trends in graphs.  
  • Helps visualize totals, categories, and time-based data.

## 2. Backend Technologies

These components power the behind-the-scenes work: storing data, managing users, and enforcing rules.

- **Supabase**
  • A hosted solution that combines a PostgreSQL database, authentication, and real-time updates.  
  • Stores all income and expense records in secure tables.  
  • Manages user sign-up, sign-in, and password resets.

- **Supabase Auth & Row Level Security**
  • Controls who can see or change data based on their role (e.g., Admin vs. Employee).  
  • Ensures sensitive financial records stay protected.

- **Supabase Client Library**
  • A JavaScript library in the code that talks to the Supabase service.  
  • Handles queries, inserts, updates, and real-time subscriptions.

## 3. Infrastructure and Deployment

Here’s how we store, build, and publish the application to ensure it’s reliable, scalable, and easy to update.

- **Version Control: Git & GitHub**
  • Keeps track of every code change, so we can collaborate without conflicts.  
  • Allows rollbacks if something goes wrong.

- **CI/CD: GitHub Actions**
  • Automatically runs tests and builds the app whenever new code is pushed.  
  • Prevents broken code from reaching production.

- **Hosting: Vercel (or Netlify)**
  • Deploys the frontend (“static” bundle) to a global network of servers.  
  • Delivers assets quickly to users anywhere in the world.

- **Environment Variables (.env)**
  • Securely store secret keys (like Supabase API keys) outside the code.  
  • Keeps sensitive information safe from public view.

- **Path Aliases (tsconfig Paths)**
  • Simplify import statements (e.g., `@/components/Table`).  
  • Makes the codebase easier to navigate as it grows.

## 4. Third-Party Integrations

These external services enhance functionality without us building everything from scratch.

- **Supabase** (database, authentication, real-time)
- **Recharts** (or similar charting library) for dynamic data visualization
- **Lucide React** for iconography
- **shadcn/ui** for pre-built UI components

Each integration speeds up development and ensures industry-standard reliability.

## 5. Security and Performance Considerations

We’ve built in measures to protect data and keep the app fast and responsive.

- Security Measures:
  • **Authentication & RLS** in Supabase to enforce user permissions.  
  • **Zod Validation** prevents invalid data (wrong types or missing fields) from entering the database.  
  • **Environment Variables** keep secret keys out of source code.  
  • **HTTPS/TLS** is used by hosting platforms to encrypt data in transit.

- Performance Optimizations:
  • **Vite’s Fast Builds** allow quick developer feedback loops and optimized production bundles.  
  • **TanStack Query Caching** reduces redundant network calls and updates data in the background.  
  • **Code Splitting & Lazy Loading** for large components (like charts) so initial page loads stay snappy.  
  • **Tailwind CSS** produces small, utility-based styles, reducing unused CSS in production.

## 6. Conclusion and Overall Tech Stack Summary

By combining a modern frontend (React, Vite, TypeScript, Tailwind CSS, shadcn/ui) with a powerful backend-as-a-service (Supabase), plus smart data fetching (TanStack Query), form handling (React Hook Form + Zod), and smooth animations (Framer Motion), this project provides a robust foundation for a corporate finance tracker.  

Infrastructure choices (GitHub, GitHub Actions, Vercel) ensure that updates are safe and deployments are reliable. Security features like Supabase Auth, Row Level Security, and schema validation protect your financial data, while performance optimizations keep the user experience fast and responsive.  

Together, these technologies align perfectly with the goal of building a secure, scalable, and user-friendly corporate finance application that your team can trust and extend over time.