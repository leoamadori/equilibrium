export type TrainingLevel = 'facile' | 'allenato';

export interface ExerciseLevelConfig {
  summary: string;
  /** Optional isometric / timed hold duration in seconds */
  workSec?: number;
  /** Rest duration in seconds between sets */
  restSec: number;
}

export interface Exercise {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  loadParams: Array<{ label: string; value: string }>;
  steps: string[];
  tvPoints: string[];
  targetMuscles: string;
  commonErrors: string[];
  easyLevel: string;
  advancedLevel: string;
  pdfPage: number;
  imagePath: string;
  videoPath: string;
  audioFullPath: string;
  audioShortPath: string;
  levels: Record<TrainingLevel, ExerciseLevelConfig>;
}
