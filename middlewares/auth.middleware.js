const jwt = require("jsonwebtoken");
const redis_client = require("../redis_connect");
const bcrypt = require("bcryptjs");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;
    req.token = token;
    redis_client.get("BL_" + decoded.sub.toString(), (err, data) => {
      if (err) throw err;

      if (data === token)
        return res.status(401).json({
          status: false,
          message: "blacklisted token.",
        });
      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Your session is not valid.",
      data: error,
    });
  }
}

function verifyRefreshToken(req, res, next) {
  const token = req.body.token;

  if (token === null)
    return res.status(401).json({
      status: false,
      message: "Invalid request.",
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.userData = decoded;
    redis_client.get(decoded.sub.toString(), (err, data) => {
      if (err) throw err;

      if (data === null)
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not in store.",
        });
      if (JSON.parse(data).token != token)
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not same in store.",
        });

      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "Your session is not valid.",
      data: error,
    });
  }
}

async function verifyConnection(req, res, next) {
  var orgAuthString = process.env.AUTH_HEADER_SECRET;
  if (!req.headers["validate-connection"]) {
    return res.status(401).json({
      status: false,
      message: "Invalid request.",
    });
  } else {
    var authString = req.headers["validate-connection"];
    var redis_req_string_get =
      "VT_" + Buffer.from(authString).toString("base64");
    await redis_client.get(redis_req_string_get, (err, data) => {
      if (err) throw err;

      if (data) {
        if (data === authString) {
          return res.status(401).json({
            status: false,
            message: "Invalid request.",
          });
        } else {
          console.log("Not Matched");
          return res.status(401).json({
            status: false,
            message: "Invalid request.",
          });
        }
      } else {
        return bcrypt
          .compare(orgAuthString, authString)
          .then(async (result) => {
            if (!result) {
              return res.status(403).json({
                status: false,
                message: "Access Denied.",
              });
            } else {
              var redis_req_string_set =
                Buffer.from(authString).toString("base64");
              await redis_client.set("VT_" + redis_req_string_set, authString);
              next();
            }
          })
          .catch((err) => {
            console.log(err);
            return res.status(403).json({
              status: false,
              message: "Access Denied.",
            });
          });
      }
    });
  }
}

function buyerValidity(req, res, next) {
  try {
    if (req.userData.role === "buyer") {
      next();
    } else {
      throw new Error("You are not valid buyer.")
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "You are not valid buyer.",
      data: error,
    });
  }
}

function sellerValidity(req, res, next) {
  try {
    if (req.userData.role === "seller") {
      next();
    } else {
      throw new Error("You are not valid seller.")
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "You are not valid seller.",
      data: error,
    });
  }
}

module.exports = {
  verifyToken,
  verifyRefreshToken,
  verifyConnection,
  buyerValidity,
  sellerValidity
};