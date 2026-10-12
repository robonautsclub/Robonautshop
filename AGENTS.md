# AGENTS.md

## Robotics E-Commerce Platform

This repository contains a modern e-commerce platform for robotics components, robot kits, STEM projects, and educational robotics products.

The long-term goal is to build:

> **Robotics Parts Store + Robot Builder + Robot Kits + Learning Platform**

The platform will initially focus on Bangladesh but should be architected so it can support international customers later.

---

# 1. PRIMARY OBJECTIVE

Build a reliable, scalable, maintainable robotics e-commerce platform where customers can:

* Browse robotics components
* Search for products
* Filter products
* Purchase individual components
* Purchase complete robot kits
* Build robots using a guided Robot Builder
* View required components for a robot project
* Learn through tutorials and guides
* Track their orders
* Manage their account

Administrators should eventually be able to:

* Manage products
* Manage categories
* Manage inventory
* Manage robot projects
* Manage robot kits
* Manage orders
* Manage customers
* Manage payments
* Manage shipping
* Manage content

---

# 2. DEVELOPMENT PRINCIPLE

## BUILD SMALL, TESTED FEATURES

Do NOT attempt to build the entire application in one task.

Every task must be:

1. Small
2. Focused
3. Testable
4. Reversible
5. Independently understandable

If a task says:

> "Implement X"

implement X only.

Do not automatically implement Y, Z, authentication, payments, admin panels, analytics, or other future features unless explicitly requested.

---

# 3. BEFORE CHANGING CODE

Before making changes:

1. Inspect the existing project structure.
2. Identify relevant files.
3. Understand existing patterns.
4. Check whether the requested functionality already exists.
5. Reuse existing components where appropriate.
6. Avoid unnecessary architectural changes.

Do NOT rewrite working code simply because another implementation is preferred.

---

# 4. TASK BOUNDARIES

When the user gives a task:

### First

Briefly determine:

* What needs to change
* Which files are relevant
* What dependencies are required

### Then

Implement only that task.

### Finally

Run appropriate checks.

At minimum, when applicable:

```bash
pnpm lint
pnpm typecheck
```

For build-related changes:

```bash
pnpm build
```

If these scripts do not exist, inspect `package.json` and use the appropriate existing commands.

When the task is actually finished, check its box in [tasks/README.md](tasks/README.md) and in that task file. Do not check a box for work that was not implemented.

---

# 5. STOP AFTER THE TASK

After completing the requested task:

DO NOT automatically continue with future features.

Do not build:

* Authentication
* Payments
* Checkout
* Admin
* Inventory
* Robot Builder
* Reviews
* Analytics

unless specifically requested.

The user will provide the next task.

---

# 6. TECHNOLOGY STACK

The preferred stack is:

## Frontend

* Next.js
* App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Backend

* Cloudflare Workers
* Hono
* TypeScript

## Database

* Cloudflare D1
* Drizzle ORM

## Storage

* Cloudflare R2

## Package Manager

Use:

> **pnpm**

Do not switch to npm or Bun unless explicitly requested.

Always use `pnpm` commands.

Examples:

```bash
pnpm install
pnpm add <package>
pnpm remove <package>
pnpm dev
pnpm build
pnpm lint
```

---

# 7. CLOUDFLARE

The application is intended to work well with Cloudflare infrastructure.

Expected infrastructure:

```text
Cloudflare
│
├── Workers
│   └── API
│
├── D1
│   └── Database
│
├── R2
│   └── Product/media storage
│
└── DNS
```

Do not introduce infrastructure that conflicts with this architecture without a clear reason.

---

# 8. DATABASE

Use:

```text
Cloudflare D1
+
Drizzle ORM
```

Database migrations must be tracked.

Never manually modify production database structure without a migration.

Every schema change should have an appropriate migration.

---

# 9. DATABASE DESIGN PRINCIPLES

Use:

