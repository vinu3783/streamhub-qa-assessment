import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { chromium, firefox, request, webkit, type Browser } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PostsApiClient } from '../api/PostsApiClient';
import { DashboardPage } from '../pages/DashboardPage';
import { ReportPage } from '../pages/ReportPage';
import { LegacyDashboardPage } from '../pages/legacy/LegacyDashboardPage';
import { SqlDatabase } from '../utils/sqlDatabase';
import { config } from './config';
import type { TestWorld } from './world';

const SCREENSHOT_DIR = path.join('reports', 'screenshots');
const browserTypes = { chromium, firefox, webkit };

let browser: Browser | undefined;

async function getBrowser(): Promise<Browser> {
  browser ??= await browserTypes[config.browser].launch({ headless: config.headless });
  return browser;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

BeforeAll(async function () {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
});

Before({ tags: '@ui or @self-healing' }, async function (this: TestWorld) {
  const activeBrowser = await getBrowser();
  this.context = await activeBrowser.newContext({
    baseURL: config.baseUrl,
    viewport: { width: 1400, height: 1000 },
    // Charts skip their entry animation, so canvas assertions see the final frame.
    reducedMotion: 'reduce',
  });
  this.context.setDefaultTimeout(config.defaultTimeoutMs);
  const page = await this.context.newPage();
  this.page = page;
  this.dashboard = new DashboardPage(page);
  this.report = new ReportPage(page);
  this.legacyDashboard = new LegacyDashboardPage(page);
});

Before({ tags: '@api' }, async function (this: TestWorld) {
  const context = await request.newContext({ baseURL: config.apiBaseUrl });
  this.postsApi = new PostsApiClient(context);
});

Before({ tags: '@sql' }, function (this: TestWorld) {
  this.database = SqlDatabase.createSeeded();
});

After({ tags: '@ui or @self-healing' }, async function (this: TestWorld, { pickle, result }) {
  if (this.page) {
    // Every UI scenario leaves a screenshot as execution evidence; failures are prefixed.
    const prefix = result?.status === Status.PASSED ? '' : 'FAILED-';
    const screenshot = await this.page.screenshot({ fullPage: true });
    await writeFile(path.join(SCREENSHOT_DIR, `${prefix}${slug(pickle.name)}.png`), screenshot);
    this.attach(screenshot, 'image/png');
  }
  await this.context?.close();
});

After({ tags: '@api' }, async function (this: TestWorld) {
  await this.postsApi?.dispose();
});

After({ tags: '@sql' }, function (this: TestWorld) {
  this.database?.close();
});

AfterAll(async function () {
  await browser?.close();
});
