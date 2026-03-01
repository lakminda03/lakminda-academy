const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => null;

export const setToken = () => {};

let csrfToken = "";
let csrfFetchPromise = null;

const needsCsrf = (method) => !["GET", "HEAD", "OPTIONS"].includes(String(method || "GET").toUpperCase());

const fetchCsrfToken = async ({ force = false } = {}) => {
  if (!force && csrfToken) return csrfToken;
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = fetch(`${API_URL}/api/csrf-token`, {
    method: "GET",
    credentials: "include",
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      csrfToken = String(data.csrfToken || "");
      return csrfToken;
    })
    .finally(() => {
      csrfFetchPromise = null;
    });

  return csrfFetchPromise;
};

export const apiRequest = async (path, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (needsCsrf(method)) {
    const token = await fetchCsrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  } catch {
    throw new Error("Cannot reach server. Check backend is running and CORS/URL config.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status === 403 && String(data.message || "").toLowerCase().includes("csrf") && needsCsrf(method)) {
    const fresh = await fetchCsrfToken({ force: true });
    const retryHeaders = { ...headers, ...(fresh ? { "X-CSRF-Token": fresh } : {}) };
    const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders, credentials: "include" });
    const retryData = await retryRes.json().catch(() => ({}));
    if (!retryRes.ok) {
      const retryError = new Error(retryData.message || "Request failed");
      retryError.status = retryRes.status;
      retryError.data = retryData;
      throw retryError;
    }
    return retryData;
  }

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};
