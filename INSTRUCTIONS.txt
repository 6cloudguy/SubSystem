# BRIGHTLOOP SOFTWARE

# Subscription Management System

**System Design & Hackathon Implementation Blueprint**

| Document detail | Decision |
|---|---|
| Version | Final design – 2.0 |
| Application architecture | Next.js full-stack application |
| Backend API | Next.js Route Handlers |
| Database | PostgreSQL |
| Database access | Prisma ORM |
| Development database hosting | One team-managed Windows computer on the team's private Wi-Fi/LAN |
| Source control | Git + GitHub |

## Purpose

This document defines the product scope, system architecture, database design direction, workflows, security expectations, APIs, and a practical AI-assisted implementation sequence for the Brightloop Subscription Management System.

## Important scope note

The shared Windows-hosted PostgreSQL server described here is for team development on a trusted private network. Production hosting, domain, backups, and deployment infrastructure must be selected separately before launch.

# 1. Product overview

Brightloop Software sells software subscriptions on monthly and yearly terms, as well as add-ons and products that may have variants. Existing processes are fragmented across spreadsheets, manual renewal reminders, manually prepared invoices, bank-statement matching, and quarterly reporting. The proposed system centralizes customer, product, plan, subscription, invoicing, payment, and reporting workflows.

## 1.1 Primary goals

- Maintain a single source of truth for customers, products, plans, subscriptions, invoices, and payments.
- Automate recurring invoice preparation and renewal tracking.
- Make subscription lifecycle actions consistent with each plan's configured rules.
- Provide clear visibility into paid, outstanding, and overdue amounts.
- Provide role-based access for administrators, internal staff, and customers.

## 1.2 Users and roles

| Role | Typical permissions |
|---|---|
| Administrator | Manage staff, settings, products, plans, tax, discounts, templates, and all operational records. |
| Internal staff | Manage assigned customers, quotations, subscriptions, invoices, and payment records according to permissions. |
| Customer | View own profile, quotations, subscriptions, invoices, payment status, and permitted self-service actions. |

# 2. Scope and functional requirements

## 2.1 Authentication and access

- User signup/login with unique email address.
- Password policy from the brief: more than eight characters, including uppercase, lowercase, and a special character.
- Password reset through a time-limited email link.
- Role-based authorization. Only administrators can create internal staff accounts.
- Customers must only access their own records.

## 2.2 Product and variant management

- Product fields: name, type, sales price, cost price, notes, and status.
- Support product variants where a variant can adjust the base price.
- Validate prices and quantities on the server; do not trust browser-submitted totals.

## 2.3 Plans and pricing rules

- Plan fields include price, billing interval (daily, weekly, monthly, yearly), minimum quantity, availability dates, and lifecycle permissions.
- Plan rules determine whether a subscription can be paused, closed early, renewed, or automatically closed.
- Store the billing interval and lifecycle rules explicitly so invoice generation can apply them consistently.

## 2.4 Quotations and subscriptions

- Support quotation templates and quotation validity periods.
- A subscription contains a unique number, customer, plan, start/end dates, payment terms, and item lines.
- Each line stores product/variant, quantity, unit price, tax, discount if applicable, and calculated amount.
- Subscription states: Draft → Quotation → Confirmed → Active → Closed.
- Support pause, early close, and renewal only when allowed by the selected plan.

## 2.5 Invoices, taxes, discounts, and payments

- Generate recurring invoices according to the subscription billing schedule.
- Invoice states: Draft → Confirmed → Paid, with cancellation handled as a controlled action.
- Support confirm, cancel, send, and print operations.
- Configure tax rules and discounts (fixed or percentage), including minimums, effective dates, usage limits, and applicable scope.
- Record payments and track paid, outstanding, and overdue balances.
- Support manual payment entry and reconciliation workflow; bank integration is not assumed unless separately approved.

## 2.6 Dashboard and reports

- Show active subscriptions, revenue indicators, payments received, overdue invoices, and outstanding balances.
- Provide date, status, customer, and other useful filters.
- Define revenue metrics carefully (for example, invoiced revenue versus cash received) to avoid misleading totals.

# 3. System architecture

## 3.1 Selected technology stack

