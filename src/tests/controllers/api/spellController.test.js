const mockingoose = require('mockingoose');
jest.mock('redis', () => {
  const redis = require('redis-mock');
  return redis;
});
const redis = require('redis');
const { mockRequest, mockResponse, mockNext } = require('../../support/requestHelpers');
const { redisClient } = require('../../../util');
const Spell = require('../../../models/spell');
const SpellController = require('../../../controllers/api/spellController');

let response;
beforeEach(() => {
  const client = redis.createClient();
  // TODO: redis-mock does not support redis@4.0.0
  client.flushall();
  mockingoose.resetAll();
  response = mockResponse();
});

afterAll(() => {
  redisClient.quit();
});

describe('index', () => {
  const findDoc = [
    {
      index: 'acid-arrow',
      name: 'Acid Arrow',
      url: '/api/spells/acid-arrow',
    },
    {
      index: 'acid-splash',
      name: 'Acid Splash',
      url: '/api/spells/acid-splash',
    },
    {
      index: 'aid',
      name: 'Aid',
      url: '/api/spells/aid',
    },
  ];
  const request = mockRequest({ query: {} });

  it('returns a list of objects', async () => {
    mockingoose(Spell).toReturn(findDoc, 'find');

    await SpellController.index(request, response, mockNext);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  describe('when something goes wrong', () => {
    it('handles the error', async () => {
      const error = new Error('Something went wrong');
      mockingoose(Spell).toReturn(error, 'find');

      await SpellController.index(request, response, mockNext);

      expect(response.status).not.toHaveBeenCalled();
      expect(response.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

describe('show', () => {
  const findOneDoc = {
    index: 'acid-arrow',
    name: 'Acid Arrow',
    url: '/api/spells/acid-arrow',
  };

  const showParams = { index: 'acid-arrow' };
  const request = mockRequest({ params: showParams });

  it('returns an object', async () => {
    mockingoose(Spell).toReturn(findOneDoc, 'findOne');

    await SpellController.show(request, response, mockNext);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining(showParams));
  });

  describe('when the record does not exist', () => {
    it('404s', async () => {
      mockingoose(Spell).toReturn(null, 'findOne');

      const invalidShowParams = { index: 'abcd' };
      const invalidRequest = mockRequest({ params: invalidShowParams });
      await SpellController.show(invalidRequest, response, mockNext);

      expect(response.status).not.toHaveBeenCalled();
      expect(response.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('when something goes wrong', () => {
    it('is handled', async () => {
      const error = new Error('Something went wrong');
      mockingoose(Spell).toReturn(error, 'findOne');

      await SpellController.show(request, response, mockNext);

      expect(response.status).not.toHaveBeenCalled();
      expect(response.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
