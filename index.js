const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { json, urlencoded } = require("body-parser");
const gamesController = require("./controllers/game");


const app = express();
app.use(cors());
app.use(json());
app.use(morgan("tiny"));
app.use(urlencoded({ extended: true }));

app.post("/games", gamesController.createGame);
app.get("/games/:gameId", gamesController.verifyGameID, gamesController.getGame);
app.post("/games/:gameId/guesses",gamesController.verifyGameID, gamesController.verifyGameStatus, gamesController.createGuess);
app.delete('/games/remove/:gameId/',gamesController.verifyGameID, gamesController.deleteGame);

app.listen(4567);