const request = require('superagent')
const { app, server } = require('../server')

describe('Server V1 Endpoints', () => {
  it('Login using username and password, recieve JWT', async () => {
    const res = await request.agent(app)
      .post('/api/v1/login')
      .send({
        username: 'username',
        password: 'password',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  afterAll(() => {
    server.close();
  });
});