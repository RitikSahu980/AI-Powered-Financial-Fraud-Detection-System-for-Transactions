import axios from 'axios';

/**
 * Central Axios instance every service file in src/services/ uses.
 *
 * Two things are attached automatically on every request, matching the
 * real backend as built:
 *   - `Authorization: Bearer <token>`, once a real login endpoint exists
 *     and issues one (see authService.js - currently unused since no
 *     token is ever actually obtained yet).
 *   - `X-User-Id`, which Module 7's TransactionController and
 *     FeedbackController require as an interim stand-in for a real
 *     authenticated caller (no JWT exists yet on the backend). This is
 *     read from the locally-stored user record, not invented per-request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }

  return config;
});

/**
 * Normalizes the backend's two distinct error body shapes (see
 * GlobalExceptionHandler, Module 8) into one consistent shape every
 * caller can rely on:
 *   - single-message errors -> { status, error, message, path, timestamp }
 *   - field-level validation failures -> a bare array of
 *     { field, rejectedValue, message }
 *
 * This function never throws - it always returns a normalized object so
 * calling code doesn't need to branch on response shape itself.
 */
export function normalizeApiError(error) {
  if (!error.response) {
    // No response at all: network failure, CORS, backend not running,
    // or (very likely for /auth/login right now) an endpoint that
    // genuinely doesn't exist yet.
    return {
      isValidationError: false,
      status: null,
      message: 'Could not reach the server. Confirm the backend is running and reachable.',
      fieldErrors: [],
    };
  }

  const { status, data } = error.response;

  if (Array.isArray(data)) {
    return {
      isValidationError: true,
      status,
      message: 'Please correct the highlighted fields.',
      fieldErrors: data, // [{ field, rejectedValue, message }, ...]
    };
  }

  return {
    isValidationError: false,
    status,
    message: data?.message || 'An unexpected error occurred.',
    fieldErrors: [],
  };
}

export default api;
