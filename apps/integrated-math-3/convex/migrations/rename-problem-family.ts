interface SrsCardRow {
  _id: string;
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  variantKey?: string;
  stability: number;
  difficulty: number;
  state: string;
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  createdAt: number;
  updatedAt: number;
}

interface MigrationDb {
  query(table: string): { collect(): Promise<SrsCardRow[]> };
  patch(id: string, updates: Record<string, unknown>): Promise<void>;
}

async function migrate(db: MigrationDb): Promise<void> {
  const rows = await db.query('srs_cards').collect();
  for (const row of rows) {
    await db.patch(row._id, { variantKey: row.problemFamilyId });
  }
}

async function rollback(db: MigrationDb): Promise<void> {
  const rows = await db.query('srs_cards').collect();
  for (const row of rows) {
    await db.patch(row._id, { problemFamilyId: row.variantKey ?? row.problemFamilyId });
  }
}

export const renameProblemFamilyToVariantKey: ((db: MigrationDb) => Promise<void>) & {
  rollback: (db: MigrationDb) => Promise<void>;
} = Object.assign(migrate, { rollback });
