const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured',
  );
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    let message =
      'Something went wrong';

    try {
      const error =
        await response.json();

      if (typeof error.message === 'string') {
        message = error.message;
      } else if (
        Array.isArray(error.message)
      ) {
        message =
          error.message.join(', ');
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}