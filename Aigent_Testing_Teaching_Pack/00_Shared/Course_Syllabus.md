# Aigent Testing & Learning Course Syllabus

**Course Name:** Complete Aigent System Testing & Operations
**Duration:** 15-20 hours (self-paced)
**Prerequisites:** None — complete beginners welcome!
**Difficulty:** Beginner to Intermediate

---

## Welcome to Your Learning Journey!

This course will teach you everything you need to know about testing and operating the Aigent Universal Clinic Template system.

**By the end of this course, you will:**
- Understand how all 10 modules work together
- Be able to test each module thoroughly and confidently
- Know how to find and document problems
- Feel comfortable training others on the system
- Understand healthcare automation and compliance basics

---

## How This Course Works

### Self-Paced Learning
- Work through modules at your own speed
- Spend extra time on topics that interest you
- Repeat tests as many times as needed
- Take breaks between modules

### Hands-On Practice
- Every section includes practical exercises
- You'll run real tests using safe mock data
- You'll see actual results and learn to interpret them
- You'll make intentional mistakes to learn what happens

### Learning by Doing
- Read the explanation
- Try the test yourself
- Observe what happens
- Understand why it matters

---

## Course Structure

### Phase 1: Foundations (2-3 hours)
**Goal:** Understand the basics before diving into specific modules

#### Week 1, Day 1: Getting Started
- **Read:** Main README.md (30 minutes)
- **Read:** EnvMatrix.md to understand system connections (30 minutes)
- **Review:** MockIdentities.json — meet your fake patients! (15 minutes)
- **Learn:** How to use BugReport_Template.md (15 minutes)
- **Setup:** Verify your n8n environment is ready (30 minutes)

**Learning Objectives:**
- Understand what Aigent does and why testing matters
- Know what environment variables are and why they're important
- Be comfortable with mock data vs. real patient data
- Know where to look for help when stuck

**Key Takeaway:** Testing with fake data in a safe environment protects real patients and helps you learn without risk.

---

### Phase 2: Core Patient Flow (6-8 hours)
**Goal:** Master the essential patient journey from first contact through payment

#### Week 1, Day 2-3: Module 01 — Intake & Lead Capture (2 hours)
- **Read:** TestPlan.md and TeachingNotes.md (30 minutes)
- **Practice:** Run all test cases from TestCases.md (60 minutes)
- **Try:** Invalid inputs intentionally to see error handling (20 minutes)
- **Review:** KeyPoints.md and check Observability.md (10 minutes)

**Learning Objectives:**
- Understand how new patients enter the system
- Test webhook data reception and validation
- Verify Google Sheets integration
- Check compliance logging for intake events

**Real-World Application:** If intake fails, your clinic loses potential patients. This is the first impression!

---

#### Week 1, Day 4-5: Module 02 — Consult Booking & Scheduling (2 hours)
- **Read:** TestPlan.md and understand calendar sync (30 minutes)
- **Practice:** Book appointments with various scenarios (60 minutes)
- **Test:** Time zone handling and double-booking prevention (20 minutes)
- **Review:** Troubleshooting.md for common calendar issues (10 minutes)

**Learning Objectives:**
- Test appointment scheduling with Google Calendar/Cal.com
- Verify email confirmations are sent correctly
- Handle timezone conversions accurately
- Prevent double-booking scenarios

**Real-World Application:** Scheduling errors frustrate patients and waste staff time. Accurate bookings are critical.

---

#### Week 2, Day 1-2: Module 03 — Telehealth Session (2 hours)
- **Read:** TestPlan.md focusing on PHI masking (30 minutes)
- **Practice:** Generate telehealth links for different platforms (45 minutes)
- **Test:** Session expiration and provider privacy (30 minutes)
- **Security:** Verify PHI masking in logs (15 minutes)

**Learning Objectives:**
- Create video session links (Zoom, Doxy.me, Amwell)
- Understand PHI (Protected Health Information) protection
- Test session expiration logic
- Verify provider privacy controls

**Real-World Application:** Video visits are healthcare! Privacy violations can result in massive fines and loss of trust.

---

#### Week 2, Day 3-4: Module 04 — Billing & Payments (2 hours)
- **Read:** TestPlan.md with attention to PCI compliance (30 minutes)
- **Practice:** Process test payments through Stripe (45 minutes)
- **Test:** Failed payments, refunds, and partial payments (30 minutes)
- **Security:** Verify credit card masking in logs (15 minutes)

