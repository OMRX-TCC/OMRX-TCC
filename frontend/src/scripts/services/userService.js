import { postJson } from "../api/httpClient.js";

export function createUser({ name, email, password, repeatPassword }) {
  return postJson("/users", {
    name: name.trim(),
    email: email.trim(),
    password,
    repeatPassword,
  });
}

export function loginUser({ email, password }) {
  return postJson("/users/login", {
    email: email.trim(),
    password,
  });
}

export function resendVerificationEmail(email) {
  return postJson("/users/resend-verification", { email: email.trim() });
}
