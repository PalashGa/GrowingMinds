# Smart Study Zone - Child Development Platform

## Overview

Smart Study Zone is a comprehensive child development platform that provides assessment tools, educational programs, and progress tracking for children aged 5-16. The application offers behavioral assessments, yoga programs, nutrition planning, robotics education, and educational games to support holistic child development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod for validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **API Pattern**: RESTful endpoints with JSON responses

### Database Design
- **Schema Organization**: Shared schema definitions between client and server
- **Key Entities**:
  - Users (parent accounts with Stripe integration)
  - Children (linked to parent users)
  - Assessment types, questions, and results
  - Yoga programs and sessions
  - Nutrition plans
  - Robotics modules and progress tracking
  - Educational games and scores
- **Migration Strategy**: Drizzle Kit for schema migrations

### Authentication & Authorization
- **Identity Provider**: Replit OIDC for seamless platform integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Route Protection**: Middleware-based authentication checks
- **User Management**: Automatic user creation/updates on login

### API Structure
- **Endpoint Pattern**: `/api/{resource}` with RESTful conventions
- **Error Handling**: Centralized error middleware with status codes
- **Request Logging**: Detailed API request/response logging
- **Data Validation**: Zod schemas for request/response validation

## External Dependencies

### Database & Hosting
- **PostgreSQL**: Primary database using Neon serverless
- **Drizzle ORM**: Type-safe database operations and migrations
- **WebSocket Support**: Neon serverless with ws library for real-time connections

### Authentication Services
- **Replit OIDC**: Platform-native authentication
- **OpenID Client**: Standards-compliant OIDC implementation
- **Passport.js**: Authentication middleware and strategy handling

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **Vite**: Fast build tool with HMR support
- **ESBuild**: Fast JavaScript bundler for production
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation

### Payment Processing
- **Stripe**: Payment processing with React integration
- **Subscription Management**: Premium and family plan support

### Data Visualization
- **Recharts**: Chart library for progress tracking and analytics
- **Progress Components**: Custom progress visualization for child development metrics