import api from "../api/axios";
import { getUserById } from "./authService";

/**
 * There is no backend endpoint that lists all registered users...
 */
export async function findUserByEmail(email) {
  const response = await api.get(`/users/email/${encodeURIComponent(email)}`);
  return response.data.data;
}

export { getUserById as findUserById };

/**
 * Change the current user's password.
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });

  return response.data;
}
