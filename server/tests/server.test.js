const request = require('supertest')
const { app, server } = require('../server')

describe('Server V1 Auth Endpoints', () => {

  const loginEndpoint = '/api/v1/login';
  const validateEndpoint = '/api/v1/validate';

  it('Login using username and password, recieve JWT', async () => {
    const res = await request.agent(app)
      .post(loginEndpoint)
      .send({
        username: 'username',
        password: 'password',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Login using wrong password, recieve 401 (Unauthorized)', async () => {
    const res = await request.agent(app)
      .post(loginEndpoint)
      .send({
        username: 'username',
        password: 'pa1ssword',
      });
    expect(res.statusCode).toEqual(401);
  });

  it('Validate JWT, recieve 200', async () => {
    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send({
        username: 'username',
        password: 'password',
      });
    const res = await request.agent(app)
      .get(validateEndpoint)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` });
    expect(res.statusCode).toEqual(200);
  });

  it('Validate wrong JWT, recieve 401', async () => {
    const res = await request.agent(app)
      .get(validateEndpoint)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer 1` });
    expect(res.statusCode).toEqual(401);
  });

  afterAll(() => {
    server.close();
  });
});