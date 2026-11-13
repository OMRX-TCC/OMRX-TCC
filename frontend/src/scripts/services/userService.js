import { postJson } from "../api/httpClient.js";

export function createUser({ name, email, password, repeatPassword }) {
  return postJson("/users", {
    name: name.trim(),
    email: email.trim(),
    password,
    repeatPassword,
  });
}
