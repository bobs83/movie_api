const express = require("express"),
  fs = require("fs"),
  morgan = require("morgan"),
  path = require("path");

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let topMovies = [];

// USE requests

// setup the logger morgan using the write stream created above
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("public"));

// error handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//  GET requests
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("These are my favorite movies!");
});

app.get("/documentation.html", (req, res) => {
  res.sendFile("public", { root: __dirname });
});

app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});

//listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
