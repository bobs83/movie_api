const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myflix2DB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));

let users = [
  {
    id: 1,
    name: "Lotte",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Sven",
    favoriteMovies: ["The French Dispatch"],
  },
];

let movies = [
  {
    Title: "The French Dispatch",
    Description:
      'A love letter to journalists set in an outpost of an American newspaper in a fictional twentieth century French city that brings to life a collection of stories published in "The French Dispatch Magazine".',
    Genre: {
      Name: "Comedy",
      Description:
        "Is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter.",
    },
    Director: {
      Name: "Wes Anderson",
      Bio: "Wesley Wales Anderson was born in Houston, Texas. During childhood, Anderson also began writing plays and making super-8 movies. Anderson attended the University of Texas in Austin, where he majored in philosophy. It was there that he met Owen Wilson. They became friends and began making short films, some of which aired on a local cable-access station.",
      Birth: 1969.0,
    },
    ImageURL: "www.google.com",
    Featured: false,
  },
];

//GET // READ requests

// Get a list of all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// Get data about a single movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No such movie found");
  }
});

// Get data about genre
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("No such genre found");
  }
});

// Get data about director
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("No such director found");
  }
});

//POST // CREATE requests
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
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
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//PUT // UPDATE requests
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
});

// POST // CREATE //add a movie to a user's list of favorites
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res
      .status(200)
      .json(`${movieTitle} has been added to user ${id}'s favorite list`);
  } else {
    res.status(400).send("no such movie found");
  }
});

//DELETE  //remove movies from users array
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .json(`${movieTitle} has been removed from user ${id}'s favorite list`);
  } else {
    res.status(400).send("Movie cant be found in user's list");
  }
});

//DELETE // delete user by id
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).json(`${id} has been deleted`);
  } else {
    res.status(400).send("No such user found");
  }
});

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
