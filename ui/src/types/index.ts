export interface ExecDoc {
  id: string;
  title: string;
  description: string;
  overview: string;
  steps: ExecDocStep[];
  metadata: ExecDocMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecDocStep {
  id: string;
  title: string;
  description: string;
  code: string;
  output?: string;
  status: 'pending' | 'running' | 'success' | 'error';
  order: number;
  expectedOutput?: string;
  timeout?: number;
  retries?: number;
}

export interface ExecDocMetadata {
  author: string;
  version: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  prerequisites: string[];
  kubernetesVersion?: string;
  requiredPermissions: string[];
}

export interface KubernetesContext {
  name: string;
  cluster: string;
  user: string;
  namespace: string;
  isActive: boolean;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  fileName?: string;
  filePath?: string;
  error?: string;
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  confidence: number;
  tokens: number;
  timestamp: Date;
}

export interface AccessibilityState {
  announcements: string[];
  focusedElement: string | null;
  keyboardNavigation: boolean;
  screenReaderActive: boolean;
}

export interface EditorPhase {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
  enabled: boolean;
}

export type AuthoringPhase = 'overview' | 'steps' | 'review' | 'save';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}