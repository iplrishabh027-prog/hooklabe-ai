
export type UserPlan = 'Free' | 'Starter' | 'Pro';

export interface ReelIdea {
  id: string;
  title: string;
  style: string;
  hook: string;
  duration: string;
  mainScript: string;
  onScreenText: string;
  cta: string;
  strategicAnalysis: string;
}

export type HookStyle = 'Curious' | 'Shocking' | 'Emotional' | 'Auto';
export type Niche = 'Business' | 'Tech' | 'Motivation' | 'Humor' | 'Lifestyle' | 'Travel' | 'Fitness' | 'Generic' | 'Story' | 'Finance' | 'Food' | 'Education' | 'Other';
export type VideoTone = 'Motivational' | 'Educational' | 'Shocking' | 'Funny' | 'Emotional' | 'Relatable';
export type Platform = 'Instagram' | 'TikTok' | 'YouTube Shorts';
export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Hindi' | 'Hinglish' | 'Arabic';

export interface GenerationConfig {
  niche: Niche;
  audienceType: string;
  platform: Platform;
  tone: VideoTone;
  language: Language;
  hookStyle: HookStyle;
  duration: string;
  count: number;
  plan: UserPlan;
}

export interface AppState {
  ideas: ReelIdea[];
  loading: boolean;
  error: string | null;
  config: GenerationConfig;
  plan: UserPlan;
}
