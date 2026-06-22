/**
 * ProposalAI Global Type Definitions
 */

export enum UserRole {
  SALES_REP = "Sales Rep",
  SALES_MANAGER = "Sales Manager",
  ADMIN = "Admin"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RFPDocument {
  id: string;
  title: string;
  uploadDate: string;
  fileSize: string;
  status: "processing" | "completed" | "failed";
  deadline: string;
  mandatoryRequirementsCount: number;
  evaluationCriteria: string[];
  extractedRequirements: Requirement[];
}

export interface Requirement {
  id: string;
  rfpId: string;
  code: string; // e.g. REQ-001
  text: string;
  category: "Technical" | "Security" | "Pricing" | "General" | "Implementation";
  isMandatory: boolean;
  priority: "High" | "Medium" | "Low";
}

export interface Proposal {
  id: string;
  title: string;
  rfpId: string;
  rfpTitle: string;
  status: "draft" | "review" | "approved";
  lastModified: string;
  createdAt: string;
  sections: ProposalSection[];
  complianceResults: ComplianceResult[];
  pricingSummary?: {
    oneTimeFee: number;
    recurringFee: number;
    billingCycle: string;
    currency: string;
  };
}

export interface ProposalSection {
  id: string;
  proposalId: string;
  sectionNumber: string; // e.g. "1", "2.1"
  title: string;
  content: string;
  type: 
    | "Cover Page"
    | "Executive Summary"
    | "Understanding of Requirements"
    | "Proposed Solution"
    | "Compliance Matrix"
    | "Pricing & Commercial Terms"
    | "Implementation Plan"
    | "Team & Credentials"
    | "Appendices";
  status: "pending" | "generated" | "completed" | "editing";
  mermaidDiagram?: string;
}

export interface ComplianceResult {
  id: string;
  requirementCode: string;
  requirementText: string;
  isMandatory: boolean;
  status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Not Applicable";
  responseExcerpt: string;
  gapAnalysis: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: "Previous Proposals" | "Product Catalog" | "Pricing Template" | "FAQ";
  content: string;
  uploadDate: string;
  tags: string[];
}

export interface ChatSession {
  id: string;
  proposalId?: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  referenceSources?: string[]; // Quotes/citations retrieved from FAISS
}
