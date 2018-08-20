const mongoose = require('mongoose');

const inputDataSchema = mongoose.Schema({
    age: {type: Number, required: true},
    income: {type: Number, required: true},
    savings: {type: Number, required: true},
    contribution: {type: Number, required: true},
    retirementAge: {type: Number, required: true},
    expenses: {type: Number, required: true},
    username: {type: String, required: true}
});

inputDataSchema.methods.serialize = function() {
    return {
        id: this._id,
        age: this.age,
        income: this.income,
        savings: this.savings,
        contribution: this.contribution,
        retirementAge: this.retirementAge,
        expenses: this.expenses
    };
};

const InputData = mongoose.model('InputData', inputDataSchema, 'inputs');

module.exports = {InputData};