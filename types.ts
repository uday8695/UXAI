
export enum AnalysisStep {
  INPUT = 'input',
  ANALYSIS = 'analysis',
  INSIGHTS = 'insights',
  RECOMMENDATIONS = 'recommendations',
  REPORT = 'report'
}

export interface BehaviorMetrics {
  ctr: number;
  bounceRate: number;
  sessionDuration: number;
  scrollDepth: number;
  pageViews: number;
  crawlingDepth: number;
  ga4PropertyId?: string;
  isAutoRetrieved?: boolean;
}

export interface AgentOutput {
  title: string;
  agentName: string;
  content: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface ABTestScenario {
  recommendation: string;
  variantA: string;
  variantB: string;
  metricToTrack: string;
}

export interface UXAnalysisResponse {
  structuralAnalysis: string;
  visualAnalysis: string;
  behavioralAnalysis: string;
  diagnosticAgent: AgentOutput;
  validationAgent: AgentOutput;
  solutionAgent: AgentOutput;
  technicalAgent: AgentOutput;
  abTests: ABTestScenario[];
  overallScore: number;
  groundingLinks?: string[]; // For search grounding URLs
}

export interface User {
  email: string;
  name: string;
}
