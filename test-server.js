const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const { InputData } = require('../inputs');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect();

chai.use(chaiHttp);

function seedInputData() {
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push(generateInputData());
  }
  return InputData.insertMany(seedData);
}

function generateInputData() {
  return {
    age: 35,
    income: faker.finance.amount(),
    savings: faker.finance.amount(),
    contribution: 10,
    retirementAge: 70,
    expenses: faker.finance.amount(),
    username: faker.internet.email()
  };
}

function tearDownDb() {
  return mongoose.connection.dropDatabase();
}

describe('Inputs Endpoints', function() {
  const email = 'example2@example.com';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  before(function () {
    return seedInputData();
  });

  after(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        email,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  it('should return list of inputs on GET request', function() {
    const token = jwt.sign(
      {
        user: {
          email,
          firstName,
          lastName
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: email,
        expiresIn: '7d'
      }
    );

    return chai
      .request(app)
      .get('inputs')
      .set('authorization', `Bearer ${token}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.inputs).to.have.lengthOf.at.least(1);
        expect(res.body.inputs).to.have.lengthOf(InputData.count());
      });
  });

  it('should return inputs with right field', function() {
    const token = jwt.sign(
      {
        user: {
          email,
          firstName,
          lastName
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: email,
        expiresIn: '7d'
      }
    );

    return chai
      .request(app)
      .get('inputs')
      .set('authorization', `Bearer ${token}`)
      .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.inputs).to.be.a('array');
          expect(res.body.inputs).to.have.lengthOf.at.least(1);
          res.body.inputs.forEach(function(input) {
              expect(input).to.be.a('object');
              expect(input).to.include.keys(
                  'id', 'age', 'income', 'savings', 'contribution', 'retirementAge', 'expenses', 'username');                        
          });
          resInput = res.body.inputs[0];
          return InputData.findById(resInput.id);
      })
      .then(function(input) {
          expect(resInput.id).to.equal(input.id);
          expect(resInput.title).to.equal(input.title);
          expect(resInput.content).to.equal(input.content);
          expect(resInput.author).to.contain(input.author.firstName);
          expect(resInput.author).to.contain(input.author.lastName);
      });
  });


  it('should add new input on POST', function() {
    const token = jwt.sign(
      {
        user: {
          email,
          firstName,
          lastName
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: email,
        expiresIn: '7d'
      }
    );
    const newInput = generateInputData();

    return chai
        .request(app)
        .post('/blogposts')
        .set('authorization', `Bearer ${token}`)
        .send(newInput)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(
              'id', 'age', 'income', 'savings', 'contribution', 'retirementAge', 'expenses', 'username');
            expect(res.body.id).to.not.be.null;
            expect(res.body.age).to.equal(newInput.title);
            expect(res.body.income).to.equal(newInput.content);
            expect(res.body.savings).to.equal(newInput.savings);
            expect(res.body.contribution).to.equal(newInput.contribution);
            expect(res.body.retirementAge).to.equal(newInput.retirementAge);
            expect(res.body.expenses).to.equal(newInput.expenses);
            expect(res.body.username).to.equal(newInput.username);
            return InputData.findById(res.body.id);
        })
        .then(function(input) {
            expect(input.age).to.equal(newInput.age);
            expect(input.income).to.equal(newInput.income);
            expect(input.savings).to.equal(newInput.savings);
            expect(input.contribution).to.equal(newInput.contribution);
            expect(input.retirementAge).to.equal(newInput.retirementAge);
            expect(input.expenses).to.equal(newInput.expenses);
            expect(input.username).to.equal(newInput.username);
        });
  });

  it('should update input on PUT request', function() {
    const token = jwt.sign(
      {
        user: {
          email,
          firstName,
          lastName
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: email,
        expiresIn: '7d'
      }
    );

    const updateData = {
      age: 42,
      contribution: 15
    };

    return InputData
        .findOne()
        .then(function(input) {
            updateData.id = input.id;
            return chai
                .request(app)
                .put(`/inputs/${input.id}`)
                .set('authorization', `Bearer ${token}`)
                .send(updateData);
        })
        .then(function(res) {
            expect(res).to.have.status(204);
            return InputData.findById(updateData.id);
        })
        .then(function(input) {
            expect(input.age).to.equal(updateData.age);
            expect(input.contribution).to.equal(updateData.contribution);
        });
  });

  it('should delete input on DEL request', function() {
    const token = jwt.sign(
      {
        user: {
          email,
          firstName,
          lastName
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: email,
        expiresIn: '7d'
      }
    );

    let input;
    return InputData
        .findOne()
        .then(function(_input) {
            input = _input;
            return chai.request(app).delete(`/inputs/${input.id}`);
        })
        .then(function(res) {
            expect(res).to.have.status(204);
            return InputData.findById(inputt.id);
        })
        .then(function(_input) {
            expect(_input).to.be.null;
        });
  });

});

