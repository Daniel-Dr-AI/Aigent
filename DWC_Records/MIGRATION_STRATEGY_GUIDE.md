# DWC RECORDS → Square + Calendar Migration Strategy

## Executive Summary

This guide outlines the recommended process for migrating from your current system to **Square for Payments/Products** and a **3rd Party Calendar App** (like Acuity, Calendly, or Square Appointments).

**Your Data:** 500K+ patient records across 18 files spanning 2000-2025

---

## PHASE 1: Data Categorization & Cleanup (Week 1-2)

### Step 1.1: Categorize Your Procedures into Types

Based on your data, procedures fall into these categories:

#### **SERVICES** (Calendar Booking Required)
- **Consultations**: New patient visits, follow-ups, exams
- **Treatments**: Lipo injections, weekly shots
- **Programs**: Month-to-month subscription plans

#### **PRODUCTS** (No Booking Required)
- **Medications**: Phentermine, HCTZ, diet medications
- **Supplements**: Vitamins, cleanses, NIC products
- **Retail**: Bracelets, merchandise

### Step 1.2: Create a Master Product/Service List

Create an Excel file with these columns:

| Old Code | New Name | Category | Square Category | Price | Booking Required | Duration | Notes |
|----------|----------|----------|-----------------|-------|------------------|----------|-------|
| 1 MONTH | 1-Month Program | Program | Services > Programs | $299 | Yes | 30 min | Initial consultation |
| 37.5 P 15 | Phentermine 37.5mg (15ct) | Medication | Products > Rx | $69 | No | N/A | With program |
| wkly | Weekly Injection | Treatment | Services > Treatments | $15 | Yes | 15 min | Follow-up |

**Action Items:**
1. Export all unique procedure codes to Excel
2. Manually review and categorize each one
3. Assign standard names (remove codes like "37.5 P 15", use "Phentermine 37.5mg 15-count")
4. Set standardized pricing
5. Determine which need appointments

---

## PHASE 2: Square Setup (Week 2-3)

### Step 2.1: Square Products/Services Configuration

**For PRODUCTS:**
```
Square Catalog Structure:
└── Products
    ├── Medications
    │   ├── Phentermine 37.5mg (15-count) - $69
    │   ├── Phentermine 37.5mg (30-count) - $129
    │   └── HCTZ 25mg w/Program - $XX
    ├── Supplements
    │   ├── Multivitamin & Mineral Formula - $XX
    │   ├── Weight Loss Plus - $XX
    │   └── Cleanse with Program - $XX
    └── Retail
        └── Magnetic Bracelet - $XX
```

**For SERVICES:**
```
Square Services Structure:
└── Services
    ├── Consultations (link to calendar)
    │   ├── New Patient Consultation - $XX (45 min)
    │   └── Follow-up Visit - $XX (15 min)
    ├── Programs (link to calendar)
    │   ├── 1-Month Program - $299 (30 min setup)
    │   ├── 2-Month Program - $XX (30 min setup)
    │   └── 4-Month Program - $XX (30 min setup)
    └── Treatments (link to calendar)
        ├── Weekly Injection - $15 (15 min)
        └── Individual Lipo Injection - $XX (15 min)
```

### Step 2.2: Square Import Process

**Option A: Manual Entry** (Recommended for <100 items)
- Manually create each product/service in Square Dashboard
- Set prices, descriptions, categories
- Upload photos

**Option B: CSV Bulk Import** (For 100+ items)
1. Download Square's CSV template
2. Map your data to Square's format:
   ```csv
   Token,Item Name,Description,Category,Price,SKU,Tax
   ,Phentermine 37.5mg (15ct),Weight loss medication,Medications,69.00,PHEN-37.5-15,Taxable
   ```
3. Import via Square Dashboard

---

## PHASE 3: Calendar Integration (Week 3-4)

### Step 3.1: Choose Your Calendar Platform

**Recommended Options:**

**Option 1: Square Appointments** (Best Integration)
- ✅ Built into Square - seamless payment
- ✅ Accepts deposits/prepayments
- ✅ Automatic reminders
- ❌ Limited customization

**Option 2: Acuity Scheduling** (Most Features)
- ✅ Highly customizable
- ✅ Intake forms, packages, memberships
- ✅ Integrates with Square via Zapier
- ❌ Monthly fee ($20-$61/mo)

**Option 3: Calendly** (Simplest)
- ✅ Easy to use
- ✅ Free tier available
- ❌ Limited payment integration
- ❌ Requires Zapier for Square connection

### Step 3.2: Configure Appointment Types

Map your services to appointment types:

| Service | Duration | Buffer | Booking Window |
|---------|----------|--------|----------------|
| New Patient Consultation | 45 min | 15 min | 24 hours min |
| Follow-up Visit | 15 min | 5 min | 2 hours min |
| Weekly Injection | 15 min | 5 min | 2 hours min |
| Program Setup (1/2/4 month) | 30 min | 15 min | 24 hours min |

**Key Settings:**
- Set minimum advance notice (prevents last-minute bookings)
- Add buffer time between appointments
- Configure business hours
- Set up automated reminders (24hr, 1hr before)

---

