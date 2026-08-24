import api from "../api/axios";

/**
 * Registers a new user account.
 *
 * Wired to the real, working backend endpoint (Module 7's
 * UserController#register). Returns the created UserResponse - note this
 * does NOT include a token, since the backend's registration flow doesn't
 * issue one (there's no auto-login on register in the current backend).
 */
export async function registerUser({
  fullName,
  username,
  email,
  password,
}) {
  const response = await api.post("/users/register", {
    fullName,
    username,
    email,
    password,
  });

  return response.data.data;
}

/**
 * Authenticates a user and returns { accessToken, refreshToken, userId, role }.
 *
 * IMPORTANT: this calls POST /auth/login, which does not exist on the
 * backend as built - Modules 6/7/9 all explicitly deferred authentication
 * to a future security module. This function is written correctly and
 * completely for when that endpoint exists; until then, calling it will
 * fail with a network/404 error, surfaced via normalizeApiError like any
 * other backend error. This is intentional, not a bug - see this
 * project's frontend README for the current status of this gap.
 */
export async function loginUser({ email, password }) {
  const response = await api.post("/users/login", { email, password });
  return response.data.data; // unwrap ApiResponse<LoginResponse>
}
export async function verifyUser({ username, email }) {
  const response = await api.post("/users/verify-user", {
    username,
    email,
  });

  return response.data.data;
}

/** Retrieves a user's public profile by id. Real, working endpoint. */
export async function getUserById(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
}
export async function deleteProfile(userId, password) {

  const response = await api.delete("/users/profile", {
    headers: {
      "X-User-Id": userId,
    },
    data: {
      password,
    },
  });

  return response.data.data;
}
export async function resetPassword({ token, newPassword }) {

  const response = await api.put("/users/reset-password", {
    token,
    newPassword,
  });

  return response.data.data;
}
/** Clears all locally-stored session state. Purely client-side - there is
 *  no server-side token invalidation endpoint yet either. */
export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userFullName");
}
