import type { MutationCtx } from "../../convex/_generated/server";
type Row = Record<string, unknown> & { _id: string };
/** Small storage double. It models indexed selection and persisted writes, not transactions. */
export function database() {
  const tables: Record<string, Row[]> = {};
  let sequence = 0;
  const db = {
    normalizeId(table: string, id: string) {
      return tables[table]?.some((row) => row._id === id) ? id : null;
    },
    query(table: string) {
      let descending = false;
      const predicates: Array<(row: Row) => boolean> = [];
      const range = {
        lt(key: string, value: number) {
          predicates.push(
            (row) =>
              typeof row[key] === "number" && (row[key] as number) < value,
          );
          return range;
        },
        eq(key: string, value: unknown) {
          predicates.push((row) => row[key] === value);
          return range;
        },
      };
      const selected = () => {
        const rows = (tables[table] ?? []).filter((row) =>
          predicates.every((p) => p(row)),
        );
        return descending ? rows.toReversed() : rows;
      };
      return {
        withIndex(_name: string, fn?: (q: typeof range) => unknown) {
          fn?.(range);
          return this;
        },
        order(direction: string) {
          descending = direction === "desc";
          return this;
        },
        async unique() {
          const rows = selected();
          if (rows.length > 1) throw Error("not unique");
          return rows[0] ?? null;
        },
        async first() {
          return selected()[0] ?? null;
        },
        async collect() {
          return selected();
        },
        async take(limit: number) {
          return selected().slice(0, limit);
        },
        async paginate(options: { numItems: number; cursor: string | null }) {
          const start = Number(options.cursor ?? 0);
          const rows = selected();
          const end = start + options.numItems;
          return {
            page: rows.slice(start, end),
            isDone: end >= rows.length,
            continueCursor: String(end),
          };
        },
      };
    },
    async get(id: string) {
      return (
        Object.values(tables)
          .flat()
          .find((row) => row._id === id) ?? null
      );
    },
    async insert(table: string, data: Record<string, unknown>) {
      const row = { ...data, _id: `${table}:${++sequence}` };
      (tables[table] ??= []).push(row);
      return row._id;
    },
    async patch(id: string, data: Record<string, unknown>) {
      const row = await db.get(id);
      if (!row) throw Error("missing row");
      Object.assign(row, data);
    },
    async delete(id: string) {
      for (const name of Object.keys(tables))
        tables[name] = tables[name].filter((row) => row._id !== id);
    },
  };
  return { tables, db, ctx: { db } as unknown as MutationCtx };
}
export function invoke<Args, Result>(
  fn: unknown,
  ctx: MutationCtx,
  args: Args,
): Promise<Result> {
  return (
    fn as { _handler: (ctx: MutationCtx, args: Args) => Promise<Result> }
  )._handler(ctx, args);
}
