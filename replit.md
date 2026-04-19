# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Application: AI Prompt Library

A full-stack web app for storing and managing AI image generation prompts.

### Features
- Browse all saved prompts with search and complexity filtering
- View prompt details with a live view counter (increments each visit)
- Add new prompts via validated form (title, content, complexity 1-10)
- Stats dashboard: total prompts, avg complexity, breakdown by level (low/medium/high)

### Architecture
- **Frontend**: React + Vite at `/` (artifacts/prompt-library)
- **Backend**: Express API at `/api` (artifacts/api-server)
- **Database**: PostgreSQL via Drizzle ORM — `prompts` table
- **View counting**: In-memory Map in the API server (Redis-free approach)

### API Endpoints
- `GET /api/prompts` — list all prompts (summary)
- `POST /api/prompts` — create a new prompt
- `GET /api/prompts/:id` — get a prompt + increment view count
- `GET /api/prompts/stats` — aggregate stats

### Database Schema
- `prompts`: id, title, content, complexity (1-10), created_at
