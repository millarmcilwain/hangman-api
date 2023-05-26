const { v4: uuid } = require('uuid');

const words = ['Banana', 'Canine', 'Unosquare', 'Airport'];
const games = {};
const GUESS_LIMIT = 6;

const retrieveWord = () => words[Math.floor(Math.random() * words.length)];

const clearUnmaskedWord = (game) => {
  const withoutUnmasked = {
    ...game,
  };
  delete withoutUnmasked.unmaskedWord;
  return withoutUnmasked;
};

const createGame = (req, res) => {
  const newGameWord = retrieveWord();
  const newGameId = uuid();
  const newGame = {
    remainingGuesses: GUESS_LIMIT,
    unmaskedWord: newGameWord,
    word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, '_'),
    status: 'In Progress',
    incorrectGuesses: [],
  };

  games[newGameId] = newGame;
  res.send(newGameId);
};

function getGame(req, res) {
  const { gameId } = req.params;

  var game = games[gameId];
  if (!game) {
    return res.sendStatus(404);
  }

  res.status(200).json(clearUnmaskedWord(game));
}

const createGuess = (req, res) => {
  const { gameId } = req.params;
  const { letter } = req.body;

  var game = games[gameId];

  if (!game) return res.sendStatus(404);

  if (!letter || letter.length != 1) {
    return res.status(400).json({
      Message: 'Guess must be supplied with 1 letter',
    });
  }

  if (checkLetterAgainstGame(game, letter)) {

    const lettersToReplace = returnIndexArrayMatchingCharacters(game.word.toLowerCase(), letter.toLowerCase())

    return res.status(200).json({
      remainingGuesses: game.remainingGuesses,
      word: game.word.replaceAll(/[a-zA-Z0-9]/g, '_'),
      status: 'In Progress',
      incorrectGuesses: game.incorrectGuesses,
    });
  } else {
    //decrement user guess
    return res.status(200).json({ message: 'b' });
  }

  //return res.status(200).json(clearUnmaskedWord(game));
};

const checkLetterAgainstGame = (game, letter) => {
  if (game.unmaskedWord.includes(letter)) {
    return true;
  } else {
    return false;
  }
};

const returnIndexArrayMatchingCharacters = (string, character) => {
  let indexes = [];

  for (i = 0; i <= string.length; i++) {
    if (string.charAt(i) == character) {
      indexes.push(i);
    }
  }
  return indexes;
};

const updateMaskedGameWord = (indexes, letter, game) => {

  const wordArray=game.word.split('');

  indexes.forEach(letterIndex => {
    wordArray[letterIndex] = letter;
  });

  game.word = wordArray.join('');
}



// const updateGameDetails = () => {
//   return new Promise((resolve, reject) => {
//     try {
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

//check if body exists, convert to lower case, check body length? only take first value ensure letter value exists

const verifyGameID = (req, res, next) => {
  const { gameId } = req.params;

  if (!gameId)
    return res.status(404).json({
      Message:
        'A Game ID must be provided in the URL paramaters in order to check game information or submit a guess',
    });

  if (Object.hasOwn(games, gameId)) {
    next();
  } else {
    return res.status(404).json({
      Message: 'Game ID does not exist.',
    });
  }
};

const verifyGameStatus = (req, res, next) => {
  const { gameId } = req.params;

  if (
    !games[gameId] ||
    !games[gameId].status ||
    games[gameId].status !== 'In Progress'
  ) {
    return res.status(404).json({
      Message: `Game ID: ${gameId} has already been completed`,
    });
  } else {
    next();
  }
};

module.exports = {
  games,
  createGame,
  getGame,
  createGuess,
  verifyGameID,
  checkLetterAgainstGame,
  verifyGameStatus,
  returnIndexArrayMatchingCharacters,
  updateMaskedGameWord
};
