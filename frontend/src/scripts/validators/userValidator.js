// Espelha as regras do backend em src/middleware/user.js (validateRegister).
// Ao alterar uma regra la, altere aqui tambem.

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;

const isBlank = (value) => value.trim() === "";

/**
 * Cada regra recebe todos os valores do formulario e retorna
 * a mensagem de erro do campo, ou null quando o valor e valido.
 */
const registerRules = {
  name({ name }) {
    if (isBlank(name)) return "Informe seu nome.";
    return null;
  },

  email({ email }) {
    if (isBlank(email)) return "Informe seu e-mail.";
    if (!EMAIL_PATTERN.test(email.trim())) return "E-mail inválido.";
    return null;
  },

  password({ password }) {
    if (!password) return "Crie uma senha.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    return null;
  },

  repeatPassword({ password, repeatPassword }) {
    if (!repeatPassword) return "Confirme sua senha.";
    if (repeatPassword !== password) return "As senhas não coincidem.";
    return null;
  },
};

export const REGISTER_FIELDS = Object.keys(registerRules);

export function validateRegisterField(field, values) {
  return registerRules[field](values);
}

export function validateRegister(values) {
  return Object.fromEntries(
    REGISTER_FIELDS.map((field) => [field, validateRegisterField(field, values)])
  );
}
