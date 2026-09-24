const { Router } = require("express");
const userMiddleware = require("../middleware/user")
const userController = require("../controllers/user");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);

module.exports = router;