const API_URL = "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("booknest_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "Something went wrong. Please try again.";

    const error = new Error(message);
    error.status = response.status;
    error.code = data?.error?.code || data?.code;
    throw error;
  }

  return data;
}

export function getBookList(result) {
  if (Array.isArray(result)) return result;
  return result?.books || result?.data || result?.items || [];
}