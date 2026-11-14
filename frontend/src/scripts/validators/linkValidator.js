import { createValidator } from "./createValidator.js";

function getLinkError({ url }) {
  if (url.trim() === "") return "Cole um link para verificar.";
  return null;
}

export const linkCheckValidator = createValidator({
  url: getLinkError,
});
