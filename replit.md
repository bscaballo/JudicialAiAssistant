# Judicial AI Assistant

## Overview

The Judicial AI Assistant is a full-stack web application designed to help legal professionals with various judicial tasks. It uses AI-powered tools to assist with case management, legal research, document generation, and court proceedings. The application is built with modern web technologies and follows a clean, modular architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with a dark theme color scheme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Database Schema
- **Users**: Stores user authentication data from Replit Auth
- **Cases**: Legal case management with metadata
- **Documents**: File uploads and document storage
- **Activity History**: Tracks user actions and AI interactions
- **Generated Orders**: Stores AI-generated legal documents
- **Docket Entries**: Calendar and scheduling management
- **Sessions**: Authentication session storage

#### AI Integration
- **AI Provider**: Google Gemini AI (via @google/genai)
- **Capabilities**: 
  - Case briefing and summarization
  - Legal research and case law exploration
  - Evidence analysis
  - Order and jury instruction drafting
  - Oral argument coaching
  - Daily docket management

#### Tool Modules
1. **Case Briefer**: Analyzes uploaded documents and generates case summaries
2. **Legal Research**: Performs comprehensive legal research with filtering
3. **Case Law Explorer**: Explores relevant case law by topic and jurisdiction
4. **Evidence Analyzer**: Analyzes evidence documents for patterns and insights
5. **Order Drafter**: Generates formal legal orders and rulings
6. **Jury Instruction Drafter**: Creates jury instructions for specific cases
7. **Daily Docket**: Manages court schedules and case calendars
8. **Oral Argument Coach**: Provides coaching for oral arguments
9. **Activity History**: Tracks and displays user interaction history

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth (OpenID Connect)
2. **Session Management**: Sessions stored in PostgreSQL with automatic cleanup
3. **Document Upload**: Files uploaded via multer with type validation
4. **AI Processing**: Documents and queries sent to Google Gemini AI
5. **Data Persistence**: All interactions and generated content stored in database
6. **Real-time Updates**: TanStack Query provides reactive updates to UI

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: Neon Database connectivity
- **drizzle-orm**: Database ORM and query builder
- **express**: Web server framework
- **multer**: File upload handling
- **connect-pg-simple**: PostgreSQL session store

### UI Dependencies
- **@radix-ui**: Headless UI components
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-specific configurations and banners

### Production
- **Build Process**: 
  - Client: Vite build to `dist/public`
  - Server: esbuild bundle to `dist/index.js`
- **Deployment**: Node.js server serving built client and API
- **Database**: Production Neon Database with migrations
- **Environment Variables**: 
  - `DATABASE_URL`: Neon database connection string
  - `GEMINI_API_KEY`: Google AI API key
  - `SESSION_SECRET`: Session encryption key
  - `REPL_ID`: Replit environment identifier

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types and schemas
2. **TypeScript Throughout**: Type safety across frontend, backend, and shared code
3. **Database-First**: Schema definitions drive application structure
4. **Component-Based UI**: Modular React components with consistent styling
5. **AI-First Design**: All tools integrate with Google Gemini AI
6. **Session-Based Auth**: Leverages Replit's authentication system
7. **File Upload Strategy**: Local file storage with database metadata
8. **Error Handling**: Comprehensive error boundaries and toast notifications

The application prioritizes user experience with a clean, professional interface suitable for legal professionals, while maintaining robust security and data integrity through proper authentication and database design.