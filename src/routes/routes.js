const { Router } = require("express");
const userMiddleware = require("../middleware/user");
const userController = require("../controllers/user");

const webRiskMiddleware = require("../middleware/webRisk");
const webRiskController = require("../controllers/webRisk");

const authMiddleware = require("../middleware/auth");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);
router.post("/users/login", userMiddleware.validateLogin, userController.login);
router.post("/users/verify-email", userController.verifyEmail);
router.post("/users/resend-verification", userMiddleware.validateResendVerification, userController.resendVerification);

router.post("/urls/check", authMiddleware.auth, webRiskMiddleware.validateUrl, webRiskController.check);

module.exports = router;