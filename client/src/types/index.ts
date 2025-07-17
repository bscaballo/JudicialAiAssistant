export type ActiveTab = 
  | 'dashboard'
  | 'case-briefer' 
  | 'legal-research' 
  | 'case-law-explorer' 
  | 'evidence-analyzer' 
  | 'order-drafter' 
  | 'jury-instruction-drafter' 
  | 'daily-docket' 
  | 'oral-argument-coach' 
  | 'activity-history';

export interface CaseDetails {
  caseName: string;
  caseNumber: string;
  court: string;
  dateFiled?: string;
}

export interface DocumentUpload {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface ActivityHistoryItem {
  id: string;
  type: ActiveTab;
  title: string;
  input: Record<string, any>;
  output: Record<string, any>;
  createdAt: string;
}

export interface DocketEntry {
  id: number;
  scheduledTime: string;
  type: 'hearing' | 'motion' | 'trial';
  title: string;
  description?: string;
  status: string;
}

export interface GeneratedOrder {
  id: number;
  orderType: string;
  content: string;
  createdAt: string;
}

export interface LegalResearchResult {
  results: string;
  query: string;
  filters: Record<string, any>;
  searchedAt: string;
}

export interface CaseBrief {
  summary: string;
  caseDetails: CaseDetails;
  generatedAt: string;
}

export interface EvidenceAnalysis {
  analysis: string;
  analysisType: string;
  documentCount: number;
  analyzedAt: string;
}

export interface JuryInstructions {
  instructions: string;
  caseDetails: CaseDetails;
  charges: string;
  specificPoints: string;
  generatedAt: string;
}

export interface OralArgumentCoaching {
  coaching: string;
  caseDetails: CaseDetails;
  arguments: string;
  practiceMode: string;
  generatedAt: string;
}

export interface CaseLawExploration {
  analysis: string;
  topic: string;
  jurisdiction: string;
  dateRange: {
    from: string;
    to: string;
  };
  exploredAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface FileUploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

export interface SearchFilters {
  jurisdiction?: string;
  courtLevel?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
