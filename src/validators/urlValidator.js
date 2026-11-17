const { URL_CHECK_MESSAGES } = require("../messages");
const { createValidator } = require("./createValidator");

function getUrlError({ url }) {
  if (!url || typeof url !== "string") return URL_CHECK_MESSAGES.urlRequired;
  if (!URL.canParse(url)) return URL_CHECK_MESSAGES.invalidUrl;
  return null;
}

const urlCheckValidator = createValidator({
  url: getUrlError,
});

module.exports = { urlCheckValidator };
