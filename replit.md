# Judicial AI Assistant

## Overview

The Judicial AI Assistant is a full-stack web application designed to help legal professionals with various judicial tasks. It uses AI-powered tools to assist with case management, legal research, document generation, and court proceedings. The application is built with modern web technologies and follows a clean, modular architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 17, 2025 - Case Selector Implementation
- Added case selector dropdown to sidebar for selecting active case
- Implemented "Add New Case" functionality with manual entry and AI-powered document extraction
- Created case creation dialog with tabbed interface for manual entry or pleading upload
- Added AI-powered case information extraction from initial pleadings using Google Gemini
- Updated all tools to receive selectedCase context for proper case attribution
- Enhanced sidebar UI with case selection dropdown showing case names and numbers
- Integrated case selection state management throughout the application
- Created case extractor service for automatic case detail extraction from legal documents

### January 17, 2025 - Dashboard Implementation
- Added comprehensive dashboard as default landing page after login
- Dashboard displays pending cases, calendar events, and AI tool access
- Integrated dashboard with existing case and Google Calendar APIs
- Added stats cards showing case counts and upcoming events
- Dashboard provides quick access to all AI legal tools
- Updated sidebar navigation to include dashboard at the top
- Dashboard shows recent cases and upcoming calendar events

### January 17, 2025 - PDF Document Processing Implementation
- Added PDF text extraction capability using pdf-parse library
- Enhanced document schema to store extracted text content in `textContent` field
- Updated file upload service to automatically extract text from PDFs during upload
- Modified all Gemini AI functions to use stored text content instead of file metadata
- Fixed text formatting issues across all AI tool components with shared utility
- All AI analysis tools now properly analyze actual document content rather than just file names

### January 17, 2025 - Gemini Native PDF Processing Update
- Transitioned from local PDF text extraction to Gemini's native PDF processing capabilities
- Updated `generateCaseBrief` and `analyzeEvidence` functions to send actual PDF files to Gemini API
- Made text extraction optional in file upload process (text extraction now serves as fallback only)
- Gemini now receives PDFs as base64-encoded inline data for better document understanding
- This resolves issues with scanned PDFs and image-heavy documents that pdf-parse couldn't handle
- Text extraction remains as fallback for non-PDF file types or when file upload to Gemini fails
- Also updated case extraction service (`generateCaseInfoFromFile`) to use native PDF processing
- Fixed "Add New Case" upload pleading functionality to properly extract case info from scanned PDFs

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
1. **Dashboard**: Main overview page showing cases, calendar events, and tool access
2. **Case Briefer**: Analyzes uploaded documents and generates case summaries
3. **Legal Research**: Performs comprehensive legal research with filtering
4. **Case Law Explorer**: Explores relevant case law by topic and jurisdiction
5. **Evidence Analyzer**: Analyzes evidence documents for patterns and insights
6. **Order Drafter**: Generates formal legal orders and rulings
7. **Jury Instruction Drafter**: Creates jury instructions for specific cases
8. **Daily Docket**: Manages court schedules and case calendars
9. **Oral Argument Coach**: Provides coaching for oral arguments
10. **Activity History**: Tracks and displays user interaction history

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