* Proper primary keys
* Foreign keys where appropriate
* Unique constraints
* Indexes
* Timestamps
* Appropriate nullable/non-nullable fields
* Database-level constraints where practical

Avoid:

* Duplicate data
* Unnecessary JSON blobs
* Hard-coded relationships
* Unclear naming
* Storing calculated values when they can safely be calculated

However, JSON fields may be used where flexibility is genuinely useful, such as product technical specifications.

---

# 10. CORE DOMAIN MODEL

The platform revolves around several important concepts.

## Product

Something that can be sold.

Examples:

```text
Arduino Nano
N20 Gear Motor
IR Sensor Array
L298N Motor Driver
Robot Chassis
```

## Product Variant

A variation of a product.

Examples:

```text
Arduino Nano
├── Original
└── Compatible

N20 Motor
├── 100 RPM
├── 200 RPM
└── 300 RPM
```

## Category

Groups products.

Examples:

```text
Microcontrollers
Motors
Sensors
Motor Drivers
Chassis
Wheels
Batteries
Tools
```

## Robot Project

A robot someone wants to build.

Examples:

```text
Line Following Robot
Obstacle Avoiding Robot
Bluetooth Robot
Mini Sumo Robot
```

## Project Component

Connects a Robot Project to actual Products.

Example:

```text
Line Following Robot

Arduino Nano × 1
IR Sensor Array × 1
N20 Motor × 2
Motor Driver × 1
Wheels × 2
Chassis × 1
Battery × 1
```

## Kit

A collection of products sold together.

Example:

```text
LFR Starter Kit
```

---

# 11. PRODUCT DATA

Products should eventually support information such as:

```text
id
name
slug
sku
description
shortDescription
brand
categoryId
price
compareAtPrice
costPrice
weight
dimensions
status
featured
createdAt
updatedAt
```

Product specifications should be flexible.

Example:

```text
Operating Voltage: 5V
Current: 20mA
Dimensions: 32mm × 14mm
Interface: Digital
```

Do not create dozens of database columns for every possible robotics specification.

---

# 12. PRODUCT CATEGORIES

The initial catalog can include:

## Microcontrollers

* Arduino Uno
* Arduino Nano
* Arduino Mega
* ESP32
* ESP8266
* Raspberry Pi

## Sensors

* IR sensors
* IR sensor arrays
* Ultrasonic sensors
* Line sensors
* Encoders
* Gyroscopes
* Accelerometers
* IMUs
* Distance sensors

## Motors

* N20 motors
* DC motors
* Gear motors
* Servo motors
* Stepper motors

## Motor Drivers

* L298N
* L293D
* TB6612FNG
* Other motor drivers

## Chassis

* 2WD chassis
* 4WD chassis
* Acrylic chassis
* Mini robot chassis

## Wheels

* Standard wheels
* Rubber wheels
* Omni wheels
* Caster wheels

## Power

* Battery holders
* Batteries
* Battery connectors
* Switches
* Voltage regulators
* Charging modules

## Electronics

* Resistors
* Capacitors
* LEDs
* Transistors
* Diodes
* Breadboards
* PCBs

## Wires & Connectors

* Jumper wires
* Dupont connectors
* JST connectors
* Headers
* USB cables

## Mechanical

* Screws
* Nuts
* Bolts
* Spacers
* Brackets
* Gears

## Tools

* Multimeters
* Soldering equipment
* Screwdriver sets
* Wire cutters
* Wire strippers

---

# 13. ROBOT PROJECTS

The platform should eventually support:

### Line Following Robot

Possible components:

```text
Arduino Nano
IR Sensor Array
Motor Driver
N20 Motors × 2
Wheels × 2
Chassis
Battery
Battery Holder
Wires
Switch
```

### Obstacle Avoiding Robot

Possible components:

```text
Arduino
Ultrasonic Sensor
Servo
Motor Driver
Motors
Wheels
Chassis
Battery
```

### Bluetooth Robot

Possible components:

