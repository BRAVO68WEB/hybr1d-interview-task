const route = require("express").Router();
const user_controller = require("../controllers/user.controller");
const auth_middleware = require("../middlewares/auth.middleware");

route.post(
  "/signUp",
  // auth_middleware.verifyConnection,
  user_controller.Register
);

route.post(
  "/login",
  // auth_middleware.verifyConnection,
  user_controller.Login
);

route.post(
  "/token/reset",
  auth_middleware.verifyRefreshToken,
  user_controller.GetAccessToken
);
route.post(
  "/token",
  auth_middleware.verifyRefreshToken,
  user_controller.GetOnlyNewAccessToken
);
route.get("/logout", auth_middleware.verifyToken, user_controller.Logout);
route.get("/status/:username", user_controller.checkUsernameAvaiblity);

module.exports = route;
