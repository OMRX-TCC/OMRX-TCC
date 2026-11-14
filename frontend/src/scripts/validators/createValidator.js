export function createValidator(errorRuleByField) {
  const fieldNames = Object.keys(errorRuleByField);

  function getFieldError(fieldName, formValues) {
    return errorRuleByField[fieldName](formValues);
  }

  function getAllErrors(formValues) {
    return Object.fromEntries(
      fieldNames.map((fieldName) => [fieldName, getFieldError(fieldName, formValues)])
    );
  }

  return { fieldNames, getFieldError, getAllErrors };
}
