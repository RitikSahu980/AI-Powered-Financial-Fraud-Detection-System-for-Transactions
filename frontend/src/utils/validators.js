const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  if (!value?.trim()) return 'Email is required.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

export function validateRequired(value, label) {
  if (!value?.trim()) return `${label} is required.`;
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

// ---- Transaction form (mirrors CreateTransactionRequest's real constraints:
// @NotNull @Min(1) step, @NotNull @Positive amount,
// @NotNull @PositiveOrZero for every balance field, @NotBlank for names) ----

export function validateStep(value) {
  if (value === '' || value === null || value === undefined) return 'Step is required.';
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return 'Step must be a whole number, 1 or greater.';
  return null;
}

export function validatePositiveAmount(value, label = 'Amount') {
  if (value === '' || value === null || value === undefined) return `${label} is required.`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a number.`;
  if (n <= 0) return `${label} must be greater than 0.`;
  return null;
}

export function validatePositiveOrZeroAmount(value, label) {
  if (value === '' || value === null || value === undefined) return `${label} is required.`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a number.`;
  if (n < 0) return `${label} cannot be negative.`;
  return null;
}