| Layer | Selected technology | Purpose |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Pages, forms, tables, dashboards, and customer/staff interfaces. |
| Styling | Tailwind CSS | Consistent responsive UI styling. |
| Backend | Next.js Route Handlers (Node.js runtime) | Authentication endpoints, business rules, validation, and API operations. |
| Database | PostgreSQL | Persistent relational storage and transactional operations. |
| ORM | Prisma ORM | Typed database access, schema definition, and versioned migrations. |
| Database administration | pgAdmin 4 | Inspect and manage the PostgreSQL server. |
| Authentication | Server-side sessions + password hashing | Secure login, session management, and role checks. |
| Email | Resend or another approved email provider | Password resets, quotation/invoice delivery, and notices. |
| Charts | Recharts | Dashboard visualizations. |
| Version control | Git + GitHub | Code collaboration, review, and migration history. |

## 3.2 Logical architecture

| Component | Responsibilities |
|---|---|
| Browser UI | Renders screens; collects input; displays validated server responses. |
| Next.js application | Pages, Route Handlers, server-side validation, authorization, and business workflows. |
| Service/domain layer | Subscription lifecycle, billing calculations, discounts, tax calculations, and invoice generation. |
| Prisma data layer | Typed queries and transactions between application logic and PostgreSQL. |
| PostgreSQL | Users, customers, catalog, plans, subscriptions, invoices, payments, settings, and audit records. |
| External services | Email provider; optional payment gateway or accounting integration if approved. |

## 3.3 Shared development database arrangement

One team-managed Windows laptop runs the PostgreSQL development server. Other team members run their own Next.js application locally and connect to that server over the team's trusted private Wi-Fi/LAN. The database server must remain powered on and reachable while teammates are working.

**Security boundary:** Restrict PostgreSQL network access to the team's private subnet, use password authentication (SCRAM-SHA-256), restrict Windows Firewall inbound access to that subnet, and do not configure router port forwarding or expose port 5432 to the public internet. If the team later works across different networks, use an approved VPN or properly secured server instead.

GitHub stores application source code, Prisma schema, migration files, seed scripts, and environment-variable examples. GitHub does not host the live PostgreSQL database or its records.

## 3.4 Environment separation

| Environment | Purpose | Rule |
|---|---|---|
| Development | Shared team database for hackathon development. | Use fake/demo records; coordinate schema changes. |
| Testing | Isolated test database or disposable test instance. | Never run destructive tests against shared development data. |
| Production | Live customer/business data. | Separate secured host, restricted access, backups, monitoring, and deployment plan required. |

# 4. Initial database model

The following is the proposed logical entity set. Exact columns, constraints, and relationships should be agreed before the first migration is committed.

| Entity | Purpose / key relationships |
|---|---|
| User | Login identity, email, password hash, role, active status. |
| Role / Permission | Authorization roles and permission definitions, if granular permissions are required. |
| Customer | Customer/business profile and contact details; may link to a customer portal user. |
| Product | Sellable product/add-on, type, sales and cost prices. |
| ProductVariant | Variant attributes and price adjustment or final price. |
| Plan | Billing interval, base price, minimum quantity, availability, lifecycle rules. |
| Quotation | Customer proposal, validity, status, template, totals. |
| QuotationLine | Products/plans, quantities, price, discount, tax, line totals. |
| Subscription | Subscription number, customer, plan, dates, payment terms, lifecycle status. |
| SubscriptionLine | Billable items and quantities attached to a subscription. |
| Invoice | Invoice number, issue/due dates, status, currency, subtotal, tax, discount, total, balance. |
| InvoiceLine | Snapshot of item description, quantity, unit price, tax, and line amount at invoice time. |
| Payment | Payment date, amount, method, reference, status, and customer/invoice association. |
| PaymentAllocation | Allocates a payment across one or more invoices, if partial or combined payments are supported. |
| TaxRule | Tax name, rate, applicability, effective dates, and status. |
| Discount | Fixed/percentage value, minimum, validity, usage limit, and scope. |
| SubscriptionEvent | Lifecycle history: pause, resume, renewal, close, and actor/time. |
| AuditLog | Important user actions and before/after metadata for accountability. |

## 4.1 Data design rules

- Use primary keys and foreign keys; enforce uniqueness for emails and business document numbers.
- Use PostgreSQL NUMERIC/DECIMAL for money values (or integer minor units), never binary floating-point types for financial amounts.
- Store currency explicitly if multiple currencies may be used.
- Store timestamps consistently; define the business timezone for billing dates and due dates.
- Invoice lines should preserve a snapshot of the billed description, price, and tax so later catalog changes do not rewrite historical invoices.
- Use database transactions for invoice creation, payment allocation, and subscription renewal.
- Use soft deletion or status changes for business records where historical traceability is required.

# 5. Core business workflows

## 5.1 Customer and staff onboarding

