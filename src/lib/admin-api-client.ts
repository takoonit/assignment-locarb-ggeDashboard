type ApiSuccess<T> = { data: T };
type ApiFailure = { error: { code: string; details?: unknown } };

export type PagedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export class AdminApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(code);
    this.name = "AdminApiError";
  }
}

export async function adminFetch<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || "error" in json) {
    const error = "error" in json ? json.error : { code: "INTERNAL_ERROR" };
    throw new AdminApiError(error.code, error.details);
  }

  return json.data;
}

export async function adminMutation<T>(
  path: string,
  options: { method: "POST" | "PATCH" | "DELETE"; body?: unknown },
) {
  const response = await fetch(path, {
    method: options.method,
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || "error" in json) {
    const error = "error" in json ? json.error : { code: "INTERNAL_ERROR" };
    throw new AdminApiError(error.code, error.details);
  }

  return json.data;
}
