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

export type AnswerOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  lessonId: string;
  statement: string;
  explanation: string;
  order: number;
  answerOptions: AnswerOption[];
};

export type LessonPage = {
  id: string;
  lessonId: string;
  title: string;
  body: string;
  highlight: string;
  order: number;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  content: string;
  pages: LessonPage[];
  order: number;
  xpReward: number;
  questions: Question[];
};

export type AnswerResult = {
  questionId: string;
  answerOptionId: string;
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  xpEarned: number;
};
