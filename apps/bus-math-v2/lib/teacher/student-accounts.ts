import type { Id } from '@/convex/_generated/dataModel';
import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import {
  generatePasswordSalt,
  generateRandomPassword,
  hashPassword,
} from '@/lib/auth/session';

interface TeacherClaimsLike {
  role: string;
  sub: string;
}

interface StudentAccountRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

interface PreparedStudentAccount {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  preferredUsername?: string;
  password: string;
  passwordHash: string;
  passwordSalt: string;
  passwordHashIterations: number;
}

interface CreatedStudentAccount {
  studentId: unknown;
  username: string;
  displayName: string;
  email?: string;
}

/**
 * Checks if a role string represents a teacher or admin role.
 * @param role - The role string to check
 * @returns True if role is 'teacher' or 'admin'
 */
export function isTeacherOrAdminRole(role: string | undefined): boolean {
  return role === 'teacher' || role === 'admin';
}

/**
 * Validates that the claims represent a teacher or admin, returning an error
 * response if not. Returns null on success.
 * @param claims - The auth claims to validate
 * @param message - Error message to include in the 403 response
 * @returns null if authorized, Response with 403 status if not
 */
export function requireTeacherClaims(
  claims: TeacherClaimsLike,
  message: string,
): Response | null {
  if (isTeacherOrAdminRole(claims.role)) {
    return null;
  }

  return Response.json({ error: message }, { status: 403 });
}

/**
 * Extracts the teacher profile ID from auth claims.
 * @param claims - The auth claims containing the sub field
 * @returns The profile ID as a Convex Id type
 */
export function getTeacherProfileId(claims: TeacherClaimsLike): Id<'profiles'> {
  return claims.sub as Id<'profiles'>;
}

/**
 * Prepares student accounts by generating passwords and hashes for each student.
 * @param students - Array of student account request objects
 * @returns Array of prepared student accounts with hashed passwords
 * @throws Error if password hashing fails
 */
export async function prepareStudentAccounts(
  students: StudentAccountRequest[],
): Promise<PreparedStudentAccount[]> {
  return Promise.all(
    students.map(async (student) => {
      const password = generateRandomPassword(12);
      const passwordSalt = generatePasswordSalt();
      const passwordHash = await hashPassword(
        password,
        passwordSalt,
        PASSWORD_HASH_ITERATIONS,
      );

      return {
        firstName: student.firstName,
        lastName: student.lastName,
        displayName: student.displayName,
        preferredUsername: student.username,
        password,
        passwordHash,
        passwordSalt,
        passwordHashIterations: PASSWORD_HASH_ITERATIONS,
      };
    }),
  );
}

/**
 * Converts prepared student accounts into mutation payloads for Convex.
 * @param students - Array of prepared student accounts
 * @returns Array of payloads suitable for Convex mutations
 */
export function toStudentMutationPayloads(
  students: PreparedStudentAccount[],
) {
  return students.map((student) => ({
    firstName: student.firstName,
    lastName: student.lastName,
    displayName: student.displayName,
    preferredUsername: student.preferredUsername,
    passwordHash: student.passwordHash,
    passwordSalt: student.passwordSalt,
    passwordHashIterations: student.passwordHashIterations,
  }));
}

/**
 * Returns the internal email address format for a student account.
 * @param username - The student username
 * @returns Formatted internal email address
 */
export function formatStudentEmail(username: string): string {
  return `${username}@internal.domain`;
}

/**
 * Combines created student accounts with their original prepared data to
 * produce response objects that include the generated password.
 * @param createdStudents - Array of created student accounts from Convex
 * @param preparedStudents - Array of prepared accounts with plaintext passwords
 * @returns Array of response objects containing credentials and student info
 */
export function toCreatedStudentResponses(
  createdStudents: CreatedStudentAccount[],
  preparedStudents: PreparedStudentAccount[],
) {
  return createdStudents.map((student, index) => ({
    studentId: student.studentId,
    username: student.username,
    password: preparedStudents[index]!.password,
    displayName: student.displayName,
    email: student.email ?? formatStudentEmail(student.username),
  }));
}
