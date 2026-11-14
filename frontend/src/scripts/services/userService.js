import { postJson } from "../api/httpClient.js";

const TOKEN_STORAGE_KEY = "omrx:token";

export function createUser({ name, email, password, repeatPassword }) {
  return postJson("/users", {
    name: name.trim(),
    email: email.trim(),
    password,
    repeatPassword,
  });
}

export function resendVerificationEmail(email) {
  return postJson("/users/resend-verification", { email: email.trim() });
}

export async function login({ email, password }) {
  const { token } = await postJson("/users/login", { email: email.trim(), password });
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function hasTokenExpired(token) {
  try {
    const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64Payload));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return false;

  if (hasTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return false;
  }

  return true;
}
