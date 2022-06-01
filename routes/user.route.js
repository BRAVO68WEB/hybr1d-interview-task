const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const user_controller = require("../controllers/user.controller");

route.get("/me", auth_middleware.verifyToken, (req, res) => {
  user_controller.UserInfo(req, res);
});
route.delete("/deleteUser", auth_middleware.verifyToken, user_controller.DeleteUser);
route.patch(
  "/editUser",
  auth_middleware.verifyToken,
  user_controller.updateUserInfo
);

module.exports = route;
