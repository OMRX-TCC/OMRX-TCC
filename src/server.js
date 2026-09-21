const express = require("express");
const mysql = require("mysql2");
const routes = require("../src/routes/user");

const app = express();
app.use(express.json());
app.use(routes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
})

app.get("/", (req, resp) => {
    resp.send("Hello world!");
})