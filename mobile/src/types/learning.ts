export type LessonStatus = 'completed' | 'available' | 'locked';

export type LessonPreview = {
  id: string;
  title: string;
  xpReward: number;
  status: LessonStatus;
};

export type ModulePreview = {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: LessonPreview[];
};

export type CoursePreview = {
  id: string;
  title: string;
  description: string;
  modules: ModulePreview[];
};
