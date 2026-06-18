import { internalMutation, internalQuery } from '../_generated/server';
import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';

interface RosterRow {
  rowIndex: number;
  name: string;
  email?: string;
  sisId?: string;
  section?: string;
}

interface RosterImportError {
  rowIndex: number;
  column?: 'name' | 'email' | 'sisId' | 'section';
  code: 'missing_required' | 'invalid_email' | 'duplicate_identifier' | 'malformed_row';
  message: string;
}

interface ImportRosterArgs {
  classId: Id<'classes'>;
  rows: RosterRow[];
  importedBy: Id<'profiles'>;
  source?: {
    fileName?: string;
    rowCount: number;
  };
}

interface ImportRosterResult {
  importId: Id<'roster_imports'>;
  created: number;
  updated: number;
  skipped: number;
  errors: RosterImportError[];
}

interface RosterImportDoc {
  _id: Id<'roster_imports'>;
  _creationTime: number;
  classId: Id<'classes'>;
  importedBy: Id<'profiles'>;
  importedAt: number;
  source: {
    fileName?: string;
    rowCount: number;
  };
  created: number;
  updated: number;
  skipped: number;
  errors: RosterImportError[];
  createdStudentIds: Id<'profiles'>[];
}

type LooseMutationCtx = {
  db: {
    get: (id: Id<any>) => Promise<any | null>;
    query: (table: string) => any;
    insert: (table: string, doc: Record<string, unknown>) => Promise<Id<any>>;
    patch: (id: Id<any>, updates: Record<string, unknown>) => Promise<void>;
  };
};

type LooseQueryCtx = LooseMutationCtx;

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.indexOf('@') < email.lastIndexOf('.');
}

function isEnrollmentMatch(
  enrollment: any,
  classId: Id<'classes'>,
  studentId: Id<'profiles'>,
): boolean {
  return enrollment.classId === classId && enrollment.studentId === studentId;
}

