import type { Locator, Page } from '@playwright/test';
import type { BrokenLocator } from '../../tests/pages/legacy/brokenLocators';
import type { ElementFacts } from './dom';

export type Strategy = 'testid' | 'role' | 'label' | 'scoped-role';

export interface Candidate {
  strategy: Strategy;
  testId?: string;
  role?: string;
  name?: string;
  label?: string;
  source: 'heuristic' | 'ai';
  rationale: string;
}

/** Preference order from the assessment: test ids and role/label locators over everything else. */
const STRATEGY_WEIGHT: Record<Strategy, number> = {
  testid: 1,
  role: 0.9,
  label: 0.85,
  'scoped-role': 0.8,
};

type AriaRole = Parameters<Page['getByRole']>[0];

const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'for', 'to', 'and', 'vs', 'its']);

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word)),
  );
}

/** Share of the intent's words that also describe the element (0–1). */
export function semanticScore(intent: string, facts: ElementFacts): number {
  const wanted = tokens(intent);
  const described = tokens(
    [
      facts.name,
      facts.label,
      facts.testId,
      facts.role,
      facts.tag,
      facts.ancestorTestId,
      facts.ancestorName,
    ]
      .filter(Boolean)
      .join(' '),
  );
  if (wanted.size === 0) return 0;
  let shared = 0;
  for (const word of wanted) if (described.has(word)) shared += 1;
  return shared / wanted.size;
}

export function matchesExpectedRole(
  expected: BrokenLocator['expectedRole'],
  facts: ElementFacts,
): boolean {
  if (expected === 'text') return facts.role === null && facts.testId !== null;
  return facts.role === expected;
}

/** Derives the stable locators an element supports, best strategy first. */
export function candidatesFor(facts: ElementFacts): Candidate[] {
  const found: Candidate[] = [];
  if (facts.testId) {
    found.push({
      strategy: 'testid',
      testId: facts.testId,
      source: 'heuristic',
      rationale: 'Element has its own data-testid.',
    });
  }
  if (facts.role && facts.name) {
    found.push({
      strategy: 'role',
      role: facts.role,
      name: facts.name,
      source: 'heuristic',
      rationale: 'Role plus accessible name.',
    });
  }
  if (facts.label) {
    found.push({
      strategy: 'label',
      label: facts.label,
      source: 'heuristic',
      rationale: 'Associated <label> text.',
    });
  }
  if (facts.role && facts.ancestorTestId && !facts.testId) {
    found.push({
      strategy: 'scoped-role',
      testId: facts.ancestorTestId,
      role: facts.role,
      source: 'heuristic',
      rationale: `Role inside the closest identified container "${facts.ancestorTestId}".`,
    });
  }
  return found;
}

/**
 * Accessible names that contain numbers usually carry data (amounts, percentages, counts) and
 * change whenever the data does, so a locator built on them is brittle by construction.
 */
export function hasStableName(candidate: Candidate): boolean {
  const text = candidate.name ?? candidate.label ?? '';
  return !/\d/.test(text);
}

export function strategyWeight(candidate: Candidate): number {
  return STRATEGY_WEIGHT[candidate.strategy];
}

export function toLocator(page: Page, candidate: Candidate): Locator {
  switch (candidate.strategy) {
    case 'testid':
      return page.getByTestId(candidate.testId ?? '');
    case 'role':
      return page.getByRole(candidate.role as AriaRole, { name: candidate.name, exact: true });
    case 'label':
      return page.getByLabel(candidate.label ?? '', { exact: true });
    case 'scoped-role':
      return page.getByTestId(candidate.testId ?? '').getByRole(candidate.role as AriaRole);
  }
}

const quote = (value = '') => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** The replacement as it would be written in a page object. */
export function toCode(candidate: Candidate): string {
  switch (candidate.strategy) {
    case 'testid':
      return `page.getByTestId(${quote(candidate.testId)})`;
    case 'role':
      return `page.getByRole(${quote(candidate.role)}, { name: ${quote(candidate.name)}, exact: true })`;
    case 'label':
      return `page.getByLabel(${quote(candidate.label)}, { exact: true })`;
    case 'scoped-role':
      return `page.getByTestId(${quote(candidate.testId)}).getByRole(${quote(candidate.role)})`;
  }
}

export function candidateKey(candidate: Candidate): string {
  return toCode(candidate);
}