**Learning Objectives:**
- Process payments securely through Stripe
- Handle failed payment scenarios gracefully
- Understand PCI-DSS compliance basics
- Test invoice generation and email delivery

**Real-World Application:** Payment errors directly impact clinic revenue. Security breaches can destroy businesses.

---

### Phase 3: Patient Engagement & Operations (4-5 hours)
**Goal:** Understand retention, document processing, and communication

#### Week 2, Day 5 & Week 3, Day 1: Module 05 — Follow-Up & Retention (2 hours)
- **Read:** TestPlan.md understanding multi-touch sequences (30 minutes)
- **Practice:** Run complete 14-day follow-up sequence (60 minutes)
- **Test:** Wait nodes and engagement tracking (20 minutes)
- **Review:** Email and SMS touch point effectiveness (10 minutes)

**Learning Objectives:**
- Understand multi-touch engagement strategy (Day 0, 3, 7, 14)
- Test wait nodes and timing logic
- Verify email and SMS delivery
- Track engagement metrics

**Real-World Application:** Patient retention drives recurring revenue. Automated follow-ups save staff hours daily.

---

#### Week 3, Day 2: Module 06 — Document Capture & OCR (2 hours)
- **Read:** TestPlan.md focusing on security validation (30 minutes)
- **Practice:** Upload various document types (45 minutes)
- **Test:** OCR accuracy with different engines (30 minutes)
- **Security:** Verify PHI redaction Level 3 (15 minutes)

**Learning Objectives:**
- Upload and process documents safely
- Test OCR with multiple engines (Mistral, Gemini, ABBYY, Tesseract)
- Understand document classification (9 types)
- Verify comprehensive PHI redaction

**Real-World Application:** Insurance cards, ID cards, and medical documents must be processed securely and accurately.

---

#### Week 3, Day 3: Module 08 — Messaging Omnichannel (1 hour)
- **Read:** TestPlan.md on message normalization (20 minutes)
- **Practice:** Send messages via multiple channels (25 minutes)
- **Test:** Intent classification and auto-responses (15 minutes)

**Learning Objectives:**
- Normalize messages from SMS, WhatsApp, Email, Telegram, Webchat
- Test intent classification (booking, billing, urgent, support)
- Verify business hours awareness
- Check priority detection for urgent messages

**Real-World Application:** Patients contact clinics through many channels. Unified handling prevents messages from being missed.

---

### Phase 4: Insights & Compliance (3-4 hours)
**Goal:** Master analytics, compliance, and system orchestration

#### Week 3, Day 4: Module 07 — Analytics & Reporting Dashboard (1.5 hours)
- **Read:** TestPlan.md on KPI computation (20 minutes)
- **Practice:** Generate reports for different time periods (40 minutes)
- **Test:** Color-coded metrics and NPS calculations (20 minutes)
- **Review:** HTML dashboard output (10 minutes)

**Learning Objectives:**
- Generate daily, weekly, monthly, and custom reports
- Calculate 25+ KPIs automatically
- Interpret color-coded performance metrics
- Understand conversion rates, NPS, revenue analytics

**Real-World Application:** Data-driven decisions improve clinic operations. Dashboards save hours of manual reporting.

---

#### Week 3, Day 5: Module 09 — Compliance & Audit Logging (1.5 hours)
- **Read:** TestPlan.md emphasizing HIPAA requirements (25 minutes)
- **Practice:** Generate various audit events (35 minutes)
- **Test:** Tamper-evident hash chain verification (20 minutes)
- **Security:** Review intelligent alerting conditions (10 minutes)

**Learning Objectives:**
- Understand HIPAA audit requirements
- Test tamper-evident SHA-256 hash chains
- Verify 7-year retention policy
- Check intelligent alerting (5 conditions)

**Real-World Application:** Audit logs are legally required. They protect your clinic during investigations and prove compliance.

---

#### Week 4, Day 1: Module 10 — System Orchestration & Manager Dashboard (1 hour)
- **Read:** TestPlan.md on health checks and synthetic runs (20 minutes)
- **Practice:** Execute health checks on all modules (25 minutes)
- **Test:** Manager dashboard visibility and alerts (15 minutes)

