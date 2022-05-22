const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const buyer_controller = require("../controllers/buyer.controller");

route.get("/getCatalog/:seller", auth_middleware.verifyToken, buyer_controller.getCatalog);
route.get("/getProduct/:product", auth_middleware.verifyToken, buyer_controller.getProduct);
route.post("/placeOrder", auth_middleware.verifyToken,  buyer_controller.placeOrder)
route.patch("/cancelOrder", auth_middleware.verifyToken, buyer_controller.cancelOrder);

module.exports = route;
