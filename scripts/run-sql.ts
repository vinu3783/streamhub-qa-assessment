/**
 * Executes the A4 queries against a freshly seeded in-memory SQLite database and writes the
 * evidence the assessment asks for: console output, a Markdown table and a PNG screenshot of
 * each query's real result set (reports/sql/).
 *
 *   npm run sql
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  readSqlFile,
  SQL_QUERIES,
  SqlDatabase,
  type QueryName,
  type Row,
} from '../tests/utils/sqlDatabase';

const OUTPUT_DIR = path.join('reports', 'sql');

const TITLES: Record<QueryName, string> = {
  roundTripTransactions: 'Scenario 1 — Round-trip transfers (within 10%, within 24 hours)',
  playerStreaks: 'Scenario 2 — 30+ runs in at least 3 consecutive 2024 innings',
};

const escapeHtml = (value: unknown) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );

function toMarkdown(
  title: string,
  file: string,
  rows: Row[],
  executedAt: string,
  sqliteVersion: string,
) {
  const columns = Object.keys(rows[0] ?? {});
  return [
    `# ${title}`,
    '',
    `Query: \`sql/${file}\` · SQLite ${sqliteVersion} · executed ${executedAt} · ${rows.length} rows`,
    '',
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((c) => String(row[c])).join(' | ')} |`),
    '',
  ].join('\n');
}

function toHtml(
  title: string,
  file: string,
  rows: Row[],
  executedAt: string,
  sqliteVersion: string,
) {
  const columns = Object.keys(rows[0] ?? {});
  const query = readSqlFile(file);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font:14px/1.5 'Segoe UI',system-ui,sans-serif;margin:24px;color:#0b0b0b;background:#fcfcfb}
    h1{font-size:18px;margin:0 0 4px} p{margin:0 0 16px;color:#52514e}
    pre{background:#f0efec;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap}
    table{border-collapse:collapse;font-variant-numeric:tabular-nums}
    th,td{border:1px solid #d9d8d2;padding:6px 10px;text-align:left} th{background:#eef3fb}
  </style></head><body>
  <h1>${escapeHtml(title)}</h1>
  <p>sql/${escapeHtml(file)} · SQLite ${escapeHtml(sqliteVersion)} · executed ${escapeHtml(executedAt)} · ${rows.length} rows</p>
  <table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${columns.map((c) => `<td>${escapeHtml(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <h2 style="font-size:14px;margin:20px 0 6px">Query</h2><pre>${escapeHtml(query)}</pre>
  </body></html>`;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const executedAt = new Date().toISOString();
  const versionDb = new DatabaseSync(':memory:');
  const { version } = versionDb.prepare('SELECT sqlite_version() AS version').get() as {
    version: string;
  };
  versionDb.close();

  const database = SqlDatabase.createSeeded();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
    for (const name of Object.keys(SQL_QUERIES) as QueryName[]) {
      const file = SQL_QUERIES[name];
      const rows = database.run(name);
      const baseName = file.replace(/\.sql$/, '');

      console.log(`\n${TITLES[name]} (${rows.length} rows)`);
      console.table(rows);

      await writeFile(
        path.join(OUTPUT_DIR, `${baseName}.md`),
        toMarkdown(TITLES[name], file, rows, executedAt, version),
      );
      await page.setContent(toHtml(TITLES[name], file, rows, executedAt, version));
      await page.screenshot({ path: path.join(OUTPUT_DIR, `${baseName}.png`), fullPage: true });
    }
  } finally {
    await browser.close();
    database.close();
  }
  console.log(`\nEvidence written to ${OUTPUT_DIR}/`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
