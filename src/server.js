const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