```text
Arduino
Bluetooth Module
Motor Driver
Motors
Wheels
Chassis
Battery
```

### Mini Sumo Robot

Possible components:

```text
Microcontroller
High Torque Motors
Motor Driver
Sensors
Wheels
Chassis
Battery
```

These are examples only.

Do not hard-code these relationships unless they are part of an explicitly requested task.

---

# 14. ROBOT BUILDER

Robot Builder is a major future feature.

Expected flow:

```text
User selects:

Line Following Robot
        ↓
Beginner
        ↓
Required Components
        ↓
Availability
        ↓
Price
        ↓
Total Cost
        ↓
Add Components
OR
Add Complete Kit
```

The Robot Builder must use actual products from the database.

Do not create a separate duplicate product database for the Robot Builder.

---

# 15. INVENTORY

Inventory must eventually support:

```text
SKU
Stock Quantity
Reserved Quantity
Available Quantity
Low Stock Threshold
```

Conceptually:

```text
Available Stock =
Total Stock - Reserved Stock
```

Inventory changes must be performed server-side.

Never trust a stock value sent from the browser.

Prevent overselling.

---

# 16. ORDERS

Order status and payment status must be separate.

Possible order statuses:

```text
PENDING
PAYMENT_PENDING
PAID
PROCESSING
PACKED
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

Possible payment statuses:

```text
PENDING
AUTHORIZED
PAID
FAILED
REFUNDED
CANCELLED
```

Do not combine these into one field.

---

# 17. PAYMENTS

**Current scope: bKash is the only supported payment method.** Do not build Cash on Delivery, Nagad, SSLCOMMERZ, or other providers unless explicitly requested. They are future work.

Longer term, the architecture should support:

* Cash on Delivery
* bKash
* Nagad
* SSLCOMMERZ
* Future payment providers

Use an abstraction such as:

```text
PaymentProvider
```

Do not tightly couple order creation to a single payment provider.

Payment webhooks must be verified server-side.

Never trust payment status supplied by the browser.

---

# 18. SHIPPING

**Current scope: no courier integrations.** Shipping is a flat/estimated delivery charge calculated server-side. Courier APIs are deferred until the store registers with a courier — do not build them unless explicitly requested.

The architecture should eventually support multiple courier providers.

Possible providers:

* Pathao
* Steadfast
* RedX
* Other courier APIs

Use a shipping abstraction.

Example concept:

```text
ShippingProvider
```

Do not place courier-specific logic throughout the application.

---

# 19. AUTHENTICATION

Initial roles:

```text
CUSTOMER
ADMIN
```

Future roles may include:

```text
STAFF
INVENTORY_MANAGER
ORDER_MANAGER
CONTENT_MANAGER
```

Authorization must always be enforced server-side.

Frontend hiding of admin controls is NOT sufficient security.

---

# 20. ADMIN

The eventual admin area will contain:

```text
/admin
```

Sections:

```text
Dashboard
Products
Categories
Inventory
Orders
Customers
Payments
Shipping
Robot Projects
Robot Kits
Coupons
Reviews
Content
Settings
```

Do not create the complete admin dashboard unless explicitly requested.

---

# 21. STORE ROUTES

Expected public routes include:

```text
/
 /products
 /products/[slug]
 /categories
 /categories/[slug]
 /kits
 /kits/[slug]
 /projects
 /projects/[slug]
 /cart
 /checkout
 /account
 /account/orders
 /account/orders/[id]
