const API_BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set credentials to 'include' so secure cookies are passed along
  const defaultOptions = {
    credentials: "include",
    headers: {},
  };

  // Automatically content-type JSON if body is not FormData
  if (options.body && !(options.body instanceof FormData)) {
    defaultOptions.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error?.message || "An unexpected error occurred.";
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};
