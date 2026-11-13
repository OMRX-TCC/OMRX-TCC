// Banco em memoria que imita o subconjunto de SQL usado pelos models
// (src/models/user.js e src/models/emailVerificationToken.js).
// A comparacao de email e case-insensitive, como a collation padrao do MySQL.

function createFakeDb() {
  const state = { users: [], tokens: [] };
  let userSeq = 0;
  let tokenSeq = 0;

  const sameEmail = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

  async function execute(sql, params = []) {
    const q = sql.replace(/\s+/g, " ").trim();

    if (q.startsWith("INSERT INTO users")) {
      const [name, email, hash] = params;
      const row = {
        user_id: ++userSeq,
        user_name: name,
        user_email: email,
        senha_hash: hash,
        user_email_verified_at: null,
      };
      state.users.push(row);
      return [{ insertId: row.user_id }];
    }

    if (q.startsWith("SELECT user_id FROM users WHERE user_email")) {
      const user = state.users.find((u) => sameEmail(u.user_email, params[0]));
      return [user ? [{ user_id: user.user_id }] : []];
    }

    if (/^SELECT \* FROM users where user_email/i.test(q)) {
      const user = state.users.find((u) => sameEmail(u.user_email, params[0]));
      return [user ? [{ ...user }] : []];
    }

    if (q.startsWith("UPDATE users SET user_email_verified_at")) {
      const user = state.users.find((u) => u.user_id === params[0]);
      if (user) user.user_email_verified_at = new Date();
      return [{ affectedRows: user ? 1 : 0 }];
    }

    if (q.startsWith("INSERT INTO email_verification_tokens")) {
      const [userId, tokenHash, hours] = params;
      const now = Date.now();
      state.tokens.push({
        id: ++tokenSeq,
        user_id: userId,
        token_hash: tokenHash,
        created_at: new Date(now),
        expires_at: new Date(now + hours * 3600 * 1000),
      });
      return [{ insertId: tokenSeq }];
    }

    if (q.startsWith("SELECT user_id, expires_at < NOW()")) {
      const token = state.tokens.find((t) => t.token_hash === params[0]);
      return [
        token
          ? [{ user_id: token.user_id, expired: token.expires_at < new Date() ? 1 : 0 }]
          : [],
      ];
    }

    if (q.startsWith("SELECT TIMESTAMPDIFF")) {
      const rows = state.tokens.filter((t) => t.user_id === params[0]);
      const seconds = rows.length
        ? Math.floor((Date.now() - Math.max(...rows.map((t) => t.created_at.getTime()))) / 1000)
        : null;
      return [[{ seconds }]];
    }

    if (q.startsWith("DELETE FROM email_verification_tokens")) {
      const before = state.tokens.length;
      state.tokens = state.tokens.filter((t) => t.user_id !== params[0]);
      return [{ affectedRows: before - state.tokens.length }];
    }

    throw new Error(`Query nao suportada pelo fake DB: ${q}`);
  }

  return {
    pool: { execute },

    reset() {
      state.users = [];
      state.tokens = [];
      userSeq = 0;
      tokenSeq = 0;
    },

    // --- helpers de inspecao e manipulacao usados pelos testes ---
    users: () => state.users,
    tokens: () => state.tokens,
    findUser: (email) => state.users.find((u) => sameEmail(u.user_email, email)),
    tokensOf: (userId) => state.tokens.filter((t) => t.user_id === userId),

    verifyUser(email) {
      this.findUser(email).user_email_verified_at = new Date();
    },

    // Envelhece os tokens do usuario, simulando a passagem do tempo.
    ageTokens(userId, seconds) {
      for (const t of this.tokensOf(userId)) {
        t.created_at = new Date(t.created_at.getTime() - seconds * 1000);
      }
    },

    expireTokens(userId) {
      for (const t of this.tokensOf(userId)) {
        t.expires_at = new Date(Date.now() - 1000);
      }
    },
  };
}

module.exports = { createFakeDb };
