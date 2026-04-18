import type { UserRole } from './session';

export function getPasswordRequirementText(role: UserRole): string {
  if (role === 'student') {
    return 'Use at least 6 characters.';
  }

  return 'Use at least 8 characters with at least one letter and one number.';
}

export function validatePasswordForRole(role: UserRole, password: string): string | null {
  if (password !== password.trim()) {
    return 'Password must not start or end with spaces.';
  }

  if (role === 'student') {
    if (password.length < 6) {
      return 'New password must be at least 6 characters long.';
    }

    return null;
  }

  if (password.length < 8) {
    return 'New password must be at least 8 characters long.';
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'New password must include at least one letter and one number.';
  }

  return null;
}