```

Use SEO-friendly slugs.

Do not expose database IDs in public URLs unless necessary.

---

# 22. SEO

Public product and project pages should eventually support:

* Metadata
* Open Graph
* Canonical URLs
* Sitemap
* robots.txt
* Product structured data
* Breadcrumb structured data

Example:

```text
/products/arduino-nano-v3
/products/n20-metal-gear-motor
/projects/line-following-robot
/kits/lfr-starter-kit
```

---

# 23. UI/UX

The visual direction should be:

* Modern
* Clean
* Technical
* Friendly
* Student-friendly
* Professional
* Mobile-first

Avoid making the storefront look like a generic corporate enterprise dashboard.

Avoid excessive gradients, excessive animations, and unnecessary visual complexity.

Prioritize:

* Product imagery
* Product information
* Price
* Stock
* Clear CTAs
* Search
* Filters
* Easy navigation

---

# 24. RESPONSIVE DESIGN

The application must work on:

* Mobile
* Tablet
* Laptop
* Desktop

Mobile is not an afterthought.

Pay special attention to:

* Navigation
* Product cards
* Product pages
* Cart
* Checkout
* Account pages
* Robot Builder

---

# 25. ACCESSIBILITY

Use accessible HTML and UI patterns.

Important requirements:

* Proper headings
* Labels for inputs
* Keyboard navigation
* Visible focus states
* Appropriate button elements
* Alt text for meaningful images
* Sufficient contrast
* Accessible dialogs
* Accessible dropdowns

Do not sacrifice accessibility for visual effects.

---

# 26. SECURITY

Always consider:

* Authentication
* Authorization
* Input validation
* SQL injection
* XSS
* CSRF where relevant
* Rate limiting
* Secure cookies
* Password hashing
* Payment webhook verification
* File upload validation
* Admin protection

Never trust the browser for:

* Product price
* Discount
* Stock
* Payment status
* User role
* Order status

Server-side validation is mandatory.

---

# 27. VALIDATION

Use Zod or an equivalent validation system where appropriate.

Validate:

* API input
* Forms
* Product data
* Orders
* Checkout
* Payment callbacks
* Admin actions

Validation errors should be clear and useful.

---

# 28. ERROR HANDLING

Do not silently swallow errors.

Avoid:

```ts
try {
  ...
} catch {
}
```

unless there is a documented reason.

Errors should:

* Be logged appropriately
* Return safe user-facing messages
* Avoid exposing secrets
* Preserve useful debugging information

---

# 29. ENVIRONMENT VARIABLES

Secrets must never be hard-coded.

Use environment variables.

Example:

```text
DATABASE_URL=
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
RESEND_API_KEY=
BKASH_CHECKOUT_URL_APP_KEY=
```

Maintain:

```text
.env.example
```

with placeholder values.

Never commit:

```text
.env
.env.local
```

or secret credentials.

---

# 30. TYPESCRIPT

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a specific justified reason.

Prefer:

* Interfaces
* Types
* Zod schemas
* Inferred types
* Explicit API response types

Keep types close to their domain where practical.

---

# 31. COMPONENT DESIGN

Prefer small reusable components. Do not duplicate code. If the same UI appears more than once, extract a shared component and reuse it.

For example:

```text
components/
├── ui/
├── product/
├── cart/
├── checkout/
├── robot/
├── account/
└── admin/
```

Avoid giant components containing hundreds of lines of unrelated logic.

---

# 32. SERVER VS CLIENT

Use Server Components by default where appropriate.

Only use Client Components when interactivity or browser APIs require them.

Do not add:

```text
"use client"
```

to entire page trees unnecessarily.

Keep server-side logic server-side.

---

# 33. API DESIGN

Use clear API boundaries.

Examples:

```text
/api/products
/api/categories
/api/cart
/api/orders
/api/payments
/api/shipping
/api/projects
/api/kits
```

Validate all external input.

Keep business logic out of UI components.

Prefer:

```text
UI
 ↓
API / Server Action
 ↓
Service
 ↓
