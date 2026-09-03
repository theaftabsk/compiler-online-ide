# 🎓 Universal Centralized Digital Programming Lab & Open Online Compiler
## Master System Architecture & Engineering Plan (Dual Mode: College Lab + Free Public IDE)

---

## 📌 Executive Overview
This platform is architected as a **Dual-Mode Universal Digital Programming Platform**:
1. **Mode A — College / University Practical Lab & Monitoring System:**
   * Multi-tenant structure supporting any university (e.g., Brainware University, Section J, Lab 204).
   * Live 60-Machine Grid (PC-01 to PC-60) for faculty oversight.
   * Automated grading, test-case evaluations, anti-cheating tab-switch detection, and HOD analytics.
2. **Mode B — Open Public Online Compiler & Cloud IDE (No Login Required):**
   * Anyone can visit the platform and immediately write, compile, and run C, C++, Java, and Python code inside a secure Docker sandbox without creating an account or logging in.

---

## 👥 User Roles & Access Architecture

```prisma
enum UserRole {
  SUPER_ADMIN      // Platform Owner
  COLLEGE_ADMIN    // Principal / College Management
  HOD              // Head of Department
  FACULTY          // Lab Instructor / Professor
  LAB_ASSISTANT    // Lab Hardware / Room Assistant
  STUDENT          // University Enrolled Student
  PUBLIC_USER      // Normal Registered User
  GUEST            // Anonymous / Open Playground User (No Login Required)
}
```

---

## 🛡️ Full Security & Sandboxing Architecture

```
[ Incoming User Code ]
          │
          ▼
[ Static Security Filter ] ──► (Blocks: system, fork, popen, sys/socket.h, etc.)
          │
          ▼
[ Ephemeral Docker Sandbox ]
   ├── Network: Disabled (--network none)
   ├── CPU Quota: Capped at 0.5 CPU
   ├── Memory Quota: Capped at 128 MB RAM
   ├── Fork-Bomb Protection: Process limit (--pids-limit 20)
   ├── Timeout Protection: Hard 2.0s kill limit
   └── Read-only root filesystem
          │
          ▼
[ Output & Test-Case Evaluator ]
```

---

## 🚀 Technology Stack
* **Frontend:** Next.js 14/15 (App Router, React 18/19, TypeScript, Tailwind CSS, Monaco Editor, Lucide-React, Framer Motion)
* **Backend:** NestJS (TypeScript, @nestjs/core, @nestjs/websockets, Socket.IO, Prisma ORM, Class-Validator)
* **Database:** PostgreSQL (Relational Multi-Tenant Model)
* **Code Execution:** Docker / Linux Isolated Sandboxing
