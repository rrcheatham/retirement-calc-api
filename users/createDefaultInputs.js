function createDefaultInputs(email) {
    var jsonData = [
        { "age": 0, "income": 0, "savings": 0, "contribution": 10, "retirementAge": 70, "expenses": 0, "username": email}
    ];
    return jsonData;
}

module.exports = {createDefaultInputs};