## PHASE 4: Data Migration & Mapping (Week 4-5)

### Step 4.1: Create Migration Mapping File

Use the Python scripts provided to generate `SQUARE_MIGRATION_MAPPING.xlsx` with:
- All current procedure codes
- Suggested Square names
- Categories
- Pricing analysis
- Usage frequency (prioritize high-usage items first)

### Step 4.2: Historical Data Strategy

**Do NOT migrate all 500k+ historical records to Square.**

Instead:
1. **Keep historical data** in Excel/CSV for reference
2. **Migrate only:**
   - Active patients (last 12 months)
   - Recurring subscriptions/programs
   - Outstanding balances
3. **Fresh start** in Square with clean data

---

## PHASE 5: Testing & Training (Week 5-6)

### Step 5.1: Test Workflows

Test these scenarios:
1. **Product Sale**: Customer buys Phentermine → Square POS → Payment
2. **Service Booking**: Customer books weekly injection → Calendar → Prepayment → Reminder
3. **Program Enrollment**: New patient → Consultation booking → Program purchase → Schedule follow-ups
4. **Walk-in**: Patient arrives without appointment → Quick booking → Service delivery → Payment

### Step 5.2: Staff Training

Train staff on:
- Square POS for checkout
- Calendar system for bookings/rescheduling
- Handling no-shows/cancellations
- Processing refunds
- Running reports

---

## PHASE 6: Go-Live & Transition (Week 6-8)

### Step 6.1: Soft Launch

**Week 6:**
- Run parallel systems (old + new)
- New bookings use new system only
- Existing appointments honor old system
- Monitor for issues

**Week 7:**
- Move all new transactions to Square
- Calendar mandatory for all services
- Old system read-only

**Week 8:**
- Full transition complete
- Decommission old system

### Step 6.2: Customer Communication

**Email template:**
```
Subject: Exciting Update - New Booking & Payment System!

We're upgrading to make your experience better:

✅ Online booking 24/7
✅ Automatic appointment reminders
✅ Faster checkout with Square
✅ Digital receipts

Starting [DATE], please use:
📅 Book appointments: [calendar link]
💳 Prepay or pay in office with Square

Questions? Call us at [number]
```

---

## PHASE 7: Post-Migration Optimization (Ongoing)

### Week 8+

**Monitor:**
- No-show rates (calendar reminders should reduce)
- Payment processing time (Square should speed up)
- Customer feedback
- Staff efficiency

**Optimize:**
- Adjust appointment durations based on actual times
- Bundle popular product+service combinations
- Create package deals in Square
- Set up loyalty programs

---

## COST BREAKDOWN

| Item | Cost | Notes |
|------|------|-------|
| Square | Free | 2.6% + 10¢ per transaction |
| Square Appointments | $0-$69/mo | Per staff member |
| OR Acuity Scheduling | $20-$61/mo | Recommended |
| OR Calendly | $0-$16/mo | Basic option |
| Migration Support (optional) | $1,000-$5,000 | Professional services |

**Estimated Total:** $20-$130/month ongoing

---

## CRITICAL SUCCESS FACTORS

### ✅ DO:
1. **Clean your data first** - Don't migrate messy data
2. **Start with top 20% of procedures** - 80/20 rule
3. **Test thoroughly** before go-live
4. **Train staff extensively**
5. **Communicate clearly** with customers
6. **Keep old system as backup** for 3-6 months

### ❌ DON'T:
1. **Don't migrate all historical data** - too messy
2. **Don't launch without testing**
3. **Don't change everything at once** - phase it
4. **Don't forget about taxes** - configure in Square
5. **Don't skip staff training**

---

## MIGRATION TIMELINE SUMMARY

```
Week 1-2:  Data cleanup & categorization
Week 2-3:  Square setup & import
Week 3-4:  Calendar configuration
Week 4-5:  Create mappings & test imports
Week 5-6:  Testing & staff training
Week 6-7:  Soft launch (parallel systems)
Week 7-8:  Full transition
Week 8+:   Optimization
```

**Total Time: 6-8 weeks** for complete migration

---

## NEXT STEPS - START HERE

1. ✅ **Review the SQUARE_MIGRATION_MAPPING.xlsx** file (being generated)
2. ✅ **Download the normalization scripts** from this repository
3. ⬜ **Choose your calendar platform** (Square Appointments vs Acuity vs Calendly)
4. ⬜ **Create your Master Product/Service List** (use template above)
5. ⬜ **Set up Square account** (if not already)
6. ⬜ **Schedule team meeting** to review migration plan

---

## SUPPORT & RESOURCES

**Square Resources:**
- Square Dashboard: https://squareup.com/dashboard
- Square Catalog Import Guide: https://squareup.com/help/us/en/article/5555
- Square API Docs: https://developer.squareup.com/

**Calendar Platforms:**
- Square Appointments: https://squareup.com/appointments
- Acuity Scheduling: https://acuityscheduling.com
- Calendly: https://calendly.com

**Integration:**
- Zapier (Square ↔ Calendar): https://zapier.com

---

**Questions? Review the generated SQUARE_MIGRATION_MAPPING.xlsx file for specific recommendations on each of your procedures.**
