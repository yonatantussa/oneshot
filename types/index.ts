// Core types for expandable explanations

export interface ExpandableTerm {
  id: string;
  term: string;
  startIndex: number;
  endIndex: number;
  summary?: string; // Tooltip preview
  isExpanded?: boolean; // Client-side state
  expandedContent?: ExplanationNode; // Loaded on-demand
}

export interface ExplanationNode {
  id: string;
  text: string;
  expandableTerms: ExpandableTerm[];
}

export interface ExplainRequest {
  topic: string;
  options?: {
    includeExamples?: boolean;
    includeUseCases?: boolean;
    includePitfalls?: boolean;
    tone?: 'concise' | 'balanced' | 'detailed';
    complexity?: number; // 1-5 scale
  };
}

export interface ExplainResponse {
  topic: string;
  root: ExplanationNode;
  metadata: {
    estimatedReadTime: number;
    complexityLevel: string;
    totalExpandableTerms: number;
  };
}

export interface ExpandRequest {
  topic: string; // Original topic for context
  termId: string;
  term: string;
  parentContext: string; // Surrounding text for context
  depth: number; // Current depth in expansion tree
}

export interface ExpandResponse {
  termId: string;
  node: ExplanationNode;
}

export interface ApiError {
  error: string;
  details?: string;
}
