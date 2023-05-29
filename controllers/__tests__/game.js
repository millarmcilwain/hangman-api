const gameController = require('../game');

const mockId = 'fda56100-0ddb-4f06-9ea4-7c1919ff6d2f';
jest.mock('uuid', () => ({ v4: () => mockId }));

describe('game controller', () => {
  describe('createGame', () => {
    it('Should return identifier when game created', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gameController.createGame(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
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

    it('should return a JSON response with a 404 status if the gameID is not present in the request', () => {
      gameController.verifyGameID(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message:
          'A Game ID must be provided in the URL paramaters in order to check game information or submit a guess',
      });
    });

    it('should call next() if the gameId exists', () => {
      req = { params: { gameId: mockId } };

      gameController.verifyGameID(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return a JSON response with a 404 status if the gameID does not exist', () => {
      req = { params: { gameId: '123' } };

      gameController.verifyGameID(req, res, next);

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

    it('should return a JSON response with a 404 status if the game status does not equal "In Progress"', () => {
      req = { params: { gameId: mockId } };

      gameController.games[mockId] = { status: 'Won' };

      gameController.verifyGameStatus(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Message: `Game ID: ${mockId} has already been completed`,
      });
    });

    it('should call next if game status equa;s "In Progress"', () => {
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

    const GUESS_LIMIT = 6;

    const testGame = {
      remainingGuesses: GUESS_LIMIT,
      unmaskedWord: newGameWord,
      word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, '_'),
      status: 'In Progress',
      incorrectGuesses: [],
    };

    it('return true if the lowercase letter appears in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterTrue)
      ).toBe(true);
    });

    it('return true if the uppercase letter appears in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterTrueUpperCase)
      ).toBe(true);
    });

    it('return false if the letter does not appear in the game chosen word', () => {
      expect(
        gameController.checkLetterAgainstGame(testGame, testLetterFalse)
      ).toBe(false);
    });
  });

  describe('returnIndexArrayMatchingCharacters', () => {
    
    const testString = 'Banana';
    const testLetter1 = 'a';
    const testLetter2 = 'A';
    const testLetter3 = 'b';
    const testLetter4 = 'X';

    it('should return array with array indexes of testLetter1 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(testString, testLetter1)
      ).toEqual([1, 3, 5]);
    });

    it('should return array with array indexes of testLetter2 (uppercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(testString, testLetter2)
      ).toEqual([1, 3, 5]);
    });

    it('should return array with array indexes of testLetter3 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(testString, testLetter3)
      ).toEqual([0]);
    });

    it('should return empty array with array indexes of testLetter3 (lowercase) in testString', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(testString, testLetter4).length
      ).toEqual(0);
      expect(
        gameController.returnIndexArrayMatchingCharacters(testString, testLetter4)
      ).toEqual([]);
    });

  });

  describe('updateMaskedGameWord', () => {

    beforeEach(() => {
      indexes = [1, 3, 5];
      game = { word: '_____', unmaskedWord: 'Banana' };
    });


    it('return the masked word banana with only the lowercase letter "a" showing', () => {
      const letter = 'a';
      
      gameController.updateMaskedGameWord(indexes, letter, game);

      expect(game.word).toBe('_a_a_a');
    });

    it('return the masked word banana with only the lowercase letter "a" showing', () => {
      const letter = 'A';
      const indexes = [1, 3, 5];
      const game = { word: '_____', unmaskedWord: 'Banana' };

      gameController.updateMaskedGameWord(indexes, letter, game);

      expect(game.word).toBe('_a_a_a');
    });
  });

  describe('checkWordCompletion', () => {
    const testWord1 = '_anana';
    const testWord2 = 'Banana';

    it('should return true if an underscore is present in the word', () => {
      expect(gameController.checkWordCompletion(testWord1)).toBe(true);
    });

    it('should return false if an underscore is not present in the word', () => {
      expect(gameController.checkWordCompletion(testWord2)).toBe(false);
    });
  });

  describe('checkAndDecrementGuessTotal', () => {
    beforeEach(() => {
      gameController.games[mockId] = { remainingGuesses: {} };
    });

    it('should decrement game.remainingGuesses by 1 and return true if game.remainingGuesses is greater than 0', () => {
      gameController.games[mockId].remainingGuesses = 2;
      expect(
        gameController.checkAndDecrementGuessTotal(gameController.games[mockId])
      ).toBe(true);
      expect(gameController.games[mockId].remainingGuesses).toStrictEqual(1);
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
    const letter1 = 'B';
    const wordTrue = 'b____';
    const wordFalse = 'c_____';

    it('should return true if the letter is present in the game word', () => {
      const game = { word: wordTrue };

      expect(gameController.checkCorrectGuessHistory(game, letter1)).toBe(true);
    });

    it('should return false if the letter is not present in the game word', () => {
      const game = { word: wordFalse };

      expect(gameController.checkCorrectGuessHistory(game, letter1)).toBe(
        false
      );
    });
  });

  describe('deleteGame', () => {
    req = { params: { gameId: mockId } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    gameController.games[mockId] = {};

    it('should return a JSON response with a 200 status if the game has sucessfully been removed', () => {
      gameController.deleteGame();

      expect(gameController.games).not.toContain(mockId);
    });
  });
});
