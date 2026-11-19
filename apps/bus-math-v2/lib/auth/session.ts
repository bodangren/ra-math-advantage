export type {
  UserRole,
  SessionClaims,
  SessionTokenInput,
  PasswordCredential,
} from "@math-platform/core-auth";
export {
  signSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  generatePasswordSalt,
} from "@math-platform/core-auth";