1. Administrator creates staff account. 2. User receives an invitation or reset link. 3. User sets a password. 4. Server stores a password hash, not the raw password. 5. Role checks are applied on every protected server operation.

## 5.2 Quotation-to-subscription flow

Create quotation → validate customer, plan, products, quantities, tax and discount → calculate totals on server → send quotation → customer accepts or staff confirms → create/confirm subscription → activate according to start date and payment/business rules.

## 5.3 Recurring billing flow

A scheduled billing process identifies subscriptions due for billing → checks status and plan rules → determines billing period → calculates line items, discounts and taxes → creates invoice in a database transaction → records the next billing date → sends invoice notification. The process must be idempotent so a retry does not create duplicate invoices.

## 5.4 Payment and reconciliation flow

Record payment → validate amount and reference → allocate payment to invoice(s) → recalculate invoice balance → update invoice status → record audit event. If payment is partial, retain the remaining balance. Reconciliation against bank statements may initially be a controlled manual workflow.

## 5.5 Subscription lifecycle

| Action | Expected control |
|---|---|
| Pause | Allowed only if plan permits; record pause date and expected/resolved resume date. |
| Resume | Recalculate or preserve billing schedule according to an explicit business rule. |
| Early close | Check plan permission, effective date, and any prorating/refund policy. |
| Renew | Create the next term and billing schedule without duplicating prior invoices. |
| Auto-close | Close only when plan/end-date rules require it; retain history. |

# 6. API design direction

Use Next.js Route Handlers under app/api. Keep route handlers thin: validate the request, authenticate and authorize the actor, call a domain/service function, and return a consistent response.

| Area | Example endpoints |
|---|---|
| Authentication | POST /api/auth/login · POST /api/auth/logout · POST /api/auth/forgot-password · POST /api/auth/reset-password |
| Users/staff | GET /api/users · POST /api/users · PATCH /api/users/:id |
| Customers | GET /api/customers · POST /api/customers · GET /api/customers/:id |
| Products | GET /api/products · POST /api/products · PATCH /api/products/:id |
| Plans | GET /api/plans · POST /api/plans · PATCH /api/plans/:id |
| Quotations | GET /api/quotations · POST /api/quotations · POST /api/quotations/:id/confirm |
| Subscriptions | GET /api/subscriptions · POST /api/subscriptions · POST /api/subscriptions/:id/pause · POST /api/subscriptions/:id/renew |
| Invoices | GET /api/invoices · POST /api/invoices · POST /api/invoices/:id/confirm · POST /api/invoices/:id/cancel |
| Payments | GET /api/payments · POST /api/payments · POST /api/payments/:id/allocate |
| Dashboard | GET /api/dashboard/summary · GET /api/dashboard/revenue |

## API conventions

- Use appropriate HTTP methods and status codes; validate all input on the server.
- Return consistent error structures; never expose stack traces or secrets to the browser.
- Apply pagination and filters to list endpoints.
- Enforce role and ownership checks in server code, not merely by hiding UI controls.
- Use idempotency keys or unique business constraints for retryable billing/payment operations.

# 7. Security and reliability

- Hash passwords with a modern password-hashing algorithm such as Argon2id or bcrypt using a suitable work factor.
- Use secure, HttpOnly, SameSite cookies for server-managed sessions; protect state-changing requests against CSRF as appropriate.
- Rate-limit login and password-reset attempts; use short-lived, single-use reset tokens stored hashed.
- Never commit `.env`, database passwords, API keys, email credentials, or real customer data.
- Use least-privilege database accounts; avoid using the PostgreSQL superuser from the application.
- Validate authorization on every API request and scope customer queries to the authenticated customer.
- Use HTTPS in production; keep development network access private.
- Back up the shared development database if important team data must be retained. Production requires automated backups and restore testing.
- Record audit events for sensitive operations such as changing plans, confirming invoices, allocating payments, and closing subscriptions.

# 8. Non-functional requirements and acceptance targets

| Requirement | Target / design response |
|---|---|
| Performance | Common pages and API operations should respond in under 2 seconds under expected hackathon-scale load; use pagination, indexes, and measured queries. |
| Scale | Support thousands of subscriptions with indexed customer/status/date fields and paginated lists. |
| Correctness | Use transactions, decimal money arithmetic, server-side calculations, and idempotent billing. |
| Security | Role-based access, secure sessions, password hashing, network restrictions, and secrets management. |
| Maintainability | TypeScript, shared validation schemas, modular services, Prisma migrations, and code review. |
| Usability | Clear statuses, actionable validation messages, filters, and responsive layouts. |

