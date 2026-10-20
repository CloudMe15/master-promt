export type FrameworkType = 'elite' | 'agentic' | 'standard';

export interface HistoryItem {
  id: number;
  date: string;
  idea: string;
  fullIdea?: string;
  markdown: string;
  model: string;
  tone: string;
  framework?: string;
}

export interface AnatomyCard {
  title: string;
  content: string;
  icon: string;
  color: string;
}

export interface PresetItem {
  text: string;
  model: string;
  framework: FrameworkType;
  techStack: string;
  devRole: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}