Repository / Database
```

where appropriate.

---

# 34. BUSINESS LOGIC

Business logic should not be duplicated. Do not copy the same calculation, query, or rule into another file. Extract a shared function or service and reuse it.

For example, price calculation should have one authoritative implementation. The same rule applies to stock, discounts, shipping totals, and other business rules.

Do not calculate:

```text
cart total
```

differently in five components.

Create a reusable service/function.

The server is authoritative.

---

# 35. PRICING

Never trust client-provided prices.

When an order is created:

1. Fetch products from the database.
2. Verify products exist.
3. Verify availability.
4. Read current prices.
5. Calculate subtotal.
6. Apply valid discounts.
7. Calculate shipping.
8. Calculate final total.
9. Create the order.

---

# 36. PRODUCT IMAGES

Product images will eventually be stored in Cloudflare R2.

Do not store large image files directly inside D1.

Database should store image metadata and references.

Example:

```text
product_images
- id
- productId
- url/key
- alt
- sortOrder
```

---

# 37. FILE UPLOADS

When file uploads are implemented:

Validate:

* File type
* File size
* File extension
* Content type

Do not blindly trust the filename or MIME type.

Use secure object keys.

---

# 38. SEARCH

Start simple.

For an initial small catalog:

* Database search is acceptable.

As the catalog grows:

* Meilisearch
* Typesense
* Another dedicated search engine

may be introduced.

Do not add a search engine unnecessarily during the early project stages.

---

# 39. PERFORMANCE

Prioritize:

* Server rendering where appropriate
* Image optimization
* Lazy loading
* Small client bundles
* Efficient database queries
* Proper indexes
* Pagination
* Caching where appropriate

Do not prematurely optimize every small function.

Optimize measurable bottlenecks.

---

# 40. DATABASE QUERY RULES

Avoid:

```text
SELECT *
```

when only a few fields are required.

Avoid unnecessary database requests.

Avoid N+1 query patterns.

Use indexes for frequently queried fields such as:

* slug
* SKU
* categoryId
* status
* createdAt

---

# 41. TESTING

When tests are available, add tests for important business logic.

Priority:

1. Price calculation
2. Inventory reservation
3. Inventory release
4. Order creation
5. Payment verification
6. Authentication authorization
7. Robot project cost calculation

Do not create meaningless tests just to increase test count.

---

# 42. GIT

Use clear commits.

Good examples:

```text
feat: add product schema
feat: add product listing
feat: add cart service
fix: prevent inventory overselling
refactor: extract pricing service
docs: update setup instructions
```

Do not create commits with vague messages such as:

```text
update
changes
fix stuff
new
```

Do not commit secrets.

---

# 43. DEPENDENCY RULE

Before installing a package:

Ask:

> Do we actually need this?

Prefer existing capabilities and lightweight dependencies.

Do not add libraries just because they are popular.

When adding a dependency, ensure it works with:

* Next.js
* Cloudflare
* TypeScript
* pnpm

---

# 44. DO NOT OVER-ENGINEER

The application should start simple.

Do not create:

* Microservices
* Complex event buses
* Kubernetes
* Multiple databases
* Excessive abstraction layers

unless the project genuinely requires them.

A modular monolith is preferred initially.

---

# 45. FUTURE MULTI-TENANCY

The first version is a single store.

Do not implement multi-vendor or multi-tenant functionality unless explicitly requested.

However, avoid architectural decisions that would make future expansion impossible.

---

# 46. BANGLADESH REQUIREMENTS

The initial target market is Bangladesh.

Currently supported:

* BDT (৳)
* Bangladesh addresses
* Local phone numbers
* bKash (only payment method for now)

Future (not in current scope):

* Cash on Delivery
* Nagad
* SSLCOMMERZ
* Local courier services

Do not hard-code Bangladesh-specific assumptions into every part of the application.

Keep country/currency/payment/shipping logic modular.

---

# 47. INTERNATIONALIZATION

The first interface can be English.

Architecture should not make future Bangla support difficult.

Avoid hard-coding large amounts of UI text inside deeply nested business logic.

Future languages may include:

```text
English
Bangla
```

---

# 48. ROBOTICS-SPECIFIC UX

This is not a normal electronics store.

Where useful, products should eventually show:

### Compatibility

```text
Compatible with:
- Arduino
- ESP32
```

### Used In

```text
Used in:
- LFR Starter Kit
- Mini Sumo Robot
```

### Technical Specifications

```text
Voltage
Current
RPM
Torque
Dimensions
Interface
```

### Skill Level

For projects:

```text
Beginner
Intermediate
Advanced
Competition
```

Do not implement these features unless the current task requires them.

---

# 49. NO FAKE DATA

Do not create fake production data just to make the UI look populated.

If data does not exist yet:

Use:

* Empty states
* Loading states
* Placeholder UI where appropriate

Do not silently create fake products, fake orders, fake customers, or fake payments.

Development seed data is allowed only when explicitly requested.

Clearly separate seed/development data from production data.

---

# 50. LOADING STATES

Important asynchronous interfaces should have appropriate loading states.

Examples:

* Product loading
* Cart updates
* Checkout
* Admin tables
* Robot Builder
* Search

Prefer skeletons where appropriate.

---

# 51. EMPTY STATES

Create useful empty states.

Example:

```text
No products found.

