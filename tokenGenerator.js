const bcrypt = require("bcryptjs");

const password = "1d324d2548hjg4085hg048h5g08h";
const saltRounds = 10;

bcrypt.genSalt(saltRounds, function (err, salt) {
  if (err) {
    throw err;
  } else {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        throw err;
      } else {
        console.log(hash);
      }
    });
  }
});
