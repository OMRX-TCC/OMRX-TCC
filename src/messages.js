const SERVER_MESSAGES = {
  internalError: "Erro interno no servidor. Tente novamente mais tarde.",
  invalidRequest: "Requisição inválida.",
};

const AUTH_MESSAGES = {
  tokenMissing: "Token não fornecido",
  tokenInvalid: "Token inválido ou expirado",
  credentialsRequired: "Os campos email e senha são obrigatórios.",
  invalidCredentials: "Email ou senha inválidos",
  emailNotVerified: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
};

const USER_MESSAGES = {
  requiredFields: "Todos os campos são obrigatórios.",
  fieldsMustBeText: "Os campos devem ser texto.",
  invalidEmail: "Email inválido.",
  passwordTooShort: (minLength) => `A senha deve ter ao menos ${minLength} caracteres.`,
  passwordsDoNotMatch: "As senhas digitadas devem ser as mesmas.",
  emailAlreadyRegistered: "O Email já existe!",
};

const EMAIL_VERIFICATION_MESSAGES = {
  invalidToken: "Link de verificação inválido ou já utilizado.",
  expiredToken: "Este link de verificação expirou. Solicite um novo.",
  verified: "E-mail confirmado com sucesso! Você já pode entrar.",
  resendAccepted: "Se houver uma conta pendente de verificação com esse e-mail, enviaremos um novo link.",
  sendFailed: "Não foi possível enviar o e-mail de verificação. Tente novamente mais tarde.",
};

const URL_CHECK_MESSAGES = {
  urlRequired: "O campo link é obrigatório.",
  invalidUrl: "Esse link não é válido",
  serviceUnavailable: "Serviço de verificação indisponível no momento. Tente novamente mais tarde.",
  timeout: "A verificação demorou demais. Tente novamente.",
  networkError: "Não foi possível conectar ao serviço de verificação. Tente novamente.",
  apiError: "Não foi possível verificar esse link agora. Tente novamente mais tarde.",
};

const VERDICT_MESSAGES = {
  safe: "Confiável",
  suspicious: "Suspeito",
  noThreatsFound: "Nenhuma ameaça encontrada.",
  possibleRisk: (threats) => `Possível risco: ${threats}.`,
  unspecifiedThreat: "Ameaça não especificada",
};

const THREAT_DESCRIPTIONS = {
  malware: "malware conhecido",
  phishing: "sinais de phishing",
};

module.exports = {
  SERVER_MESSAGES,
  AUTH_MESSAGES,
  USER_MESSAGES,
  EMAIL_VERIFICATION_MESSAGES,
  URL_CHECK_MESSAGES,
  VERDICT_MESSAGES,
  THREAT_DESCRIPTIONS,
};