export async function importRosterMutation(
  ctx: LooseMutationCtx,
  args: ImportRosterArgs,
): Promise<ImportRosterResult> {
  const classDoc = await ctx.db.get(args.classId);
  if (!classDoc) {
    throw new Error('class not found');
  }

  if (classDoc.teacherId !== args.importedBy) {
    throw new Error('forbidden: importedBy is not the class teacher');
  }

  const teacher = await ctx.db.get(args.importedBy);
  const orgId: Id<'organizations'> = teacher.organizationId;

  const allProfiles: any[] = await ctx.db
    .query('profiles')
    .withIndex('by_username')
    .collect();
  const profileByEmail = new Map<string, any>();
  for (const p of allProfiles) {
    if (p.role === 'student') {
      profileByEmail.set(p.username, p);
    }
  }

  const allCredentials: any[] = await ctx.db
    .query('auth_credentials')
    .withIndex('by_username')
    .collect();
  const credentialByUsername = new Map<string, any>();
  for (const c of allCredentials) {
    credentialByUsername.set(c.username, c);
  }

  const now = Date.now();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: RosterImportError[] = [];
  const createdStudentIds: Id<'profiles'>[] = [];

  for (const row of args.rows) {
    const email = row.email?.toLowerCase();

    if (!email || !isValidEmail(email)) {
      skipped++;
      errors.push({
        rowIndex: row.rowIndex,
        column: 'email',
        code: 'invalid_email',
        message: 'malformed email',
      });
      continue;
    }

    let profile = profileByEmail.get(email);
    let isNewStudent = false;

    if (!profile) {
      const profileId = await ctx.db.insert('profiles', {
        organizationId: orgId,
        username: email,
        role: 'student',
        displayName: row.name,
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });

      let cred = credentialByUsername.get(email);
      if (!cred) {
        await ctx.db.insert('auth_credentials', {
          profileId,
          username: email,
          role: 'student',
          organizationId: orgId,
          passwordHash: '',
          passwordSalt: '',
          passwordHashIterations: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      profile = {
        _id: profileId,
        username: email,
        role: 'student',
        organizationId: orgId,
        displayName: row.name,
      };
      profileByEmail.set(email, profile);
      isNewStudent = true;
      created++;
      createdStudentIds.push(profileId);
    } else {
      const existingEnrollment = await ctx.db
        .query('class_enrollments')
        .withIndex('by_class_and_student', (q: any) =>
          q.eq('classId', args.classId).eq('studentId', profile._id),
        )
        .unique();

      if (existingEnrollment) {
        skipped++;
        continue;
      }

      updated++;
    }

    await ctx.db.insert('class_enrollments', {
      classId: args.classId,
      studentId: profile._id,
      enrolledAt: now,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  const importId = await ctx.db.insert('roster_imports', {
    classId: args.classId,
    importedBy: args.importedBy,
    importedAt: now,
    source: args.source ?? { rowCount: args.rows.length },
    created,
    updated,
    skipped,
    errors,
    createdStudentIds,
  });

  return { importId: importId as unknown as Id<'roster_imports'>, created, updated, skipped, errors };
}

export async function getImportSummary(
  ctx: LooseQueryCtx,
  args: { classId: Id<'classes'>; importId: Id<'roster_imports'> },
): Promise<{
  importId: Id<'roster_imports'>;
  classId: Id<'classes'>;
  importedBy: Id<'profiles'>;
  importedAt: number;
  source: { fileName?: string; rowCount: number };
  created: number;
  updated: number;
  skipped: number;
  errors: RosterImportError[];
  createdStudentIds: Id<'profiles'>[];
} | null> {
  const doc = await ctx.db.get(args.importId);
  if (!doc) {
    return null;
  }

  if (doc.classId !== args.classId) {
    return null;
  }

  return {
    importId: doc._id,
    classId: doc.classId,
    importedBy: doc.importedBy,
    importedAt: doc.importedAt,
    source: doc.source,
    created: doc.created,
    updated: doc.updated,
    skipped: doc.skipped,
    errors: doc.errors ?? [],
    createdStudentIds: doc.createdStudentIds ?? [],
  };
}

export async function listImportsForClass(
  ctx: LooseQueryCtx,
  args: { classId: Id<'classes'> },
): Promise<
  Array<{
    importId: Id<'roster_imports'>;
    classId: Id<'classes'>;
    importedAt: number;
    source: { fileName?: string; rowCount: number };
    created: number;
    updated: number;
    skipped: number;
    errors: RosterImportError[];
  }>
> {
  const results: any[] = await ctx.db
    .query('roster_imports')
    .withIndex('by_class', (q: any) => q.eq('classId', args.classId))
    .collect();

  return results
    .sort((a, b) => b.importedAt - a.importedAt)
    .map((doc) => ({
      importId: doc._id,
      classId: doc.classId,
      importedAt: doc.importedAt,
      source: doc.source,
      created: doc.created,
      updated: doc.updated,
      skipped: doc.skipped,
      errors: doc.errors ?? [],
    }));
}

export const importRosterMutationConvex = internalMutation({
  args: {
    classId: v.id('classes'),
    rows: v.array(
      v.object({
        rowIndex: v.number(),
        name: v.string(),
        email: v.optional(v.string()),
        sisId: v.optional(v.string()),
        section: v.optional(v.string()),
      }),
    ),
    importedBy: v.id('profiles'),
    source: v.optional(
      v.object({
        fileName: v.optional(v.string()),
        rowCount: v.number(),
      }),
    ),
  },
  handler: importRosterMutation as any,
});

export const getImportSummaryQuery = internalQuery({
  args: {
    classId: v.id('classes'),
    importId: v.id('roster_imports'),
  },
  handler: getImportSummary as any,
});

export const listImportsForClassQuery = internalQuery({
  args: {
    classId: v.id('classes'),
  },
  handler: listImportsForClass as any,
});
