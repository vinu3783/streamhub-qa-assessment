import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import type { BrokenLocator } from '../../tests/pages/legacy/brokenLocators';
import type { Candidate } from './candidates';
import type { ElementFacts } from './dom';

const MODEL = process.env.HEAL_MODEL?.trim() || 'claude-opus-5-5';

const SuggestionSchema = z.object({
  candidates: z
    .array(
      z.object({
        strategy: z.enum(['testid', 'role', 'label', 'scoped-role']),
        testId: z.string().nullable(),
        role: z.string().nullable(),
        name: z.string().nullable(),
        label: z.string().nullable(),
        rationale: z.string(),
      }),
    )
    .max(3),
});

export interface HealingContext {
  locator: BrokenLocator;
  failure: string;
  ariaSnapshot: string;
  inventory: ElementFacts[];
}

/** The exact prompt sent to the model; also written to reports/ so the approach is reviewable. */
export function buildPrompt({ locator, failure, ariaSnapshot, inventory }: HealingContext): string {
  return `You are repairing a broken Playwright locator in an end-to-end test suite.

## Broken locator
- Selector: ${locator.selector}
- What it is meant to find: ${locator.intent}
- Expected element role: ${locator.expectedRole}
- Observed failure: ${failure}

## Rules
- Propose at most 3 replacement locators, best first.
- Allowed strategies, in order of preference: "testid" (getByTestId), "role" (getByRole with an
  exact accessible name), "label" (getByLabel), "scoped-role" (getByTestId(container).getByRole).
- Never propose CSS classes, nth-child/positional selectors or XPath.
- Use only test ids, roles, names and labels that appear in the page data below. Do not invent any.
- If nothing on the page matches the intent, return an empty list.

## Accessibility snapshot of the page
${ariaSnapshot}

## Candidate elements (visible elements with a role, label or data-testid)
${JSON.stringify(inventory, null, 1)}`;
}

/**
 * Asks Claude for replacement candidates. The answer is only a suggestion: every candidate goes
 * through the same validation as the heuristic ones, and nothing is written to source files.
 */
export async function suggestWithClaude(context: HealingContext): Promise<Candidate[]> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: betaZodOutputFormat(SuggestionSchema) },
    messages: [{ role: 'user', content: buildPrompt(context) }],
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    console.warn(`  AI returned no usable candidates (stop_reason: ${response.stop_reason}).`);
    return [];
  }
  return response.parsed_output.candidates.map((suggestion) => ({
    strategy: suggestion.strategy,
    testId: suggestion.testId ?? undefined,
    role: suggestion.role ?? undefined,
    name: suggestion.name ?? undefined,
    label: suggestion.label ?? undefined,
    source: 'ai',
    rationale: suggestion.rationale,
  }));
}