# 9. AI-assisted development strategy

AI coding agents should work from small, explicit tasks and a shared source of truth. Do not ask an agent to generate the entire application in one prompt.

## 9.1 Repository instructions to give every AI agent

- Use Next.js App Router, TypeScript, Next.js Route Handlers, PostgreSQL, and Prisma.
- Do not introduce Supabase or Firebase.
- Do not create a second backend framework unless the team changes the architecture decision.
- Keep business logic in reusable server-side service modules; keep route handlers thin.
- All money calculations must use decimal-safe arithmetic and server-side validation.
- Follow the committed Prisma schema and migrations; do not silently rename or remove fields.
- Never place secrets in source code or return sensitive data to the client.
- Include tests and a short explanation of files changed for each task.

## 9.2 Suggested team workstreams

| Workstream | Deliverables |
|---|---|
| Foundation / database owner | Prisma schema, migrations, seed data, DB connection, shared conventions. |
| Authentication / access | Login, sessions, password reset, roles, staff management, authorization tests. |
| Catalog / plans | Product and variant CRUD, plan rules, pricing validation. |
| Commercial workflows | Quotation, subscription lifecycle, renewal rules, recurring invoice generation. |
| Finance / reporting | Tax, discounts, payments, outstanding/overdue logic, dashboard metrics. |
| Integration / QA | Email integration, end-to-end tests, integration fixes, demo data and presentation. |

Assign owners based on actual team size; one person may own multiple workstreams. The database owner should review schema changes before they are merged.

## 9.3 Recommended implementation milestones

| Milestone | Definition of done |
|---|---|
| 1. Foundation | GitHub repository, Next.js app, PostgreSQL connection, Prisma initialized, first migration committed. |
| 2. Authentication | Login/logout, secure sessions, role checks, admin-created staff, password reset flow. |
| 3. Master data | Customer, product, variant, plan, tax, and discount management. |
| 4. Commercial flow | Quotation creation and confirmation; subscription creation and lifecycle actions. |
| 5. Billing | Recurring invoice generation, invoice states, payment records, balances, and overdue calculations. |
| 6. Dashboard | Accurate KPIs, filters, reports, and usable demo data. |
| 7. Stabilization | Security review, test pass, backup/restore rehearsal, bug fixes, demo rehearsal. |

# 10. Repository and environment setup

## Recommended project structure

```text
brightloop-subscriptions/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   └── ...
├── components/
├── lib/
│   └── prisma.ts
├── services/
├── validations/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env
├── .env.example
├── .gitignore
├── prisma.config.ts
└── package.json
```

## Prisma workflow

1. Edit `prisma/schema.prisma`. 2. Review the change with the database owner. 3. Create a named migration using `npx prisma migrate dev --name descriptive_change`. 4. Commit both schema and migration files to GitHub. 5. Other developers pull the change and apply committed migrations to the shared development database using the team's agreed deployment workflow. Do not reset the shared database to resolve ordinary development errors.

## Environment variables

Each developer keeps their actual connection string in a local `.env` file. Commit only `.env.example` with placeholder values. For the host laptop, the database URL uses `localhost`; for other laptops, it uses the host's private LAN IP address. Never commit the real password.

# 11. Important assumptions and decisions still open

- The shared PostgreSQL laptop is a development arrangement only; production hosting has not been selected.
- Payment gateway integration is not assumed; manual payment entry and tracking are in scope until a provider is chosen.
- Bank statement reconciliation is initially treated as a controlled manual workflow unless a file-import/integration requirement is confirmed.
- Currency, tax jurisdiction, invoice numbering format, prorating/refund rules, and exact renewal timing must be confirmed with the product owner.
- Email provider and deployment platform remain to be selected.
- The exact meaning of revenue metrics (cash received, invoices issued, or recognized revenue) must be agreed before dashboard implementation.

# 12. Definition of a successful hackathon MVP

- An administrator can sign in and create staff accounts.
- Staff can manage customers, products, variants, and subscription plans.
- A quotation can be created and converted into a subscription.
- Subscription lifecycle rules are enforced by the server.
- An active subscription can generate a recurring invoice without duplicates.
- Payments can be recorded and invoice balances/statuses update correctly.
- The dashboard displays consistent subscription, invoice, and payment metrics.
- Customer and staff permissions are tested; no user can access another customer's private records.

---

**End of document · Brightloop Subscription Management System · Final design 2.0**
