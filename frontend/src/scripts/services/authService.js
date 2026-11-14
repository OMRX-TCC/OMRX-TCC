import { postJson } from "../api/httpClient.js";

export async function login({ email, password }) {
  const { token } = await postJson("/users/login", { email: email.trim(), password });
  localStorage.setItem("omrx:token", token);
}
