/**
 * Self-healing locator proof of concept (see docs/SELF_HEALING_LOCATORS.md).
 *
 *   npm run heal                      deterministic candidates only (no network, no cost)
 *   npm run heal -- --ai              also ask Claude for candidates (needs Anthropic credentials)
 *   npm run heal -- --id emiByPosition
 *
 * For each deliberately broken locator it: detects the failure mode, captures DOM context,
 * proposes candidates, validates each one in a real browser, ranks the survivors and writes a
 * report with a suggested patch. It never edits source files: a human applies the patch and
 * the affected scenario plus the regression suite must pass before it is accepted.
 */
import { chromium, type Browser, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../../tests/support/config';
import { BROKEN_LOCATORS, type BrokenLocator } from '../../tests/pages/legacy/brokenLocators';
import { buildPrompt, suggestWithClaude } from './ai';
import {
  candidateKey,
  candidatesFor,
  hasStableName,
  matchesExpectedRole,
  semanticScore,
  strategyWeight,
  toCode,
  toLocator,
  type Candidate,
} from './candidates';
import { collectInventory, describeLocatorTarget, type ElementFacts } from './dom';

const REPORT_DIR = path.join('reports', 'self-healing');
const DESKTOP = { width: 1400, height: 1000 };
const MOBILE = { width: 390, height: 844 };
/** A candidate must describe at least this share of the intent's words to be trusted. */
const MIN_SEMANTIC_SCORE = 0.3;
/** The winner must beat the best candidate for a *different* element by this much, or a human decides. */
const MIN_WINNING_MARGIN = 0.1;

type FailureMode = 'not-found' | 'ambiguous' | 'wrong-target' | 'healthy';

interface Check {
  name: string;
  passed: boolean;
  detail: string;
}

interface ValidatedCandidate {
  candidate: Candidate;
  code: string;
  /** Identifies the element the candidate resolved to, so rival elements can be compared. */
  element: string | null;
  score: number;
  checks: Check[];
  accepted: boolean;
}

interface HealingResult {
  locator: BrokenLocator;
  failureMode: FailureMode;
  failureDetail: string;
  candidates: ValidatedCandidate[];
  recommendation?: ValidatedCandidate;
  needsHumanReview?: string;
}

async function openPage(browser: Browser, route: string, viewport = DESKTOP): Promise<Page> {
  const context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(route);
  await page.getByRole('heading', { level: 1 }).waitFor();
  return page;
}

/** Step 1 — detection: is the locator missing, ambiguous, or pointing at the wrong element? */
async function detect(page: Page, locator: BrokenLocator, inventory: ElementFacts[]) {
  const target = page.locator(locator.selector);
  const count = await target.count();
  if (count === 0) {
    return { mode: 'not-found' as const, detail: `Selector matched 0 elements.` };
  }
  if (count > 1) {
    return { mode: 'ambiguous' as const, detail: `Selector matched ${count} elements.` };
  }
  const facts = await describeLocatorTarget(target);
  const ownScore = semanticScore(locator.intent, facts);
  const best = Math.max(
    ...inventory
      .filter((f) => matchesExpectedRole(locator.expectedRole, f))
      .map((f) => semanticScore(locator.intent, f)),
  );
  if (!matchesExpectedRole(locator.expectedRole, facts) || best - ownScore >= 0.2) {
    return {
      mode: 'wrong-target' as const,
      detail: `Selector matched 1 element ("${facts.name || facts.text}", data-testid="${facts.testId}") whose description scores ${ownScore.toFixed(2)} against the intent while another element scores ${best.toFixed(2)}.`,
    };
  }
  return {
    mode: 'healthy' as const,
    detail: 'Selector resolves to one element that fits the intent.',
  };
}

/** Step 4 — validation: every candidate, heuristic or AI, must pass all checks in a real browser. */
async function validate(
  page: Page,
  mobilePage: Page,
  locator: BrokenLocator,
  candidate: Candidate,
): Promise<ValidatedCandidate> {
  const checks: Check[] = [
    {
      name: 'stable name',
      passed: hasStableName(candidate),
      detail: hasStableName(candidate)
        ? 'no data-dependent text'
        : 'name contains numbers that change with the data',
    },
  ];
  const target = toLocator(page, candidate);
  const count = await target.count();
  checks.push({ name: 'unique', passed: count === 1, detail: `${count} match(es)` });

  let score = 0;
  let element: string | null = null;
  if (count === 1) {
    const facts = await describeLocatorTarget(target);
    element = [facts.tag, facts.testId, facts.id, facts.name].join('|');
    score = semanticScore(locator.intent, facts) * strategyWeight(candidate);
    checks.push({
      name: 'visible',
      passed: await target.isVisible(),
      detail: 'element is visible',
    });
    checks.push({
      name: 'expected role',
      passed: matchesExpectedRole(locator.expectedRole, facts),
      detail: `role=${facts.role ?? 'none'}, expected ${locator.expectedRole}`,
    });
    checks.push({
      name: 'matches intent',
      passed: semanticScore(locator.intent, facts) >= MIN_SEMANTIC_SCORE,
      detail: `semantic score ${semanticScore(locator.intent, facts).toFixed(2)} (min ${MIN_SEMANTIC_SCORE})`,
    });
    if (locator.expectedRole === 'button') {
      // trial: runs Playwright's actionability checks without clicking.
      const actionable = await target.click({ trial: true, timeout: 2_000 }).then(
        () => true,
        () => false,
      );
      checks.push({ name: 'actionable', passed: actionable, detail: 'click({ trial: true })' });
    }
    if (locator.expectedRole === 'textbox') {
      checks.push({ name: 'editable', passed: await target.isEditable(), detail: 'isEditable()' });
    }
    const mobileCount = await toLocator(mobilePage, candidate).count();
    checks.push({
      name: 'survives layout change',
      passed: mobileCount === 1,
      detail: `${mobileCount} match(es) at ${MOBILE.width}px wide`,
    });
  }

  return {
    candidate,
    code: toCode(candidate),
    element,
    score,
    checks,
    accepted: checks.every((check) => check.passed),
  };
}

/** Step 6 — safety gate: only an unambiguous winner is recommended. */
function decide(
  validated: ValidatedCandidate[],
): Pick<HealingResult, 'recommendation' | 'needsHumanReview'> {
  const accepted = validated.filter((v) => v.accepted);
  const [best] = accepted;
  if (!best) return { needsHumanReview: 'No candidate passed every validation check.' };
  const rival = accepted.find((v) => v.element !== best.element);
  if (rival && best.score - rival.score < MIN_WINNING_MARGIN) {
    return {
      needsHumanReview: `Top candidates point at different elements with close scores (${best.score.toFixed(2)} vs ${rival.score.toFixed(2)}).`,
    };
  }
  return { recommendation: best };
}

async function heal(
  browser: Browser,
  locator: BrokenLocator,
  useAi: boolean,
): Promise<HealingResult> {
  const page = await openPage(browser, locator.route);
  const mobilePage = await openPage(browser, locator.route, MOBILE);
  try {
    const inventory = await collectInventory(page);
    const { mode, detail } = await detect(page, locator, inventory);
    if (mode === 'healthy') {
      return { locator, failureMode: mode, failureDetail: detail, candidates: [] };
    }

    // Steps 2–3 — context capture and candidate generation.
    const ariaSnapshot = await page.locator('body').ariaSnapshot();
    const relevant = inventory.filter((facts) => matchesExpectedRole(locator.expectedRole, facts));
    const context = { locator, failure: `${mode}: ${detail}`, ariaSnapshot, inventory: relevant };
    await writeFile(path.join(REPORT_DIR, 'prompts', `${locator.id}.md`), buildPrompt(context));

    const proposals = relevant.flatMap(candidatesFor);
    if (useAi) proposals.push(...(await suggestWithClaude(context)));
    const unique = [...new Map(proposals.map((c) => [candidateKey(c), c])).values()];

    const validated: ValidatedCandidate[] = [];
    for (const candidate of unique) {
      validated.push(await validate(page, mobilePage, locator, candidate));
    }
    // Step 5 — ranking: accepted first, then by stability-weighted semantic score.
    validated.sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.score - a.score);
    const { recommendation, needsHumanReview } = decide(validated);
    return {
      locator,
      failureMode: mode,
      failureDetail: detail,
      candidates: validated,
      recommendation,
      needsHumanReview,
    };
  } finally {
    await page.context().close();
    await mobilePage.context().close();
  }
}

