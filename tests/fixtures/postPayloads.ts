/**
 * Request bodies for the JSONPlaceholder POST /posts tests (assessment A3).
 * A "post" has title, body and userId; the assessment treats userId as required.
 */

export const LONG_TITLE_LENGTH = 100_000;

const SPECIAL_CHARACTERS = [
  '<script>alert("xss")</script>',
  "'; DROP TABLE posts; --",
  '\u0000 null byte',
  '‮ right-to-left override',
  '​ zero-width space',
  '😀 🚀 emoji',
  '\uD800 lone surrogate',
  '{{template}} ${expression}',
  '../../etc/passwd',
].join(' | ');

export const POST_PAYLOADS = {
  'a valid post': { title: 'Loan analytics', body: 'EMI breakdown for a home loan', userId: 1 },
  'an excessively long title': {
    title: 'A'.repeat(LONG_TITLE_LENGTH),
    body: 'Boundary test: very long title',
    userId: 1,
  },
  'unsupported special characters in the title': {
    title: SPECIAL_CHARACTERS,
    body: 'Boundary test: special characters',
    userId: 1,
  },
  'no userId': { title: 'Missing owner', body: 'userId is omitted' },
  'no fields at all': {},
  'a non-numeric userId': { title: 'Wrong type', body: 'userId is a string', userId: 'abc' },
} as const;

export type PostPayloadName = keyof typeof POST_PAYLOADS;

export const MALFORMED_JSON_BODY = '{"title": "unterminated", "userId": 1';

export function payloadNamed(name: string): Record<string, unknown> {
  if (!(name in POST_PAYLOADS)) {
    throw new Error(`Unknown payload "${name}". Known: ${Object.keys(POST_PAYLOADS).join(', ')}`);
  }
  return POST_PAYLOADS[name as PostPayloadName];
}
