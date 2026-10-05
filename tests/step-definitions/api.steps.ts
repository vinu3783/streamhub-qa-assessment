import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { MALFORMED_JSON_BODY, payloadNamed } from '../fixtures/postPayloads';
import type { TestWorld } from '../support/world';

function parsedBody(world: TestWorld): Record<string, unknown> {
  const { responseText } = world.lastExchange;
  try {
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error(`Response is not JSON: ${responseText.slice(0, 300)}`);
  }
}

function sentFields(world: TestWorld): Record<string, unknown> {
  const sent = world.lastExchange.sentBody;
  if (typeof sent !== 'object' || sent === null) {
    throw new Error('The last request did not send a JSON object.');
  }
  return sent as Record<string, unknown>;
}

const preview = (text: string) =>
  text.length > 500 ? `${text.slice(0, 500)}… (${text.length} chars)` : text;

When('I create a post with {string}', async function (this: TestWorld, payloadName: string) {
  const payload = payloadNamed(payloadName);
  const response = await this.api.createPost(payload);
  const responseText = await response.text();
  this.apiExchange = { payloadName, sentBody: payload, response, responseText };
  this.attach(
    `POST /posts (${payloadName}) -> ${response.status()} ${response.statusText()}\n${preview(responseText)}`,
    'text/plain',
  );
});

When('I send a malformed JSON body', async function (this: TestWorld) {
  const response = await this.api.createPostRaw(MALFORMED_JSON_BODY);
  const responseText = await response.text();
  this.apiExchange = {
    payloadName: 'malformed JSON',
    sentBody: MALFORMED_JSON_BODY,
    response,
    responseText,
  };
  this.attach(
    `POST /posts (malformed JSON) -> ${response.status()} ${response.statusText()}\n${preview(responseText)}`,
    'text/plain',
  );
});

Then('the response status is {int}', function (this: TestWorld, status: number) {
  expect(this.lastExchange.response.status()).toBe(status);
});

Then('the response is not a server error', function (this: TestWorld) {
  expect(this.lastExchange.response.status(), 'server-side failure (5xx)').toBeLessThan(500);
});

Then('the response status is a 4xx client error', function (this: TestWorld) {
  const status = this.lastExchange.response.status();
  expect(status, `expected a 4xx rejection, got ${status}`).toBeGreaterThanOrEqual(400);
  expect(status, `expected a 4xx rejection, got ${status}`).toBeLessThan(500);
});

Then('the response is JSON', function (this: TestWorld) {
  expect(this.lastExchange.response.headers()['content-type']).toContain('application/json');
  parsedBody(this);
});

Then('the response echoes every submitted field', function (this: TestWorld) {
  const body = parsedBody(this);
  for (const [field, value] of Object.entries(sentFields(this))) {
    expect(body[field], `echoed ${field}`).toStrictEqual(value);
  }
});

Then('the response assigns a numeric id', function (this: TestWorld) {
  expect(typeof parsedBody(this).id).toBe('number');
});

Then('the response does not invent a userId', function (this: TestWorld) {
  const sent = sentFields(this);
  const body = parsedBody(this);
  expect(body.userId).toStrictEqual(sent.userId);
});

Then('the response explains the validation problem', function (this: TestWorld) {
  const body = parsedBody(this);
  const explanation = body.error ?? body.message ?? body.errors;
  expect(explanation, 'an error/message/errors field in the response').toBeTruthy();
});

Then('the response body exposes a server stack trace', function (this: TestWorld) {
  const { responseText } = this.lastExchange;
  expect(responseText).toMatch(/SyntaxError/);
  expect(responseText).toMatch(/\n\s+at /);
});

Then("the gap against the assessment's 4xx expectation is recorded", function (this: TestWorld) {
  const { payloadName, response } = this.lastExchange;
  const status = response.status();
  const met = status >= 400 && status < 500;
  this.attach(
    [
      `Payload: ${payloadName}`,
      'Assessment expectation: 4xx client error with an error message',
      `Observed: ${status} ${response.statusText()}`,
      `Assessment expectation met: ${met ? 'YES' : 'NO'}`,
    ].join('\n'),
    'text/plain',
  );
});
