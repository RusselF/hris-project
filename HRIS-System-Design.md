# HRIS — System Design (Phase 2)

Dokumen ini menurunkan Functional Requirement & Use Case dari Phase 1 menjadi ERD dan Arsitektur Sistem.

---

## 1. Entity Identification

Dari FR-006 s/d FR-024, entity yang dibutuhkan:

| Entity | Sumber Requirement |
|---|---|
| User | FR-001 s/d FR-005 (auth) |
| Employee | FR-006 s/d FR-010 |
| Department | FR-009 |
| Position | FR-009 |
| Attendance | FR-011 s/d FR-015 |
| LeaveType | FR-016 |
| LeaveBalance | FR-017, FR-020 |
| LeaveRequest | FR-016 s/d FR-021 |
| Payroll | FR-022 s/d FR-024 |

---

## 2. Entity Relationship Diagram (ERD)

```text
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ role        │◄──────────────┐
│ created_at  │                │ 1-1
└─────────────┘                │
                                │
                         ┌──────┴──────┐
                         │  Employee   │
                         │─────────────│
                         │ id (PK)     │
                         │ user_id(FK) │
                         │ name        │
                         │ dept_id(FK) │───────┐
                         │ pos_id (FK) │───┐   │
                         │ manager_id(FK)──┼───┼──┐ (self-ref)
                         │ join_date   │   │   │  │
                         │ status      │   │   │  │
                         └──────┬──────┘   │   │  │
                                │          │   │  │
        ┌───────────────┬──────┼──────┬───┘   │  │
        │                │             │       │  │
        ▼                ▼             ▼       │  │
 ┌─────────────┐  ┌──────────────┐ ┌─────────────┐│
 │ Attendance  │  │ LeaveRequest │ │  Payroll    ││
 │─────────────│  │──────────────│ │─────────────││
 │ id (PK)     │  │ id (PK)      │ │ id (PK)     ││
 │ employee_id │  │ employee_id  │ │ employee_id ││
 │ clock_in    │  │ leave_type_id│ │ period      ││
 │ clock_out   │  │ start_date   │ │ base_salary ││
 │ status      │  │ end_date     │ │ deduction   ││
 │ date        │  │ status       │ │ total       ││
 └─────────────┘  │ approved_by ─┼─┼─────────────┘│ (FK → Employee, manager)
                   └──────┬───────┘                │
                          │                         │
                          ▼                         │
                   ┌──────────────┐                 │
                   │ LeaveBalance │                 │
                   │──────────────│                 │
                   │ id (PK)      │                 │
                   │ employee_id  │                 │
                   │ leave_type_id│                 │
                   │ balance      │                 │
                   │ year         │                 │
                   └──────┬───────┘                 │
                          │                          │
                          ▼                          │
                   ┌──────────────┐                  │
                   │  LeaveType   │                  │
                   │──────────────│                  │
                   │ id (PK)      │                  │
                   │ name         │                  │
                   │ default_qty  │                  │
                   └──────────────┘                  │
                                                       │
        ┌──────────────┐        ┌──────────────┐     │
        │  Department  │        │  Position    │◄────┘
        │──────────────│        │──────────────│
        │ id (PK)      │        │ id (PK)      │
        │ name         │        │ title        │
        └──────────────┘        │ dept_id (FK) │
                                 └──────────────┘
```

**Catatan relasi penting:**
- `Employee.manager_id` adalah **self-referencing FK** ke `Employee.id` — ini yang membuat query "anggota tim Manager" (FR-010) memungkinkan
- `LeaveRequest.approved_by` mereferensikan `Employee.id` (Manager yang approve) — untuk audit trail
- `Attendance` dan `LeaveRequest` sama-sama punya `employee_id` sebagai FK, bukan `user_id` — karena `User` hanya untuk auth, `Employee` untuk data HR

---

## 3. Detail Skema Tabel

### users
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR | UNIQUE, NOT NULL |
| password_hash | VARCHAR | NOT NULL |
| role | ENUM('EMPLOYEE','MANAGER','HR') | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

### employees
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE |
| name | VARCHAR | NOT NULL |
| department_id | UUID | FK → departments.id |
| position_id | UUID | FK → positions.id |
| manager_id | UUID | FK → employees.id, NULLABLE |
| join_date | DATE | NOT NULL |
| status | ENUM('ACTIVE','INACTIVE') | DEFAULT 'ACTIVE' |

### attendances
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| employee_id | UUID | FK → employees.id |
| date | DATE | NOT NULL |
| clock_in | TIMESTAMP | NULLABLE |
| clock_out | TIMESTAMP | NULLABLE |
| status | ENUM('ON_TIME','LATE','ABSENT') | DEFAULT 'ON_TIME' |
| *(UNIQUE constraint: employee_id + date)* | | mencegah double clock-in per hari |

### leave_requests
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| employee_id | UUID | FK → employees.id |
| leave_type_id | UUID | FK → leave_types.id |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM('PENDING','APPROVED','REJECTED','CANCELLED') | DEFAULT 'PENDING' |
| approved_by | UUID | FK → employees.id, NULLABLE |
| created_at | TIMESTAMP | DEFAULT now() |

### leave_balances
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| employee_id | UUID | FK → employees.id |
| leave_type_id | UUID | FK → leave_types.id |
| balance | INTEGER | NOT NULL |
| year | INTEGER | NOT NULL |
| *(UNIQUE constraint: employee_id + leave_type_id + year)* | | |

