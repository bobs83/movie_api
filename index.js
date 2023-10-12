const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let topMovies = [
  {
    title: "The Matrix (1999)",
    author: "Lana and Lilly Wachowski)",
  },
  {
    title: "The tourist",
    author: "Jérôme Salle",
  },
  {
    title: "Inception",
    author: "Christopher Nolan",
  },
  {
    title: "The others",
    author: "Alejandro Amenábar",
  },
  {
    title: "All about my mother",
    author: "Pedro Almodóvar",
  },
  {
    title: "Lionking",
    author: "Rob Minkoff",
  },
  {
    title: "The fith element",
    author: "Luc Besson",
  },
  {
    title: "Star Wars: Episode V",
    author: "Irvin Kershner",
  },
  {
    title: "Fucking Åmål",
    author: "Lukas Moodysson",
  },
  {
    title: "Amélie",
    author: "Jean-Pierre Jeunet",
  },
];

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

// USE requests
app.use(bodyParser.json());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));

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
app.get("/movies/director/:directorName", (req, res) => {
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
app.post("/users", (req, res) => {
  const newUser = req.body;
  if (!newUser.name) {
    const message = "Name is required";
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    students.push(newUser);
    res.status(201).json(newUser);
  }
});

//PUT // UPDATE requests
app.put("/users/:name", (req, res) => {
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
app.post("/users/:id/moviesTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id == id);
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(`${movieTitle} has been added to user ${id}'s list`);
  } else {
    res.status(400).send("No such user found");
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
      .json(`${movieTitle} has been removed from user ${id}'s list`);
  } else {
    res.status(400).send("No such user found");
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
