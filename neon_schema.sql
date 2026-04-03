-- ==========================================
-- 0. Database Initialization
-- ==========================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Define ENUM types from schema.prisma
CREATE TYPE "Plan" AS ENUM ('free', 'starter', 'business', 'enterprise');
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'team_head', 'employee');
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "ProjectStatus" AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'review', 'blocked', 'done', 'archived');
CREATE TYPE "TaskPriority" AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE "AssigneeRole" AS ENUM ('primary', 'reviewer', 'watcher');
CREATE TYPE "DependencyType" AS ENUM ('blocks', 'blocked_by', 'related');
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- ==========================================
-- 1. Core Organizational Structures
-- ==========================================

CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    slug character varying UNIQUE NOT NULL,
    logo_url text,
    subscription_tier character varying NOT NULL DEFAULT 'free',
    plan "Plan" DEFAULT 'free',
    max_users integer DEFAULT 10,
    settings jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

CREATE TABLE public.departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    description text,
    manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
    parent_dept_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dept_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    name character varying NOT NULL,
    description text,
    team_head_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL
);

-- ==========================================
-- 2. User & Access Management
-- ==========================================

CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    email character varying UNIQUE NOT NULL,
    password_hash text NOT NULL,
    first_name character varying,
    last_name character varying,
    avatar_url text,
    role "Role" NOT NULL DEFAULT 'employee',
    status "UserStatus" DEFAULT 'active',
    is_active boolean NOT NULL DEFAULT true,
    is_verified boolean NOT NULL DEFAULT false,
    timezone character varying DEFAULT 'UTC',
    preferences jsonb DEFAULT '{}',
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

CREATE TABLE public.team_members (
    team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- ==========================================
-- 3. Project & Task Management
-- ==========================================

CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dept_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    name character varying NOT NULL,
    description text,
    owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
    status character varying NOT NULL DEFAULT 'active',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL
);

CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
    parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
    title character varying NOT NULL,
    description text,
    status "TaskStatus" NOT NULL DEFAULT 'todo',
    priority "TaskPriority" NOT NULL DEFAULT 'medium',
    due_date timestamp with time zone,
    start_date timestamp with time zone,
    completed_at timestamp with time zone,
    estimated_hours numeric,
    actual_hours numeric,
    tags text[],
    metadata jsonb NOT NULL DEFAULT '{}',
    position integer NOT NULL DEFAULT 0,
    is_recurring boolean NOT NULL DEFAULT false,
    recurrence_rule text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

CREATE TABLE public.task_assignees (
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role "AssigneeRole" NOT NULL DEFAULT 'primary',
    assigned_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

CREATE TABLE public.task_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    type character varying NOT NULL DEFAULT 'blocks'
);

-- ==========================================
-- 4. Collaboration & Auditing
-- ==========================================

CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body text NOT NULL,
    parent_id uuid REFERENCES comments(id) ON DELETE SET NULL,
    mentions uuid[],
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

CREATE TABLE public.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
    filename character varying NOT NULL,
    file_url text NOT NULL,
    file_size bigint,
    mime_type character varying,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    actor_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action character varying NOT NULL,
    entity_type character varying,
    entity_id uuid,
    old_value jsonb,
    new_value jsonb,
    ip_address character varying,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type character varying NOT NULL,
    title character varying,
    body text,
    data jsonb NOT NULL DEFAULT '{}',
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
