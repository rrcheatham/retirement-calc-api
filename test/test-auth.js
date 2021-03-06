const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth endpoints', function () {
    const password = 'examplePass';
    const email = 'example1@example.com';
    const firstName = 'Example';
    const lastName = 'User';
  
    before(function () {
      return runServer(TEST_DATABASE_URL);
    });
  
    after(function () {
      return closeServer();
    });
  
    beforeEach(function () {
      return User.hashPassword(password).then(password =>
        User.create({
          password,
          email,
          firstName,
          lastName
        })
      );
    });
  
    afterEach(function () {
      return User.remove({});
    });
  
    describe('/api/auth/login', function () {
      it('Should reject requests with no credentials', function () {
        return chai
          .request(app)
          .post('/api/auth/login')
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(400);
          });
      });
      it('Should reject requests with incorrect usernames', function () {
        return chai
          .request(app)
          .post('/api/auth/login')
          .send({ username: 'wrongUsername', password })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(401);
          });
      });
      it('Should reject requests with incorrect passwords', function () {
        return chai
          .request(app)
          .post('/api/auth/login')
          .send({ username: email, password: 'wrongPassword' })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(401);
          });
      });
      it('Should return a valid auth token', function () {
        return chai
          .request(app)
          .post('/api/auth/login')
          .send({ username: email, password })
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            const token = res.body.authToken;
            expect(token).to.be.a('string');
            const payload = jwt.verify(token, JWT_SECRET, {
              algorithm: ['HS256']
            });
            expect(payload.user).to.deep.equal({
              email,
              firstName,
              lastName
            });
          });
      });
    });
  
    describe('/api/auth/refresh', function () {
      it('Should reject requests with no credentials', function () {
        return chai
          .request(app)
          .post('/api/auth/refresh')
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(401);
          });
      });
      it('Should reject requests with an invalid token', function () {
        const token = jwt.sign(
          {
            email,
            firstName,
            lastName
          },
          'wrongSecret',
          {
            algorithm: 'HS256',
            expiresIn: '7d'
          }
        );
  
        return chai
          .request(app)
          .post('/api/auth/refresh')
          .set('Authorization', `Bearer ${token}`)
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(401);
          });
      });
      /* it('Should reject requests with an expired token', function () {
        const token = jwt.sign(
          {
            user: {
              email,
              firstName,
              lastName
            },
            iat: Math.floor(Date.now() / 1000) - 10
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: email
            //iat: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
          }
        );
  
        return chai
          .request(app)
          .post('/api/auth/refresh')
          .set('authorization', `Bearer ${token}`)
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
  
            const res = err.response;
            expect(res).to.have.status(401);
          });
      }); */
      it('Should return a valid auth token with a newer expiry date', function () {
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
        const decoded = jwt.decode(token);
  
        return chai
          .request(app)
          .post('/api/auth/refresh')
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            const token = res.body.authToken;
            expect(token).to.be.a('string');
            const payload = jwt.verify(token, JWT_SECRET, {
              algorithm: ['HS256']
            });
            expect(payload.user).to.deep.equal({
              email,
              firstName,
              lastName
            });
            expect(payload.exp).to.be.at.least(decoded.exp);
          });
      });
    });
  });
  