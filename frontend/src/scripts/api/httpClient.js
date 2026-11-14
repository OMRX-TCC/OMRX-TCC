import { API_BASE_URL, NETWORK_ERROR_STATUS } from "../config.js";
import { HTTP_ERROR_MESSAGES } from "../messages.js";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function sendRequest(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(HTTP_ERROR_MESSAGES.network, NETWORK_ERROR_STATUS);
  }

  const responseBody = await readJsonBody(response);

  if (!response.ok) {
    throw new ApiError(responseBody.error || HTTP_ERROR_MESSAGES.unknown, response.status);
  }

  return responseBody;
}

export function postJson(path, requestBody) {
  return sendRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
}

export function getErrorMessage(error, fallbackMessage) {
  return error instanceof ApiError ? error.message : fallbackMessage;
}