**Learning Objectives:**
- Run system-wide health checks
- Monitor all modules from central dashboard
- Test synthetic patient journeys
- Understand system orchestration principles

**Real-World Application:** The manager dashboard lets you spot problems before they affect real patients.

---

### Phase 5: Integration & Advanced Testing (3-4 hours)
**Goal:** Test how modules work together and handle complex scenarios

#### Week 4, Day 2-3: Cross-Module Integration (2 hours)
- **Read:** CrossModule_Tests/Chain_Tests.md (30 minutes)
- **Practice:** Run complete patient journey simulation (60 minutes)
- **Test:** Data passing between modules correctly (20 minutes)
- **Review:** Full system data flow (10 minutes)

**Learning Objectives:**
- Test complete patient journey: lead → booking → telehealth → billing → follow-up
- Verify data integrity across module boundaries
- Understand system integration dependencies
- Test manager dashboard integration monitoring

**Real-World Application:** Modules must work together seamlessly. Integration bugs cause the worst user experience.

---

#### Week 4, Day 4: Advanced Edge Cases & Stress Testing (1.5 hours)
- **Practice:** Simultaneous bookings (race conditions) (20 minutes)
- **Test:** Very long text inputs and special characters (20 minutes)
- **Test:** Network timeouts and retry logic (20 minutes)
- **Test:** High-volume scenarios (bulk uploads, mass messages) (20 minutes)
- **Review:** Performance profiling results (10 minutes)

**Learning Objectives:**
- Handle edge cases gracefully
- Test system behavior under stress
- Verify retry and recovery mechanisms
- Understand performance characteristics

**Real-World Application:** Edge cases happen in production. Systems must degrade gracefully, not crash.

---

#### Week 4, Day 5: Bug Reporting & Quality Assurance (0.5 hours)
- **Practice:** Document a mock bug using BugReport_Template.md (15 minutes)
- **Review:** All Checklist.md files across modules (15 minutes)

**Learning Objectives:**
- Write clear, actionable bug reports
- Use screenshots and mock data references
- Track testing progress with checklists

---

### Phase 6: Teaching & Mastery (1-2 hours)
**Goal:** Be able to teach others and answer questions confidently

#### Week 5, Day 1: Review & Consolidation
- **Review:** All KeyPoints.md files (30 minutes)
- **Review:** TeachingNotes.md for each module (30 minutes)
- **Reflect:** What you learned and what questions remain (15 minutes)

**Learning Objectives:**
- Consolidate knowledge across all 10 modules
- Understand teaching strategies for each module
- Identify any remaining knowledge gaps

---

#### Week 5, Day 2: Practice Teaching
- **Explain:** Pick 3 modules and practice explaining them out loud (30 minutes)
- **Simulate:** Walk through a test as if teaching someone else (15 minutes)

**Learning Objectives:**
- Communicate technical concepts in plain language
- Anticipate learner questions
- Gain confidence in your mastery

---

## Time Estimates by Module

| Module | Reading | Testing | Review | Total |
|--------|---------|---------|--------|-------|
| Foundations | 1.5h | 0.5h | 0h | 2h |
| Module 01 | 0.5h | 1h | 0.5h | 2h |
| Module 02 | 0.5h | 1h | 0.5h | 2h |
| Module 03 | 0.5h | 0.75h | 0.75h | 2h |
| Module 04 | 0.5h | 0.75h | 0.75h | 2h |
| Module 05 | 0.5h | 1h | 0.5h | 2h |
| Module 06 | 0.5h | 0.75h | 0.75h | 2h |
| Module 08 | 0.33h | 0.42h | 0.25h | 1h |
| Module 07 | 0.33h | 0.67h | 0.5h | 1.5h |
| Module 09 | 0.42h | 0.58h | 0.5h | 1.5h |
| Module 10 | 0.33h | 0.42h | 0.25h | 1h |
| Cross-Module | 0.5h | 1h | 0.5h | 2h |
| Advanced Testing | 0h | 1.33h | 0.17h | 1.5h |
| Teaching Practice | 0.5h | 0.75h | 0h | 1.25h |
| **TOTAL** | **7h** | **10.9h** | **5.9h** | **23.75h** |

**Realistic completion time:** 15-20 hours for focused learners, up to 25 hours for thorough exploration.

---

## Learning Pathways

