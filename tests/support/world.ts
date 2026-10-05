import {
  setDefaultTimeout,
  setWorldConstructor,
  World,
  type IWorldOptions,
} from '@cucumber/cucumber';
import type { APIResponse, BrowserContext, Page } from '@playwright/test';
import type { PostsApiClient } from '../api/PostsApiClient';
import type { DashboardPage, LoanResultsPage } from '../pages/DashboardPage';
import type { ReportPage } from '../pages/ReportPage';
import type { LegacyDashboardPage } from '../pages/legacy/LegacyDashboardPage';
import type { SqlDatabase } from '../utils/sqlDatabase';
import type { ExpectedLoan } from '../utils/financialCalculations';

setDefaultTimeout(60_000);

export interface ApiExchange {
  payloadName: string;
  sentBody: unknown;
  response: APIResponse;
  responseText: string;
}

/**
 * Per-scenario state. Hooks create only what a scenario's tags need (@ui, @api, @sql),
 * so the getters below fail loudly if a step is used from the wrong kind of scenario.
 */
export class TestWorld extends World {
  context?: BrowserContext;
  page?: Page;
  dashboard?: DashboardPage;
  report?: ReportPage;
  legacyDashboard?: LegacyDashboardPage;
  postsApi?: PostsApiClient;
  database?: SqlDatabase;

  /** The page whose loan form and summary the current steps act on. */
  activePage?: LoanResultsPage;
  expectedLoan?: ExpectedLoan;
  /** Loan years currently selected in the report filters; undefined means all years. */
  reportYearRange?: { from: number; to: number };
  displayedEmiBeforeAction?: string;
  apiExchange?: ApiExchange;
  queryResult?: Array<Record<string, unknown>>;

  constructor(options: IWorldOptions) {
    super(options);
  }

  private need<T>(value: T | undefined, what: string): T {
    if (value === undefined) {
      throw new Error(`${what} is not available — check the scenario is tagged correctly.`);
    }
    return value;
  }

  get dashboardPage(): DashboardPage {
    return this.need(this.dashboard, 'Dashboard page object (@ui)');
  }

  get reportPage(): ReportPage {
    return this.need(this.report, 'Report page object (@ui)');
  }

  get legacyDashboardPage(): LegacyDashboardPage {
    return this.need(this.legacyDashboard, 'Legacy dashboard page object (@self-healing)');
  }

  get resultsPage(): LoanResultsPage {
    return this.need(this.activePage, 'An open dashboard or report page');
  }

  get api(): PostsApiClient {
    return this.need(this.postsApi, 'Posts API client (@api)');
  }

  get db(): SqlDatabase {
    return this.need(this.database, 'SQL database (@sql)');
  }

  get loanExpectation(): ExpectedLoan {
    return this.need(this.expectedLoan, 'Expected loan — run a calculation step first');
  }

  get lastExchange(): ApiExchange {
    return this.need(this.apiExchange, 'API response — send a request first');
  }

  get lastQueryResult(): Array<Record<string, unknown>> {
    return this.need(this.queryResult, 'SQL result — run a query first');
  }
}

setWorldConstructor(TestWorld);
