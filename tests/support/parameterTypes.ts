import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'field',
  regexp: /loan amount|interest rate|loan tenure/,
  transformer: (field: string) => field,
});

defineParameterType({
  name: 'chart',
  regexp: /"(principal vs interest|yearly payment|outstanding balance)"/,
  transformer: (chart: string) => chart,
});

defineParameterType({
  name: 'unit',
  regexp: /years|months/,
  transformer: (unit: string) => unit,
});
