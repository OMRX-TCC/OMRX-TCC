const { Router } = require("express");
const userMiddleware = require("../middleware/user");
const userController = require("../controllers/user");

const urlCheckMiddleware = require("../middleware/urlCheck");
const urlCheckController = require("../controllers/urlCheck");

const verifyMiddleware = require("../middleware/verify");
const verifyController = require("../controllers/verify");

const statsController = require("../controllers/stats");

const passwordResetMiddleware = require("../middleware/passwordReset");
const passwordResetController = require("../controllers/passwordReset");

const authMiddleware = require("../middleware/auth");
const { urlCheckCredentialsMiddleware } = require("../middleware/urlCheckCredentials");

const router = Router();

router.post("/users", userMiddleware.validateRegister, userController.create);
router.post("/users/login", userMiddleware.validateLogin, userController.login);
router.put("/change", authMiddleware.auth, userMiddleware.validateUpdate, userController.update);
router.post("/users/verify-email", userController.verifyEmail);
router.post("/users/resend-verification", userMiddleware.validateResendVerification, userController.resendVerification);
router.delete("/delete", authMiddleware.auth, userMiddleware.validateDeleteAccount, userController.remove);
router.get("/account", authMiddleware.auth, userController.getAccount);

router.post("/forgot-password", passwordResetMiddleware.validateForgotPassword, passwordResetController.forgot);
router.post("/reset-password", passwordResetMiddleware.validateResetPassword, passwordResetController.reset);

router.post("/urls/check", authMiddleware.auth, urlCheckCredentialsMiddleware, urlCheckMiddleware.validateUrl, urlCheckController.start);
router.get("/urls/check/:scanId", authMiddleware.auth, urlCheckCredentialsMiddleware, urlCheckController.result);
router.post("/verify", authMiddleware.auth, urlCheckCredentialsMiddleware, verifyMiddleware.validateUrl, verifyController.verify);

router.get("/stats", statsController.getStats);

module.exports = router;