const { Router } = require("express");
const { ERROR_CODES } = require("./config");
const urlCheckController = require("./controllers/urlCheckController");
const userController = require("./controllers/userController");
const verificationController = require("./controllers/verificationController");
const { authenticate } = require("./middlewares/authMiddleware");
const { requireUrlCheckCredentials } = require("./middlewares/urlCheckMiddleware");
const { validateBody } = require("./middlewares/validationMiddleware");
const { HTTP_STATUS } = require("./utils/http");
const { urlCheckValidator } = require("./validators/urlValidator");
const { loginValidator, registerValidator, resendVerificationValidator, verifyEmailValidator } = require("./validators/userValidator");

const router = Router();

router.post("/users", validateBody(registerValidator), userController.register);
router.post("/users/login", validateBody(loginValidator, { status: HTTP_STATUS.unauthorized }), userController.login);
router.post("/users/verify-email", validateBody(verifyEmailValidator, { code: ERROR_CODES.invalidToken }), userController.verifyEmail);
router.post("/users/resend-verification", validateBody(resendVerificationValidator), userController.resendVerificationEmail);

router.post("/urls/check", authenticate, requireUrlCheckCredentials, validateBody(urlCheckValidator), urlCheckController.startCheck);
router.get("/urls/check/:scanId", authenticate, requireUrlCheckCredentials, urlCheckController.getCheckResult);

router.post("/verify", authenticate, requireUrlCheckCredentials, validateBody(urlCheckValidator), verificationController.verifyUrl);
router.get("/stats", verificationController.getStats);

module.exports = router;
