import { DataTable, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SQL_QUERIES, type QueryName } from '../utils/sqlDatabase';
import type { TestWorld } from '../support/world';

function isQueryName(name: string): name is QueryName {
  return name in SQL_QUERIES;
}

When('I run the {string} query', function (this: TestWorld, name: string) {
  if (!isQueryName(name)) {
    throw new Error(`Unknown query "${name}". Known: ${Object.keys(SQL_QUERIES).join(', ')}`);
  }
  this.queryResult = this.db.run(name);
  this.attach(JSON.stringify(this.queryResult, null, 2), 'application/json');
});

Then('the query returns exactly these rows:', function (this: TestWorld, table: DataTable) {
  const expected = table.hashes();
  const columns = Object.keys(expected[0] ?? {});
  // Compare only the columns named in the feature, as text, preserving row order.
  const actual = this.lastQueryResult.map((row) =>
    Object.fromEntries(columns.map((column) => [column, String(row[column])])),
  );
  expect(actual).toEqual(expected);
});

Then(
  'every returned row is a reversal within 10% of the amount sent and at most 24 hours later',
  function (this: TestWorld) {
    for (const row of this.lastQueryResult) {
      const sent = Number(row.amount_sent);
      const returned = Number(row.amount_returned);
      const hours = Number(row.hours_apart);
      expect(
        Math.abs(returned - sent),
        `txn ${String(row.outbound_txn_id)} amount`,
      ).toBeLessThanOrEqual(sent * 0.1 + 1e-9);
      expect(hours, `txn ${String(row.outbound_txn_id)} window`).toBeGreaterThanOrEqual(0);
      expect(hours, `txn ${String(row.outbound_txn_id)} window`).toBeLessThanOrEqual(24);
    }
  },
);

Then(
  'the result does not include {string}, {string} or {string}',
  // Cucumber matches step arity, so the three names are declared individually.
  function (this: TestWorld, first: string, second: string, third: string) {
    const names = this.lastQueryResult.map((row) => row.player_name);
    for (const player of [first, second, third]) {
      expect(names).not.toContain(player);
    }
  },
);
