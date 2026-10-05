import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ZodType } from 'zod';
import { LoginResponseSchema, type LoginResponse } from './schemas';

/**
 * Thin wrapper over Playwright's APIRequestContext.
 * Keeps auth + schema parsing in one place; tests still assert on the raw
 * response (status, headers, body) so nothing is hidden from them.
 */
export class ApiClient {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  withToken(token: string): this {
    this.token = token;
    return this;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}`, ...extra } : extra;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await this.request.post('/auth/login', { data: { username, password } });
    if (!res.ok()) throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
    const body = LoginResponseSchema.parse(await res.json());
    this.token = body.accessToken;
    return body;
  }

  get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.request.get(path, { headers: this.headers(), params });
  }

  post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(path, { headers: this.headers(), data });
  }

  put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(path, { headers: this.headers(), data });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(path, { headers: this.headers() });
  }

  /** Parse a JSON body against a schema — throws a readable diff on contract drift. */
  static async parse<T>(res: APIResponse, schema: ZodType<T>): Promise<T> {
    return schema.parse(await res.json());
  }
}
