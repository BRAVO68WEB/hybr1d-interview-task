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

module.exports = {
  getCatalog,
  getProduct,
  placeOrder
};