# Backend Structure Document for React-Supabase Finance Tracker

This document outlines the backend setup for your corporate finance tracking application. It covers the architecture, database, APIs, hosting, infrastructure, security, monitoring, and maintenance strategies in clear, everyday language.

---

## 1. Backend Architecture

**Overall Design**
- We use Supabase as a Backend-as-a-Service (BaaS). Supabase provides a hosted PostgreSQL database, authentication, real-time subscriptions, and auto-generated APIs.
- Our frontend (built with React and Vite) communicates with Supabase via its RESTful and real-time endpoints.
- We apply these design patterns and frameworks:
  - **Service-oriented**: Supabase handles data storage, auth, and real-time updates as separate but integrated services.  
  - **Declarative data fetching**: On the frontend, TanStack Query subscribes to Supabase’s real-time channels and REST endpoints to keep the UI in sync.  
  - **Schema-first validation**: Zod schemas ensure data consistency before writing to the database.  

**Scalability, Maintainability, Performance**
- **Autoscaling**: Supabase automatically scales the database and API layer to handle growing traffic.  
- **Modular setup**: You can add new tables, functions, or storage buckets in Supabase without rearchitecting your code.  
- **Real-time subscriptions**: Changes in the database are pushed instantly to clients, reducing polling overhead and improving performance.  
- **Type-safe contracts**: Using TypeScript and Zod means less runtime errors and easier maintenance as the codebase grows.

---

## 2. Database Management

**Technology Choices**
- **Type**: SQL  
- **System**: PostgreSQL (hosted by Supabase)  

**Data Structure & Access**
- All financial data (transactions, categories) and user profiles live in PostgreSQL tables.  
- Supabase generates:
  - A **RESTful API** for each table (CRUD endpoints).  
  - A **GraphQL API** (optional, off by default).  
  - **Real-time channels** for listening to inserts/updates/deletes.  
- We manage data integrity by defining:
  - Primary keys, foreign keys, and unique constraints.  
  - Row-Level Security (RLS) policies to enforce user permissions.  
  - Triggers or database functions (if needed) for automated tasks, like auditing.  

**Data Management Practices**
- **Backups**: Supabase provides daily backups and point-in-time recovery.  
- **Migrations**: Use Supabase’s migration tools or pgAdmin to apply schema changes in version control.  
- **Environments**: Maintain separate Supabase projects for development, staging, and production.

---

## 3. Database Schema

Below is a human-readable summary followed by SQL definitions.

### Human-Readable Schema

1. **users** (managed by Supabase Auth)
   - `id`: unique user identifier (UUID)
   - `email`, `created_at`, `last_sign_in` (managed by Supabase)

2. **user_profiles**
   - `user_id`: links to `users.id`  
   - `full_name`: text  
   - `role`: enum (`"admin"`, `"employee"`)  

3. **categories**
   - `id`: unique category identifier (UUID)  
   - `name`: text (e.g., "Office Supplies")  
   - `type`: enum (`"income"` or `"expense"`)  
   - `created_at`: timestamp  

4. **transactions**
   - `id`: unique transaction identifier (UUID)  
   - `user_id`: links to the person who logged it (UUID)  
   - `category_id`: links to `categories.id`  
   - `type`: enum (`"income"` or `"expense"`)  
   - `amount`: numeric  
   - `description`: text  
   - `created_at`: timestamp (when it was recorded)  

### SQL Schema (PostgreSQL)
```sql
-- 1. Profiles table to extend Supabase Auth users
drop table if exists user_profiles;
create table user_profiles (
  user_id uuid primary key references auth.users(id),
  full_name text not null,
  role   text not null check (role in ('admin','employee')),
  created_at timestamp with time zone default now()
);

-- 2. Categories for income/expense grouping
drop table if exists categories;
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  type       text not null check (type in ('income','expense')),
  created_at timestamp with time zone default now()
);

-- 3. Transactions log
drop table if exists transactions;
create table transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id),
  category_id uuid not null references categories(id),
  type        text not null check (type in ('income','expense')),
  amount      numeric not null check (amount >= 0),
  description text,
  created_at  timestamp with time zone default now()
);

-- Indexes for performance
create index on transactions(user_id);
create index on transactions(category_id);
create index on transactions(created_at);
```  

---

## 4. API Design and Endpoints

**RESTful Approach**
- Supabase auto-generates CRUD endpoints under `https://<project>.supabase.co/rest/v1`.
- All endpoints require an API key (service key for server jobs, anon key for clients).

**Key Endpoints**
1. **Authentication**
   - `POST /auth/v1/signup` – create an account  
   - `POST /auth/v1/token`  – sign in and return JWT  
   - `POST /auth/v1/user`   – retrieve current user details  

