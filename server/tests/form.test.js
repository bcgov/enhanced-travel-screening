const request = require('supertest')
const { app, server } = require('../server')

describe('Server V1 Form Endpoints', () => {

  const formEndpoint = '/api/v1/form';

  it('Create new form, recieve 200', async () => {
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
          "date": "2020/04/13",
          "by": "air",
          "from": "Wuhan, China",
          "flight": null
        },

        accommodations: true,
        isolationPlan: {
          "city": "Vctoria",
          "address": "1234 Fake St.",
          "type": "family"
        },
        supplies: true,
        accommodationAssistance: true,
        transportation: [
          "taxi",
          "personal",
          "public"
        ],

        certified: true
      });
    expect(res.statusCode).toEqual(200);
    // expect(res.body).toHaveProperty('id');
  });

  afterAll(() => {
    server.close();
  });
});