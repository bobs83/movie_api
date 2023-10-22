const express = require("express"); //Framework for building web applications and APIs.
const bodyParser = require("body-parser"); //Middleware to parse JSON and urlencoded data
const morgan = require("morgan"); // for logging HTTP requests to a file named "log.txt".
const fs = require("fs"); //Node.js file system module for working with files.
const path = require("path"); //Node.js module that provides utilities for working with file and directory paths.
const uuid = require("uuid"); // Module for the creation of RFC4122 UUIDs.
const mongoose = require("mongoose"); // MongoDB object modeling tool designed to work in an asynchronous environment.
const Models = require("./models.js"); //Importing Mongoose models (presumably, you have defined your Mongoose schemas in a "models.js" file).
//const bcrypt = require("bcrypt"); //Library for hashing passwords.
//const saltRounds = 10;

// Defining Models // Import Models
const Movies = Models.Movie;
const Users = Models.User;

// Initialize express app
const app = express();
const { check, validationResult } = require("express-validator"); //Module for validating data.

// Connect to MongoDB database
// mongoose.connect(process.env.CONNECTION_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect("mongodb://localhost:27017/myflix2DB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cors = require("cors"); //Middleware for providing a Connect/Express middleware that can be used to enable CORS with various options.
app.use(cors()); //Allowing all domains to make requests to your API.

//Using CORS to allow all domains to make requests to your API.
// let allowedOrigins = [
// 	"http://localhost:8080",
// 	"https://movies-api-render-0a0q.onrender.com/",
// 	"https://ghibli-archive.netlify.app/",
// ];
// app.use(
// 	cors({
// 		origin: (origin, callback) => {
// 			if (!origin) {
// 				return callback(null, true);
// 			}
// 			if (allowedOrigins.indexOf(origin) === -1) {
// 				let message =
// 					"the CORS policy for this application doesnt allow access from origin " +
// 					origin;
// 				return callback(new Error(message), false);
// 			}
// 			return callback(null, true);
// 		},
// 	})
// );

// Authentication Module
// let auth = require("./auth")(app);
let auth;
try {
  auth = require("./auth.js")(app);
} catch (error) {
  console.error("Error loading auth module:", error.message);
  // Handle the error or set up a default configuration
}

// Passport Configuration
const passport = require("passport"); // Middleware for handling user authentication
require("./passport.js");

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log URL request data to log.txt text file
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.use(morgan("combined", { stream: accessLogStream })); // enable morgan logging to 'log.txt'

app.use(express.static("public")); //Serves static assets from the "public" directory.
//app.use(express.urlencoded({ extended: true })); //Parses incoming requests with URL-encoded payloads.

// CORS
/////////////////////////  AUTHENTICATION /////////////////////////

//GET // READ requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

//return a list of ALL movies to the user
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get data about a single movie by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        if (!movie) {
          return res
            .status(404)
            .send("Error: " + req.params.Title + " was not found");
        }
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get data about genre
app.get(
  "/movies/genre/:Genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find({ "Genre.Name": req.params.Genre });

      if (movies.length === 0) {
        return res
          .status(404)
          .send(
            `Error: no movies found with the ${req.params.Genre} genre type.`
          );
      } else {
        res.status(201).json(movies);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    }
  }
);

// Get data about director
app.get(
  "/movies/directors/:Director",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Director.Name": req.params.Director })
      .then((movies) => {
        if (movies.length == 0) {
          return res
            .status(404)
            .send(
              "Error: no movies found with the director " +
                req.params.Director +
                " name"
            );
        } else {
          res.status(201).json(movies);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Get a list of all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//POST // CREATE requests

///trying example from tutor to see if it works
// app.post("/register", (req, res) => {
//   const { username, password, Email, Birthday } = req.body;

//   // Search to see if a user with the requested username already exists
//   Users.findOne({ Username: username })
//     .then((existingUser) => {
//       if (existingUser) {
//         // If the user is found, send a response that it already exists
//         return res.status(400).json({ error: "Username already exists." });
//       } else {
//         // Hash the password and create the user
//         bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
//           if (err) {
//             return res.status(500).json({ error: "Failed to hash password." });
//           }
//           Users.create({
//             Username: username,
//             Password: hashedPassword,
//             Email: Email,
//             Birthday: Birthday,
//           })
//             .then((newUser) => {
//               const userObject = newUser.toObject();
//               delete userObject.Password;
//               res.status(201).json({
//                 message: "User registered successfully!",
//                 user: userObject,
//               });
//             })
//             .catch((error) => {
//               console.error("Error creating user:", error);
//               res.status(500).json({ error: "Failed to create user." });
//             });
//         });
//       }
//     })
//     .catch((error) => {
//       console.error("Error checking existing user:", error);
//       res.status(500).json({ error: "Failed to check existing user." });
//     });
// });

//Add a user
app.post(
  "/users",
  // temp: commented out for debugging
  // [
  //   check('name', 'Username is required').isLength({min: 5}),
  //   check('name', 'Username contains non alphanumric characters - not allowed.').isAlphanumeric(),
  //   check('password', 'Password is required').not().isEmpty(),
  //   check('email', 'Email does not appear to be vaild').isEmail()
  // ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashPassword = users.hashPassword(req.body.password);
    await users
      .findOne({ name: req.body.name })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.name + " already exists");
        } else {
          users
            .create({
              name: req.body.name,
              password: hashPassword,
              email: req.body.email,
              birthday: req.body.birthday,
            })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send("Error " + err);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error " + error);
      });
  }
);

//PUT // UPDATE requests
//Update a user's info, by username
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  // [
  //   check('username', 'Username is required').isLength({min: 5}),
  //   check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  //   check('password', 'Password is required').not().isEmpty(),
  //   check('email', 'Email does not appear to be valid').isEmail()
  // ],
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.username !== req.params.username) {
      return res.status(400).send("Permission denied");
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// POST // CREATE
//add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);
//DELETE
//remove movies from users array
// Remove a movie to a user's list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("Error: User not found");
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//DELETE // delete user by id
// Remove a movie to a user's list of favorites
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res
            .status(404)
            .send("User " + req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Computer says NO!." });
});

//listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}.`);
});
