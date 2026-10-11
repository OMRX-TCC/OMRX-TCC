const { Router } = require("express");
const userMiddleware = require("../middleware/user");
const userController = require("../controllers/user");

const webRiskMiddleware = require("../middleware/webRisk");
const webRiskController = require("../controllers/webRisk");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);
router.post("/users/login", userMiddleware.validateLogin, userController.login);

router.post("/urls/check", webRiskMiddleware.validateUrl, webRiskController.check);

module.exports = router;