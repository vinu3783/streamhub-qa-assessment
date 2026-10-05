# A3 — JSONPlaceholder POST /posts: findings

**Endpoint:** `POST https://jsonplaceholder.typicode.com/posts` (base URL from `API_BASE_URL`)
**Client:** Playwright `APIRequestContext` ([`tests/api/PostsApiClient.ts`](../tests/api/PostsApiClient.ts))
**Payloads:** [`tests/fixtures/postPayloads.ts`](../tests/fixtures/postPayloads.ts)

## What the assessment expects

> The API should respond with the appropriate HTTP error codes or error messages for invalid
> inputs without encountering server-side failures.

## What the API actually does

All of the following were sent before any assertion was written, and they are re-checked on every run.

| Payload                                                                                                                                       | Status  | Response                                       | Assessment expectation met? |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------- | --------------------------- |
| Valid post (control)                                                                                                                          | 201     | Echoes the fields, `id: 101`                   | n/a (control)               |
| Title of 100,000 characters                                                                                                                   | **201** | Echoes the full title                          | No: accepted                |
| Title with `<script>`, SQL injection, a null byte, RTL override, zero-width space, emoji, a lone surrogate, template syntax, a path traversal | **201** | Echoes it unchanged, no sanitisation           | No: accepted                |
| No `userId`                                                                                                                                   | **201** | Echoes; no `userId` in the response            | No: accepted                |
| No fields at all (`{}`)                                                                                                                       | **201** | `{ "id": 101 }`                                | No: accepted                |
| `userId: "abc"` (wrong type)                                                                                                                  | **201** | Echoes `"abc"`                                 | No: accepted                |
| Malformed JSON body                                                                                                                           | **500** | Plain-text Node.js **stack trace** (see below) | No: a server-side failure   |

Exploratory checks during development also sent titles of 150,000 characters and 1,000,000
characters, and both returned 201. That last check was a one-off exploration and is not part of the suite.

The malformed-JSON response leaks implementation details (Express, body-parser, internal paths):

```text
HTTP/1.1 500 Internal Server Error
Content-Type: text/html; charset=utf-8
x-powered-by: Express

SyntaxError: Expected ',' or '}' after property value in JSON at position 37 (line 1 column 38)
    at JSON.parse (<anonymous>)
    at parse (/app/node_modules/body-parser/lib/types/json.js:89:19)
    at /app/node_modules/body-parser/lib/read.js:121:18
    ...
```

**Why:** JSONPlaceholder is a public _mock_ (json-server). It doesn't validate input or persist
anything; it echoes what it receives with `id: 101`. The stack trace comes from the Express
default error handler, which runs in development mode.

## Engineering decision

Rewriting the expectation to "201 is fine", or asserting 4xx and leaving the main suite
permanently red, would both misrepresent the situation. So the tests are split in two:

1. **[`create-post-observed-behaviour.feature`](../tests/features/api/create-post-observed-behaviour.feature)**
   (`@api`, part of `npm test`, **passes**). These are _characterisation_ tests that pin the
   observed behaviour: no 5xx for well-formed JSON, status 201, every field echoed unchanged, no
   invented `userId`. Each scenario attaches a line to the report recording the assessment
   expectation, the observed status, and "Assessment expectation met: NO". The malformed-JSON
   500 is pinned as a `@known-defect`. If JSONPlaceholder ever starts validating, these tests
   fail and flag the change.
2. **[`create-post-assessment-expectations.feature`](../tests/features/api/create-post-assessment-expectations.feature)**
   (`@assessment-expectation`, run with `npm run test:api:assessment-expectations`, **fails by design**).
   These encode the assessment's expectation literally: 4xx, an error message, and no 5xx. They
   would be the real contract tests for an API that is supposed to validate. Against
   JSONPlaceholder they fail with `expected a 4xx rejection, got 201` (×3) and
   `server-side failure (5xx)` for malformed JSON. That failing run is committed in
   [`reports/cucumber/api-assessment-expectations.html`](../reports/cucumber/api-assessment-expectations.html).

The assertions were never weakened to produce a green result. Both sides are visible and labelled.

## Recommendations for a real posts API

- Validate the schema and return `400`/`422` with field-level errors: required `userId`
  (positive integer), required `title` and `body`, and a maximum title length (for example 255).
- Return `400` for malformed JSON through an error handler that never returns stack traces in
  production, and set `NODE_ENV=production`.
- Set a request size limit and return `413` above it.
- Treat special characters as data. Encode them on output rather than rejecting them, but
  reject invalid Unicode (lone surrogates, control characters) where the domain doesn't allow it.
