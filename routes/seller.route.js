const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const seller_controller = require("../controllers/seller.controller");

route.post("/addProduct", auth_middleware.verifyToken,  seller_controller.addProduct);
route.patch("/pushToCatalog", auth_middleware.verifyToken, seller_controller.pushToCatalog);
module.exports = route;
