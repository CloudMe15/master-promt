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
  isFavorite?: boolean;
  techStack?: string;
  devRole?: string;
}

export interface AnatomyCard {
  id: string;
  title: string;
  content: string;
  icon: string;
  color: string;
  isEditing?: boolean;
}

export interface PresetItem {
  title: string;
  category: 'web_saas' | 'backend' | 'agentic' | 'devops' | 'security' | 'mobile';
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

export interface VariableItem {
  name: string;
  value: string;
}
