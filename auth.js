const jwtSecret = "your_jwt_secret"; // This has to be the same key used in the JWTStrategy

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); // Your local passport file

// Function to generate JWT token

let generateJWTToken = (user) => {
  let loggingUser = {
    id: user._id,
  };
  return jwt.sign(loggingUser, jwtSecret, {
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        return res.status(500).json({
          message: "Internal server error",
          error: error.message,
        });
      }
      if (!user) {
        return res.status(400).json({
          message: "Invalid login credentials",
          info: info,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).json({
            message: "Error logging in user",
            error: error.message,
          });
        }
        let loggingUser = {
          id: user._id,
        };
        let token = generateJWTToken(user.toJSON());
        return res.json({ user: loggingUser, token });
      });
    })(req, res);
  });
};
