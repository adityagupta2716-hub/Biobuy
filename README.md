# BioBuy — Biotechnology Team Procurement Platform

> **“Equip Your Lab. Empower Your Research.”**

BioBuy is a modern, professional, fully functional biotechnology procurement platform designed for student research teams, laboratory units, and scientific procurement hackathons/challenges.

The core workflow is streamlined for instant scientific procurement:
**Join a Team → Browse Biotech Products → Select Quantity → Click Buy Now → Money Deducted → Stock Updated for Everyone.**

---

## 🔬 Key Features & Architecture

### 1. Scientific Aesthetics & Visual Identity
- Scientific navy, teal, and slate palette with subtle green available badges and amber/red depletion alerts.
- High-resolution lab photography and curated catalog of 21+ biotechnology products with verified specifications, storage temperatures, catalog numbers, and unit measurements.
- 100% responsive design across Desktop, Laptop, Tablet, and Mobile devices.

### 2. Team Authentication & Virtual Budget System
- Configurable **₹10,000 initial virtual budget** per team.
- Join existing teams or create custom research teams (e.g. *Team Alpha Genome Engineering*, *Team Beta Protein Therapeutics*, *Team Gamma Metabolic Assay Lab*).
- Persistent balances and purchase histories preserved across sessions.
- Dynamic Budget Gauge with color-shifting visual meter, low-balance warnings (< ₹2,000), and real-time deductions.

### 3. Instant "Buy Now" Procurement System
- **No cart, no checkout redirects, no payment gateway friction.**
- Select quantity, click **BUY NOW**, and purchase is verified atomically against the database.
- Server-grade transaction safeguards: locks inventory row, verifies sufficient stock and team budget, deducts funds, decrements global inventory, records snapshot prices, and logs to the audit ledger.
- Double-click and rapid submission prevention with per-product mutex state and idempotency safeguards.

### 4. Shared Inventory & Real-Time Synchronization
- All teams purchase from the **same global product inventory**.
- Cross-tab & multi-user live synchronization via `BroadcastChannel` and Supabase Realtime subscriptions.
- If Team Alpha purchases 3 packs of pipette tips, Team Beta's browser instantly updates from 20 to 17 packs without refreshing.

### 5. Complete 7-Category Product Catalog
1. **Laboratory Equipment** (Micropipettes, Vortex Mixers, Centrifuges, pH Meters, Hotplate Stirrers)
2. **Reagents and Raw Materials** (Agarose, PBS Tablets, Tris-HCl Buffer, Nuclease-Free Water)
3. **Assay Kits** (Bradford Protein Assay, BCA Protein Assay, Glucose Assay, MTT Cell Viability)
4. **Molecular Biology** (gDNA Extraction Kits, RNA Purification Kits, 2X Taq Master Mix, 1kb Plus DNA Ladder)
5. **Cell Culture** (T-75 Culture Flasks, DMEM High-Glucose Medium, Serological Pipettes)
6. **Laboratory Consumables** (200 µL Pipette Tips, 1.5 mL Safe-Lock Tubes, PCR Tubes, Nitrile Gloves, Spectrophotometer Cuvettes)
7. **Analytical and Testing Equipment** (Nanodrop Spectrophotometer, Digital Pocket Conductivity & TDS Tester)

### 6. Team Purchase History & Audit Ledger
- Immutable purchase snapshots (product name, unit price at purchase time, unit of sale, quantity, total deducted, transaction ID, and timestamp).
- Summary KPI cards (Total transactions, Units acquired, Total spent, Remaining budget).
- One-click CSV Export.

### 7. Administrator Control Dashboard
- Add new biotechnology products.
- Edit existing product prices, descriptions, and stock levels.
- Toggle product visibility (Active/Hidden).
- Adjust team budgets with reason tracking.
- Supervise global purchase ledger across all teams.
- Low-stock inventory replenishment alerts (≤ 5 units).

### 8. Multi-Team Competition Simulator
- Interactive simulator allowing researchers and hackathon evaluators to test multi-team procurement and race conditions side-by-side with live activity log.

---

## 🗄️ Database Schema & SQL Migrations

Located in `supabase/migrations/20261010000000_biobuy_schema.sql` and `supabase/seed.sql`:

- `teams` — Team ID, Name, Initial Budget, Remaining Balance, Timestamps.
- `team_members` — Team ID, User ID, User Name, Role, Timestamps.
- `products` — Product ID, Name, Description, Category, Subcategory, Catalog Number, Price, Unit of Sale, Pack Size, Specifications JSONB, Storage Info, Stock Quantity, Active Flag.
- `purchases` — Immutable Transaction ID, Team ID, Product Snapshot, Price Snapshot, Quantity, Total Amount, Status.
- `budget_transactions` — Audit ledger tracking balance before/after for every purchase or admin adjustment.
- `process_purchase(...)` — PostgreSQL Stored Procedure with row locks (`FOR UPDATE`) for atomic transactions.
- Row-Level Security (RLS) policies protecting team data and admin capabilities.

---

## 🚀 Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

3. (Optional) Connect to Supabase:
Create a `.env` file from `.env.example` and supply:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Execute `supabase/migrations/20261010000000_biobuy_schema.sql` and `supabase/seed.sql` in the Supabase SQL Editor.
