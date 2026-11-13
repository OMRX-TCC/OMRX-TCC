import { API_BASE_URL } from "../config.js";

const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor. Tente novamente.";
const DEFAULT_ERROR_MESSAGE = "Algo deu errado. Tente novamente.";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const body = await parseJsonBody(response);

  if (!response.ok) {
    throw new ApiError(body.error || DEFAULT_ERROR_MESSAGE, response.status);
  }

  return body;
}

export function postJson(path, data) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
