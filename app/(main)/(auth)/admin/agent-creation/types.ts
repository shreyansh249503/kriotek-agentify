export type TrainingMethod = "website" | "files" | "text" | "qna";

export interface QnAPair {
  id: string;
  question: string;
  answer: string;
}

export interface AgentCreationFormData {
  hearAboutUs: string;
  companySize: string;
  trainingMethod: TrainingMethod;
  websiteUrl: string;
  files: File[];
  textSnippet: string;
  qnaList: QnAPair[];
  agentName?: string;
  agentTone?: string;
  primaryColor?: string;
  customGreeting?: string;
}

export interface StepProps {
  formData: AgentCreationFormData;
  updateFormData: (updates: Partial<AgentCreationFormData>) => void;
  onNext?: () => void;
}

export interface StepConfig {
  id: string;
  title: string;
  isFirstTimeOnly?: boolean;
}