### payrolls
| Kolom | Tipe | Constraint |
|---|---|---|
| id | UUID | PK |
| employee_id | UUID | FK → employees.id |
| period | VARCHAR (format: YYYY-MM) | NOT NULL |
| base_salary | DECIMAL | NOT NULL |
| deduction | DECIMAL | DEFAULT 0 |
| total | DECIMAL | NOT NULL |
| generated_at | TIMESTAMP | DEFAULT now() |

---

## 4. Prisma Schema (draft awal)

```prisma
enum Role {
  EMPLOYEE
  MANAGER
  HR
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
}

enum AttendanceStatus {
  ON_TIME
  LATE
  ABSENT
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role
  createdAt    DateTime @default(now())
  employee     Employee?
}

model Employee {
  id            String         @id @default(uuid())
  userId        String         @unique
  user          User           @relation(fields: [userId], references: [id])
  name          String
  departmentId  String
  department    Department     @relation(fields: [departmentId], references: [id])
  positionId    String
  position      Position       @relation(fields: [positionId], references: [id])
  managerId     String?
  manager       Employee?      @relation("EmployeeManager", fields: [managerId], references: [id])
  subordinates  Employee[]     @relation("EmployeeManager")
  joinDate      DateTime
  status        EmployeeStatus @default(ACTIVE)
  attendances   Attendance[]
  leaveRequests LeaveRequest[] @relation("EmployeeLeaveRequests")
  approvals     LeaveRequest[] @relation("ApprovedByManager")
  leaveBalances LeaveBalance[]
  payrolls      Payroll[]
}

model Department {
  id        String     @id @default(uuid())
  name      String
  employees Employee[]
  positions Position[]
}

model Position {
  id           String     @id @default(uuid())
  title        String
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  employees    Employee[]
}

model Attendance {
  id         String            @id @default(uuid())
  employeeId String
  employee   Employee          @relation(fields: [employeeId], references: [id])
  date       DateTime
  clockIn    DateTime?
  clockOut   DateTime?
  status     AttendanceStatus  @default(ON_TIME)

  @@unique([employeeId, date])
}

model LeaveType {
  id            String         @id @default(uuid())
  name          String
  defaultQty    Int
  leaveRequests LeaveRequest[]
  leaveBalances LeaveBalance[]
}

model LeaveRequest {
  id          String      @id @default(uuid())
  employeeId  String
  employee    Employee    @relation("EmployeeLeaveRequests", fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType   @relation(fields: [leaveTypeId], references: [id])
  startDate   DateTime
  endDate     DateTime
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approver    Employee?   @relation("ApprovedByManager", fields: [approvedBy], references: [id])
  createdAt   DateTime    @default(now())
}

model LeaveBalance {
  id          String    @id @default(uuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType @relation(fields: [leaveTypeId], references: [id])
  balance     Int
  year        Int

  @@unique([employeeId, leaveTypeId, year])
}

model Payroll {
  id          String   @id @default(uuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  period      String
  baseSalary  Decimal
  deduction   Decimal  @default(0)
  total       Decimal
  generatedAt DateTime @default(now())
}
```

---

## 5. System Architecture

```text
┌─────────────────────────────────────────────────┐
│                    CLIENT (Browser)               │
└───────────────────────┬───────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────┐
│              Next.js (Frontend)                   │
│  - Server Components (data fetching)              │
│  - Middleware (route protection per role)          │
│  - Client Components (form, interaksi)             │
└───────────────────────┬───────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────┐
│              NestJS (Backend)                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │ AuthModule│ │EmployeeMod│ │Attendance │  ...   │
│  │ (Guard,   │ │ (CRUD +   │ │Module     │        │
│  │  JWT)     │ │  RBAC)    │ │           │        │
│  └───────────┘ └───────────┘ └───────────┘        │
└───────────────────────┬───────────────────────────┘
                         │ Prisma Client
                         ▼
┌─────────────────────────────────────────────────┐
│               PostgreSQL (Database)                │
└─────────────────────────────────────────────────┘
```

**Alur request contoh (Ajukan Cuti — UC-01):**
```text
Employee submit form cuti (Next.js)
        │
        ▼
POST /api/leave-requests (NestJS)
        │
        ▼
LeaveGuard cek role = EMPLOYEE
        │
        ▼
LeaveService validasi saldo & overlap tanggal
        │
        ▼
Prisma simpan ke leave_requests (status: PENDING)
        │
        ▼
Response 201 → Frontend update UI
```

---

## 6. Struktur Folder Backend (NestJS, per Module)

```text
backend/
└── src/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── guards/
    │   │   ├── jwt.guard.ts
    │   │   └── roles.guard.ts
    │   └── strategies/jwt.strategy.ts
    ├── employee/
    │   ├── employee.module.ts
    │   ├── employee.controller.ts
    │   └── employee.service.ts
    ├── attendance/
    ├── leave/
    │   ├── leave-request/
    │   └── leave-balance/
    ├── payroll/
    ├── department/
    ├── position/
    └── prisma/
        └── prisma.service.ts
```

---

**Next Step:** Sprint 1 — Implementasi Authentication & RBAC (setup NestJS AuthModule, JWT strategy, Roles Guard) sesuai FR-001 s/d FR-005.
