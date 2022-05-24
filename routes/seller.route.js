const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const seller_controller = require("../controllers/seller.controller");

route.post("/addProduct", auth_middleware.verifyToken, auth_middleware.sellerValidity, seller_controller.addProduct);
route.patch("/pushToCatalog", auth_middleware.verifyToken, auth_middleware.sellerValidity, seller_controller.pushToCatalog);
route.get("/orders", auth_middleware.verifyToken, auth_middleware.sellerValidity, seller_controller.listorders)
route.patch("/maskAsCompleted", auth_middleware.verifyToken, auth_middleware.sellerValidity, seller_controller.maskAsCompleted);

module.exports = route;