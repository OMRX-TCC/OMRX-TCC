const path = require("node:path");
const express = require("express");
const { handleError } = require("./middlewares/errorMiddleware");
const router = require("./routes");

const FRONTEND_DIRECTORY = path.join(__dirname, "..", "frontend", "src");

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(express.static(FRONTEND_DIRECTORY));
app.use(router);
app.use(handleError);

module.exports = app;
