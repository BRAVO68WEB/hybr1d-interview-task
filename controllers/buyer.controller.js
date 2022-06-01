const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

async function getCatalog(req, res) {
  const seller_name = req.params.seller;
  try {
    const user = await User.findOne({username: seller_name}).populate({
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
    products,
    address,
    payment
  } = req.body;

  let productToOrder = [];
  let seller = "";
  let product = {};
  let totalPrice = 0; 
  
  try {
    for (i in products) {
      product = await Product.findById(products[i]).exec();
      seller = String(product.listedBy);
      totalPrice += product.price;
      if (!product.onCatalog) {
        throw new Error("Product is not on catalog.");
      }
      let added = false;
      for(j in productToOrder){
        if(productToOrder[j].merchantID == seller){
          productToOrder[j].products.push({
            productID: products[i],
            quantity: 1,
            status: "pending"
          })
          added = true;
          break;
        }
      }
      if(!added)
        productToOrder.push({
          merchantID: seller,
          products: [{
            productID: products[i],
            quantity: 1,
            status: "pending"
          }]
        })
    }
    
    const user = await User.findById(user_id).exec();

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found.",
      });
    }
    const orderBy = user_id;
    const order = new Order({
      orderBy,
      products: productToOrder,
      totalPrice,
      address,
      payment
    });
    const newOrder = await order.save();
    
    // await User.findByIdAndUpdate(seller, {
    //   $addToSet: {
    //     pendingOrders: newOrder._id
    //   }
    // }).exec();
    
    return res.json({
      status: true,
      message: "Successfully place order.",
      data: newOrder,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error.message,
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
  if (order.orderBy != user_id || order.status != "completed") {
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
    // await User.findByIdAndUpdate(order.seller, {
    //   $pull: {
    //     pendingOrders: order_id
    //   }
    // }).exec();
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

async function listSellers(req, res) {
  try {
    const sellers = await User.find({
      type: "seller"
    }).exec();
    return res.json({
      status: true,
      message: "Successfully get sellers.",
      data: sellers.map(seller => seller.username),
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
  getOrders,
  placeOrder,
  cancelOrder,
  listSellers
};