import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const PASSWORD_HASH_ITERATIONS = 120000;

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    keyMaterial,
    256,
  );

  return arrayBufferToBase64Url(derived);
}

function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return arrayBufferToBase64Url(bytes.buffer);
}

interface SeedDemoUser {
  username: string;
  displayName: string;
  role: 'teacher' | 'student';
  password: string;
  profileId?: Id<'profiles'>;
  authCredentialId?: string;
}

interface SeedDemoResult {
  organizationId: Id<'organizations'>;
  teacher: SeedDemoUser;
  students: SeedDemoUser[];
  classId: Id<'classes'>;
  enrollmentIds: Id<'class_enrollments'>[];
}

export const seedDemoEnv = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedDemoResult> => {
    const now = Date.now();
    const orgSlug = 'demo-org';
    const orgName = 'Demo Organization';

    const existingOrg = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', orgSlug))
      .unique();

    const organizationId: Id<'organizations'> = existingOrg
      ? existingOrg._id
      : await ctx.db.insert('organizations', {
          name: orgName,
          slug: orgSlug,
          settings: {},
          createdAt: now,
          updatedAt: now,
        });

    const teacherPassword = 'teacher123';
    const teacherSalt = generateSalt();
    const teacherPasswordHash = await hashPassword(teacherPassword, teacherSalt);

    const existingTeacherProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', 'demo_teacher'))
      .unique();

    const teacherProfileId: Id<'profiles'> = existingTeacherProfile
      ? existingTeacherProfile._id
      : await ctx.db.insert('profiles', {
          organizationId,
          username: 'demo_teacher',
          role: 'teacher',
          displayName: 'Demo Teacher',
          metadata: {},
          createdAt: now,
          updatedAt: now,
        });

    const existingTeacherAuth = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (q) => q.eq('username', 'demo_teacher'))
      .unique();

    if (!existingTeacherAuth) {
      await ctx.db.insert('auth_credentials', {
        profileId: teacherProfileId,
        username: 'demo_teacher',
        role: 'teacher',
        organizationId,
        passwordHash: teacherPasswordHash,
        passwordSalt: teacherSalt,
        passwordHashIterations: PASSWORD_HASH_ITERATIONS,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const teacher: SeedDemoUser = {
      username: 'demo_teacher',
      displayName: 'Demo Teacher',
      role: 'teacher',
      password: teacherPassword,
      profileId: teacherProfileId,
    };

    const studentUsernames = [
      'demo_student_1',
      'demo_student_2',
      'demo_student_3',
    ];
    const studentDisplayNames = [
      'Demo Student 1',
      'Demo Student 2',
      'Demo Student 3',
    ];

    const students: SeedDemoUser[] = [];

    for (let i = 0; i < studentUsernames.length; i++) {
      const username = studentUsernames[i];
      const displayName = studentDisplayNames[i];
      const password = 'student123';
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const existingStudentProfile = await ctx.db
        .query('profiles')
        .withIndex('by_username', (q) => q.eq('username', username))
        .unique();

      const studentProfileId: Id<'profiles'> = existingStudentProfile
        ? existingStudentProfile._id
        : await ctx.db.insert('profiles', {
            organizationId,
            username,
            role: 'student',
            displayName,
            metadata: {},
            createdAt: now,
            updatedAt: now,
          });

      const existingStudentAuth = await ctx.db
        .query('auth_credentials')
        .withIndex('by_username', (q) => q.eq('username', username))
        .unique();

      if (!existingStudentAuth) {
        await ctx.db.insert('auth_credentials', {
          profileId: studentProfileId,
          username,
          role: 'student',
          organizationId,
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: PASSWORD_HASH_ITERATIONS,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      students.push({
        username,
        displayName,
        role: 'student',
        password,
        profileId: studentProfileId,
      });
    }

    const existingClass = await ctx.db
      .query('classes')
      .withIndex('by_teacher', (q) => q.eq('teacherId', teacherProfileId))
      .unique();

    const classId: Id<'classes'> = existingClass && existingClass.name === 'AP Precalc Period 1'
      ? existingClass._id
      : await ctx.db.insert('classes', {
          teacherId: teacherProfileId,
          name: 'AP Precalc Period 1',
          archived: false,
          createdAt: now,
          updatedAt: now,
        });

    const enrollmentIds: Id<'class_enrollments'>[] = [];

    for (const student of students) {
      if (!student.profileId) continue;

      const existingEnrollment = await ctx.db
        .query('class_enrollments')
        .withIndex('by_class_and_student', (q) =>
          q.eq('classId', classId).eq('studentId', student.profileId!)
        )
        .unique();

      if (!existingEnrollment) {
        const enrollmentId = await ctx.db.insert('class_enrollments', {
          classId,
          studentId: student.profileId,
          enrolledAt: now,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        enrollmentIds.push(enrollmentId);
      } else {
        enrollmentIds.push(existingEnrollment._id);
      }
    }

    return {
      organizationId,
      teacher,
      students,
      classId,
      enrollmentIds,
    };
  },
});
