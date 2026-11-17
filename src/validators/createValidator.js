function createValidator(errorRuleByField) {
  const errorRules = Object.values(errorRuleByField);

  function getFirstError(values) {
    for (const getFieldError of errorRules) {
      const fieldError = getFieldError(values);
      if (fieldError) return fieldError;
    }

    return null;
  }

  return { getFirstError };
}

module.exports = { createValidator };
