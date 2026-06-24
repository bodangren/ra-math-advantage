import type { UserRole } from './session';

/**
 * Returns the password requirement text for a given user role.
 * @param {UserRole} role - User role (student, teacher, admin)
 * @returns {string} - Human-readable requirement string
 */
export function getPasswordRequirementText(role: UserRole): string {
  if (role === 'student') {
    return 'Use at least 6 characters.';
  }

  return 'Use at least 8 characters with at least one letter and one number.';
}

/**
 * Validates a password against role-specific requirements.
 * @param {UserRole} role - User role (student, teacher, admin)
 * @param {string} password - Password to validate
 * @returns {string | null} - Error message string or null if valid
 */
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