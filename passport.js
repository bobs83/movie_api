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
      // Log the jwtPayload for debugging
      console.log(jwtPayload);

      // Check if the payload contains the id property
      if (!jwtPayload || !jwtPayload.id) {
        return callback(new Error("Invalid token: ID is missing."), false);
      }

      try {
        const user = await Users.findById(jwtPayload.id); // Using id instead of _id

        // If no user is found, return the callback with null user
        if (!user) {
          return callback(null, false); // 'false' indicates that the authentication failed
        }

        // If a user is found, prepare the user object for the callback
        const loggingUser = {
          id: user._id, // This is the id used in the JWTStrategy
        };

        // Return the callback with the user object
        return callback(null, loggingUser);
      } catch (error) {
        // In case of an error, return the callback with the error
        return callback(error);
      }
    }
  )
);
