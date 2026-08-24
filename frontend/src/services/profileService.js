import { getUserById } from './authService';

/** Both portals' Profile pages read the same real UserResponse - there's nothing role-specific about it on this backend. */
export async function getProfile(userId) {
  return getUserById(userId);
}
