const express = require("express"),
  fs = require("fs"),
  morgan = require("morgan"),
  path = require("path");

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
// USE requests
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));

// setup the logger morgan using the write stream created above
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke!");
});

//  GET requests
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("These are my favorite movies!");
});

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
