import { RegisterPayload, UserSession } from '../types/auth';
import { apiRequest } from './apiClient';

export function login(email: string, password: string) {
  return apiRequest<UserSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<UserSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
