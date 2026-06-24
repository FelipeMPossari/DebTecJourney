import { AnswerResult, CourseOverview, Lesson } from '../types/learning';
import { apiRequest } from './apiClient';

export function getCourseOverview(token: string) {
  return apiRequest<CourseOverview>('/users/me/course-overview', { token });
}

export function getLesson(lessonId: string, token: string) {
  return apiRequest<Lesson>(`/lessons/${lessonId}`, { token });
}

export function answerQuestion(questionId: string, answerOptionId: string, token: string) {
  return apiRequest<AnswerResult>(`/questions/${questionId}/answer`, {
    method: 'POST',
    token,
    body: JSON.stringify({ answerOptionId }),
  });
}
