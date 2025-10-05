# Ponder & Supabase Integration Guide

This document explains how **Ponder.sh** and **Supabase** work together in our infrastructure.

## **Why Use Supabase with Ponder?**

**Important:** Ponder supports PostgreSQL databases, which we use through Supabase both locally and in production.

### Configuration

Custom configuration setup in [`apps/ponder/src/config/index.ts`](./apps/ponder/src/config/index.ts) instead of relying on Ponder's default environment variables. This allows us to maintain consistent configuration across environments and provides better type safety and control over our settings.

You can configure Ponder to use any PostgreSQL instance by:
- Setting the `DATABASE_URL` environment variable
- Adding explicit configuration in `ponder.config.ts`

While **Ponder.sh** handles database migrations and provides a **GraphQL + RPC API**, **Supabase** serves two key purposes:

**Database Branching & Preview Environments**
- Create isolated database environments per branch
- [Automatic branch creation and management](https://supabase.com/docs/guides/deployment/branching)
- Preview environments auto-pause after 5 minutes of inactivity

**Vercel Integration**
- [Automated database connection configuration](https://supabase.com/partners/integrations/vercel)
- Seamless deployment pipeline integration

**Database Management Tools**

- Supabase's **AI SQL Editor** provides powerful assistance for database exploration and report generation
- Access to intuitive dashboard for database monitoring and management

### ❌ **What Not to Use Supabase For**

- **❌ Database Migrations:** Ponder handles all migrations
- **❌ Database Interactions:** Use Ponder's GraphQL and RPC APIs instead
- **❌ SDK & Permissions:** We only use Supabase for branching and deployments

## ⚡ **Running the Backend**

Start the backend services using:

```sh
pnpm backend
```

This script:
1. Starts **Supabase** (without applying migrations)
2. Starts **Ponder** and applies its database migrations

## 🔄 **PR Workflow with Ephemeral Instances**

### 📌 **Step-by-Step Process**

1. Create a Git branch
2. Create a Supabase DB branch
3. Create a PR

The automation will:
- Deploy an ephemeral Ponder instance to Google Cloud
- Configure the correct database connection via Supabase's Vercel integration

### 🎯 **Benefits**

- ✅ Isolated backend per PR
- ✅ Automated database setup
- ✅ Rapid iteration cycle

## 🔥 **Summary**

- **Ponder** manages all database operations and interactions
- **Supabase** provides database branching and cloud deployment support
- Use **Ponder's GraphQL and RPC APIs** for all database interactions
- Run `pnpm backend` to start the development environment
- PR workflow includes automatic deployment of isolated instances

🚀 This architecture combines **Ponder's powerful indexing and APIs** with **Supabase's infrastructure management capabilities**.

