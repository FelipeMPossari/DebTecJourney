export type UserSession = {
  id: string;
  name: string;
  email: string;
  academicProfile: string;
  experienceLevel: string;
  learningGoal: string;
  dailyGoalMinutes: number;
  totalXp: number;
  currentLevel: number;
  token: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  academicProfile: string;
  experienceLevel: string;
  learningGoal: string;
  dailyGoalMinutes: number;
};
