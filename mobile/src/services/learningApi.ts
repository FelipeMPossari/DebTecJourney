import { AnswerResult, Lesson } from '../types/learning';

const API_BASE_URL = 'http://localhost:5228/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getLesson(lessonId: string) {
  return request<Lesson>(`/lessons/${lessonId}`);
}

export function answerQuestion(questionId: string, answerOptionId: string) {
  return request<AnswerResult>(`/questions/${questionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answerOptionId }),
  });
}
