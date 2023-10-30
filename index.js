require("dotenv").config(); //To load environment variables from a .env file into process.env.

const express = require("express"); //Framework for building web applications and APIs.
const bodyParser = require("body-parser"); //Middleware to parse JSON and urlencoded data
const morgan = require("morgan"); // for logging HTTP requests to a file named "log.txt".
const fs = require("fs"); //Node.js file system module for working with files.
const path = require("path"); //Node.js module that provides utilities for working with file and directory paths.ncu --upgrade.
const uuid = require("uuid"); // Module for the creation of RFC4122 UUIDs.
const mongoose = require("mongoose"); // MongoDB object modeling tool designed to work in an asynchronous environment.
const Models = require("./models.js"); //Importing Mongoose models (I have defined in the Mongoose schemas in a "models.js" file).

// Defining Models // Import Models
const Movies = Models.Movie;
const Users = Models.User;

// Initialize express app
const app = express();
const { check, validationResult } = require("express-validator"); //Module for validating data.

//Connect to MongoDB database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cors = require("cors"); //Middleware for providing a Connect/Express middleware that can be used to enable CORS with various options.
app.use(cors()); //Allowing all domains to make requests to your API.

// Authentication Module
let auth = require("./auth")(app);

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

/////////////////////////CORS /////////////////////////

//GET // READ requests
app.get("/", (req, res) => {
  // res.send("Welcome to myFlix!");
  res.json({ message: "Welcome to myFlix!" });
});

//return a list of ALL movies to the user
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        res.status(500).json({
          error: "Internal Server Error",
          message: "Problem occurred when retrieving movie titles.",
        });
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
            .json({ error: req.params.Title + " was not found" });
        }
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to retrive movie title",
        });
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
        return res.status(404).json({
          error: `No movies found with the ${req.params.Genre} genre type.`,
        });
      } else {
        res.status(200).json(movies);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve movies by genre",
      });
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
          return res.status(404).json({
            error:
              "No movies found with the director " +
              req.params.Director +
              " name",
          });
        } else {
          res.status(200).json(movies);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal Server Error",
          message:
            "Failed to retrieve movies directed by the specified director",
        });
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
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to retrieve user information",
        });
      });
  }
);

// Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal server error",
          message: "Failed to retrieve user information",
        });
      });
  }
);

//POST // CREATE requests

//Add a user
app.post(
  "/users",
  [
    // Validation
    check(
      "Username",
      "Username must be at least 5 characters in length"
    ).isLength({ min: 4 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is empty").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // Check the validation object for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, return a 422 status code with the error messages in JSON
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          // If the username already exists, return a 400 status code with a JSON message
          return res
            .status(400)
            .json({ message: `${req.body.Username} already exists` });
        }

        // If the username is unique, create a new user
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            // Return the created user with a 201 status code in JSON format
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            // If there is an unexpected error during user creation, return a 500 status code with a JSON error message
            res.status(500).json({
              error: "Internal Server Error",
              message: "Error creating user",
            });
          });
      })
      // If there is an unexpected error during the user lookup, return a 500 status code with a JSON error message
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal server error",
          message: "Failed to retrieve user information",
        });
      });
  }
);

//PUT // UPDATE requests
//Update a user's info, by username
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 4 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
  ],
  (req, res) => {
    // check the validation object for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).json({ error: "User was not found" });
        }
        res.json({ user: updatedUser });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal server error",
          message: "Failed to update user information",
        });
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
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to add the specified movie",
        });
      });
  }
);
// DELETE requests
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
          return res.status(404).json({ error: "User not found" });
        } else {
          res.json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Internal Server Error occurred while deleting the user",
        });
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
          return res
            .status(404)
            .json({ error: `User ${req.params.Username} was not found` });
        } else {
          res.json({ message: `${req.params.Username} was deleted.` });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to delete the specified user",
        });
      });
  }
);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Computer says NO! We have an internal error please check your code",
  });
});

//listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is up and running and listening on port ${PORT}.`);
});
