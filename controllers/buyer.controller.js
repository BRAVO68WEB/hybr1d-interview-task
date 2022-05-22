const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

async function getCatalog(req, res) {
  const user_id = req.params.seller;
  try {
    const user = await User.findOne(user_id).populate({
      path: 'catalog',
      select: ['name', 'price']
    }).exec();
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found.",
      });
    }
    return res.json({
      status: true,
      message: "Successfully get catalog.",
      data: user.catalog,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function getProduct(req, res) {
  const product_id = req.params.product;
  try {
    const product = await Product.findById(product_id).exec();
    if (!product) {
      return res.status(401).json({
        status: false,
        message: "Product not found.",
      });
    }
    return res.json({
      status: true,
      message: "Successfully get product.",
      data: product,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function placeOrder(req, res) {
  const user_id = req.userData.sub;
  let {
    productId,
    address,
    payment,
    quantity
  } = req.body;
  if (quantity == null) {
    console.log("quantity is null");
    quantity = 1;
  }
  const product = await Product.findById(productId).exec();
  const seller = product.listedBy;
  const totalPrice = product.price * quantity;

  try {
    const user = await User.findById(user_id).exec();

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found.",
      });
    }
    const orderBy = user_id;
    console.log(productId + " " + quantity + " " + totalPrice + " " + seller + " " + address + " " + payment);
    const order = new Order({
      orderBy,
      productId,
      quantity,
      totalPrice,
      seller,
      address,
      payment
    });
    const newOrder = await order.save();
    await User.findByIdAndUpdate(seller, {
      $addToSet: {
        pendingOrders: newOrder._id
      }
    }).exec();
    return res.json({
      status: true,
      message: "Successfully place order.",
      data: newOrder,
    });
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function getOrders(req, res) {
  const user_id = req.userData.sub;
  try {
    const user = await User.findById(user_id).exec();
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found.",
      });
    }
    const orders = await Order.find({
      orderBy: user_id
    }).exec();
    return res.json({
      status: true,
      message: "Successfully get orders.",
      data: orders,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function cancelOrder(req, res) {
  const user_id = req.userData.sub;
  const order_id = req.params.order;
  const order = await Order.findById(order_id).exec();
  if (!order) {
    return res.status(401).json({
      status: false,
      message: "Order not found.",
    });
  }
  if (order.orderBy != user_id) {
    return res.status(401).json({
      status: false,
      message: "You are not authorized to cancel this order.",
    });
  }
  if (order.status != "pending") {
    return res.status(401).json({
      status: false,
      message: "You can not cancel this order.",
    });
  }
  try {
    await Order.findByIdAndUpdate(order_id, {
      status: "cancelled"
    }).exec();
    await User.findByIdAndUpdate(order.seller, {
      $pull: {
        pendingOrders: order_id
      }
    }).exec();
    return res.json({
      status: true,
      message: "Successfully cancel order.",
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

module.exports = {
  getCatalog,
  getProduct,
  placeOrder,
  cancelOrder
};