import type { Locator, Page } from '@playwright/test';

/** What the page tells us about one element, gathered without trusting any CSS structure. */
export interface ElementFacts {
  tag: string;
  role: string | null;
  name: string;
  label: string | null;
  testId: string | null;
  id: string | null;
  text: string;
  /** data-testid and accessible name of the closest identified ancestor, for scoping and context. */
  ancestorTestId: string | null;
  ancestorName: string | null;
  visible: boolean;
}

/**
 * Runs in the browser. Approximates role and accessible name with the common ARIA rules;
 * Playwright's own getByRole later validates every candidate, so an approximation can only
 * cost a candidate, never let a wrong one through.
 */
function describeElement(element: Element): ElementFacts {
  const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
  const html = element as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute('type');

  const implicitRole = (): string | null => {
    if (tag === 'button') return 'button';
    if (tag === 'a' && element.hasAttribute('href')) return 'link';
    if (tag === 'select') return 'combobox';
    if (tag === 'textarea') return 'textbox';
    if (tag === 'input') {
      if (type === 'radio') return 'radio';
      if (type === 'checkbox') return 'checkbox';
      return 'textbox';
    }
    if (/^h[1-6]$/.test(tag)) return 'heading';
    return null;
  };

  const byIds = (ids: string | null) =>
    clean(
      (ids ?? '')
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent)
        .join(' '),
    );

  const id = element.getAttribute('id');
  const label = id
    ? clean(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent) || null
    : null;
  const name =
    clean(element.getAttribute('aria-label')) ||
    byIds(element.getAttribute('aria-labelledby')) ||
    label ||
    (['button', 'link', 'heading'].includes(implicitRole() ?? '') ? clean(html.innerText) : '');

  const ancestor = element.parentElement?.closest('[data-testid]') ?? null;
  // The container's own label, not the first heading inside it: in a group of cards the first
  // heading belongs to the first card and would leak its words into every sibling's context.
  const ancestorName = ancestor
    ? clean(ancestor.getAttribute('aria-label')) ||
      byIds(ancestor.getAttribute('aria-labelledby')) ||
      null
    : null;
  const box = html.getBoundingClientRect();

  return {
    tag,
    role: element.getAttribute('role') ?? implicitRole(),
    name,
    label,
    testId: element.getAttribute('data-testid'),
    id,
    text: clean(html.innerText).slice(0, 80),
    ancestorTestId: ancestor?.getAttribute('data-testid') ?? null,
    ancestorName,
    visible: box.width > 0 && box.height > 0 && getComputedStyle(html).visibility !== 'hidden',
  };
}

// describeElement is shipped to the browser as source text. tsx (esbuild keepNames) wraps
// named functions in a __name() helper that does not exist there, hence the identity shim.

const INVENTORY_SELECTOR = [
  '[data-testid]',
  '[role]',
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'h1, h2, h3',
  'canvas',
].join(', ');

/** Every element that could plausibly be the target of a test locator. */
export async function collectInventory(page: Page): Promise<ElementFacts[]> {
  return page.evaluate(
    ({ selector, describeSource }) => {
      const describe = new Function(`var __name = (f) => f; return (${describeSource})`)() as (
        e: Element,
      ) => ElementFacts;
      return [...document.querySelectorAll(selector)]
        .map(describe)
        .filter((facts) => facts.visible);
    },
    { selector: INVENTORY_SELECTOR, describeSource: describeElement.toString() },
  );
}

export async function describeLocatorTarget(locator: Locator): Promise<ElementFacts> {
  return locator.evaluate((element, describeSource) => {
    const describe = new Function(`var __name = (f) => f; return (${describeSource})`)() as (
      e: Element,
    ) => ElementFacts;
    return describe(element);
  }, describeElement.toString());
}
