# TASKFLOW — Master Prompt Document
## Task Assignment Management Web App
### Built for Millions of Users · Enterprise-Grade · Multi-Role Architecture

---

> **Document Type**: Master System Prompt  
> **Version**: 1.0  
> **Scope**: End-to-end specification for design, architecture, database, UI/UX, and PRD  
> **Roles Covered**: Admin · Manager · Team Head · Employee  

---

## TABLE OF CONTENTS

1. [Product Requirements Document (PRD)](#1-product-requirements-document)
2. [System Design & Architecture](#2-system-design--architecture)
3. [Database Design](#3-database-design)
4. [UI/UX Architecture & Design](#4-uiux-architecture--design)
5. [Role-Based Access Control (RBAC)](#5-role-based-access-control)
6. [API Design](#6-api-design)
7. [Scalability & Performance](#7-scalability--performance)
8. [Security Architecture](#8-security-architecture)
9. [DevOps & Deployment](#9-devops--deployment)
10. [Master Prompt Instructions](#10-master-prompt-instructions)

---

## 1. PRODUCT REQUIREMENTS DOCUMENT

### 1.1 Executive Summary

**Product Name**: TaskFlow  
**Tagline**: Assign. Track. Deliver.  
**Mission**: Provide a scalable, intuitive task assignment and management platform that enables organizations of any size — from startups to Fortune 500s — to coordinate work across Admin, Manager, Team Head, and Employee roles seamlessly.

### 1.2 Problem Statement

Organizations managing thousands of tasks across dozens of teams suffer from:
- Fragmented communication (email + Slack + spreadsheets)
- No single source of truth for task ownership
- Lack of visibility into workload distribution
- No audit trail for accountability
- No hierarchy enforcement for task delegation

### 1.3 Goals & Success Metrics

| Goal | KPI | Target |
|------|-----|--------|
| Task visibility | % tasks with clear owner | 100% |
| On-time delivery | Tasks completed by deadline | ≥85% |
| User adoption | DAU/MAU ratio | ≥60% |
| System reliability | Uptime SLA | 99.99% |
| Response time | API p95 latency | <200ms |
| Scale | Concurrent users | 10M+ |

### 1.4 User Personas

**Persona 1 — ADMIN (Platform Owner)**
- Full control over the entire organization
- Creates/manages departments, managers, team heads
- Views global dashboards and audit logs
- Configures system settings, billing, integrations

**Persona 2 — MANAGER**
- Oversees multiple teams and projects
- Assigns tasks to Team Heads and directly to Employees
- Views team-level performance analytics
- Approves and escalates tasks

**Persona 3 — TEAM HEAD**
- Leads one or more teams under a Manager
- Assigns and monitors tasks for their team members (Employees)
- Reports to Manager
- Cannot assign tasks outside their team

**Persona 4 — EMPLOYEE**
- Receives and executes tasks
- Updates task status, logs time, adds comments
- Views only their own tasks and team board
- Can request clarification or escalate blockers

### 1.5 Core Features

#### Must Have (MVP)
- [x] User registration & authentication (SSO, OAuth2, MFA)
- [x] Role management (Admin / Manager / Team Head / Employee)
- [x] Organization & department hierarchy
- [x] Task creation, assignment, editing, deletion
- [x] Task status lifecycle (Todo → In Progress → Review → Done → Archived)
- [x] Priority levels (Critical / High / Medium / Low)
- [x] Due dates, reminders, and recurring tasks
- [x] Real-time notifications (in-app + email + push)
- [x] Comments and @mentions on tasks
- [x] File attachments (up to 100MB per task)
- [x] Activity audit logs
- [x] Role-based dashboards

#### Should Have (v1.1)
- [ ] Kanban board view per team
- [ ] Gantt / timeline view
- [ ] Task dependencies (blocking/blocked by)
- [ ] Workload heatmap per employee
- [ ] CSV/Excel export
- [ ] Slack / Teams integration

#### Could Have (v2.0)
- [ ] AI-powered task suggestions
- [ ] Auto-routing based on skills/availability
- [ ] Predictive delay alerts
- [ ] Custom workflows and automation rules
- [ ] Mobile apps (iOS & Android)

### 1.6 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Page load < 2s, API p95 < 200ms |
| Scalability | Horizontal scale to 10M+ users |
| Availability | 99.99% uptime (< 52 min downtime/year) |
| Security | SOC 2 Type II, GDPR, ISO 27001 |
| Data residency | Multi-region (US, EU, APAC) |
| Localization | 20+ languages, RTL support |
| Accessibility | WCAG 2.1 AA |

---

## 2. SYSTEM DESIGN & ARCHITECTURE

### 2.1 Architecture Overview

```
Architecture: Microservices on Cloud-Native Infrastructure
Pattern: Event-Driven + CQRS (Command Query Responsibility Segregation)
Deployment: Multi-Region Active-Active
CDN: Global edge delivery
```

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│   Web App (React)   |  Mobile (React Native)  |  Public API         │
└────────────┬─────────────────────┬──────────────────────────────────┘
             │                     │
             ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE / CDN LAYER                               │
│   CloudFront / Akamai  |  DDoS Protection  |  WAF  |  Rate Limiter  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
│   Kong / AWS API Gateway  |  Auth Middleware  |  Load Balancer      │
└──────┬────────────┬───────────┬──────────────┬────────────┬─────────┘
       │            │           │              │            │
       ▼            ▼           ▼              ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Auth    │ │  Task    │ │  User    │ │ Notific. │ │Analytics │
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │             │             │
     └────────────┴────────────┴─────────────┴─────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Message Broker    │
                    │  (Apache Kafka)     │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼───────────────────────┐
         ▼                     ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  PostgreSQL     │  │  Redis Cluster  │  │  Elasticsearch  │
│  (Primary DB)   │  │  (Cache+Queue)  │  │  (Search/Logs)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.3 Microservices Breakdown

| Service | Responsibility | Tech Stack |
|---------|---------------|------------|
| **Auth Service** | Login, JWT, MFA, OAuth2, SSO | Node.js + Passport.js |
| **User Service** | User CRUD, roles, org hierarchy | Node.js + Express |
| **Task Service** | Task CRUD, assignment, status | Node.js + Express |
| **Notification Service** | Email, push, in-app notifications | Node.js + Bull Queue |
| **File Service** | Upload, storage, CDN delivery | Node.js + S3 |
| **Analytics Service** | Dashboards, reports, metrics | Python + FastAPI |
| **Search Service** | Full-text search, filters | Elasticsearch |
| **Audit Service** | Immutable activity logs | Node.js + Kafka consumer |
| **Integration Service** | Slack, Teams, Jira webhooks | Node.js |

### 2.4 Technology Stack

**Frontend**
- Framework: React 18 + TypeScript
- State: Zustand + React Query (TanStack)
- UI Library: Custom design system (Tailwind CSS)
- Real-time: Socket.io / WebSockets
- Build: Vite + Turborepo (monorepo)

**Backend**
- Runtime: Node.js 20 LTS (primary), Python 3.11 (analytics)
- API: RESTful + GraphQL (for complex dashboard queries)
- Auth: JWT + Refresh Tokens + OAuth2
- ORM: Prisma (PostgreSQL)

**Infrastructure**
- Cloud: AWS (primary) + GCP (failover)
- Containers: Docker + Kubernetes (EKS)
- CI/CD: GitHub Actions + ArgoCD
- IaC: Terraform

**Data Layer**
- Primary DB: PostgreSQL 15 (RDS Aurora — Multi-AZ)
- Cache: Redis 7 (ElastiCache — Cluster Mode)
- Search: Elasticsearch 8
- File Storage: AWS S3 + CloudFront CDN
- Message Queue: Apache Kafka (MSK)
- Time-series: InfluxDB (for metrics)

### 2.5 Real-Time Architecture

```
WebSocket Connection Flow:
Client → API Gateway (WS Upgrade) → Socket.io Server → Redis Pub/Sub
                                                              ↓
                                    Task Service publishes events to Redis
                                    Socket.io broadcasts to connected clients
```

Events published in real-time:
- `task.assigned` — new task assigned to you
- `task.status_changed` — status update on your task
- `task.commented` — new comment on your task
- `task.due_soon` — 24h before deadline
- `mention.received` — you were @mentioned

---

## 3. DATABASE DESIGN

### 3.1 Database Schema (PostgreSQL)

#### Core Tables

```sql
-- Organizations
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  plan          ENUM('free','starter','business','enterprise') DEFAULT 'free',
  max_users     INT DEFAULT 10,
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email         VARCHAR(320) UNIQUE NOT NULL,
  password_hash TEXT,
  name          VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  role          ENUM('admin','manager','team_head','employee') NOT NULL,
  status        ENUM('active','inactive','suspended') DEFAULT 'active',
  timezone      VARCHAR(100) DEFAULT 'UTC',
  preferences   JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- Departments
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  manager_id    UUID REFERENCES users(id),
  parent_dept_id UUID REFERENCES departments(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  dept_id       UUID REFERENCES departments(id),
  name          VARCHAR(255) NOT NULL,
  team_head_id  UUID REFERENCES users(id),
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (Employee → Team mapping)
CREATE TABLE team_members (
  team_id       UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- Projects
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  dept_id       UUID REFERENCES departments(id),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  owner_id      UUID REFERENCES users(id),
  status        ENUM('planning','active','on_hold','completed','cancelled') DEFAULT 'planning',
  start_date    DATE,
  end_date      DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (Core Table)
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id),
  team_id         UUID REFERENCES teams(id),
  parent_task_id  UUID REFERENCES tasks(id),        -- for subtasks
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  status          ENUM('todo','in_progress','review','blocked','done','archived') DEFAULT 'todo',
  priority        ENUM('critical','high','medium','low') DEFAULT 'medium',
  created_by      UUID REFERENCES users(id) NOT NULL,
  assigned_to     UUID REFERENCES users(id),        -- primary assignee
  reviewed_by     UUID REFERENCES users(id),        -- reviewer
  due_date        TIMESTAMPTZ,
  start_date      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  estimated_hours NUMERIC(6,2),
  actual_hours    NUMERIC(6,2),
  tags            TEXT[],
  metadata        JSONB DEFAULT '{}',
  position        INT DEFAULT 0,                    -- for kanban ordering
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,                              -- RRULE format
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Task Assignees (multiple assignees)
CREATE TABLE task_assignees (
  task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       ENUM('primary','reviewer','watcher') DEFAULT 'primary',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- Task Dependencies
CREATE TABLE task_dependencies (
  task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_id   UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type            ENUM('blocks','blocked_by','related') DEFAULT 'blocks',
  PRIMARY KEY (task_id, depends_on_id)
);

-- Comments
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  parent_id   UUID REFERENCES comments(id),          -- threaded replies
  mentions    UUID[],                                -- mentioned user IDs
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- Attachments
CREATE TABLE attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  filename    VARCHAR(500) NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   VARCHAR(200),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(100) NOT NULL,
  title       VARCHAR(500),
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (append-only, never updated or deleted)
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  actor_id    UUID REFERENCES users(id),
  action      VARCHAR(200) NOT NULL,     -- e.g. 'task.assigned', 'user.role_changed'
  entity_type VARCHAR(100),
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### Indexes for Performance

```sql
-- Task lookups (most frequent queries)
CREATE INDEX idx_tasks_org_id         ON tasks(org_id);
CREATE INDEX idx_tasks_assigned_to    ON tasks(assigned_to);
CREATE INDEX idx_tasks_team_id        ON tasks(team_id);
CREATE INDEX idx_tasks_project_id     ON tasks(project_id);
CREATE INDEX idx_tasks_status         ON tasks(status);
CREATE INDEX idx_tasks_due_date       ON tasks(due_date);
CREATE INDEX idx_tasks_created_by     ON tasks(created_by);
CREATE INDEX idx_tasks_composite      ON tasks(org_id, assigned_to, status);

-- Audit log lookups
CREATE INDEX idx_audit_org_actor      ON audit_logs(org_id, actor_id);
CREATE INDEX idx_audit_entity         ON audit_logs(entity_type, entity_id);

-- Notification lookups
CREATE INDEX idx_notif_user_unread    ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### 3.2 Caching Strategy (Redis)

```
Cache Keys:
  user:{id}:profile          → TTL 30min
  user:{id}:tasks            → TTL 5min (invalidated on task update)
  org:{id}:stats             → TTL 1min
  task:{id}                  → TTL 10min
  team:{id}:members          → TTL 15min
  search:{hash}              → TTL 2min

Write-through cache on:
  - Task reads (cache-aside pattern)
  - User profile reads

Invalidation strategy:
  - Event-driven: Kafka consumer invalidates on write events
  - Time-based: TTLs above as fallback
```

---

## 4. UI/UX ARCHITECTURE & DESIGN

### 4.1 Design System

**Visual Language**
- Style: Clean enterprise — minimal, structured, purposeful
- Color Palette:
  - Primary: `#2563EB` (Blue 600) — trust, action
  - Surface: `#F8FAFC` — off-white base
  - Success: `#16A34A` | Warning: `#D97706` | Danger: `#DC2626`
  - Text Primary: `#0F172A` | Secondary: `#64748B`
- Typography:
  - Heading: `Inter` (700, 600)
  - Body: `Inter` (400, 500)
  - Code/IDs: `JetBrains Mono`
- Spacing: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Border Radius: 4px (sm), 8px (md), 12px (lg), 16px (xl)

### 4.2 Navigation Architecture

```
ADMIN LAYOUT
├── Dashboard (Global Overview)
├── Organizations & Departments
├── Users & Roles
├── All Tasks (global view)
├── Projects
├── Analytics & Reports
├── Audit Logs
└── Settings (Billing, Integrations, Security)

MANAGER LAYOUT
├── Dashboard (Department Overview)
├── My Teams
├── Projects
├── Task Board (all team tasks)
├── Assign Task
├── Team Analytics
└── Settings

TEAM HEAD LAYOUT
├── Dashboard (Team Overview)
├── My Team
├── Task Board (team kanban)
├── Assign Task (to team members)
├── My Tasks
└── Reports

EMPLOYEE LAYOUT
├── My Dashboard
├── My Tasks
├── Team Board (view only)
└── Profile
```

### 4.3 Page Designs

#### Dashboard Page (All Roles — adapts by role)

**Sections:**
- Header: Greeting + quick-create task button
- Stats Row: Total Tasks | Overdue | Completed This Week | In Progress
- Task Activity Feed (real-time)
- Upcoming Deadlines (next 7 days)
- Workload Chart (bar chart: tasks per member, for Manager+)
- Recent Activity Log

#### Task List / Board Page

**Views Available:** List | Kanban | Gantt (Timeline)

**Filters:**
- Status, Priority, Assignee, Team, Due Date, Tags
- Saved filter presets per user

**Kanban Columns:** Todo → In Progress → Review → Blocked → Done

**Task Card Shows:**
- Title, Priority badge, Due date, Assignee avatar
- Comment count, Attachment count
- Progress indicator (subtasks)

#### Task Detail Page (Drawer/Side Panel)

- Title (editable inline)
- Status dropdown (lifecycle enforcement by role)
- Priority, Due Date, Assignee(s), Team, Project
- Description (rich text editor — Tiptap)
- Subtasks list
- Dependencies
- Comments thread (with @mention autocomplete)
- Attachments
- Activity History (who did what, when)
- Time tracking log

#### Create / Assign Task Modal

**Fields (role-restricted):**
- Title* — required
- Description — rich text
- Assign To* — Employee dropdown (filtered by team context)
  - Admin/Manager: any user in org
  - Team Head: only their team members
- Priority — Critical / High / Medium / Low
- Due Date — date-time picker
- Project — linked project
- Team — (auto-filled by Team Head)
- Tags — multi-select
- Attachments — drag-and-drop
- Recurring — toggle (daily/weekly/monthly)

### 4.4 Responsive Design

```
Breakpoints:
  xs: 0–480px     (mobile portrait)
  sm: 481–768px   (mobile landscape, small tablet)
  md: 769–1024px  (tablet, laptop)
  lg: 1025–1440px (desktop)
  xl: 1441px+     (wide screen)

Layout shifts:
  - Sidebar: hidden (bottom nav) on xs/sm, collapsed icon on md, full on lg+
  - Kanban: single column scroll on xs/sm, full board on md+
  - Dashboard stats: 2-col grid on xs/sm, 4-col on lg+
```

### 4.5 Real-Time UX Patterns

- **Live status updates** — task status changes appear without page refresh
- **Typing indicators** — in comment threads
- **Notification bell** — badge counter, dropdown with mark-as-read
- **Optimistic UI** — task updates applied instantly, rolled back on error
- **Presence indicators** — show who else is viewing the same task

---

## 5. ROLE-BASED ACCESS CONTROL

### 5.1 Permission Matrix

| Action | Admin | Manager | Team Head | Employee |
|--------|-------|---------|-----------|----------|
| Create organization | ✅ | ❌ | ❌ | ❌ |
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| Create department | ✅ | ❌ | ❌ | ❌ |
| Create team | ✅ | ✅ | ❌ | ❌ |
| Assign Manager role | ✅ | ❌ | ❌ | ❌ |
| Assign Team Head role | ✅ | ✅ | ❌ | ❌ |
| Create project | ✅ | ✅ | ❌ | ❌ |
| Assign task to anyone | ✅ | ✅ | ❌ | ❌ |
| Assign task to team members | ✅ | ✅ | ✅ | ❌ |
| View all org tasks | ✅ | ❌ | ❌ | ❌ |
| View dept tasks | ✅ | ✅ | ❌ | ❌ |
| View team tasks | ✅ | ✅ | ✅ | ✅ (own team) |
| View own tasks | ✅ | ✅ | ✅ | ✅ |
| Update task status | ✅ | ✅ | ✅ | ✅ (own tasks) |
| Delete task | ✅ | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ (dept) | ✅ (team) | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |

### 5.2 Role Hierarchy Enforcement

```
Assignment Rules:
  Admin      → can assign tasks to: Manager, Team Head, Employee
  Manager    → can assign tasks to: Team Head, Employee (in their dept)
  Team Head  → can assign tasks to: Employee (in their team ONLY)
  Employee   → cannot assign tasks; receives only

Escalation Rules:
  Employee   → can escalate blockers to Team Head
  Team Head  → can escalate to Manager
  Manager    → can escalate to Admin
```

### 5.3 Data Visibility Scoping

Every database query is automatically scoped by:
1. `org_id` — user can only see their organization's data
2. `dept_id` — Managers see only their department
3. `team_id` — Team Heads see only their team
4. `user_id` — Employees see only their assigned tasks

This is enforced at the ORM/service layer using Row Level Security (RLS) in PostgreSQL as a final safety net.

---

## 6. API DESIGN

### 6.1 RESTful Endpoints

```
BASE URL: https://api.taskflow.io/v1

AUTH
  POST   /auth/register
  POST   /auth/login
  POST   /auth/logout
  POST   /auth/refresh
  POST   /auth/mfa/setup
  POST   /auth/mfa/verify

USERS
  GET    /users                      (Admin only)
  POST   /users                      (Admin only)
  GET    /users/:id
  PATCH  /users/:id
  DELETE /users/:id                  (Admin only)
  GET    /users/:id/tasks

TASKS
  GET    /tasks                      (scoped by role)
  POST   /tasks                      (creates + assigns)
  GET    /tasks/:id
  PATCH  /tasks/:id
  DELETE /tasks/:id
  POST   /tasks/:id/assign
  PATCH  /tasks/:id/status
  GET    /tasks/:id/comments
  POST   /tasks/:id/comments
  GET    /tasks/:id/attachments
  POST   /tasks/:id/attachments

TEAMS
  GET    /teams
  POST   /teams
  GET    /teams/:id
  PATCH  /teams/:id
  GET    /teams/:id/members
  POST   /teams/:id/members
  DELETE /teams/:id/members/:userId

ANALYTICS
  GET    /analytics/dashboard
  GET    /analytics/tasks/summary
  GET    /analytics/workload
  GET    /analytics/performance

NOTIFICATIONS
  GET    /notifications
  PATCH  /notifications/:id/read
  PATCH  /notifications/read-all
```

### 6.2 WebSocket Events

```javascript
// Client subscribes to room on connect
socket.join(`user:${userId}`)
socket.join(`team:${teamId}`)
socket.join(`org:${orgId}`)

// Events emitted by server
'task:assigned'         { taskId, assignedBy, task }
'task:status_changed'   { taskId, oldStatus, newStatus, changedBy }
'task:commented'        { taskId, comment, author }
'task:due_soon'         { taskId, dueAt, hoursRemaining }
'notification:new'      { notification }
'user:online'           { userId, teamId }
'user:offline'          { userId }
```

---

## 7. SCALABILITY & PERFORMANCE

### 7.1 Scaling Strategy

**Horizontal Scaling**
- All microservices run as stateless pods on Kubernetes
- Kubernetes HPA (Horizontal Pod Autoscaler) scales based on CPU + RPS
- Task Service: scales to 200 pods under peak load

**Database Scaling**
- PostgreSQL: Read replicas (3 replicas per region)
- Aurora Global Database for cross-region reads
- Connection pooling: PgBouncer (5,000 connections per node)
- Sharding strategy: org_id-based sharding for very large orgs (10M+ tasks)

**Cache Scaling**
- Redis Cluster: 6 shards, 3 replicas each
- Session data: Redis with TTL
- Task feed: Redis Sorted Sets (by timestamp)

**Search Scaling**
- Elasticsearch: 5-node cluster, 2 replicas per index
- Task index updated via Kafka consumer (async)
- Search queries served from ES, writes go to PostgreSQL

### 7.2 Performance Optimizations

| Technique | Applied To | Impact |
|-----------|-----------|--------|
| CDN caching | Static assets, API responses | -80% origin load |
| Redis cache | User profiles, task lists | -60% DB queries |
| DB indexing | All FK + filter columns | -70% query time |
| Pagination | All list endpoints (cursor-based) | Consistent p95 |
| Image optimization | Avatars, attachments | -50% bandwidth |
| GraphQL batching | Dashboard queries | -40% round trips |
| Lazy loading | Task comments, attachments | Faster initial load |

### 7.3 Load Estimates

```
10 Million Users:
  DAU (60%): 6M active daily users
  Peak concurrent: ~500K users
  Tasks created/day: ~30M
  API requests/sec (peak): ~150K RPS
  WebSocket connections (peak): ~500K
  Storage growth/month: ~5TB
```

---

## 8. SECURITY ARCHITECTURE

### 8.1 Authentication & Authorization

- **JWT** — short-lived access tokens (15 min TTL) + refresh tokens (30 days)
- **MFA** — TOTP (Google Authenticator compatible), SMS, Email OTP
- **OAuth2** — Google, Microsoft, GitHub SSO
- **SAML 2.0** — Enterprise SSO (Okta, Azure AD)
- **Password policy** — min 12 chars, bcrypt (cost factor 12), HaveIBeenPwned check

### 8.2 Data Security

- **Encryption at rest**: AES-256 (RDS, S3)
- **Encryption in transit**: TLS 1.3 enforced
- **PII protection**: Email, name encrypted in DB; decrypted only at service layer
- **Audit logs**: Immutable (no UPDATE/DELETE on audit_logs table)
- **Secrets management**: AWS Secrets Manager + Vault

### 8.3 API Security

- **Rate limiting**: 1,000 req/min per user; 10,000 req/min per org
- **WAF**: Block OWASP Top 10 attacks
- **CORS**: Strict allow-list (your domains only)
- **SQL injection**: Parameterized queries via Prisma ORM
- **XSS**: Content Security Policy headers + output encoding
- **CSRF**: SameSite=Strict cookie + CSRF token on mutations

### 8.4 Compliance

| Standard | Status | Scope |
|----------|--------|-------|
| GDPR | ✅ | EU users — right to erasure, data portability |
| SOC 2 Type II | ✅ | Annual audit, all controls |
| ISO 27001 | ✅ | Information security management |
| HIPAA | Optional | Add-on for healthcare orgs |
| CCPA | ✅ | California users |

---

## 9. DEVOPS & DEPLOYMENT

### 9.1 CI/CD Pipeline

```
Developer pushes code →
GitHub Actions triggers →
  1. Lint + Type Check
  2. Unit Tests (Jest)
  3. Integration Tests
  4. Docker build + push to ECR
  5. ArgoCD detects new image →
  6. Deploy to staging (auto)
  7. Run E2E tests (Playwright)
  8. Manual approval gate →
  9. Deploy to production (canary: 5% → 25% → 100%)
```

### 9.2 Infrastructure (Terraform)

```
Regions: us-east-1 (primary), eu-west-1 (EU), ap-southeast-1 (APAC)

Per Region:
  - EKS cluster (100-node capacity)
  - RDS Aurora (Multi-AZ, 3 read replicas)
  - ElastiCache Redis (6-shard cluster)
  - MSK Kafka (3-broker cluster)
  - S3 buckets (files, logs, backups)
  - CloudFront distribution
  - WAF + Shield Advanced
  - ALB (Application Load Balancer)
```

### 9.3 Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Datadog | APM, infrastructure metrics, dashboards |
| OpenTelemetry | Distributed tracing across microservices |
| PagerDuty | Alerting, on-call rotation |
| Sentry | Frontend + backend error tracking |
| Grafana | Custom dashboards, SLO tracking |
| ELK Stack | Centralized log management |

### 9.4 SLOs & SLAs

```
SLO Targets:
  API Availability:     99.99% (< 52 min downtime/year)
  API Latency p95:      < 200ms
  API Latency p99:      < 500ms
  DB Replication lag:   < 100ms
  Search index lag:     < 5 seconds
  Notification delivery: < 3 seconds
```

---

## 10. MASTER PROMPT INSTRUCTIONS

### 10.1 How to Use This Document as a Prompt

When building TaskFlow, use the following as your **system-level instruction prompt** for any AI model or development team:

---

```
SYSTEM PROMPT — TASKFLOW TASK MANAGEMENT APPLICATION

You are building TaskFlow, a scalable enterprise task assignment and management 
web application for millions of users. Follow this specification exactly.

=== ROLES & PERMISSIONS ===
There are 4 user roles with strict hierarchy:
1. ADMIN — full control, manages org, users, all tasks globally
2. MANAGER — manages departments, creates/assigns tasks to Team Heads and Employees
3. TEAM HEAD — leads a team, assigns tasks to their team Employees only
4. EMPLOYEE — receives and completes tasks assigned to them

Assignment rule: Higher roles can assign DOWN the hierarchy only.
Admin > Manager > Team Head > Employee (cannot assign tasks)

=== CORE TASK LIFECYCLE ===
Todo → In Progress → Review → Blocked → Done → Archived
Status transitions must be validated by role:
- Employee: can move their tasks from Todo→In Progress→Review
- Team Head+: can move to Blocked, Done, Archived
- Status regression (Done→In Progress) requires Manager+ role

=== DATA SCOPING RULES ===
Every data query MUST be scoped:
- Employee sees: only tasks assigned to them
- Team Head sees: all tasks in their team(s)
- Manager sees: all tasks in their department(s)
- Admin sees: all tasks in the organization
Never return data outside the user's authorized scope.

=== TASK ASSIGNMENT FLOW ===
When creating a task:
1. Validate the assigner has permission to assign to the target user
2. Create task record with org_id, created_by, assigned_to
3. Emit 'task.assigned' event to Kafka
4. Notification service consumes event → sends in-app + email notification
5. Real-time: emit WebSocket event to target user's room
6. Write to audit_logs (immutable record)

=== UI/UX RULES ===
- Admin: dark sidebar, global dashboard with org-wide metrics
- Manager: show department-level Kanban + team workload heatmap
- Team Head: team Kanban board, member workload view
- Employee: personal task list, My Kanban, no admin UI elements
- All role UIs must be STRICTLY separated — no role sees UI elements above their level
- Use role-based conditional rendering: { user.role === 'admin' && <AdminPanel /> }

=== API BEHAVIOR ===
- All endpoints require JWT Bearer token in Authorization header
- All responses include: { data, meta: { pagination }, errors }
- Errors: { code, message, field } (RFC 7807 Problem Details)
- Rate limit: 1000 req/min per user, 10000 req/min per org
- Pagination: cursor-based (not offset) for all list endpoints
- Versioning: /api/v1/ prefix on all endpoints

=== SECURITY REQUIREMENTS ===
- Never expose raw DB IDs — use UUIDs only
- Validate org_id on every request (user must belong to the org)
- Audit log EVERY write operation (create/update/delete/assign)
- Enforce row-level security at DB level as final safeguard
- Sanitize all user inputs, use parameterized queries only

=== NOTIFICATION RULES ===
Send notification when:
- Task assigned to you: in-app + email (immediate)
- Task status changed on your task: in-app (immediate)
- Comment added on your task: in-app + email (batched, 5min)
- @mentioned in a comment: in-app + email (immediate)
- Task due in 24 hours: in-app + email
- Task overdue: in-app + email + push (daily digest)

=== SCALABILITY REQUIREMENTS ===
- All services must be stateless (horizontally scalable)
- Cache all read-heavy queries in Redis (TTL: tasks=5min, profiles=30min)
- Use cursor pagination to avoid OFFSET performance issues at scale
- Background jobs for non-critical operations (email, analytics)
- Database connection pooling mandatory (PgBouncer)

=== TECHNOLOGY CONSTRAINTS ===
Frontend: React 18 + TypeScript + Zustand + React Query + Tailwind CSS
Backend: Node.js 20 + Express/Fastify + Prisma ORM
Database: PostgreSQL 15 (primary) + Redis 7 (cache) + Elasticsearch 8 (search)
Queue: Apache Kafka for events, Bull for job queues
Auth: JWT (15min) + Refresh Tokens (30 days) + optional SAML/OAuth2
Infrastructure: Kubernetes on AWS EKS, multi-region active-active

=== DEFINITION OF DONE ===
A feature is complete when:
✅ All role-based permissions enforced
✅ Audit log entry created
✅ Notification dispatched
✅ Real-time WebSocket event emitted
✅ Redis cache invalidated/updated
✅ Unit tests passing (>80% coverage)
✅ API response < 200ms at p95
✅ No data leaks across org/dept/team boundaries
```

---

### 10.2 Feature Prompt Templates

Use these prompts when asking an AI to build specific features:

**Build the Task Assignment API:**
```
Using the TaskFlow spec above, build the POST /tasks endpoint that:
1. Validates the authenticated user's role and permission to assign to the target
2. Creates the task record in PostgreSQL with all required fields
3. Publishes 'task.assigned' event to Kafka
4. Returns the created task with HTTP 201
Include: input validation, error handling, audit logging, and unit tests.
```

**Build the Role Dashboard:**
```
Using the TaskFlow spec, build the Dashboard React component that:
1. Detects user.role from the auth context
2. Renders the correct dashboard layout per role (Admin/Manager/TeamHead/Employee)
3. Fetches and displays role-scoped statistics
4. Shows real-time updates via WebSocket
5. Follows the design system (colors, typography, spacing) defined in section 4.1
```

**Build the Kanban Board:**
```
Using the TaskFlow spec, build a Kanban board component for Team Head and above that:
1. Displays columns: Todo | In Progress | Review | Blocked | Done
2. Shows task cards with title, priority badge, assignee avatar, due date
3. Supports drag-and-drop to change status (validate role permission on drop)
4. Streams real-time updates via WebSocket
5. Applies scoping: Team Head sees their team; Manager sees all teams in dept
```

---

*End of TaskFlow Master Prompt Document*  
*Version 1.0 — Generated for enterprise-scale Task Assignment Management Web App*
