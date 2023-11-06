const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      try {
        const user = await Users.findOne({ Username: username }); // Make sure the field is 'Username' if it's case-sensitive in your schema

        if (!user) {
          console.log("Incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        console.log("You are logged in!");

        if (!user.validatePassword(password)) {
          console.log("Incorrect password");
          return callback(null, false, { message: "Incorrect password" });
        }

        return callback(null, user);
      } catch (err) {
        console.error(err);
        return callback(err);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
