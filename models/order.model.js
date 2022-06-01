const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
        merchantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [{
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                min: 1,
                default: 1,
            },
            status: {
                type: String,
                enum: ["pending", "completed", "cancelled"],
            }
        }]
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    payment: {
        type: String,
        required: true,
        enum: ["COD"],
        default: "COD",
    },
    address: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});


module.exports = mongoose.model("Order", orderSchema);