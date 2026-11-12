import { postJson } from "../api/httpClient.js";

export function createUser({ name, email, password, repeatPassword }) {
  return postJson("/users", {
    name: name.trim(),
    email: email.trim(),
    password,
    repeatPassword,
  });
}

/** Reenvia o e-mail de verificacao de cadastro. */
export function resendVerificationEmail(email) {
  return postJson("/users/resend-verification", { email: email.trim() });
}
