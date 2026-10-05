import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Paths are relative: the browser context's baseURL comes from the BASE_URL env variable. */
  protected async goto(pathAndQuery: string): Promise<void> {
    try {
      await this.page.goto(pathAndQuery);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Could not open "${pathAndQuery}". Is the app running at BASE_URL? Start it with "npm run dev".\n${reason}`,
        { cause: error },
      );
    }
  }

  get mainHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  navLink(name: string): Locator {
    return this.page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name });
  }

  currentUrl(): URL {
    return new URL(this.page.url());
  }
}
