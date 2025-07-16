
export type ActiveTab = 'case-briefer' | 'legal-research' | 'order-drafter' | 'daily-docket' | 'oral-argument-coach' | 'evidence-analyzer' | 'jury-instruction-drafter' | 'case-law-explorer' | 'history';

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface OrderDetails {
  caseName: string;
  caseNumber: string;
  rulingDetails: string;
}

export interface DraftedOrder {
  caseStyle: string;
  caseNumber: string;
  courtName: string;
  division: string;
  judgeName: string;
  orderTitle: string;
  introduction: string;
  findingsOfFact: string[];
  conclusionsOfLaw: string[];
  orderClause: string;
  signatureLine: string;
}

export interface JuryInstructionDetails {
  caseName: string;
  charges: string;
  specificPointsToCover: string;
}

export interface DocketItem {
    caseName: string;
    summary: string;
    keyIssues: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface HistoricalCase {
  caseName: string;
  citation: string;
  year: number;
  court: string;
  summary: string;
  keyPrinciple: string;
}

export interface User {
    id: string; // email
    email: string;
}

export interface HistoryItem {
    id: string; // unique id, e.g., timestamp
    timestamp: number;
    type: ActiveTab;
    input: Record<string, any>;
    output: Record<string, any>;
}