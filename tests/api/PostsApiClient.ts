import type { APIRequestContext, APIResponse } from '@playwright/test';

const POSTS_PATH = '/posts';
const JSON_HEADERS = { 'Content-Type': 'application/json; charset=UTF-8' };

/** Thin wrapper over Playwright's APIRequestContext; the base URL comes from API_BASE_URL. */
export class PostsApiClient {
  constructor(private readonly request: APIRequestContext) {}

  createPost(payload: unknown): Promise<APIResponse> {
    return this.request.post(POSTS_PATH, { data: payload, headers: JSON_HEADERS });
  }

  /** Sends the body verbatim, e.g. to submit syntactically invalid JSON. */
  createPostRaw(body: string): Promise<APIResponse> {
    return this.request.post(POSTS_PATH, { data: body, headers: JSON_HEADERS });
  }

  dispose(): Promise<void> {
    return this.request.dispose();
  }
}
