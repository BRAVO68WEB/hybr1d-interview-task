require("dotenv").config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");

mongoose.connect(
  process.env.DB_CONN_STRING,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("Connected to MongoDB 🍀")
);

app.use(express.json());

const auth_routes = require("./routes/auth.route");
const user_routes = require("./routes/user.route");
const seller_routes = require("./routes/seller.route");
const buyer_routes = require("./routes/buyer.route");

app.use("/auth", auth_routes);
app.use("/user", user_routes);
app.use("/seller", seller_routes);
app.use("/buyer", buyer_routes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🤖 API Server is running at ${port} ...`));
