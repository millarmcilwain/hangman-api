const { v4: uuid } = require("uuid");


const words = ["Banana", "Canine", "Unosquare", "Airport"];
const games = {};
const GUESS_LIMIT= 6;

const retrieveWord = () => words[Math.floor(Math.random()*words.length)];

const clearUnmaskedWord = (game) => {
    const withoutUnmasked = { 
        ...game,
    };
    delete withoutUnmasked.unmaskedWord;
    return withoutUnmasked;
}

const createGame = (req, res) => {
  const newGameWord = retrieveWord();
  const newGameId = uuid();
  const newGame = {
    remainingGuesses: GUESS_LIMIT,
    unmaskedWord: newGameWord,
    word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, "_"),
    status: "In Progress",
    incorrectGuesses: [],
  };

  games[newGameId] = newGame;
  res.send(newGameId);
}

function getGame(req, res) { 
    const { gameId } = req.params;
    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) {
        return res.sendStatus(404); 
    }

    res.status(200).json(clearUnmaskedWord(game));
}

function createGuess(req, res) { 
    const { gameId } = req.params
    const { letter } = req.body;

    if (!gameId) return res.sendStatus(404);

    var game = games[gameId];
    if (!game) return res.sendStatus(404); 

    if (!letter || letter.length != 1) {
        return res.status(400).json({
            Message: "Guess must be supplied with 1 letter"
        })
    }

    // todo: add logic for making a guess, modifying the game and updating the status

    return res.status(200).json(clearUnmaskedWord(game));
}



const verifyGameID = (req, res, next) => {

    const { gameId } = req.params

    Object.hasOwn(games, gameId) ? next() : res.status(400).json({
        Message: 'Game ID does not exist.'
    });

}

module.exports = {
    createGame,
    getGame,
    createGuess,
    verifyGameID
  };