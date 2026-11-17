const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.join(__dirname, "..", "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const ENV_EXAMPLE_PATH = path.join(PROJECT_ROOT, ".env.example");

function createEnvFile() {
  if (fs.existsSync(ENV_PATH)) return;

  if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    console.log("[setup-env] Arquivo .env criado a partir do .env.example.");
    return;
  }

  fs.writeFileSync(ENV_PATH, "");
  console.log("[setup-env] Arquivo .env vazio criado.");
}

createEnvFile();
