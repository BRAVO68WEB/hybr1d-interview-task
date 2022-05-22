const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    onCatalog:{
        type: Boolean,
        required: true,
        default: false,
    },
    listedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Product", productSchema);