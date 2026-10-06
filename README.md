# SkillBridge - Student Opportunity Platform

> A modular monolith connecting verified college students with hackathon squads, local business freelance projects, internships, and alumni mentors with mutual price agreements and direct peer-to-peer settlement verification.

---

## Architecture Overview

SkillBridge is built as a **modular monolith** with clear domain boundaries, strong type safety, and progressive feature flags:

```
skillbridge/
├── client/              # React (Vite), Tailwind CSS, React Router, TanStack Query, Socket.io
├── server/              # Node.js, Express, Mongoose, Zod, Firebase Admin / Dev Auth, Socket.io
│   └── src/modules/     # auth, users, portfolio, teams, projects, agreements,
│                        # reports, notifications, admin, + Phase 2 stubs (jobs, startups, ai)
├── worker/              # BullMQ + Redis background worker (auto-close teams, email dispatch)
├── .github/workflows/   # GitHub Actions CI for lint, test, and multi-package build
├── api-collection.json  # Postman API Collection
└── README.md
```

---

## Key Highlights & Business Rules

1. **Role-Specific Dashboards & Navigation**:
   - **Student**: College email verified (`.edu`, `.ac.in`), Hackathon Teams, Freelance Projects, Opportunities, Chat, Portfolio with stars, Recruiter visibility toggle.
   - **Local Business**: Post projects in INR (`₹`), review applicants, confirm mutual price agreements, approve deliverables.
   - **Company / Recruiter**: Kanban pipeline (`New`, `Shortlisted`, `Interview`, `Offer`, `Rejected`), Talent search across opted-in students.
   - **Startup / Founder**: Co-founder recruiting, open contributor roles.
   - **Mentor / Alumni**: 1:1 session scheduler, calendar sync.
   - **Admin**: Verification queue for students & businesses, moderation actions (`warn`, `suspend`, `ban`), tamper-evident audit logs.

2. **Price Agreement & Payment Settlement Ledger**:
   - **Direct Peer-to-Peer Settlement**: Students and businesses pay each other directly (UPI / IMPS / Cash); there are no in-app marketplace payments.
   - **Dual Mutual Confirmation**: A project transitions to status `assigned` **only after both sides** confirm the `PriceAgreementCard`.
   - **Payment Confirmation & Review Unlock**: Student taps `Payment received` after approval; verified reviews and reputation unlocks only after this step.

3. **Status Flow**:
   `open` ➔ `agreement_pending` ➔ `assigned` ➔ `in_review` ➔ `completed` (or `cancelled`)

---

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 20
- npm >= 10

### 1. Clone & Setup Environment
```bash
cp .env.example .env
cp .env.example server/.env
```

### 2. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
npm --prefix worker install
```

### 3. Seed Database with Realistic Test Accounts
```bash
npm run seed
```
*Note: If local MongoDB is not running, the application automatically launches an in-memory MongoDB instance for zero-friction local development!*

### 4. Run Development Servers
```bash
# Terminal 1: Run Express API Server & Socket.io (Port 5000)
npm run dev:server

# Terminal 2: Run React Client (Port 5173)
npm run dev:client

# Terminal 3 (Optional): Run BullMQ Background Worker
npm run dev:worker
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing & Quality Assurance

### Run Server Integration Tests (Vitest + Supertest)
```bash
npm run test:server
```
Executes all 22 integration tests covering:
- Auth & 6-digit college email verification
- Hackathon teams auto-closing logic & applications
- Freelance project status machine & dual agreement confirmations
- Payment received confirmation & review unlocks
- Real-time room chat and notification broadcasts
- Admin verification queue, moderation actions, and audit logging

### Run Client Production Build
```bash
npm run build
```

---

## Seeded Demo Accounts (One-Click Role Switcher)

In the top navbar, click the **"Role: [Role]"** dropdown to instantly switch context:
- **Student 1 (Aarav Sharma - IIT Delhi)**: `aarav.sharma@iitd.ac.in` (College Verified)
- **Student 2 (Priya Patel - Delhi University)**: `priya.patel@du.ac.in` (College Verified)
- **Local Business (Kaveri Artisan Bakery)**: `owner@kaveribakery.com` (Business Verified)
- **Company Recruiter (TechSprint Labs)**: `careers@techsprint.io`
- **Startup Founder (NexusAI)**: `ananya@nexusai.dev`
- **Mentor / Alumni (Vikram Nair)**: `vikram.nair@alumni.iitd.ac.in`
- **System Admin**: `admin@skillbridge.edu`
