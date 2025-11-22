# Security Guidelines for react-supabase-finance-tracker

This document outlines the security best practices and design principles tailored for the corporate finance tracker application built with React, Vite, Tailwind CSS, shadcn/ui, Supabase, TanStack Query, React Hook Form, Zod, and TypeScript. Follow these guidelines to ensure your application is secure by design, resilient, and compliant with industry standards.

---

## 1. Core Security Principles

- **Security by Design:** Integrate security from day one—design, implementation, testing, and deployment.
- **Least Privilege:** Grant each component, API, and user only the permissions they require.
- **Defense in Depth:** Apply multiple overlapping controls (e.g., input validation, output encoding, rate limits).
- **Fail Securely:** On error, do not reveal sensitive details. Log internally and show generic messages to users.
- **Secure Defaults:** All configs (CORS, CSP, cookies, database) must ship in a locked-down state.

---

## 2. Authentication & Access Control

1. **Supabase Auth Configuration**
   - Enforce **email confirmation** on sign-up.
   - Use strong password policy: minimum length 12, complexity requirements, secure hashing (Argon2).
   - Enable **MFA** (e.g., TOTP) for administrative roles.

2. **Session Management**
   - Configure Supabase session JWTs with short expiration (`exp`) and implement refresh tokens.
   - Store tokens only in **Secure**, **HttpOnly**, **SameSite=Strict** cookies to prevent XSS.
   - Invalidate sessions on logout; rotate refresh tokens to prevent session fixation.

3. **Role-Based Access Control (RBAC)**
   - Define roles (`admin`, `employee`) in Supabase Auth.
   - Enforce Row Level Security (RLS) policies on `transactions` table:
     • Admins can read/write all rows.  
     • Employees can read/write only their own records (filter by `user_id`).
   - Always perform authorization checks server-side via Supabase policies.

---

## 3. Input Handling & Processing

- **Client-Side Validation:** Use React Hook Form + Zod for immediate feedback.  
- **Server-Side Validation:** Re-validate all inputs in edge-functions or API routes before database writes.
- **Prevent Injection:**
  • Supabase uses parameterized queries under the hood—avoid raw SQL.  
  • Never concatenate user input into SQL statements.
- **Sanitize Rich Text:** If you allow descriptions with HTML, use a sanitizer (e.g., DOMPurify).
- **Validate File Uploads (if any):** Check MIME type, extension, max size, and store uploads outside the public webroot in Supabase Storage.

---

## 4. Data Protection & Privacy

1. **Encryption**
   - Enforce HTTPS/TLS 1.2+ for all traffic between client, your front-end, and Supabase.
   - Supabase encrypts data at rest—ensure it’s enabled in your project settings.

2. **Secrets Management**
   - Store Supabase URL and anon/service_role keys in environment variables (`.env.local`), never commit to VCS.
   - Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) for production.

3. **PII Handling**
   - Minimize collection of personal data.  
   - Mask or redact sensitive fields in logs and error messages.

4. **Logging & Monitoring**
   - Log auth events, policy violations, and errors with a centralized solution (e.g., Datadog, Sentry).
   - Avoid logging raw PII or tokens.

---

## 5. API & Service Security

- **Rate Limiting & Throttling:** Implement on your API endpoints (e.g., via Vercel Edge Functions or API gateway) to mitigate brute-force or DoS attacks.
- **CORS Policy:** Restrict origins to your company’s domains. Avoid wildcard (`*`).
- **HTTP Methods & Endpoints:** Use correct verbs (GET for reads, POST for writes, PUT/PATCH for updates, DELETE for deletes).
- **Versioning:** Prefix API routes (`/api/v1/transactions`) to manage future changes without breaking clients.

---

## 6. Web Application Security Hygiene

1. **Security Headers** (configure in your hosting platform)
   - Content-Security-Policy (CSP) to limit scripts/styles to your domains.
   - Strict-Transport-Security (HSTS) with `max-age=31536000; includeSubDomains; preload`.
   - X-Content-Type-Options: `nosniff`.
   - X-Frame-Options: `DENY` or CSP `frame-ancestors 'none'`.
   - Referrer-Policy: `strict-origin-when-cross-origin`.

2. **CSRF Protection**
   - For any non-GET requests not authenticated purely via JWT in headers, implement synchronizer tokens.

3. **Secure Cookies**
   - All cookies set by your app must have `Secure; HttpOnly; SameSite=Strict`.

4. **Subresource Integrity (SRI)**
   - If loading third-party scripts/styles, include integrity hashes.

---

## 7. Infrastructure & Configuration Management

- **Environment Segregation:** Separate dev, staging, and prod with distinct Supabase projects and credentials.
- **Server Hardening:** Disable unused ports and services on servers hosting any custom functions or middleware.
- **TLS Configuration:** Use modern cipher suites; disable TLS ≤1.1.
- **Disable Debug in Prod:** Ensure Vite/React Developer Tools are inactive in production builds.
- **File Permissions:** Restrict file system access so that only the application user can read configuration and code.

---

## 8. Dependency Management

- **Lockfiles:** Commit `package-lock.json` or `yarn.lock` to maintain determinism.
- **Secure Dependencies:** Choose well-maintained libraries; avoid unnecessary packages.
- **Vulnerability Scanning:** Integrate SCA tools (e.g., Dependabot, Snyk) in your CI pipeline.
- **Regular Updates:** Periodically upgrade React, Vite, Tailwind, Supabase SDK, and other dependencies.

---

## 9. Error Handling & Monitoring

- **Generic User Messages:** Do not expose stack traces or database errors to end users.
- **Detailed Internal Logs:** Capture full exception details in your log monitoring solution.
- **Uptime & Alerts:** Monitor key endpoints (auth, transaction CRUD) and configure alerts on failures or latency spikes.

---

## 10. Next Steps & Compliance

- Review this guideline periodically (quarterly) and after major releases.
- Conduct security assessments and penetration tests before production deployment.
- Document your security posture and incident response plan for stakeholder review.
- Map your data handling processes to privacy regulations (GDPR/CCPA) if you manage EU/CA user data.

By adhering to these guidelines, your corporate finance tracker will be robust, secure, and ready for production usage in a business environment. Regularly revisit and update these practices as your application and threat landscape evolve.