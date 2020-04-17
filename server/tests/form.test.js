const request = require('supertest')
const app = require('../server')

describe('Server V1 Form Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  const loginEndpoint = '/api/v1/login';
  const formEndpoint = '/api/v1/form';
  const searchByNameEndpoint = '/api/v1/last-name';

  const user = {
    username: 'username',
    password: 'password',
  }

  const form = {
    firstName: "John",
    lastName: "Cena",
    telephone: "1234567890",
    email: null,
    address: "1234 Fake St.",
    city: "Victoria",
    province: "Yukon",
    postalCode: "A1A1A1",
    dob: "1999/03/27",
    includeAdditionalTravellers: true,
    additionalTravellers: [
      {
        firstName: "Johnny",
        lastName: "Cena",
        dob: "1999/03/27"
      }
    ],
    arrival: {
      date: "2020/04/13",
      by: "air",
      from: "Wuhan, China",
      flight: null
    },
    accomodations: true,
    isolationPlan: {
      city: "Vctoria",
      address: "1234 Fake St.",
      type: "family"
    },
    supplies: true,
    ableToIsolate: true,
    transportation: [
      "taxi",
      "personal",
      "public"
    ],
    certified: true
  }

  it('Create new form, receive isolationPlanStatus == true', async () => {
    const res = await request.agent(app)
      .post(formEndpoint)
      .send(form);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('isolationPlanStatus', true);
  });

  it('Create new form, receive isolationPlanStatus == false', async () => {
    const res = await request.agent(app)
      .post(formEndpoint)
      .send(Object.assign({}, form, { accomodations: false, isolationPlan: null }));
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('isolationPlanStatus', false);
  });

  it('Create new form using an invalid field, receive 400', async () => {
    const res = await request.agent(app)
      .post(formEndpoint)
      .send(Object.assign({}, form, { email: 'email@test.' }));
    expect(res.statusCode).toEqual(400);
  });

  it('Get existing form, receive 200', async () => {
    let formId;

    const resForm = await request.agent(app)
      .post(formEndpoint)
      .send(form);

    formId = resForm.body.id;

    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` })
      .get(`${formEndpoint}/${formId}`);

    expect(res.statusCode).toEqual(200);
  });

  it('Get existing form by last name, receive 200', async () => {
    let formId;

    const resForm = await request.agent(app)
      .post(formEndpoint)
      .send(form);

    formId = resForm.body.id;

    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` })
      .get(`${searchByNameEndpoint}/${form.lastName}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        travellers: expect.arrayContaining([expect.objectContaining({ lastName: form.lastName })])
      })
    );
  });

  it('Get nonexistent form, receive 404', async () => {
    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` })
      .get(`${formEndpoint}/1`);

    expect(res.statusCode).toEqual(404);
  });

  it('Try to get a form without authorization, receive 401 (Unauthorized)', async () => {
    let formId;

    const resForm = await request.agent(app)
      .post(formEndpoint)
      .send(form);

    formId = resForm.body.id;

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer 1` })
      .get(`${formEndpoint}/${formId}`);

    expect(res.statusCode).toEqual(401);
  });

  it('Edit form, receive 200', async () => {
    let formId;

    const resForm = await request.agent(app)
      .post(formEndpoint)
      .send(form);

    formId = resForm.body.id;

    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` })
      .patch(`${formEndpoint}/${formId}`)
      .send({
        province: 'Ontario',
        determination: 'accepted',
        notes: 'test',
      });

    expect(res.statusCode).toEqual(200);
  });

  it('Edit form missing mandatory attributes, receive 400', async () => {
    let formId;

    const resForm = await request.agent(app)
      .post(formEndpoint)
      .send(form);

    formId = resForm.body.id;

    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    const res = await request.agent(app)
      .set({ 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${resLogin.body.token}` })
      .patch(`${formEndpoint}/${formId}`)
      .send({
        province: 'Ontario'
      });

    expect(res.statusCode).toEqual(400);
  });

  afterAll(() => {
    server.close();
  });
});