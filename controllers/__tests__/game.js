const gameController = require('../game');

const mockId = 'fda56100-0ddb-4f06-9ea4-7c1919ff6d2f';
jest.mock('uuid', () => ({ v4: () => mockId }));

describe('game controller', () => {
  describe('retrieveWord', () => {
    it('should return single word that is present in word array', () => {
      const result = gameController.retrieveWord();

      expect(['Banana', 'Airport', 'Unosquare', 'Canine']).toContain(result);
    });
  });

  describe('createGame', () => {
    it('Should return 200 response and identifier when game created', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.createGame(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ newGameId: `${mockId}` });
    });
  });

  describe('getGame', () => {
    it('should return game object with 200 status', () => {
      const req = { params: { gameId: mockId } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      gameController.games[mockId] = {
        remainingGuesses: 6,
        word: 'Banana',
        status: 'In Progress',
        incorrectGuesses: [],
      };

      gameController.getGame(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        remainingGuesses: 6,
        word: 'Banana',
        status: 'In Progress',
        incorrectGuesses: [],
      });
    });
  });

  describe('createGuess', () => {
    const testLetterLowercase = 'c';
    const testLetterUppercase = 'X';

    beforeEach(() => {
      let req = {};
      let res = {};

      gameController.games[mockId] = {
        remainingGuesses: 6,
        unmaskedWord: 'Canine',
        word: '______',
        status: 'In Progress',
        incorrectGuesses: [],
      };
    });

    it('should return a JSON and 500 status when a game with the supplied ID cannot be found ', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterLowercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      delete gameController.games[mockId];

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'There was an issue processing this request',
      });
    });

    it('should return a JSON and 400 status if no letter paramter is supplied in the body of the request ', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: '' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Guess must be supplied with 1 letter',
        remainingGuesses: 6,
        word: '______',
        status: 'In Progress',
        incorrectGuesses: [],
      });
    });

    it('should return a JSON and 400 status if a previous correct guess with the supplied letter has been made ', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterLowercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      gameController.games[mockId].word = 'C_____';

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        Message: `You have already submitted a guess with the letter: ${testLetterLowercase}!`,
        remainingGuesses: 6,
        word: 'C_____',
        status: 'In Progress',
        incorrectGuesses: [],
      });
    });

    it('should return a JSON and 400 status if a previous incorrect guess with the supplied letter has been made ', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterLowercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      gameController.games[mockId].incorrectGuesses = ['c'];

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        Message: `You have already submitted a guess with the letter: ${testLetterLowercase}!`,
        remainingGuesses: 6,
        word: '______',
        status: 'In Progress',
        incorrectGuesses: ['c'],
      });
    });

    it('should return a JSON, 200 status and set status to Won when the game word has been fully guessed', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterLowercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.games[mockId].word = '_anine';

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Winner! Well done!',
        remainingGuesses: 6,
        word: 'Canine',
        status: 'Won',
        incorrectGuesses: [],
      });
    });

    it('should return a JSON and 200 status when a letter in the selected game word is guessed', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterLowercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Correct guess!',
        remainingGuesses: 6,
        word: 'C_____',
        status: 'In Progress',
        incorrectGuesses: [],
      });
    });

    it('should return a JSON and 200 status, decrement the remainingGuesses value by 1 and add the supplied letter to the incorrectGuesses array when an incorrect letter is supplied', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterUppercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Incorrect guess! Try again',
        remainingGuesses: 5,
        word: '______',
        status: 'In Progress',
        incorrectGuesses: ['X'],
      });
    });

    it('should return a JSON, 200 status, and set the status to 0 if remainingGuesses = 0', () => {
      const req = {
        params: { gameId: mockId },
        body: { letter: testLetterUppercase },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.games[mockId].remainingGuesses = 1;

      gameController.createGuess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Game lost! Better luck next time!',
        remainingGuesses: 0,
        word: '______',
        status: 'Lost',
        incorrectGuesses: ['X'],
      });
    });
  });

  describe('clearUnmaskedWord', () => {
    const newGameWord = 'Banana';

    game = {
      remainingGuesses: 6,
      unmaskedWord: newGameWord,
      word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, '_'),
      status: 'In Progress',
      incorrectGuesses: [],
    };

    it('should return object without unmaskedWord property', () => {
      const results = gameController.clearUnmaskedWord(game);

      expect(results).toHaveProperty('remainingGuesses');
      expect(results).toHaveProperty('word');
      expect(results).toHaveProperty('status');
      expect(results).toHaveProperty('incorrectGuesses');
      expect(results).not.toHaveProperty('unmaskedWord');
    });
  });

  describe('verifyGameID', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = { params: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    gameController.games[mockId] = {};

    it('should return a JSON with 404 if the gameID is not present in the request', () => {
      gameController.verifyGameID(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message:
          'A Game ID must be provided in the URL paramaters in order to check game information or submit a guess',
      });
    });

    it('should call next() if gameId exists', () => {
      req = { params: { gameId: mockId } };

      gameController.verifyGameID(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return JSON with 404 if gameID does not exist', () => {
      req = { params: { gameId: '123' } };

      gameController.verifyGameID(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message: 'Game ID does not exist.',
      });
    });
  });

  describe('verifyGameStatus', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = { params: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      gameController.games[mockId] = { status: '' };
    });

    it('should return JSON with 404 if game.status equals "Won"', () => {
      req = { params: { gameId: mockId } };

      gameController.games[mockId] = { status: 'Won' };

      gameController.verifyGameStatus(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message: `Game ID: ${mockId} has already been completed`,
      });
    });

    it('should return JSON with 404 if game.status equals "Lost"', () => {
      req = { params: { gameId: mockId } };

      gameController.games[mockId] = { status: 'Lost' };

      gameController.verifyGameStatus(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message: `Game ID: ${mockId} has already been completed`,
      });
    });

    it('should call next if game status equals "In Progress"', () => {
      req = { params: { gameId: mockId } };

      gameController.games[mockId] = { status: 'In Progress' };

      gameController.verifyGameStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(404);
      expect(res.json).not.toHaveBeenCalledWith({
        Message: `Game ID: ${mockId} has already been completed`,
      });
    });
  });

  describe('checkLetterAgainstGame', () => {
    const newGameWord = 'Banana';
    const testLetterTrue = 'a';
    const testLetterTrueUpperCase = 'A';
    const testLetterFalse = 'x';
    const testLetterFalseUpperCase = 'X';

    const GUESS_LIMIT = 6;

    const testGame = {
      remainingGuesses: GUESS_LIMIT,
      unmaskedWord: newGameWord,
      word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, '_'),
      status: 'In Progress',
      incorrectGuesses: [],
    };

    it('return true if the letter (lowercase) appears in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterTrue)
      ).toBe(true);
    });

    it('return true if the letter (uppercase) appears in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterTrueUpperCase)
      ).toBe(true);
    });

    it('return false if the letter (lowercase) does not appear in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterFalse)
      ).toBe(false);
    });

    it('return false if the uppercase (uppercase) letter does not appear in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(
          testGame,
          testLetterFalseUpperCase
        )
      ).toBe(false);
    });
  });

  describe('returnIndexArrayMatchingCharacters', () => {
    const testString = 'Banana';
    const testLetterLowercase1 = 'a';
    const testLetterUppercase2 = 'A';
    const testLetterLowercase3 = 'b';
    const testLetterLowercase4 = 'x';
    const testLetterUppercase5 = 'X';

    it('should return array with array indexes of testLetterLowercase1 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterLowercase1
        )
      ).toEqual([1, 3, 5]);
    });

    it('should return array with array indexes of testLetterUppercase2 (uppercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterUppercase2
        )
      ).toEqual([1, 3, 5]);
    });

    it('should return array with array indexes of testLetterLowercase3 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterLowercase3
        )
      ).toEqual([0]);
    });

    it('should return empty array with array indexes of testLetterLowercase4 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterLowercase4
        ).length
      ).toEqual(0);
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterLowercase4
        )
      ).toEqual([]);
    });

    it('should return empty array with array indexes of testLetterUppercase5 (uppercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterUppercase5
        ).length
      ).toEqual(0);
      expect(
        gameController.returnIndexArrayMatchingCharacters(
          testString,
          testLetterUppercase5
        )
      ).toEqual([]);
    });
  });

  describe('updateMaskedGameWord', () => {
    beforeEach(() => {
      indexes = [1, 3, 5];
      game = { word: '_____', unmaskedWord: 'Banana' };
    });

    it('should return the masked word with all instances of letter (lowercase) showing', () => {
      const letter = 'a';

      gameController.updateMaskedGameWord(indexes, game);

      expect(game.word).toBe('_a_a_a');
    });

    it('should return the masked word with all instances of letter (uppercase) showing', () => {
      const letter = 'A';
      const indexes = [1, 3, 5];
      const game = { word: '_____', unmaskedWord: 'Banana' };

      gameController.updateMaskedGameWord(indexes, game);

      expect(game.word).toBe('_a_a_a');
    });
  });

  describe('checkWordCompletion', () => {
    const testWord1 = '_anana';
    const testWord2 = '_a_a_a';
    const testWord3 = 'Banana';

    it('should return true if an underscore is present in the word', () => {
      expect(gameController.checkWordCompletion(testWord1)).toBe(true);
    });

    it('should return true if multiple underscores are present in the word', () => {
      expect(gameController.checkWordCompletion(testWord2)).toBe(true);
    });

    it('should return false if an underscore is not present in the word', () => {
      expect(gameController.checkWordCompletion(testWord3)).toBe(false);
    });
  });

  describe('checkAndDecrementGuessTotal', () => {
    beforeEach(() => {
      gameController.games[mockId] = {};
    });

    it('should decrement game.remainingGuesses by 1 and return true if game.remainingGuesses is greater than 0', () => {
      gameController.games[mockId].remainingGuesses = 2;
      expect(
        gameController.checkAndDecrementGuessTotal(gameController.games[mockId])
      ).toBe(true);
      expect(gameController.games[mockId].remainingGuesses).toEqual(1);
    });

    it('should decrement game.remainingGuesses by 1 and return false when game.remainingGuesses is equal to 0', () => {
      gameController.games[mockId].remainingGuesses = 1;
      expect(
        gameController.checkAndDecrementGuessTotal(gameController.games[mockId])
      ).toBe(false);
      expect(gameController.games[mockId].remainingGuesses).toEqual(0);
    });
  });

  describe('checkCorrectGuessHistory', () => {
    const letterLowercase = 'b';
    const letterUppercase = 'B';
    const wordTrue = 'b____';
    const wordFalse = 'c_____';

    it('should return true if the letter (lowercase) is present in the game word', () => {
      const game = { word: wordTrue };

      expect(
        gameController.checkCorrectGuessHistory(game, letterLowercase)
      ).toBe(true);
    });

    it('should return true if the letter (uppercase) is present in the game word', () => {
      const game = { word: wordTrue };

      expect(
        gameController.checkCorrectGuessHistory(game, letterUppercase)
      ).toBe(true);
    });

    it('should return false if the letter is not present in the game word', () => {
      const game = { word: wordFalse };

      expect(
        gameController.checkCorrectGuessHistory(game, letterLowercase)
      ).toBe(false);
    });
  });

  describe('checkIncorrectGuessHistory', () => {
    const letter1 = 'B';
    const letter2 = 'x';

    const game = { incorrectGuesses: ['a', 'B', 'c'] };
    const emptyGame = { incorrectGuesses: [] };

    it('should return true if the letter is present in the incorrectGuesses array', () => {
      expect(gameController.checkIncorrectGuessHistory(game, letter1)).toBe(
        true
      );
    });

    it('should return false if the letter is not present in the incorrectGuesses array', () => {
      expect(gameController.checkIncorrectGuessHistory(game, letter2)).toBe(
        false
      );
    });

    it('should return false if the incorrectGuessesArray is empty', () => {
      expect(
        gameController.checkIncorrectGuessHistory(emptyGame, letter2)
      ).toBe(false);
    });
  });

  describe('deleteGame', () => {
    const req = { params: { gameId: mockId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    gameController.games[mockId] = {};

    it('should return a JSON response with a 200 status if the game has sucessfully been removed', () => {
      gameController.deleteGame(req, res);
      expect(gameController.games).not.toHaveProperty(mockId);
      expect(gameController.games).toEqual({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Message: `Game ID: ${mockId} was successfully removed`,
      });
    });
  });
});
