const User = require("../models/user.model");
const Product = require("../models/product.model");

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
        console.log(product);
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

module.exports = {
    addProduct,
    pushToCatalog
};