function renderReport(results: HealingResult[], usedAi: boolean): string {
  const lines = [
    '# Self-healing POC report',
    '',
    `Generated ${new Date().toISOString()} against \`BASE_URL\`. Candidate sources: heuristic${usedAi ? ' + Claude' : ' only (run with `--ai` to add Claude suggestions)'}.`,
    '',
    'Nothing below has been applied. A recommendation becomes a fix only after a human applies it,',
    'the affected scenario passes and the full regression suite passes.',
    '',
    '| Locator | Failure mode | Recommended replacement | Candidates (accepted / total) |',
    '| --- | --- | --- | --- |',
    ...results.map(
      (r) =>
        `| \`${r.locator.id}\` | ${r.failureMode} | ${r.recommendation ? `\`${r.recommendation.code}\`` : `human review: ${r.needsHumanReview ?? '—'}`} | ${r.candidates.filter((c) => c.accepted).length} / ${r.candidates.length} |`,
    ),
  ];

  for (const result of results) {
    lines.push(
      '',
      `## \`${result.locator.id}\``,
      '',
      `- Broken selector: \`${result.locator.selector}\``,
      `- Intent: ${result.locator.intent}`,
      `- Why it is brittle: ${result.locator.whyBroken}`,
      `- Detected: **${result.failureMode}** — ${result.failureDetail}`,
      `- Prompt: [prompts/${result.locator.id}.md](prompts/${result.locator.id}.md)`,
      '',
    );
    if (result.recommendation) {
      lines.push(
        'Suggested patch (tests/pages/legacy/brokenLocators.ts → page object):',
        '',
        '```diff',
      );
      lines.push(
        `- page.locator('${result.locator.selector}')`,
        `+ ${result.recommendation.code}`,
        '```',
        '',
      );
    }
    lines.push(
      '| Candidate | Source | Score | Accepted | Checks |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const v of result.candidates) {
      const checks = v.checks
        .map((c) => `${c.passed ? '✅' : '❌'} ${c.name} (${c.detail})`)
        .join('<br>');
      lines.push(
        `| \`${v.code}\` | ${v.candidate.source} | ${v.score.toFixed(2)} | ${v.accepted ? 'yes' : 'no'} | ${checks} |`,
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const useAi = args.includes('--ai');
  const onlyId = args[args.indexOf('--id') + 1];
  const targets = Object.values(BROKEN_LOCATORS).filter(
    (locator) => !args.includes('--id') || locator.id === onlyId,
  );
  if (targets.length === 0) throw new Error(`No broken locator with id "${onlyId}".`);

  await mkdir(path.join(REPORT_DIR, 'prompts'), { recursive: true });
  const browser = await chromium.launch();
  try {
    const results: HealingResult[] = [];
    for (const locator of targets) {
      console.log(`Healing ${locator.id} (${locator.selector})`);
      const result = await heal(browser, locator, useAi);
      console.log(
        `  ${result.failureMode}: ${result.recommendation?.code ?? `human review — ${result.needsHumanReview}`}`,
      );
      results.push(result);
    }
    await writeFile(path.join(REPORT_DIR, 'healing-report.md'), renderReport(results, useAi));
    await writeFile(path.join(REPORT_DIR, 'healing-report.json'), JSON.stringify(results, null, 2));
    console.log(`\nReport written to ${REPORT_DIR}/healing-report.md`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