### Fast Track (Essentials Only) — 8-10 hours
Focus on core patient flow only:
1. Foundations (2h)
2. Module 01: Intake (1.5h)
3. Module 02: Booking (1.5h)
4. Module 03: Telehealth (1.5h)
5. Module 04: Billing (1.5h)
6. Cross-Module Chain Test (1h)

**Best for:** Operations staff who need to verify basic functionality quickly.

---

### Standard Track (Recommended) — 15-20 hours
Complete all modules in order as listed above.

**Best for:** Anyone who will maintain, troubleshoot, or train others on the system.

---

### Deep Dive Track (Mastery) — 25-30 hours
Standard track plus:
- Repeat all tests with variations
- Read all build notes (`module_XX_build_notes.md`)
- Study workflow JSON files directly
- Create your own custom test scenarios
- Review cross-module data contracts

**Best for:** Technical leads, system administrators, and those responsible for customization.

---

## Recommended Study Schedule

### Option A: Intensive (1 Week Full-Time)
- **Monday-Tuesday:** Foundations + Modules 01-02
- **Wednesday-Thursday:** Modules 03-04
- **Friday:** Modules 05-06
- **Weekend:** Modules 07-09, Module 10, Cross-Module Tests

---

### Option B: Part-Time (4 Weeks, 2 hours/day)
- **Week 1:** Foundations, Modules 01-02
- **Week 2:** Modules 03-04-05
- **Week 3:** Modules 06-08, Module 07
- **Week 4:** Modules 09-10, Cross-Module Tests, Review

---

### Option C: Casual (8 Weeks, 1 hour/day)
- **Week 1-2:** Foundations and Module 01
- **Week 3:** Module 02
- **Week 4:** Module 03
- **Week 5:** Module 04
- **Week 6:** Modules 05-06
- **Week 7:** Modules 07-08-09
- **Week 8:** Module 10, Cross-Module Tests, Review

---

## Learning Objectives by Phase

### After Phase 1 (Foundations)
You will be able to:
- ✅ Explain what Aigent does and why it matters
- ✅ Use mock data safely and correctly
- ✅ Understand environment variables
- ✅ Navigate the n8n interface
- ✅ Document bugs clearly

---

### After Phase 2 (Core Patient Flow)
You will be able to:
- ✅ Test the complete intake-to-payment journey
- ✅ Verify calendar integrations work correctly
- ✅ Generate secure telehealth video links
- ✅ Process payments and understand PCI compliance
- ✅ Identify PHI and verify it's protected

---

### After Phase 3 (Engagement & Operations)
You will be able to:
- ✅ Set up automated patient follow-up sequences
- ✅ Upload and process documents with OCR
- ✅ Handle multi-channel patient messages
- ✅ Understand document classification and security

---

### After Phase 4 (Insights & Compliance)
You will be able to:
- ✅ Generate and interpret analytics dashboards
- ✅ Verify HIPAA-compliant audit logging
- ✅ Use the manager dashboard for system health
- ✅ Understand legal compliance requirements

---

### After Phase 5 (Integration & Advanced)
You will be able to:
- ✅ Test complete patient journeys across all modules
- ✅ Handle edge cases and stress scenarios
- ✅ Verify data integrity across module boundaries
- ✅ Document complex bugs with full context

---

### After Phase 6 (Teaching & Mastery)
You will be able to:
- ✅ Teach others how to test any module
- ✅ Answer questions about system behavior
- ✅ Troubleshoot problems independently
- ✅ Create custom test scenarios
- ✅ Train new team members

---

## Assessment Checkpoints

**No formal exams!** Instead, verify your understanding with these practical checkpoints:

### Checkpoint 1 (After Phase 2)
Can you:
- Run a complete test of Module 01 without looking at instructions?
- Explain to someone else why PHI masking matters?
- Identify a problem and fill out a bug report?

**If yes → Continue to Phase 3**
**If not → Review KeyPoints and try Module 01 tests again**

---

### Checkpoint 2 (After Phase 4)
Can you:
- Explain how the 14-day follow-up sequence works?
- Generate a dashboard report and interpret the KPIs?
- Describe what happens during a compliance audit?

**If yes → Continue to Phase 5**
**If not → Review TeachingNotes for Modules 05, 07, 09**

---

### Checkpoint 3 (After Phase 5)
Can you:
- Run a full patient journey test without guidance?
- Identify which module an error comes from?
- Explain module integration to a colleague?

