const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const seller_controller = require("../controllers/seller.controller");

route.use(auth_middleware.verifyToken, auth_middleware.sellerValidity)

route.post("/addProduct", seller_controller.addProduct);
route.patch("/create-catalog", seller_controller.pushToCatalog);
route.get("/orders", seller_controller.listorders)
route.patch("/maskAsCompleted", seller_controller.maskAsCompleted);

module.exports = route;