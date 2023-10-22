const express = require("express"); //Framework for building web applications and APIs.
const bodyParser = require("body-parser"); //Middleware to parse JSON and urlencoded data
const morgan = require("morgan"); // for logging HTTP requests to a file named "log.txt".
const fs = require("fs"); //Node.js file system module for working with files.
const path = require("path"); //Node.js module that provides utilities for working with file and directory paths.
const uuid = require("uuid"); // Module for the creation of RFC4122 UUIDs.
const mongoose = require("mongoose"); // MongoDB object modeling tool designed to work in an asynchronous environment.
const Models = require("./models.js"); //Importing Mongoose models (presumably, you have defined your Mongoose schemas in a "models.js" file).
const bcrypt = require("bcrypt"); //Library for hashing passwords.
const saltRounds = 10;

// Defining Models // Import Models
const Movies = Models.Movie;
const Users = Models.User;

// Initialize express app
const app = express();

// Connect to MongoDB database
mongoose.connect("mongodb://localhost:27017/myflix2DB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Authentication Module
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
app.use(express.urlencoded({ extended: true })); //Parses incoming requests with URL-encoded payloads.
/////////////////////////  AUTHENTICATION /////////////////////////

//GET // READ requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

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
//Add a user
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      }
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
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
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//PUT // UPDATE requests
//Update a user's info, by username
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
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
app.use((err, req, res, next) => {
  console.log(err);
  console.error(err.stack);
});

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