**If yes → You're ready for Phase 6**
**If not → Practice Chain_Tests.md again with a different scenario**

---

### Final Checkpoint (After Phase 6)
Can you:
- Teach a complete beginner how to test Module 02?
- Troubleshoot an unknown problem using Observability and logs?
- Confidently answer questions about system behavior?

**If yes → Congratulations, you've mastered Aigent testing! 🎓**
**If not → Review TeachingNotes and practice explaining out loud**

---

## Tips for Success

### 1. Take Notes
- Write down interesting observations
- Note patterns you see across modules
- Record "aha!" moments when things click

### 2. Make Mistakes on Purpose
- Enter invalid data to see error messages
- Skip required fields to see validation
- Try edge cases before reading about them

### 3. Ask "Why?" Constantly
- Why does this field require validation?
- Why do we mask PHI in logs?
- Why does the system retry failed actions?

### 4. Connect to Real Life
- Think about your own experiences as a patient
- Consider what would happen if this failed in a real clinic
- Imagine explaining this to a non-technical person

### 5. Take Breaks
- Don't rush through everything at once
- Let complex concepts sink in overnight
- Return to difficult sections after a break

### 6. Use All Resources
- Read KeyPoints when reviewing
- Check Troubleshooting when stuck
- Study TeachingNotes for deeper understanding
- Reference build notes for technical details

---

## What Comes After This Course?

### Immediate Next Steps
1. **Practice in your actual environment** (with continued mock data)
2. **Train a colleague** using what you learned
3. **Customize test scenarios** for your clinic's specific needs
4. **Create documentation** for your team

### Advanced Learning
1. **Study the workflow JSON files** to understand node-level logic
2. **Read all build notes** for comprehensive technical details
3. **Experiment with modifications** to workflows (in test environment!)
4. **Learn n8n advanced features** like sub-workflows and error handling

### Ongoing Practice
1. **Run regression tests** whenever workflows are updated
2. **Create new test cases** for new features
3. **Mentor new team members** through this course
4. **Contribute improvements** to test documentation

---

## Support & Resources

### Within This Package
- **KeyPoints.md** in each module for quick review
- **Troubleshooting.md** for common problems
- **TeachingNotes.md** for deeper explanations
- **BugReport_Template.md** for documenting issues

### External Resources
- **n8n Documentation:** https://docs.n8n.io
- **HIPAA Compliance Guide:** https://www.hhs.gov/hipaa
- **Healthcare IT Basics:** (consult your organization's training materials)

---

## Your Learning Checklist

Print or save this checklist to track your progress:

**Phase 1: Foundations**
- [ ] Read main README
- [ ] Understand EnvMatrix
- [ ] Review MockIdentities
- [ ] Learn BugReport_Template
- [ ] Set up n8n environment

**Phase 2: Core Patient Flow**
- [ ] Complete Module 01 tests
- [ ] Complete Module 02 tests
- [ ] Complete Module 03 tests
- [ ] Complete Module 04 tests

**Phase 3: Engagement & Operations**
- [ ] Complete Module 05 tests
- [ ] Complete Module 06 tests
- [ ] Complete Module 08 tests

**Phase 4: Insights & Compliance**
- [ ] Complete Module 07 tests
- [ ] Complete Module 09 tests
- [ ] Complete Module 10 tests

**Phase 5: Integration & Advanced**
- [ ] Complete Cross-Module Chain Tests
- [ ] Complete Manager Integration Tests
- [ ] Try advanced edge cases
- [ ] Practice bug reporting

**Phase 6: Teaching & Mastery**
- [ ] Review all KeyPoints
- [ ] Study all TeachingNotes
- [ ] Practice teaching Module 01
- [ ] Practice teaching Module 04
- [ ] Practice teaching Module 09

---

## Congratulations!

You're about to embark on a comprehensive learning journey that will make you an Aigent expert.

Remember:
- **Go at your own pace** — this isn't a race
- **Ask questions** — curiosity leads to mastery
- **Make mistakes** — that's how you learn
- **Practice teaching** — teaching solidifies understanding
- **Have fun** — testing can be genuinely interesting!

---

👉 **Ready to begin? Open Module 01's TestPlan.md and start your first test!**

Good luck, and enjoy the journey! 🚀
