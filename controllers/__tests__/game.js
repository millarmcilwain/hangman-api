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

    it('should send a JSON response with a 404 status if the gameID is not present in the request', () => {
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

    it('should send a JSON response with a 404 status if the gameID does not exist', () => {
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

    it('should send a JSON response with a 404 status if the game status does not equal "In Progress"', () => {
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
    const testLetterFalse = 'x';
    const GUESS_LIMIT = 6;

    const testGame = {
      remainingGuesses: GUESS_LIMIT,
      unmaskedWord: newGameWord,
      word: newGameWord.replaceAll(/[a-zA-Z0-9]/g, '_'),
      status: 'In Progress',
      incorrectGuesses: [],
    };

    it('return true if the letter appears in the game chosen word', () => {
      expect(gameController.checkLetterAgainstGame(
        testGame,
        testLetterTrue
      )).toBeTruthy();
    });

    it('return false if the letter does not appear in the game chosen word', () => {
     
      expect(gameController.checkLetterAgainstGame(
        testGame,
        testLetterFalse
      )).toBeFalsy();
    });
  });

  describe('returnIndexArrayMatchingCharacters', () => {
    const string = 'banana';
    const testLetter1 = 'a';
    const testLetter2 = 'b';

    it('should return an array containing the array indexes of the letter "a" in "Banana"', () => {
  
      expect(gameController.returnIndexArrayMatchingCharacters(
        string,
        testLetter1
      )).toStrictEqual([1, 3, 5]);
    });

    it('should return an array containing the array indexes of the letter "b" in "Banana"', () => {
      expect(
        gameController.returnIndexArrayMatchingCharacters(string, testLetter2)
      ).toStrictEqual([0]);
    });
  });

  describe('updateMaskedGameWord', () => {
    it('return the masked word banana with only the character "a" showing', () => {
      const letter = 'a';
      const indexes = [1, 3, 5];
      const games = { word: '_____' };

      gameController.updateMaskedGameWord(indexes, letter, games);

      expect(games.word).toBe('_a_a_a');
    });
  });

  describe('checkWordCompletion', () => {
    const testWord1 = 'Banana';
    const testWord2 = '_anana';

    it('should return true if an underscore is present in the word', () => {
      expect(gameController.checkWordCompletion(testWord1)).toBeTruthy;
    });

    it('should return false if an underscore is not present in the word', () => {
      expect(gameController.checkWordCompletion(testWord2)).toBeFalsy;
    });
  });

  describe('checkAndDecrementGuessTotal', ()=>{

    beforeEach(() => {
      gameController.games[mockId]={remainingGuesses:{}}
    });

    it('should decrement game.remainingGuesses by 1 and return true if game.remainingGuesses is greater than 0',()=>{
      gameController.games[mockId].remainingGuesses=2;
      expect(gameController.checkAndDecrementGuessTotal(gameController.games[mockId])).toBeTruthy;
      expect(gameController.games[mockId].remainingGuesses).toStrictEqual(1);
    });

    it('should decrement game.remainingGuesses by 1 and return false when game.remainingGuesses is equal to 0',()=>{
      gameController.games[mockId].remainingGuesses=1;
      expect(gameController.checkAndDecrementGuessTotal(gameController.games[mockId])).toBeTruthy;
      expect(gameController.games[mockId].remainingGuesses).toStrictEqual(0);
    });
  });

});
