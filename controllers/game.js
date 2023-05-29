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
  res.status(201).json({ newGameId: newGameId });
};

function getGame(req, res) {
  const { gameId } = req.params;

  var game = games[gameId];
  if (!game) {
    return res.sendStatus(404);
  }

  return res.status(200).json(clearUnmaskedWord(game));
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

  if (checkCorrectGuessHistory(game, letter) || checkIncorrectGuessHistory(game, letter)) {
    return res.status(400).json({
      Message: `You have already submitted a guess with the letter: ${letter}!`,
      ...clearUnmaskedWord(game),
    });
  }

  if (checkLetterAgainstGame(game, letter)) {
    const lettersToReplace = returnIndexArrayMatchingCharacters(
      game.unmaskedWord,
      letter
    );

    updateMaskedGameWord(lettersToReplace, letter, game);

    if (!checkWordCompletion(game.word)) {
      game.status = 'Won';
      return res
        .status(200)
        .json({ Message: 'Winner! Well done!', ...clearUnmaskedWord(game) });
    } else {
      return res
        .status(200)
        .json({ Message: 'Correct guess!', ...clearUnmaskedWord(game) });
    }
  } else {
    if (checkAndDecrementGuessTotal(game)) {
      game.incorrectGuesses.push(letter);
      return res.status(200).json({
        Message: 'Incorrect guess! Try again',
        ...clearUnmaskedWord(game),
      });
    } else {
      game.status = 'Lost';
      return res.status(200).json({
        Message: 'Game lost! Better luck next time!',
        ...clearUnmaskedWord(game),
      });
    }
  }
};

const deleteGame = (req, res) => {
  try {
    const { gameId } = req.params;

    delete games[gameId];

    console.log('test');
    console.log(games)
    return res.status(200).json({
      Message: `Game ID: ${gameId} was successfully removed`,
    });
  } catch (err) {
    //errorResponse(res);
  }
};

const checkLetterAgainstGame = (game, letter) => {
  return game.unmaskedWord.toLowerCase().includes(letter.toLowerCase());
};

const returnIndexArrayMatchingCharacters = (string, character) => {
  let indexes = [];

  for (i = 0; i <= string.length; i++) {
    if (string.toLowerCase().charAt(i) == character.toLowerCase()) {
      indexes.push(i);
    }
  }
  return indexes;
};

const updateMaskedGameWord = (indexes, letter, game) => {
  let wordArray = game.word.split('');

  indexes.forEach((letterIndex) => {
    wordArray[letterIndex] = game.unmaskedWord.charAt(letterIndex);
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

const checkCorrectGuessHistory = (game, letter) => {

  return game.word.toLowerCase().includes(letter.toLowerCase());

}

const checkIncorrectGuessHistory = (game, letter) => {

  game.incorrectGuesses.forEach((incorrectGuess)=>{
   return (incorrectGuess.toLowerCase() == letter.toLowerCase())
  });

}

//middleware
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

const errorResponse = (res) => {
  return res.status(500).json({
    Message: 'There was an issue processing this request',
  });
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
  deleteGame,
  checkCorrectGuessHistory,
  checkIncorrectGuessHistory
};
