export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}