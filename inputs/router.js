const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

const {InputData} = require('./models');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(bodyParser.json());

router.get('/', jwtAuth, (req, res) => {
    InputData
        .find({email: req.query.email})
        .then(inputs => {
            res.json({
                inputs: inputs.map(
                    (input) => input.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error'});
        });
});

router.get('/:id', jwtAuth, (req, res) => {
    InputData
        .findById(req.params.id)
        .then(input => res.json(input.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error'});
        });
});

router.post('/add', jwtAuth, (req, res) => {
    const requiredFields = ['age', 'income', 'savings', 'contribution', 'retirementAge', 'expenses', 'username'];
    for (let i=0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    InputData
        .create({
            age: req.body.age,
            income: req.body.income,
            savings: req.body.savings,
            contribution: req.body.contribution,
            retirementAge: req.body.retirementAge,
            expenses: req.body.expenses,
            username: req.body.username
        })
        .then(input => res.status(201).json(input.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error'});
        });
});

router.put('/:id', jwtAuth, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json( {message: message});
    }
    const toUpdate = {};
    const updateableFields = ['age', 'income', 'savings', 'contribution', 'retirementAge', 'expenses'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });
    InputData
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .then(expense => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});

router.delete('/:id', jwtAuth, (req, res) => {
    InputData
        .findByIdAndRemove(req.params.id)
        .then(input => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});


module.exports = {router};
