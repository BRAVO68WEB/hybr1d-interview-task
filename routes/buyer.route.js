const route = require("express").Router();
const auth_middleware = require("../middlewares/auth.middleware");
const buyer_controller = require("../controllers/buyer.controller");

route.use(auth_middleware.verifyToken, auth_middleware.buyerValidity)

route.get("/seller-catalog/:seller", buyer_controller.getCatalog);
route.get("/getProduct/:product", buyer_controller.getProduct);
route.get("/orders", buyer_controller.getOrders);
route.get("/list-of-sellers", buyer_controller.listSellers);
route.post("/create-order", buyer_controller.placeOrder)
route.patch("/cancelOrder",  buyer_controller.cancelOrder);

module.exports = route;
