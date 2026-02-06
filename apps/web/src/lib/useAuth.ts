import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function useAuth() {
  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<AuthUser>('/auth/me'),
    retry: false,
  });
  const user = data?.data;
  return { user, isAdmin: user?.role === 'ADMIN' };
}
