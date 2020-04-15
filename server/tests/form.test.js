const request = require('supertest')
const app = require('../server')

describe('Server V1 Form Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  const formEndpoint = '/api/v1/form';

  it('Create new form, recieve isolationPlanStatus == true', async () => {
    const res = await request.agent(app)
      .post(formEndpoint)
      .send({
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
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('isolationPlanStatus', true);
  });

  afterAll(() => {
    server.close();
  });
});