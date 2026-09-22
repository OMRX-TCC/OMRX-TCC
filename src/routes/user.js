const { Router } = require("express");
const userMiddleware = require("../middleware/user")
const userController = require("../controllers/user");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);

router.post("/users/login", userMiddleware.validateLogin, userController.login)

module.exports = router;