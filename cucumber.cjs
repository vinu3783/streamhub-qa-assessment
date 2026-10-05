/**
 * Cucumber profiles. Each profile writes its own HTML and JUnit report and a plain-text
 * summary under reports/, so the committed evidence maps one-to-one to a command.
 *
 *   default                    UI + API + SQL (excludes the intentionally failing suites)
 *   ui | api | sql             one area each
 *   apiAssessmentExpectations  the assessment's literal 4xx expectations (fail against JSONPlaceholder)
 *   selfHealing                the deliberately broken locators (expected to fail)
 */
const common = {
  requireModule: ['tsx/cjs'],
  require: ['tests/support/**/*.ts', 'tests/step-definitions/**/*.ts'],
  paths: ['tests/features/**/*.feature'],
  formatOptions: { snippetInterface: 'async-await' },
};

const EXCLUDED_BY_DEFAULT = 'not @self-healing and not @assessment-expectation';

function profile(name, tags) {
  return {
    ...common,
    tags,
    format: [
      'progress',
      `html:reports/cucumber/${name}.html`,
      `junit:reports/cucumber/${name}.xml`,
      `summary:reports/logs/${name}-summary.txt`,
    ],
  };
}

module.exports = {
  default: profile('all', EXCLUDED_BY_DEFAULT),
  ui: profile('ui', `@ui and (${EXCLUDED_BY_DEFAULT})`),
  api: profile('api', `@api and (${EXCLUDED_BY_DEFAULT})`),
  sql: profile('sql', '@sql'),
  apiAssessmentExpectations: profile('api-assessment-expectations', '@assessment-expectation'),
  selfHealing: profile('self-healing', '@self-healing'),
};
