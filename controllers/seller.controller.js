const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

async function addProduct(req, res) {
    const user_id = req.userData.sub;
    const {
        name,
        price
    } = req.body;

    try {
        const user = await User.findById(user_id).exec();
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "User not found.",
            });
        }
        if (user.type !== "seller") {
            return res.status(401).json({
                status: false,
                message: "User is not a seller.",
            });
        }
        const product = new Product({
            name,
            price,
            listedBy: user_id,
        });
        const newProduct = await product.save();
        return res.json({
            status: true,
            message: "Successfully add product.",
            data: newProduct,
        });
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Something went wrong.",
            data: error,
        });
    }
}

async function pushToCatalog(req, res, next) {
    const user_id = req.userData.sub;
    const {
        product_id
    } = req.body;
    try {
        const user = await User.findById(user_id).exec();
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "User not found.",
            });
        }
        const product = await Product.findById(product_id).exec();
        if (!product) {
            return res.status(401).json({
                status: false,
                message: "Product not found.",
            });
        }
        if (product.listedBy.toString() !== user_id) {
            return res.status(401).json({
                status: false,
                message: "You are not the owner of this product.",
            });
        }
        product.onCatalog = true;
        await User.findByIdAndUpdate(user_id, {
            $addToSet: {
                catalog: product_id
            }
        }).exec();

        const newProduct = await product.save();
        return res.json({
            status: true,
            message: "Successfully add product to catalog.",
            data: newProduct,
        });
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Something went wrong.",
            data: error,
        });
    }
}

async function listorders(req, res) {
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
            "products.merchantID": user_id
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

async function maskAsCompleted(req, res) {
    const user_id = req.userData.sub;
    const {
        order_id
    } = req.body;
    try {
        const user = await User.findById(user_id).exec();
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "User not found.",
            });
        }
        const order = await Order.findById(order_id).exec();
        if (!order) {
            return res.status(401).json({
                status: false,
                message: "Order not found.",
            });
        }
        let productToMark = (order.products)
        for(i in productToMark){
            if(productToMark[i].merchantID.toString() === user_id){
                // await User.findByIdAndUpdate(user_id, {
                //     $addToSet: {
                //         completedOrders: order_id
                //     }
                //   }).exec();
                for(j in productToMark[i].products){
                        productToMark[i].products[j].status = "completed"
                }
            }
        }
        
        await order.save();

        return res.json({
            status: true,
            message: "Successfully mask order as completed.",
            data: order,
        });

    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Something went wrong.",
            data: error.message,
        });
    }
}

module.exports = {
    addProduct,
    pushToCatalog,
    listorders,
    maskAsCompleted
};