const gameController = require('../game');

const mockId = 'fda56100-0ddb-4f06-9ea4-7c1919ff6d2f';
jest.mock('uuid', () => ({ v4: () => mockId }));


describe('game controller', () => {
  describe('createGame', () => {
    it('Should return identifier when game created', () => {
      const req = {};
      const res = {
        send: jest.fn(),
      };

      gameController.createGame(req, res);

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(mockId);
    });
  });


  describe('verifyGameID', () => {

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    gameController.games[mockId] = {};

    it('should call next() if the gameId exists', () => {
      const req = { params: { gameId: mockId } };
     
      gameController.verifyGameID(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();

    });
    
    it ('should send a JSON response with a 404 status if the gameID does not exist', ()=> {
      
      const req = { params: { gameId: '123' } };
      

      gameController.verifyGameID(req, res, next);
      
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({Message: 'Game ID does not exist.'});
      

    });

  });
});
