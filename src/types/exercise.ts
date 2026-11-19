export interface ExerciseTimerPreset {
  id: string;
  label: string;
  durationSec: number;
  kind: 'work' | 'rest';
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
  timerPresets: ExerciseTimerPreset[];
}
