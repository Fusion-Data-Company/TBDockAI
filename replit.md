# TBDock AI Platform

## Overview

TBDock AI Platform is a comprehensive automation and AI-powered CRM solution designed specifically for TBDock, a waterfront construction firm in Coeur D'Alene, Idaho. The platform manages the complete lead lifecycle—from capture and qualification through nurturing and conversion—while automating marketing content creation and campaign management. Built with a modern full-stack architecture, it integrates AI agents powered by OpenRouter/LLM services to generate blog posts, newsletters, and social media content tailored to the construction industry's unique sales cycle and stakeholder requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, utilizing a Single Page Application (SPA) pattern built on Vite for optimal development experience and build performance.

**UI Framework**: shadcn/ui component library built on Radix UI primitives, providing accessible and customizable components. The design system uses a dark theme with a navy blue base (`hsl(215, 45%, 8%)`) and gold/primary accents (`hsl(38, 42%, 65%)`), matching TBDock's existing brand aesthetic.

**State Management**: TanStack Query (React Query) for server state management, providing automatic caching, background refetching, and optimistic updates. No global client state management library is used—component-level state with hooks handles local UI state.

**Routing**: Wouter for lightweight client-side routing, protecting authenticated routes through the `useAuth` hook integration.

**Path Aliases**: Configured via TypeScript and Vite to use `@/` for client components/utilities and `@shared/` for shared types/schemas between frontend and backend.

### Backend Architecture

**Framework**: Express.js running on Node.js with TypeScript, following an ESM (ECMAScript Modules) pattern.

**API Design**: RESTful API endpoints organized by domain (contacts, opportunities, projects, marketing, AI content). All routes are protected by authentication middleware.

**Authentication**: Replit Auth integration using OpenID Connect (OIDC) with Passport.js strategy. Session management via express-session with PostgreSQL session store (`connect-pg-simple`).

**Business Logic Layer**: Separated into services (`server/services/`) including:
- `openRouter.ts`: Handles LLM API calls to OpenRouter for AI content generation
- `agents.ts`: Orchestrates different AI agent types (blog, newsletter, social, voice) and delegates to OpenRouter service

**Storage Layer**: Abstracted through `server/storage.ts` interface, providing a clean separation between business logic and database operations.

### Data Storage

**Database**: PostgreSQL via Neon serverless (`@neondatabase/serverless`), chosen for scalability and serverless-friendly connection pooling.

**ORM**: Drizzle ORM with schema-first approach. Schema definitions in `shared/schema.ts` are shared between client and server for type safety.

**Schema Design**: 
- **Core CRM Tables**: users, contacts, projects, opportunities, tasks, interactions, documents
- **Marketing Tables**: marketingCampaigns, aiContentGenerations
- **Session Management**: sessions table for Replit Auth
- **Relationships**: Properly defined using Drizzle relations API for contacts→projects, opportunities→contacts, etc.

**Type Safety**: Drizzle-Zod integration generates Zod schemas from database schema for runtime validation on API endpoints.

**Migration Strategy**: Drizzle Kit for schema migrations with configuration in `drizzle.config.ts`, using the `db:push` script for development.

### Authentication & Authorization

**Provider**: Replit Auth (OIDC-based) for seamless integration with Replit hosting environment.

**Session Storage**: Server-side sessions stored in PostgreSQL with 7-day TTL, using secure HTTP-only cookies.

**User Management**: Users are automatically created/updated on first login via OIDC claims, storing profile information (email, name, avatar) in the users table.

**Route Protection**: `isAuthenticated` middleware on all `/api/*` routes except `/api/auth/user`. Frontend checks authentication status via `useAuth()` hook before rendering protected pages.

### External Dependencies

**AI Content Generation**: 
- **OpenRouter API**: Primary LLM gateway for content generation, configured with API key in environment variables. Supports multiple model providers through a unified interface.
- **Model Used**: Configurable per agent type, defaulting to capable models for different content types (blog articles, newsletters, social posts)

**UI Component Library**:
- **Radix UI**: Comprehensive set of unstyled, accessible React components (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens for TBDock branding
- **Recharts**: Data visualization library for analytics charts and dashboards

**Development Tools**:
- **Vite**: Build tool and dev server with HMR
- **Replit-specific plugins**: Development banners, error overlays, and cartographer for Replit environment integration

**Database**:
- **Neon Serverless Postgres**: Serverless PostgreSQL with WebSocket support for connection pooling
- **Connection Method**: Uses `@neondatabase/serverless` with WebSocket constructor override for Node.js compatibility

**Form Handling**:
- **React Hook Form**: Form state management with `@hookform/resolvers` for Zod schema validation integration

**Utilities**:
- **date-fns**: Date manipulation and formatting
- **clsx + tailwind-merge**: Conditional CSS class composition
- **nanoid**: Unique ID generation for client-side operations