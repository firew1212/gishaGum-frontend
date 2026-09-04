
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured. Add it to your frontend .env.local file.',
  );
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    Array.isArray(data.message)
  ) {
    return data.message.join(', ');
  }

  return fallback;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && requestOptions.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      'Unable to connect to the server. Please check your connection and try again.',
      0,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  let data: unknown;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        `Request failed with status ${response.status}.`,
      ),
      response.status,
      data,
    );
  }

  return data as T;
}

