const { Router } = require("express");
const userMiddleware = require("../middleware/user");
const userController = require("../controllers/user");

const urlCheckMiddleware = require("../middleware/urlCheck");
const urlCheckController = require("../controllers/urlCheck");

const verifyMiddleware = require("../middleware/verify");
const verifyController = require("../controllers/verify");

const statsController = require("../controllers/stats");

const authMiddleware = require("../middleware/auth");
const { urlCheckCredentialsMiddleware } = require("../middleware/urlCheckCredentials");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);
router.post("/users/login", userMiddleware.validateLogin, userController.login);

router.post("/urls/check", authMiddleware.auth, urlCheckCredentialsMiddleware, urlCheckMiddleware.validateUrl, urlCheckController.start);
router.get("/urls/check/:scanId", authMiddleware.auth, urlCheckCredentialsMiddleware, urlCheckController.result);
router.post("/verify", authMiddleware.auth, urlCheckCredentialsMiddleware, verifyMiddleware.validateUrl, verifyController.verify);

router.get("/stats", statsController.getStats);

module.exports = router;