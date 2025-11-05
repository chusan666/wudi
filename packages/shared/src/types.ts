export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Environment = 'development' | 'production' | 'test';

export interface Config {
  env: Environment;
  apiUrl: string;
  apiPort: number;
}
