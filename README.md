# OMRX-TCC

## Para rodar o projeto na sua máquina

1. Clone o projeto:

   ```bash
   git clone https://github.com/OMRX-TCC/OMRX-TCC.git
   ```

2. Dentro da pasta do projeto, instale as dependências:

   ```bash
   npm install
   ```

   Ao final da instalação, um arquivo `.env` é criado na raiz a partir do `.env.example`.

3. Preencha o `.env` com os dados do seu ambiente (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

4. Inicie o servidor:

   ```bash
   npm start      # modo normal
   npm run dev    # reinicia sozinho ao salvar arquivos
   ```

## Scripts

| Comando                | O que faz                                    |
| ---------------------- | -------------------------------------------- |
| `npm start`            | Inicia o servidor                            |
| `npm run dev`          | Inicia o servidor em modo watch              |
| `npm test`             | Roda os testes de integração                 |
| `npm run lint`         | Analisa o back-end e os testes com ESLint    |
| `npm run lint:fix`     | Corrige automaticamente o que o ESLint puder |
| `npm run format`       | Formata o back-end com Prettier              |
| `npm run format:check` | Verifica se o back-end está formatado        |

## Variáveis de ambiente

| Variável                | Descrição                                                |
| ----------------------- | -------------------------------------------------------- |
| `PORT`                  | Porta do servidor (padrão `3000`)                        |
| `APP_URL`               | URL pública do site, usada nos links enviados por e-mail |
| `DB_HOST`               | Host do MySQL                                            |
| `DB_USER`               | Usuário do MySQL                                         |
| `DB_PASSWORD`           | Senha do MySQL                                           |
| `DB_NAME`               | Nome do banco de dados                                   |
| `JWT_SECRET`            | Segredo usado para assinar os tokens de login            |
| `JWT_EXPIRES_IN`        | Validade do token de login (padrão `1d`)                 |
| `CLOUDFLARE_ACCOUNT_ID` | Conta da Cloudflare usada no URL Scanner                 |
| `CLOUDFLARE_API_TOKEN`  | Token da API da Cloudflare                               |
| `SMTP_HOST`             | Servidor SMTP                                            |
| `SMTP_PORT`             | Porta SMTP (padrão `465`)                                |
| `SMTP_USER`             | Usuário SMTP                                             |
| `SMTP_PASS`             | Senha SMTP                                               |
| `MAIL_FROM`             | Remetente dos e-mails (padrão: `SMTP_USER`)              |

## Back-end

A estrutura segue a mesma ideia do front-end: arquivos de configuração e mensagens na raiz,
peças genéricas reaproveitáveis e arquivos finos que só ligam essas peças.

```
src/
├── server.js       # Sobe o servidor HTTP
├── app.js          # Monta o Express: middlewares globais, rotas e tratamento de erros
├── config.js       # Variáveis de ambiente e parâmetros da aplicação
├── messages.js     # Mensagens enviadas ao usuário
├── routes.js       # Todas as rotas da API, uma por linha
├── controllers/    # Recebem a requisição, chamam o service e devolvem a resposta
├── middlewares/    # Autenticação, validação, credenciais da Cloudflare e tratamento de erros
├── validators/     # Regras de validação por campo (mesmo padrão do front-end)
├── services/       # Regras de negócio de cada fluxo
├── entities/       # Resultado da verificação de URL e regras de risco
├── models/         # Conexão e consultas ao banco de dados
├── providers/      # Integrações externas (SMTP e Cloudflare URL Scanner)
├── templates/      # Templates de e-mail
├── utils/          # Funções auxiliares (HttpError, JWT, tokens, e-mail, HTML)
└── scripts/        # Scripts de manutenção (criação do .env)
```

| Front-end (`frontend/src/scripts`)                    | Back-end (`src`)                                      |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `config.js`, `messages.js`, `routes.js`               | `config.js`, `messages.js`, `routes.js`               |
| `validators/createValidator.js` + `userValidator.js`  | `validators/createValidator.js` + `userValidator.js`  |
| `ui/validatedForm.js` (liga o validator ao formulário) | `middlewares/validationMiddleware.js` (liga o validator à requisição) |
| `pages/` (finas, só ligam as peças)                   | `controllers/` (finos, só ligam as peças)             |
| `services/`                                           | `services/`                                           |
| `api/httpClient.js` + `ApiError`                      | `providers/` + `utils/http.js` com `HttpError`        |

Fluxo de uma requisição:

```
routes.js → middlewares (auth + validator) → controller → service → entities / models / providers
```

Os controllers não tratam erros: os services lançam `HttpError` e o `errorMiddleware`
transforma cada um na resposta `{ error, code? }` com o status certo.

## Front-end

As dependências do front-end já são instaladas junto com o `npm install` na raiz do projeto, graças aos workspaces.

Comandos disponíveis para o front-end, rodados a partir da raiz:

```bash
npm run lint -w frontend
npm run format -w frontend
```
