const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const redis_client = require("../redis_connect");

async function Register(req, res) {
  const FindUserByUname = await User.findOne({
    username: req.body.username,
  }).exec();
  if (FindUserByUname) {
    return res.status(401).json({
      status: false,
      message: "Username is already taken.",
    });
  }
  const FindUserByEmail = await User.findOne({
    email: req.body.email,
  }).exec();
  if (FindUserByEmail) {
    return res.status(401).json({
      status: false,
      message: "Email is already in use.",
    });
  }

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    Name: req.body.Name,
    Address: req.body.Address,
  });
  user.setPassword(req.body.password);

  try {
    const saved_user = await user.save();
    res.json({
      status: true,
      message: "Registered successfully.",
      data: {
        id: saved_user._id,
        username: saved_user.username,
        email: saved_user.email,
        name: saved_user.Name,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function Login(req, res) {
  const username = req.body.username;

  try {
    const user = await User.findOne({
      username: username,
    }).exec();

    if (user === null || !user.validatePassword(req.body.password))
      return res.status(401).json({
        status: false,
        message: "Username or Password is not valid.",
      });
    const access_token = jwt.sign(
      {
        sub: user._id,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_TIME,
      }
    );
    const refresh_token = GenerateRefreshToken(user._id);

    return res.json({
      status: true,
      message: "Login Successfully.",
      data: {
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "Login Failiure.",
      data: error,
    });
  }
}

async function Logout(req, res) {
  const user_id = req.userData.sub;
  const token = req.token;

  await redis_client.del(user_id.toString());

  await redis_client.set("BL_" + user_id.toString(), token);

  return res.json({
    status: true,
    message: "Successfully Logged out.",
  });
}

function GetAccessToken(req, res) {
  const user_id = req.userData.sub;
  const access_token = jwt.sign(
    {
      sub: user_id,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TIME,
    }
  );
  const refresh_token = GenerateRefreshToken(user_id);
  return res.json({
    status: true,
    message: "Success successfully Generated RefreshToken",
    data: {
      access_token,
      refresh_token,
    },
  });
}

function GetOnlyNewAccessToken(req, res) {
  const user_id = req.userData.sub;
  const access_token = jwt.sign(
    {
      sub: user_id,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TIME,
    }
  );
  return res.json({
    status: true,
    message: "Success successfully Generated AccessToken from RefreshToken",
    data: {
      access_token,
    },
  });
}

function GenerateRefreshToken(user_id) {
  const refresh_token = jwt.sign(
    {
      sub: user_id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TIME,
    }
  );

  redis_client.get(user_id.toString(), (err, data) => {
    if (err) throw err;

    redis_client.set(
      user_id.toString(),
      JSON.stringify({
        token: refresh_token,
      })
    );
  });

  return refresh_token;
}

async function UserInfo(req, res) {
  const user_id = req.userData.sub;
  try {
    const user = await User.findById(user_id).select("-__v -salt -hash").exec();
    return res.json({
      status: true,
      message: "Successfully get user info.",
      data: user,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function updateUserInfo(req, res) {
  const user_id = req.userData.sub;
  try {
    const user = await User.findByIdAndUpdate(user_id, req.body, {
      new: true,
    }).exec();
    return res.json({
      status: true,
      message: "Successfully update user info.",
      data: user,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function checkUsernameAvaiblity(req, res) {
  const username = req.params.username;
  try {
    const user = await User.findOne({
      username: username,
    }).exec();
    if (user) {
      return res.status(401).json({
        status: false,
        message: "Username is already taken.",
      });
    }
    return res.json({
      status: true,
      message: "Username is available.",
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function DeleteUser(req, res) {
  const user_id = req.userData.sub;
  try {
    const user = await User.findByIdAndDelete(user_id).exec();
    return res.json({
      status: true,
      message: "Successfully delete user.",
      data: user,
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Something went wrong.",
      data: error,
    });
  }
}

async function GetUserById(req, res) {
  const user_id = req.params.uid;
  try {
    const user = await User.findById(user_id).exec();
    return res.json({
      status: true,
      message: "Successfully get user info.",
      data: user,
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
  Register,
  Login,
  Logout,
  GetAccessToken,
  UserInfo,
  updateUserInfo,
  checkUsernameAvaiblity,
  GetOnlyNewAccessToken,
  DeleteUser,
  GetUserById
};
