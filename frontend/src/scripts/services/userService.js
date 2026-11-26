import { deleteJson, getJson, postJson, putJson } from "../api/httpClient.js";

const TOKEN_STORAGE_KEY = "omrx:token";

export function createUser({ name, email, password, repeatPassword }) {
  return postJson("/users", {
    name: name.trim(),
    email: email.trim(),
    password,
    repeatPassword,
  });
}

export function verifyEmail(token) {
  return postJson("/users/verify-email", { token });
}

export function resendVerificationEmail(email) {
  return postJson("/users/resend-verification", { email: email.trim() });
}

export function requestPasswordReset(email) {
  return postJson("/forgot-password", { email: email.trim() });
}

export function resetPassword({ token, newPassword, confirmNewPassword }) {
  return postJson("/reset-password", { token, newPassword, confirmNewPassword });
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

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isLoggedIn() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return false;

  if (hasTokenExpired(token)) {
    clearSession();
    return false;
  }

  return true;
}

function getAuthHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY)}` };
}

export function getAccount() {
  return getJson("/account", getAuthHeaders());
}

export function updateAccount(changes) {
  return putJson("/change", changes, getAuthHeaders());
}

export function deleteAccount({ currentPassword, confirmDeletion }) {
  return deleteJson("/delete", { currentPassword, confirmDeletion }, getAuthHeaders());
}