Try:
- Changing your search
- Removing a filter
- Browsing another category
```

Do not show a blank screen.

---

# 52. RESPONSIBLE ERROR MESSAGES

Avoid technical messages such as:

```text
Error: DrizzleQueryError...
```

to normal users.

Show:

```text
Something went wrong.
Please try again.
```

while logging useful technical details server-side.

---

# 53. DOCUMENTATION

Maintain a useful README.

It should eventually contain:

* Project overview
* Requirements
* Installation
* Environment variables
* Development commands
* Database setup
* Cloudflare setup
* Deployment
* Architecture overview

Update documentation when major setup changes are made.

---

# 54. DEVELOPMENT WORKFLOW

The preferred workflow is:

```text
Understand
   ↓
Inspect
   ↓
Plan
   ↓
Implement
   ↓
Lint
   ↓
Type Check
   ↓
Test
   ↓
Fix
   ↓
Report
   ↓
STOP
```

---

# 55. RESPONSE FORMAT AFTER TASKS

After completing a task, report briefly:

```text
## Completed

- Item 1
- Item 2
- Item 3

## Files Changed

- file/path
- file/path

## Validation

- Lint: PASS/FAIL
- Typecheck: PASS/FAIL
- Build: PASS/FAIL

## Notes

Short explanation of important implementation details.

## Next

Wait for the user's next task.
```

Also check the task box in [tasks/README.md](tasks/README.md) and in the task file. Do not check a box for work that was not implemented.

Do not provide a long explanation unless requested.

---

# 56. IF SOMETHING IS UNCLEAR

If a requirement is genuinely ambiguous and the ambiguity could cause significant architectural problems:

Ask a concise clarification question.

Do not invent a major business rule.

For minor implementation details:

Use the simplest reasonable approach and document the assumption.

---

# 57. IF YOU FIND A BUG

If you discover an existing bug while working on an unrelated task:

Do not automatically refactor the entire area.

Determine whether it blocks the requested task.

If it does not block the task:

Mention it in the final report.

If it blocks the task:

Fix the smallest necessary portion.

---

# 58. IF THE BUILD IS BROKEN

Before assuming your changes caused the issue:

1. Check the error.
2. Determine whether it existed before the changes.
3. Fix only what is necessary.
4. Avoid unrelated refactoring.

Never hide build failures.

---

# 59. ARCHITECTURAL PRIORITY

When choosing between two valid approaches, prioritize:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Performance
6. Developer experience

Do not sacrifice security or correctness merely for development speed.

---

# 60. FINAL RULE

The most important rule in this repository is:

> **Do one small thing well before doing the next thing.**

Do not build the whole platform in one task.

Do not skip validation.

Do not invent business requirements.

Do not replace working architecture without a reason.

Do not create fake functionality.

Do not duplicate code. Write reusable components, functions, and services, and keep one authoritative implementation for each business rule.

Do not expose secrets.

Keep the codebase clean, modular, secure, and understandable.

The user controls the development sequence.

Wait for the next task after completing each requested task.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
