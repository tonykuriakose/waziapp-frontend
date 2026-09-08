import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthPermissions = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions.includes(permission);
  };
  
  return { hasPermission, user };
};
