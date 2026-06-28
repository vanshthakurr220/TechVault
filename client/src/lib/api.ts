const API_URL = import.meta.env.VITE_API_URL || "";

export const api = (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
  });
};
