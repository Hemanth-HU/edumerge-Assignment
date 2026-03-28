# AdmissionHub: College Admission Management & CRM System

A production-grade admission management system built with Next.js, TypeScript, and Tailwind CSS. Perfect for technical interviews showcasing clean architecture and business logic.

## 🎯 Overview

Complete college admission system with:

- Master data configuration (institutions, campuses, departments, programs)
- Seat matrix logic with real-time quota tracking
- Applicant registration and document verification
- Government and management admission allocation
- Unique admission number generation
- Interactive analytics dashboard with 6 chart types

## ✨ Key Features

### 1. Master Setup

- Institution, Campus, Department, Program hierarchy
- Quota distribution with validation (total quota = intake)
- Academic year management

### 2. Seat Matrix Logic

- Real-time seat tracking per quota
- Prevention of over-allocation
- O(1) availability checks: `filledSeats[quota] < quotas[quota]`

### 3. Applicant Management

- 15-field registration form
- Document status: Pending → Submitted → Verified
- Fee status tracking: Pending/Paid
- Application workflow

### 4. Admission Allocation

- **Government Flow**: Allotment numbers for KCET/COMEDK
- **Management Flow**: Direct quota allocation

### 5. Admission Confirmation

- Immutable admission numbers: `INST/2026/UG/CSE/KCET/0001`
- Fee required before confirmation
- Uniqueness validation

### 6. Dashboard

- 6 interactive Recharts visualizations
- Key metrics: Intake, Admitted, Remaining
- Quota breakdown, program performance
- Pending documents and fees lists

### 7. Role-Based Access

- Admin (full access)
- Admission Officer (applicants, allocation, confirmation)
- Management (view-only dashboard)

## 🏗️ Architecture

**Folder Structure**:

```
app/
├── components/             # UI components
├── services/              # Database & context
├── utils/                 # Business logic & validation
├── types/                 # TypeScript interfaces
└── dashboard/             # Analytics
```

**Data Flow**:

```
Form Submission → Zod Validation →  Business Logic →
Mock Database → State Update → UI Refresh
```

## 🔑 Core Algorithms

### Seat Allocation

```typescript
function canAllocateSeat(program, quotaName) {
  return program.filledSeats[quotalName] < program.quotas[quotaName];
}

function allocateSeat(program, quotaName) {
  if (!canAllocateSeat(program, quotaName)) return { success: false };
  program.filledSeats[quotaName]++;
  return { success: true };
}
```

### Admission Number Generation

- Format: INSTITUTION/YEAR/COURSETYPE/PROGRAM/QUOTA/SEQUENCE
- Unique, immutable, generated once at confirmation

### Quota Validation

- Total quota seats must equal program intake
- Validated at program creation

## 🚀 Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- React Hook Form + Zod
- Tailwind CSS
- Recharts (6 chart types)
- React Context (global state)

## 🎮 Quick Start

```bash
npm install
npm run build
npm run dev
```

Visit `http://localhost:3000`

**Setup Steps**:

1. Create Institution (Master Setup)
2. Create Campus
3. Create Department
4. Create Program (Intake: 100, KCET: 50, COMEDK: 30, Management: 20)
5. Register Applicants
6. Allocate Seats
7. Confirm Admissions
8. View Dashboard

## 🧪 Test Scenarios

| Scenario                         | Expected                 |
| -------------------------------- | ------------------------ |
| Allocate seat in available quota | ✓ Success                |
| Allocate 6th seat (max 5)        | ✗ "Quota full"           |
| Confirm without fee paid         | ✗ "Fee required"         |
| Switch to Management role        | ✓ Only Dashboard visible |

##📊 Dashboard Charts

1. Intake vs Admitted (Bar)
2. Quota Distribution (Pie)
3. Quota Seat Status (Bar)
4. Program Performance (Horizontal Bar)
5. Document Verification (Pie)
6. Fee Collection (Pie)

Plus pending documents/fees lists.

## 🎓 Interview Highlights

- **Seat Algorithm**: Simple O(1) logic with strong guarantees
- **Admission Numbers**: Immutable, unique, contextual
- **Role-Based UI**: Dynamic navigation and conditional rendering
- **Validation**: Multi-layer (schema, business logic, database)
- **Dashboard**: Real-time calculations with 6 visualizations

## 🔍 Code Quality

✅ 100% TypeScript
✅ Zod validation
✅ Comments on critical logic
✅ Error handling
✅ Responsive design

## 📈 Statistics

- 10+ components
- 50+ service functions
- 20+ TypeScript types
- 2500+ lines of code
- 6 chart visualizations

---

**Built with**: Next.js • TypeScript • Tailwind CSS • React Hook Form • Zod • Recharts
