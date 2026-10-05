import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SQL_DIR = path.resolve(__dirname, '..', '..', 'sql');

export type Row = Record<string, unknown>;

export const SQL_QUERIES = {
  roundTripTransactions: 'round_trip_transactions.sql',
  playerStreaks: 'player_streaks.sql',
} as const;

export type QueryName = keyof typeof SQL_QUERIES;

export function readSqlFile(fileName: string): string {
  return readFileSync(path.join(SQL_DIR, fileName), 'utf8');
}

/**
 * In-memory SQLite database built from sql/schema.sql and sql/seed.sql, so every run of the
 * query tests and of `npm run sql` starts from the same reproducible state.
 */
export class SqlDatabase {
  private constructor(private readonly db: DatabaseSync) {}

  static createSeeded(): SqlDatabase {
    const db = new DatabaseSync(':memory:');
    db.exec(readSqlFile('schema.sql'));
    db.exec(readSqlFile('seed.sql'));
    return new SqlDatabase(db);
  }

  run(query: QueryName): Row[] {
    return this.db.prepare(readSqlFile(SQL_QUERIES[query])).all() as Row[];
  }

  close(): void {
    this.db.close();
  }
}
