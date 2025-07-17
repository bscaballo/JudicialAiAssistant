# Judicial AI Assistant

## Overview

The Judicial AI Assistant is a full-stack web application designed to help legal professionals with various judicial tasks. It uses AI-powered tools to assist with case management, legal research, document generation, and court proceedings. The application is built with modern web technologies and follows a clean, modular architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 17, 2025 - OpenAI Integration for Legal Research
- Added OpenAI GPT-4o integration to improve legal research accuracy and reduce hallucinations
- Implemented automatic AI provider switching - uses OpenAI when API key is available, falls back to Gemini
- Created new OpenAI service module with specialized functions for:
  - Legal research with strict citation requirements
  - Case brief generation from document analysis
  - Case law exploration with accurate precedent references
- Configured lower temperature (0.3) for more factual and consistent responses
- Added explicit instructions to only cite actual cases from CourtListener data
- Enhanced prompts to prevent hallucination of case names, citations, or holdings
- Updated all legal research tools to prioritize accuracy over creativity

### January 17, 2025 - Google OAuth Production Fix
- Fixed OAuth redirect URI mismatch error for deployed application
- Hardcoded production redirect URI to match Google Cloud Console configuration
- Implemented state parameter to maintain user context through OAuth flow
- Updated OAuth callback to use state parameter instead of relying on session
- Added sameSite cookie configuration to improve OAuth redirect handling
- Enhanced success page to automatically refresh parent window after connection

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

### January 17, 2025 - Enhanced Legal Research Functionality
- Enhanced legal research tool with granular jurisdiction and court filtering
- Added state-specific court filters (NM, TX, AZ, CA, NY, FL, CO, NV, UT, OK)
- Added federal circuit court filters (1st-11th Circuits, DC Circuit, Federal Circuit)
- Updated CourtListener integration to support specific court searches:
  - State Supreme Courts (e.g., NM Supreme Court)
  - State Appellate Courts (e.g., NM Court of Appeals)
  - Federal Circuit Courts of Appeals (e.g., 10th Circuit)
  - Federal District Courts
- Updated UI with dynamic court level labels based on jurisdiction selection
- Added informational note about HuggingFace Caselaw Access Project dataset (99% of US case law)
- Created placeholder service for future HuggingFace dataset integration
- Improved search precision for jurisdiction-specific legal research

### January 17, 2025 - Advanced CourtListener Search Integration
- Implemented advanced CourtListener search operators and field-specific queries
- Added search type selector (All Fields, Case Name, Docket Number, Citation)
- Integrated case status filtering (Published/Precedential, Unpublished, Errata, etc.)
- Enhanced search query builder using CourtListener's Lucene syntax:
  - Field-specific searches using court_id, caseName, docketNumber, citation fields
  - Date range queries using dateFiled field
  - Boolean operators (AND, OR, NOT) support
  - Wildcard and phrase search capabilities
- Updated case display to show additional metadata:
  - Precedential status badges
  - Citation count indicators
  - Docket numbers
  - Panel judges
- Added search tips help section explaining query operators
- Increased result display from 5 to 10 cases for better research coverage

### January 17, 2025 - Google Search Grounding Integration
- Integrated Google Search grounding with Gemini 2.5 Flash for legal research analysis
- Added grounding tool configuration using google_search tool
- Enhanced legal research to combine CourtListener case law with real-time Google Search results
- Updated Gemini service to include:
  - Dynamic search query building based on jurisdiction and court filters
  - Grounding metadata extraction with web search queries and sources
  - Temperature setting of 1.0 for optimal grounding results
- Enhanced UI to display Google Search sources with:
  - Clickable source links with titles
  - Search queries used for transparency
  - Numbered citations for easy reference
- This provides more comprehensive legal research by combining:
  - Actual case law from CourtListener (primary sources)
  - Current legal news, analysis, and commentary from Google Search (secondary sources)

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
- **Primary AI Provider**: OpenAI GPT-4o (when OPENAI_API_KEY is configured)
- **Fallback AI Provider**: Google Gemini AI (via @google/genai)
- **Provider Selection**: Automatic - uses OpenAI when available for better accuracy, falls back to Gemini
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