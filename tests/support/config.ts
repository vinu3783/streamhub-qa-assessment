import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Environment variable ${name} is not set. Copy .env.example to .env or export ${name} before running tests.`,
    );
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number, got "${raw}".`);
  }
  return value;
}

type BrowserName = 'chromium' | 'firefox' | 'webkit';

function browserName(): BrowserName {
  const name = (process.env.BROWSER ?? 'chromium').trim();
  if (name === 'chromium' || name === 'firefox' || name === 'webkit') return name;
  throw new Error(`BROWSER must be chromium, firefox or webkit, got "${name}".`);
}

/** Values are resolved lazily so a UI-only run does not require API settings and vice versa. */
export const config = {
  get baseUrl(): string {
    return required('BASE_URL');
  },
  get apiBaseUrl(): string {
    return required('API_BASE_URL');
  },
  get headless(): boolean {
    return process.env.HEADLESS?.trim().toLowerCase() !== 'false';
  },
  get browser(): BrowserName {
    return browserName();
  },
  get defaultTimeoutMs(): number {
    return optionalNumber('DEFAULT_TIMEOUT_MS', 10_000);
  },
};
