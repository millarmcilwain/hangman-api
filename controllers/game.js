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
  res.status(201).json({newGameId: newGameId});
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

  let game = games[gameId];

  if (!game) return res.sendStatus(404);

  if (!letter || letter.length != 1) {
    return res.status(400).json({
      Message: 'Guess must be supplied with 1 letter',
      ...clearUnmaskedWord(game),
    });
  }

  if (game.word.includes(letter) || game.incorrectGuesses.includes(letter)) {
    return res.status(400).json({
      Message: `You have already submitted a guess with the letter: ${letter}!`,
      ...clearUnmaskedWord(game),
    });
  }

  if (checkLetterAgainstGame(game, letter)) {
    const lettersToReplace = returnIndexArrayMatchingCharacters(
      game,
      letter.toLowerCase()
    );

    updateMaskedGameWord(lettersToReplace, letter, game);

    if (!checkWordCompletion(game.word)) {
      game.status = 'Won';
      return res
        .status(200)
        .json({ ...clearUnmaskedWord(game), message: 'Winner! Well done!' });
    } else {
      return res.status(200).json(clearUnmaskedWord(game));
    }
  } else {
    if (checkAndDecrementGuessTotal(game)) {
      game.incorrectGuesses.push(letter);
      return res.status(200).json({
        ...clearUnmaskedWord(game),
        message: 'Incorrect guess! Try again',
      });
    } else {
      game.status = 'Lost';
      return res
        .status(200)
        .json({
          ...clearUnmaskedWord(game),
          message: 'Game lost! Better luck next time!',
        });
    }
  }
};

const checkLetterAgainstGame = (game, letter) => {
  return game.unmaskedWord.toLowerCase().includes(letter);
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
  let wordArray = game.word.split('');

  indexes.forEach((letterIndex) => {
    wordArray[letterIndex] = letter;
  });

  game.word = wordArray.join('');
};

const checkWordCompletion = (word) => {
  return word.includes('_');
};

const checkAndDecrementGuessTotal = (game) => {
  game.remainingGuesses--;

  return game.remainingGuesses > 0;
};



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
  updateMaskedGameWord,
  checkWordCompletion,
  checkAndDecrementGuessTotal,
};