2. **User Profiles**
   - `GET /rest/v1/user_profiles?user_id=eq.<user_id>` – fetch a user’s profile  
   - `PATCH /rest/v1/user_profiles?user_id=eq.<user_id>` – update role or name  

3. **Categories**
   - `GET /rest/v1/categories` – list all categories  
   - `POST /rest/v1/categories` – create a new category  
   - `PATCH /rest/v1/categories?id=eq.<id>` – update category  
   - `DELETE /rest/v1/categories?id=eq.<id>` – delete category  

4. **Transactions**
   - `GET /rest/v1/transactions?user_id=eq.<user_id>&type=eq.expense` – list user expenses  
   - `POST /rest/v1/transactions` – add a new transaction  
   - `PATCH /rest/v1/transactions?id=eq.<id>` – modify a transaction  
   - `DELETE /rest/v1/transactions?id=eq.<id>` – remove a transaction  

**Real-Time Subscriptions**
- Use Supabase client to listen on `transactions` and `categories` channels.  
- Frontend automatically refetches or updates cache when events occur.

---

## 5. Hosting Solutions

**Supabase Cloud**
- Your backend (database, auth, storage, functions, APIs) is hosted by Supabase in a managed cloud environment.  
- **Reliability**: 99.9% SLA, automated failover, multi-region support.  
- **Scalability**: Storage and compute scale on demand.  
- **Cost-effectiveness**: Pay‐as‐you‐go plans; free tier for small teams and prototypes.

**Environment Separation**
- **Development**: A free or low-cost Supabase project where you test new features.  
- **Staging**: Mirror of production data (with sensitive data scrubbed) to test releases.  
- **Production**: Performance-tuned plan with backups and stricter RLS policies.

---

## 6. Infrastructure Components

**Load Balancing & Networking**
- Supabase’s managed environment includes built-in load balancing across multiple database instances and API nodes.  
- HTTPS termination (SSL/TLS) is handled automatically.

**Caching**
- Supabase employs database-level caching and connection pooling.  
- On the client side, TanStack Query caches API responses to minimize redundant network calls.

**CDN**
- Static assets (if any) can be served via Supabase Storage + built-in CDN.  
- For maximum front-end performance, host the React build on a CDN (e.g., Vercel or Netlify).

**Edge Functions (Optional)**
- You can add Supabase Edge Functions (written in JavaScript/TypeScript) to handle custom business logic outside of the database.

---

## 7. Security Measures

**Authentication & Authorization**
- **Supabase Auth** with email/password, magic links, OAuth providers.  
- JSON Web Tokens (JWT) protect all endpoints.  
- **Row-Level Security (RLS)**:
  - Employees can only view and modify their own transactions.  
  - Admins have read/write access across all data.

**Data Encryption**
- **In transit**: All data is encrypted via HTTPS/TLS.  
- **At rest**: Supabase encrypts database storage by default.

**Policy Enforcement**
- Define RLS policies in SQL:
```sql
-- Example: Only allow a user to read their own transactions
create policy "Users can view their transactions"
  on transactions
  for select using (auth.uid() = user_id);

-- Admins can bypass RLS for full access
create policy "Admins full access"
  on transactions
  for all using (
    exists (
      select 1 from user_profiles where user_id = auth.uid() and role = 'admin'
    )
  );
```  

**Secrets Management**
- Store Supabase keys in environment variables (`.env`) locally.  
- Use Supabase’s secret management for staging/production.

---

## 8. Monitoring and Maintenance

**Performance Monitoring**
- **Supabase Dashboard**: View query performance, active connections, CPU/memory usage.  
- **Logging**: Enable database logs for slow queries, errors.  
- **Alerts**: Set up email or Slack alerts for downtime or high latency.

**Error Tracking**
- Integrate a tool like Sentry or Logflare to capture runtime errors in Edge Functions or API calls.

**Maintenance Practices**
- **Regular Backups**: Daily automated backups with point-in-time recovery.  
- **Schema Migrations**: Apply via migration scripts, test in staging before production.  
- **Dependency Updates**: Monitor Supabase CLI, client SDKs, and database extension updates.  
- **Health Checks**: Periodic scripts to validate critical endpoints (e.g., sign-in, transaction creation).

---

## 9. Conclusion and Overall Backend Summary

Your backend, powered by Supabase, offers a turnkey solution for corporate finance tracking. By combining a managed PostgreSQL database, auto-generated APIs, real-time subscriptions, and robust auth, you achieve:

- Rapid development and deployment without managing servers.  
- Scalable performance that grows with your user base.  
- Strong data integrity through schema validation, RLS, and backups.  
- Cost-effective hosting with clear separation between dev, staging, and production.  

This setup ensures your company can confidently record, report, and analyze financial data with minimal overhead, secure access controls, and a real-time user experience. Supabase’s rich feature set and managed infrastructure let you focus on building unique analytics and user flows rather than server maintenance.