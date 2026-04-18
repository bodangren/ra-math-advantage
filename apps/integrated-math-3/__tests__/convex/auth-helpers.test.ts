import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';
import type { QueryCtx, MutationCtx } from '@/convex/_generated/server';
import { getAuthorizedTeacher, getStudentInTeacherOrg } from '@/convex/auth';

function createMockDb(getImpl: (id: string) => Record<string, unknown> | null) {
  return {
    get: vi.fn(getImpl),
    query: vi.fn(() => ({
      withIndex: vi.fn(() => ({
        unique: vi.fn(() => Promise.resolve(null)),
        collect: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => ({
          take: vi.fn(() => Promise.resolve([])),
        })),
      })),
      collect: vi.fn(() => Promise.resolve([])),
    })),
  };
}

describe('getAuthorizedTeacher', () => {
  const mockOrgId = 'org1' as Id<'organizations'>;
  const mockTeacherId = 'teacher1' as Id<'profiles'>;
  const mockAdminId = 'admin1' as Id<'profiles'>;
  const mockStudentId = 'student1' as Id<'profiles'>;

  const teacherProfile = {
    _id: mockTeacherId,
    _creationTime: 1000,
    organizationId: mockOrgId,
    username: 'teacher1',
    role: 'teacher' as const,
    displayName: 'Teacher One',
    createdAt: 1000,
    updatedAt: 1000,
  };

  const adminProfile = {
    _id: mockAdminId,
    _creationTime: 1000,
    organizationId: mockOrgId,
    username: 'admin1',
    role: 'admin' as const,
    displayName: 'Admin One',
    createdAt: 1000,
    updatedAt: 1000,
  };

  const studentProfile = {
    _id: mockStudentId,
    _creationTime: 1000,
    organizationId: mockOrgId,
    username: 'student1',
    role: 'student' as const,
    displayName: 'Student One',
    createdAt: 1000,
    updatedAt: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns teacher profile when user is a valid teacher', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockTeacherId) return teacherProfile;
      return null;
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getAuthorizedTeacher(ctx, mockTeacherId);

    expect(result).not.toBeNull();
    expect(result?._id).toBe(mockTeacherId);
    expect(result?.role).toBe('teacher');
    expect(mockDb.get).toHaveBeenCalledWith(mockTeacherId);
  });

  it('returns teacher profile when user is an admin', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockAdminId) return adminProfile;
      return null;
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getAuthorizedTeacher(ctx, mockAdminId);

    expect(result).not.toBeNull();
    expect(result?._id).toBe(mockAdminId);
    expect(result?.role).toBe('admin');
  });

  it('returns null when profile does not exist', async () => {
    const mockDb = createMockDb(() => null);
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getAuthorizedTeacher(ctx, mockTeacherId);

    expect(result).toBeNull();
  });

  it('returns null when user is a student', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockStudentId) return studentProfile;
      return null;
    });
    const ctx = { db: mockDb } as unknown as QueryCtx;

    const result = await getAuthorizedTeacher(ctx, mockStudentId);

    expect(result).toBeNull();
  });
});

describe('getStudentInTeacherOrg', () => {
  const mockOrgId = 'org1' as Id<'organizations'>;
  const mockOtherOrgId = 'org2' as Id<'organizations'>;
  const mockTeacherId = 'teacher1' as Id<'profiles'>;
  const mockStudentId = 'student1' as Id<'profiles'>;
  const mockOtherStudentId = 'student2' as Id<'profiles'>;

  const teacherProfile = {
    _id: mockTeacherId,
    _creationTime: 1000,
    organizationId: mockOrgId,
    username: 'teacher1',
    role: 'teacher' as const,
    displayName: 'Teacher One',
    createdAt: 1000,
    updatedAt: 1000,
  };

  const studentInOrg = {
    _id: mockStudentId,
    _creationTime: 1000,
    organizationId: mockOrgId,
    username: 'student1',
    role: 'student' as const,
    displayName: 'Student One',
    createdAt: 1000,
    updatedAt: 1000,
  };

  const studentInOtherOrg = {
    _id: mockOtherStudentId,
    _creationTime: 1000,
    organizationId: mockOtherOrgId,
    username: 'student2',
    role: 'student' as const,
    displayName: 'Student Two',
    createdAt: 1000,
    updatedAt: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns student when student is in same organization', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockStudentId) return studentInOrg;
      return null;
    });
    const ctx = { db: mockDb } as unknown as MutationCtx;

    const result = await getStudentInTeacherOrg(ctx, mockStudentId, teacherProfile);

    expect(result).not.toBeNull();
    expect(result?._id).toBe(mockStudentId);
    expect(result?.role).toBe('student');
  });

  it('returns null when student is in different organization', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockOtherStudentId) return studentInOtherOrg;
      return null;
    });
    const ctx = { db: mockDb } as unknown as MutationCtx;

    const result = await getStudentInTeacherOrg(ctx, mockOtherStudentId, teacherProfile);

    expect(result).toBeNull();
  });

  it('returns null when profile does not exist', async () => {
    const mockDb = createMockDb(() => null);
    const ctx = { db: mockDb } as unknown as MutationCtx;

    const result = await getStudentInTeacherOrg(ctx, mockStudentId, teacherProfile);

    expect(result).toBeNull();
  });

  it('returns null when profile is a teacher', async () => {
    const mockDb = createMockDb((id: string) => {
      if (id === mockTeacherId) return teacherProfile;
      return null;
    });
    const ctx = { db: mockDb } as unknown as MutationCtx;

    const result = await getStudentInTeacherOrg(ctx, mockTeacherId, teacherProfile);

    expect(result).toBeNull();
  });
});