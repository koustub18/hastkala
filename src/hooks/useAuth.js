import { useMemo } from 'react';

export const useAuth = () => {
  const { userRole, userName } = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { userRole: null, userName: null };
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { userRole: payload.role, userName: payload.name };
    } catch {
      return { userRole: null, userName: null };
    }
  }, []);

  return { userRole, userName };
};
