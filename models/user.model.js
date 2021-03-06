const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: false,
    }
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["buyer", "seller"],
    default: "buyer",
  },
  // pendingOrders: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  // }],
  // completedOrders: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  // }],
  // totalOrdersPlaced: {
  //   type: Number,
  //   default: 0,
  // },
  // placedOrders: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  // }],
  // totalOrdersCompleted: {
  //   type: Number,
  //   default: 0,
  // },
  salt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  catalog: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }]
}, {
  timestamps: true,
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

userSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

module.exports = mongoose.model("User", userSchema);